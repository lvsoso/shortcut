import { useState, useCallback, useEffect, useRef } from 'react';
import { Settings, Trash2, Clock, AlertCircle, Languages } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { useTranslatorStore } from './store';
import { SettingsPanel } from './SettingsPanel';
import { translateWithLibreTranslate } from './libreTranslate';
import { translateWithLingva } from './lingvaTranslate';
import { translateWithMyMemory } from './myMemoryTranslate';
import { translateWithBaidu } from './baiduTranslate';
import { translateWithYoudao } from './youdaoTranslate';
import { translateWithMicrosoft } from './microsoftTranslate';
import { TranslationRequest, TranslationResult } from './types';
import { LANGUAGE_OPTIONS, TRANSLATION_SERVICES } from './constants';

export function Translator() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const abortControllers = useRef<Record<string, AbortController>>({});
  const translateTimerRef = useRef<number | null>(null);

  const { serviceConfigs, autoTranslate, setAutoTranslate, addToHistory } = useTranslatorStore();

  const translate = useCallback(async () => {
    if (!text.trim()) return;

    // 取消之前的请求
    Object.values(abortControllers.current).forEach((controller) => controller.abort());
    abortControllers.current = {};

    setLoading({});
    setResults([]);

    const request: TranslationRequest = {
      text: text.trim(),
      sourceLang,
      targetLang,
    };

    // 收集启用的服务
    const enabledServices = TRANSLATION_SERVICES.filter(
      (s) => serviceConfigs[s.id]?.enabled
    );

    if (enabledServices.length === 0) {
      setResults([
        {
          serviceId: 'error',
          serviceName: '提示',
          translatedText: '',
          error: '请在设置中至少启用一个翻译服务',
        },
      ]);
      return;
    }

    // 并行调用所有启用的服务
    const promises = enabledServices.map(async (service) => {
      const controller = new AbortController();
      abortControllers.current[service.id] = controller;

      setLoading((prev) => ({ ...prev, [service.id]: true }));

      let result: TranslationResult;

      try {
        switch (service.id) {
          case 'libretranslate':
            result = await translateWithLibreTranslate(
              request,
              serviceConfigs.libretranslate?.instanceUrl,
              controller.signal
            );
            break;
          case 'lingva':
            result = await translateWithLingva(
              request,
              serviceConfigs.lingva?.instanceUrl,
              controller.signal
            );
            break;
          case 'mymemory':
            result = await translateWithMyMemory(request, controller.signal);
            break;
          case 'baidu':
            result = await translateWithBaidu(
              request,
              serviceConfigs.baidu?.apiKey || '',
              serviceConfigs.baidu?.secretKey || '',
              controller.signal
            );
            break;
          case 'youdao':
            result = await translateWithYoudao(
              request,
              serviceConfigs.youdao?.apiKey || '',
              serviceConfigs.youdao?.secretKey || '',
              controller.signal
            );
            break;
          case 'microsoft':
            result = await translateWithMicrosoft(
              request,
              serviceConfigs.microsoft?.apiKey || '',
              controller.signal
            );
            break;
          default:
            result = {
              serviceId: service.id,
              serviceName: service.name,
              translatedText: '',
              error: '未知服务',
            };
        }
      } catch {
        result = {
          serviceId: service.id,
          serviceName: service.name,
          translatedText: '',
          error: '请求被取消或发生错误',
        };
      }

      setLoading((prev) => ({ ...prev, [service.id]: false }));
      return result;
    });

    const results = await Promise.all(promises);
    setResults(results);
    addToHistory(text.trim());
  }, [text, sourceLang, targetLang, serviceConfigs, addToHistory]);

  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const newSource = targetLang;
      const newTarget = sourceLang;
      setSourceLang(newSource);
      setTargetLang(newTarget);
    }
  };

  const clearAll = () => {
    if (translateTimerRef.current) {
      window.clearTimeout(translateTimerRef.current);
      translateTimerRef.current = null;
    }
    setText('');
    setResults([]);
    Object.values(abortControllers.current).forEach((controller) => controller.abort());
    abortControllers.current = {};
  };

  useEffect(() => {
    return () => {
      if (translateTimerRef.current) {
        window.clearTimeout(translateTimerRef.current);
      }
    };
  }, []);

  return (
    <ToolContainer
      title="多服务翻译"
      description="同时调用多个翻译服务对比结果"
      layout="narrow"
    >
      <div className="flex h-full flex-col space-y-4 text-fg">
        <div className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-panel">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={`src-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-50"
              title="交换语言"
            >
              <Languages className="h-4 w-4" />
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {LANGUAGE_OPTIONS.filter((l) => l.code !== 'auto').map((lang) => (
                <option key={`tgt-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-sm text-fg-secondary">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="rounded border-border"
              />
              自动翻译
            </label>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="mr-1 h-4 w-4" />
              设置
            </Button>

            <Button variant="secondary" size="sm" onClick={clearAll}>
              <Trash2 className="mr-1 h-4 w-4" />
              清空
            </Button>

            <Button variant="primary" size="sm" onClick={translate} disabled={!text.trim()}>
              翻译
            </Button>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="flex-shrink-0">
          <TextArea
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              if (translateTimerRef.current) {
                window.clearTimeout(translateTimerRef.current);
                translateTimerRef.current = null;
              }

              if (autoTranslate && e.target.value.trim()) {
                // 防抖翻译，避免输入过程中触发多次并发请求
                translateTimerRef.current = window.setTimeout(() => {
                  translate();
                }, 1000);
              }
            }}
            placeholder="输入要翻译的文本..."
            className="h-32 resize-none"
          />
        </div>

        {/* 结果区域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {results.map((result) => (
                <div
                  key={result.serviceId}
                  className="rounded-lg border border-border bg-card p-3 shadow-panel"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-fg">{result.serviceName}</span>
                      {loading[result.serviceId] && (
                        <span className="text-xs text-accent">翻译中...</span>
                      )}
                      {result.latency && (
                        <span className="flex items-center gap-0.5 text-xs text-fg-muted">
                          <Clock className="h-3 w-3" />
                          {result.latency}ms
                        </span>
                      )}
                    </div>
                    {result.detectedLang && (
                      <span className="text-xs text-fg-muted">
                        检测: {result.detectedLang}
                      </span>
                    )}
                  </div>

                  {result.error ? (
                    <div className="flex items-start gap-1.5 rounded-md bg-state-danger/10 p-2 text-sm text-state-danger">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{result.error}</span>
                    </div>
                  ) : (
                    <div className="min-h-[3rem] rounded-md bg-panel p-2 text-sm text-fg-secondary">
                      {result.translatedText || (
                        <span className="italic text-fg-muted">等待翻译...</span>
                      )}
                    </div>
                  )}

                  {result.translatedText && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(result.translatedText)}
                      >
                        复制
                      </Button>
                    </div>
                  )}
                </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="py-8 text-center text-fg-muted">
              点击"翻译"按钮开始翻译
            </div>
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </ToolContainer>
  );
}
