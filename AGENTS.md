# AGENTS.md

## 项目概况
- 这是单包 `Vite + React + TypeScript + Zustand + TailwindCSS` 工具站，不是 monorepo。
- 应用入口是 `src/main.tsx`；主题初始化也在这里完成。
- 应用壳层与工具注册在 `src/App.tsx`。

## 常用命令
- 安装依赖：`npm install`
- 启动开发：`npm run dev`（Vite 固定端口 `13030`）
- 生产构建：`npm run build`
- 本地预览：`npm run preview`
- 仓库没有独立的 `lint`、`test`、`typecheck` 脚本；类型检查通过 `npm run build` 一并执行。

## 工具模块接入约定
- `src/modules/*` 是各个工具模块；每个模块通常在 `index.ts` 导出 `ToolModule`，组件通过 `lazy()` 懒加载。
- 只新增 `src/modules/<tool>` 不够，必须在 `src/App.tsx` 的 `registerTools()` 中手动注册，否则不会出现在界面。
- 左侧导航按 `ToolCategory` 分组，分类映射在 `src/components/layout/Sidebar.tsx`。
- 如果新增 `ToolCategory`，要同时更新 `src/types/index.ts` 和 `src/components/layout/Sidebar.tsx`。
- 路径别名只有 `@/* -> src/*`。

## 状态与持久化
- 主题和壳层状态会写入 `localStorage`：`devtools.theme.name`、`devtools.theme.mode`、`devtools.sidebar.open`。
- 翻译模块使用 Zustand persist，存储键是 `translator-storage`。
- 改翻译服务默认配置时，要兼容历史持久化数据；参考 `src/modules/translator/serviceConfig.ts` 与 `src/modules/translator/store.ts` 的合并逻辑。

## 测试与验证
- 不要假设 `npm test` 可用；仓库当前没有统一测试脚本。
- 现有测试在 `tests/translator/translator-service.test.mjs`，依赖 `/tmp/translator-test-dist` 下的编译产物，是定制流程。
- 常规前端改动的最低验证是 `npm run build`。
- 如果改翻译服务配置或服务实现，先检查现有 translator 测试是否需要同步。

## 搜索与文档
- 历史设计/实施文档在 `docs/superpowers/specs` 和 `docs/superpowers/plans`，改较大功能前先看相关文档。
- 仓库内有 `.claude/worktrees/` 副本，搜索代码时排除这些目录，避免误读工作树副本。
- 以 `package.json` 和实际源码为准；不要根据 `package-lock.json` 的残留依赖推断当前约定。
