# 课堂笔记 Classroom Notes

面向学生的课堂学习管理应用：课程管理 + 课堂笔记 + 学习待办 + AI 笔记整理。
前端 React 19 + TypeScript + Vite，后端用 PocketBase，本地一键启动。

## 功能

- **课程管理**：按课程归类笔记，支持添加、编辑、删除课程
- **课堂笔记**：Markdown 编辑与渲染、置顶、收藏、全文搜索、复习标记、软删除回收
- **学习待办**：截止日期、完成进度、紧急待办提醒
- **AI 帮我整理**：把杂乱的课堂笔记整理成结构化 Markdown（核心要点 / 知识梳理 / 建议待办），
  结果可替换原文或放弃；调用前有费用确认弹窗
- **学习统计**：复习概览、笔记与待办数据卡片
- **PWA**：可安装到桌面 / 手机主屏

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 19 + TypeScript + Vite |
| 路由 / 表单 | react-router-dom 7；react-hook-form + zod |
| UI | Tailwind CSS + Radix UI（dialog / select / tabs / tooltip 等组件） |
| Markdown / 图表 | react-markdown + remark-gfm；Recharts |
| 后端 | PocketBase（数据存储 + 接口，集合与字段由 `pb_hooks` 初始化，并做 LLM 中转） |
| 构建 | `tsc` 类型检查 + `vite build`，ESLint 检查 |

## 运行

需要先装 **Node.js 20.19+ 或 22.12+**（[nodejs.org](https://nodejs.org) 的 LTS 版即可）。
pnpm 是可选的，Windows 启动脚本会用 corepack 自动启用；要手动装就是 `npm install -g pnpm`。

其余准备工作由启动脚本自动完成：

- **PocketBase**：首次启动自动下载对应平台的二进制，缓存到 `vibex-local/bin/`
- **数据库**：首次启动自动创建 `pocketbase/pb_data/`，集合与字段由后端 hooks 建好
- **npm 依赖**：首次启动自动安装（需联网）

**Windows**：双击 `vibex-local\start-windows.bat`

**macOS / Linux**：

```bash
chmod +x vibex-local/start-macos.sh
./vibex-local/start-macos.sh
```

启动完成后：

- 应用地址：<http://127.0.0.1:8000>（脚本会自动打开浏览器）
- PocketBase 后台：<http://127.0.0.1:7000/_/>（首次可创建管理员账号）

## 手动开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（需自行启动 PocketBase）
pnpm build            # 生产构建（先 tsc 类型检查再 vite build）
pnpm lint             # ESLint 检查
```

手动模式下 Vite 要用 `vibex-local/vite.local.config.ts`——其中包含 `/__pb` → PocketBase 的代理：

```bash
# 终端 1：启动 PocketBase
pocketbase serve --http=127.0.0.1:7000 --dir pocketbase

# 终端 2：启动前端
pnpm exec vite --config vibex-local/vite.local.config.ts
```

## AI 功能说明

- 需要登录 RunningHub 账号（应用右上角入口）
- 每次 AI 调用会消耗一定费用，点「AI 帮我整理」后先弹费用确认，确认后才发起生成
- 结果仅供参考：可用「替换原文」写回笔记，也可「放弃」保留原文

## 项目结构

```
├── src/                  # React 前端源码（pages / components / lib）
├── pocketbase/pb_hooks/  # PocketBase 后端 hooks（建集合、业务路由、LLM 中转）
├── vibex-local/          # 本地启动脚本与本地 Vite 配置
├── public/               # PWA 图标与 manifest
└── vite.config.ts        # 开发模式 Vite 配置
```