const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// LibreTranslate 备用实例列表
const LIBRETRANSLATE_INSTANCES = [
  'https://libretranslate.de',
  'https://translate.argosopentech.com',
  'https://libretranslate.pussthecat.org',
  'https://translate.terraprint.co',
];

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

// 直接转发翻译请求到可用的 LibreTranslate 实例
app.post('/api/libretranslate/translate', async (req, res) => {
  console.log('[LibreTranslate] POST /translate');

  const requestBody = JSON.stringify(req.body);

  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      const result = await new Promise((resolve, reject) => {
        const request = https.request(
          `${instance}/translate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 10000,
          },
          (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => {
              if (response.statusCode >= 200 && response.statusCode < 300) {
                resolve({ success: true, data, status: response.statusCode });
              } else {
                reject(new Error(`HTTP ${response.statusCode}: ${data}`));
              }
            });
          }
        );

        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('Timeout'));
        });

        request.write(requestBody);
        request.end();
      });

      console.log(`[LibreTranslate] Success using ${instance}`);
      res.status(result.status).send(result.data);
      return;
    } catch (err) {
      console.log(`[LibreTranslate] Failed ${instance}: ${err.message}`);
      continue;
    }
  }

  res.status(503).json({
    error: 'All LibreTranslate instances failed',
    message: 'Please try again later or configure a custom API URL in settings'
  });
});

// LibreTranslate 语言列表代理
app.get('/api/libretranslate/languages', async (req, res) => {
  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      const response = await fetch(`${instance}/languages`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (err) {
      continue;
    }
  }
  res.status(503).json({ error: 'Service unavailable' });
});

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
  console.log('  - /api/libretranslate/* -> LibreTranslate instances (with fallback)');
  console.log('  - /api/google-translate/* -> https://translation.googleapis.com/*');
  console.log('  - /api/deepl/* -> https://api-free.deepl.com/*');
});
