import { Suspense, useCallback, useEffect, useRef } from 'react';
import { Keyboard, PanelLeftOpen } from 'lucide-react';
import { Button } from './components/common/Button';
import { Sidebar } from './components/layout/Sidebar';
import { registry } from './core/registry';
import { jsonFormatter } from './modules/json-formatter';
import { mermaidViewer } from './modules/mermaid-viewer';
import { dataConverter } from './modules/data-converter';
import { networkTools } from './modules/network-tools';
import { translator } from './modules/translator';
import { timestampConverter } from './modules/timestamp-converter';
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
    currentToolId,
    setCurrentTool,
    isSidebarOpen,
    isShortcutHelpOpen,
    setSidebarOpen,
    toggleSidebar,
    setShortcutHelpOpen,
    toggleShortcutHelp,
  } = useToolStore();

  useEffect(() => {
    if (!currentToolId) {
      setCurrentTool('json-formatter');
    }
  }, [currentToolId, setCurrentTool]);

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

  return (
    <div className="relative h-screen overflow-hidden p-3 sm:p-4">
      <div className="relative flex h-full gap-3 lg:gap-4">
        {isSidebarOpen && (
          <Sidebar
            searchInputRef={searchInputRef}
            onOpenShortcutHelp={() => setShortcutHelpOpen(true)}
          />
        )}

        <main className="app-shell-panel relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px]">
          {!isSidebarOpen && (
            <div className="app-shell-subtle-panel absolute left-5 top-5 z-20 flex items-center gap-3 rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  菜单导航
                </p>
                <p className="mt-1 text-sm text-slate-600">展开工具列表并恢复搜索入口</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeftOpen className="h-4 w-4" />
                <span>菜单</span>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                  Cmd/Ctrl + \
                </span>
              </Button>
            </div>
          )}

          <div className="app-shell-hairline border-b px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  开发工具工作台
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                  {currentToolMeta?.name ?? '选择工具开始'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {currentToolMeta?.description ?? '从左侧导航切换工具，快捷键面板会帮助你更快完成操作。'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-white/80 bg-white/[0.92] px-3 py-2 text-right md:block">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    壳层快捷键
                  </p>
                  <p className="mt-1 text-sm text-slate-600">`/` 聚焦搜索，`?` 查看帮助</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-xl bg-white/[0.65]"
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
                  <div className="app-shell-subtle-panel flex h-full items-center justify-center rounded-[26px] px-6 text-center text-slate-500">
                    正在加载工具...
                  </div>
                )}
              >
                <ToolComponent />
              </Suspense>
            ) : (
              <div className="app-shell-subtle-panel flex h-full items-center justify-center rounded-[26px] px-6 text-center text-slate-500">
                请从左侧选择一个工具
              </div>
            )}
          </div>
        </main>
      </div>

      {isShortcutHelpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/38 px-4"
          onClick={() => setShortcutHelpOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.22)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Command Palette
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">快捷键帮助</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
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
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{shortcut.description}</p>
                      <p className="mt-1 text-xs text-slate-500">应用壳层全局可用</p>
                    </div>
                    <kbd className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                      {shortcut.keys}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-500">
              按 <span className="font-medium text-slate-700">Esc</span> 也可以关闭当前面板。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
