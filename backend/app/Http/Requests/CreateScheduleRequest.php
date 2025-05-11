<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateScheduleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'post_number' => 'required|integer|min:1',
            'slot_duration' => 'required|integer|min:10|max:180',
            'date' => 'required|date|after_or_equal:today',
        ];
    }

    public function messages()
    {
        return [
            'post_number.required' => 'Необходимо указать номер поста',
            'post_number.min' => 'Номер поста должен быть положительным числом',
            'slot_duration.required' => 'Необходимо указать длительность слота',
            'slot_duration.min' => 'Минимальная длительность слота 10 минут',
            'slot_duration.max' => 'Максимальная длительность слота 180 минут',
            'date.required' => 'Необходимо указать дату',
            'date.after_or_equal' => 'Дата должна быть не раньше сегодняшней'
        ];
    }
} 