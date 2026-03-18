import { useState, useCallback, useRef, useEffect } from 'react';
import { Languages, Settings, History, X, Clock, AlertCircle } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';
import { useTranslatorStore } from './store';
import { SettingsPanel } from './SettingsPanel';
import { translateWithLibreTranslate } from './libreTranslate';
import { TranslationResult, TranslationHistory } from './types';
import { DEBOUNCE_DELAY } from './constants';

export function Translator() {
  const {
    services,
    selectedLanguages,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    history,
    addHistory,
    deleteHistoryItem,
    proxy,
  } = useTranslatorStore();

  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 执行翻译
  const performTranslation = useCallback(async () => {
    if (!inputText.trim()) {
      setResults([]);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const enabledServices = services.filter((s) => s.enabled);
    if (enabledServices.length === 0) {
      setError('请至少启用一个翻译服务');
      setIsLoading(false);
      return;
    }

    const translationPromises = enabledServices.map(async (service) => {
      if (service.id === 'libretranslate') {
        return translateWithLibreTranslate(
          {
            text: inputText,
            sourceLang,
            targetLang,
          },
          service.apiUrl,
          proxy.enabled ? proxy : undefined,
          abortControllerRef.current?.signal
        );
      }
      // TODO: 实现 Google 和 DeepL 翻译
      return {
        serviceId: service.id,
        serviceName: service.name,
        translatedText: '',
        error: '暂不支持此服务',
        latency: 0,
      };
    });

    const translationResults = await Promise.all(translationPromises);
    setResults(translationResults);

    // 保存到历史记录
    if (translationResults.some((r) => !r.error)) {
      const historyItem: TranslationHistory = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        sourceText: inputText,
        sourceLang,
        targetLang,
        results: translationResults,
      };
      addHistory(historyItem);
    }

    setIsLoading(false);
  }, [inputText, sourceLang, targetLang, services, proxy, addHistory]);

  // 防抖处理
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (inputText.trim()) {
        performTranslation();
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, performTranslation]);

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleLoadFromHistory = (item: TranslationHistory) => {
    setInputText(item.sourceText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setResults(item.results);
    setShowHistory(false);
  };

  return (
    <ToolContainer
      title="多语言翻译"
      description="支持多翻译源对比的文本翻译工具"
    >
      <div className="space-y-4">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* 源语言选择 */}
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="auto">自动检测</option>
              {selectedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <span className="text-gray-500">→</span>

            {/* 目标语言选择 */}
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {selectedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-1" />
              历史
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              设置
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：输入区 */}
          <div className="lg:col-span-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              输入文本
            </label>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此输入要翻译的文本..."
              className="h-64 resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {inputText.length} 字符
            </div>
          </div>

          {/* 右侧：结果区 */}
          <div className="lg:col-span-2">
            {showHistory ? (
              <div className="border border-gray-200 rounded-lg h-80 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">翻译历史</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-40px)] p-2">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无历史记录</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                          onClick={() => handleLoadFromHistory(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleString()}
                              <span className="text-gray-400">
                                {item.sourceLang === 'auto'
                                  ? '自动'
                                  : item.sourceLang}{' '}
                                → {item.targetLang}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                              }}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-900 truncate">
                            {item.sourceText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  翻译结果
                  {isLoading && (
                    <span className="ml-2 text-xs text-primary-600">翻译中...</span>
                  )}
                </label>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((result) => (
                    <div
                      key={result.serviceId}
                      className={`border rounded-lg p-3 ${
                        result.error
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-700">
                          {result.serviceName}
                        </span>
                        <div className="flex items-center gap-2">
                          {result.error ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <>
                              <span className="text-xs text-gray-500">
                                {result.latency}ms
                              </span>
                              <CopyButton
                                text={result.translatedText}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {result.error ? (
                        <p className="text-sm text-red-600">{result.error}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {result.translatedText}
                          </p>
                          {result.detectedLang && sourceLang === 'auto' && (
                            <p className="text-xs text-gray-500">
                              检测到的语言: {result.detectedLang}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {results.length === 0 && !isLoading && !error && (
                  <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Languages className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>输入文本开始翻译</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </ToolContainer>
  );
}
