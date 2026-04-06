import { create } from 'zustand';

export type ThemeName = 'default' | 'anime';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

const THEME_NAME_STORAGE_KEY = 'devtools.theme.name';
const THEME_MODE_STORAGE_KEY = 'devtools.theme.mode';

function isBrowser() {
  return typeof window !== 'undefined';
}

function readThemeNamePreference(): ThemeName {
  if (!isBrowser()) {
    return 'default';
  }

  try {
    const storedValue = window.localStorage.getItem(THEME_NAME_STORAGE_KEY);
    return storedValue === 'anime' ? 'anime' : 'default';
  } catch {
    return 'default';
  }
}

function readThemeModePreference(): ThemeMode {
  if (!isBrowser()) {
    return 'system';
  }

  try {
    const storedValue = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (storedValue === 'light' || storedValue === 'dark' || storedValue === 'system') {
      return storedValue;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

function writeThemeNamePreference(themeName: ThemeName) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(THEME_NAME_STORAGE_KEY, themeName);
  } catch {
    // 本地存储失败时只跳过持久化，不影响当前会话状态。
  }
}

function writeThemeModePreference(themeMode: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
  } catch {
    // 本地存储失败时只跳过持久化，不影响当前会话状态。
  }
}

function resolveThemeMode(themeMode: ThemeMode): ResolvedThemeMode {
  if (!isBrowser()) {
    return 'light';
  }

  if (themeMode !== 'system') {
    return themeMode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeAttributes(themeName: ThemeName, themeMode: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = themeName;
  root.dataset.mode = resolveThemeMode(themeMode);
}

let systemThemeMediaQuery: MediaQueryList | null = null;
let removeSystemThemeListener: (() => void) | null = null;

function bindSystemThemeListener(themeMode: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  if (!systemThemeMediaQuery) {
    systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  if (removeSystemThemeListener) {
    removeSystemThemeListener();
    removeSystemThemeListener = null;
  }

  if (themeMode !== 'system') {
    return;
  }

  const handleSystemThemeChange = () => {
    const { themeName, themeMode: currentMode } = useThemeStore.getState();
    if (currentMode !== 'system') {
      return;
    }
    applyThemeAttributes(themeName, currentMode);
  };

  if (typeof systemThemeMediaQuery.addEventListener === 'function') {
    systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
    removeSystemThemeListener = () => {
      systemThemeMediaQuery?.removeEventListener('change', handleSystemThemeChange);
    };
    return;
  }

  systemThemeMediaQuery.addListener(handleSystemThemeChange);
  removeSystemThemeListener = () => {
    systemThemeMediaQuery?.removeListener(handleSystemThemeChange);
  };
}

export function initializeTheme() {
  const themeName = readThemeNamePreference();
  const themeMode = readThemeModePreference();
  applyThemeAttributes(themeName, themeMode);
  bindSystemThemeListener(themeMode);
}

interface ThemeState {
  themeName: ThemeName;
  themeMode: ThemeMode;
  setThemeName: (themeName: ThemeName) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: readThemeNamePreference(),
  themeMode: readThemeModePreference(),
  setThemeName: (themeName) => {
    writeThemeNamePreference(themeName);
    applyThemeAttributes(themeName, useThemeStore.getState().themeMode);
    set({ themeName });
  },
  setThemeMode: (themeMode) => {
    writeThemeModePreference(themeMode);
    applyThemeAttributes(useThemeStore.getState().themeName, themeMode);
    bindSystemThemeListener(themeMode);
    set({ themeMode });
  },
}));

export function getResolvedThemeMode(themeMode: ThemeMode): ResolvedThemeMode {
  return resolveThemeMode(themeMode);
}
