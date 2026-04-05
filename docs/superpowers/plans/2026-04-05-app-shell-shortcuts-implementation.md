# 应用壳层快捷键 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为工具站增加轻量通用的全局壳层快捷键、侧边栏显示状态持久化，以及快捷键帮助面板。

**Architecture:** 在 `App` 层注册全局键盘事件并控制主布局，在 `toolStore` 中维护壳层状态，并通过 `Sidebar` 暴露搜索框聚焦能力。侧边栏隐藏时渲染轻量浮动恢复入口，帮助面板使用页面内专用覆盖层实现。

**Tech Stack:** React 18、TypeScript、Zustand、Tailwind CSS

---

## Chunk 1: 壳层状态与布局骨架

### Task 1: 扩展 `toolStore` 承载壳层状态

**Files:**
- Modify: `src/stores/toolStore.ts`

- [ ] **Step 1: 为 store 增加侧边栏和帮助面板状态**

新增以下状态和操作：

```ts
isSidebarOpen: boolean;
isShortcutHelpOpen: boolean;
setSidebarOpen: (open: boolean) => void;
toggleSidebar: () => void;
setShortcutHelpOpen: (open: boolean) => void;
toggleShortcutHelp: () => void;
```

- [ ] **Step 2: 在初始化时同步读取 `localStorage`**

使用固定 key `devtools.sidebar.open` 恢复侧边栏状态。  
读取失败或没有值时默认 `true`。

- [ ] **Step 3: 在 setter 中同步写回 `localStorage`**

只持久化 `isSidebarOpen`。  
`isShortcutHelpOpen` 不持久化。

- [ ] **Step 4: 运行构建验证类型通过**

Run: `npm run build`  
Expected: build 成功，store 类型无报错

### Task 2: 让 `App` 支持侧边栏隐藏后的主布局切换

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 从 store 读取壳层状态**

在 `App` 中读取：

- `isSidebarOpen`
- `isShortcutHelpOpen`
- 对应的 setter / toggle

- [ ] **Step 2: 根据 `isSidebarOpen` 条件渲染 `Sidebar`**

要求：

- 展开时维持当前左右布局
- 隐藏时主内容区占满宽度
- 不保留窄图标栏

- [ ] **Step 3: 在侧边栏隐藏时增加浮动恢复按钮**

按钮放在主内容区左上角，要求：

- 文案简短，例如“展开菜单”
- 点击后恢复侧边栏
- 带 `Cmd/Ctrl + \` 提示

- [ ] **Step 4: 运行构建确认壳层布局通过**

Run: `npm run build`  
Expected: build 成功，侧边栏条件渲染无类型错误

## Chunk 2: Sidebar 搜索聚焦与帮助面板

### Task 3: 为 `Sidebar` 暴露搜索框聚焦能力并补轻提示

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 给搜索框增加 ref**

为搜索输入框增加 `useRef<HTMLInputElement>`。

- [ ] **Step 2: 通过 `forwardRef` 或显式 prop 暴露聚焦方法**

目标能力：

- 聚焦输入框
- 选中已有搜索内容

优先选择最小改动方案，不额外抽 hooks。

- [ ] **Step 3: 增加轻量快捷键提示入口**

在标题区或搜索框附近增加弱提示，例如：

- `? 查看快捷键`

该入口点击后打开帮助面板。

- [ ] **Step 4: 运行构建确认 Sidebar 接口更新通过**

Run: `npm run build`  
Expected: build 成功，`Sidebar` 调用方同步完成

### Task 4: 在 `App` 中实现快捷键帮助面板

**Files:**
- Modify: `src/App.tsx`
- Reuse: `src/components/common/Button.tsx`

- [ ] **Step 1: 在 `App` 中增加帮助面板覆盖层 JSX**

面板要求：

- 页面内覆盖层
- 列出 3 组快捷键
- 有关闭按钮
- 点击遮罩可关闭

- [ ] **Step 2: 接入 `isShortcutHelpOpen` 状态**

要求：

- 状态为 `true` 时显示
- 刷新页面后默认关闭

- [ ] **Step 3: 运行构建确认面板结构无报错**

Run: `npm run build`  
Expected: build 成功，帮助面板可正常编译

## Chunk 3: 全局快捷键与回归验证

### Task 5: 在 `App` 注册全局快捷键

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 增加输入态过滤函数**

过滤以下焦点目标：

- `input`
- `textarea`
- `select`
- `contenteditable`

该过滤只用于 `/` 和 `?`。

- [ ] **Step 2: 注册 `Cmd/Ctrl + \` 侧边栏切换**

要求：

- 全局生效
- 切换后同步更新 store 和 `localStorage`

- [ ] **Step 3: 注册 `/` 搜索聚焦**

要求：

- 非输入态时触发
- 侧边栏隐藏时先展开
- 再通过 `requestAnimationFrame` 聚焦并选中搜索框

- [ ] **Step 4: 注册 `?` 帮助面板切换和 `Esc` 关闭**

要求：

- `?` 在非输入态下打开或关闭帮助面板
- `Esc` 只负责关闭帮助面板
- 不影响工具页面自己的 `Esc` 行为，前提是帮助面板未打开

- [ ] **Step 5: 运行完整构建验证**

Run: `npm run build`  
Expected: build 成功，无新的类型或打包问题

### Task 6: 手工回归壳层快捷键

**Files:**
- Modify: 无

- [ ] **Step 1: 手工验证侧边栏切换与持久化**

Run: `npm run dev`  
Expected:

- `Cmd/Ctrl + \` 可以切换侧边栏
- 刷新后保持上次侧边栏状态
- 侧边栏隐藏时浮动恢复按钮可用

- [ ] **Step 2: 手工验证搜索聚焦**

Run: `npm run dev`  
Expected:

- `/` 可聚焦搜索框
- 侧边栏隐藏时会先展开再聚焦

- [ ] **Step 3: 手工验证帮助面板**

Run: `npm run dev`  
Expected:

- `?` 可以打开和关闭帮助面板
- 点击遮罩、关闭按钮、按 `Esc` 都可关闭

- [ ] **Step 4: 手工验证输入态冲突规避**

Run: `npm run dev`  
Expected:

- 在搜索框输入 `/`、`?` 不触发全局快捷键
- 在 Mermaid 编辑区输入 `/`、`?` 不触发全局快捷键

- [ ] **Step 5: 提交本次壳层快捷键实现**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx src/stores/toolStore.ts
git commit -m "feat(shell): 增加全局快捷键与侧边栏持久化"
```
