import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from db import Base


class GardenDB(Base):
    __tablename__ = "gardens"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    x = Column(Float, default=0)
    y = Column(Float, default=0)
    rows = Column(Integer, default=5)
    cols = Column(Integer, default=5)
    plots = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
