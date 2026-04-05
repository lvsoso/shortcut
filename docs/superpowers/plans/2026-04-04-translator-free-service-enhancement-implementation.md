# 翻译免费服务增强实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为翻译页面新增 `Lingva` 免 Key 服务，并补齐免费服务分类、实例地址配置和持久化兼容。

**Architecture:** 保持现有翻译模块结构不变，在服务层新增 `Lingva` 请求封装，在状态层补充实例地址和持久化合并逻辑，在设置面板中暴露服务分类与实例地址输入。为新增的纯逻辑补最小单元测试，UI 变化通过构建验证。

**Tech Stack:** React + TypeScript + Zustand + Node built-in test runner + TypeScript CLI

---

## 文件结构

- Modify: `src/modules/translator/types.ts`
- Modify: `src/modules/translator/constants.ts`
- Modify: `src/modules/translator/store.ts`
- Modify: `src/modules/translator/Translator.tsx`
- Modify: `src/modules/translator/SettingsPanel.tsx`
- Create: `src/modules/translator/lingvaTranslate.ts`
- Create: `tests/translator/translator-service.test.mjs`

---

## Chunk 1: 纯逻辑与测试

### Task 1: 先为新增逻辑写失败用例

**Files:**
- Create: `tests/translator/translator-service.test.mjs`

- [ ] **Step 1: 写 `mergeServiceConfigs` 用例**

验证旧持久化配置缺少 `lingva` 时会自动补默认值，并保留已有配置。

- [ ] **Step 2: 写 `translateWithLingva` 用例**

验证用户自定义 `instanceUrl` 会被规范化后请求正确接口，并在成功时返回翻译结果。

- [ ] **Step 3: 跑测试确认失败**

运行：

```bash
rm -rf /tmp/translator-test-dist && ./node_modules/.bin/tsc --outDir /tmp/translator-test-dist --module commonjs --moduleResolution node --target es2020 --lib es2020,dom src/modules/translator/types.ts src/modules/translator/constants.ts src/modules/translator/store.ts src/modules/translator/lingvaTranslate.ts && node --test tests/translator/translator-service.test.mjs
```

Expected: 因缺少 `lingvaTranslate.ts` 或缺少导出函数而失败

## Chunk 2: 服务层与状态层

### Task 2: 实现服务元数据、实例地址和持久化兼容

**Files:**
- Modify: `src/modules/translator/types.ts`
- Modify: `src/modules/translator/constants.ts`
- Modify: `src/modules/translator/store.ts`
- Create: `src/modules/translator/lingvaTranslate.ts`

- [ ] **Step 1: 扩展服务类型和配置结构**

增加服务分类字段和 `instanceUrl`。

- [ ] **Step 2: 新增 `Lingva` 服务定义和预置实例**

保持 `MyMemory` 默认启用，`Lingva` 与 `LibreTranslate` 默认关闭。

- [ ] **Step 3: 实现 `mergeServiceConfigs`**

确保旧持久化配置会补上 `lingva` 默认值，同时保留已有启用状态和 key 配置。

- [ ] **Step 4: 实现 `translateWithLingva`**

支持：

- 语言代码映射
- 自定义实例地址优先
- URL 规范化
- 明确错误提示

- [ ] **Step 5: 重跑测试确认通过**

运行 Task 1 的测试命令，Expected: PASS

## Chunk 3: UI 接入与验证

### Task 3: 接入翻译页面和设置面板

**Files:**
- Modify: `src/modules/translator/Translator.tsx`
- Modify: `src/modules/translator/SettingsPanel.tsx`
- Modify: `src/modules/translator/store.ts`

- [ ] **Step 1: 在主页面接入 `Lingva` 调用**

并让 `LibreTranslate` 读取用户配置的实例地址。

- [ ] **Step 2: 在设置面板显示服务分类和实例地址输入框**

只对 `Lingva`、`LibreTranslate` 展示实例地址输入。

- [ ] **Step 3: 验证构建**

运行：

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 4: 手工检查关键行为**

检查：

- `MyMemory` 默认启用
- `Lingva` 可手动启用
- 实例地址可输入并持久化
- 失败文案指向“切换实例”
