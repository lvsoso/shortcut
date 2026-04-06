import { useState, useCallback } from 'react';
import { FileCode, Hash, Clock, Link2 } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

type ConverterType = 'base64' | 'url' | 'timestamp' | 'hash';

interface ConverterConfig {
  id: ConverterType;
  name: string;
  icon: typeof FileCode;
  encode: (input: string) => string;
  decode: (input: string) => string;
}

const converters: ConverterConfig[] = [
  {
    id: 'base64',
    name: 'Base64',
    icon: FileCode,
    encode: (input) => btoa(unescape(encodeURIComponent(input))),
    decode: (input) => {
      try {
        return decodeURIComponent(escape(atob(input)));
      } catch {
        throw new Error('Invalid Base64 string');
      }
    },
  },
  {
    id: 'url',
    name: 'URL 编码',
    icon: Link2,
    encode: encodeURIComponent,
    decode: decodeURIComponent,
  },
  {
    id: 'timestamp',
    name: '时间戳',
    icon: Clock,
    encode: (input) => {
      const date = new Date(input);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return Math.floor(date.getTime() / 1000).toString();
    },
    decode: (input) => {
      const timestamp = parseInt(input);
      if (isNaN(timestamp)) throw new Error('Invalid timestamp');
      const date = new Date(timestamp * 1000);
      return date.toISOString();
    },
  },
  {
    id: 'hash',
    name: '哈希 (MD5/SHA)',
    icon: Hash,
    encode: () => 'Use the hash tool below',
    decode: () => 'Hash is one-way',
  },
];

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function DataConverter() {
  const [activeConverter, setActiveConverter] = useState<ConverterType>('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hashType, setHashType] = useState<'sha1' | 'sha256'>('sha256');

  const converter = converters.find(c => c.id === activeConverter)!;

  const handleEncode = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const result = converter.encode(input);
      setOutput(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, converter]);

  const handleDecode = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const result = converter.decode(input);
      setOutput(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, converter]);

  const handleHash = useCallback(async () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const result = hashType === 'sha256' ? await sha256(input) : await sha1(input);
      setOutput(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, hashType]);

  return (
    <ToolContainer
      title="数据转换"
      description="Base64、URL 编码、时间戳、哈希转换"
      layout="narrow"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {converters.map((c) => {
            const Icon = c.icon;
            return (
              <Button
                key={c.id}
                variant={activeConverter === c.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setActiveConverter(c.id);
                  setOutput('');
                  setError(null);
                }}
              >
                <Icon className="w-4 h-4 mr-1" />
                {c.name}
              </Button>
            );
          })}
        </div>

        {activeConverter === 'hash' && (
          <div className="flex gap-2">
            {(['sha1', 'sha256'] as const).map((type) => (
              <Button
                key={type}
                variant={hashType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setHashType(type)}
              >
                {type.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {activeConverter !== 'hash' ? (
            <>
              <Button onClick={handleEncode} variant="primary">
                编码 / 转换
              </Button>
              <Button onClick={handleDecode} variant="secondary">
                解码 / 还原
              </Button>
            </>
          ) : (
            <Button onClick={handleHash} variant="primary">
              计算哈希
            </Button>
          )}
          {output && <CopyButton text={output} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-fg-secondary">
              输入
            </label>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`输入要${activeConverter === 'hash' ? '哈希' : '转换'}的内容...`}
              className="h-64 font-mono text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-fg-secondary">
              输出结果
            </label>
            <TextArea
              value={output}
              readOnly
              placeholder="转换结果..."
              className="h-64 bg-panel font-mono text-sm"
              error={error || undefined}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
