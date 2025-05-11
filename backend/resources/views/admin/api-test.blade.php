<!DOCTYPE html>
<html>
<head>
    <title>Тестирование API</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { padding: 20px; background-color: #f8f9fa; }
        .endpoint { 
            margin-bottom: 30px; 
            padding: 20px; 
            border: 1px solid #dee2e6;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .response { 
            margin-top: 15px; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 4px; 
            max-height: 400px; 
            overflow: auto;
            font-family: monospace;
        }
        .method-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 12px;
            margin-right: 8px;
            min-width: 60px;
            text-align: center;
            font-weight: bold;
        }
        .get { background-color: #61affe; }
        .post { background-color: #49cc90; }
        .put { background-color: #fca130; }
        .delete { background-color: #f93e3e; }
        .nav-pills .nav-link { color: #6c757d; }
        .nav-pills .nav-link.active { background-color: #0d6efd; }
        .endpoint h3 { 
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        .copy-btn {
            float: right;
            padding: 2px 8px;
            font-size: 12px;
        }
        .loading {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        pre { margin: 0; white-space: pre-wrap; }
        .history-container {
            max-height: 300px;
            overflow-y: auto;
        }
        .history-item {
            cursor: pointer;
            padding: 8px;
            border-bottom: 1px solid #dee2e6;
        }
        .history-item:hover {
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Боковая панель -->
            <div class="col-md-3 col-lg-2 d-md-block bg-white sidebar collapse" style="min-height: 100vh;">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <h5 class="px-3 mb-3">История запросов</h5>
                            <div id="requestHistory" class="history-container">
                                <!-- История запросов будет добавляться здесь -->
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Основной контент -->
            <div class="col-md-9 col-lg-10 ms-sm-auto px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Тестирование API</h1>
                </div>

                <!-- Вкладки для разных групп эндпоинтов -->
                <ul class="nav nav-pills mb-4" id="apiTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="service-points-tab" data-bs-toggle="pill" 
                                data-bs-target="#service-points" type="button">Сервисные точки</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="services-tab" data-bs-toggle="pill" 
                                data-bs-target="#services" type="button">Услуги</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="partners-tab" data-bs-toggle="pill" 
                                data-bs-target="#partners" type="button">Партнеры</button>
                    </li>
                </ul>

                <div class="tab-content" id="apiTabContent">
                    <!-- Сервисные точки -->
                    <div class="tab-pane fade show active" id="service-points">
                        <!-- GET /api/v2/service-points -->
                        <div class="endpoint">
                            <h3>
                                <span class="method-badge get">GET</span>
                                Получить список точек
                            </h3>
                            <form id="indexForm" class="mt-3">
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" id="activeOnly" name="status" value="работает">
                                        <label class="form-check-label" for="activeOnly">Только работающие</label>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary" onclick="sendRequest('index', 'GET', '/api/v2/service-points')">
                                    <i class="fas fa-paper-plane"></i> Отправить
                                </button>
                            </form>
                            <div id="indexResponse" class="response"></div>
                        </div>

                        <!-- POST /api/v2/service-points -->
                        <div class="endpoint">
                            <h3>
                                <span class="method-badge post">POST</span>
                                Создать новую точку
                            </h3>
                            <form id="storeForm" class="mt-3">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Partner ID:</label>
                                        <input type="number" class="form-control" name="partner_id" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Название:</label>
                                        <input type="text" class="form-control" name="name" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Регион:</label>
                                        <input type="text" class="form-control" name="region">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Город:</label>
                                        <input type="text" class="form-control" name="city">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Адрес:</label>
                                    <input type="text" class="form-control" name="address" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Часы работы (JSON):</label>
                                    <div class="input-group">
                                        <textarea class="form-control" name="working_hours" rows="3" required>{"пн":"09:00-18:00","вт":"09:00-18:00","ср":"09:00-18:00","чт":"09:00-18:00","пт":"09:00-18:00","сб":"10:00-16:00","вс":"выходной"}</textarea>
                                        <button class="btn btn-outline-secondary" type="button" onclick="formatJson('working_hours')">
                                            <i class="fas fa-code"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Services (JSON array):</label>
                                    <div class="input-group">
                                        <textarea class="form-control" name="services" rows="2">[1,2,3]</textarea>
                                        <button class="btn btn-outline-secondary" type="button" onclick="formatJson('services')">
                                            <i class="fas fa-code"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-success" onclick="sendRequest('store', 'POST', '/api/v2/service-points')">
                                    <i class="fas fa-plus"></i> Создать
                                </button>
                            </form>
                            <div id="storeResponse" class="response"></div>
                        </div>

                        <!-- GET /api/v2/service-points/{id} -->
                        <div class="endpoint">
                            <h3>
                                <span class="method-badge get">GET</span>
                                Получить точку по ID
                            </h3>
                            <form id="showForm" class="mt-3">
                                <div class="mb-3">
                                    <label class="form-label">ID точки:</label>
                                    <input type="number" class="form-control" name="id" required>
                                </div>
                                <button type="button" class="btn btn-primary" onclick="sendRequest('show', 'GET', `/api/v2/service-points/${document.querySelector('#showForm [name=id]').value}`)">
                                    <i class="fas fa-search"></i> Получить
                                </button>
                            </form>
                            <div id="showResponse" class="response"></div>
                        </div>

                        <!-- PUT /api/v2/service-points/{id} -->
                        <div class="endpoint">
                            <h3>
                                <span class="method-badge put">PUT</span>
                                Обновить точку
                            </h3>
                            <form id="updateForm" class="mt-3">
                                <div class="mb-3">
                                    <label class="form-label">ID точки:</label>
                                    <input type="number" class="form-control" name="id" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Название:</label>
                                    <input type="text" class="form-control" name="name">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Статус:</label>
                                    <select class="form-select" name="status">
                                        <option value="работает">Работает</option>
                                        <option value="приостановлена">Приостановлена</option>
                                        <option value="закрыта">Закрыта</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Services (JSON array):</label>
                                    <div class="input-group">
                                        <textarea class="form-control" name="services" rows="2">[1,2,3]</textarea>
                                        <button class="btn btn-outline-secondary" type="button" onclick="formatJson('services')">
                                            <i class="fas fa-code"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-warning" onclick="sendRequest('update', 'PUT', `/api/v2/service-points/${document.querySelector('#updateForm [name=id]').value}`)">
                                    <i class="fas fa-edit"></i> Обновить
                                </button>
                            </form>
                            <div id="updateResponse" class="response"></div>
                        </div>

                        <!-- DELETE /api/v2/service-points/{id} -->
                        <div class="endpoint">
                            <h3>
                                <span class="method-badge delete">DELETE</span>
                                Удалить точку
                            </h3>
                            <form id="destroyForm" class="mt-3">
                                <div class="mb-3">
                                    <label class="form-label">ID точки:</label>
                                    <input type="number" class="form-control" name="id" required>
                                </div>
                                <button type="button" class="btn btn-danger" onclick="confirmDelete('destroy', `/api/v2/service-points/${document.querySelector('#destroyForm [name=id]').value}`)">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            </form>
                            <div id="destroyResponse" class="response"></div>
                        </div>

                        <!-- GET /api/v2/service-points/filter -->
                        <div class="endpoint">
                            <h3>
                                <span class="method-badge get">GET</span>
                                Фильтрация точек
                            </h3>
                            <form id="filterForm" class="mt-3">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Регион:</label>
                                        <input type="text" class="form-control" name="region">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Город:</label>
                                        <input type="text" class="form-control" name="city">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Partner ID:</label>
                                        <input type="number" class="form-control" name="partner_id">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <div class="form-check mt-4">
                                            <input type="checkbox" class="form-check-input" id="includeInactive" name="include_inactive" value="1">
                                            <label class="form-check-label" for="includeInactive">Включать неактивные</label>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary" onclick="sendRequest('filter', 'GET', '/api/v2/service-points/filter')">
                                    <i class="fas fa-filter"></i> Фильтровать
                                </button>
                            </form>
                            <div id="filterResponse" class="response"></div>
                        </div>
                    </div>

                    <!-- Услуги -->
                    <div class="tab-pane fade" id="services">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i> Раздел находится в разработке
                        </div>
                    </div>

                    <!-- Партнеры -->
                    <div class="tab-pane fade" id="partners">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i> Раздел находится в разработке
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Хранилище истории запросов
        let requestHistory = [];
        
        // Функция для форматирования JSON в текстовых полях
        function formatJson(fieldName) {
            const textarea = document.querySelector(`textarea[name="${fieldName}"]`);
            try {
                const formatted = JSON.stringify(JSON.parse(textarea.value), null, 2);
                textarea.value = formatted;
            } catch (error) {
                alert('Неверный формат JSON');
            }
        }

        // Функция подтверждения удаления
        function confirmDelete(endpoint, url) {
            if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                sendRequest(endpoint, 'DELETE', url);
            }
        }

        // Функция для копирования текста в буфер обмена
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Скопировано в буфер обмена');
            }).catch(err => {
                console.error('Ошибка копирования:', err);
            });
        }

        // Функция добавления запроса в историю
        function addToHistory(method, url, response) {
            const timestamp = new Date().toLocaleTimeString();
            const historyItem = {
                timestamp,
                method,
                url,
                response
            };
            requestHistory.unshift(historyItem);
            if (requestHistory.length > 50) requestHistory.pop();
            updateHistoryDisplay();
        }

        // Функция обновления отображения истории
        function updateHistoryDisplay() {
            const container = document.getElementById('requestHistory');
            container.innerHTML = requestHistory.map((item, index) => `
                <div class="history-item" onclick="showHistoryResponse(${index})">
                    <small class="text-muted">${item.timestamp}</small>
                    <br>
                    <span class="method-badge ${item.method.toLowerCase()}">${item.method}</span>
                    <span>${item.url}</span>
                </div>
            `).join('');
        }

        // Функция отображения ответа из истории
        function showHistoryResponse(index) {
            const item = requestHistory[index];
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response';
            responseDiv.innerHTML = `<pre>${JSON.stringify(item.response, null, 2)}</pre>`;
            
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <span class="method-badge ${item.method.toLowerCase()}">${item.method}</span>
                                ${item.url}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${responseDiv.outerHTML}
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        }

        async function sendRequest(endpoint, method, url) {
            const form = document.querySelector(`#${endpoint}Form`);
            const responseDiv = document.querySelector(`#${endpoint}Response`);
            const submitButton = form.querySelector('button[type="button"]');
            const originalButtonText = submitButton.innerHTML;
            
            try {
                // Показываем индикатор загрузки
                submitButton.disabled = true;
                submitButton.innerHTML = '<div class="loading"></div> Отправка...';
                responseDiv.innerHTML = '<div class="alert alert-info">Загрузка...</div>';
                
                const formData = new FormData(form);
                const options = {
                    method: method,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                // Для GET-запросов формируем строку параметров
                if (method === 'GET') {
                    const params = new URLSearchParams();
                    formData.forEach((value, key) => {
                        if (value) {
                            params.append(key, value);
                        }
                    });
                    if (params.toString()) {
                        url += `?${params.toString()}`;
                    }
                } else if (method !== 'DELETE') {
                    // Для не-GET запросов преобразуем FormData в обычный объект
                    const formDataObj = {};
                    formData.forEach((value, key) => {
                        // Пробуем распарсить JSON для полей, которые должны быть объектами
                        if (key === 'working_hours' || key === 'services') {
                            try {
                                formDataObj[key] = JSON.parse(value);
                            } catch (e) {
                                formDataObj[key] = value;
                            }
                        } else {
                            formDataObj[key] = value;
                        }
                    });
                    options.body = JSON.stringify(formDataObj);
                    options.headers['Content-Type'] = 'application/json';
                }

                const response = await fetch(url, options);
                const data = await response.json();
                
                // Добавляем кнопку копирования
                const copyButton = `<button class="btn btn-sm btn-outline-secondary copy-btn" onclick="copyToClipboard(${JSON.stringify(JSON.stringify(data, null, 2))})">
                    <i class="fas fa-copy"></i> Копировать
                </button>`;
                
                responseDiv.innerHTML = `
                    ${copyButton}
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
                
                // Добавляем в историю
                addToHistory(method, url, data);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                responseDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i> Ошибка: ${error.message}
                    </div>
                `;
            } finally {
                // Возвращаем кнопку в исходное состояние
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }

        // Инициализация подсказок Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });
    </script>
</body>
</html>