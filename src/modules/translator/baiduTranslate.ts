import { TranslationRequest, TranslationResult } from './types';

interface BaiduTranslateResponse {
  from: string;
  to: string;
  trans_result: Array<{
    src: string;
    dst: string;
  }>;
  error_code?: string;
  error_msg?: string;
}

// 百度翻译语言代码映射（ISO 639-1 -> 百度代码）
const BAIDU_LANG_MAP: Record<string, string> = {
  'auto': 'auto',
  'zh': 'zh',
  'zh-TW': 'cht',
  'en': 'en',
  'ja': 'jp',
  'ko': 'kor',
  'fr': 'fra',
  'de': 'de',
  'es': 'spa',
  'ru': 'ru',
  'it': 'it',
  'pt': 'pt',
  'ar': 'ara',
  'th': 'th',
  'vi': 'vie',
};

export async function translateWithBaidu(
  request: TranslationRequest,
  appId: string,
  secretKey: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  try {
    // 生成随机盐值
    const salt = Date.now().toString();
    // 生成签名
    const str = appId + request.text + salt + secretKey;
    const sign = await md5(str);

    const params = new URLSearchParams({
      q: request.text,
      from: BAIDU_LANG_MAP[request.sourceLang] || 'auto',
      to: BAIDU_LANG_MAP[request.targetLang] || 'en',
      appid: appId,
      salt: salt,
      sign: sign,
    });

    const response = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${params.toString()}`, {
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: BaiduTranslateResponse = await response.json();

    if (data.error_code) {
      throw new Error(`[${data.error_code}] ${data.error_msg}`);
    }

    const translatedText = data.trans_result?.map(r => r.dst).join('\n') || '';

    return {
      serviceId: 'baidu',
      serviceName: '百度翻译',
      translatedText,
      detectedLang: data.from !== request.sourceLang ? data.from : undefined,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      serviceId: 'baidu',
      serviceName: '百度翻译',
      translatedText: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}

// MD5 实现
async function md5(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
