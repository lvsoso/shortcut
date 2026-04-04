import { TranslationService, TranslationServiceKind } from './types';

export const TRANSLATION_SERVICE_KIND_LABELS: Record<TranslationServiceKind, string> = {
  'free-default': '默认免费',
  'free-instance': '社区实例 / 可自建',
  'api-key': '需 API Key',
};

export const TRANSLATION_SERVICES: TranslationService[] = [
  {
    id: 'mymemory',
    name: 'MyMemory',
    description: '免 Key，可直接使用，匿名额度有限',
    requiresKey: false,
    languages: ['auto', 'zh', 'zh-Hans', 'zh-Hant', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'th', 'vi', 'tr'],
    kind: 'free-default',
  },
  {
    id: 'lingva',
    name: 'Lingva',
    description: '免 Key，依赖实例可用性，支持自定义实例',
    requiresKey: false,
    languages: ['auto', 'zh', 'zh-Hans', 'zh-Hant', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'th', 'vi', 'tr'],
    kind: 'free-instance',
  },
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    description: '免 Key，依赖实例可用性，部分实例可能受限',
    requiresKey: false,
    languages: ['auto', 'zh', 'zh-Hans', 'zh-Hant', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'tr'],
    kind: 'free-instance',
  },
  {
    id: 'baidu',
    name: '百度翻译',
    description: '需要 App ID 和密钥',
    requiresKey: true,
    requiresSecret: true,
    languages: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'th', 'vi'],
    kind: 'api-key',
  },
  {
    id: 'youdao',
    name: '有道翻译',
    description: '需要应用 ID 和密钥',
    requiresKey: true,
    requiresSecret: true,
    languages: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt'],
    kind: 'api-key',
  },
  {
    id: 'microsoft',
    name: '微软翻译',
    description: '需要 Azure 密钥',
    requiresKey: true,
    languages: ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'th'],
    kind: 'api-key',
  },
];

// Lingva 公共实例列表
export const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://translate.igna.wtf',
  'https://translate.plausibility.cloud',
  'https://translate.projectsegfau.lt',
];

// LibreTranslate 公共实例列表
export const LIBRETRANSLATE_INSTANCES = [
  'https://libretranslate.de',
  'https://translate.argosopentech.com',
  'https://libretranslate.pussthecat.org',
  'https://translate.terraprint.co',
  'https://libretranslate.com',
];

// 语言选项
export const LANGUAGE_OPTIONS: { code: string; name: string }[] = [
  { code: 'auto', name: '自动检测' },
  { code: 'zh', name: '中文（简体）' },
  { code: 'zh-Hans', name: '中文（简体）' },
  { code: 'zh-Hant', name: '中文（繁体）' },
  { code: 'zh-TW', name: '中文（台湾）' },
  { code: 'en', name: '英语' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'de', name: '德语' },
  { code: 'es', name: '西班牙语' },
  { code: 'ru', name: '俄语' },
  { code: 'it', name: '意大利语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'th', name: '泰语' },
  { code: 'vi', name: '越南语' },
  { code: 'tr', name: '土耳其语' },
];
