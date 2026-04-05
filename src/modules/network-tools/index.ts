import { lazy } from 'react';
import { ToolModule } from '../../types';

const NetworkTools = lazy(async () => {
  const module = await import('./NetworkTools');
  return { default: module.NetworkTools };
});

export const networkTools: ToolModule = {
  meta: {
    id: 'network-tools',
    name: '网络工具',
    description: 'JWT 解码、HTTP 请求测试',
    category: 'network',
    icon: 'globe',
    keywords: ['jwt', 'http', 'api', 'request', 'decode', 'token'],
    order: 4,
  },
  component: NetworkTools,
};
