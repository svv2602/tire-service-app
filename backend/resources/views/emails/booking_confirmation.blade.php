<!DOCTYPE html>
<html>
<head>
    <title>Подтверждение записи</title>
</head>
<body>
    <h1>Здравствуйте, {{ $booking->full_name }}!</h1>
    <p>Вы успешно записались на шиномонтаж.</p>
    <p><strong>Дата:</strong> {{ $booking->schedule->date }}</p>
    <p><strong>Время:</strong> {{ $booking->schedule->start_time }} - {{ $booking->schedule->end_time }}</p>
    <p><strong>Номер автомобиля:</strong> {{ $booking->car_number }}</p>
    <p>Спасибо, что выбрали нас!</p>
</body>
</html>