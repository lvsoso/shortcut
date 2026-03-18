import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TranslationService, TranslationHistory, ProxyConfig, Language } from './types';
import { DEFAULT_SERVICES, DEFAULT_LANGUAGES, MAX_HISTORY_ITEMS } from './constants';

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
