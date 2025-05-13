const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Настройка прокси с подробным логированием
const proxy = createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log('❯ Request headers:', req.headers);
    console.log(`❯ Proxying ${req.method} ${req.url} → http://127.0.0.1:8000${req.url}`);
    
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log('❯ Authorization header forwarded');
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`❮ Response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    console.log('❮ Response headers:', proxyRes.headers);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err);
    res.writeHead(502, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      error: 'Debug Proxy Error',
      message: err.message,
      code: err.code
    }));
  }
});

// Применяем прокси к путям /api
app.use('/api', proxy);

// Запуск отдельного сервера для отладки
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Отладочный прокси сервер запущен на порту ${PORT}`);
  console.log(`Проксирование запросов на http://127.0.0.1:8000`);
  console.log(`Тест: http://localhost:${PORT}/api/partners`);
});
