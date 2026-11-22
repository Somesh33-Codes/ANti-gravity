from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from backend.config import PROJECT_NAME, PROJECT_DESCRIPTION, PROJECT_VERSION
from backend.database.seed import seed_database
from backend.routers import auth, challenges, submissions, passport, employer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed initial pitch data
    seed_database()
    yield

app = FastAPI(
    title=PROJECT_NAME,
    description=PROJECT_DESCRIPTION,
    version=PROJECT_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development/MVP allow frontend Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router)
app.include_router(challenges.router)
app.include_router(submissions.router)
app.include_router(passport.router)
app.include_router(employer.router)

@app.get("/")
def root():
    return {
        "platform": "SkillProof MVP",
        "team": "Teekhe Terminals",
        "members": ["Suhavi (Lead)", "Anmol (FastAPI)", "Snigdha (Frontend)", "Rajat (Database)", "Somesh (Dashboard)"],
        "status": "operational",
        "docs": "/docs",
        "message": "Prove what you can do, not just what you studied."
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "SkillProof Core Engine"}
