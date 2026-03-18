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
