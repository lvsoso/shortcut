import { useState, useCallback, useRef } from 'react';
import { Settings, Trash2, Clock, AlertCircle, Languages } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { useTranslatorStore } from './store';
import { SettingsPanel } from './SettingsPanel';
import { translateWithLibreTranslate } from './libreTranslate';
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
              undefined,
              undefined,
              controller.signal
            );
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
    setText('');
    setResults([]);
    Object.values(abortControllers.current).forEach((controller) => controller.abort());
    abortControllers.current = {};
  };

  return (
    <ToolContainer
      title="多服务翻译"
      description="同时调用多个翻译服务对比结果"
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm bg-white"
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
            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50"
            title="交换语言"
          >
            <Languages className="w-4 h-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm bg-white"
          >
            {LANGUAGE_OPTIONS.filter((l) => l.code !== 'auto').map((lang) => (
              <option key={`tgt-${lang.code}`} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
              className="rounded border-gray-300"
            />
            自动翻译
          </label>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4 mr-1" />
            设置
          </Button>

          <Button variant="secondary" size="sm" onClick={clearAll}>
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </Button>

          <Button variant="primary" size="sm" onClick={translate} disabled={!text.trim()}>
            翻译
          </Button>
        </div>

        {/* 输入区域 */}
        <div className="flex-shrink-0">
          <TextArea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (autoTranslate && e.target.value.trim()) {
                // 防抖翻译
                clearTimeout((translate as unknown as { timer: number }).timer);
                (translate as unknown as { timer: number }).timer = window.setTimeout(
                  translate,
                  1000
                );
              }
            }}
            placeholder="输入要翻译的文本..."
            className="h-32 resize-none"
          />
        </div>

        {/* 结果区域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {results.map((result) => (
              <div
                key={result.serviceId}
                className="border rounded-lg p-3 bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{result.serviceName}</span>
                    {loading[result.serviceId] && (
                      <span className="text-xs text-blue-500">翻译中...</span>
                    )}
                    {result.latency && (
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {result.latency}ms
                      </span>
                    )}
                  </div>
                  {result.detectedLang && (
                    <span className="text-xs text-gray-400">
                      检测: {result.detectedLang}
                    </span>
                  )}
                </div>

                {result.error ? (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{result.error}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded min-h-[3rem]">
                    {result.translatedText || (
                      <span className="text-gray-400 italic">等待翻译...</span>
                    )}
                  </div>
                )}

                {result.translatedText && (
                  <div className="flex justify-end mt-2">
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
            <div className="text-center text-gray-400 py-8">
              点击"翻译"按钮开始翻译
            </div>
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </ToolContainer>
  );
}
