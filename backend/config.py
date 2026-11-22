import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Database configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "database" / "skillproof.db"))

# JWT and Security
SECRET_KEY = os.getenv("SECRET_KEY", "teekhe-terminals-skillproof-secret-token-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for hackathon convenience

# Frontend App URL for QR codes and passport sharing
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Project Metadata
PROJECT_NAME = "SkillProof API"
PROJECT_DESCRIPTION = "Skill-First Student Verification Platform by Team Teekhe Terminals"
PROJECT_VERSION = "1.0.0"
