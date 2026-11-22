from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field("student", pattern="^(student|employer)$")
    headline: Optional[str] = ""
    college: Optional[str] = ""
    graduation_year: Optional[int] = 2028

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    headline: Optional[str] = ""
    college: Optional[str] = ""
    graduation_year: Optional[int] = 2028
    bio: Optional[str] = ""

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Challenge Schemas
class ChallengeBase(BaseModel):
    title: str
    summary: str
    description: str
    category: str
    difficulty: str
    estimated_time: str
    skills_evaluated: List[str]
    task_instructions: str
    starter_code: Optional[str] = ""
    test_rubric: List[dict]

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeResponse(ChallengeBase):
    id: int
    slug: str
    created_at: str

# Submission Schemas
class SubmissionCreate(BaseModel):
    challenge_id: int
    solution_url: Optional[str] = ""
    solution_code: str = Field(..., min_length=10)
    approach_explanation: str = Field(..., min_length=20)
    reflection_answers: str = Field(..., min_length=10)

class ReviewCreate(BaseModel):
    reviewer_name: str = "SkillProof Senior Peer Reviewer"
    reviewer_role: str = "Verified Technical Reviewer"
    similarity_score: int = 8
    similarity_notes: Optional[str] = "Checked against standard repository corpus. Independent original solution structure verified."
    feedback: str
    rubric_breakdown: List[dict]
    score: int = Field(..., ge=0, le=100)
    status: str = Field("verified", pattern="^(verified|revision_requested)$")

class ReviewResponse(BaseModel):
    id: int
    reviewer_name: str
    reviewer_role: str
    similarity_score: int
    similarity_notes: str
    feedback: str
    rubric_breakdown: List[dict]
    verified_at: str

class SubmissionResponse(BaseModel):
    id: int
    challenge_id: int
    challenge_title: str
    challenge_category: str
    student_id: int
    student_name: Optional[str] = None
    solution_url: Optional[str] = ""
    solution_code: str
    approach_explanation: str
    reflection_answers: str
    status: str
    score: int
    created_at: str
    updated_at: str
    review: Optional[ReviewResponse] = None

# Skill Passport Schemas
class VerifiedSkillItem(BaseModel):
    skill_name: str
    proficiency_level: str
    tasks_completed_count: int
    verified_at: str

class SkillPassportResponse(BaseModel):
    student_id: int
    blind_id: str
    full_name: str
    headline: str
    college: str
    graduation_year: int
    bio: str
    verified_skills: List[VerifiedSkillItem]
    reviewed_evidence: List[SubmissionResponse]
    verification_hash: str
    passport_url: str
    issued_date: str

# Candidate Search Schemas for Employers
class BlindCandidateResponse(BaseModel):
    student_id: int
    blind_id: str # e.g. "Candidate SP-741"
    is_revealed: bool
    full_name: Optional[str] = None # only if is_revealed is True
    college: Optional[str] = None # only if is_revealed is True
    headline: Optional[str] = None # only if is_revealed is True
    email: Optional[str] = None # only if is_revealed is True
    top_skills: List[str]
    skill_scores: dict
    verified_submissions_count: int
    sample_evidence_titles: List[str]
    interview_invite_sent: bool
    invite_note: Optional[str] = None

class CandidateRevealRequest(BaseModel):
    student_id: int

class CandidateInviteRequest(BaseModel):
    student_id: int
    note: str = Field(..., min_length=5)
