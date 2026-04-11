import { ExternalLink, Info } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';

export function LLMTrace() {
  return (
    <ToolContainer>
      <div className="flex h-full flex-col gap-4">
        {/* 使用说明 */}
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="space-y-2 text-sm text-fg-secondary">
              <p>
                <strong className="text-fg">torch.profiler trace 可视化</strong> — 支持 PyTorch Kineto 导出的 Chrome trace 格式
              </p>
              <div className="rounded-lg bg-[rgba(0,0,0,0.04)] p-3 font-mono text-xs">
                <p className="mb-1 text-fg-muted">Python 导出方式：</p>
                <pre className="whitespace-pre-wrap">{`trace = profiler.export_chrome_trace.json()
with open('trace.json', 'w') as f:
    json.dump(trace, f)`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* 跳转入口 */}
        <a
          href="https://ui.perfetto.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-border bg-panel p-8 text-center no-underline transition-colors hover:border-accent hover:bg-[rgba(155,100,56,0.06)]"
        >
          <div className="mb-6 rounded-full bg-accent-soft p-5">
            <ExternalLink className="h-10 w-10 text-accent" />
          </div>
          <p className="mb-1 text-lg font-semibold text-fg">Perfetto Trace Viewer</p>
          <p className="mb-6 text-sm text-fg-muted">
            Google 开源的性能分析工具，拖拽上传 .json trace 文件即可可视化
          </p>
          <span className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-accent-gradient px-5 py-2.5 text-sm font-medium text-fg-onAccent shadow-panel">
            <ExternalLink className="h-4 w-4" />
            打开 Perfetto
          </span>
        </a>
      </div>
    </ToolContainer>
  );
}
