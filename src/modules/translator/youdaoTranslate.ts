import { TranslationRequest, TranslationResult } from './types';

interface YoudaoTranslateResponse {
  errorCode: string;
  query: string;
  translation?: string[];
  basic?: {
    phonetic?: string;
    explains?: string[];
  };
  web?: Array<{
    key: string;
    value: string[];
  }>;
  l: string;
}

// 有道翻译语言代码映射
const YOUDAO_LANG_MAP: Record<string, string> = {
  'auto': 'auto',
  'zh': 'zh-CHS',
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
  appKey: string,
  secretKey: string,
  abortSignal?: AbortSignal
): Promise<TranslationResult> {
  const startTime = Date.now();

  try {
    // 生成随机盐值
    const salt = Date.now().toString();
    // 当前时间戳（秒）
    const curtime = Math.floor(Date.now() / 1000).toString();
    // 生成签名
    const input = request.text.length <= 20
      ? request.text
      : request.text.substring(0, 10) + request.text.length + request.text.substring(request.text.length - 10);
    const str = appKey + input + salt + curtime + secretKey;
    const sign = await sha256(str);

    const params = new URLSearchParams({
      q: request.text,
      from: YOUDAO_LANG_MAP[request.sourceLang] || 'auto',
      to: YOUDAO_LANG_MAP[request.targetLang] || 'en',
      appKey: appKey,
      salt: salt,
      sign: sign,
      signType: 'v3',
      curtime: curtime,
    });

    const response = await fetch(`/api/youdao?${params.toString()}`, {
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: YoudaoTranslateResponse = await response.json();

    if (data.errorCode !== '0') {
      throw new Error(`[${data.errorCode}] ${getYoudaoErrorMessage(data.errorCode)}`);
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

// SHA256 实现
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getYoudaoErrorMessage(code: string): string {
  const errorMap: Record<string, string> = {
    '101': '缺少必填参数',
    '102': '不支持的语言类型',
    '103': '翻译文本过长',
    '104': '不支持的 API 类型',
    '105': '不支持的签名类型',
    '106': '不支持的响应类型',
    '107': '不支持的传输加密类型',
    '108': 'AppKey 无效',
    '109': 'BatchLog 格式不正确',
    '110': '没有相关服务的有效实例',
    '111': '开发者账号无效',
    '201': '解密失败',
    '202': '签名检验失败',
    '203': '访问 IP 地址不在可访问 IP 列表',
    '301': '辞典查询失败',
    '302': '翻译查询失败',
    '303': '服务端的其它异常',
    '401': '账户已经欠费',
    '411': '访问频率受限',
  };
  return errorMap[code] || '未知错误';
}
