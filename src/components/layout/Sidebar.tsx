import { useState } from 'react';
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

export function Sidebar() {
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
    <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-white">DevTools</h1>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {(Object.keys(groupedTools) as ToolCategory[]).map((category) => {
          const Icon = categoryIcons[category];
          const isExpanded = expandedCategories.has(category);
          const categoryTools = groupedTools[category];

          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-gray-800 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{categoryNames[category]}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                />
              </button>

              {isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {categoryTools.map((tool) => (
                    <button
                      key={tool.meta.id}
                      onClick={() => setCurrentTool(tool.meta.id)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                        currentToolId === tool.meta.id
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      {tool.meta.name}
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
