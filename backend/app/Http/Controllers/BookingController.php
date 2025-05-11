<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\EmailNotificationService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function __construct(private ?EmailNotificationService $emailNotificationService = null) {}

    public function index()
    {
        try {
            $bookings = DB::table('bookings')->get();
            return response()->json([
                'status' => 'success',
                'count' => count($bookings),
                'bookings' => $bookings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching bookings: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении бронирований',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'client_id' => 'required|exists:users,id',
            'full_name' => 'required|string',
            'phone' => 'required|string',
            'car_number' => 'required|string',
        ]);

        $booking = Booking::create($validated);

        $client = User::find($validated['client_id']);
        $email = $request->input('email', $client->email);

        if (!$email) {
            return response()->json(['error' => 'Email клиента не указан.'], 422);
        }

        if (empty($client->email)) {
            return response()->json(['error' => 'Email отсутствует у клиента с ID ' . $validated['client_id']], 422);
        }

        $this->emailNotificationService->sendEmail(
            $email,
            'Подтверждение записи',
            'emails.booking_confirmation',
            ['booking' => $booking]
        );

        // Отправка push-уведомления партнеру
        $partnerTokens = [];
        if ($booking->schedule && $booking->schedule->post && $booking->schedule->post->servicePoint && $booking->schedule->post->servicePoint->partner) {
            $partner = $booking->schedule->post->servicePoint->partner;
            $partnerTokens = method_exists($partner, 'tokens') ? $partner->tokens() : (property_exists($partner, 'tokens') ? $partner->tokens : []);
        }
        app(NotificationService::class)->sendPushNotification(
            $partnerTokens,
            'Новая запись',
            'У вас новая запись на ' . ($booking->schedule->date ?? '') . ' в ' . ($booking->schedule->start_time ?? ''),
            ['booking_id' => $booking->id]
        );

        // Отправка push-уведомления клиенту о подтверждении записи
        $clientTokens = method_exists($client, 'tokens') ? $client->tokens() : (property_exists($client, 'tokens') ? $client->tokens : []);
        app(NotificationService::class)->sendPushNotification(
            $clientTokens,
            'Подтверждение записи',
            'Ваша запись подтверждена на ' . ($booking->schedule->date ?? '') . ' в ' . ($booking->schedule->start_time ?? ''),
            ['booking_id' => $booking->id]
        );

        return $booking;
    }

    public function show(Booking $booking)
    {
        return $booking;
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'schedule_id' => 'exists:schedules,id',
            'client_id' => 'exists:users,id',
            'full_name' => 'string',
            'phone' => 'string',
            'car_number' => 'string',
        ]);

        $booking->update($validated);

        return $booking;
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return response()->noContent();
    }

    public function sendReminders()
    {
        $bookings = Booking::where('schedule.date', '=', now()->addDay()->toDateString())
            ->with(['schedule', 'client'])
            ->get();

        foreach ($bookings as $booking) {
            $clientTokens = $booking->client->tokens; // Предполагается, что у клиента есть токены устройств
            app(NotificationService::class)->sendPushNotification(
                $clientTokens,
                'Напоминание о записи',
                'Напоминаем, что вы записаны на ' . $booking->schedule->date . ' в ' . $booking->schedule->start_time,
                ['booking_id' => $booking->id]
            );
        }

        return response()->json(['message' => 'Напоминания отправлены']);
    }
}
