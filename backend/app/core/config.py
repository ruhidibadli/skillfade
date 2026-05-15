from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./learning_tracker.db"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@skillfade.website"

    # Application
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Alerts
    ENABLE_ALERTS: bool = True
    MAX_ALERTS_PER_WEEK: int = 1

    # Environment
    ENVIRONMENT: str = "development"

    # Epoint.az payment provider
    EPOINT_PUBLIC_KEY: str = ""
    EPOINT_PRIVATE_KEY: str = ""
    EPOINT_BASE_URL: str = "https://epoint.az/api/1"
    EPOINT_RESULT_URL: str = "https://skillfade.website/api/webhooks/epoint"
    EPOINT_SUCCESS_URL: str = "https://skillfade.website/billing/success"
    EPOINT_ERROR_URL: str = "https://skillfade.website/billing/error"
    EPOINT_LIFETIME_PRICE_AZN: str = "49.00"
    EPOINT_EARLY_BIRD_PRICE_AZN: str = "35.00"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
