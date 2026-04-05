import { lazy } from 'react';
import { ToolModule } from '../../types';

const DataConverter = lazy(async () => {
  const module = await import('./DataConverter');
  return { default: module.DataConverter };
});

export const dataConverter: ToolModule = {
  meta: {
    id: 'data-converter',
    name: '数据转换',
    description: 'Base64、URL 编码、时间戳、哈希转换',
    category: 'converter',
    icon: 'arrow-left-right',
    keywords: ['base64', 'url', 'encode', 'decode', 'timestamp', 'hash', 'md5', 'sha'],
    order: 3,
  },
  component: DataConverter,
};
