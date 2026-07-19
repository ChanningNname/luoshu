# 洛书后端服务

## 技术栈

- **语言**: Python 3.11+
- **Web 框架**: FastAPI
- **ORM**: SQLAlchemy 2.0 (async)
- **数据库**: SQLite (WAL 模式)
- **数据验证**: Pydantic v2

## 状态

> ⚠️ v0.1.0 后端编码尚未开始，当前仅为项目占位。

前端开发阶段使用 MSW (Mock Service Worker) 模拟 API 响应，后端实现将在前端 MVP 验证通过后启动。

## 计划目录结构

```
backend/
├── app/
│   ├── api/          # 路由层
│   ├── core/         # 配置、安全
│   ├── models/       # SQLAlchemy 模型
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # 业务逻辑
│   └── main.py       # 应用入口
├── tests/
├── requirements.txt
└── README.md
```
