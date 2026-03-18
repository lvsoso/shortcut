# 多语言翻译功能设计文档

**日期**: 2026-03-18
**状态**: 待实现

---

## 1. 概述

为 DevTools App 添加多语言翻译功能模块，支持多翻译源对比、自定义语言选择、代理配置等功能。

## 2. 功能需求

### 2.1 核心功能
- **对比模式**：同时显示多个翻译源的结果，方便用户对比选择
- **语言管理**：用户可自定义添加/删除需要的语言
- **自动检测**：自动识别源语言（由翻译源提供）
- **历史记录**：保存最近翻译记录到本地存储

### 2.2 翻译服务
| 服务 | 类型 | 说明 |
|------|------|------|
| LibreTranslate | 默认 | 开源免费，公共实例有速率限制（3请求/秒），建议自建实例 |
| Google Translate | 可选 | 需用户自配 API Key，需通过代理解决 CORS |
| DeepL | 可选 | 需用户自配 API Key，需通过代理解决 CORS |

### 2.3 代理配置
- **全局代理**：所有网络请求默认走代理
- **翻译独立代理**：可为翻译服务单独配置代理（覆盖全局）
- **支持协议**：HTTP 代理（浏览器环境限制，SOCKS5 需后端支持）
- **CORS 解决**：通过配置的 HTTP 代理转发请求，解决浏览器跨域限制

## 3. 技术设计

### 3.1 模块结构
```
src/modules/translator/
├── index.ts              # 模块注册入口
├── Translator.tsx        # 主组件
├── components/
│   ├── LanguageSelector.tsx   # 语言选择器
│   ├── TextInput.tsx          # 文本输入区
│   ├── TranslationResults.tsx # 翻译结果对比区
│   └── HistoryPanel.tsx       # 历史记录面板
├── hooks/
│   ├── useTranslation.ts      # 翻译逻辑
│   └── useHistory.ts          # 历史记录管理
├── services/
│   ├── libreTranslate.ts      # LibreTranslate API
│   ├── googleTranslate.ts     # Google Translate API
│   └── deepL.ts               # DeepL API
├── stores/
│   └── translatorStore.ts     # 翻译模块状态
└── types.ts                   # 类型定义
```

### 3.2 类型定义
```typescript
// 翻译服务配置
interface TranslationService {
  id: string;
  name: string;
  type: 'free' | 'apiKey';
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
}

// 翻译请求
interface TranslationRequest {
  text: string;
  sourceLang: string;  // 'auto' 表示自动检测
  targetLang: string;
}

// 翻译结果
interface TranslationResult {
  serviceId: string;
  serviceName: string;
  translatedText: string;
  detectedLang?: string;
  error?: string;
  latency: number;
}

// 历史记录
interface TranslationHistory {
  id: string;
  timestamp: number;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  results: TranslationResult[];
}

// 代理配置
interface ProxyConfig {
  enabled: boolean;
  protocol: 'http';  // 浏览器环境仅支持 HTTP 代理转发
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}
```

### 3.3 状态管理
使用 Zustand 创建 `translatorStore`：
- `services`: 翻译服务列表及配置
- `selectedLanguages`: 用户选择的语言列表
- `sourceLang`: 当前源语言
- `targetLang`: 当前目标语言
- `history`: 最近翻译记录（限制 50 条）
- `globalProxy`: 全局代理配置
- `translatorProxy`: 翻译模块独立代理配置

### 3.4 代理实现
由于浏览器环境限制，采用以下方案：
- **HTTP 代理转发**：用户配置 HTTP 代理地址，所有翻译请求通过该代理转发
- **CORS 解决**：代理服务器负责转发请求并添加 CORS 响应头
- **开发环境**：通过 Vite 代理配置调试
- **生产环境**：用户需自行搭建或使用可用的 HTTP 代理服务

### 3.5 语言列表
采用 ISO 639-1 语言代码标准，内置常用语言列表：
- 中文（zh）、英语（en）、日语（ja）、韩语（ko）
- 法语（fr）、德语（de）、西班牙语（es）、俄语（ru）
- 意大利语（it）、葡萄牙语（pt）、阿拉伯语（ar）等

用户可手动添加其他语言代码。

## 4. UI 设计

### 4.1 布局结构
```
+------------------+------------------+
|   源语言选择      |   目标语言选择    |
|   [自动检测 ▼]   |   [英语 ▼]       |
+------------------+------------------+
|                                     |
|   文本输入区                         |
|   +-----------------------------+   |
|   |                             |   |
|   |   请输入要翻译的文本...      |   |
|   |                             |   |
|   +-----------------------------+   |
|                                     |
+-------------------------------------+
|   翻译结果对比区                     |
|   +------------+------------+       |
|   | LibreTranslate | Google  |       |
|   | 翻译结果        | 翻译结果 |       |
|   +------------+------------+       |
+-------------------------------------+
```

### 4.2 交互流程
1. 用户输入文本
2. 选择源语言（默认自动检测）和目标语言
3. 点击翻译或自动触发（防抖 500ms）
4. 使用 AbortController 取消未完成的旧请求，避免竞态条件
5. 并行调用所有启用的翻译服务
6. 显示各服务返回结果及耗时
7. 保存到历史记录

### 4.3 响应式布局
- **桌面端**：多翻译源结果并排显示（卡片式布局）
- **移动端/窄屏**：标签页切换显示不同翻译源结果

## 5. 配置存储

使用 localStorage 持久化：
- `translator_services`: 翻译服务配置
- `translator_languages`: 用户选择的语言列表
- `translator_history`: 最近 50 条翻译记录
- `translator_proxy`: 翻译模块代理配置
- `global_proxy`: 全局代理配置

## 6. 错误处理

- **网络错误**：显示服务不可用提示
- **API 限制**：提示用户配置 API Key 或稍后再试
- **代理错误**：提供代理配置检查指引
- **超时处理**：单个服务按文本长度动态计算超时（基础 5 秒 + 每 100 字符 1 秒），不影响其他服务
- **竞态条件**：使用 AbortController 确保旧请求不会覆盖新结果

## 7. 扩展性

- 翻译服务通过统一接口实现，易于添加新服务
- 语言列表可动态扩展
- 代理配置可复用到其他网络工具模块

## 8. 类型扩展

需在 `src/types/index.ts` 中添加：
```typescript
export type ToolCategory = 'formatter' | 'viewer' | 'converter' | 'network' | 'translator';
```
