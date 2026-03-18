# 一页简历

一页简历是一个注重排版控制与交付质量的 AI 简历编辑器，支持本地优先存储、实时预览、模块化编辑和 PDF 导出。

仓库地址：[https://github.com/LuvKab/resume-master](https://github.com/LuvKab/resume-master)

## 核心能力

- 模块级高度调节（含头像区域）
- 拖拽排序与网格化布局控制
- AI 润色与语法检查
- 本地优先数据存储（隐私友好）
- 一键导出 PDF（用于正式投递）

## 快速开始

```bash
pnpm install
pnpm dev
```

默认开发地址：`http://localhost:3000`

## 构建与运行

```bash
pnpm build
pnpm start
```

## 技术栈

- TanStack Start + React 18 + TypeScript
- Tailwind CSS + HeroUI
- TipTap 富文本编辑
- Framer Motion 动效

## 项目结构

```text
src/
  app/                 # 页面与布局
  components/          # 组件
  routes/              # 路由入口
  i18n/                # 多语言文案
  config/              # 常量与配置
```

## 自定义配置

- 品牌与导出配置：`src/config/constants.ts`
- 站点 SEO 信息：`src/routes/$locale.tsx`、`src/routes/__root.tsx`
- 首页视觉内容：`src/app/(public)/[locale]/page.tsx`

## API 改造（服务端托管模式）

你可以把 AI Key 放到服务端，不再让用户在前端手动填写。

1. 在 `.env` 设置：
   - `VITE_SERVER_MANAGED_AI=true`
   - `DEFAULT_AI_MODEL=openai`（可选：`doubao` / `deepseek` / `gemini`）
   - 对应模型的 `*_API_KEY`、`*_MODEL_ID`、`OPENAI_API_ENDPOINT`
2. 前端仍可保留手动配置；当请求里没传 key 时，后端会自动回退到环境变量。

## GitHub Actions 说明

仓库未配置以下 Secret 时，CI 会自动跳过对应发布任务，不会再报红叉：

- Docker 发布：`DOCKERHUB_USERNAME`、`DOCKERHUB_TOKEN`
- Cloudflare 部署：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`

