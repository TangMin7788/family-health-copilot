"""
Health check and monitoring endpoints
"""
from fastapi import APIRouter
from app.services.model_service import ModelService

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Basic health check with database status

    Returns:
        Health status with actual model and database loading status
    """
    model_service = ModelService.get_instance()
    models_loaded = model_service.is_loaded()

    # Check database health
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
    from utils.db import check_db_health
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


@router.get("/health/models")
async def model_health():
    """
    Check model loading status

    Returns:
        Model health status
    """
    model_service = ModelService.get_instance()

    return {
        "status": "ready" if model_service.is_loaded() else "loading",
        "model_id": model_service.model_id,
        "extractor_loaded": model_service._extractor is not None,
        "synthesizer_loaded": model_service._synthesizer is not None
    }


@router.get("/health/cache")
async def cache_health():
    """
    Check cache status (if using Redis)

    Returns:
        Cache health status
    """
    # TODO: Implement Redis health check
    return {
        "status": "not_configured",
        "message": "Redis cache not configured yet"
    }


@router.get("/health/database")
async def database_health():
    """
    Check database health status

    Returns:
        Database health status with actual checks
    """
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
    from utils.db import check_db_health

    return check_db_health()


@router.get("/health/metrics")
async def get_metrics():
    """
    Get system metrics

    Returns:
        System metrics
    """
    import psutil
    import torch

    return {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "gpu_available": torch.cuda.is_available(),
        "gpu_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "gpu_memory_used": torch.cuda.memory_allocated() if torch.cuda.is_available() else 0
    }
