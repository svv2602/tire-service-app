<!DOCTYPE html>
<html>
<head>
    <title>Добро пожаловать в систему</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
        }
        .content {
            padding: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Добро пожаловать в систему «Твоя шина»</h1>
        </div>
        <div class="content">
            <p>Здравствуйте!</p>
            <p>Вы успешно зарегистрированы в системе управления шиномонтажными услугами.</p>
            <p>Ваши учетные данные для входа:</p>
            <ul>
                <li>Email: {{ $email }}</li>
                <li>Временный пароль: {{ $password }}</li>
            </ul>
            <p>Пожалуйста, измените временный пароль после первого входа в систему.</p>
            <p>Если у вас возникнут вопросы, обратитесь в службу поддержки.</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Твоя шина. Все права защищены.</p>
        </div>
    </div>
</body>
</html> 