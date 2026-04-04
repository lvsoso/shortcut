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

export type TranslationServiceKind = 'free-default' | 'free-instance' | 'api-key';

export interface TranslationService {
  id: string;
  name: string;
  description: string;
  requiresKey: boolean;
  requiresSecret?: boolean;
  languages: string[];
  kind: TranslationServiceKind;
}

export type ServiceConfig = {
  apiKey?: string;
  secretKey?: string;
  enabled: boolean;
  instanceUrl?: string;
};

export type ServiceConfigs = Record<string, ServiceConfig>;
