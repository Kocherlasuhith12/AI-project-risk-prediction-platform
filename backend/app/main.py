"""
Smart AI System for Software Project Risk Prediction and Process Optimisation
FastAPI Backend Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import init_db
from app.routes import auth, projects, predictions

app = FastAPI(
    title="Smart AI Risk Prediction System",
    description="AI-driven software project risk prediction and process optimisation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(predictions.router)


@app.on_event("startup")
def startup_event():
    init_db()
    print("✅ Database tables created")


@app.get("/")
def root():
    return {"message": "Smart AI Risk Prediction System API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
