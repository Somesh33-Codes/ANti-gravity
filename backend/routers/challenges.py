import json
import re
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from backend.database.db import get_connection
from backend.models.schemas import ChallengeResponse, ChallengeCreate
from backend.utils.security import get_current_user, get_current_employer

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[-\s]+', '-', text)

@router.get("", response_model=List[ChallengeResponse])
def get_challenges(category: Optional[str] = None, difficulty: Optional[str] = None):
    conn = get_connection()
    try:
        query = "SELECT * FROM challenges WHERE 1=1"
        params = []
        if category and category.strip():
            query += " AND category = ?"
            params.append(category)
        if difficulty and difficulty.strip():
            query += " AND difficulty = ?"
            params.append(difficulty)
        query += " ORDER BY id ASC"
        
        rows = conn.execute(query, params).fetchall()
        result = []
        for r in rows:
            result.append(ChallengeResponse(
                id=r["id"],
                title=r["title"],
                slug=r["slug"],
                summary=r["summary"],
                description=r["description"],
                category=r["category"],
                difficulty=r["difficulty"],
                estimated_time=r["estimated_time"],
                skills_evaluated=json.loads(r["skills_evaluated"]) if r["skills_evaluated"] else [],
                task_instructions=r["task_instructions"],
                starter_code=r["starter_code"] or "",
                test_rubric=json.loads(r["test_rubric"]) if r["test_rubric"] else [],
                created_at=str(r["created_at"])
            ))
        return result
    finally:
        conn.close()

@router.get("/{challenge_id_or_slug}", response_model=ChallengeResponse)
def get_challenge(challenge_id_or_slug: str):
    conn = get_connection()
    try:
        if challenge_id_or_slug.isdigit():
            row = conn.execute("SELECT * FROM challenges WHERE id = ?", (int(challenge_id_or_slug),)).fetchone()
        else:
            row = conn.execute("SELECT * FROM challenges WHERE slug = ?", (challenge_id_or_slug,)).fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge '{challenge_id_or_slug}' not found."
            )
        
        return ChallengeResponse(
            id=row["id"],
            title=row["title"],
            slug=row["slug"],
            summary=row["summary"],
            description=row["description"],
            category=row["category"],
            difficulty=row["difficulty"],
            estimated_time=row["estimated_time"],
            skills_evaluated=json.loads(row["skills_evaluated"]) if row["skills_evaluated"] else [],
            task_instructions=row["task_instructions"],
            starter_code=row["starter_code"] or "",
            test_rubric=json.loads(row["test_rubric"]) if row["test_rubric"] else [],
            created_at=str(row["created_at"])
        )
    finally:
        conn.close()

@router.post("", response_model=ChallengeResponse)
def create_challenge(challenge_in: ChallengeCreate, user: dict = Depends(get_current_employer)):
    """Allows employers/admins to post real job task challenges."""
    conn = get_connection()
    try:
        slug = slugify(challenge_in.title)
        # Check if slug exists
        existing = conn.execute("SELECT id FROM challenges WHERE slug = ?", (slug,)).fetchone()
        if existing:
            slug = f"{slug}-{int(conn.execute('SELECT COUNT(*) as c FROM challenges').fetchone()['c']) + 1}"
            
        with conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO challenges (title, slug, summary, description, category, difficulty, estimated_time, skills_evaluated, task_instructions, starter_code, test_rubric, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                challenge_in.title,
                slug,
                challenge_in.summary,
                challenge_in.description,
                challenge_in.category,
                challenge_in.difficulty,
                challenge_in.estimated_time,
                json.dumps(challenge_in.skills_evaluated),
                challenge_in.task_instructions,
                challenge_in.starter_code or "",
                json.dumps(challenge_in.test_rubric),
                user["id"]
            ))
            challenge_id = cursor.lastrowid
            
        return ChallengeResponse(
            id=challenge_id,
            title=challenge_in.title,
            slug=slug,
            summary=challenge_in.summary,
            description=challenge_in.description,
            category=challenge_in.category,
            difficulty=challenge_in.difficulty,
            estimated_time=challenge_in.estimated_time,
            skills_evaluated=challenge_in.skills_evaluated,
            task_instructions=challenge_in.task_instructions,
            starter_code=challenge_in.starter_code or "",
            test_rubric=challenge_in.test_rubric,
            created_at="just now"
        )
    finally:
        conn.close()
