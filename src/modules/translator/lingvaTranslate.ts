import { LINGVA_INSTANCES } from './constants';
import { TranslationRequest, TranslationResult } from './types';

interface LingvaResponse {
  translation?: string;
  error?: string;
  info?: {
    detectedSource?: string;
  };
}

const LINGVA_LANGUAGE_MAP: Record<string, string> = {
  auto: 'auto',
  zh: 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh-TW': 'zh-TW',
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
  th: 'th',
  vi: 'vi',
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

function mapLingvaLanguage(languageCode: string): string | null {
  return LINGVA_LANGUAGE_MAP[languageCode] || null;
}

export async function translateWithLingva(
  request: TranslationRequest,
  instanceUrl?: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();
  const sourceLang = mapLingvaLanguage(request.sourceLang);
  const targetLang = mapLingvaLanguage(request.targetLang);

  if (!sourceLang || !targetLang) {
    return {
      serviceId: 'lingva',
      serviceName: 'Lingva',
      translatedText: '',
      error: 'Lingva 暂不支持当前语言组合',
      latency: Date.now() - startTime,
    };
  }

  const customInstanceUrl = normalizeInstanceUrl(instanceUrl);

  if (instanceUrl && !customInstanceUrl) {
    return {
      serviceId: 'lingva',
      serviceName: 'Lingva',
      translatedText: '',
      error: 'Lingva 实例地址无效，请在设置中检查',
      latency: Date.now() - startTime,
    };
  }

  const resolvedInstanceUrl = customInstanceUrl || normalizeInstanceUrl(LINGVA_INSTANCES[0]);

  if (!resolvedInstanceUrl) {
    return {
      serviceId: 'lingva',
      serviceName: 'Lingva',
      translatedText: '',
      error: 'Lingva 实例地址无效，请在设置中检查',
      latency: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch(
      `${resolvedInstanceUrl}/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(request.text)}`,
      {
        headers: {
          Accept: 'application/json',
        },
        signal: abortSignal,
      }
    );
    const data: LingvaResponse = await response.json();

    if (!response.ok || data.error || !data.translation) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return {
      serviceId: 'lingva',
      serviceName: 'Lingva',
      translatedText: data.translation,
      detectedLang: data.info?.detectedSource,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      serviceId: 'lingva',
      serviceName: 'Lingva',
      translatedText: '',
      error: error instanceof Error && error.name === 'AbortError'
        ? '请求已取消'
        : '当前 Lingva 实例不可用，可在设置中切换实例地址',
      latency: Date.now() - startTime,
    };
  }
}
