import { LIBRETRANSLATE_INSTANCES } from './constants';
import { TranslationRequest, TranslationResult } from './types';

interface LibreTranslateResponse {
  translatedText: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
}

const LIBRETRANSLATE_LANGUAGE_MAP: Record<string, string> = {
  auto: 'auto',
  zh: 'zh',
  'zh-Hans': 'zh',
  'zh-Hant': 'zh',
  'zh-TW': 'zh',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  fr: 'fr',
  de: 'de',
  es: 'es',
  ru: 'ru',
  it: 'it',
  pt: 'pt',
  ar: 'ar',
  tr: 'tr',
};

function normalizeInstanceUrl(instanceUrl?: string): string | null {
  const trimmedUrl = instanceUrl?.trim();

  if (!trimmedUrl) {
    return null;
  }

  try {
    const url = new URL(trimmedUrl);
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export async function translateWithLibreTranslate(
  request: TranslationRequest,
  instanceUrl?: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();
  const sourceLang = LIBRETRANSLATE_LANGUAGE_MAP[request.sourceLang];
  const targetLang = LIBRETRANSLATE_LANGUAGE_MAP[request.targetLang];

  if (!sourceLang || !targetLang) {
    return {
      serviceId: 'libretranslate',
      serviceName: 'LibreTranslate',
      translatedText: '',
      error: 'LibreTranslate 暂不支持当前语言组合',
      latency: Date.now() - startTime,
    };
  }

  const requestBody = JSON.stringify({
    q: request.text,
    source: sourceLang,
    target: targetLang,
    format: 'text',
  });
  const customInstanceUrl = normalizeInstanceUrl(instanceUrl);

  if (instanceUrl && !customInstanceUrl) {
    return {
      serviceId: 'libretranslate',
      serviceName: 'LibreTranslate',
      translatedText: '',
      error: 'LibreTranslate 实例地址无效，请在设置中检查',
      latency: Date.now() - startTime,
    };
  }

  const resolvedInstanceUrl = customInstanceUrl || LIBRETRANSLATE_INSTANCES[0];

  try {
    const response = await fetch(`${resolvedInstanceUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: requestBody,
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: LibreTranslateResponse = await response.json();

    return {
      serviceId: 'libretranslate',
      serviceName: 'LibreTranslate',
      translatedText: data.translatedText,
      detectedLang: data.detectedLanguage?.language,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        serviceId: 'libretranslate',
        serviceName: 'LibreTranslate',
        translatedText: '',
        error: '请求已取消',
        latency: Date.now() - startTime,
      };
    }

    return {
      serviceId: 'libretranslate',
      serviceName: 'LibreTranslate',
      translatedText: '',
      error: '当前 LibreTranslate 实例不可用或受限，可在设置中切换实例地址',
      latency: Date.now() - startTime,
    };
  }
}

// 获取支持的语言列表
export async function getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      const response = await fetch(`${instance}/languages`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      continue;
    }
  }
  return [];
}
