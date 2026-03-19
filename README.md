# 一页简历 (One Page Resume)

一款本地优先的 AI 简历编辑器，重点解决三件事：

1. 模块化编辑（可拖拽、可调高度）
2. 一页排版控制（预览和导出一致）
3. AI 润色/语法检查（支持官方、中转、本地 OpenAI 兼容服务）

- 仓库地址: https://github.com/LuvKab/resume-master
- 技术栈: TanStack Start + React 18 + TypeScript + Tailwind + TipTap

## 1. 先确认环境（必须）

### 1.1 安装版本要求

- Node.js: `>= 20`
- pnpm: `>= 10`

### 1.2 用命令检查

```bash
node -v
pnpm -v
```

如果命令报错或版本太低，请先安装/升级后再继续。

## 2. 本地启动（照着做）

### 第一步：安装依赖

```bash
pnpm install
```

预期结果：终端没有 `ERR!` / `ELIFECYCLE` 错误。

### 第二步：启动开发服务

```bash
pnpm dev
```

预期结果：终端出现本地地址（例如 `http://localhost:3000` 或 `http://localhost:5173`）。

### 第三步：打开浏览器

访问终端打印的地址，进入首页后点击「开始制作」，会直接进入：

- `/app/dashboard/resumes`

## 3. 第一次使用（最短路径）

1. 在「我的简历」页面点击「新建简历」。
2. 选择空白或模板创建。
3. 创建后会自动进入编辑器（`/app/workbench/{id}`）。
4. 编辑内容后可直接导出 PDF。

## 4. AI 配置（默认是手动填写）

路径：`仪表盘 -> AI 服务商`

### 4.1 你会看到什么

1. 左侧固定显示全部服务商（DeepSeek / 豆包 / OpenAI / Gemini / Qwen / 智谱 / Kimi / SiliconFlow / Ollama / LM Studio / 自定义中转）。
2. 点击左侧某一项，右侧只显示该服务商的配置表单。
3. 右侧圆点勾选是“默认使用模型”，和“当前查看项”是两套状态。

### 4.2 关键规则（很重要）

1. 所有 API 输入框默认都是空的。
2. Ollama / LM Studio / 自定义中转会显示 Base URL 输入框。
3. 只有「自定义中转」需要手动填写 Model ID；其余厂商使用内置默认模型。
4. Ollama / LM Studio 的 API Key 可留空，留空时不会发送 Authorization。

## 5. 生产构建与运行

```bash
pnpm build
pnpm start
```

预期结果：服务可正常启动，页面可访问。

## 6. 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 本地开发 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务 |
| `pnpm preview` | 预览构建产物 |
| `pnpm generate:template-snapshots` | 生成模板快照 |

## 7. 常见问题（直接对照处理）

### 7.1 端口被占用

现象：`pnpm dev` 提示端口冲突。  
处理：关闭占用进程，或按终端提示使用新端口。

### 7.2 依赖安装失败

现象：`pnpm install` 报网络或锁文件错误。  
处理：

```bash
pnpm store prune
pnpm install
```

### 7.3 AI 调用失败（401/403）

优先检查：

1. API Key 是否填写正确。
2. Endpoint 是否可访问。
3. 若使用自定义中转，Model ID 是否填写正确。

### 7.4 本地模型无响应（Ollama/LM Studio）

优先检查：

1. 本地服务是否已启动。
2. Endpoint 是否填对（如 `http://127.0.0.1:11434/v1`）。
3. API Key 可留空（默认不要求）。

## 8. 可选：服务端托管 AI（不让用户填 Key）

在部署环境配置：

```env
VITE_SERVER_MANAGED_AI=true
DEFAULT_AI_MODEL=openai
OPENAI_API_KEY=...
OPENAI_MODEL_ID=...
OPENAI_API_ENDPOINT=...
```

也支持 `doubao` / `deepseek` / `gemini` 对应变量。

## 9. 项目结构（快速定位）

```text
src/
  app/         页面与布局
  components/  组件
  routes/      路由与 API
  store/       Zustand 状态
  config/      配置常量
  i18n/        文案
```
