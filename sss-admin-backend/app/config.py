from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "sss-admin-backend"
    port: int = 8001

    database_url: str

    allowed_origins: str = "http://localhost:3000"

    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "ap-south-2"
    s3_bucket_name: str

    ai_api_base_url: str = ""
    ai_user_email: str = ""

    db_service_slots: int = 12
    db_reserve: float = 0.2
    db_max_connections_fallback: int = 80

    logout_redirect_url: str = "https://staging.sss.swais.in/"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()