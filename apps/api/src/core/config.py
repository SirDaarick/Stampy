from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Stampy API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    POSTGRES_USER: str = "stampy_user"
    POSTGRES_PASSWORD: str = "stampy_secret_pass"
    POSTGRES_DB: str = "stampy_db"
    DATABASE_URL: str = "postgresql+asyncpg://stampy_user:stampy_secret_pass@localhost:5432/stampy_db"
    SYNC_DATABASE_URL: str = "postgresql://stampy_user:stampy_secret_pass@localhost:5432/stampy_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Telegram
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_WEBHOOK_SECRET: Optional[str] = None

    # Security
    JWT_SECRET: str = "super_secret_jwt_key_stampy_change_in_production_min_32_chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 días

    # AI / Vision
    GEMINI_API_KEY: Optional[str] = None

    # Object Storage (S3 / MinIO)
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_BUCKET_NAME: str = "stampy-receipts"
    S3_ACCESS_KEY: str = "stampy_minio_admin"
    S3_SECRET_KEY: str = "stampy_minio_secret"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
