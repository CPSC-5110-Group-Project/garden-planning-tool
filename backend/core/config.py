from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False
    SUPABASE_JWT_SECRET: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SECRET_KEY: Optional[str] = None
    PERENUAL_API_KEY: str
    WEATHER_API_KEY: str
    GROQ_API_KEY: str
    HF_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings() # type: ignore[call-arg]
