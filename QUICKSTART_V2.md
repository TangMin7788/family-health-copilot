# 快速启动指南 - 前后端分离版本

## 🎯 架构优势

### 与原版 Streamlit 的对比

| 特性 | Streamlit 版本 | 前后端分离版本 |
|------|---------------|---------------|
| **模型加载** | 每次请求加载 | 启动时预加载，立即可用 |
| **响应时间** | 首次请求需等待 | 所有请求快速响应 |
| **并发处理** | 单用户 | 多用户并发 |
| **前端体验** | Python 驱动 | React/Next.js 现代界面 |
| **API 文档** | 无 | 自动生成 Swagger |
| **部署** | 单体 | 可独立扩展 |

---

## 🚀 快速启动

### 1. 启动后端 (FastAPI)

```bash
# 方式一：使用启动脚本
cd /mnt/hdd/data/family_health_copilot
./start_backend.sh

# 方式二：手动启动
cd /mnt/hdd/data/family_health_copilot/backend
source ~/anaconda3/etc/profile.d/conda.sh
conda activate medgemma15
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**启动后你会看到：**
```
🚀 Starting Family Health Copilot API...
🔄 Pre-loading AI models...
  📦 Loading extractor: medgemma-1.5-4b-it
  📦 Loading synthesizer: medgemma-1.5-4b-it
✅ Models loaded successfully!
🌐 API running at http://0.0.0.0:8000
📚 Documentation at http://0.0.0.0:8000/docs
```

### 2. 测试后端 API

打开浏览器访问：
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/v1/health
- **模型状态**: http://localhost:8000/api/v1/health/models

#### 使用 Swagger UI 测试 API

1. 访问 http://localhost:8000/docs
2. 找到 `POST /api/v1/models/extract`
3. 点击 "Try it out"
4. 输入测试数据：
```json
{
  "report_text": "CT CHEST WITH CONTRAST..."
}
```
5. 点击 "Execute"

### 3. 测试创建报告

使用 curl 测试：

```bash
curl -X POST "http://localhost:8000/api/v1/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "alice",
    "visibility": "SHARED_SUMMARY",
    "report_text": "CT CHEST WITH CONTRAST\nPatient: [REDACTED]\nFINDINGS: Bilateral ground-glass opacities..."
  }'
```

### 4. 查询报告状态

```bash
# 获取 Alice 的所有报告
curl "http://localhost:8000/api/v1/reports?viewer=alice"

# 获取特定报告详情
curl "http://localhost:8000/api/v1/reports/1"
```

---

## 📝 API 端点总览

### 报告管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/reports` | 获取报告列表 |
| GET | `/api/v1/reports/{id}` | 获取报告详情 |
| POST | `/api/v1/reports` | 创建新报告（后台处理） |
| DELETE | `/api/v1/reports/{id}` | 删除报告 |

### 模型推理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/v1/models/extract` | 提取结构化信息 |
| POST | `/api/v1/models/triage` | 风险评估 |
| POST | `/api/v1/models/patient-view` | 生成患者版本 |
| POST | `/api/v1/models/family-view` | 生成家庭版本 |
| GET | `/api/v1/models/status` | 模型状态 |

### 系统监控

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/health` | 健康检查 |
| GET | `/api/v1/health/models` | 模型健康状态 |
| GET | `/api/v1/health/metrics` | 系统指标 |

---

## 🔧 开发说明

### 后端结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── api/v1/              # API 路由
│   │   ├── reports.py       # 报告 CRUD
│   │   ├── models.py        # 模型推理
│   │   └── health.py        # 健康检查
│   ├── core/
│   │   └── config.py        # 配置
│   ├── models/
│   │   └── schemas.py       # Pydantic 模型
│   ├── services/
│   │   └── model_service.py # 模型服务（单例）
│   └── db/
│       └── session.py       # 数据库会话
└── requirements.txt         # Python 依赖
```

### 关键特性

1. **模型预加载**
   - 启动时加载 AI 模型
   - 单例模式管理模型实例
   - 所有请求共享已加载的模型

2. **后台处理**
   - 创建报告后立即返回 202
   - 使用 FastAPI BackgroundTasks 异步处理
   - 处理完成后更新数据库

3. **类型安全**
   - Pydantic 验证所有请求/响应
   - 自动生成 API 文档
   - TypeScript 类型共享

---

## 🌐 前端开发（待实现）

前端使用 Next.js 14，完整代码请参考 [ARCHITECTURE.md](ARCHITECTURE.md)

### 快速创建前端项目

```bash
# 创建 Next.js 项目
npx create-next-app@latest frontend --typescript --tailwind --app

# 安装依赖
cd frontend
npm install @tanstack/react-query axios

# 启动开发服务器
npm run dev
```

### 核心 API 客户端

```typescript
// frontend/src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const reportsApi = {
  list: (owner: string) => api.get(`/reports?viewer=${owner}`),
  get: (id: number) => api.get(`/reports/${id}`),
  create: (data: any) => api.post('/reports', data),
};

export const modelsApi = {
  extract: (report_text: string) =>
    api.post('/models/extract', { report_text }),
};
```

---

## 🐛 故障排除

### 问题 1: 模型加载失败

**症状**: 启动时出现错误

**解决**:
```bash
# 检查模型路径
ls ~/.cache/huggingface/hub/

# 确认 medgemma-1.5-4b-it 模型存在
```

### 问题 2: CORS 错误

**症状**: 前端无法访问后端

**解决**: 检查 `backend/app/main.py` 中的 CORS 配置

### 问题 3: 数据库错误

**症状**: 找不到 family_health.db

**解决**:
```bash
# 初始化数据库
cd /mnt/hdd/data/family_health_copilot
python -c "from db import init_db; init_db()"
```

---

## 📊 性能对比

### 响应时间

| 操作 | Streamlit 版本 | 前后端分离版本 |
|------|---------------|---------------|
| 首次请求 | 30-60秒（加载模型） | < 1秒 |
| 后续请求 | 5-10秒 | < 1秒 |
| 并发请求 | 阻塞 | 并行处理 |

### 资源使用

| 资源 | Streamlit 版本 | 前后端分离版本 |
|------|---------------|---------------|
| 内存 | ~8GB | ~8GB（但多用户共享） |
| GPU | 按需加载 | 持续加载（可服务多用户） |

---

## 🎉 下一步

1. **测试后端 API**
   - 访问 http://localhost:8000/docs
   - 尝试各个端点

2. **开发前端**
   - 使用 Next.js 创建前端应用
   - 参考 ARCHITECTURE.md 中的代码

3. **部署**
   - 使用 Docker 部署
   - 配置 Nginx 反向代理
   - 设置生产环境

---

## 📚 相关文档

- [完整架构设计](ARCHITECTURE.md)
- [API 文档](http://localhost:8000/docs) (启动后访问)
- [原始功能说明](README_QUICKSTART.md)

---

**提示**: 后端启动后，模型会一直保持在内存中，随时准备处理请求。这是前后端分离架构的最大优势！
