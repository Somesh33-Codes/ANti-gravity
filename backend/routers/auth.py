from fastapi import APIRouter, HTTPException, status, Depends
from backend.database.db import get_connection, get_db
from backend.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.utils.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister):
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (user_in.email.lower(),)).fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
        
        hashed_pw = get_password_hash(user_in.password)
        with conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (email, hashed_password, full_name, role, headline, college, graduation_year)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_in.email.lower(),
                hashed_pw,
                user_in.full_name,
                user_in.role,
                user_in.headline or ("Practical Engineering Student" if user_in.role == "student" else "Engineering Talent Partner"),
                user_in.college or "",
                user_in.graduation_year or 2028
            ))
            user_id = cursor.lastrowid
            
        token = create_access_token({"sub": user_id, "role": user_in.role})
        user_res = UserResponse(
            id=user_id,
            email=user_in.email.lower(),
            full_name=user_in.full_name,
            role=user_in.role,
            headline=user_in.headline or "",
            college=user_in.college or "",
            graduation_year=user_in.graduation_year or 2028,
            bio=""
        )
        return TokenResponse(access_token=token, user=user_res)
    finally:
        conn.close()

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (credentials.email.lower(),)).fetchone()
        if not row or not verify_password(credentials.password, row["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )
        
        token = create_access_token({"sub": row["id"], "role": row["role"]})
        user_res = UserResponse(
            id=row["id"],
            email=row["email"],
            full_name=row["full_name"],
            role=row["role"],
            headline=row["headline"] or "",
            college=row["college"] or "",
            graduation_year=row["graduation_year"] or 2028,
            bio=row["bio"] or ""
        )
        return TokenResponse(access_token=token, user=user_res)
    finally:
        conn.close()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        headline=current_user.get("headline", ""),
        college=current_user.get("college", ""),
        graduation_year=current_user.get("graduation_year", 2028),
        bio=current_user.get("bio", "")
    )

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns quick credentials for reviewers & hackathon judges."""
    return {
        "student": {
            "email": "student@skillproof.org",
            "password": "student123",
            "name": "Aarav Sharma (Tier-3 College, Active Passport & Verified Evidence)",
            "role": "student"
        },
        "student_fresh": {
            "email": "priya@skillproof.org",
            "password": "student123",
            "name": "Priya Nair (1st Year, Active In-Review Submissions)",
            "role": "student"
        },
        "employer": {
            "email": "employer@skillproof.org",
            "password": "employer123",
            "name": "Neha Kapoor (Apex Digital Labs — Blind Reviewer)",
            "role": "employer"
        }
    }
