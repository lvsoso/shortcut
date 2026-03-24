import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, RotateCcw, Hand } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';

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

export function MermaidViewer() {
  const [code, setCode] = useState(defaultDiagram);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 分屏拖拽相关
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // 画布缩放平移相关
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict',
    });
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvg('');
      setError(null);
      return;
    }

    try {
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvg(svg);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setSvg('');
    }
  }, [code]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 500);
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  // 分屏拖拽逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newRatio = Math.max(20, Math.min(80, (x / rect.width) * 100));
    setSplitRatio(newRatio);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 画布平移逻辑
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    setTranslateX(e.clientX - panStart.x);
    setTranslateY(e.clientY - panStart.y);
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleCanvasMouseMove);
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  // 缩放控制
  const zoomIn = () => setScale(s => Math.min(s * 1.2, 5));
  const zoomOut = () => setScale(s => Math.max(s / 1.2, 0.2));
  const resetView = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(s => Math.max(0.2, Math.min(5, s * delta)));
    }
  };

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
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
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 py-2">示例:</span>
          {examples.map((ex) => (
            <Button
              key={ex.name}
              variant="secondary"
              size="sm"
              onClick={() => setCode(ex.code)}
            >
              {ex.name}
            </Button>
          ))}
        </div>

        {/* 可拖拽分屏布局 */}
        <div
          ref={splitContainerRef}
          className="flex h-[600px] relative"
        >
          {/* 左侧编辑器 */}
          <div
            className="flex flex-col h-full"
            style={{ width: `${splitRatio}%`, minWidth: '200px' }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1 flex-shrink-0">
              Mermaid 语法
            </label>
            <div className="flex-1 min-h-0">
              <TextArea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="输入 Mermaid 图表语法..."
                className="h-full font-mono text-sm resize-none"
              />
            </div>
          </div>

          {/* 拖拽分割线 */}
          <div
            className="w-4 flex-shrink-0 flex items-center justify-center cursor-col-resize group"
            onMouseDown={handleMouseDown}
          >
            <div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-colors" />
          </div>

          {/* 右侧预览区 */}
          <div
            className="flex flex-col h-full"
            style={{ width: `${100 - splitRatio}%`, minWidth: '200px' }}
          >
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700">
                渲染结果
              </label>
              <div className="flex items-center gap-1">
                <Button
                  variant={isPanMode ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setIsPanMode(!isPanMode)}
                  title="平移模式"
                >
                  <Hand className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={zoomOut}
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500 w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={zoomIn}
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetView}
                  title="重置视图"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadSvg}
                  disabled={!svg}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              ref={canvasRef}
              className={`
                flex-1 min-h-0 border rounded-md overflow-hidden bg-gray-50 relative
                ${error ? 'border-red-500' : 'border-gray-300'}
                ${isPanMode ? 'cursor-grab' : 'cursor-default'}
                ${isPanning ? 'cursor-grabbing' : ''}
              `}
              onWheel={handleWheel}
              onMouseDown={handleCanvasMouseDown}
            >
              {/* 画布容器 */}
              <div
                className="absolute inset-0 flex items-center justify-center origin-center"
                style={{
                  transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                {error ? (
                  <p className="text-red-600 text-sm p-4">{error}</p>
                ) : svg ? (
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                ) : (
                  <p className="text-gray-400 text-sm">图表将在此显示...</p>
                )}
              </div>

              {/* 提示文字 */}
              <div className="absolute bottom-2 left-2 text-xs text-gray-400 pointer-events-none">
                Ctrl/Cmd + 滚轮缩放
                {isPanMode && ' | 拖拽平移'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
