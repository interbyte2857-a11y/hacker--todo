<div align="center">

```
████████╗███████╗██████╗ ███╗   ███╗ ██████╗ ██████╗ ███████╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔═══██╗██╔══██╗██╔════╝
   ██║   █████╗  ██████╔╝██╔████╔██║██║   ██║██████╔╝█████╗  
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║   ██║██╔═══╝ ██╔══╝  
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝██║     ███████╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝     ╚══════╝
```

# 🖥️ TERMINAL_TODO v2.0

**黑客终端风格任务管理系统**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-orange?style=flat-square)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-00ff41?style=flat-square)](LICENSE)

[English](#english) · [功能预览](#-功能预览) · [快速开始](#-快速开始) · [使用指南](#-使用指南) · [API文档](#-api-文档) · [部署](#-部署指南)

</div>

---

## 📸 功能预览

### 界面总览

```
┌─────────────────────────────────────────┐
│ ⚡ SIGNAL: STRONG  │ 14:30:25 │ 🔓 PUBLIC │ ⌨️ 机械 │  ← 状态栏
├─────────────────────────────────────────┤
│ > 待办_ █                               │  ← 标题 (闪烁光标)
│ ━━━━━━━━━━━━━━━━━░░░░░░ 27%            │  ← 进度条
│ [总计:15]  [完成:4]  [进度:27%]          │  ← 统计
├─────────────────────────────────────────┤
│ > 搜索待办...                            │  ← 搜索框
│ 排序: [日期] [优先级] [名称]  ↻         │  ← 排序 + 刷新
├─────────────────────────────────────────┤
│ ▼ [安全] ━━━░░░░░ 1/4                   │  ← 可折叠分组
│   ☐ 配置防火墙规则          P3 紧急      │  ← 任务项
│   ☐ 审计系统日志            P2 高        │
│   ☑ 部署入侵检测系统        ✓ 已完成     │
│ ▼ [运维] ━━━━━░░░ 2/3                   │
│   ☑ 备份数据库              ✓            │
│   ☐ 监控服务器负载          P1 中        │
│   ...                                    │
├─────────────────────────────────────────┤
│        📝 笔记         ☑ 待办           │  ← 底部导航
│                                    [+]  │  ← 发光添加按钮
└─────────────────────────────────────────┘
```

### 核心特性

| 特性 | 说明 |
|------|------|
| 🎨 **黑客终端美学** | CRT 扫描线、霓虹发光、金属拉丝背景、闪烁光标 |
| 🖥️ **引导动画** | 启动时展示 ASCII Logo + 模拟内核加载序列 |
| 🔊 **5种打字音效** | ⌨️ 机械 / 🫧 泡泡 / 👆 哒哒 / ⚡ 激光 / 🔇 静音 |
| 📋 **任务管理** | 创建、编辑、删除、完成/取消、分组、优先级 |
| 📝 **笔记系统** | 独立笔记标签页，支持 CRUD 操作 |
| 🔍 **实时搜索** | 关键词过滤 + 高亮显示 |
| 📊 **进度统计** | 总体进度条 + 分组进度条 + 完成数统计 |
| 🔒 **隐私模式** | 一键模糊屏幕，防止旁人偷窥 |
| 🖱️ **右键菜单** | 右键/长按弹出操作菜单 |
| 📱 **移动端适配** | 响应式布局，支持触屏操作 |

---

## 🚀 快速开始

### 环境要求

| 软件 | 版本 | 说明 |
|------|------|------|
| **Node.js** | ≥ 18.x | [下载地址](https://nodejs.org) |
| **PostgreSQL** | ≥ 14.x | [下载地址](https://www.postgresql.org/download/) |
| **npm** | ≥ 9.x | 随 Node.js 安装 |

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/hacker-todo.git
cd hacker-todo

# 2. 安装依赖
npm install

# 3. 创建数据库
createdb hacker_todo

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env，修改数据库连接密码
# DATABASE_URL=postgresql://postgres:你的密码@127.0.0.1:5432/hacker_todo

# 5. 同步数据库表结构
npx drizzle-kit push

# 6. 插入示例数据（15条任务 + 3条笔记）
node seed.js

# 7. 启动开发服务器
npm run dev
```

打开浏览器访问 **http://localhost:3000** 🎉

---

## 📁 项目结构

```
hacker-todo/
├── .env                          # 环境变量（数据库连接）
├── package.json                  # 项目依赖配置
├── next.config.ts                # Next.js 配置
├── tsconfig.json                 # TypeScript 配置
├── postcss.config.mjs            # PostCSS 配置
├── drizzle.config.json           # Drizzle ORM 配置
├── seed.js                       # 示例数据种子脚本
├── README.md                     # 项目文档
│
├── public/
│   └── manifest.json             # PWA 应用清单
│
└── src/
    ├── db/
    │   ├── index.ts              # 数据库连接（Drizzle + pg）
    │   └── schema.ts             # 表结构定义（tasks / notes）
    │
    ├── components/
    │   └── TerminalApp.tsx        # 主应用组件（900+ 行）
    │
    └── app/
        ├── globals.css            # 全局样式 + CSS 动画
        ├── layout.tsx             # 根布局
        ├── page.tsx               # 首页入口（dynamic import + ssr:false）
        │
        └── api/
            ├── health/
            │   └── route.ts       # 健康检查接口
            ├── tasks/
            │   ├── route.ts       # 任务列表：GET /api/tasks, POST /api/tasks
            │   └── [id]/
            │       └── route.ts   # 单任务：PATCH /api/tasks/:id, DELETE /api/tasks/:id
            └── notes/
                ├── route.ts       # 笔记列表：GET /api/notes, POST /api/notes
                └── [id]/
                    └── route.ts   # 单笔记：PATCH /api/notes/:id, DELETE /api/notes/:id
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | [Next.js](https://nextjs.org/) | 16.2 | React 全栈框架（App Router） |
| **语言** | [TypeScript](https://www.typescriptlang.org/) | 5.9 | 类型安全 |
| **前端** | [React](https://react.dev/) | 19.2 | UI 组件库 |
| **样式** | [Tailwind CSS](https://tailwindcss.com/) | 4.1 | 原子化 CSS |
| **数据库** | [PostgreSQL](https://www.postgresql.org/) | 14+ | 关系型数据库 |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | 0.45 | 类型安全的 SQL 查询 |
| **驱动** | [node-postgres (pg)](https://node-postgres.com/) | 8.20 | PostgreSQL 客户端 |

---

## 📖 使用指南

### 首页（待办标签）

| 操作 | 方法 |
|------|------|
| **添加任务** | 点击右下角绿色发光 `+` 按钮 → 填写表单 → 点击确认 |
| **完成/取消** | 点击任务左侧的复选框 `☐` / `☑` → 播放"滴"声 |
| **编辑/删除** | **手机长按** 或 **电脑右键** 任务项 → 弹出操作菜单 |
| **搜索** | 在搜索框输入关键词 → 实时过滤 + 高亮 |
| **排序** | 点击 `[日期]` `[优先级]` `[名称]` 切换排序方式 |
| **折叠分组** | 点击分组标题行展开/折叠 |
| **刷新数据** | 点击排序栏右侧 `↻` 刷新按钮 |

### 添加任务选项

| 字段 | 说明 | 示例 |
|------|------|------|
| **标题** | 任务标题（必填） | `配置防火墙规则` |
| **描述** | 详细说明（选填） | `更新 iptables 规则以阻止未授权访问` |
| **分组** | 自定义分组名 | `安全`、`运维`、`开发`、`渗透` |
| **优先级** | P0(低) → P3(紧急) | `P3` 显示为红色紧急标记 |

### 笔记标签

| 操作 | 方法 |
|------|------|
| **切换到笔记** | 点击底部导航栏 `📝 笔记` |
| **添加笔记** | 在笔记页点击 `+` 按钮 |
| **编辑/删除** | 长按/右键笔记卡片 |

### 音效系统

点击状态栏右侧的 **黄色按钮** 循环切换 5 种模式：

| 模式 | 图标 | 音效描述 | 技术实现 |
|------|------|----------|----------|
| 机械 | ⌨️ | 清脆方波敲击 | Square Wave + HighPass Filter |
| 泡泡 | 🫧 | 柔和上升"啵"声 | Sine Wave 频率上滑 400→1000Hz |
| 哒哒 | 👆 | 双重打击感 | Triangle Wave 双重敲击 |
| 激光 | ⚡ | 科幻射线声 | Sawtooth Wave 快速下滑 3000→200Hz |
| 静音 | 🔇 | 无声效 | — |

> 💡 音效使用 Web Audio API 合成，无需加载音频文件。采用共享 AudioContext + 25ms 节流机制，支持快速打字不卡顿。

### 隐私模式

| 操作 | 效果 |
|------|------|
| 点击状态栏 `🔓 PUBLIC` | 所有内容变为模糊 + 灰度，无法操作 |
| 点击模糊区域 | 解除隐私模式 |

---

## 🗄️ 数据库

### 表结构

#### `tasks` 任务表

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | SERIAL | 自增 | 主键 |
| `title` | TEXT | — | 任务标题（必填） |
| `description` | TEXT | NULL | 任务描述 |
| `completed` | BOOLEAN | false | 是否完成 |
| `group_name` | TEXT | '默认' | 分组名称 |
| `priority` | INTEGER | 0 | 优先级 (0-3) |
| `created_at` | TIMESTAMP | NOW() | 创建时间 |
| `updated_at` | TIMESTAMP | NOW() | 更新时间 |

#### `notes` 笔记表

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | SERIAL | 自增 | 主键 |
| `title` | TEXT | — | 笔记标题（必填） |
| `content` | TEXT | NULL | 笔记内容 |
| `color` | TEXT | '#0f0' | 标记颜色 |
| `created_at` | TIMESTAMP | NOW() | 创建时间 |
| `updated_at` | TIMESTAMP | NOW() | 更新时间 |

### Schema 定义（Drizzle ORM）

```typescript
// src/db/schema.ts
import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  groupName: text("group_name").notNull().default("默认"),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

---

## 🔌 API 文档

### 任务接口

#### `GET /api/tasks` — 获取任务列表

```bash
# 获取所有任务
curl http://localhost:3000/api/tasks

# 搜索任务（关键词过滤）
curl "http://localhost:3000/api/tasks?search=防火墙"
```

**响应示例：**
```json
[
  {
    "id": 1,
    "title": "配置防火墙规则",
    "description": "更新 iptables 规则以阻止未授权访问",
    "completed": false,
    "groupName": "安全",
    "priority": 3,
    "createdAt": "2025-01-15T08:30:00.000Z",
    "updatedAt": "2025-01-15T08:30:00.000Z"
  }
]
```

#### `POST /api/tasks` — 创建任务

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新任务",
    "description": "任务描述",
    "groupName": "开发",
    "priority": 2
  }'
```

#### `PATCH /api/tasks/:id` — 更新任务

```bash
# 标记完成
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{ "completed": true }'

# 编辑内容
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{ "title": "新标题", "priority": 3 }'
```

#### `DELETE /api/tasks/:id` — 删除任务

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

### 笔记接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/notes?search=关键词` | 获取笔记列表（支持搜索） |
| `POST` | `/api/notes` | 创建笔记 |
| `PATCH` | `/api/notes/:id` | 更新笔记 |
| `DELETE` | `/api/notes/:id` | 删除笔记 |

### 健康检查

```bash
curl http://localhost:3000/api/health
# → { "status": "ok", "timestamp": "..." }
```

---

## 🎨 设计系统

### 配色方案

| 变量 | 色值 | 用途 |
|------|------|------|
| `--g` | `#00ff41` | 主色调 — 经典黑客绿 |
| `--c` | `#00e5ff` | 辅助色 — 赛博青 |
| `--r` | `#ff0040` | 警示色 — 霓虹红 |
| `--y` | `#ffff00` | 高亮色 — 警告黄 |
| `--o` | `#ff8800` | 中等优先级 — 橙色 |
| `--bg` | `#0a0a0a` | 主背景色 |
| `--bg2` | `#0d1117` | 卡片背景色 |
| `--bg3` | `#161b22` | 悬浮背景色 |

### 字体

```css
font-family: 'Courier New', Consolas, Monaco, monospace;
```

### CSS 动画

| 动画名 | 效果 | 用途 |
|--------|------|------|
| `blink` | 闪烁 | 终端光标 |
| `pulseGlow` | 脉冲发光 | 添加按钮 |
| `scanDown` | 扫描线下滑 | 数据刷新动画 |
| `flicker` | 微闪烁 | CRT 屏幕效果 |
| `typing-enter` | 滑入 + 渐显 | 新项目入场 |
| `cursor-blink` | 步进闪烁 | 输入框光标 |

---

## 📋 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器（热更新）
npm run build            # 生产构建
npm run start            # 生产模式运行
npm run lint             # 代码检查
npm run typecheck        # TypeScript 类型检查

# 数据库
npx drizzle-kit push     # 同步 Schema 到数据库（修改 schema.ts 后执行）
node seed.js             # 插入示例数据（会清空旧数据）

# 指定端口
npm run dev -- -p 3001   # 使用 3001 端口
```

---

## 🚢 部署指南

### Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel

# 3. 配置环境变量
# 在 Vercel Dashboard → Settings → Environment Variables 中添加：
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx drizzle-kit push
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建并运行
docker build -t hacker-todo .
docker run -p 3000:3000 -e DATABASE_URL=postgresql://... hacker-todo
```

### 传统服务器

```bash
# 1. 构建项目
npm run build

# 2. 使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "hacker-todo" -- start
pm2 save
pm2 startup
```

---

## 🔧 故障排查

| 问题 | 解决方法 |
|------|----------|
| `npm install` 失败 | 确认 Node.js ≥ 18：`node -v` |
| 数据库连接失败 | 检查 `.env` 中 `DATABASE_URL` 是否正确，确认 PostgreSQL 正在运行 |
| `drizzle-kit push` 报错 | 确认数据库已创建：`createdb hacker_todo` |
| 端口 3000 被占用 | 使用其他端口：`npm run dev -- -p 3001` |
| 页面白屏 | 检查终端是否有报错，确认 `npm run dev` 没有退出 |
| 音效不播放 | 浏览器需要先与页面交互一次（点击任意位置），这是浏览器自动播放策略限制 |
| 右键菜单不弹出 | 移动端请使用长按（500ms），桌面端使用鼠标右键 |

---

## 📂 环境变量

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接字符串 | `postgresql://postgres:123456@127.0.0.1:5432/hacker_todo` |

---

## 🤝 贡献指南

```bash
# 1. Fork 项目
# 2. 创建功能分支
git checkout -b feature/amazing-feature

# 3. 提交更改
git commit -m 'feat: 添加新功能'

# 4. 推送到分支
git push origin feature/amazing-feature

# 5. 创建 Pull Request
```

### 代码规范

- 使用 TypeScript 严格模式
- ESLint + Next.js 推荐规则
- 组件使用函数式组件 + Hooks
- CSS 使用 Tailwind 工具类 + CSS Modules

---

## 📄 License

MIT License © 2025

---

<div align="center">

```
> 关闭连接... _
```

**用 ❤️ 和 ☕ 构建**

</div>
