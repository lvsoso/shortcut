export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  serviceId: string;
  serviceName: string;
  translatedText: string;
  detectedLang?: string;
  error?: string;
  latency?: number;
}

export interface TranslationService {
  id: string;
  name: string;
  description: string;
  requiresKey: boolean;
  requiresSecret?: boolean;
  languages: string[];
}

export interface ProxyConfig {
  enabled: boolean;
  url: string;
}

export type ServiceConfig = {
  apiKey?: string;
  secretKey?: string;
  enabled: boolean;
};

export type ServiceConfigs = Record<string, ServiceConfig>;
