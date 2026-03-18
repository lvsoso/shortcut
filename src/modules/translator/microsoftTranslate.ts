import { TranslationRequest, TranslationResult } from './types';

interface MicrosoftTranslateResponse {
  translations: Array<{
    text: string;
    to: string;
  }>;
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

// 微软翻译语言代码映射
const MICROSOFT_LANG_MAP: Record<string, string> = {
  'auto': 'auto-detect',
  'zh': 'zh-Hans',
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

export async function translateWithMicrosoft(
  request: TranslationRequest,
  subscriptionKey: string,
  region: string = 'global',
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  try {
    const targetLang = MICROSOFT_LANG_MAP[request.targetLang] || request.targetLang;
    const url = new URL('/api/microsoft/translate');
    url.searchParams.append('api-version', '3.0');
    url.searchParams.append('to', targetLang);

    if (request.sourceLang !== 'auto') {
      const sourceLang = MICROSOFT_LANG_MAP[request.sourceLang] || request.sourceLang;
      url.searchParams.append('from', sourceLang);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Ocp-Apim-Subscription-Region': region,
      },
      body: JSON.stringify([{ text: request.text }]),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: MicrosoftTranslateResponse[] = await response.json();
    const result = data[0];

    return {
      serviceId: 'microsoft',
      serviceName: '微软翻译',
      translatedText: result.translations.map(t => t.text).join('\n'),
      detectedLang: result.detectedLanguage?.language,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      serviceId: 'microsoft',
      serviceName: '微软翻译',
      translatedText: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}
