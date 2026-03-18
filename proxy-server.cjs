const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// 启用 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// LibreTranslate 代理
app.use('/api/libretranslate', createProxyMiddleware({
  target: 'https://libretranslate.de',
  changeOrigin: true,
  pathRewrite: {
    '^/api/libretranslate': '',
  },
  onProxyReq: (proxyReq, req) => {
    console.log(`[LibreTranslate] ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[LibreTranslate] Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

// Google Translate 代理（需要 API Key）
app.use('/api/google-translate', createProxyMiddleware({
  target: 'https://translation.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/google-translate': '',
  },
  onProxyReq: (proxyReq, req) => {
    console.log(`[Google Translate] ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[Google Translate] Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

// DeepL 代理（需要 API Key）
app.use('/api/deepl', createProxyMiddleware({
  target: 'https://api-free.deepl.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/deepl': '',
  },
  onProxyReq: (proxyReq, req) => {
    console.log(`[DeepL] ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[DeepL] Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - /api/libretranslate/* -> https://libretranslate.de/*');
  console.log('  - /api/google-translate/* -> https://translation.googleapis.com/*');
  console.log('  - /api/deepl/* -> https://api-free.deepl.com/*');
});
