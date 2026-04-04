import { ServiceConfigs } from './types';

export const defaultServiceConfigs: ServiceConfigs = {
  mymemory: { enabled: true },
  lingva: { enabled: false },
  libretranslate: { enabled: false },
  baidu: { enabled: false },
  youdao: { enabled: false },
  microsoft: { enabled: false },
};

export function mergeServiceConfigs(
  persistedConfigs?: Partial<ServiceConfigs> | null
): ServiceConfigs {
  if (!persistedConfigs) {
    return { ...defaultServiceConfigs };
  }

  const mergedConfigs: ServiceConfigs = { ...defaultServiceConfigs };

  Object.entries(persistedConfigs).forEach(([serviceId, config]) => {
    mergedConfigs[serviceId] = {
      ...(mergedConfigs[serviceId] ?? { enabled: false }),
      ...config,
    };
  });

  return mergedConfigs;
}
