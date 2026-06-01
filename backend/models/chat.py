from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.sql import func
from db import Base


class ChatSessionDB(Base):
    __tablename__ = "chat_sessions"

    id         = Column(String, primary_key=True)
    user_id    = Column(String, nullable=False, index=True)
    title      = Column(String, nullable=False, default="New Chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ChatMessageDB(Base):
    __tablename__ = "chat_messages"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_id    = Column(String, nullable=False, index=True)
    session_id = Column(String, nullable=True, index=True)
    role       = Column(String, nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
