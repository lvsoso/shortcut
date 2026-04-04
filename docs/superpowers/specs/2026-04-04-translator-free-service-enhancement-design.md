# 翻译模块免费服务增强设计文档

**日期**: 2026-04-04  
**状态**: 设计已确认，待实现

## 1. 背景

当前翻译页面已经接入 `MyMemory` 和 `LibreTranslate` 两个免 Key 方案，以及百度、有道、微软三个需 Key 方案。

现阶段的主要问题不是“完全没有免费服务”，而是免费服务的可用性和产品表达不够清晰：

- `MyMemory` 可直接使用，但匿名额度有限
- `LibreTranslate` 依赖公共实例，可用性和 CORS 表现不稳定
- 设置面板没有明确区分“默认免费”“社区实例”“需 Key”
- 用户无法方便地切换社区实例地址

本次设计目标是在不重构整体翻译模块的前提下，补充一个新的免 Key 服务，并把免费服务策略和设置项整理清楚。

## 2. 目标

### 2.1 功能目标

- 新增一个免 Key 翻译服务 `Lingva`
- 保持 `MyMemory` 为默认启用的免费服务
- 保留 `LibreTranslate`，但明确标注为社区实例方案
- 允许用户为 `Lingva` 和 `LibreTranslate` 自定义实例地址
- 服务失败时给出更明确、可操作的提示文案

### 2.2 非目标

- 不把页面改成单一聚合翻译器
- 不新增代理功能
- 不实现复杂的实例管理界面
- 不重构整个翻译模块的组件结构

## 3. 方案对比

### 方案 A：新增 `Lingva`，保留现有多服务对比模式

这是推荐方案。

优点：

- 改动范围小，符合现有“多服务并行对比”的产品形态
- `MyMemory` 继续承担默认免费入口
- `Lingva` 补足一个额外的免 Key 选择
- 后续如果继续加 `Apertium` 或自建实例，结构可以复用

缺点：

- `Lingva` 同样依赖社区实例，可用性不保证

### 方案 B：仅优化现有免费服务文案和默认策略

优点：

- 实现成本最低

缺点：

- 无法增加新的免费能力
- 用户仍然只有 `MyMemory` 和 `LibreTranslate` 两个免 Key 选择

### 方案 C：新增“免费翻译聚合器”

优点：

- 用户只需点击一次，系统自动尝试多个免费服务

缺点：

- 与当前“对比多个翻译结果”的页面定位冲突
- 失败原因不透明
- 需要额外设计优先级和兜底逻辑

## 4. 最终设计

### 4.1 服务策略

翻译服务继续保留“多服务并行对比”的模式，每个服务独立开关，互不影响。

默认启用策略如下：

| 服务 | 类型 | 默认状态 |
|------|------|----------|
| MyMemory | 默认免费 | 启用 |
| Lingva | 社区实例 / 可自建 | 关闭 |
| LibreTranslate | 社区实例 / 可自建 | 关闭 |
| 百度翻译 | 需 Key | 关闭 |
| 有道翻译 | 需 Key | 关闭 |
| 微软翻译 | 需 Key | 关闭 |

行为约束：

- 页面初始化后默认只有 `MyMemory` 可用
- 用户可以手动开启 `Lingva`、`LibreTranslate` 做并行对比
- 单个服务失败不影响其他服务返回结果

### 4.2 服务分类文案

设置面板中对服务属性做显式区分：

- `MyMemory`：`默认免费`
- `Lingva`：`社区实例 / 可自建`
- `LibreTranslate`：`社区实例 / 可自建`
- 百度 / 有道 / 微软：`需 API Key`

服务描述文案调整为直接可理解的用户语言：

- `MyMemory`：免 Key，可直接使用，匿名额度有限
- `Lingva`：免 Key，依赖实例可用性，支持自定义实例
- `LibreTranslate`：免 Key，依赖实例可用性，部分实例可能受限

### 4.3 设置面板

设置面板继续使用现有结构，不拆新组件，仅做增量增强。

需要补充的能力：

- 免费服务排在前面展示
- `Lingva` 新增单独页签
- `Lingva` 和 `LibreTranslate` 在配置区显示实例地址输入框
- 如果用户未填写实例地址，则使用内置预置实例
- 用户填写实例地址后，优先使用用户配置

不做复杂能力：

- 不做实例列表管理
- 不做健康检查按钮
- 不做实例测速

### 4.4 请求行为

点击“翻译”后，继续并行调用所有已启用的服务。

请求处理规则：

- 使用 `AbortController` 取消旧请求，避免竞态覆盖
- `Lingva` 和 `LibreTranslate` 优先读取用户配置的 `instanceUrl`
- 如果 `instanceUrl` 为空，使用代码内置的预置实例
- 为不同服务保留独立语言代码映射，避免直接复用统一下拉值导致请求失败
- 请求失败只在当前服务卡片显示错误，不阻断整体流程

不引入自动串行兜底：

- 不自动从 `MyMemory` 切到 `Lingva`
- 不自动轮询所有社区实例
- 用户自己决定启用哪些服务，以及是否切换实例

这样可以保持行为简单且可预期。

### 4.5 错误提示

错误提示从笼统的“请求失败”改成可操作文案：

- `Lingva`：当前实例不可用，可在设置中切换实例地址
- `LibreTranslate`：当前实例不可用或受限，可在设置中切换实例地址
- `MyMemory`：请求失败或额度受限，请稍后重试

目标是让用户知道下一步该怎么处理，而不是只看到失败。

### 4.6 语言代码兼容

页面中的语言下拉值继续沿用现有通用枚举，但各翻译服务内部需要做自己的语言代码映射。

约束如下：

- UI 层不为单个服务改语言列表结构
- 服务请求层负责把通用语言代码转换为目标服务可接受的代码
- 如果目标服务不支持当前语言对，直接返回明确错误，不发送无效请求

这样可以避免 `zh`、`zh-Hans`、`zh-Hant`、`zh-TW` 等值在不同服务中表现不一致。

## 5. 数据结构调整

### 5.1 `TranslationService`

在服务元数据上增加服务分类字段，用于设置面板和文案展示。

建议结构：

```ts
type TranslationServiceKind = 'free-default' | 'free-instance' | 'api-key';

interface TranslationService {
  id: string;
  name: string;
  description: string;
  requiresKey: boolean;
  requiresSecret?: boolean;
  languages: string[];
  kind: TranslationServiceKind;
}
```

### 5.2 `ServiceConfig`

为实例类服务补充可持久化的实例地址配置：

```ts
type ServiceConfig = {
  apiKey?: string;
  secretKey?: string;
  enabled: boolean;
  instanceUrl?: string;
};
```

### 5.3 默认配置

默认配置调整为：

```ts
{
  mymemory: { enabled: true },
  lingva: { enabled: false },
  libretranslate: { enabled: false },
  baidu: { enabled: false },
  youdao: { enabled: false },
  microsoft: { enabled: false }
}
```

### 5.4 持久化兼容

继续沿用 `translator-storage`。

需要保证：

- 旧用户本地配置不被清空
- 如果旧配置里没有 `lingva`，初始化时自动补默认值
- 用户保存的 `instanceUrl` 在刷新后仍然存在

## 6. 代码改动范围

预计改动文件如下：

- `src/modules/translator/constants.ts`
- `src/modules/translator/types.ts`
- `src/modules/translator/store.ts`
- `src/modules/translator/Translator.tsx`
- `src/modules/translator/SettingsPanel.tsx`
- `src/modules/translator/lingvaTranslate.ts`

### 6.1 `constants.ts`

- 新增 `lingva` 服务定义
- 新增 `LINGVA_INSTANCES`
- 调整服务顺序和服务文案

### 6.2 `store.ts`

- 补充 `lingva` 默认配置
- 允许保存 `instanceUrl`
- 对旧持久化数据做兼容合并

### 6.3 `SettingsPanel.tsx`

- 展示服务分类标签
- 为 `Lingva` 和 `LibreTranslate` 增加实例地址输入框

### 6.4 `Translator.tsx`

- 接入 `Lingva` 翻译调用
- 在调用服务时读取对应配置的 `instanceUrl`

### 6.5 `lingvaTranslate.ts`

- 新增 `Lingva` 请求封装
- 负责处理实例地址规范化和错误转换

## 7. 手工验证

本次以手工验证为主，至少覆盖以下场景：

1. 首次进入翻译页面时，仅 `MyMemory` 默认启用
2. 开启 `Lingva` 后，能返回结果或显示明确错误提示
3. 修改 `Lingva` 实例地址后，刷新页面仍保留
4. `Lingva` 失败时，不影响 `MyMemory` 返回结果
5. `LibreTranslate` 失败时，错误提示包含切换实例的指引
6. 设置面板能正确区分“默认免费”“社区实例 / 可自建”“需 API Key”

## 8. 风险与后续扩展

### 8.1 已知风险

- `Lingva` 和 `LibreTranslate` 都依赖公共实例，存在不可用风险
- 不同服务支持的语言代码不完全一致，后续可能需要补语言代码映射
- 浏览器直连社区实例时仍可能遇到 CORS 或限流

### 8.2 后续可扩展方向

- 增加 `Apertium` 作为额外免费服务
- 为实例类服务增加“切换下一个预置实例”按钮
- 增加简单可用性检测
- 后续再考虑是否增加聚合免费翻译模式
