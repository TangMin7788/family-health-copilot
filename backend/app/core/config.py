"""
Application configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8003

    # Database
    DATABASE_URL: str = "sqlite:///./family_health.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Model
    MODEL_ID: str = "medgemma-1.5-4b-it"

    # CORS
    FRONTEND_URL: str = "http://localhost:3002"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
