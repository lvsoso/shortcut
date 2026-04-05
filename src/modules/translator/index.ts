import { lazy } from 'react';
import { ToolModule } from '../../types';

const Translator = lazy(async () => {
  const module = await import('./Translator');
  return { default: module.Translator };
});

export const translator: ToolModule = {
  meta: {
    id: 'translator',
    name: '多服务翻译',
    description: '同时调用多个翻译服务对比结果',
    category: 'translator',
    icon: 'languages',
    keywords: ['translate', 'translation', '翻译', '百度', '有道', '微软'],
    order: 1,
  },
  component: Translator,
};
export * from './types';
export * from './constants';
