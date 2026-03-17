import { useState, useCallback } from 'react';
import { FileJson } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input]);

  const compressJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const compressed = JSON.stringify(parsed);
      setOutput(compressed);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input]);

  const escapeJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const escaped = JSON.stringify(JSON.stringify(parsed));
      setOutput(escaped.slice(1, -1));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input]);

  const unescapeJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const unescaped = JSON.parse(`"${input.replace(/"/g, '\\"')}"`);
      const parsed = JSON.parse(unescaped);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError('Invalid escaped JSON string');
    }
  }, [input]);

  return (
    <ToolContainer
      title="JSON 格式化"
      description="格式化、压缩、转义 JSON 数据"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={formatJson} variant="primary">
            <FileJson className="w-4 h-4 mr-1" />
            格式化
          </Button>
          <Button onClick={compressJson} variant="secondary">
            压缩
          </Button>
          <Button onClick={escapeJson} variant="secondary">
            转义
          </Button>
          <Button onClick={unescapeJson} variant="secondary">
            反转义
          </Button>
          {output && <CopyButton text={output} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输入 JSON
            </label>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴 JSON..."
              className="h-96 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输出结果
            </label>
            <TextArea
              value={output}
              readOnly
              placeholder="格式化后的结果..."
              className="h-96 font-mono text-sm bg-gray-50"
              error={error || undefined}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
