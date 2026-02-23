"""
Family Health Copilot API
FastAPI backend with pre-loaded AI models
"""
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import reports, models, health, chat
from app.core.config import settings
from app.services.model_service import ModelService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage lifespan events"""
    # Startup
    print("🚀 Starting Family Health Copilot API...")

    # Initialize database with actual status checking
    from utils.db import init_db, check_db_health
    print("🔧 Initializing database...")
    db_status = init_db()

    if db_status.get("status") == "healthy":
        print(f"✅ Database initialized: {db_status.get('tables_created', 0)} tables ready")
    else:
        print(f"⚠️ Database initialization warning: {db_status.get('error', 'Unknown error')}")

    # Load models
    print("🔄 Pre-loading AI models...")
    ModelService.get_instance()
    print("✅ Models loaded successfully!")

    print(f"🌐 API running at http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"📚 Documentation at http://{settings.API_HOST}:{settings.API_PORT}/docs")

    yield

    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Family Health Copilot API",
    description="AI-powered medical report analysis for families",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Family Health Copilot API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint - returns actual model and database status"""
    model_service = ModelService.get_instance()
    models_loaded = model_service.is_loaded()

    # Check database health
    from db import check_db_health
    db_health = check_db_health()

    # Overall status: healthy only if both models and DB are healthy
    overall_status = "healthy" if (models_loaded and db_health.get("status") == "healthy") else "degraded"

    return {
        "status": overall_status,
        "models_loaded": models_loaded,
        "database": {
            "status": db_health.get("status", "unknown"),
            "report_count": db_health.get("report_count", 0),
            "tables_present": db_health.get("tables_present", [])
        },
        "service": "family-health-copilot",
        "version": "2.0.0"
    }
