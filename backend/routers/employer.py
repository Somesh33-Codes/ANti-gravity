import json
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from backend.database.db import get_connection
from backend.models.schemas import BlindCandidateResponse, CandidateRevealRequest, CandidateInviteRequest
from backend.utils.security import get_current_employer

router = APIRouter(prefix="/api/employer", tags=["Employer Blind Review & Discovery"])

@router.get("/candidates", response_model=List[BlindCandidateResponse])
def get_candidates(
    skill: Optional[str] = None,
    min_score: Optional[int] = None,
    current_employer: dict = Depends(get_current_employer)
):
    conn = get_connection()
    try:
        # Fetch all students
        students = conn.execute("SELECT * FROM users WHERE role = 'student' ORDER BY id ASC").fetchall()
        
        candidates = []
        for s in students:
            student_id = s["id"]
            
            # Check if this candidate is revealed by current employer
            rev = conn.execute("""
                SELECT revealed_at, interview_invite_sent, invite_note
                FROM revealed_candidates
                WHERE employer_id = ? AND student_id = ?
            """, (current_employer["id"], student_id)).fetchone()
            
            is_revealed = rev is not None
            invite_sent = bool(rev["interview_invite_sent"]) if is_revealed else False
            invite_note = rev["invite_note"] if is_revealed else None
            
            # Fetch verified skills
            skills_rows = conn.execute("""
                SELECT skill_name, proficiency_level, tasks_completed_count
                FROM student_skills
                WHERE student_id = ?
            """, (student_id,)).fetchall()
            
            top_skills = [r["skill_name"] for r in skills_rows]
            
            # Fetch verified submissions & scores
            subs = conn.execute("""
                SELECT s.score, c.title, c.skills_evaluated
                FROM submissions s
                JOIN challenges c ON s.challenge_id = c.id
                WHERE s.student_id = ? AND s.status = 'verified'
            """, (student_id,)).fetchall()
            
            verified_count = len(subs)
            sample_titles = [r["title"] for r in subs]
            
            # Calculate composite skill score
            avg_score = round(sum(r["score"] for r in subs) / len(subs)) if subs else 0
            
            # Skill filter check
            if skill and skill.strip():
                if not any(skill.lower() in ts.lower() for ts in top_skills):
                    continue
                    
            # Min score filter check
            if min_score and avg_score < min_score:
                continue

            candidates.append(BlindCandidateResponse(
                student_id=student_id,
                blind_id=f"Candidate SP-{1000 + student_id}",
                is_revealed=is_revealed,
                full_name=s["full_name"] if is_revealed else None,
                college=s["college"] if is_revealed else None,
                headline=s["headline"] if is_revealed else None,
                email=s["email"] if is_revealed else None,
                top_skills=top_skills,
                skill_scores={
                    "overall_demonstrated_score": avg_score,
                    "verified_tasks": verified_count,
                    "proficiency_tier": "Verified Tier-1 Practical Capability" if avg_score >= 88 else "Intermediate Practical Capability"
                },
                verified_submissions_count=verified_count,
                sample_evidence_titles=sample_titles,
                interview_invite_sent=invite_sent,
                invite_note=invite_note
            ))
            
        return candidates
    finally:
        conn.close()

@router.post("/candidates/reveal", response_model=BlindCandidateResponse)
def reveal_candidate(req: CandidateRevealRequest, current_employer: dict = Depends(get_current_employer)):
    conn = get_connection()
    try:
        student = conn.execute("SELECT * FROM users WHERE id = ? AND role = 'student'", (req.student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Candidate not found.")
            
        with conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR IGNORE INTO revealed_candidates (employer_id, student_id)
                VALUES (?, ?)
            """, (current_employer["id"], req.student_id))
            
        # Return updated candidate record
        return get_candidate_record(current_employer["id"], req.student_id, conn)
    finally:
        conn.close()

@router.post("/candidates/invite")
def send_interview_invite(req: CandidateInviteRequest, current_employer: dict = Depends(get_current_employer)):
    conn = get_connection()
    try:
        student = conn.execute("SELECT * FROM users WHERE id = ? AND role = 'student'", (req.student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Candidate not found.")
            
        with conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO revealed_candidates (employer_id, student_id, interview_invite_sent, invite_note)
                VALUES (?, ?, 1, ?)
                ON CONFLICT(employer_id, student_id)
                DO UPDATE SET interview_invite_sent = 1, invite_note = ?
            """, (current_employer["id"], req.student_id, req.note, req.note))
            
        return {
            "success": True,
            "message": f"Interview invitation officially sent to {student['full_name']} for {current_employer['headline'] or 'Apex Digital Labs'}!",
            "candidate_email": student["email"]
        }
    finally:
        conn.close()

def get_candidate_record(employer_id: int, student_id: int, conn) -> BlindCandidateResponse:
    s = conn.execute("SELECT * FROM users WHERE id = ?", (student_id,)).fetchone()
    rev = conn.execute("""
        SELECT revealed_at, interview_invite_sent, invite_note
        FROM revealed_candidates
        WHERE employer_id = ? AND student_id = ?
    """, (employer_id, student_id)).fetchone()
    
    is_revealed = rev is not None
    invite_sent = bool(rev["interview_invite_sent"]) if is_revealed else False
    invite_note = rev["invite_note"] if is_revealed else None
    
    skills_rows = conn.execute("""
        SELECT skill_name, proficiency_level, tasks_completed_count
        FROM student_skills
        WHERE student_id = ?
    """, (student_id,)).fetchall()
    
    top_skills = [r["skill_name"] for r in skills_rows]
    subs = conn.execute("""
        SELECT s.score, c.title
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.student_id = ? AND s.status = 'verified'
    """, (student_id,)).fetchall()
    
    avg_score = round(sum(r["score"] for r in subs) / len(subs)) if subs else 0
    
    return BlindCandidateResponse(
        student_id=student_id,
        blind_id=f"Candidate SP-{1000 + student_id}",
        is_revealed=is_revealed,
        full_name=s["full_name"] if is_revealed else None,
        college=s["college"] if is_revealed else None,
        headline=s["headline"] if is_revealed else None,
        email=s["email"] if is_revealed else None,
        top_skills=top_skills,
        skill_scores={
            "overall_demonstrated_score": avg_score,
            "verified_tasks": len(subs),
            "proficiency_tier": "Verified Tier-1 Practical Capability" if avg_score >= 88 else "Intermediate Practical Capability"
        },
        verified_submissions_count=len(subs),
        sample_evidence_titles=[r["title"] for r in subs],
        interview_invite_sent=invite_sent,
        invite_note=invite_note
    )
