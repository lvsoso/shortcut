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
    <aside className="flex h-full w-72 flex-col overflow-hidden rounded-[30px] border border-slate-900/80 bg-slate-900 text-slate-300 shadow-[0_6px_18px_-14px_rgba(15,23,42,0.28)]">
      <div className="border-b border-white/10 p-5">
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            DevTools
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">开发工作台</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            常用调试、转换和查看工具集中在同一套导航里，切换更快。
          </p>
          <button
            type="button"
            onClick={onOpenShortcutHelp}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
          >
            <span className="rounded-md border border-white/10 bg-slate-900/60 px-1.5 py-0.5 text-[11px] text-slate-300">
              ?
            </span>
            查看快捷键
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/35 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
        <p className="mt-3 px-1 text-xs text-slate-500">
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
                    ? 'border-white/10 bg-white/[0.08] text-white'
                    : 'border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-xl p-2 ${isExpanded ? 'bg-white/10' : 'bg-white/5'}`}>
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
                          ? 'border-primary-500/30 bg-primary-500/20 text-white shadow-[0_16px_28px_-20px_rgba(99,102,241,0.85)]'
                          : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <p className="font-medium">{tool.meta.name}</p>
                      <p className={`mt-1 truncate text-xs ${currentToolId === tool.meta.id ? 'text-primary-50/90' : 'text-slate-500'}`}>
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
