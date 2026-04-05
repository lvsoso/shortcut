# Mermaid 查看器布局重构 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将共享工具容器改成默认全宽，并把 Mermaid 查看器重构为“预览优先、编辑按需出现”的抽屉式布局。

**Architecture:** 共享层只扩展 `ToolContainer` 的宽度模式，不承载 Mermaid 专属交互。Mermaid 页面内部单独管理轻工具栏、编辑抽屉、预览画布、错误态和移动端编辑层。现有表单型工具按需显式切回窄版布局，避免默认全宽带来散乱感。

**Tech Stack:** React 18、TypeScript、Tailwind CSS、Mermaid、lucide-react

---

## Chunk 1: 共享容器宽度模式

### Task 1: 为 `ToolContainer` 增加 `full / narrow` 布局能力

**Files:**
- Modify: `src/components/layout/ToolContainer.tsx`

- [ ] **Step 1: 给 `ToolContainer` 的 props 增加布局字段**

将 `ToolContainerProps` 扩展为显式支持布局模式，例如：

```ts
type ToolContainerLayout = 'full' | 'narrow';

interface ToolContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  layout?: ToolContainerLayout;
}
```

- [ ] **Step 2: 把共享容器默认宽度改成全宽**

保留页面头部和滚动容器结构，但移除固定 `max-w-5xl mx-auto`，改为按 `layout` 决定内容宽度：

```tsx
const contentClassName = layout === 'narrow'
  ? 'max-w-5xl mx-auto'
  : 'w-full';
```

默认值设为 `full`。

- [ ] **Step 3: 运行构建确认共享组件改动没有引入类型错误**

Run: `npm run build`
Expected: build 成功，`ToolContainer` 新增属性未导致类型报错

- [ ] **Step 4: 提交这一小步**

```bash
git add src/components/layout/ToolContainer.tsx
git commit -m "refactor(layout): 为工具容器增加宽度模式"
```

### Task 2: 让现有表单型工具显式使用窄版布局

**Files:**
- Modify: `src/modules/json-formatter/JsonFormatter.tsx`
- Modify: `src/modules/data-converter/DataConverter.tsx`
- Modify: `src/modules/network-tools/NetworkTools.tsx`
- Modify: `src/modules/timestamp-converter/TimestampConverter.tsx`
- Modify: `src/modules/translator/Translator.tsx`

- [ ] **Step 1: 为 JSON、数据转换、网络工具、时间戳工具的 `ToolContainer` 显式传入 `layout=\"narrow\"`**

这四个页面都属于输入/输出型表单工具，目标是保留现有阅读密度，不受共享容器默认全宽影响。

- [ ] **Step 2: 为翻译页面的 `ToolContainer` 显式传入 `layout=\"narrow\"`**

只改 `ToolContainer` 调用处，不顺手重构翻译模块内部布局。  
注意当前工作区里翻译模块有其他未提交改动，修改时只做最小增量，不覆盖现有改动。

- [ ] **Step 3: 运行构建确认所有调用点都通过**

Run: `npm run build`
Expected: 所有 `ToolContainer` 使用方通过类型检查，页面可正常编译

- [ ] **Step 4: 手工检查几个代表性表单页面**

Run: `npm run dev`
Expected:
- JSON 格式化仍维持窄版双栏
- 时间戳转换仍维持窄版卡片布局
- 翻译页面未因为默认全宽而出现明显散乱

- [ ] **Step 5: 提交这一小步**

```bash
git add src/modules/json-formatter/JsonFormatter.tsx src/modules/data-converter/DataConverter.tsx src/modules/network-tools/NetworkTools.tsx src/modules/timestamp-converter/TimestampConverter.tsx src/modules/translator/Translator.tsx
git commit -m "refactor(layout): 为表单工具显式启用窄版容器"
```

## Chunk 2: Mermaid 状态与渲染逻辑

### Task 3: 清理旧的双栏拖拽状态，建立新的页面状态模型

**Files:**
- Modify: `src/modules/mermaid-viewer/MermaidViewer.tsx`

- [ ] **Step 1: 删除旧的分栏拖拽状态和事件**

移除以下旧状态和逻辑：

- `splitRatio`
- `isDragging`
- `splitContainerRef`
- 与分割条拖拽相关的 `mousedown / mousemove / mouseup`

保留并继续使用：

- Mermaid 渲染状态
- 缩放和平移状态
- 下载逻辑

- [ ] **Step 2: 新增页面布局所需状态**

至少补充这些状态：

```ts
const [isEditorOpen, setIsEditorOpen] = useState(false);
const [lastSuccessfulSvg, setLastSuccessfulSvg] = useState('');
```

如有需要，可以增加移动端判断或编辑层开关状态，但不要引入过度抽象。

- [ ] **Step 3: 重写渲染成功/失败逻辑**

目标行为：

- 成功时同时更新 `svg` 和 `lastSuccessfulSvg`
- 失败时保留 `lastSuccessfulSvg`
- 首次渲染失败且没有成功结果时，才让主画布进入错误占位态

建议将“当前画布实际展示的 svg”收敛成单一表达式，避免 JSX 中分支分散。

- [ ] **Step 4: 运行构建确认状态改造通过**

Run: `npm run build`
Expected: Mermaid 页面状态重构后仍能通过编译

- [ ] **Step 5: 提交这一小步**

```bash
git add src/modules/mermaid-viewer/MermaidViewer.tsx
git commit -m "refactor(mermaid): 重构页面状态与渲染容错"
```

## Chunk 3: Mermaid 预览优先布局

### Task 4: 将 Mermaid 页面改成“轻工具栏 + 全宽画布”

**Files:**
- Modify: `src/modules/mermaid-viewer/MermaidViewer.tsx`

- [ ] **Step 1: 去掉首屏常驻模板按钮区**

删除当前位于主区域顶部的示例按钮行，不再让模板入口占用首屏。

- [ ] **Step 2: 重建顶部轻工具栏**

工具栏至少包含：

- `编辑` / `收起编辑`
- 缩小
- 当前缩放比例
- 放大
- 重置
- 下载

工具栏要保持紧凑，不再使用现在这种“标题下方再堆一层控件区”的结构。

- [ ] **Step 3: 重建主画布区域**

目标结构：

- 一个全宽主画布容器
- 默认居中显示图表
- 空状态时显示简洁提示和 `开始编辑`
- 边框和背景弱化，降低表单感

- [ ] **Step 4: 保留现有缩放和平移能力**

继续支持：

- 按钮缩放
- `Ctrl/Cmd + 滚轮` 缩放
- 平移模式拖拽
- 重置视图

不要在这一步顺手改变原有快捷行为。

- [ ] **Step 5: 运行构建确认布局替换完成**

Run: `npm run build`
Expected: Mermaid 页面编译通过，旧双栏结构已移除

- [ ] **Step 6: 提交这一小步**

```bash
git add src/modules/mermaid-viewer/MermaidViewer.tsx
git commit -m "feat(mermaid): 切换为预览优先布局"
```

### Task 5: 实现桌面端左侧编辑抽屉和移动端编辑层

**Files:**
- Modify: `src/modules/mermaid-viewer/MermaidViewer.tsx`

- [ ] **Step 1: 为桌面端实现左侧编辑抽屉**

抽屉要求：

- 固定宽度，不支持拖拽
- 打开时左侧滑出
- 关闭时预览恢复全宽
- 顶部包含标题和关闭按钮

- [ ] **Step 2: 将示例模板移入抽屉**

模板区只在编辑态展示，点击模板后直接替换当前代码。  
不要在主画布或工具栏上再放重复入口。

- [ ] **Step 3: 为移动端改成覆盖式全屏编辑层**

处理方式可以基于断点 class 或条件渲染，但结果必须是：

- 小屏下不是左侧抽屉
- 而是覆盖式全屏编辑界面

- [ ] **Step 4: 调整错误提示展示位置**

目标：

- 有最近一次成功渲染时，错误提示放在工具栏下或抽屉内
- 没有成功渲染结果时，允许画布显示错误占位

- [ ] **Step 5: 手工回归 Mermaid 页面核心交互**

Run: `npm run dev`
Expected:
- 默认进入看图模式
- 点击 `编辑` 可打开抽屉
- 抽屉内可以编辑代码并实时更新图
- 输入非法语法时，旧图仍保留，错误提示可见
- 空代码时可以通过 `开始编辑` 进入编辑
- 缩放、重置、下载仍可用
- 移动端宽度下切换为全屏编辑层

- [ ] **Step 6: 提交这一小步**

```bash
git add src/modules/mermaid-viewer/MermaidViewer.tsx
git commit -m "feat(mermaid): 增加抽屉编辑与移动端编辑层"
```

## Chunk 4: 收尾验证

### Task 6: 做最终构建与回归检查

**Files:**
- Verify only

- [ ] **Step 1: 跑完整构建**

Run: `npm run build`
Expected: TypeScript 和 Vite 构建全部成功

- [ ] **Step 2: 对照 spec 做手工检查**

对照 `docs/superpowers/specs/2026-04-04-mermaid-viewer-layout-design.md` 逐项确认：

- `ToolContainer` 默认全宽
- 表单工具显式窄版
- Mermaid 默认预览优先
- 示例模板进入编辑抽屉
- 错误态保留最近一次成功图
- 移动端编辑入口切为全屏层

- [ ] **Step 3: 只在确认无误后再决定是否整理提交**

如果用户要求保留本地改动，不额外提交；如果用户要求提交，再按模块边界整理 commit。
