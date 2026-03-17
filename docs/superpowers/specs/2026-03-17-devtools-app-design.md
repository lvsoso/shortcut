# DevTools App 设计文档

**日期**: 2026-03-17
**类型**: Web 应用
**状态**: 设计完成，待实现

---

## 1. 项目概述

### 1.1 目标
开发一个开发者工具箱 Web 应用，提供 JSON 格式化、Mermaid 图查看、数据转换、网络工具等功能，支持模块化扩展。

### 1.2 核心原则
- **简洁高效**: 工具型应用，减少视觉干扰，快速完成任务
- **可扩展**: 支持模块、配置、插件三种扩展方式
- **类型安全**: TypeScript 全栈，减少运行时错误

---

## 2. 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 组件化开发，类型安全 |
| 构建 | Vite 5 | 快速 HMR，优化构建 |
| 样式 | Tailwind CSS | 原子化 CSS，快速开发 |
| 状态 | Zustand | 轻量状态管理 |
| 路由 | React Router | 工具路由管理 |
| Mermaid | mermaid.js 10 | 图表渲染 |
| 代码高亮 | Prism.js | 语法高亮 |

---

## 3. 架构设计

### 3.1 目录结构

```
src/
├── core/                    # 核心框架
│   ├── registry.ts          # 工具注册中心
│   ├── plugin-system.ts     # 插件系统
│   └── config-loader.ts     # 配置解析器
├── modules/                 # 内置工具模块
│   ├── json-formatter/      # JSON 格式化
│   │   ├── index.ts
│   │   ├── component.tsx
│   │   └── utils.ts
│   ├── mermaid-viewer/      # Mermaid 查看器
│   ├── data-converter/      # 数据转换工具
│   └── network-tools/       # 网络工具
├── components/              # 共享 UI 组件
│   ├── layout/
│   │   ├── Sidebar.tsx      # 侧边导航
│   │   ├── ToolContainer.tsx # 工具容器
│   │   └── Header.tsx       # 顶部栏
│   ├── common/
│   │   ├── Input.tsx        # 输入框
│   │   ├── Button.tsx       # 按钮
│   │   ├── TextArea.tsx     # 文本域
│   │   └── CopyButton.tsx   # 复制按钮
│   └── code/
│       ├── CodeEditor.tsx   # 代码编辑器
│       └── CodeViewer.tsx   # 代码查看器
├── hooks/                   # 自定义 Hooks
│   ├── useToolRegistry.ts
│   ├── useClipboard.ts
│   └── useLocalStorage.ts
├── stores/                  # 状态管理
│   └── toolStore.ts
├── types/                   # 类型定义
│   └── index.ts
├── utils/                   # 工具函数
│   └── index.ts
├── config/                  # 配置驱动工具定义
│   └── tools/
│       └── timestamp.yaml
├── plugins/                 # 插件目录（运行时加载）
└── App.tsx                  # 应用入口
```

### 3.2 核心类型定义

```typescript
// types/index.ts

// 工具分类
export type ToolCategory =
  | 'formatter'
  | 'viewer'
  | 'converter'
  | 'network'
  | 'plugin';

// 工具元数据
export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  order?: number;
}

// 工具模块接口
export interface ToolModule {
  meta: ToolMeta;
  component: React.ComponentType;
  config?: Record<string, unknown>;
}

// 插件清单
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  tools: ToolMeta[];
}

// 插件接口
export interface Plugin {
  manifest: PluginManifest;
  activate: (context: PluginContext) => void;
  deactivate?: () => void;
}

// 插件上下文
export interface PluginContext {
  registerTool: (tool: ToolModule) => void;
  unregisterTool: (toolId: string) => void;
  utils: {
    showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
    copyToClipboard: (text: string) => Promise<void>;
  };
}

// 配置驱动工具定义
export interface ConfigTool {
  id: string;
  name: string;
  category: ToolCategory;
  inputs: ConfigInput[];
  actions: ConfigAction[];
}

export interface ConfigInput {
  name: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface ConfigAction {
  id: string;
  label: string;
  transform: string; // 内置转换函数名或表达式
  outputType?: 'text' | 'json' | 'markdown';
}
```

### 3.3 注册中心设计

```typescript
// core/registry.ts

class ToolRegistry {
  private tools: Map<string, ToolModule> = new Map();
  private listeners: Set<() => void> = new Set();

  register(tool: ToolModule): void {
    if (this.tools.has(tool.meta.id)) {
      console.warn(`Tool ${tool.meta.id} already registered`);
      return;
    }
    this.tools.set(tool.meta.id, tool);
    this.notify();
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
    this.notify();
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

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}

export const registry = new ToolRegistry();
```

---

## 4. 功能模块设计

### 4.1 JSON 格式化 (json-formatter)

**功能**:
- 格式化/压缩 JSON
- 转义/反转义
- 树形结构查看
- 错误提示

**界面**:
```
┌─────────────────────────────────────────┐
│ JSON 格式化                              │
├─────────────────────────────────────────┤
│ [格式化] [压缩] [转义] [反转义] [复制]    │
├──────────────────┬──────────────────────┤
│                  │                      │
│   输入 JSON      │    输出结果           │
│                  │    （树形/文本切换）   │
│                  │                      │
│                  │                      │
├──────────────────┴──────────────────────┤
│ 状态: 有效 JSON / 错误: 第 X 行          │
└─────────────────────────────────────────┘
```

### 4.2 Mermaid 查看器 (mermaid-viewer)

**功能**:
- 实时渲染 Mermaid 图表
- 支持多种图表类型（流程图、时序图、类图等）
- 下载 PNG/SVG
- 示例模板

**界面**:
```
┌─────────────────────────────────────────┐
│ Mermaid 查看器                           │
├─────────────────────────────────────────┤
│ [流程图] [时序图] [类图] [甘特图] [更多]  │ [下载 PNG] [下载 SVG]
├──────────────────┬──────────────────────┤
│                  │                      │
│   Mermaid 语法    │    渲染结果          │
│   （支持编辑）     │    （可缩放）         │
│                  │                      │
├──────────────────┴──────────────────────┤
│ 示例: [基础流程图] [复杂时序图] [类图]    │
└─────────────────────────────────────────┘
```

### 4.3 数据转换 (data-converter)

**子工具**:
1. **Base64**: 编码/解码，支持 URL-safe 变体
2. **URL**: 编码/解码，支持完整 URL 或参数
3. **时间戳**: 时间戳与日期互转，支持多种格式
4. **哈希**: MD5、SHA1、SHA256（纯前端计算）

**界面模式**:
```
┌─────────────────────────────────────────┐
│ 数据转换 > Base64                        │
├─────────────────────────────────────────┤
│ [编码] [解码]                           │
│                                         │
│  输入:                                   │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  输出:                                   │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [复制结果] [清空]                       │
└─────────────────────────────────────────┘
```

### 4.4 网络工具 (network-tools)

**子工具**:
1. **JWT 解码**: 解码 Header、Payload，显示过期时间
2. **HTTP 请求**: 简易 HTTP 客户端，支持常见方法、Header、Body

**JWT 解码界面**:
```
┌─────────────────────────────────────────┐
│ 网络工具 > JWT 解码                      │
├─────────────────────────────────────────┤
│                                         │
│  JWT Token:                              │
│  ┌─────────────────────────────────┐    │
│  │ eyJhbGciOiJIUzI1NiIs...        │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│ Header:                                  │
│ { "alg": "HS256", "typ": "JWT" }         │
├─────────────────────────────────────────┤
│ Payload:                                 │
│ {                                        │
│   "sub": "1234567890",                   │
│   "exp": 1516239022  ⚠️ 已过期           │
│ }                                        │
├─────────────────────────────────────────┤
│ Signature: [已验证] / [未验证]            │
└─────────────────────────────────────────┘
```

---

## 5. 扩展机制实现

### 5.1 模块加载

```typescript
// modules/index.ts
import { registry } from '../core/registry';
import { jsonFormatter } from './json-formatter';
import { mermaidViewer } from './mermaid-viewer';
import { dataConverter } from './data-converter';
import { networkTools } from './network-tools';

export function loadBuiltInModules(): void {
  registry.register(jsonFormatter);
  registry.register(mermaidViewer);
  registry.register(dataConverter);
  registry.register(networkTools);
}
```

### 5.2 配置驱动加载

```typescript
// core/config-loader.ts
import yaml from 'js-yaml';
import { ConfigTool, ToolModule } from '../types';
import { ConfigDrivenTool } from '../components/ConfigDrivenTool';

const transformRegistry: Record<string, Function> = {
  timestampToISO: (ts: number) => new Date(ts * 1000).toISOString(),
  isoToTimestamp: (iso: string) => Math.floor(new Date(iso).getTime() / 1000),
  // ... 更多内置转换
};

export function loadConfigTool(configYaml: string): ToolModule {
  const config = yaml.load(configYaml) as ConfigTool;

  return {
    meta: {
      id: config.id,
      name: config.name,
      description: '',
      category: config.category,
      icon: 'settings',
      keywords: [],
    },
    component: () => ConfigDrivenTool({ config, transforms: transformRegistry }),
  };
}
```

### 5.3 插件系统

```typescript
// core/plugin-system.ts
import { Plugin, PluginContext } from '../types';
import { registry } from './registry';

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();

  async loadPlugin(url: string): Promise<void> {
    // 动态加载插件模块
    const module = await import(/* @vite-ignore */ url);
    const plugin: Plugin = module.default;

    if (!this.validatePlugin(plugin)) {
      throw new Error('Invalid plugin format');
    }

    const context: PluginContext = {
      registerTool: (tool) => registry.register(tool),
      unregisterTool: (id) => registry.unregister(id),
      utils: {
        showToast: (msg, type) => { /* ... */ },
        copyToClipboard: async (text) => { /* ... */ },
      },
    };

    plugin.activate(context);
    this.plugins.set(plugin.manifest.id, plugin);
  }

  unloadPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin?.deactivate) {
      plugin.deactivate();
    }
    this.plugins.delete(pluginId);
  }

  private validatePlugin(plugin: unknown): plugin is Plugin {
    // 验证插件结构
    return !!(
      plugin &&
      typeof (plugin as Plugin).manifest === 'object' &&
      typeof (plugin as Plugin).activate === 'function'
    );
  }
}
```

---

## 6. UI 设计规范

### 6.1 布局

- **侧边栏**: 宽度 240px，深色背景（gray-900）
- **主内容区**: 自适应宽度，浅色背景（gray-50）
- **工具卡片**: 最大宽度 1200px，居中

### 6.2 颜色

```
主色: indigo-600
背景: gray-50 (light) / gray-900 (dark sidebar)
边框: gray-200
文字: gray-900 (primary) / gray-600 (secondary)
错误: red-500
成功: green-500
```

### 6.3 交互

- 工具切换: 即时响应，保留输入状态（使用 localStorage）
- 复制反馈: Toast 提示
- 错误提示: 行内红色文字 + 图标

---

## 7. 开发计划

### 第一阶段: 基础框架
1. 项目初始化（Vite + React + Tailwind）
2. 注册中心实现
3. 基础布局组件（Sidebar、ToolContainer）
4. 路由集成

### 第二阶段: 核心工具
1. JSON 格式化
2. Mermaid 查看器
3. 数据转换（Base64、URL、时间戳）
4. JWT 解码

### 第三阶段: 扩展机制
1. 配置驱动工具支持
2. 插件系统基础实现
3. 插件开发文档

### 第四阶段: 完善
1. HTTP 请求工具
2. 哈希计算工具
3. 性能优化
4. 使用文档

---

## 8. 文件变更清单

**新增文件**:
- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/core/registry.ts`
- `src/core/plugin-system.ts`
- `src/core/config-loader.ts`
- `src/types/index.ts`
- `src/stores/toolStore.ts`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/ToolContainer.tsx`
- `src/components/common/Input.tsx`
- `src/components/common/Button.tsx`
- `src/components/common/TextArea.tsx`
- `src/components/code/CodeEditor.tsx`
- `src/modules/json-formatter/index.ts`
- `src/modules/json-formatter/component.tsx`
- `src/modules/mermaid-viewer/index.ts`
- `src/modules/mermaid-viewer/component.tsx`
- `src/modules/data-converter/index.ts`
- `src/modules/data-converter/component.tsx`
- `src/modules/network-tools/index.ts`
- `src/modules/network-tools/component.tsx`
- `src/utils/index.ts`
- `src/hooks/useClipboard.ts`
- `src/hooks/useLocalStorage.ts`
