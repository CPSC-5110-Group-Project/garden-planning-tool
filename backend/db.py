from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    Base.metadata.create_all(bind=engine)

def get_db_status():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            
            res = conn.execute(text("SELECT extname FROM pg_extension;"))
            extensions = [row[0] for row in res.fetchall()]
            
            return {
                "status": "connected",
                "extensions": extensions
            }
    except Exception as e:
        return {
            "status": "not connected",
            "message": f"error: {str(e)}",
            "extensions": []
        }
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()