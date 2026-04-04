import { TranslationRequest, TranslationResult } from './types';

interface YoudaoTranslateResponse {
  translation?: string[];
  errorCode?: string;
  errorMsg?: string;
  l?: string;
}

// 有道翻译语言代码映射
const YOUDAO_LANG_MAP: Record<string, string> = {
  'auto': 'auto',
  'zh': 'zh-CHS',
  'zh-Hans': 'zh-CHS',
  'zh-Hant': 'zh-CHT',
  'zh-TW': 'zh-CHT',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko',
  'fr': 'fr',
  'de': 'de',
  'es': 'es',
  'ru': 'ru',
  'it': 'it',
  'pt': 'pt',
  'ar': 'ar',
  'th': 'th',
  'vi': 'vi',
};

export async function translateWithYoudao(
  request: TranslationRequest,
  appId: string,
  secretKey: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();
  const sourceLang = YOUDAO_LANG_MAP[request.sourceLang];
  const targetLang = YOUDAO_LANG_MAP[request.targetLang];

  if (!sourceLang || !targetLang) {
    return {
      serviceId: 'youdao',
      serviceName: '有道翻译',
      translatedText: '',
      error: '有道翻译暂不支持当前语言组合',
      latency: Date.now() - startTime,
    };
  }

  try {
    // 生成随机盐值
    const salt = Date.now().toString();
    // 当前时间戳（秒）
    const curtime = Math.floor(Date.now() / 1000).toString();
    // 签名
    const sign = await calculateSign(appId, request.text, salt, curtime, secretKey);

    const params = new URLSearchParams({
      q: request.text,
      from: sourceLang,
      to: targetLang,
      appKey: appId,
      salt: salt,
      sign: sign,
      signType: 'v3',
      curtime: curtime,
    });

    const response = await fetch(`https://openapi.youdao.com/api?${params.toString()}`, {
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: YoudaoTranslateResponse = await response.json();

    if (data.errorCode && data.errorCode !== '0') {
      throw new Error(`[${data.errorCode}] ${data.errorMsg || '翻译失败'}`);
    }

    const translatedText = data.translation?.join('\n') || '';

    return {
      serviceId: 'youdao',
      serviceName: '有道翻译',
      translatedText,
      detectedLang: data.l?.split('2')[0],
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      serviceId: 'youdao',
      serviceName: '有道翻译',
      translatedText: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}

// 计算签名
async function calculateSign(
  appId: string,
  query: string,
  salt: string,
  curtime: string,
  secretKey: string
): Promise<string> {
  // 截断输入
  const input = query.length <= 20 ? query : query.substring(0, 10) + query.length + query.substring(query.length - 10);
  // sha256(appId + input + salt + curtime + secretKey)
  const str = appId + input + salt + curtime + secretKey;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
