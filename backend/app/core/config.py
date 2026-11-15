import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SupportDesk AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-for-supportdesk-ai-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database config: defaults to SQLite for immediate local plug-and-play,
    # or PostgreSQL when configured via env (e.g., postgresql+psycopg2://...)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./supportdesk.db")
    
    # AI Engine Configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "demo") # "demo" | "gemini" | "openai"
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
