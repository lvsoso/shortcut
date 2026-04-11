import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Monitor, Moon, PanelLeftOpen, Sparkles, Sun } from 'lucide-react';
import { Button } from './components/common/Button';
import { Sidebar } from './components/layout/Sidebar';
import { registry } from './core/registry';
import { jsonFormatter } from './modules/json-formatter';
import { mermaidViewer } from './modules/mermaid-viewer';
import { dataConverter } from './modules/data-converter';
import { networkTools } from './modules/network-tools';
import { translator } from './modules/translator';
import { timestampConverter } from './modules/timestamp-converter';
import { useThemeStore } from './stores/themeStore';
import { useToolStore } from './stores/toolStore';

const shortcuts = [
  {
    keys: 'Cmd/Ctrl + \\',
    description: '切换侧边栏',
  },
  {
    keys: '/',
    description: '聚焦搜索',
  },
  {
    keys: '?',
    description: '查看快捷键',
  },
];

function registerTools() {
  registry.register(jsonFormatter);
  registry.register(mermaidViewer);
  registry.register(dataConverter);
  registry.register(networkTools);
  registry.register(translator);
  registry.register(timestampConverter);
}

registerTools();

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  return target.isContentEditable || Boolean(target.closest('[contenteditable="true"]'));
}

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusSearchRef = useRef(false);
  const {
    themeName,
    themeMode,
    setThemeName,
    setThemeMode,
  } = useThemeStore();
  const {
    currentToolId,
    setCurrentTool,
    isSidebarOpen,
    isShortcutHelpOpen,
    setSidebarOpen,
    toggleSidebar,
    setShortcutHelpOpen,
    toggleShortcutHelp,
  } = useToolStore();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (!currentToolId) {
      setCurrentTool('json-formatter');
    }
  }, [currentToolId, setCurrentTool]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      const input = searchInputRef.current;
      if (!input) return;

      input.focus();
      input.select();
    });
  }, []);

  useEffect(() => {
    if (!isSidebarOpen || !shouldFocusSearchRef.current) return;

    shouldFocusSearchRef.current = false;
    focusSearchInput();
  }, [focusSearchInput, isSidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === 'Backslash') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.key === 'Escape' && isShortcutHelpOpen) {
        event.preventDefault();
        setShortcutHelpOpen(false);
        return;
      }

      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        event.preventDefault();
        searchInputRef.current?.blur();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === '/' && !event.shiftKey) {
        event.preventDefault();
        setShortcutHelpOpen(false);

        if (!isSidebarOpen) {
          shouldFocusSearchRef.current = true;
          setSidebarOpen(true);
          return;
        }

        focusSearchInput();
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        toggleShortcutHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    focusSearchInput,
    isShortcutHelpOpen,
    isSidebarOpen,
    setShortcutHelpOpen,
    setSidebarOpen,
    toggleShortcutHelp,
    toggleSidebar,
  ]);

  const currentTool = currentToolId ? registry.getTool(currentToolId) : null;
  const ToolComponent = currentTool?.component;
  const currentToolMeta = currentTool?.meta;
  const isAnimeTheme = themeName === 'anime';

  return (
    <div className="relative h-screen overflow-hidden bg-app bg-app-gradient p-3 text-fg sm:p-4">
      <div className="relative flex h-full gap-3 lg:gap-4">
        {isSidebarOpen && (
          <Sidebar
            searchInputRef={searchInputRef}
            onOpenShortcutHelp={() => setShortcutHelpOpen(true)}
          />
        )}

        <main className="app-shell-panel relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px]">
          {!isSidebarOpen && (
            <div className="app-shell-subtle-panel absolute left-3 top-3 z-20 flex items-center gap-2.5 rounded-2xl px-3 py-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                  菜单导航
                </p>
                <p className="text-sm text-fg-secondary">展开工具列表并恢复搜索入口</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 rounded-xl px-3"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeftOpen className="h-4 w-4" />
                <span>菜单</span>
                <span className="rounded-lg bg-accent-soft px-2 py-1 text-[11px] text-fg-muted">
                  Cmd/Ctrl + \
                </span>
              </Button>
            </div>
          )}

          <div className="app-shell-hairline border-b px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fg-muted">
                  开发工具工作台
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[1.7rem]">
                    {currentToolMeta?.name ?? '选择工具开始'}
                  </h1>
                  {isAnimeTheme && (
                    <span className="anime-chip inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-fg-secondary">
                      <Sparkles className="h-3 w-3 text-accent" />
                      樱糖科技感
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-fg-secondary">
                  {currentToolMeta?.description ?? '从左侧导航切换工具，快捷键面板会帮助你更快完成操作。'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="hidden rounded-2xl border border-border bg-card px-3 py-1 text-right shadow-panel md:block">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                    壳层快捷键
                  </p>
                  <p className="text-sm text-fg-secondary">`/` 聚焦搜索，`?` 查看帮助</p>
                </div>
                <div className="hidden rounded-2xl border border-border bg-card px-3 py-1 text-right shadow-panel md:block">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                    北京时间
                  </p>
                  <p className="text-sm text-fg-secondary">
                    {new Intl.DateTimeFormat('zh-CN', {
                      timeZone: 'Asia/Shanghai',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    }).format(currentTime)}
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-border bg-card px-3 py-1 text-right shadow-panel md:block">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                    美国东部
                  </p>
                  <p className="text-sm text-fg-secondary">
                    {new Intl.DateTimeFormat('en-US', {
                      timeZone: 'America/New_York',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    }).format(currentTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1 shadow-panel">
                  <Button
                    variant={themeName === 'default' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => setThemeName('default')}
                  >
                    <Sun className="h-4 w-4" />
                    默认
                  </Button>
                  <Button
                    variant={themeName === 'anime' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => setThemeName('anime')}
                  >
                    <Sparkles className="h-4 w-4" />
                    二次元
                  </Button>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1 shadow-panel">
                  <Button
                    variant={themeMode === 'light' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setThemeMode('light')}
                    title="浅色模式"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={themeMode === 'dark' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setThemeMode('dark')}
                    title="深色模式"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={themeMode === 'system' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setThemeMode('system')}
                    title="跟随系统"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-xl bg-card/70"
                  onClick={() => setShortcutHelpOpen(true)}
                >
                  <Keyboard className="h-4 w-4" />
                  <span>快捷键</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
            {ToolComponent ? (
              <Suspense
                fallback={(
                  <div className="app-shell-subtle-panel flex h-full items-center justify-center rounded-[26px] px-6 text-center text-fg-muted">
                    正在加载工具...
                  </div>
                )}
              >
                <ToolComponent />
              </Suspense>
            ) : (
              <div className="app-shell-subtle-panel flex h-full items-center justify-center rounded-[26px] px-6 text-center text-fg-muted">
                请从左侧选择一个工具
              </div>
            )}
          </div>
        </main>
      </div>

      {isShortcutHelpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/46 px-4 backdrop-blur-sm"
          onClick={() => setShortcutHelpOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] border border-border bg-card p-6 text-fg shadow-panel sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fg-muted">
                  Command Palette
                </p>
                <h2 className="mt-2 text-xl font-semibold text-fg">快捷键帮助</h2>
                <p className="mt-2 text-sm leading-6 text-fg-secondary">
                  这组快捷键只覆盖壳层导航，不会替代各个工具自己的输入与编辑行为。
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setShortcutHelpOpen(false)}
              >
                关闭
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="rounded-2xl border border-border bg-panel px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-fg">{shortcut.description}</p>
                      <p className="mt-1 text-xs text-fg-muted">应用壳层全局可用</p>
                    </div>
                    <kbd className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-fg-secondary">
                      {shortcut.keys}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-border bg-panel px-4 py-3 text-xs leading-5 text-fg-muted">
              按 <span className="font-medium text-fg-secondary">Esc</span> 也可以关闭当前面板。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
