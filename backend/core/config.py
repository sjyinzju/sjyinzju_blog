from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_EMAIL: str = ""

    # S3 / MinIO
    S3_ENDPOINT_URL: str = "http://127.0.0.1:9000"
    S3_ACCESS_KEY: str = "admin"
    S3_SECRET_KEY: str = "password123"
    S3_BUCKET_NAME: str = "avatars"
    SECURE_COOKIES: bool = False

    class Config:
        env_file = ".env"

settings = Settings()