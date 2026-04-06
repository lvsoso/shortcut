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
      return 'bg-state-success/15 text-state-success';
    case 'free-instance':
      return 'bg-state-warning/15 text-state-warning';
    case 'api-key':
      return 'bg-accent-soft text-fg-secondary';
    default:
      return 'bg-accent-soft text-fg-secondary';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/42 px-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-border bg-card text-fg shadow-panel">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-fg">翻译服务设置</h2>
          <button
            onClick={onClose}
            className="text-fg-muted transition-colors hover:text-fg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-40 overflow-y-auto border-r border-border bg-panel p-2">
            {TRANSLATION_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  activeTab === s.id
                    ? 'bg-accent-soft text-accent'
                    : 'text-fg-secondary hover:bg-panel/80'
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-fg-muted">
                  {TRANSLATION_SERVICE_KIND_LABELS[s.kind]}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {service && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-fg">{service.name}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getKindBadgeClass(service.kind)}`}
                    >
                      {TRANSLATION_SERVICE_KIND_LABELS[service.kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-fg-secondary">
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
                    className="rounded border-border"
                  />
                  <label htmlFor={`${service.id}-enabled`} className="text-sm text-fg-secondary">
                    启用此服务
                  </label>
                </div>

                {service.kind === 'free-instance' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-fg-secondary">
                      实例地址
                    </label>
                    <input
                      type="url"
                      value={config.instanceUrl || ''}
                      onChange={(e) =>
                        updateServiceConfig(service.id, { instanceUrl: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                      placeholder={getInstancePlaceholder(service.id)}
                    />
                    <p className="mt-1 text-xs text-fg-muted">
                      留空时使用内置实例，建议填你自己的可用实例地址。
                    </p>
                  </div>
                )}

                {service.requiresKey && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-fg-secondary">
                        API Key / App ID
                      </label>
                      <input
                        type="text"
                        value={config.apiKey || ''}
                        onChange={(e) =>
                          updateServiceConfig(service.id, { apiKey: e.target.value })
                        }
                        className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                        placeholder="输入 API Key"
                      />
                    </div>

                    {service.requiresSecret && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-fg-secondary">
                          Secret Key / 密钥
                        </label>
                        <input
                          type="password"
                          value={config.secretKey || ''}
                          onChange={(e) =>
                            updateServiceConfig(service.id, { secretKey: e.target.value })
                          }
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                          placeholder="输入 Secret Key"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-xl bg-panel p-3 text-xs text-fg-secondary">
                  <p className="mb-1 font-medium">支持的语言：</p>
                  <p>{service.languages.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-panel p-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
