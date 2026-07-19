# 洛书 (Luoshu) — AI 叙事创作系统

洛书是一款面向创作者的 AI 叙事创作系统，通过结构化的世界观管理、实体关系图谱、记忆系统等核心能力，辅助创作者构建和维护复杂的故事世界。

## 项目结构

```
luoshu/
├── backend/          # 后端服务（Python / FastAPI）
├── frontend/         # 前端应用（React / Vite / TypeScript）
└── README.md         # 本文件
```

## 快速启动

### 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

### 后端

```bash
cd backend
# 待实现 — 详见 backend/README.md
```

## 开发环境要求

- **Node.js** 18+
- **Python** 3.11+
- **npm** 9+

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端 | React 19 + TypeScript 5.8 + Vite 7 + TailwindCSS 4 |
| 状态管理 | Zustand 5 + TanStack React Query 5 |
| 路由 | React Router DOM 7 |
| HTTP 客户端 | Axios 1.7 |
| 可视化 | D3 7.9 |
| Markdown 渲染 | react-markdown 9 |
| 后端 | Python 3.11+ / FastAPI / SQLAlchemy 2.0 |
| 数据库 | SQLite (WAL 模式) |
| API Mock | MSW 2 (Mock Service Worker) |
