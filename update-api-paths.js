const fs = require('fs');
const path = require('path');

// Путь к файлу apiEndpoints.ts
const apiEndpointsFile = path.join(__dirname, 'src', 'data', 'apiEndpoints.ts');

// Чтение содержимого файла
let content = fs.readFileSync(apiEndpointsFile, 'utf8');

// Замена всех путей /api/v2/ на /v2/ и /api/ на /
content = content.replace(/path: '\/api\/v2\//g, "path: '/v2/");
content = content.replace(/path: '\/api\//g, "path: '/");

// Запись обновленного содержимого обратно в файл
fs.writeFileSync(apiEndpointsFile, content, 'utf8');

console.log('Пути API успешно обновлены в файле apiEndpoints.ts');
