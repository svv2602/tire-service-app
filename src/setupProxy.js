const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      // Increase timeouts to prevent 504 errors
      proxyTimeout: 120000, // Увеличиваем до 120 секунд
      timeout: 120000,     // Добавляем общий таймаут
      onProxyReq: (proxyReq, req, res) => {
        // Log request for debugging
        console.log(`Proxying ${req.method} request to: ${req.path}`);
        
        // Make sure we preserve authorization headers when proxying
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        
        // Remove excessive headers
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-forwarded-proto');
        proxyReq.removeHeader('x-forwarded-host');
        
        // Add minimal CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
      },
      // Добавляем обработчик ошибок для дополнительного логирования
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        console.error(`Failed request: ${req.method} ${req.path}`);
        
        // Отправляем более информативный ответ клиенту
        res.writeHead(502, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          error: 'API Proxy Error',
          message: err.message || 'Could not connect to backend API',
          details: err.code || 'Unknown error'
        }));
      }
    })
  );
};