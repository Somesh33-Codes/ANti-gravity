# SkillProof — Student Skill-Verification Platform

> **"Prove what you can do, not just what you studied."**  
> Built by **Team Teekhe Terminals** (First-Semester CSE Hackathon Project)

---

## 🎯 Product Vision & Architecture

SkillProof bridges the gap between student talent and employers by replacing easily inflated certificates and college pedigree filters with **verifiable, reviewed practical work evidence**.

Students solve authentic workplace tasks, receive rubric-based peer evaluations with similarity index checks, and build a persistent **Skill Passport** equipped with an on-demand generated QR code and shareable public profile. Employers can screen candidate pools through a **Blind First Review** mode—evaluating demonstrated engineering and communication skills before candidate names and college backgrounds are revealed.

---

## 👥 Team Teekhe Terminals & Module Ownership

| Member | Assigned Role | Modules & Responsibilities |
|---|---|---|
| **Suhavi** | **Team Leader / Architecture & Integration** | System architecture, environment configuration, frontend/backend integration, CORS, and end-to-end readiness. |
| **Anmol** | **FastAPI Backend** | FastAPI router design (`/auth`, `/challenges`, `/submissions`, `/passport`, `/employer`), Swagger OpenAPI docs, JWT bearer authentication, error handling. |
| **Snigdha** | **Frontend UI & Design** | Editorial design system (warm sand `#F9F8F5`, ink `#141923`, cobalt `#1E6FD9`), typography, landing page, auth forms, responsive CSS. |
| **Rajat** | **Database & Backend Logic** | SQLite relational schema (`schema.sql`), DB connection management, seed data generator, rubric calculations, data persistence. |
| **Somesh** | **Dashboard & Features** | Student dashboard, challenge submission interface with architectural reflection prompts, Skill Passport view, blind employer discovery portal. |

---

## 📁 Repository Structure

```
SP-Git/
├── backend/
│   ├── database/
│   │   ├── db.py               # SQLite connection provider & transaction management (Rajat)
│   │   ├── schema.sql          # Declarative relational schema (Rajat)
│   │   └── seed.py             # Realistic seed data with 4 core pitch challenges & verified submissions
│   ├── models/
│   │   └── schemas.py          # Pydantic schemas for request/response validation (Anmol)
│   ├── routers/
│   │   ├── auth.py             # User registration, login, JWT token generation (Anmol)
│   │   ├── challenges.py       # Challenge browsing, detail view, employer posting (Anmol)
│   │   ├── submissions.py      # Student work submission, rubric review, similarity check (Somesh/Anmol)
│   │   ├── passport.py         # Skill Passport generation, QR code image endpoint (Somesh)
│   │   └── employer.py         # Blind candidate search, identity reveal, interview invitations (Somesh)
│   ├── utils/
│   │   ├── security.py         # Bcrypt password hashing & PyJWT token utilities (Anmol)
│   │   └── qr.py               # Reliable PNG/Base64 QR code generator (Somesh)
│   ├── config.py               # Settings and environment variables (Suhavi)
│   ├── main.py                 # FastAPI application, CORS middleware, lifespan events (Suhavi)
│   ├── test_direct.py          # Backend logic test suite
│   └── test_suite.py           # End-to-end test runner
├── frontend/
│   ├── public/
│   │   └── sp-icon.svg         # Platform favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar with role-aware tabs & demo controls (Snigdha)
│   │   │   └── ui.jsx          # Reusable badges, rubric meters, score dials, empty states (Snigdha/Somesh)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state & session persistence (Somesh)
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Pitch deck value proposition & live sample preview (Snigdha)
│   │   │   ├── Auth.jsx        # Login & Register views with quick demo fills (Snigdha)
│   │   │   ├── Dashboard.jsx   # Student dashboard with recent submissions & skill summary (Somesh)
│   │   │   ├── Challenges.jsx  # Categorized challenge library with difficulty filters (Somesh)
│   │   │   ├── ChallengeDetail.jsx # Challenge instructions, starter code & submission form (Somesh)
│   │   │   ├── SubmissionDetail.jsx # Reviewed evidence file with reviewer breakdown & code (Somesh)
│   │   │   ├── Passport.jsx    # Complete Skill Passport with live QR code & shareable link (Somesh)
│   │   │   └── EmployerDashboard.jsx # Blind candidate search, reveal identity & interview invites (Somesh)
│   │   ├── services/
│   │   │   └── api.js          # Centralized API service layer (Somesh/Suhavi)
│   │   ├── styles/
│   │   │   ├── global.css      # Editorial design system, typography, colors, resets (Snigdha)
│   │   │   ├── navbar.css      # Sticky responsive navigation styling (Snigdha)
│   │   │   └── landing.css     # Landing page & hero presentation styles (Snigdha)
│   │   ├── App.jsx             # React router setup & route access guards (Suhavi)
│   │   └── main.jsx            # React root mount
│   ├── .env                    # Frontend environment configuration
│   ├── .env.example
│   └── package.json
├── requirements.txt            # Python backend dependencies
├── .env.example                # Backend environment configuration
└── README.md                   # Full documentation & run guide
```

---

## 🛠️ The 4 Practical Pitch Deck Challenges (Included in MVP)

1. **Fixing a Broken Responsive Website & Viewport Overflow** (`HTML/CSS`, `Problem-Solving`)
   - *Scenario:* Debug a fractured multi-column layout suffering from fixed pixel widths (`1200px`) and legacy floats that cause horizontal overflow on mobile screens.
2. **Accessible Candidate Registration Form with Custom Validation** (`HTML/CSS`, `JS/DOM`)
   - *Scenario:* Construct a semantic, WCAG-accessible form with live ARIA announcements, keyboard navigation, and custom input sanitization.
3. **Debugging Memory & Boundary Conditions in a C Buffer Parser** (`C Programming`, `Problem-Solving`)
   - *Scenario:* Isolate and fix 3 distinct bugs (off-by-one loop, un-terminated strings, and missing NULL checks) in a comma-separated token parser.
4. **Technical Escalation: Incident Resolution & Client Communication** (`Communication`, `Problem-Solving`)
   - *Scenario:* Write an empathetic, precise, and reassuring response to an enterprise client after an API connection pool exhaustion caused a 28-minute checkout outage.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Python 3.10+** (tested with Python 3.14)
- **Node.js 18+** & **npm**

### 1. Backend Setup (FastAPI)
```bash
# From repository root:
# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed database with realistic initial data (users, challenges, verified passport)
python -c "from backend.database.seed import seed_database; seed_database()"

# 3. Start the FastAPI development server
uvicorn backend.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

### 2. Frontend Setup (React + Vite)
```bash
# Navigate to frontend folder
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Accounts for Reviewers

Quick 1-click fill buttons are provided directly on the Login page (`/login`):

| Role | Email | Password | What to Observe |
|---|---|---|---|
| **Student (Active Passport)** | `student@skillproof.org` | `student123` | **Aarav Sharma**: Tier-3 college student with 3 verified challenges, 90+ evidence score, active Skill Passport, live QR code, and public sharing link. |
| **Student (Fresh Pipeline)** | `priya@skillproof.org` | `student123` | **Priya Nair**: Submitted challenge awaiting verification in pipeline. |
| **Employer (Blind Review)** | `employer@skillproof.org` | `employer123` | **Neha Kapoor**: Access to Candidate Pool where student identities are hidden (`Candidate SP-1001`), filter by skill, inspect code evidence, reveal identity, and send official interview invites. |

---

## ⚖️ Honest Disclosures & MVP Scope

- **Verification**: Reviews in this MVP are generated via our peer review schema & rubric engine to showcase the user experience. Real-world verification would involve assigned human mentors or validated automated test runner execution.
- **Plagiarism Detection**: Submissions undergo an automated structural token similarity index calculation for transparency; it does not claim to connect to third-party proprietary academic plagiarism engines.
- **Data Persistence**: Uses SQLite (`skillproof.db`) for lightweight, zero-configuration local persistence that matches the hackathon scope.
