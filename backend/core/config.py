from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str     
    DEBUG: bool = False    
    SUPABASE_JWT_SECRET: str
    SUPABASE_URL: str
    SUPABASE_SECRET_KEY: str
    PERENUAL_API_KEY: str
    WEATHER_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
