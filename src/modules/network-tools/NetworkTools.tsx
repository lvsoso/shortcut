import { useState, useCallback } from 'react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

type NetworkToolType = 'jwt' | 'http';

interface JWTPayload {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const decodeBase64 = (str: string) => {
    const padding = '='.repeat((4 - str.length % 4) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  };

  return {
    header: decodeBase64(parts[0]),
    payload: decodeBase64(parts[1]),
    signature: parts[2],
  };
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number | undefined;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

export function NetworkTools() {
  const [activeTool, setActiveTool] = useState<NetworkToolType>('jwt');
  const [jwtInput, setJwtInput] = useState('');
  const [jwtDecoded, setJwtDecoded] = useState<JWTPayload | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpUrl, setHttpUrl] = useState('');
  const [httpHeaders, setHttpHeaders] = useState('');
  const [httpBody, setHttpBody] = useState('');
  const [httpResponse, setHttpResponse] = useState('');
  const [httpLoading, setHttpLoading] = useState(false);

  const decodeJwtToken = useCallback(() => {
    try {
      if (!jwtInput.trim()) {
        setJwtDecoded(null);
        setJwtError(null);
        return;
      }
      const decoded = decodeJWT(jwtInput);
      setJwtDecoded(decoded);
      setJwtError(null);
    } catch (err) {
      setJwtError((err as Error).message);
      setJwtDecoded(null);
    }
  }, [jwtInput]);

  const sendHttpRequest = useCallback(async () => {
    try {
      setHttpLoading(true);
      const headers: Record<string, string> = {};
      if (httpHeaders.trim()) {
        httpHeaders.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) headers[key] = value;
        });
      }

      const options: RequestInit = {
        method: httpMethod,
        headers,
      };

      if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpBody) {
        options.body = httpBody;
      }

      const response = await fetch(httpUrl, options);
      const data = await response.text();

      let formatted = `Status: ${response.status} ${response.statusText}\n`;
      formatted += `Headers:\n`;
      response.headers.forEach((value, key) => {
        formatted += `  ${key}: ${value}\n`;
      });
      formatted += `\nBody:\n`;
      try {
        const json = JSON.parse(data);
        formatted += JSON.stringify(json, null, 2);
      } catch {
        formatted += data;
      }

      setHttpResponse(formatted);
    } catch (err) {
      setHttpResponse(`Error: ${(err as Error).message}`);
    } finally {
      setHttpLoading(false);
    }
  }, [httpMethod, httpUrl, httpHeaders, httpBody]);

  return (
    <ToolContainer
      title="网络工具"
      description="JWT 解码、HTTP 请求测试"
      layout="narrow"
    >
      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTool === 'jwt' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTool('jwt')}
        >
          JWT 解码
        </Button>
        <Button
          variant={activeTool === 'http' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTool('http')}
        >
          HTTP 请求
        </Button>
      </div>

      {activeTool === 'jwt' ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-fg-secondary">
              JWT Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                className="flex-1 rounded-md border border-border bg-input px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <Button onClick={decodeJwtToken}>解码</Button>
            </div>
          </div>

          {jwtError && (
            <div className="rounded-md border border-state-danger/25 bg-state-danger/10 p-3">
              <p className="text-sm text-state-danger">{jwtError}</p>
            </div>
          )}

          {jwtDecoded && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-panel p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-fg-secondary">Header</h4>
                  <CopyButton text={JSON.stringify(jwtDecoded.header, null, 2)} size="sm" />
                </div>
                <pre className="overflow-x-auto text-sm font-mono text-fg-secondary">
                  {JSON.stringify(jwtDecoded.header, null, 2)}
                </pre>
              </div>

              <div className="rounded-md border border-border bg-panel p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-fg-secondary">Payload</h4>
                  <div className="flex items-center gap-2">
                    {isTokenExpired(jwtDecoded.payload) && (
                      <span className="text-xs font-medium text-state-danger">已过期</span>
                    )}
                    <CopyButton text={JSON.stringify(jwtDecoded.payload, null, 2)} size="sm" />
                  </div>
                </div>
                <pre className="overflow-x-auto text-sm font-mono text-fg-secondary">
                  {JSON.stringify(jwtDecoded.payload, null, 2)}
                </pre>
              </div>

              <div className="rounded-md border border-border bg-panel p-4">
                <h4 className="mb-2 font-medium text-fg-secondary">Signature</h4>
                <p className="break-all text-sm font-mono text-fg-muted">
                  {jwtDecoded.signature}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              placeholder="https://api.example.com/data"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button onClick={sendHttpRequest} disabled={httpLoading}>
              {httpLoading ? '发送中...' : '发送'}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-fg-secondary">
                Headers (每行一个: Key: Value)
              </label>
              <TextArea
                value={httpHeaders}
                onChange={(e) => setHttpHeaders(e.target.value)}
                placeholder="Content-Type: application/json\nAuthorization: Bearer token"
                className="h-32 font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-fg-secondary">
                Body (JSON)
              </label>
              <TextArea
                value={httpBody}
                onChange={(e) => setHttpBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="h-32 font-mono text-sm"
              />
            </div>
          </div>

          {httpResponse && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-fg-secondary">响应</label>
                <CopyButton text={httpResponse} size="sm" />
              </div>
              <TextArea
                value={httpResponse}
                readOnly
                className="h-64 bg-panel font-mono text-sm"
              />
            </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
}
