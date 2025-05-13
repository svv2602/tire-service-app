/**
 * Этот скрипт проверяет конфигурацию API на наличие конфликтов с URL
 * и помогает выявить проблемы с двойными префиксами /api
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Файлы, которые нужно проверить на конфликты
const FILES_TO_CHECK = [
  './src/utils/axios.ts',
  './src/utils/directApi.js',
  './src/utils/minimalApiClient.ts',
  './src/services/api.ts',
  './src/services/api.js'
];

// Объявляем цветовые коды для вывода в терминал
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Функция для красивого вывода в консоль
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Проверка конфигурации базовых URL
function checkBaseUrlConfigs() {
  console.log(colorize('Проверка конфигурации базовых URL в файлах...', 'cyan'));
  console.log('===============================================');
  
  const baseUrlConfigs = [];
  let conflicts = false;
  
  FILES_TO_CHECK.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Ищем baseURL в конфигурации axios
        const baseUrlMatches = content.match(/baseURL:\s*['"]([^'"]+)['"]/g);
        if (baseUrlMatches) {
          baseUrlMatches.forEach(match => {
            const url = match.match(/baseURL:\s*['"]([^'"]+)['"]/)[1];
            baseUrlConfigs.push({
              file,
              url,
              hasApiPrefix: url.includes('/api'),
              line: getLineNumber(content, match)
            });
            
            console.log(`${colorize('✓', 'green')} ${file}: baseURL = ${colorize(url, url.includes('/api') ? 'yellow' : 'green')}`);
            
            if (url.includes('/api')) {
              console.log(`  ${colorize('⚠️ Внимание:', 'yellow')} URL содержит префикс /api, возможен конфликт с путями API`);
              conflicts = true;
            }
          });
        } else {
          console.log(`${colorize('ℹ️', 'blue')} ${file}: baseURL не найден`);
        }
      } else {
        console.log(`${colorize('ℹ️', 'blue')} ${file}: файл не существует`);
      }
    } catch (err) {
      console.error(`${colorize('❌', 'red')} Ошибка при чтении ${file}:`, err.message);
    }
  });
  
  return { baseUrlConfigs, conflicts };
}

// Функция для получения номера строки по содержимому
function getLineNumber(content, searchString) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1;
    }
  }
  return -1;
}

// Проверка API вызовов на соответствие конфигурации baseURL
function checkApiCalls() {
  console.log('\n' + colorize('Проверка вызовов API в файлах...', 'cyan'));
  console.log('===============================================');
  
  // Поиск всех .ts и .tsx файлов в проекте
  const tsFiles = glob.sync('./src/**/*.{ts,tsx,js,jsx}', { ignore: ['./node_modules/**', './build/**'] });
  
  // Регулярные выражения для поиска API вызовов
  const apiCallPatterns = [
    /axios\s*\.\s*get\s*\(\s*['"]([^'"]+)['"]/g,
    /axios\s*\.\s*post\s*\(\s*['"]([^'"]+)['"]/g,
    /axios\s*\.\s*put\s*\(\s*['"]([^'"]+)['"]/g,
    /axios\s*\.\s*patch\s*\(\s*['"]([^'"]+)['"]/g,
    /axios\s*\.\s*delete\s*\(\s*['"]([^'"]+)['"]/g,
    /apiClient\s*\.\s*get\s*\(\s*['"]([^'"]+)['"]/g,
    /apiClient\s*\.\s*post\s*\(\s*['"]([^'"]+)['"]/g,
    /apiClient\s*\.\s*put\s*\(\s*['"]([^'"]+)['"]/g,
    /apiClient\s*\.\s*patch\s*\(\s*['"]([^'"]+)['"]/g,
    /apiClient\s*\.\s*delete\s*\(\s*['"]([^'"]+)['"]/g,
    /directApiClient\s*\.\s*get\s*\(\s*['"]([^'"]+)['"]/g,
    /directApiClient\s*\.\s*post\s*\(\s*['"]([^'"]+)['"]/g,
    /directApiClient\s*\.\s*put\s*\(\s*['"]([^'"]+)['"]/g,
    /directApiClient\s*\.\s*patch\s*\(\s*['"]([^'"]+)['"]/g,
    /directApiClient\s*\.\s*delete\s*\(\s*['"]([^'"]+)['"]/g,
    /minimalApiClient\s*\.\s*get\s*\(\s*['"]([^'"]+)['"]/g,
    /minimalApiClient\s*\.\s*post\s*\(\s*['"]([^'"]+)['"]/g,
    /minimalApiClient\s*\.\s*put\s*\(\s*['"]([^'"]+)['"]/g,
    /minimalApiClient\s*\.\s*patch\s*\(\s*['"]([^'"]+)['"]/g,
    /minimalApiClient\s*\.\s*delete\s*\(\s*['"]([^'"]+)['"]/g,
  ];
  
  let apiCalls = [];
  
  // Проверяем каждый файл на наличие API вызовов
  tsFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      apiCallPatterns.forEach(pattern => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const endpoint = match[1];
          const fullMatch = match[0];
          apiCalls.push({
            file,
            endpoint,
            hasApiPrefix: endpoint.startsWith('/api'),
            line: getLineNumber(content, fullMatch)
          });
        }
      });
    } catch (err) {
      console.error(`${colorize('❌', 'red')} Ошибка при чтении ${file}:`, err.message);
    }
  });
  
  // Вывод результатов с группировкой по файлам
  const fileGroups = {};
  apiCalls.forEach(call => {
    if (!fileGroups[call.file]) {
      fileGroups[call.file] = [];
    }
    fileGroups[call.file].push(call);
  });
  
  Object.keys(fileGroups).forEach(file => {
    const calls = fileGroups[file];
    console.log(`\n${colorize('Файл:', 'blue')} ${file}`);
    
    const hasApiPrefixCalls = calls.filter(call => call.hasApiPrefix);
    const noApiPrefixCalls = calls.filter(call => !call.hasApiPrefix);
    
    if (hasApiPrefixCalls.length > 0 && noApiPrefixCalls.length > 0) {
      console.log(`${colorize('⚠️ ВНИМАНИЕ:', 'yellow')} Обнаружены смешанные вызовы API с префиксом /api и без!`);
      console.log(`  С префиксом /api: ${hasApiPrefixCalls.length}, без префикса: ${noApiPrefixCalls.length}`);
    }
    
    calls.forEach(call => {
      const status = call.hasApiPrefix ? 
        colorize('✓', 'green') : 
        colorize('⚠', 'yellow');
      console.log(`  ${status} Строка ${call.line}: ${colorize(call.endpoint, call.hasApiPrefix ? 'green' : 'yellow')}`);
    });
  });
  
  return apiCalls;
}

// Проверка несоответствий между baseURL и вызовами API
function checkInconsistencies(baseUrlConfigs, apiCalls) {
  console.log('\n' + colorize('Проверка несоответствий между baseURL и вызовами API...', 'cyan'));
  console.log('===============================================');
  
  // Находим конфигурации с префиксом /api
  const apiPrefixConfigs = baseUrlConfigs.filter(config => config.hasApiPrefix);
  
  // Находим вызовы API с префиксом /api
  const apiPrefixCalls = apiCalls.filter(call => call.hasApiPrefix);
  
  if (apiPrefixConfigs.length > 0 && apiPrefixCalls.length > 0) {
    console.log(`${colorize('⚠️ КРИТИЧЕСКОЕ НЕСООТВЕТСТВИЕ:', 'red')} Возможна проблема дублирования /api!`);
    console.log(`  1. Найдено ${apiPrefixConfigs.length} конфигураций с baseURL, содержащим /api`);
    console.log(`  2. Найдено ${apiPrefixCalls.length} вызовов API с эндпоинтами, начинающимися с /api`);
    console.log('\nЭто может приводить к ошибкам 500 из-за двойных префиксов /api в запросах!');
    
    console.log('\nРекомендации по исправлению:');
    console.log('1. Измените baseURL в конфигурациях, чтобы удалить /api:');
    apiPrefixConfigs.forEach(config => {
      const newUrl = config.url.replace(/\/api$/, '');
      console.log(`   В файле ${config.file} (строка ${config.line}):`);
      console.log(`   - Было:  baseURL: '${config.url}'`);
      console.log(`   - Стало: baseURL: '${newUrl}'`);
    });
    
    console.log('\nИЛИ');
    
    console.log('2. Измените все вызовы API, чтобы убрать префикс /api:');
    console.log('   Например:');
    console.log(`   - Было:  axios.get('/api/v2/services')`);
    console.log(`   - Стало: axios.get('/v2/services')`);
    
    return true;
  } else {
    console.log(`${colorize('✓ КОНФИГУРАЦИЯ ПРАВИЛЬНАЯ:', 'green')} Несоответствий не обнаружено!`);
    return false;
  }
}

// Основная функция запуска проверок
function runChecks() {
  console.log(colorize('=== ПРОВЕРКА КОНФИГУРАЦИИ API ===', 'magenta'));
  
  // Шаг 1: Проверить конфигурацию baseURL
  const { baseUrlConfigs, conflicts } = checkBaseUrlConfigs();
  
  // Шаг 2: Проверить вызовы API
  const apiCalls = checkApiCalls();
  
  // Шаг 3: Проверить несоответствия
  const hasInconsistencies = checkInconsistencies(baseUrlConfigs, apiCalls);
  
  // Итоговый вывод
  console.log('\n' + colorize('=== ИТОГОВЫЙ РЕЗУЛЬТАТ ===', 'magenta'));
  if (conflicts || hasInconsistencies) {
    console.log(`${colorize('⚠️ ОБНАРУЖЕНЫ ПРОБЛЕМЫ', 'red')} в конфигурации API!`);
    console.log('Рекомендуется внести исправления для предотвращения ошибок 500.');
  } else {
    console.log(`${colorize('✓ ВСЁ ХОРОШО', 'green')} Конфигурация API настроена правильно!`);
  }
}

// Запуск проверок
runChecks();
