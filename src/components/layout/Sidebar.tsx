import { RefObject, useState } from 'react';
import { Search, FileJson, GitGraph, ArrowLeftRight, Globe, ChevronDown, Languages, Clock } from 'lucide-react';
import { useToolStore } from '../../stores/toolStore';
import { registry } from '../../core/registry';
import { ToolCategory } from '../../types';

const categoryIcons: Record<ToolCategory, typeof FileJson> = {
  formatter: FileJson,
  viewer: GitGraph,
  converter: ArrowLeftRight,
  network: Globe,
  translator: Languages,
  time: Clock,
};

const categoryNames: Record<ToolCategory, string> = {
  formatter: '格式化',
  viewer: '查看器',
  converter: '转换工具',
  network: '网络工具',
  translator: '翻译工具',
  time: '时间工具',
};

interface SidebarProps {
  searchInputRef: RefObject<HTMLInputElement>;
  onOpenShortcutHelp: () => void;
}

export function Sidebar({
  searchInputRef,
  onOpenShortcutHelp,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategory>>(
    new Set(['formatter', 'viewer', 'converter', 'network', 'translator', 'time'])
  );
  const { currentToolId, setCurrentTool } = useToolStore();

  const tools = searchQuery
    ? registry.searchTools(searchQuery)
    : registry.getAllTools();

  const groupedTools = tools.reduce((acc, tool) => {
    const cat = tool.meta.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<ToolCategory, typeof tools>);

  const toggleCategory = (cat: ToolCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <aside className="flex h-full w-72 flex-col overflow-hidden rounded-[30px] border border-border bg-sidebar text-fg shadow-panel backdrop-blur-xl">
      <div className="border-b border-border p-5">
        <div className="rounded-[22px] border border-border bg-card/10 p-4 backdrop-blur-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fg-muted">
            DevTools
          </p>
          <h1 className="mt-2 text-xl font-semibold text-fg-onAccent">开发工作台</h1>
          <p className="mt-2 text-sm leading-6 text-fg-secondary">
            常用调试、转换和查看工具集中在同一套导航里，切换更快。
          </p>
          <button
            type="button"
            onClick={onOpenShortcutHelp}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card/10 px-3 py-2 text-xs font-medium text-fg-secondary transition-colors hover:border-border-strong hover:bg-card/20 hover:text-fg-onAccent"
          >
            <span className="rounded-md border border-border bg-panel/40 px-1.5 py-0.5 text-[11px] text-fg-secondary">
              ?
            </span>
            查看快捷键
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-input py-3 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <p className="mt-3 px-1 text-xs text-fg-muted">
          {searchQuery ? `匹配 ${tools.length} 个工具` : '按分类浏览，或直接搜索名称与关键词'}
        </p>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {(Object.keys(groupedTools) as ToolCategory[]).map((category) => {
          const Icon = categoryIcons[category];
          const isExpanded = expandedCategories.has(category);
          const categoryTools = groupedTools[category];

          return (
            <div key={category}>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                  isExpanded
                    ? 'border-border-strong bg-card/15 text-fg-onAccent'
                    : 'border-transparent bg-transparent text-fg-secondary hover:border-border hover:bg-card/10 hover:text-fg-onAccent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-xl p-2 ${isExpanded ? 'bg-accent-soft text-accent' : 'bg-card/10 text-fg-secondary'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{categoryNames[category]}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                />
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-1 pl-3">
                  {categoryTools.map((tool) => (
                    <button
                      type="button"
                      key={tool.meta.id}
                      onClick={() => setCurrentTool(tool.meta.id)}
                      className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition-all ${
                        currentToolId === tool.meta.id
                          ? 'border-transparent bg-accent-gradient text-fg-onAccent shadow-panel'
                          : 'border-transparent text-fg-secondary hover:border-border hover:bg-card/12 hover:text-fg-onAccent'
                      }`}
                    >
                      <p className="font-medium">{tool.meta.name}</p>
                      <p className={`mt-1 truncate text-xs ${currentToolId === tool.meta.id ? 'text-white/80' : 'text-fg-muted'}`}>
                        {tool.meta.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
