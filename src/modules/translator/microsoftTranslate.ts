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

export async function translateWithMicrosoft(
  request: TranslationRequest,
  apiKey: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  try {
    const region = 'global'; // 默认使用 global 区域

    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${request.targetLang}${request.sourceLang !== 'auto' ? `&from=${request.sourceLang}` : ''}`,
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
