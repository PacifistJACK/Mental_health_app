from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from quiz import router as quiz_router
from chat import router as chat_router

app = FastAPI(
    title="Mental Health API",
    version="1.0.0"
)

# ================== CORS FIX ==================
# Allows frontend hosted on Render / anywhere to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL later if you want strict security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== ROUTERS ==================
app.include_router(quiz_router)
app.include_router(chat_router)

# ================== ROOT ==================
@app.get("/")
def root():
    return {
        "status": "Backend is running",
        "endpoints": ["/predict", "/chat"]
    }
