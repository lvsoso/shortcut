import { Language, TranslationService } from './types';

// ISO 639-1 常用语言列表
export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'en', name: '英语', nativeName: 'English' },
  { code: 'ja', name: '日语', nativeName: '日本語' },
  { code: 'ko', name: '韩语', nativeName: '한국어' },
  { code: 'fr', name: '法语', nativeName: 'Français' },
  { code: 'de', name: '德语', nativeName: 'Deutsch' },
  { code: 'es', name: '西班牙语', nativeName: 'Español' },
  { code: 'ru', name: '俄语', nativeName: 'Русский' },
  { code: 'it', name: '意大利语', nativeName: 'Italiano' },
  { code: 'pt', name: '葡萄牙语', nativeName: 'Português' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'العربية' },
  { code: 'th', name: '泰语', nativeName: 'ไทย' },
  { code: 'vi', name: '越南语', nativeName: 'Tiếng Việt' },
];

// 默认翻译服务配置
export const DEFAULT_SERVICES: TranslationService[] = [
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    type: 'free',
    enabled: true,
    apiUrl: 'https://libretranslate.de',  // 公共实例
  },
  {
    id: 'baidu',
    name: '百度翻译',
    type: 'apiKey',
    enabled: false,
    apiUrl: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
  },
  {
    id: 'youdao',
    name: '有道翻译',
    type: 'apiKey',
    enabled: false,
    apiUrl: 'https://openapi.youdao.com/api',
  },
  {
    id: 'google',
    name: 'Google Translate',
    type: 'apiKey',
    enabled: false,
    apiUrl: 'https://translation.googleapis.com/language/translate/v2',
  },
  {
    id: 'microsoft',
    name: '微软翻译',
    type: 'apiKey',
    enabled: false,
    apiUrl: 'https://api.cognitive.microsofttranslator.com',
  },
  {
    id: 'deepl',
    name: 'DeepL',
    type: 'apiKey',
    enabled: false,
    apiUrl: 'https://api-free.deepl.com/v2/translate',
  },
];

// 存储键名
export const STORAGE_KEYS = {
  SERVICES: 'translator_services',
  LANGUAGES: 'translator_languages',
  HISTORY: 'translator_history',
  PROXY: 'translator_proxy',
} as const;

// 历史记录最大数量
export const MAX_HISTORY_ITEMS = 50;

// 防抖延迟（毫秒）
export const DEBOUNCE_DELAY = 500;
