import { useCallback, useEffect, useRef } from 'react';
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
    registerTools();
    if (!currentToolId) {
      setCurrentTool('json-formatter');
    }
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

  return (
    <div className="flex h-screen bg-gray-50">
      {isSidebarOpen && (
        <Sidebar
          searchInputRef={searchInputRef}
          onOpenShortcutHelp={() => setShortcutHelpOpen(true)}
        />
      )}
      <main className="relative flex-1 overflow-hidden">
        {!isSidebarOpen && (
          <div className="absolute left-4 top-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/95 shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <span>展开菜单</span>
              <span className="text-xs text-gray-500">Cmd/Ctrl + \</span>
            </Button>
          </div>
        )}

        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            请从左侧选择一个工具
          </div>
        )}
      </main>

      {isShortcutHelpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
          onClick={() => setShortcutHelpOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">快捷键</h2>
                <p className="mt-1 text-sm text-slate-500">轻量壳层操作，只覆盖导航和搜索。</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShortcutHelpOpen(false)}
              >
                关闭
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm text-slate-700">{shortcut.description}</span>
                  <kbd className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-400">按 Esc 也可以关闭当前面板。</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
