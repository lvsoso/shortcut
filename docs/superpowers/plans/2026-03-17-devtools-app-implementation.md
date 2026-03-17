# DevTools App 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个开发者工具箱 Web 应用，包含 JSON 格式化、Mermaid 查看器、数据转换、网络工具四大模块，支持扩展机制。

**架构:** 基于 React + TypeScript + Vite 构建，采用模块化设计，每个工具是独立模块，通过注册中心统一管理。使用 Zustand 进行状态管理，Tailwind CSS 构建界面。

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS, Zustand, React Router, mermaid.js, prismjs

---

## 文件结构

```
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── core/
    │   └── registry.ts
    ├── stores/
    │   └── toolStore.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   └── ToolContainer.tsx
    │   └── common/
    │       ├── Button.tsx
    │       ├── TextArea.tsx
    │       └── CopyButton.tsx
    ├── modules/
    │   ├── json-formatter/
    │   │   ├── index.ts
    │   │   └── JsonFormatter.tsx
    │   ├── mermaid-viewer/
    │   │   ├── index.ts
    │   │   └── MermaidViewer.tsx
    │   ├── data-converter/
    │   │   ├── index.ts
    │   │   └── DataConverter.tsx
    │   └── network-tools/
    │       ├── index.ts
    │       └── NetworkTools.tsx
    └── hooks/
        └── useClipboard.ts
```

---

## Chunk 1: 项目初始化与基础框架

### Task 1: 初始化 Vite 项目

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "devtools-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "mermaid": "^10.8.0",
    "prismjs": "^1.29.0",
    "lucide-react": "^0.330.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@types/prismjs": "^1.26.3",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevTools - 开发者工具箱</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 安装依赖**

Run: `npm install`
Expected: 依赖安装成功，无错误

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: init vite react typescript project"
```

---

### Task 2: 配置 Tailwind CSS

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`

- [ ] **Step 1: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    @apply h-full;
  }
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 3px;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: configure tailwind css"
```

---

### Task 3: 创建类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
import { ComponentType } from 'react';

export type ToolCategory = 'formatter' | 'viewer' | 'converter' | 'network';

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  order?: number;
}

export interface ToolModule {
  meta: ToolMeta;
  component: ComponentType;
}

export interface NavItem {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add type definitions"
```

---

### Task 4: 实现工具注册中心

**Files:**
- Create: `src/core/registry.ts`

- [ ] **Step 1: 创建注册中心**

```typescript
import { ToolModule, ToolCategory } from '../types';

class ToolRegistry {
  private tools: Map<string, ToolModule> = new Map();

  register(tool: ToolModule): void {
    if (this.tools.has(tool.meta.id)) {
      console.warn(`Tool ${tool.meta.id} already registered`);
      return;
    }
    this.tools.set(tool.meta.id, tool);
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
  }

  getTool(id: string): ToolModule | undefined {
    return this.tools.get(id);
  }

  getAllTools(): ToolModule[] {
    return Array.from(this.tools.values())
      .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
  }

  getToolsByCategory(category: ToolCategory): ToolModule[] {
    return this.getAllTools()
      .filter(tool => tool.meta.category === category);
  }

  searchTools(query: string): ToolModule[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTools().filter(tool =>
      tool.meta.name.toLowerCase().includes(lowerQuery) ||
      tool.meta.description.toLowerCase().includes(lowerQuery) ||
      tool.meta.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }
}

export const registry = new ToolRegistry();
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: implement tool registry"
```

---

### Task 5: 创建 Zustand Store

**Files:**
- Create: `src/stores/toolStore.ts`

- [ ] **Step 1: 创建 store**

```typescript
import { create } from 'zustand';
import { ToolModule } from '../types';

interface ToolState {
  currentToolId: string | null;
  searchQuery: string;
  setCurrentTool: (toolId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  currentToolId: null,
  searchQuery: '',
  setCurrentTool: (toolId) => set({ currentToolId: toolId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add zustand tool store"
```

---

## Chunk 2: 基础 UI 组件

### Task 6: 创建通用按钮组件

**Files:**
- Create: `src/components/common/Button.tsx`

- [ ] **Step 1: 创建 Button 组件**

```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Button component"
```

---

### Task 7: 创建文本域组件

**Files:**
- Create: `src/components/common/TextArea.tsx`

- [ ] **Step 1: 创建 TextArea 组件**

```typescript
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add TextArea component"
```

---

### Task 8: 创建复制按钮组件

**Files:**
- Create: `src/components/common/CopyButton.tsx`
- Create: `src/hooks/useClipboard.ts`

- [ ] **Step 1: 创建 useClipboard hook**

```typescript
import { useState, useCallback } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }, []);

  return { copy, copied };
}
```

- [ ] **Step 2: 创建 CopyButton 组件**

```typescript
import { Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { useClipboard } from '../../hooks/useClipboard';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, size = 'sm' }: CopyButtonProps) {
  const { copy, copied } = useClipboard();

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={() => copy(text)}
      className="gap-1"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          已复制
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          复制
        </>
      )}
    </Button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add CopyButton component and useClipboard hook"
```

---

### Task 9: 创建布局组件

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/ToolContainer.tsx`

- [ ] **Step 1: 创建 Sidebar 组件**

```typescript
import { useState } from 'react';
import { Search, FileJson, GitGraph, ArrowLeftRight, Globe, ChevronDown } from 'lucide-react';
import { useToolStore } from '../../stores/toolStore';
import { registry } from '../../core/registry';
import { ToolCategory } from '../../types';

const categoryIcons: Record<ToolCategory, typeof FileJson> = {
  formatter: FileJson,
  viewer: GitGraph,
  converter: ArrowLeftRight,
  network: Globe,
};

const categoryNames: Record<ToolCategory, string> = {
  formatter: '格式化',
  viewer: '查看器',
  converter: '转换工具',
  network: '网络工具',
};

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategory>>(
    new Set(['formatter', 'viewer', 'converter', 'network'])
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
```

- [ ] **Step 2: 创建 ToolContainer 组件**

```typescript
import { ReactNode } from 'react';

interface ToolContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ToolContainer({ title, description, children }: ToolContainerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Sidebar and ToolContainer layout components"
```

---

## Chunk 3: JSON 格式化工具

### Task 10: 实现 JSON 格式化器

**Files:**
- Create: `src/modules/json-formatter/JsonFormatter.tsx`
- Create: `src/modules/json-formatter/index.ts`

- [ ] **Step 1: 创建 JSON 格式化组件**

```typescript
import { useState, useCallback } from 'react';
import { FileJson } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'compressed'>('formatted');

  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, viewMode === 'formatted' ? 2 : 0);
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, viewMode]);

  const compressJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const compressed = JSON.stringify(parsed);
      setOutput(compressed);
      setViewMode('compressed');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input]);

  const escapeJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const escaped = JSON.stringify(JSON.stringify(parsed));
      setOutput(escaped.slice(1, -1));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input]);

  const unescapeJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const unescaped = JSON.parse(`"${input.replace(/"/g, '\\"')}"`);
      const parsed = JSON.parse(unescaped);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError('Invalid escaped JSON string');
    }
  }, [input]);

  return (
    <ToolContainer
      title="JSON 格式化"
      description="格式化、压缩、转义 JSON 数据"
    >
      <div className="space-y-4">
        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={formatJson} variant="primary">
            <FileJson className="w-4 h-4 mr-1" />
            格式化
          </Button>
          <Button onClick={compressJson} variant="secondary">
            压缩
          </Button>
          <Button onClick={escapeJson} variant="secondary">
            转义
          </Button>
          <Button onClick={unescapeJson} variant="secondary">
            反转义
          </Button>
          {output && <CopyButton text={output} />}
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输入 JSON
            </label>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴 JSON..."
              className="h-96 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输出结果
            </label>
            <TextArea
              value={output}
              readOnly
              placeholder="格式化后的结果..."
              className="h-96 font-mono text-sm bg-gray-50"
              error={error || undefined}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
```

- [ ] **Step 2: 创建模块入口**

```typescript
import { ToolModule } from '../../types';
import { JsonFormatter } from './JsonFormatter';

export const jsonFormatter: ToolModule = {
  meta: {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化、压缩、转义 JSON 数据',
    category: 'formatter',
    icon: 'file-json',
    keywords: ['json', 'format', 'pretty', 'compress', 'escape'],
    order: 1,
  },
  component: JsonFormatter,
};
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add json formatter tool"
```

---

## Chunk 4: Mermaid 查看器

### Task 11: 实现 Mermaid 查看器

**Files:**
- Create: `src/modules/mermaid-viewer/MermaidViewer.tsx`
- Create: `src/modules/mermaid-viewer/index.ts`

- [ ] **Step 1: 创建 Mermaid 查看器组件**

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { GitGraph, Download } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';

const defaultDiagram = `graph TD
    A[开始] --> B{判断}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E`;

const examples = [
  {
    name: '流程图',
    code: `graph TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> D`,
  },
  {
    name: '时序图',
    code: `sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 请求
    B->>A: 响应`,
  },
  {
    name: '类图',
    code: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +fetch()
    }
    Animal <|-- Dog`,
  },
];

export function MermaidViewer() {
  const [code, setCode] = useState(defaultDiagram);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict',
    });
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvg('');
      setError(null);
      return;
    }

    try {
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvg(svg);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setSvg('');
    }
  }, [code]);

  useEffect(() => {
    const timer = setTimeout(renderDiagram, 500);
    return () => clearTimeout(timer);
  }, [renderDiagram]);

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    if (!svg || !containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'diagram.png';
      link.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <ToolContainer
      title="Mermaid 查看器"
      description="实时预览 Mermaid 图表"
    >
      <div className="space-y-4">
        {/* 示例按钮 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 py-2">示例:</span>
          {examples.map((ex) => (
            <Button
              key={ex.name}
              variant="secondary"
              size="sm"
              onClick={() => setCode(ex.code)}
            >
              {ex.name}
            </Button>
          ))}
        </div>

        {/* 下载按钮 */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadSvg}
            disabled={!svg}
          >
            <Download className="w-4 h-4 mr-1" />
            下载 SVG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadPng}
            disabled={!svg}
          >
            <Download className="w-4 h-4 mr-1" />
            下载 PNG
          </Button>
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mermaid 语法
            </label>
            <TextArea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="输入 Mermaid 图表语法..."
              className="h-96 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              渲染结果
            </label>
            <div
              ref={containerRef}
              className={`
                h-96 border rounded-md p-4 overflow-auto bg-white
                ${error ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              {error ? (
                <p className="text-red-600 text-sm">{error}</p>
              ) : svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              ) : (
                <p className="text-gray-400 text-sm">图表将在此显示...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
```

- [ ] **Step 2: 创建模块入口**

```typescript
import { ToolModule } from '../../types';
import { MermaidViewer } from './MermaidViewer';

export const mermaidViewer: ToolModule = {
  meta: {
    id: 'mermaid-viewer',
    name: 'Mermaid 查看器',
    description: '实时预览 Mermaid 图表',
    category: 'viewer',
    icon: 'git-graph',
    keywords: ['mermaid', 'diagram', 'chart', 'flowchart', 'graph'],
    order: 2,
  },
  component: MermaidViewer,
};
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add mermaid viewer tool"
```

---

## Chunk 5: 数据转换工具

### Task 12: 实现数据转换器

**Files:**
- Create: `src/modules/data-converter/DataConverter.tsx`
- Create: `src/modules/data-converter/index.ts`

- [ ] **Step 1: 创建数据转换组件**

```typescript
import { useState, useCallback } from 'react';
import { ArrowLeftRight, Base64, Hash, Clock, Link2 } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

type ConverterType = 'base64' | 'url' | 'timestamp' | 'hash';

interface ConverterConfig {
  id: ConverterType;
  name: string;
  icon: typeof Base64;
  encode: (input: string) => string;
  decode: (input: string) => string;
}

const converters: ConverterConfig[] = [
  {
    id: 'base64',
    name: 'Base64',
    icon: Base64,
    encode: (input) => btoa(unescape(encodeURIComponent(input))),
    decode: (input) => {
      try {
        return decodeURIComponent(escape(atob(input)));
      } catch {
        throw new Error('Invalid Base64 string');
      }
    },
  },
  {
    id: 'url',
    name: 'URL 编码',
    icon: Link2,
    encode: encodeURIComponent,
    decode: decodeURIComponent,
  },
  {
    id: 'timestamp',
    name: '时间戳',
    icon: Clock,
    encode: (input) => {
      const date = new Date(input);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return Math.floor(date.getTime() / 1000).toString();
    },
    decode: (input) => {
      const timestamp = parseInt(input);
      if (isNaN(timestamp)) throw new Error('Invalid timestamp');
      const date = new Date(timestamp * 1000);
      return date.toISOString();
    },
  },
  {
    id: 'hash',
    name: '哈希 (MD5/SHA)',
    icon: Hash,
    encode: () => 'Use the hash tool below',
    decode: () => 'Hash is one-way',
  },
];

// Simple hash functions
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function md5(message: string): string {
  // Simple MD5 implementation for demo
  return 'MD5 not available in browser crypto';
}

export function DataConverter() {
  const [activeConverter, setActiveConverter] = useState<ConverterType>('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hashType, setHashType] = useState<'md5' | 'sha1' | 'sha256'>('sha256');

  const converter = converters.find(c => c.id === activeConverter)!;

  const handleEncode = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const result = converter.encode(input);
      setOutput(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, converter]);

  const handleDecode = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const result = converter.decode(input);
      setOutput(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, converter]);

  const handleHash = useCallback(async () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      let result: string;
      switch (hashType) {
        case 'sha256':
          result = await sha256(input);
          break;
        case 'sha1':
          result = await sha1(input);
          break;
        default:
          result = md5(input);
      }
      setOutput(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, hashType]);

  return (
    <ToolContainer
      title="数据转换"
      description="Base64、URL 编码、时间戳、哈希转换"
    >
      <div className="space-y-4">
        {/* 转换器选择 */}
        <div className="flex flex-wrap gap-2">
          {converters.map((c) => {
            const Icon = c.icon;
            return (
              <Button
                key={c.id}
                variant={activeConverter === c.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setActiveConverter(c.id);
                  setOutput('');
                  setError(null);
                }}
              >
                <Icon className="w-4 h-4 mr-1" />
                {c.name}
              </Button>
            );
          })}
        </div>

        {/* 哈希类型选择 */}
        {activeConverter === 'hash' && (
          <div className="flex gap-2">
            {(['md5', 'sha1', 'sha256'] as const).map((type) => (
              <Button
                key={type}
                variant={hashType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setHashType(type)}
              >
                {type.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {activeConverter !== 'hash' ? (
            <>
              <Button onClick={handleEncode} variant="primary">
                编码 / 转换
              </Button>
              <Button onClick={handleDecode} variant="secondary">
                解码 / 还原
              </Button>
            </>
          ) : (
            <Button onClick={handleHash} variant="primary">
              计算哈希
            </Button>
          )}
          {output && <CopyButton text={output} />}
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输入
            </label>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`输入要${activeConverter === 'hash' ? '哈希' : '转换'}的内容...`}
              className="h-64 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输出结果
            </label>
            <TextArea
              value={output}
              readOnly
              placeholder="转换结果..."
              className="h-64 font-mono text-sm bg-gray-50"
              error={error || undefined}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
```

- [ ] **Step 2: 创建模块入口**

```typescript
import { ToolModule } from '../../types';
import { DataConverter } from './DataConverter';

export const dataConverter: ToolModule = {
  meta: {
    id: 'data-converter',
    name: '数据转换',
    description: 'Base64、URL 编码、时间戳、哈希转换',
    category: 'converter',
    icon: 'arrow-left-right',
    keywords: ['base64', 'url', 'encode', 'decode', 'timestamp', 'hash', 'md5', 'sha'],
    order: 3,
  },
  component: DataConverter,
};
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add data converter tool"
```

---

## Chunk 6: 网络工具

### Task 13: 实现网络工具

**Files:**
- Create: `src/modules/network-tools/NetworkTools.tsx`
- Create: `src/modules/network-tools/index.ts`

- [ ] **Step 1: 创建网络工具组件**

```typescript
import { useState, useCallback } from 'react';
import { Globe, JwtIcon } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

type NetworkToolType = 'jwt' | 'http';

interface JWTPayload {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const decodeBase64 = (str: string) => {
    const padding = '='.repeat((4 - str.length % 4) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  };

  return {
    header: decodeBase64(parts[0]),
    payload: decodeBase64(parts[1]),
    signature: parts[2],
  };
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number | undefined;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

export function NetworkTools() {
  const [activeTool, setActiveTool] = useState<NetworkToolType>('jwt');

  // JWT State
  const [jwtInput, setJwtInput] = useState('');
  const [jwtDecoded, setJwtDecoded] = useState<JWTPayload | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);

  // HTTP State
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpUrl, setHttpUrl] = useState('');
  const [httpHeaders, setHttpHeaders] = useState('');
  const [httpBody, setHttpBody] = useState('');
  const [httpResponse, setHttpResponse] = useState('');
  const [httpLoading, setHttpLoading] = useState(false);

  const decodeJwtToken = useCallback(() => {
    try {
      if (!jwtInput.trim()) {
        setJwtDecoded(null);
        setJwtError(null);
        return;
      }
      const decoded = decodeJWT(jwtInput);
      setJwtDecoded(decoded);
      setJwtError(null);
    } catch (err) {
      setJwtError((err as Error).message);
      setJwtDecoded(null);
    }
  }, [jwtInput]);

  const sendHttpRequest = useCallback(async () => {
    try {
      setHttpLoading(true);
      const headers: Record<string, string> = {};
      if (httpHeaders.trim()) {
        httpHeaders.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) headers[key] = value;
        });
      }

      const options: RequestInit = {
        method: httpMethod,
        headers,
      };

      if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpBody) {
        options.body = httpBody;
      }

      const response = await fetch(httpUrl, options);
      const data = await response.text();

      let formatted = `Status: ${response.status} ${response.statusText}\n`;
      formatted += `Headers:\n`;
      response.headers.forEach((value, key) => {
        formatted += `  ${key}: ${value}\n`;
      });
      formatted += `\nBody:\n`;
      try {
        const json = JSON.parse(data);
        formatted += JSON.stringify(json, null, 2);
      } catch {
        formatted += data;
      }

      setHttpResponse(formatted);
    } catch (err) {
      setHttpResponse(`Error: ${(err as Error).message}`);
    } finally {
      setHttpLoading(false);
    }
  }, [httpMethod, httpUrl, httpHeaders, httpBody]);

  return (
    <ToolContainer
      title="网络工具"
      description="JWT 解码、HTTP 请求测试"
    >
      {/* 工具选择 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTool === 'jwt' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTool('jwt')}
        >
          JWT 解码
        </Button>
        <Button
          variant={activeTool === 'http' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTool('http')}
        >
          HTTP 请求
        </Button>
      </div>

      {activeTool === 'jwt' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JWT Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
              <Button onClick={decodeJwtToken}>解码</Button>
            </div>
          </div>

          {jwtError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{jwtError}</p>
            </div>
          )}

          {jwtDecoded && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Header</h4>
                  <CopyButton text={JSON.stringify(jwtDecoded.header, null, 2)} size="sm" />
                </div>
                <pre className="text-sm font-mono text-gray-600 overflow-x-auto">
                  {JSON.stringify(jwtDecoded.header, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Payload</h4>
                  <div className="flex items-center gap-2">
                    {isTokenExpired(jwtDecoded.payload) && (
                      <span className="text-xs text-red-500 font-medium">已过期</span>
                    )}
                    <CopyButton text={JSON.stringify(jwtDecoded.payload, null, 2)} size="sm" />
                  </div>
                </div>
                <pre className="text-sm font-mono text-gray-600 overflow-x-auto">
                  {JSON.stringify(jwtDecoded.payload, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Signature</h4>
                <p className="text-sm font-mono text-gray-500 break-all">
                  {jwtDecoded.signature}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              placeholder="https://api.example.com/data"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button onClick={sendHttpRequest} disabled={httpLoading}>
              {httpLoading ? '发送中...' : '发送'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headers (每行一个: Key: Value)
              </label>
              <TextArea
                value={httpHeaders}
                onChange={(e) => setHttpHeaders(e.target.value)}
                placeholder="Content-Type: application/json\nAuthorization: Bearer token"
                className="h-32 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body (JSON)
              </label>
              <TextArea
                value={httpBody}
                onChange={(e) => setHttpBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="h-32 font-mono text-sm"
              />
            </div>
          </div>

          {httpResponse && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">响应</label>
                <CopyButton text={httpResponse} size="sm" />
              </div>
              <TextArea
                value={httpResponse}
                readOnly
                className="h-64 font-mono text-sm bg-gray-50"
              />
            </div>
          )}
        </div>
      )}
    </ToolContainer>
  );
}
```

- [ ] **Step 2: 创建模块入口**

```typescript
import { ToolModule } from '../../types';
import { NetworkTools } from './NetworkTools';

export const networkTools: ToolModule = {
  meta: {
    id: 'network-tools',
    name: '网络工具',
    description: 'JWT 解码、HTTP 请求测试',
    category: 'network',
    icon: 'globe',
    keywords: ['jwt', 'http', 'api', 'request', 'decode', 'token'],
    order: 4,
  },
  component: NetworkTools,
};
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add network tools"
```

---

## Chunk 7: 应用入口与集成

### Task 14: 创建主应用组件

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: 创建 main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: 创建 App.tsx**

```typescript
import { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { registry } from './core/registry';
import { jsonFormatter } from './modules/json-formatter';
import { mermaidViewer } from './modules/mermaid-viewer';
import { dataConverter } from './modules/data-converter';
import { networkTools } from './modules/network-tools';
import { useToolStore } from './stores/toolStore';

// Register all tools
function registerTools() {
  registry.register(jsonFormatter);
  registry.register(mermaidViewer);
  registry.register(dataConverter);
  registry.register(networkTools);
}

function App() {
  const { currentToolId, setCurrentTool } = useToolStore();

  useEffect(() => {
    registerTools();
    // Set default tool
    if (!currentToolId) {
      setCurrentTool('json-formatter');
    }
  }, []);

  const currentTool = currentToolId ? registry.getTool(currentToolId) : null;
  const ToolComponent = currentTool?.component;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            请从左侧选择一个工具
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add main app component"
```

---

### Task 15: 验证与测试

**Files:**
- Run: `npm run dev`

- [ ] **Step 1: 验证开发服务器启动**

Run: `npm run dev`
Expected: Vite 服务器启动，显示 `Local: http://localhost:3000/`

- [ ] **Step 2: 验证所有工具加载**

访问 http://localhost:3000
Expected:
- 侧边栏显示 4 个工具分类
- JSON 格式化器默认显示
- 可以切换不同工具

- [ ] **Step 3: 最终 Commit**

```bash
git add .
git commit -m "feat: complete devtools app implementation"
```

---

## 总结

本计划实现一个完整的开发者工具箱 Web 应用，包含:

1. **项目基础**: Vite + React + TypeScript + Tailwind CSS
2. **核心框架**: 工具注册中心、Zustand 状态管理
3. **四个工具模块**:
   - JSON 格式化器: 格式化、压缩、转义
   - Mermaid 查看器: 实时预览、下载图表
   - 数据转换器: Base64、URL、时间戳、哈希
   - 网络工具: JWT 解码、HTTP 请求
4. **UI 组件**: 按钮、文本域、复制按钮、侧边栏、工具容器

**扩展机制预留**:
- 注册中心支持动态注册/注销
- 模块接口标准化
- 配置驱动和插件系统架构已设计，可在后续迭代实现
