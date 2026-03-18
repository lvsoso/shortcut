# 多语言翻译功能实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现多语言翻译功能模块，支持多翻译源对比、自定义语言选择、代理配置等功能。

**Architecture:** 按照现有项目模块架构，创建 translator 模块，包含类型定义、翻译服务、状态管理、UI 组件。使用 Zustand 管理状态，localStorage 持久化配置和历史记录。

**Tech Stack:** React + TypeScript + Zustand + Tailwind CSS

---

## 文件结构

```
src/modules/translator/
├── index.ts              # 模块注册入口
├── Translator.tsx        # 主组件
├── types.ts              # 模块类型定义
├── constants.ts          # 常量（语言列表、默认配置）
├── store.ts              # Zustand 状态管理
├── libreTranslate.ts     # LibreTranslate 服务
└── SettingsPanel.tsx     # 设置面板组件
```

---

## Chunk 1: 类型定义和常量

### Task 1: 扩展全局 ToolCategory 类型

**Files:**
- Modify: `src/types/index.ts:3`

- [ ] **Step 1: 添加 'translator' 到 ToolCategory**

```typescript
export type ToolCategory = 'formatter' | 'viewer' | 'converter' | 'network' | 'translator';
```

- [ ] **Step 2: 验证修改**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add 'translator' to ToolCategory"
```

### Task 2: 创建翻译模块类型定义

**Files:**
- Create: `src/modules/translator/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
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
```

- [ ] **Step 2: 验证类型定义**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/types.ts
git commit -m "feat(translator): add type definitions"
```

### Task 3: 创建常量定义

**Files:**
- Create: `src/modules/translator/constants.ts`

- [ ] **Step 1: 创建常量文件**

```typescript
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
    id: 'google',
    name: 'Google Translate',
    type: 'apiKey',
    enabled: false,
    apiUrl: 'https://translation.googleapis.com/language/translate/v2',
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
```

- [ ] **Step 2: 验证常量定义**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/constants.ts
git commit -m "feat(translator): add constants"
```

---

## Chunk 2: 状态管理

### Task 4: 创建 Zustand Store

**Files:**
- Create: `src/modules/translator/store.ts`

- [ ] **Step 1: 创建 store 文件**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TranslationService, TranslationHistory, ProxyConfig, Language } from './types';
import { DEFAULT_SERVICES, DEFAULT_LANGUAGES, STORAGE_KEYS, MAX_HISTORY_ITEMS } from './constants';

interface TranslatorState {
  // 翻译服务
  services: TranslationService[];
  setServices: (services: TranslationService[]) => void;
  updateService: (id: string, updates: Partial<TranslationService>) => void;

  // 语言
  selectedLanguages: Language[];
  setSelectedLanguages: (languages: Language[]) => void;
  sourceLang: string;
  setSourceLang: (lang: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;

  // 历史记录
  history: TranslationHistory[];
  addHistory: (item: TranslationHistory) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;

  // 代理配置
  proxy: ProxyConfig;
  setProxy: (proxy: ProxyConfig) => void;
}

const defaultProxy: ProxyConfig = {
  enabled: false,
  protocol: 'http',
  host: '',
  port: 8080,
};

export const useTranslatorStore = create<TranslatorState>()(
  persist(
    (set) => ({
      // 服务
      services: DEFAULT_SERVICES,
      setServices: (services) => set({ services }),
      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      // 语言
      selectedLanguages: DEFAULT_LANGUAGES,
      setSelectedLanguages: (languages) => set({ selectedLanguages: languages }),
      sourceLang: 'auto',
      setSourceLang: (lang) => set({ sourceLang: lang }),
      targetLang: 'en',
      setTargetLang: (lang) => set({ targetLang: lang }),

      // 历史记录
      history: [],
      addHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, MAX_HISTORY_ITEMS),
        })),
      clearHistory: () => set({ history: [] }),
      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      // 代理
      proxy: defaultProxy,
      setProxy: (proxy) => set({ proxy }),
    }),
    {
      name: 'translator-storage',
      partialize: (state) => ({
        services: state.services,
        selectedLanguages: state.selectedLanguages,
        history: state.history,
        proxy: state.proxy,
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
      }),
    }
  )
);
```

- [ ] **Step 2: 验证 store**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/store.ts
git commit -m "feat(translator): add zustand store with persistence"
```

---

## Chunk 3: 翻译服务

### Task 5: 创建 LibreTranslate 服务

**Files:**
- Create: `src/modules/translator/libreTranslate.ts`

- [ ] **Step 1: 创建翻译服务文件**

```typescript
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
  proxy?: ProxyConfig,
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
```

- [ ] **Step 2: 验证服务代码**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/libreTranslate.ts
git commit -m "feat(translator): add LibreTranslate service"
```

---

## Chunk 4: UI 组件

### Task 6: 创建设置面板组件

**Files:**
- Create: `src/modules/translator/SettingsPanel.tsx`

- [ ] **Step 1: 创建设置面板组件**

```typescript
import { useState } from 'react';
import { Settings, X, Plus, Trash2, Globe, Shield } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useTranslatorStore } from './store';
import { TranslationService, Language, ProxyConfig } from './types';
import { DEFAULT_LANGUAGES } from './constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    services,
    updateService,
    selectedLanguages,
    setSelectedLanguages,
    proxy,
    setProxy,
  } = useTranslatorStore();

  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');

  if (!isOpen) return null;

  const handleAddLanguage = () => {
    if (newLangCode && newLangName) {
      const newLang: Language = {
        code: newLangCode.toLowerCase(),
        name: newLangName,
        nativeName: newLangName,
      };
      setSelectedLanguages([...selectedLanguages, newLang]);
      setNewLangCode('');
      setNewLangName('');
    }
  };

  const handleRemoveLanguage = (code: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l.code !== code));
  };

  const handleToggleService = (id: string, enabled: boolean) => {
    updateService(id, { enabled });
  };

  const handleUpdateApiKey = (id: string, apiKey: string) => {
    updateService(id, { apiKey });
  };

  const handleUpdateApiUrl = (id: string, apiUrl: string) => {
    updateService(id, { apiUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            翻译设置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* 翻译服务配置 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">翻译服务</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        onChange={(e) =>
                          handleToggleService(service.id, e.target.checked)
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900">
                        {service.name}
                      </span>
                      {service.type === 'apiKey' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          需 API Key
                        </span>
                      )}
                    </div>
                  </div>

                  {service.enabled && (
                    <div className="ml-6 space-y-2">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          API 地址
                        </label>
                        <input
                          type="text"
                          value={service.apiUrl || ''}
                          onChange={(e) =>
                            handleUpdateApiUrl(service.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://..."
                        />
                      </div>
                      {service.type === 'apiKey' && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={service.apiKey || ''}
                            onChange={(e) =>
                              handleUpdateApiKey(service.id, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="输入 API Key"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 语言列表 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              语言列表
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLanguages.map((lang) => (
                <span
                  key={lang.code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {lang.name} ({lang.code})
                  <button
                    onClick={() => handleRemoveLanguage(lang.code)}
                    className="hover:text-primary-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLangCode}
                onChange={(e) => setNewLangCode(e.target.value)}
                placeholder="语言代码 (如: pl)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
                placeholder="语言名称 (如: 波兰语)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button onClick={handleAddLanguage} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              使用 ISO 639-1 语言代码（如: en, zh, ja）
            </p>
          </section>

          {/* 代理配置 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              代理配置
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={proxy.enabled}
                  onChange={(e) =>
                    setProxy({ ...proxy, enabled: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">启用代理</span>
              </div>

              {proxy.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      代理主机
                    </label>
                    <input
                      type="text"
                      value={proxy.host}
                      onChange={(e) =>
                        setProxy({ ...proxy, host: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="127.0.0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      端口
                    </label>
                    <input
                      type="number"
                      value={proxy.port}
                      onChange={(e) =>
                        setProxy({ ...proxy, port: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="8080"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证组件**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/SettingsPanel.tsx
git commit -m "feat(translator): add settings panel component"
```

### Task 7: 创建主组件

**Files:**
- Create: `src/modules/translator/Translator.tsx`

- [ ] **Step 1: 创建主组件文件**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { Languages, Settings, History, X, Clock, AlertCircle, Check } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';
import { useTranslatorStore } from './store';
import { SettingsPanel } from './SettingsPanel';
import { translateWithLibreTranslate } from './libreTranslate';
import { TranslationResult, TranslationHistory } from './types';
import { DEBOUNCE_DELAY } from './constants';

export function Translator() {
  const {
    services,
    selectedLanguages,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    history,
    addHistory,
    deleteHistoryItem,
    proxy,
  } = useTranslatorStore();

  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 执行翻译
  const performTranslation = useCallback(async () => {
    if (!inputText.trim()) {
      setResults([]);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const enabledServices = services.filter((s) => s.enabled);
    if (enabledServices.length === 0) {
      setError('请至少启用一个翻译服务');
      setIsLoading(false);
      return;
    }

    const translationPromises = enabledServices.map(async (service) => {
      if (service.id === 'libretranslate') {
        return translateWithLibreTranslate(
          {
            text: inputText,
            sourceLang,
            targetLang,
          },
          service.apiUrl,
          proxy.enabled ? proxy : undefined,
          abortControllerRef.current?.signal
        );
      }
      // TODO: 实现 Google 和 DeepL 翻译
      return {
        serviceId: service.id,
        serviceName: service.name,
        translatedText: '',
        error: '暂不支持此服务',
        latency: 0,
      };
    });

    const translationResults = await Promise.all(translationPromises);
    setResults(translationResults);

    // 保存到历史记录
    if (translationResults.some((r) => !r.error)) {
      const historyItem: TranslationHistory = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        sourceText: inputText,
        sourceLang,
        targetLang,
        results: translationResults,
      };
      addHistory(historyItem);
    }

    setIsLoading(false);
  }, [inputText, sourceLang, targetLang, services, proxy, addHistory]);

  // 防抖处理
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (inputText.trim()) {
        performTranslation();
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, performTranslation]);

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleLoadFromHistory = (item: TranslationHistory) => {
    setInputText(item.sourceText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setResults(item.results);
    setShowHistory(false);
  };

  return (
    <ToolContainer
      title="多语言翻译"
      description="支持多翻译源对比的文本翻译工具"
    >
      <div className="space-y-4">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* 源语言选择 */}
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="auto">自动检测</option>
              {selectedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <span className="text-gray-500">→</span>

            {/* 目标语言选择 */}
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {selectedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-1" />
              历史
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              设置
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：输入区 */}
          <div className="lg:col-span-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              输入文本
            </label>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此输入要翻译的文本..."
              className="h-64 resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {inputText.length} 字符
            </div>
          </div>

          {/* 右侧：结果区 */}
          <div className="lg:col-span-2">
            {showHistory ? (
              <div className="border border-gray-200 rounded-lg h-80 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">翻译历史</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-40px)] p-2">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无历史记录</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                          onClick={() => handleLoadFromHistory(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleString()}
                              <span className="text-gray-400">
                                {item.sourceLang === 'auto'
                                  ? '自动'
                                  : item.sourceLang}{' '}
                                → {item.targetLang}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                              }}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-900 truncate">
                            {item.sourceText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  翻译结果
                  {isLoading && (
                    <span className="ml-2 text-xs text-primary-600">翻译中...</span>
                  )}
                </label>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((result) => (
                    <div
                      key={result.serviceId}
                      className={`border rounded-lg p-3 ${
                        result.error
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-700">
                          {result.serviceName}
                        </span>
                        <div className="flex items-center gap-2">
                          {result.error ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <>
                              <span className="text-xs text-gray-500">
                                {result.latency}ms
                              </span>
                              <CopyButton
                                text={result.translatedText}
                                size="sm"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {result.error ? (
                        <p className="text-sm text-red-600">{result.error}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {result.translatedText}
                          </p>
                          {result.detectedLang && sourceLang === 'auto' && (
                            <p className="text-xs text-gray-500">
                              检测到的语言: {result.detectedLang}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {results.length === 0 && !isLoading && !error && (
                  <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Languages className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>输入文本开始翻译</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </ToolContainer>
  );
}
```

- [ ] **Step 2: 验证主组件**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/Translator.tsx
git commit -m "feat(translator): add main translator component"
```

### Task 8: 创建模块入口

**Files:**
- Create: `src/modules/translator/index.ts`

- [ ] **Step 1: 创建模块入口文件**

```typescript
import { ToolModule } from '../../types';
import { Translator } from './Translator';

export const translator: ToolModule = {
  meta: {
    id: 'translator',
    name: '多语言翻译',
    description: '支持多翻译源对比的文本翻译工具',
    category: 'translator',
    icon: 'languages',
    keywords: ['translate', 'translation', '语言', '翻译', 'i18n'],
    order: 5,
  },
  component: Translator,
};
```

- [ ] **Step 2: 验证模块入口**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/modules/translator/index.ts
git commit -m "feat(translator): add module entry"
```

---

## Chunk 5: 集成到应用

### Task 9: 注册翻译模块

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 导入并注册翻译模块**

```typescript
import { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { registry } from './core/registry';
import { jsonFormatter } from './modules/json-formatter';
import { mermaidViewer } from './modules/mermaid-viewer';
import { dataConverter } from './modules/data-converter';
import { networkTools } from './modules/network-tools';
import { translator } from './modules/translator';
import { useToolStore } from './stores/toolStore';

function registerTools() {
  registry.register(jsonFormatter);
  registry.register(mermaidViewer);
  registry.register(dataConverter);
  registry.register(networkTools);
  registry.register(translator);
}

function App() {
  const { currentToolId, setCurrentTool } = useToolStore();

  useEffect(() => {
    registerTools();
    if (!currentToolId) {
      setCurrentTool('json-formatter');
    }
  }, []);

  const currentTool = currentToolId ? registry.getTool(currentToolId) : null;
  const ToolComponent = currentTool?.component;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            请从左侧选择一个工具
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: 验证修改**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): register translator module"
```

---

## Chunk 6: 验证和测试

### Task 10: 类型检查和构建验证

- [ ] **Step 1: 完整类型检查**

运行: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 构建验证**

运行: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 3: Commit 最终版本**

```bash
git add .
git commit -m "feat(translator): complete translator module implementation"
```

---

## 实现完成

多语言翻译功能已实现，包含：
- 多翻译源支持（LibreTranslate，可扩展 Google/DeepL）
- 语言选择和管理
- 翻译历史记录
- 代理配置
- 响应式 UI 设计
