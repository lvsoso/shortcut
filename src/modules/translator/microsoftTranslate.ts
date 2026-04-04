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

const MICROSOFT_LANG_MAP: Record<string, string> = {
  auto: 'auto',
  zh: 'zh-Hans',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
  'zh-TW': 'zh-Hant',
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
};

export async function translateWithMicrosoft(
  request: TranslationRequest,
  apiKey: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();
  const sourceLang = request.sourceLang === 'auto' ? 'auto' : MICROSOFT_LANG_MAP[request.sourceLang];
  const targetLang = MICROSOFT_LANG_MAP[request.targetLang];

  if (!targetLang || (request.sourceLang !== 'auto' && !sourceLang)) {
    return {
      serviceId: 'microsoft',
      serviceName: '微软翻译',
      translatedText: '',
      error: '微软翻译暂不支持当前语言组合',
      latency: Date.now() - startTime,
    };
  }

  try {
    const region = 'global'; // 默认使用 global 区域

    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLang}${sourceLang !== 'auto' ? `&from=${sourceLang}` : ''}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text: request.text }]),
        signal: abortSignal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: MicrosoftTranslateResponse[] = await response.json();
    const result = data[0];

    return {
      serviceId: 'microsoft',
      serviceName: '微软翻译',
      translatedText: result.translations[0]?.text || '',
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
