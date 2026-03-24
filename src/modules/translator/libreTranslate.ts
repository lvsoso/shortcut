import { TranslationRequest, TranslationResult } from './types';
import { LIBRETRANSLATE_INSTANCES } from './constants';

interface LibreTranslateResponse {
  translatedText: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
}

// 尝试从多个 LibreTranslate 实例进行翻译
export async function translateWithLibreTranslate(
  request: TranslationRequest,
  _apiUrl?: string,
  _proxy?: unknown,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  const requestBody = JSON.stringify({
    q: request.text,
    source: request.sourceLang === 'auto' ? 'auto' : request.sourceLang,
    target: request.targetLang,
    format: 'text',
  });

  // 依次尝试各个实例
  for (const instance of LIBRETRANSLATE_INSTANCES) {
    try {
      const response = await fetch(`${instance}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBody,
        signal: abortSignal,
      });

      if (!response.ok) {
        continue; // 尝试下一个实例
      }

      const data: LibreTranslateResponse = await response.json();

      return {
        serviceId: 'libretranslate',
        serviceName: 'LibreTranslate',
        translatedText: data.translatedText,
        detectedLang: data.detectedLanguage?.language,
        latency: Date.now() - startTime,
      };
    } catch {
      continue; // 尝试下一个实例
    }
  }

  return {
    serviceId: 'libretranslate',
    serviceName: 'LibreTranslate',
    translatedText: '',
    error: '所有 LibreTranslate 实例都不可用，可能是 CORS 限制，请尝试其他翻译服务',
    latency: Date.now() - startTime,
  };
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
