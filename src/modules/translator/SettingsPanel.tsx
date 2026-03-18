import { useState } from 'react';
import { Settings, X, Plus, Globe, Shield } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useTranslatorStore } from './store';
import { Language } from './types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    services,
    updateService,
    selectedLanguages,
    setSelectedLanguages,
    proxy,
    setProxy,
  } = useTranslatorStore();

  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');

  if (!isOpen) return null;

  const handleAddLanguage = () => {
    if (newLangCode && newLangName) {
      const newLang: Language = {
        code: newLangCode.toLowerCase(),
        name: newLangName,
        nativeName: newLangName,
      };
      setSelectedLanguages([...selectedLanguages, newLang]);
      setNewLangCode('');
      setNewLangName('');
    }
  };

  const handleRemoveLanguage = (code: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l.code !== code));
  };

  const handleToggleService = (id: string, enabled: boolean) => {
    updateService(id, { enabled });
  };

  const handleUpdateApiKey = (id: string, apiKey: string) => {
    updateService(id, { apiKey });
  };

  const handleUpdateApiUrl = (id: string, apiUrl: string) => {
    updateService(id, { apiUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            翻译设置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* 翻译服务配置 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">翻译服务</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        onChange={(e) =>
                          handleToggleService(service.id, e.target.checked)
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900">
                        {service.name}
                      </span>
                      {service.type === 'apiKey' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          需 API Key
                        </span>
                      )}
                      {service.id === 'baidu' && service.enabled && (
                        <span className="text-xs text-gray-500">格式: appId:secretKey</span>
                      )}
                      {service.id === 'youdao' && service.enabled && (
                        <span className="text-xs text-gray-500">格式: appKey:secretKey</span>
                      )}
                      {service.id === 'microsoft' && service.enabled && (
                        <span className="text-xs text-gray-500">格式: key:region(可选)</span>
                      )}
                    </div>
                  </div>

                  {service.enabled && (
                    <div className="ml-6 space-y-2">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          API 地址
                        </label>
                        <input
                          type="text"
                          value={service.apiUrl || ''}
                          onChange={(e) =>
                            handleUpdateApiUrl(service.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://..."
                        />
                      </div>
                      {service.type === 'apiKey' && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={service.apiKey || ''}
                            onChange={(e) =>
                              handleUpdateApiKey(service.id, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="输入 API Key"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 语言列表 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              语言列表
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLanguages.map((lang) => (
                <span
                  key={lang.code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {lang.name} ({lang.code})
                  <button
                    onClick={() => handleRemoveLanguage(lang.code)}
                    className="hover:text-primary-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLangCode}
                onChange={(e) => setNewLangCode(e.target.value)}
                placeholder="语言代码 (如: pl)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
                placeholder="语言名称 (如: 波兰语)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button onClick={handleAddLanguage} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              使用 ISO 639-1 语言代码（如: en, zh, ja）
            </p>
          </section>

          {/* 代理配置 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              代理配置
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={proxy.enabled}
                  onChange={(e) =>
                    setProxy({ ...proxy, enabled: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">启用代理</span>
              </div>

              {proxy.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      代理主机
                    </label>
                    <input
                      type="text"
                      value={proxy.host}
                      onChange={(e) =>
                        setProxy({ ...proxy, host: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="127.0.0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      端口
                    </label>
                    <input
                      type="number"
                      value={proxy.port}
                      onChange={(e) =>
                        setProxy({ ...proxy, port: parseInt(e.target.value) || 8080 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="8080"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
