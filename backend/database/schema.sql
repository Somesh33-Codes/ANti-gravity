-- SkillProof SQLite Schema
-- Designed for Team Teekhe Terminals (Rajat: DB & Backend Logic, Anmol: FastAPI Backend, Suhavi: Architecture)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'employer', 'admin')),
    headline TEXT DEFAULT '',
    college TEXT DEFAULT '',
    graduation_year INTEGER DEFAULT 2028,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_time TEXT NOT NULL,
    skills_evaluated TEXT NOT NULL, -- JSON string array, e.g. ["HTML/CSS", "Responsive Design"]
    task_instructions TEXT NOT NULL,
    starter_code TEXT DEFAULT '',
    test_rubric TEXT NOT NULL, -- JSON string with evaluation criteria
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    solution_url TEXT DEFAULT '',
    solution_code TEXT NOT NULL,
    approach_explanation TEXT NOT NULL,
    reflection_answers TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('submitted', 'in_review', 'verified', 'revision_requested')),
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER UNIQUE NOT NULL REFERENCES submissions(id),
    reviewer_name TEXT NOT NULL,
    reviewer_role TEXT NOT NULL,
    similarity_score INTEGER DEFAULT 0, -- percentage e.g. 8 for 8% similarity
    similarity_notes TEXT DEFAULT '',
    feedback TEXT NOT NULL,
    rubric_breakdown TEXT NOT NULL, -- JSON string array of {criterion, score, comments}
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    skill_name TEXT NOT NULL,
    proficiency_level TEXT NOT NULL, -- e.g. "Beginner", "Advanced beginner", "Intermediate", "Proficient"
    tasks_completed_count INTEGER DEFAULT 1,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_name)
);

CREATE TABLE IF NOT EXISTS revealed_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employer_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    revealed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interview_invite_sent BOOLEAN DEFAULT 0,
    invite_note TEXT DEFAULT '',
    UNIQUE(employer_id, student_id)
);
