import { lazy } from 'react';
import { ToolModule } from '../../types';

const MermaidViewer = lazy(async () => {
  const module = await import('./MermaidViewer');
  return { default: module.MermaidViewer };
});

export const mermaidViewer: ToolModule = {
  meta: {
    id: 'mermaid-viewer',
    name: 'Mermaid 查看器',
    description: '实时预览 Mermaid 图表',
    category: 'viewer',
    icon: 'git-graph',
    keywords: ['mermaid', 'diagram', 'chart', 'flowchart', 'graph'],
    order: 2,
  },
  component: MermaidViewer,
};
