# 应用壳层 UI 优化 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不修改工具业务逻辑的前提下，升级应用壳层的视觉层级，让侧边栏、主内容区、弹层和公共按钮形成统一的工作台外观。

**Architecture:** 保持现有 React + Tailwind 组件结构不变，主要通过 `App` 重组壳层视觉骨架，通过 `Sidebar` 强化导航面板，通过 `ToolContainer` 承载悬浮内容区，并在 `Button` 与全局样式中统一公共视觉语言。工具内部逻辑与状态不调整，只让现有页面自动继承新的壳层风格。

**Tech Stack:** React 18、TypeScript、Tailwind CSS、lucide-react、Vite

---

## Chunk 1: 外层视觉骨架

### Task 1: 为壳层增加全局背景和视觉变量

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 补充基础视觉变量和页面背景**

在 `@layer base` 中补充：

- 页面背景渐变
- 基础文字颜色
- `body` 的最小可视高度和字体平滑

同时增加少量可复用的壳层类名，用于：

- 玻璃质感面板
- 柔和描边
- 适度阴影

- [ ] **Step 2: 运行构建确认全局样式可编译**

Run: `npm run build`  
Expected: build 成功，无 CSS 或类型报错

### Task 2: 重组 `App` 的主布局骨架

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 为主内容区增加背景画布和装饰层**

要求：

- 保留现有快捷键逻辑
- 在最外层加入浅色渐变背景和柔和装饰块
- 不影响现有工具组件渲染

- [ ] **Step 2: 为主内容区增加顶部信息区**

要求：

- 左侧显示当前工具名称和 `meta.description`
- 右侧保留壳层操作入口
- 当未选择工具时显示兜底提示

- [ ] **Step 3: 优化侧边栏隐藏态入口和快捷键帮助弹层**

要求：

- 隐藏态入口改成悬浮控制卡片
- 快捷键弹层调整为更完整的卡片式层级
- 不改变原有打开/关闭行为

- [ ] **Step 4: 运行构建确认壳层骨架无报错**

Run: `npm run build`  
Expected: build 成功，`App` 布局和弹层正常编译

## Chunk 2: 侧边栏导航面板

### Task 3: 升级 `Sidebar` 的导航面板视觉

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 调整侧边栏外层面板和标题区**

要求：

- 侧边栏宽度略增
- 顶部增加产品说明
- 快捷键入口改成辅助按钮样式

- [ ] **Step 2: 调整搜索框样式和分组标题样式**

要求：

- 搜索框更像导航入口
- 分类图标、文字、箭头对齐更稳定
- 折叠态和展开态视觉更清楚

- [ ] **Step 3: 调整工具项高亮样式**

要求：

- 当前项有更明确的高亮块和边界
- 非当前项悬停时反馈更柔和
- 不改变切换逻辑

- [ ] **Step 4: 运行构建确认导航面板改动通过**

Run: `npm run build`  
Expected: build 成功，`Sidebar` 无类型或样式拼接错误

## Chunk 3: 公共容器与按钮统一

### Task 4: 升级 `ToolContainer` 的内容面板层级

**Files:**
- Modify: `src/components/layout/ToolContainer.tsx`

- [ ] **Step 1: 调整标题区为悬浮内容面板头部**

要求：

- 头部与内容区层级清楚
- 描述文案样式更稳定
- 保持 `layout="narrow"` 现有宽度策略

- [ ] **Step 2: 调整内容区留白、滚动区和容器边框**

要求：

- 内容区更像主工作面板
- 不压缩现有工具页面空间
- 保持整页高度和滚动可用

- [ ] **Step 3: 运行构建确认容器改动通过**

Run: `npm run build`  
Expected: build 成功，典型工具页容器无类型错误

### Task 5: 统一 `Button` 的公共视觉语言

**Files:**
- Modify: `src/components/common/Button.tsx`

- [ ] **Step 1: 调整主按钮、次按钮、幽灵按钮的基础样式**

要求：

- 统一圆角、阴影、边框和聚焦反馈
- 强调色更稳定
- 禁用态仍清晰可识别

- [ ] **Step 2: 确保尺寸和现有调用兼容**

要求：

- 保持 `sm / md / lg` 接口不变
- 不要求调用方同步修改逻辑

- [ ] **Step 3: 运行构建确认公共按钮兼容现有页面**

Run: `npm run build`  
Expected: build 成功，现有按钮调用无类型错误

### Task 6: 手工验证典型页面观感与交互

**Files:**
- Modify: 无

- [ ] **Step 1: 启动开发环境检查壳层层级**

Run: `npm run dev`  
Expected:

- 侧边栏、顶部信息区、内容面板层级清楚
- 背景装饰不影响阅读

- [ ] **Step 2: 检查典型工具页兼容性**

Run: `npm run dev`  
Expected:

- JSON 格式化页面的窄布局正常
- Mermaid 查看器的宽布局正常
- 网络工具页按钮和容器无明显错位

- [ ] **Step 3: 检查快捷键与弹层交互**

Run: `npm run dev`  
Expected:

- 侧边栏展开/收起正常
- 快捷键帮助弹层可正常打开和关闭
- 隐藏态入口可恢复侧边栏

- [ ] **Step 4: 保留工作区改动，等待用户确认是否需要提交**

说明：

- 本次任务默认完成实现和验证
- 是否提交由用户决定，不自动创建功能提交

---

## 附录：前端卡顿定位方法

### 1. 先判断卡顿类型

- 某个弹层、抽屉、菜单一打开就卡：优先怀疑遮罩、动画、`backdrop-filter`、大面积模糊、重阴影
- 首页一进入就卡：优先怀疑首包过大、重模块被提前加载、初始化副作用过多
- 输入、拖拽、滚动时卡：优先怀疑频繁 re-render、昂贵计算、布局抖动、长列表未优化

### 2. 优先收集的证据

- `Chrome DevTools -> Performance`
  - 录制一次“触发卡顿”的完整操作
  - 先看时间主要落在 `Scripting`、`Rendering` 还是 `Painting`
- `React DevTools -> Profiler`
  - 看单次交互是否触发了过多组件重复渲染
- `Network` 和构建产物
  - 看首页是否把本该懒加载的重模块带进主包
- `Rendering / Layers`
  - 看是否出现全屏重绘、层合成开销过大

### 3. 常见根因与代码信号

- 看到 `backdrop-blur`、大面积 `blur-*`、超重 `box-shadow`
  - 优先怀疑绘制和合成成本
- 看到顶层静态 `import` 了 Mermaid、编辑器、图表库
  - 优先怀疑首页首包过大
- 看到顶层共享状态一次更新影响大量组件
  - 优先怀疑 render 链过长
- 看到 `useEffect` 在开发环境重复注册、副作用打印重复告警
  - 优先检查 `StrictMode` 下副作用是否幂等

### 4. 推荐排查顺序

1. 先复现，并记录“哪个操作触发卡顿”
2. 用 `Performance` 录制一次，不先猜
3. 根据主耗时属于 `JS / Rendering / Painting` 缩小范围
4. 只做一个最小改动验证假设
5. 再次录制确认是否真的改善

### 5. 本次问题的实际定位过程

- 用户反馈首页首屏就卡，因此先排除工具内部交互，转查首页加载路径
- 发现 `App` 静态导入了所有工具组件，导致 Mermaid 等重模块进入首包
- 将工具组件改为按需懒加载后，首页主包显著下降
- 随后用户反馈“查看快捷键”仍明显卡
- 进一步检查弹层结构，发现打开时会挂载带 `backdrop-blur-sm` 的全屏遮罩
- 去掉全屏背景模糊后，弹层打开卡顿进一步缓解

### 6. 排查时应避免的做法

- 没有性能证据就直接改多处实现
- 把首包、重绘、重复渲染混在一起猜
- 一次改太多点，导致无法判断哪个改动真正生效
- 只看代码，不录制 `Performance`
