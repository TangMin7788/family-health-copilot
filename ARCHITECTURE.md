# 前后端分离架构设计 - Family Health Copilot

## 架构概览

### 技术栈

**前端:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (TanStack Query)
- Axios

**后端:**
- FastAPI
- Pydantic (数据验证)
- uvicorn (ASGI 服务器)
- SQLAlchemy (数据库 ORM)
- Redis (缓存和会话)

**AI 模型:**
- MedGemma (预加载模型池)
- torch + transformers

---

## 目录结构

```
family-health-copilot/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/             # App Router 页面
│   │   │   ├── page.tsx     # 首页/Dashboard
│   │   │   ├── reports/     # 报告相关页面
│   │   │   │   ├── page.tsx # 报告列表
│   │   │   │   └── [id]/    # 报告详情
│   │   │   │       └── page.tsx
│   │   │   └── add/         # 添加报告
│   │   │       └── page.tsx
│   │   ├── components/      # React 组件
│   │   │   ├── ui/          # shadcn/ui 组件
│   │   │   ├── dashboard/   # Dashboard 组件
│   │   │   ├── reports/     # 报告列表组件
│   │   │   └── forms/       # 表单组件
│   │   ├── lib/             # 工具库
│   │   │   ├── api.ts       # API 客户端
│   │   │   └── utils.ts     # 工具函数
│   │   └── hooks/           # React Hooks
│   │       └── use-reports.ts
│   ├── public/              # 静态资源
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── api/             # API 路由
│   │   │   ├── v1/
│   │   │   │   ├── reports.py    # 报告 CRUD
│   │   │   │   ├── models.py     # 模型推理
│   │   │   │   └── health.py     # 健康检查
│   │   │   └── deps.py      # 依赖注入
│   │   ├── core/            # 核心配置
│   │   │   ├── config.py    # 配置
│   │   │   └── security.py  # 安全
│   │   ├── models/          # 数据模型
│   │   │   ├── report.py    # SQLAlchemy 模型
│   │   │   └── schemas.py   # Pydantic schemas
│   │   ├── services/        # 业务逻辑
│   │   │   ├── model_service.py   # 模型服务
│   │   │   ├── report_service.py  # 报告服务
│   │   │   ├── pii_redact.py      # PII 脱敏
│   │   │   ├── extractor.py        # 信息提取
│   │   │   ├── synthesizer.py      # 文本生成
│   │   │   └── triage.py           # 风险评估
│   │   ├── db/              # 数据库
│   │   │   ├── session.py    # 数据库会话
│   │   │   └── base.py       # Base 模型
│   │   └── main.py          # FastAPI 应用入口
│   ├── tests/               # 测试
│   ├── requirements.txt
│   └── pyproject.toml
│
├── shared/                   # 共享类型定义
│   └── types/
│       └── api.ts           # TypeScript 类型
│
├── docker-compose.yml       # Docker 编排
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

---

## API 设计

### RESTful API 端点

```typescript
// 基础 URL: http://localhost:8000/api/v1

// 报告相关
GET    /reports                    // 获取报告列表
GET    /reports/:id                // 获取报告详情
POST   /reports                    // 创建新报告
DELETE /reports/:id                // 删除报告

// 模型推理
POST   /models/extract             // 提取结构化信息
POST   /models/triage              // 风险评估
POST   /models/patient-view        // 生成患者版本
POST   /models/family-view         // 生成家庭版本

// 系统健康
GET    /health                     // 健康检查
GET    /health/models              // 模型状态
GET    /health/cache               // 缓存状态
```

### 请求/响应示例

#### 1. 创建报告

```typescript
// POST /api/v1/reports
{
  "owner": "alice",
  "visibility": "SHARED_SUMMARY",
  "report_text": "CT CHEST WITH CONTRAST..."
}

// Response 202 (Accepted)
{
  "id": 123,
  "status": "processing",
  "message": "Report is being processed"
}

// 后台处理完成后，可以通过轮询或 WebSocket 获取结果
```

#### 2. 获取报告详情

```typescript
// GET /api/v1/reports/123

// Response 200
{
  "id": 123,
  "owner": "alice",
  "visibility": "SHARED_SUMMARY",
  "urgency": "URGENT",
  "created_at": "2024-03-12T10:30:00Z",
  "report_text": "[REDACTED]...",
  "extracted": {
    "study_type": "CT Chest",
    "findings": [...]
  },
  "patient_view": "# Your Test Results...",
  "family_view": "# Family Care Summary..."
}
```

#### 3. 模型推理

```typescript
// POST /api/v1/models/extract
{
  "report_text": "CT CHEST WITH CONTRAST..."
}

// Response 200
{
  "extracted": {
    "study_type": "CT Chest",
    "findings": [...],
    "critical_flags": []
  },
  "processing_time_ms": 2340
}
```

---

## 核心实现

### 后端 - FastAPI

#### 1. 主应用 (backend/app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import reports, models, health
from app.core.config import settings
from app.services.model_service import ModelService

# 创建 FastAPI 应用
app = FastAPI(
    title="Family Health Copilot API",
    description="AI-powered medical report analysis for families",
    version="2.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 启动时预加载模型
@app.on_event("startup")
async def startup_event():
    """应用启动时预加载模型"""
    ModelService.get_instance()
    print("✅ Models loaded successfully!")

# 注册路由
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])

@app.get("/")
async def root():
    return {
        "message": "Family Health Copilot API",
        "version": "2.0.0",
        "docs": "/docs"
    }
```

#### 2. 模型服务 (backend/app/services/model_service.py)

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Dict, Any
import json

class ModelService:
    """单例模式管理 AI 模型"""

    _instance = None
    _extractor = None
    _synthesizer = None

    def __init__(self):
        if ModelService._instance is not None:
            raise Exception("Use get_instance()")

        self.model_id = "medgemma-1.5-4b-it"

        # 加载模型
        print("🔄 Loading AI models...")
        self._load_models()
        print("✅ Models loaded!")

    @classmethod
    def get_instance(cls):
        """获取单例实例"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_models(self):
        """加载 AI 模型"""
        # 加载 extractor
        self._extractor = MedGemmaExtractor(self.model_id, self._load_schema())

        # 加载 synthesizer
        self._synthesizer = MedGemmaSynthesizer(self.model_id)

    def _load_schema(self) -> Dict:
        """加载 schema"""
        with open("schemas/radiology_schema.json", "r") as f:
            return json.load(f)

    async def extract(self, report_text: str) -> Dict[str, Any]:
        """提取结构化信息"""
        return self._extractor.extract(report_text)

    async def patient_view(self, extracted: Dict, triage: Dict) -> str:
        """生成患者版本"""
        return self._synthesizer.patient_view(extracted, triage)

    async def family_view(self, extracted: Dict, triage: Dict) -> str:
        """生成家庭版本"""
        return self._synthesizer.family_view(extracted, triage)
```

#### 3. 报告 API (backend/app/api/v1/reports.py)

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.models.schemas import ReportCreate, ReportResponse
from app.models.report import Report
from app.db.session import get_db
from app.services.model_service import ModelService
from app.services.pii_redact import redact_pii
from app.services.triage import triage_risk

router = APIRouter()

@router.get("/reports", response_model=list[ReportResponse])
async def list_reports(
    owner: str,
    db: Session = Depends(get_db)
):
    """获取用户的报告列表"""
    reports = db.query(Report).filter(
        Report.owner == owner
    ).order_by(Report.created_at.desc()).all()
    return reports

@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    """获取报告详情"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("/reports", response_model=ReportResponse, status_code=202)
async def create_report(
    report_data: ReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """创建新报告（后台处理）"""

    # 创建报告记录（初始状态为 processing）
    report = Report(
        owner=report_data.owner,
        visibility=report_data.visibility,
        report_text=report_data.report_text,
        status="processing"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # 后台处理
    background_tasks.add_task(
        process_report_background,
        report.id,
        report_data.report_text,
        report_data.owner,
        report_data.visibility
    )

    return report

async def process_report_background(
    report_id: int,
    report_text: str,
    owner: str,
    visibility: str
):
    """后台处理报告"""
    db = next(get_db())
    model_service = ModelService.get_instance()

    try:
        # 1. PII 脱敏
        redacted = redact_pii(report_text)

        # 2. 提取结构化信息
        extracted, _ = await model_service.extract(redacted)

        # 3. 风险评估
        triage = triage_risk(extracted) if extracted else {"urgency": "UNKNOWN"}

        # 4. 生成解释
        if extracted:
            patient_view = await model_service.patient_view(extracted, triage)
            family_view = await model_service.family_view(extracted, triage)
        else:
            patient_view = "Extraction failed"
            family_view = "Extraction failed"

        # 5. 更新数据库
        report = db.query(Report).filter(Report.id == report_id).first()
        report.report_text = redacted
        report.extracted = extracted
        report.urgency = triage["urgency"]
        report.patient_view = patient_view
        report.family_view = family_view
        report.status = "completed"

        db.commit()

    except Exception as e:
        # 处理失败
        report = db.query(Report).filter(Report.id == report_id).first()
        report.status = "failed"
        report.error_message = str(e)
        db.commit()

    finally:
        db.close()
```

#### 4. 模型 API (backend/app/api/v1/models.py)

```python
from fastapi import APIRouter
from app.services.model_service import ModelService
from app.models.schemas import ExtractRequest, ExtractResponse

router = APIRouter()
model_service = ModelService.get_instance()

@router.post("/extract", response_model=ExtractResponse)
async def extract_structured_data(request: ExtractRequest):
    """提取结构化信息"""
    extracted, _ = await model_service.extract(request.report_text)
    return {"extracted": extracted}

@router.post("/patient-view")
async def generate_patient_view(extracted: dict, triage: dict):
    """生成患者版本"""
    result = await model_service.patient_view(extracted, triage)
    return {"patient_view": result}

@router.post("/family-view")
async def generate_family_view(extracted: dict, triage: dict):
    """生成家庭版本"""
    result = await model_service.family_view(extracted, triage)
    return {"family_view": result}
```

---

### 前端 - Next.js

#### 1. API 客户端 (frontend/src/lib/api.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 报告 API
export const reportsApi = {
  list: (owner: string) =>
    api.get(`/reports?owner=${owner}`),

  get: (id: number) =>
    api.get(`/reports/${id}`),

  create: (data: {
    owner: string;
    visibility: string;
    report_text: string;
  }) => api.post('/reports', data),

  delete: (id: number) =>
    api.delete(`/reports/${id}`),
};

// 模型 API
export const modelsApi = {
  extract: (report_text: string) =>
    api.post('/models/extract', { report_text }),

  patientView: (extracted: any, triage: any) =>
    api.post('/models/patient-view', { extracted, triage }),

  familyView: (extracted: any, triage: any) =>
    api.post('/models/family-view', { extracted, triage }),
};

// 健康 API
export const healthApi = {
  check: () => api.get('/health'),
  modelStatus: () => api.get('/health/models'),
};
```

#### 2. Dashboard 页面 (frontend/src/app/page.tsx)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { ReportCard } from '@/components/reports/ReportCard';
import { MetricCard } from '@/components/dashboard/MetricCard';

export default function DashboardPage() {
  const [owner, setOwner] = useState('alice');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', owner],
    queryFn: () => reportsApi.list(owner).then(res => res.data),
  });

  const metrics = {
    total: reports?.length || 0,
    urgent: reports?.filter(r => r.urgency === 'HIGH' || r.urgency === 'EMERGENCY').length || 0,
    routine: reports?.filter(r => r.urgency === 'LOW').length || 0,
    shared: reports?.filter(r => r.visibility !== 'PRIVATE').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">💝 Family Health Dashboard</h1>
          <p className="text-teal-100">Your trusted companion for understanding medical reports together</p>
        </div>
      </div>

      {/* User Selector */}
      <div className="container mx-auto px-4 py-6">
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="alice">Alice (Self)</option>
          <option value="bob">Bob (Family Member)</option>
        </select>
      </div>

      {/* Metrics */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard label="Total Reports" value={metrics.total} />
          <MetricCard label="Needs Attention" value={metrics.urgent} />
          <MetricCard label="Routine" value={metrics.routine} />
          <MetricCard label="Shared" value={metrics.shared} />
        </div>
      </div>

      {/* Reports List */}
      <div className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4">📋 Recent Reports</h2>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No reports yet. Add your first medical report to get started!
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 3. 报告详情页面 (frontend/src/app/reports/[id]/page.tsx)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { reportsApi } from '@/lib/api';
import { useState } from 'react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = parseInt(params.id as string);
  const [view, setView] = useState<'patient' | 'family'>('patient');

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportsApi.get(reportId).then(res => res.data),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="text-teal-600 hover:text-teal-800 mb-4"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📋 Medical Report #{report.id}
        </h1>
        <p className="text-gray-600">
          Owner: <strong>{report.owner}</strong> •
          Privacy: <strong>{report.visibility}</strong> •
          Created: <strong>{new Date(report.created_at).toLocaleString()}</strong>
        </p>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button className="border-b-2 border-teal-500 py-4 px-1 text-teal-600 font-medium">
                📄 Full Report
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
                💬 Explanation
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
                📊 Structured Data
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View Toggle */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setView('patient')}
                className={`px-6 py-3 rounded-lg font-medium ${
                  view === 'patient'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                🧑‍⚕️ Patient Version
              </button>
              <button
                onClick={() => setView('family')}
                className={`px-6 py-3 rounded-lg font-medium ${
                  view === 'family'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                👨‍👩‍👧‍👦 Family Version
              </button>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              {view === 'patient' ? (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-blue-800 mb-4">
                    🧑‍⚕️ Patient Version
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: report.patient_view }} />
                </div>
              ) : (
                <div className="bg-amber-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-amber-800 mb-4">
                    👨‍👩‍👧‍👦 Family Version
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: report.family_view }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 4. 添加报告页面 (frontend/src/app/add/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportsApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

export default function AddReportPage() {
  const router = useRouter();
  const [reportText, setReportText] = useState('');
  const [owner, setOwner] = useState('alice');
  const [visibility, setVisibility] = useState('SHARED_SUMMARY');

  const mutation = useMutation({
    mutationFn: () => reportsApi.create({
      owner,
      visibility,
      report_text: reportText,
    }),
    onSuccess: (data) => {
      router.push(`/reports/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) {
      alert('Please paste the report text');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">➕ Add Medical Report</h1>
          <p className="text-teal-100">Paste your radiology or medical report for AI-powered analysis</p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Owner
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="alice">Alice</option>
                  <option value="bob">Bob</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Level
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="PRIVATE">🔒 Private (Only Me)</option>
                  <option value="SHARED_SUMMARY">👨‍👩‍👧‍👦 Family Shared</option>
                  <option value="CAREGIVER">🏥 Caregiver Access</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Report Text
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Paste the complete text of your radiology or medical report here..."
                rows={15}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Analyzing...' : '🔍 Analyze Report'}
            </button>

            {mutation.isPending && (
              <div className="mt-4 text-center text-gray-600">
                <div className="animate-pulse">Processing your report... This may take a few minutes.</div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 部署

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - model_cache:/app/.cache
    environment:
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  model_cache:
```

---

## 启动命令

### 开发环境

**后端:**
```bash
cd backend
conda activate medgemma15
uvicorn app.main:app --reload --port 8000
```

**前端:**
```bash
cd frontend
npm install
npm run dev
```

### 生产环境

```bash
docker-compose up -d
```

---

## 优势

1. **🚀 性能优化**
   - 模型预加载，请求立即响应
   - 异步处理，不阻塞用户界面
   - Redis 缓存常见结果

2. **🔧 可维护性**
   - 前后端职责清晰
   - API 版本化管理
   - 类型安全（TypeScript + Pydantic）

3. **📈 可扩展性**
   - 水平扩展后端实例
   - 负载均衡支持
   - 微服务架构

4. **💻 开发体验**
   - 热重载
   - 类型提示
   - API 文档自动生成（FastAPI Swagger）
