from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from typing import Dict, List

load_dotenv()

API_KEY = os.getenv("API_KEY") 
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = {
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
        "use good amount of emojies in chat"
    )
}

# ------------------------------
# STATE MANAGEMENT
# ------------------------------
# Stores history per user: { "user_123": [msg1, msg2], ... }
user_sessions: Dict[str, List[Dict]] = {}

# ------------------------------
# PYDANTIC MODEL (MATCHES FRONTEND)
# ------------------------------
class ChatRequest(BaseModel):
    user_id: str   # Matches frontend "user_id"
    message: str   # Matches frontend "message"

# ------------------------------
# ROUTER
# ------------------------------
router = APIRouter()

@router.post("/chat")
def chat(data: ChatRequest):
    user_id = data.user_id
    user_input = data.message

    # 1. Initialize session if new user
    if user_id not in user_sessions:
        user_sessions[user_id] = [SYSTEM_PROMPT]
    
    # 2. Append User Message
    user_sessions[user_id].append({"role": "user", "content": user_input})

    # 3. Prepare Payload (Limit context to last 10 messages)
    recent_history = [user_sessions[user_id][0]] + user_sessions[user_id][-10:]
    
    payload = {
        "model": "xiaomi/mimo-v2-flash:free", # Using the model you selected
        "messages": recent_history
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}", 
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mentalhealth210.onrender.com/",
    }

    # 4. Call AI
    try:
        res = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        res.raise_for_status()
        
        response_data = res.json()
        
        if "choices" not in response_data:
            raise ValueError("Invalid API response format")
            
        ai_text = response_data["choices"][0]["message"]["content"]

    except Exception as e:
        print(f"❌ API Error: {e}")
        return {"response": "I'm having trouble connecting right now. Please try again."}

    # 5. Append AI Response to History
    user_sessions[user_id].append({"role": "assistant", "content": ai_text})

    # 6. Return using the key "response" (Matches frontend)
    return {"response": ai_text}
