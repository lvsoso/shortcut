// 翻译服务配置
export interface TranslationService {
  id: string;
  name: string;
  type: 'free' | 'apiKey';
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
}

// 翻译请求
export interface TranslationRequest {
  text: string;
  sourceLang: string;  // 'auto' 表示自动检测
  targetLang: string;
}

// 翻译结果
export interface TranslationResult {
  serviceId: string;
  serviceName: string;
  translatedText: string;
  detectedLang?: string;
  error?: string;
  latency: number;
}

// 历史记录
export interface TranslationHistory {
  id: string;
  timestamp: number;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  results: TranslationResult[];
}

// 代理配置
export interface ProxyConfig {
  enabled: boolean;
  protocol: 'http';
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

// 语言
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
