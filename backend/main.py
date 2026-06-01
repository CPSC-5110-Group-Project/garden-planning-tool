import sys
import logging
import json
from contextlib import asynccontextmanager
from fastapi.responses import Response
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db, get_db_status
from api.chat import router as chat_router
from api.auth import router as auth_router
from api.gardens import router as gardens_router
from api.visualize import router as visualize_router
from api import plant as plant_router
import models  # ensures all models are registered with Base

logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    try:
        init_db() 
        logger.info("Database initialization complete.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)
    
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)
app.include_router(chat_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(gardens_router, prefix="/api/gardens", tags=["gardens"])
app.include_router(visualize_router, prefix="/api", tags=["visualize"])
app.include_router(plant_router.router, prefix="/plants", tags=["plants"])

@app.get("/")
def read_root():
    return {"message": "Garden Planning Tool is Online!"}

@app.get("/health")
def health_check():
    db_info = get_db_status()

    is_healthy = db_info.get("status") == "connected"

    content = {
        "status": "up" if is_healthy else "down",
        "version": "0.1.0",
        "database": db_info
    }

    return Response(
        content=json.dumps(content, indent=4), 
        media_type="application/json"
    )
