# 项目文件结构说明

## 项目概述
Family Health Copilot - 一个基于 AI 的家庭医疗报告分析系统

## 目录结构

```
family_health_copilot/
├── backend/                      # 后端服务 (FastAPI)
│   ├── app/
│   │   ├── api/v1/              # API 路由端点
│   │   ├── core/                # 核心配置
│   │   ├── db/                  # 数据库会话
│   │   ├── models/              # 数据模型/Schema
│   │   ├── services/            # 业务逻辑 (AI 处理)
│   │   └── main.py              # FastAPI 入口
│   ├── family_health.db         # SQLite 数据库
│   └── requirements.txt         # Python 依赖
│
├── frontend/                     # 前端应用 (Next.js 14)
│   ├── src/
│   │   ├── app/                 # Next.js 页面路由
│   │   ├── components/          # React 组件
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── lib/                 # 工具库
│   │   └── types/               # TypeScript 类型定义
│   ├── .env.local               # 环境变量 (本地)
│   ├── .env.local.example       # 环境变量模板
│   ├── package.json             # npm 依赖配置
│   ├── next.config.js           # Next.js 配置
│   ├── tailwind.config.ts       # Tailwind CSS 配置
│   └── tsconfig.json            # TypeScript 配置
│
├── medgemma-1.5-4b-it/          # MedGemma AI 模型文件
│   ├── model-*.safetensors      # 模型权重
│   ├── config.json              # 模型配置
│   ├── tokenizer*.json          # 分词器
│   └── ...
│
├── schemas/                      # JSON Schema 定义
│   └── radiology_schema.json    # 医学报告结构化提取的 Schema
│
├── utils/                        # 工具函数
│   ├── json_utils/              # JSON 处理工具
│   └── highlight.py             # 语法高亮
│
├── .vscode/                      # VS Code 配置
│   └── settings.json
│
├── db.py                         # 数据库操作模块 (独立)
│
├── start_all.sh                  # ⭐ 主启动脚本
│
└── docs/                         # 项目文档
    ├── PROJECT_OVERVIEW.md       # 项目概览
    ├── ARCHITECTURE.md           # 系统架构
    ├── QUICKSTART_V2.md          # 快速启动指南
    ├── FRONTEND_README.md        # 前端使用说明
    ├── FRONTEND_IMPLEMENTATION.md # 前端实现细节
    └── IMPLEMENTATION_STATUS.md  # 实现状态
```

## 文件说明

### 核心应用文件

| 文件 | 作用 | 启动方式 |
|------|------|----------|
| `start_all.sh` | 主启动脚本 | `./start_all.sh` |
| `backend/app/main.py` | FastAPI 后端入口 | `python -m uvicorn app.main:app --port 8002` |
| `backend/requirements.txt` | Python 依赖 | `pip install -r backend/requirements.txt` |
| `frontend/package.json` | npm 依赖 | `npm install` |
| `frontend/src/app/page.tsx` | 前端首页 | - |

### 配置文件

| 文件 | 作用 |
|------|------|
| `frontend/.env.local` | 前端环境变量 (API URL 等) |
| `frontend/next.config.js` | Next.js 配置 |
| `frontend/tailwind.config.ts` | Tailwind CSS 样式配置 |
| `frontend/tsconfig.json` | TypeScript 编译配置 |

### 数据和模型

| 文件/目录 | 作用 |
|-----------|------|
| `backend/family_health.db` | SQLite 数据库 |
| `medgemma-1.5-4b-it/` | MedGemma 医疗 AI 模型 (~4GB) |
| `schemas/radiology_schema.json` | 医学报告 JSON Schema |

### 文档

| 文件 | 内容 |
|------|------|
| `PROJECT_OVERVIEW.md` | 项目总览和技术栈 |
| `ARCHITECTURE.md` | 系统架构设计 |
| `QUICKSTART_V2.md` | 快速启动指南 |
| `FRONTEND_README.md` | 前端使用说明 |
| `FRONTEND_IMPLEMENTATION.md` | 前端实现细节 |
| `IMPLEMENTATION_STATUS.md` | 功能实现状态 |

## 快速启动

### 方式一：一键启动 (推荐)
```bash
./start_all.sh
```

### 方式二：分别启动

**启动后端:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
```

**启动前端:**
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端: http://localhost:3002
- 后端 API: http://localhost:8002
- API 文档: http://localhost:8002/docs

## 依赖说明

### 后端依赖 (requirements.txt)
- FastAPI - Web 框架
- Uvicorn - ASGI 服务器
- PyTorch - 深度学习框架
- Transformers - Hugging Face 模型库
- SQLAlchemy - ORM

### 前端依赖 (package.json)
- Next.js 14 - React 框架
- React Query - 状态管理
- Axios - HTTP 客户端
- Tailwind CSS - 样式框架
- TypeScript - 类型安全

## 目录命名规范

- `backend/` - 后端服务目录
- `frontend/` - 前端应用目录
- `schemas/` - JSON Schema 定义
- `utils/` - 共享工具函数
- `medgemma-*/` - AI 模型文件

---

**最后更新**: 2026-02-20
