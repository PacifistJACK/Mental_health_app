from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chat import router as chat_router
from quiz import router as quiz_router

app = FastAPI()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)
app.include_router(quiz_router)

@app.get("/")
def root():
    return {"message": "Combined API is running successfully!"}