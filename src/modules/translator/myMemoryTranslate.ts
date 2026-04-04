import { TranslationRequest, TranslationResult } from './types';

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
  matches?: Array<{
    translation: string;
    match: number;
  }>;
}

// MyMemory 语言代码映射
const MYMEMORY_LANG_MAP: Record<string, string> = {
  'auto': 'Autodetect',
  'zh': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh-TW': 'zh-TW',
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
  'tr': 'tr',
};

export async function translateWithMyMemory(
  request: TranslationRequest,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  try {
    const sourceLang = MYMEMORY_LANG_MAP[request.sourceLang] || 'Autodetect';
    const targetLang = MYMEMORY_LANG_MAP[request.targetLang] || 'en';
    const langpair = `${sourceLang}|${targetLang}`;

    // 对文本进行编码
    const encodedText = encodeURIComponent(request.text);

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langpair}`,
      {
        signal: abortSignal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: MyMemoryResponse = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || `Error ${data.responseStatus}`);
    }

    return {
      serviceId: 'mymemory',
      serviceName: 'MyMemory',
      translatedText: data.responseData.translatedText,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      serviceId: 'mymemory',
      serviceName: 'MyMemory',
      translatedText: '',
      error: error instanceof Error && error.name === 'AbortError'
        ? '请求已取消'
        : 'MyMemory 请求失败或额度受限，请稍后重试',
      latency: Date.now() - startTime,
    };
  }
}
