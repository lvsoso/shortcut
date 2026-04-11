import { lazy } from 'react';
import { ToolModule } from '../../types';

const LLMTrace = lazy(async () => {
  const module = await import('./LLMTrace');
  return { default: module.LLMTrace };
});

export const llmTrace: ToolModule = {
  meta: {
    id: 'llm-trace',
    name: 'Trace 分析',
    description: '上传并可视化 torch profiler / LLM tracing trace 文件',
    category: 'ai',
    icon: 'brain-circuit',
    keywords: ['trace', 'torch', 'profiler', 'llm', 'flame', 'perfetto'],
    order: 10,
  },
  component: LLMTrace,
};
