import { ToolModule } from '../../types';
import { Translator } from './Translator';

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

export { Translator };
export * from './types';
export * from './constants';
