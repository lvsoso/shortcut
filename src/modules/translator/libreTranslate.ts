import { TranslationRequest, TranslationResult, ProxyConfig } from './types';

const LIBRETRANSLATE_API = 'https://libretranslate.de';

interface LibreTranslateResponse {
  translatedText: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
}

export async function translateWithLibreTranslate(
  request: TranslationRequest,
  apiUrl: string = LIBRETRANSLATE_API,
  _proxy?: ProxyConfig,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${apiUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: request.text,
        source: request.sourceLang === 'auto' ? 'auto' : request.sourceLang,
        target: request.targetLang,
        format: 'text',
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
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
    return {
      serviceId: 'libretranslate',
      serviceName: 'LibreTranslate',
      translatedText: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}

// 获取支持的语言列表
export async function getSupportedLanguages(
  apiUrl: string = LIBRETRANSLATE_API
): Promise<Array<{ code: string; name: string }>> {
  try {
    const response = await fetch(`${apiUrl}/languages`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch supported languages:', error);
    return [];
  }
}
