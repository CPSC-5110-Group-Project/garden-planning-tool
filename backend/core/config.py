from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str     
    DEBUG: bool = False    
    SUPABASE_JWT_SECRET: str
    PERENUAL_API_KEY: str
    WEATHER_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()