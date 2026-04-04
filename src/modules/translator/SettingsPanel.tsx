import { useState } from 'react';
import { useTranslatorStore } from './store';
import {
  LIBRETRANSLATE_INSTANCES,
  LINGVA_INSTANCES,
  TRANSLATION_SERVICE_KIND_LABELS,
  TRANSLATION_SERVICES,
} from './constants';
import { defaultServiceConfigs } from './serviceConfig';
import { Button } from '../../components/common/Button';
import { TranslationServiceKind } from './types';

interface SettingsPanelProps {
  onClose: () => void;
}

function getKindBadgeClass(kind: TranslationServiceKind) {
  switch (kind) {
    case 'free-default':
      return 'bg-emerald-50 text-emerald-700';
    case 'free-instance':
      return 'bg-amber-50 text-amber-700';
    case 'api-key':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getInstancePlaceholder(serviceId: string) {
  if (serviceId === 'lingva') {
    return LINGVA_INSTANCES[0];
  }

  if (serviceId === 'libretranslate') {
    return LIBRETRANSLATE_INSTANCES[0];
  }

  return 'https://example.com';
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { serviceConfigs, updateServiceConfig } = useTranslatorStore();
  const [activeTab, setActiveTab] = useState(TRANSLATION_SERVICES[0]?.id || 'mymemory');

  const service = TRANSLATION_SERVICES.find((s) => s.id === activeTab);
  const config = serviceConfigs[activeTab]
    || defaultServiceConfigs[activeTab]
    || { enabled: false };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">翻译服务设置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧服务列表 */}
          <div className="w-40 border-r bg-gray-50 p-2 overflow-y-auto">
            {TRANSLATION_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  activeTab === s.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">
                  {TRANSLATION_SERVICE_KIND_LABELS[s.kind]}
                </div>
              </button>
            ))}
          </div>

          {/* 右侧配置 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {service && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getKindBadgeClass(service.kind)}`}
                    >
                      {TRANSLATION_SERVICE_KIND_LABELS[service.kind]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${service.id}-enabled`}
                    checked={config.enabled}
                    onChange={(e) =>
                      updateServiceConfig(service.id, { enabled: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`${service.id}-enabled`} className="text-sm">
                    启用此服务
                  </label>
                </div>

                {service.kind === 'free-instance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      实例地址
                    </label>
                    <input
                      type="url"
                      value={config.instanceUrl || ''}
                      onChange={(e) =>
                        updateServiceConfig(service.id, { instanceUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder={getInstancePlaceholder(service.id)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      留空时使用内置实例，建议填你自己的可用实例地址。
                    </p>
                  </div>
                )}

                {service.requiresKey && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key / App ID
                      </label>
                      <input
                        type="text"
                        value={config.apiKey || ''}
                        onChange={(e) =>
                          updateServiceConfig(service.id, { apiKey: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="输入 API Key"
                      />
                    </div>

                    {service.requiresSecret && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Key / 密钥
                        </label>
                        <input
                          type="password"
                          value={config.secretKey || ''}
                          onChange={(e) =>
                            updateServiceConfig(service.id, { secretKey: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="输入 Secret Key"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <p className="font-medium mb-1">支持的语言：</p>
                  <p>{service.languages.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <Button variant="secondary" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
