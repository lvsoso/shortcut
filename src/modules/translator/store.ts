import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ServiceConfigs } from './types';

interface TranslatorState {
  // 服务配置
  serviceConfigs: ServiceConfigs;
  updateServiceConfig: (serviceId: string, config: Partial<ServiceConfigs[string]>) => void;

  // 全局设置
  autoTranslate: boolean;
  setAutoTranslate: (value: boolean) => void;

  // 历史记录
  history: string[];
  addToHistory: (text: string) => void;
  clearHistory: () => void;
}

const defaultConfigs: ServiceConfigs = {
  libretranslate: { enabled: true },
  baidu: { enabled: false },
  youdao: { enabled: false },
  microsoft: { enabled: false },
};

export const useTranslatorStore = create<TranslatorState>()(
  persist(
    (set) => ({
      serviceConfigs: defaultConfigs,
      updateServiceConfig: (serviceId, config) =>
        set((state) => ({
          serviceConfigs: {
            ...state.serviceConfigs,
            [serviceId]: { ...state.serviceConfigs[serviceId], ...config },
          },
        })),
      autoTranslate: false,
      setAutoTranslate: (value) => set({ autoTranslate: value }),
      history: [],
      addToHistory: (text) => {
        if (!text.trim()) return;
        set((state) => ({
          history: [text, ...state.history.filter((h) => h !== text)].slice(0, 20),
        }));
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'translator-storage',
    }
  )
);
