import json
import hashlib
from fastapi import APIRouter, HTTPException, Response, Depends
from typing import Optional
from backend.database.db import get_connection
from backend.models.schemas import SkillPassportResponse, VerifiedSkillItem, SubmissionResponse, ReviewResponse
from backend.utils.security import get_current_user
from backend.utils.qr import generate_qr_bytes, generate_qr_base64
from backend.config import FRONTEND_URL

router = APIRouter(prefix="/api/passport", tags=["Skill Passport"])

def build_passport(student_id: int, conn) -> SkillPassportResponse:
    student = conn.execute("SELECT * FROM users WHERE id = ? AND role = 'student'", (student_id,)).fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="Student passport not found.")
    
    # Fetch verified skills
    skills_rows = conn.execute("""
        SELECT skill_name, proficiency_level, tasks_completed_count, verified_at
        FROM student_skills
        WHERE student_id = ?
        ORDER BY tasks_completed_count DESC, id ASC
    """, (student_id,)).fetchall()
    
    verified_skills = [
        VerifiedSkillItem(
            skill_name=r["skill_name"],
            proficiency_level=r["proficiency_level"],
            tasks_completed_count=r["tasks_completed_count"],
            verified_at=str(r["verified_at"])
        )
        for r in skills_rows
    ]
    
    # Fetch reviewed evidence (submissions that are verified or in review)
    sub_rows = conn.execute("""
        SELECT s.*, c.title as challenge_title, c.category as challenge_category,
               r.id as review_id, r.reviewer_name, r.reviewer_role, r.similarity_score,
               r.similarity_notes, r.feedback as review_feedback, r.rubric_breakdown, r.verified_at
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        LEFT JOIN reviews r ON s.id = r.submission_id
        WHERE s.student_id = ?
        ORDER BY s.score DESC, s.created_at DESC
    """, (student_id,)).fetchall()
    
    reviewed_evidence = []
    for r in sub_rows:
        review_obj = None
        if r["review_id"]:
            review_obj = ReviewResponse(
                id=r["review_id"],
                reviewer_name=r["reviewer_name"],
                reviewer_role=r["reviewer_role"],
                similarity_score=r["similarity_score"],
                similarity_notes=r["similarity_notes"] or "",
                feedback=r["review_feedback"],
                rubric_breakdown=json.loads(r["rubric_breakdown"]) if r["rubric_breakdown"] else [],
                verified_at=str(r["verified_at"])
            )
        reviewed_evidence.append(SubmissionResponse(
            id=r["id"],
            challenge_id=r["challenge_id"],
            challenge_title=r["challenge_title"],
            challenge_category=r["challenge_category"],
            student_id=r["student_id"],
            solution_url=r["solution_url"] or "",
            solution_code=r["solution_code"],
            approach_explanation=r["approach_explanation"],
            reflection_answers=r["reflection_answers"],
            status=r["status"],
            score=r["score"] or 0,
            created_at=str(r["created_at"]),
            updated_at=str(r["updated_at"]),
            review=review_obj
        ))
    
    blind_id = f"Candidate SP-{1000 + student_id}"
    verification_hash = hashlib.sha256(f"SKILLPROOF-LEDGER-{student_id}-{student['email']}".encode()).hexdigest()[:16].upper()
    passport_url = f"{FRONTEND_URL}/passport/{student_id}"
    
    return SkillPassportResponse(
        student_id=student_id,
        blind_id=blind_id,
        full_name=student["full_name"],
        headline=student["headline"] or "Verified Systems & Software Practitioner",
        college=student["college"] or "Independent Student Engineer",
        graduation_year=student["graduation_year"] or 2028,
        bio=student["bio"] or "",
        verified_skills=verified_skills,
        reviewed_evidence=reviewed_evidence,
        verification_hash=verification_hash,
        passport_url=passport_url,
        issued_date=str(student["created_at"])[:10]
    )

@router.get("/me", response_model=SkillPassportResponse)
def get_my_passport(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    try:
        return build_passport(current_user["id"], conn)
    finally:
        conn.close()

@router.get("/{student_id}", response_model=SkillPassportResponse)
def get_student_passport(student_id: int):
    conn = get_connection()
    try:
        return build_passport(student_id, conn)
    finally:
        conn.close()

@router.get("/{student_id}/qr")
def get_passport_qr_code(student_id: int):
    passport_url = f"{FRONTEND_URL}/passport/{student_id}"
    png_bytes = generate_qr_bytes(passport_url)
    return Response(content=png_bytes, media_type="image/png")
