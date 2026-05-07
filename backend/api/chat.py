from fastapi import APIRouter
from pydantic import BaseModel
from services.chat import get_chat_response
from services.weather import get_weather
router = APIRouter()
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]
    lat: float | None = None
    lon: float | None = None

@router.post("/chat")
def chat(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    weather = None
    if request.lat and request.lon:
        try:
            weather = get_weather(request.lat, request.lon)
        except:
            pass
    
    response = get_chat_response(messages, weather)
    return {"response": response}
