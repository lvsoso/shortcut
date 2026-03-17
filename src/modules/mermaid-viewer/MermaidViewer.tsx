import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { Download } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div className="flex flex-wrap gap-2">
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

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadSvg}
            disabled={!svg}
          >
            <Download className="w-4 h-4 mr-1" />
            下载 SVG
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mermaid 语法
            </label>
            <TextArea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="输入 Mermaid 图表语法..."
              className="h-96 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              渲染结果
            </label>
            <div
              ref={containerRef}
              className={`
                h-96 border rounded-md p-4 overflow-auto bg-white
                ${error ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              {error ? (
                <p className="text-red-600 text-sm">{error}</p>
              ) : svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              ) : (
                <p className="text-gray-400 text-sm">图表将在此显示...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
