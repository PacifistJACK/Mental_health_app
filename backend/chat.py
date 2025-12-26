from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# ------------------------------
# CHAT HISTORY
# ------------------------------
chat_history = [
    {
        "role": "system",
        "content": (
            "You are a trained mental-health counselor. "
            "Your goal is to provide emotional support, coping strategies, "
            "active listening, grounding advice, and crisis-awareness. "
            "You must speak gently, respectfully, and empathetically. "
            "Never scold, judge, or give medical advice or diagnosis. "
            "If the user asks about topics unrelated to mental health, "
            "politics, programming, general Q&A, or factual questions "
            "such as 'who is the PM of India', kindly decline and redirect "
            "the conversation toward emotional well-being. "
            "If the user expresses self-harm or danger, advise them to seek "
            "immediate in-person professional help or contact emergency hotlines."
        )
    }
]

# ------------------------------
# Pydantic model
# ------------------------------
class UserMessage(BaseModel):
    text: str

# ------------------------------
# Router
# ------------------------------
router = APIRouter()

@router.post("/chat")
def chat(message: UserMessage):
    chat_history.append({"role": "user", "content": message.text})

    payload = {"model": "meta-llama/llama-3.2-3b-instruct:free", "messages": chat_history}
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    try:
        res = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        res.raise_for_status()
        ai_text = res.json()["choices"][0]["message"]["content"]
    except:
        ai_text = "⚠️ AI service unavailable."

    chat_history.append({"role": "assistant", "content": ai_text})
    return {"text": ai_text}

# ------------------------------
# Main app
# ------------------------------
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router)

# Root endpoint
@app.get("/")
def root():
    return {"message": "Chat API is running!"}
