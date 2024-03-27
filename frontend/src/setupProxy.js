const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/api', {
      target: 'https://61.245.248.172:8080/',
      changeOrigin: true,
    }),
  );
};