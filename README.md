# 课堂笔记 Classroom Notes

一款面向学生的课堂学习管理应用：**课程管理 + 课堂笔记 + 学习待办 + AI 笔记整理**，本地即可一键跑起来（React 19 + Vite + TypeScript + PocketBase）。

## 功能一览

- **课程管理**：按课程归类笔记，支持添加、编辑、删除课程
- **课堂笔记**：Markdown 编辑与渲染、置顶、收藏、全文搜索、复习标记、软删除回收
- **学习待办**：截止日期、完成进度、紧急待办提醒
- **AI 帮我整理**：一键把杂乱的课堂笔记整理成结构化 Markdown（核心要点 / 知识梳理 / 建议待办），整理结果可替换原文或放弃；调用前有费用确认弹窗
- **学习统计**：复习概览、笔记与待办数据卡片
- **PWA**：可安装到桌面 / 手机主屏

## 用户需要下载什么才能正常使用？

只需两样东西，其余全部自动完成：

| 需要安装 | 说明 |
| --- | --- |
| **Node.js 20.19+ 或 22.12+** | 从 [nodejs.org](https://nodejs.org) 下载 LTS 版即可 |
| **pnpm**（可选） | Windows 启动脚本会用 corepack 自动启用；如手动安装：`npm install -g pnpm` |

**不需要单独安装**：
- PocketBase —— 首次启动时脚本自动下载对应平台的二进制，缓存到 `vibex-local/bin/`
- 数据库配置 —— 首次启动自动创建 `pocketbase/pb_data/`，集合与字段由后端 hooks 自动建好
- npm 依赖 —— 首次启动自动安装（需联网）

## 快速开始

**Windows**：双击 `vibex-local\start-windows.bat`

**macOS / Linux**：

```bash
chmod +x vibex-local/start-macos.sh
./vibex-local/start-macos.sh
```

启动完成后：

- 应用访问地址：<http://127.0.0.1:8000>（脚本会自动打开浏览器）
- PocketBase 后台：<http://127.0.0.1:7000/_/>（首次可创建管理员账号）

## 手动开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（需按下方说明自行启动 PocketBase）
pnpm build            # 生产构建（先 tsc 类型检查再 vite build）
pnpm lint             # ESLint 检查
```

手动开发模式下，Vite 需要使用 `vibex-local/vite.local.config.ts`（其中包含 `/__pb` → PocketBase 的代理）：

```bash
# 终端 1：启动 PocketBase
pocketbase serve --http=127.0.0.1:7000 --dir pocketbase

# 终端 2：启动前端
pnpm exec vite --config vibex-local/vite.local.config.ts
```

## AI 功能说明

- AI 整理功能需要登录 RunningHub 账号（应用右上角入口）
- 每次 AI 调用会消耗一定的费用，点击「AI 帮我整理」后会先弹出费用确认，确认后才发起生成
- AI 结果仅供参考，可用「替换原文」写回笔记，也可「放弃」保留原文

## 项目结构

```
├── src/                  # React 前端源码（pages / components / lib）
├── pocketbase/pb_hooks/  # PocketBase 后端 hooks（建集合、业务路由、LLM 中转）
├── vibex-local/          # 本地启动脚本与本地 Vite 配置
├── public/               # PWA 图标与 manifest
└── vite.config.ts        # 开发模式 Vite 配置
```
