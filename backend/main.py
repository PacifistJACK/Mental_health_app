from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chat import router as chat_router
from quiz import router as quiz_router

app = FastAPI()

# CORS for React frontend
origins = [
    "http://localhost:3000",                  # Local development
    "https://mentalhealth210.onrender.com",   # Your live React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,                   # Required if you send cookies or headers
    allow_methods=["*"],                      # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],                      # Allows all headers
)

# Include routers
app.include_router(chat_router)
app.include_router(quiz_router)

@app.get("/")
def root():
    return {"message": "Combined API is running successfully!"}