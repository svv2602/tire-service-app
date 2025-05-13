/**
 * API Path Fixer - исправляет конфигурацию API для работы с тестером API
 */

const fs = require('fs');
const path = require('path');

// Файлы, которые нужно проверить
const configFiles = [
  { path: 'src/utils/axios.ts', type: 'baseConfig' },
  { path: 'src/utils/directApi.js', type: 'baseConfig' },
  { path: 'src/utils/minimalApiClient.ts', type: 'baseConfig' },
  { path: 'src/services/api.ts', type: 'apiService' }
];

// Текущее рабочее состояние
const state = {
  baseUrl: null,
  includesApiPrefix: false
};

function fixBaseConfigs(filePath, content) {
  console.log(`Проверка файла конфигурации API: ${filePath}`);
  
  // Извлекаем текущий baseURL
  const baseUrlMatch = content.match(/baseURL:\s*['"]([^'"]+)['"]/);
  if (baseUrlMatch) {
    const baseUrl = baseUrlMatch[1];
    console.log(`Обнаружен baseURL: ${baseUrl}`);
    
    // Определяем, содержит ли baseURL префикс /api
    const hasApiPrefix = baseUrl.endsWith('/api');
    state.includesApiPrefix = hasApiPrefix;
    state.baseUrl = baseUrl;
    
    // Убедимся, что baseURL не содержит префикс /api, чтобы работать с тестером API
    if (hasApiPrefix) {
      console.log('URL содержит префикс /api, удаляем для совместимости с тестером API');
      const newBaseUrl = baseUrl.replace(/\/api$/, '');
      const newContent = content.replace(baseUrlMatch[0], `baseURL: '${newBaseUrl}'`);
      return { modified: true, content: newContent };
    } else {
      console.log('URL уже не содержит префикс /api, ничего не меняем');
      return { modified: false, content };
    }
  } else {
    console.log('⚠️ Не удалось найти baseURL в файле');
    return { modified: false, content };
  }
}

function fixApiServiceFile(filePath, content) {
  console.log(`Проверка файла сервиса API: ${filePath}`);
  
  // Если baseURL был изменен (убрали /api), нужно добавить префикс /api к путям в api.ts
  if (state.baseUrl && !state.includesApiPrefix) {
    console.log('baseURL не содержит /api, добавляем префикс /api к путям');
    
    // Заменяем пути без префикса /api на пути с префиксом
    const newContent = content
      .replace(/axios\.get\(['"]\/v2\//g, 'axios.get(\'/api/v2/')
      .replace(/axios\.post\(['"]\/v2\//g, 'axios.post(\'/api/v2/')
      .replace(/axios\.put\(['"]\/v2\//g, 'axios.put(\'/api/v2/')
      .replace(/axios\.patch\(['"]\/v2\//g, 'axios.patch(\'/api/v2/')
      .replace(/axios\.delete\(['"]\/v2\//g, 'axios.delete(\'/api/v2/')
      .replace(/axios\.get\(['"]\/service-points/g, 'axios.get(\'/api/service-points')
      .replace(/axios\.post\(['"]\/service-points/g, 'axios.post(\'/api/service-points')
      .replace(/axios\.put\(['"]\/service-points/g, 'axios.put(\'/api/service-points')
      .replace(/axios\.patch\(['"]\/service-points/g, 'axios.patch(\'/api/service-points')
      .replace(/axios\.delete\(['"]\/service-points/g, 'axios.delete(\'/api/service-points')
      .replace(/axios\.get\(['"]\/bookings/g, 'axios.get(\'/api/bookings')
      .replace(/axios\.post\(['"]\/bookings/g, 'axios.post(\'/api/bookings')
      .replace(/axios\.put\(['"]\/bookings/g, 'axios.put(\'/api/bookings')
      .replace(/axios\.patch\(['"]\/bookings/g, 'axios.patch(\'/api/bookings')
      .replace(/axios\.delete\(['"]\/bookings/g, 'axios.delete(\'/api/bookings')
      .replace(/axios\.get\(['"]\/services/g, 'axios.get(\'/api/services')
      .replace(/axios\.post\(['"]\/services/g, 'axios.post(\'/api/services')
      .replace(/axios\.put\(['"]\/services/g, 'axios.put(\'/api/services')
      .replace(/axios\.patch\(['"]\/services/g, 'axios.patch(\'/api/services')
      .replace(/axios\.delete\(['"]\/services/g, 'axios.delete(\'/api/services')
      .replace(/axios\.get\(['"]\/appointments/g, 'axios.get(\'/api/appointments')
      .replace(/axios\.post\(['"]\/appointments/g, 'axios.post(\'/api/appointments');
    
    return { modified: content !== newContent, content: newContent };
  } else {
    console.log('baseURL содержит /api или неизвестен, ничего не меняем');
    return { modified: false, content };
  }
}

// Функция для обработки файла
function processFile(filePath, type) {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      let result;
      if (type === 'baseConfig') {
        result = fixBaseConfigs(filePath, content);
      } else if (type === 'apiService') {
        result = fixApiServiceFile(filePath, content);
      }
      
      if (result && result.modified) {
        console.log(`Обновление файла: ${filePath}`);
        fs.writeFileSync(fullPath, result.content, 'utf8');
        console.log(`✅ Файл успешно обновлен: ${filePath}`);
        return true;
      } else {
        console.log(`ℹ️ Файл не требует изменений: ${filePath}`);
        return false;
      }
    } else {
      console.log(`⚠️ Файл не найден: ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Ошибка при обработке файла ${filePath}:`, err);
    return false;
  }
}

// Основная функция для запуска исправлений
function runFixes() {
  console.log('Запуск автоматического исправления путей API...\n');
  
  let changedCount = 0;
  
  // Сначала обработаем файлы конфигурации, чтобы определить состояние
  configFiles
    .filter(file => file.type === 'baseConfig')
    .forEach(file => {
      const changed = processFile(file.path, file.type);
      if (changed) changedCount++;
    });
  
  // Затем обработаем файлы сервисов API
  configFiles
    .filter(file => file.type === 'apiService')
    .forEach(file => {
      const changed = processFile(file.path, file.type);
      if (changed) changedCount++;
    });
  
  console.log(`\nГотово! Изменено файлов: ${changedCount} из ${configFiles.length}`);
  
  if (changedCount > 0) {
    console.log('\nПроверьте работу API с помощью скрипта api-paths-checker.js');
    console.log('Команда: node api-paths-checker.js');
  }
}

// Запуск исправлений
runFixes();
