import { lazy } from 'react';
import { ToolModule } from '../../types';

const JsonFormatter = lazy(async () => {
  const module = await import('./JsonFormatter');
  return { default: module.JsonFormatter };
});

export const jsonFormatter: ToolModule = {
  meta: {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化、压缩、转义 JSON 数据',
    category: 'formatter',
    icon: 'file-json',
    keywords: ['json', 'format', 'pretty', 'compress', 'escape'],
    order: 1,
  },
  component: JsonFormatter,
};
