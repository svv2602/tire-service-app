<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\EmailNotificationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class PartnerController extends Controller
{
    protected $emailService;

    public function __construct(EmailNotificationService $emailService)
    {
        $this->emailService = $emailService;
    }

    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Partner::with('user')->get()
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|unique:users,email',
                'company_name' => 'required|string|max:255|unique:partners,company_name',
                'contact_person' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'status' => 'required|in:active,inactive',
            ]);

            $temporaryPassword = Str::random(8);

            $user = User::create([
                'name' => $validated['contact_person'],
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
                'role' => 'partner',
            ]);

            $validated['user_id'] = $user->id;
            $partner = Partner::create($validated);

            $this->emailService->sendEmail(
                $user->email,
                'Добро пожаловать в систему',
                'emails.partner_welcome',
                ['password' => $temporaryPassword]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Партнер успешно создан',
                'data' => $partner
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Произошла ошибка при создании партнера'
            ], 500);
        }
    }

    public function show(Partner $partner)
    {
        return response()->json([
            'status' => 'success',
            'data' => $partner->load('user', 'servicePoints')
        ]);
    }

    public function update(Request $request, Partner $partner)
    {
        try {
            $validated = $request->validate([
                'company_name' => 'sometimes|string|max:255|unique:partners,company_name,' . $partner->id,
                'contact_person' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'status' => 'sometimes|in:active,inactive',
            ]);

            $partner->update($validated);

            if ($request->has('contact_person')) {
                $partner->user->update(['name' => $validated['contact_person']]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Данные партнера обновлены',
                'data' => $partner->fresh()
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Произошла ошибка при обновлении данных партнера'
            ], 500);
        }
    }

    public function destroy(Partner $partner)
    {
        try {
            // Получаем партнёра с withInactive, чтобы можно было менять статус
            $partner = \App\Models\Partner::withTrashed()->find($partner->id);
            if (!$partner || !$partner->exists) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Партнер не найден'
                ], 404);
            }
            // Get service points for this partner
            $servicePoints = $partner->servicePoints()->get();
            $servicePointCount = $servicePoints->count();
            if ($servicePointCount > 0) {
                $servicePointIds = $servicePoints->pluck('id')->toArray();
                // Проверяем наличие ЛЮБЫХ бронирований по этим точкам
                $bookingsExist = DB::table('bookings')
                    ->join('schedules', 'bookings.schedule_id', '=', 'schedules.id')
                    ->join('service_points', 'schedules.service_point_id', '=', 'service_points.id')
                    ->whereIn('service_points.id', $servicePointIds)
                    ->exists();
                if ($bookingsExist) {
                    DB::beginTransaction();
                    // Деактивируем партнёра
                    $partner->status = 'inactive';
                    $partner->save();
                    // Деактивируем все точки
                    \App\Models\ServicePoint::whereIn('id', $servicePointIds)->update(['is_active' => false]);
                    DB::commit();
                    // Повторная выборка
                    $updatedPartner = $partner->fresh();
                    $updatedPoints = \App\Models\ServicePoint::whereIn('id', $servicePointIds)->get();
                    \Log::info('Partner and points deactivated', [
                        'partner_id' => $updatedPartner->id,
                        'partner_status' => $updatedPartner->status,
                        'points' => $updatedPoints->pluck('id'),
                        'inactive_count' => $updatedPoints->where('is_active', false)->count()
                    ]);
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Удаление запрещено: есть бронирования. Партнёр и все его точки деактивированы.',
                        'partner' => $updatedPartner,
                        'service_points' => $updatedPoints
                    ], 403);
                }
                // Delete related service points
                DB::table('service_points')->whereIn('id', $servicePointIds)->delete();
                \Illuminate\Support\Facades\Log::info('Deleted service points for partner', [
                    'partner_id' => $partner->id,
                    'service_point_count' => $servicePointCount
                ]);
            }
            // Удаляем сначала пользователя, связанного с партнером
            if ($partner->user) {
                $partner->user->delete();
            }
            // Затем удаляем партнера
            $partner->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Партнер успешно удален',
                'deleted_service_points_count' => $servicePointCount
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Error deleting partner', [
                'partner_id' => $partner->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Произошла ошибка при удалении партнера: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deactivate(Partner $partner)
    {
        // Получаем партнёра с withInactive, чтобы можно было менять статус
        $partner = \App\Models\Partner::withTrashed()->find($partner->id);
        $partner->update(['status' => 'inactive']);
        return response()->json([
            'status' => 'success',
            'message' => 'Партнер деактивирован',
            'data' => $partner
        ]);
    }
}