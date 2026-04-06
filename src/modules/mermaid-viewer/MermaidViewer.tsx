import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  AlertCircle,
  Code2,
  Download,
  Hand,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { getResolvedThemeMode, useThemeStore } from '../../stores/themeStore';

const defaultDiagram = `graph TD
    A[开始] --> B{判断}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E`;

const examples = [
  {
    name: '流程图',
    code: `graph TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> D`,
  },
  {
    name: '时序图',
    code: `sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 请求
    B->>A: 响应`,
  },
  {
    name: '类图',
    code: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +fetch()
    }
    Animal <|-- Dog`,
  },
];

const DEFAULT_EDITOR_WIDTH = 360;
const MIN_EDITOR_WIDTH = 320;
const MIN_PREVIEW_WIDTH = 320;
const RESIZE_HANDLE_WIDTH = 12;

interface MermaidEditorContentProps {
  code: string;
  onChange: (value: string) => void;
  onSelectExample: (value: string) => void;
  onClose: () => void;
  showCloseButton?: boolean;
}

function MermaidEditorContent({
  code,
  onChange,
  onSelectExample,
  onClose,
  showCloseButton = true,
}: MermaidEditorContentProps) {
  return (
    <div className="flex h-full flex-col bg-card text-fg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-fg">Mermaid 代码</p>
          <p className="mt-1 text-xs text-fg-muted">修改源码后右侧会实时更新预览</p>
        </div>
        {showCloseButton && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div className="flex-1 min-h-0">
          <TextArea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="输入 Mermaid 图表语法..."
            className="h-full min-h-[18rem] resize-none font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">示例模板</p>
            <span className="text-xs text-fg-muted">点击直接替换当前代码</span>
          </div>
          <div className="grid gap-2">
            {examples.map((example) => (
              <Button
                key={example.name}
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => onSelectExample(example.code)}
              >
                {example.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MermaidViewer() {
  const [code, setCode] = useState(defaultDiagram);
  const [svg, setSvg] = useState('');
  const [lastSuccessfulSvg, setLastSuccessfulSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const themeName = useThemeStore((state) => state.themeName);
  const themeMode = useThemeStore((state) => state.themeMode);
  const resolvedMode = getResolvedThemeMode(themeMode);

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = resolvedMode === 'dark';
    const isAnime = themeName === 'anime';

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'strict',
      themeVariables: isAnime ? {
        primaryColor: isDark ? '#ff78b2' : '#ffc2dd',
        primaryTextColor: isDark ? '#f9ecff' : '#382f4d',
        primaryBorderColor: isDark ? '#a78bfa' : '#ff78b2',
        lineColor: isDark ? '#d8c7f6' : '#665c82',
        secondaryColor: isDark ? '#291840' : '#f8f3ff',
        tertiaryColor: isDark ? '#1d1230' : '#fff7fb',
        background: 'transparent',
        mainBkg: isDark ? '#291840' : '#fff7fb',
        nodeBorder: isDark ? '#a78bfa' : '#ff78b2',
        clusterBkg: isDark ? '#231638' : '#f8f3ff',
        clusterBorder: isDark ? '#7dd3fc' : '#c4b5fd',
        edgeLabelBackground: isDark ? '#231638' : '#fff7fb',
      } : undefined,
    });
  }, [resolvedMode, themeName]);

  useEffect(() => {
    if (!isEditorOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEditorOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen]);

  const clampEditorWidth = useCallback((nextWidth: number) => {
    const containerWidth = splitContainerRef.current?.getBoundingClientRect().width;
    if (!containerWidth) {
      return Math.max(MIN_EDITOR_WIDTH, nextWidth);
    }

    const maxEditorWidth = Math.max(
      MIN_EDITOR_WIDTH,
      containerWidth - MIN_PREVIEW_WIDTH - RESIZE_HANDLE_WIDTH,
    );

    return Math.max(MIN_EDITOR_WIDTH, Math.min(nextWidth, maxEditorWidth));
  }, []);

  useEffect(() => {
    if (!isEditorOpen) {
      setIsResizing(false);
      return;
    }

    // 容器尺寸变化后重新钳制编辑区宽度，避免预览区被过度挤压。
    const syncEditorWidth = () => {
      setEditorWidth((currentWidth) => clampEditorWidth(currentWidth));
    };

    syncEditorWidth();
    window.addEventListener('resize', syncEditorWidth);

    return () => window.removeEventListener('resize', syncEditorWidth);
  }, [isEditorOpen, clampEditorWidth]);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvg('');
      setLastSuccessfulSvg('');
      setError(null);
      return;
    }

    try {
      const renderId = `mermaid-${Date.now()}`;
      const { svg: renderedSvg } = await mermaid.render(renderId, code);
      setSvg(renderedSvg);
      setLastSuccessfulSvg(renderedSvg);
      setError(null);
    } catch (err) {
      setSvg('');
      setError((err as Error).message);
    }
  }, [code]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 300);
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  const handleResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
  };

  const handleResizeMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing || !splitContainerRef.current) return;

    const { left } = splitContainerRef.current.getBoundingClientRect();
    const nextWidth = event.clientX - left;
    setEditorWidth(clampEditorWidth(nextWidth));
  }, [isResizing, clampEditorWidth]);

  const handleResizeMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleResizeMouseMove, handleResizeMouseUp]);

  const handleCanvasMouseDown = (event: React.MouseEvent) => {
    if (!isPanMode) return;
    event.preventDefault();
    setIsPanning(true);
    setPanStart({
      x: event.clientX - translateX,
      y: event.clientY - translateY,
    });
  };

  const handleCanvasMouseMove = useCallback((event: MouseEvent) => {
    if (!isPanning) return;
    setTranslateX(event.clientX - panStart.x);
    setTranslateY(event.clientY - panStart.y);
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (!isPanning) return;

    document.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('mouseup', handleCanvasMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleCanvasMouseMove);
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const zoomIn = () => setScale((currentScale) => Math.min(currentScale * 1.2, 5));
  const zoomOut = () => setScale((currentScale) => Math.max(currentScale / 1.2, 0.2));

  const resetView = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setScale((currentScale) => Math.max(0.2, Math.min(5, currentScale * delta)));
    }
  };

  const displayedSvg = svg || lastSuccessfulSvg;
  const isEmpty = !code.trim();
  const hasCachedDiagram = Boolean(lastSuccessfulSvg);
  const showCanvasError = Boolean(error && !hasCachedDiagram && !isEmpty);

  const downloadSvg = () => {
    if (!displayedSvg) return;

    const blob = new Blob([displayedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolContainer
      title="Mermaid 查看器"
      description="实时预览 Mermaid 图表"
    >
      <div className="flex h-full min-h-0 flex-col gap-4 text-fg">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-panel">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isEditorOpen ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsEditorOpen((open) => !open)}
            >
              <Code2 className="mr-1 h-4 w-4" />
              {isEditorOpen ? '收起编辑' : '编辑'}
            </Button>
            <Button
              variant={isPanMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsPanMode((enabled) => !enabled)}
              title="平移模式"
            >
              <Hand className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={zoomOut} title="缩小">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-xs text-fg-muted">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="secondary" size="sm" onClick={zoomIn} title="放大">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={resetView} title="重置视图">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={downloadSvg}
              disabled={!displayedSvg}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-state-warning/30 bg-state-warning/10 px-4 py-3 text-sm text-fg">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-state-warning" />
              <div className="space-y-1">
                <p className="font-medium">渲染失败</p>
                <p className="break-all text-fg-secondary">{error}</p>
                {hasCachedDiagram && (
                  <p className="text-xs text-fg-muted">当前继续显示最近一次成功渲染结果。</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          ref={splitContainerRef}
          className="relative flex min-h-[32rem] flex-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-panel"
        >
          <div
            className={`hidden h-full shrink-0 overflow-hidden bg-card transition-[width,border-color] ease-out lg:flex ${
              isResizing ? 'duration-0' : 'duration-300'
            } ${isEditorOpen ? 'border-r border-border' : 'border-r-0'
            }`}
            style={{ width: isEditorOpen ? `${editorWidth}px` : '0px' }}
          >
            <div className="h-full min-w-0 flex-1">
              <MermaidEditorContent
                code={code}
                onChange={setCode}
                onSelectExample={setCode}
                onClose={() => setIsEditorOpen(false)}
              />
            </div>
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-hidden={!isEditorOpen}
            title="拖拽调整编辑区宽度"
            className={`hidden shrink-0 items-stretch transition-[width,opacity] ease-out lg:flex ${
              isResizing ? 'duration-0' : 'duration-300'
            } ${
              isEditorOpen ? 'w-3 opacity-100' : 'pointer-events-none w-0 opacity-0'
            }`}
            onMouseDown={handleResizeMouseDown}
          >
            <div
              className={`flex w-full cursor-col-resize items-center justify-center ${
                isResizing ? 'bg-accent-soft/90' : 'hover:bg-accent-soft/80'
              }`}
            >
              <div
                className={`h-16 w-px rounded-full transition-colors ${
                  isResizing ? 'bg-accent' : 'bg-border-strong'
                }`}
              />
            </div>
          </div>

          <div className="relative min-w-0 flex-1 bg-panel">
            <div
              className={`
                absolute inset-0 overflow-hidden
                ${isPanMode ? 'cursor-grab' : 'cursor-default'}
                ${isPanning ? 'cursor-grabbing' : ''}
              `}
              onWheel={handleWheel}
              onMouseDown={handleCanvasMouseDown}
            >
              {isEmpty ? (
                <div className="flex h-full items-center justify-center px-6">
                  <div className="max-w-sm space-y-3 text-center">
                    <p className="text-lg font-medium text-fg">先写点 Mermaid 代码</p>
                    <p className="text-sm text-fg-secondary">
                      打开编辑器，粘贴语法或直接套用示例模板。
                    </p>
                    <div className="flex justify-center">
                      <Button onClick={() => setIsEditorOpen(true)}>
                        <Code2 className="mr-1 h-4 w-4" />
                        开始编辑
                      </Button>
                    </div>
                  </div>
                </div>
              ) : showCanvasError ? (
                <div className="flex h-full items-center justify-center px-6">
                  <div className="max-w-md space-y-3 text-center">
                    <p className="text-lg font-medium text-state-danger">图表暂时无法渲染</p>
                    <p className="break-all text-sm text-fg-secondary">{error}</p>
                    <div className="flex justify-center">
                      <Button variant="secondary" onClick={() => setIsEditorOpen(true)}>
                        <Code2 className="mr-1 h-4 w-4" />
                        打开编辑器修正
                      </Button>
                    </div>
                  </div>
                </div>
              ) : displayedSvg ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="origin-center shrink-0"
                    style={{
                      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                      transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: displayedSvg }} />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-fg-muted">
                  图表将在此显示
                </div>
              )}

              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-fg-muted shadow-panel backdrop-blur-sm">
                Ctrl/Cmd + 滚轮缩放
                {isPanMode && ' | 拖拽平移'}
              </div>
            </div>
          </div>
        </div>

        {isEditorOpen && (
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setIsEditorOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-full max-w-none bg-card shadow-2xl sm:w-[420px]">
              <MermaidEditorContent
                code={code}
                onChange={setCode}
                onSelectExample={setCode}
                onClose={() => setIsEditorOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
}
