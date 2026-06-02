import uuid
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db import get_db
from core.auth import get_current_user, get_user_from_token
from models.chat import ChatMessageDB, ChatSessionDB
from services.chat import get_chat_response
from services.weather import get_weather

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    session_id: str | None = None
    lat: float | None = None
    lon: float | None = None
    image: str | None = None
    garden_image: str | None = None
    user_name: str | None = None
    is_guest: bool = False


# ── Sessions ──────────────────────────────────────────────────────────────────

@router.get("/chat/sessions")
def list_sessions(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ChatSessionDB)
        .filter(ChatSessionDB.user_id == user_id)
        .order_by(ChatSessionDB.updated_at.desc())
        .limit(30)
        .all()
    )
    return [{"id": r.id, "title": r.title, "updated_at": str(r.updated_at)} for r in rows]


@router.get("/chat/sessions/{session_id}")
def get_session_messages(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.session_id == session_id, ChatMessageDB.user_id == user_id)
        .order_by(ChatMessageDB.created_at)
        .all()
    )
    return [{"role": r.role, "content": r.content} for r in rows]


@router.delete("/chat/sessions/{session_id}")
def delete_session(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(ChatMessageDB).filter_by(session_id=session_id, user_id=user_id).delete()
    db.query(ChatSessionDB).filter_by(id=session_id, user_id=user_id).delete()
    db.commit()
    return {"ok": True}


# ── Chat ──────────────────────────────────────────────────────────────────────

@router.post("/chat")
def chat(
    request: ChatRequest,
    authorization: str = Header(default=None),
    db: Session = Depends(get_db),
):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    weather = None
    if request.lat and request.lon:
        try:
            weather = get_weather(request.lat, request.lon)
        except Exception:
            pass

    response = get_chat_response(
        messages,
        weather,
        request.image,
        user_name=request.user_name,
        is_guest=request.is_guest,
        garden_image=request.garden_image,
    )

    # Persist for logged-in users
    used_session_id = request.session_id
    if not request.is_guest and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        user_id = get_user_from_token(token)
        try:
            if user_id:
                if not used_session_id:
                    # Create new session — title from first user message
                    used_session_id = str(uuid.uuid4())
                    first_msg = next((m.content for m in request.messages if m.role == "user"), "New Chat")
                    title = first_msg[:50] + ("..." if len(first_msg) > 50 else "")
                    db.add(ChatSessionDB(id=used_session_id, user_id=user_id, title=title))
                else:
                    # Ensure session exists
                    sess = db.query(ChatSessionDB).filter_by(id=used_session_id, user_id=user_id).first()
                    if not sess:
                        first_msg = next((m.content for m in request.messages if m.role == "user"), "New Chat")
                        title = first_msg[:50] + ("..." if len(first_msg) > 50 else "")
                        db.add(ChatSessionDB(id=used_session_id, user_id=user_id, title=title))

                # Save the latest user message + assistant response
                if request.messages:
                    last = request.messages[-1]
                    db.add(ChatMessageDB(user_id=user_id, session_id=used_session_id, role=last.role, content=last.content))
                db.add(ChatMessageDB(user_id=user_id, session_id=used_session_id, role="assistant", content=response))
                db.commit()
        except Exception as e:
            import logging
            logging.getLogger("uvicorn.error").warning(f"Session DB write failed: {e}")

    return {"response": response, "session_id": used_session_id}
