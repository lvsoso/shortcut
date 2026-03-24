import { TranslationService } from './types';

export const TRANSLATION_SERVICES: TranslationService[] = [
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    description: '免费开源翻译（部分实例可能不可用）',
    requiresKey: false,
    languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'tr'],
  },
  {
    id: 'baidu',
    name: '百度翻译',
    description: '需要 App ID 和密钥',
    requiresKey: true,
    requiresSecret: true,
    languages: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'th', 'vi'],
  },
  {
    id: 'youdao',
    name: '有道翻译',
    description: '需要应用 ID 和密钥',
    requiresKey: true,
    requiresSecret: true,
    languages: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt'],
  },
  {
    id: 'microsoft',
    name: '微软翻译',
    description: '需要 Azure 密钥',
    requiresKey: true,
    languages: ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar', 'th'],
  },
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
