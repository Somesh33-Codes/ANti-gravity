import json
from backend.database.seed import seed_database
from backend.routers.auth import login, get_demo_accounts
from backend.routers.challenges import get_challenges, get_challenge
from backend.routers.passport import get_student_passport, get_passport_qr_code
from backend.routers.employer import get_candidates, reveal_candidate, send_interview_invite
from backend.models.schemas import UserLogin, CandidateRevealRequest, CandidateInviteRequest

def run_direct_tests():
    print("1. Initializing and verifying seed database...")
    seed_database()
    print("✓ DB seeded.")

    print("2. Testing Demo Accounts...")
    demos = get_demo_accounts()
    assert "student" in demos
    assert "employer" in demos
    print("✓ Demo accounts returned:", list(demos.keys()))

    print("3. Testing Student Login...")
    student_res = login(UserLogin(email="student@skillproof.org", password="student123"))
    assert student_res.access_token is not None
    assert student_res.user.full_name == "Aarav Sharma"
    print("✓ Student login success:", student_res.user.full_name, "role:", student_res.user.role)

    print("4. Testing Employer Login...")
    emp_res = login(UserLogin(email="employer@skillproof.org", password="employer123"))
    assert emp_res.access_token is not None
    assert emp_res.user.role == "employer"
    print("✓ Employer login success:", emp_res.user.full_name, "role:", emp_res.user.role)

    print("5. Testing Challenges...")
    challenges = get_challenges(None, None)
    assert len(challenges) >= 4
    slugs = [c.slug for c in challenges]
    print(f"✓ Found {len(challenges)} challenges:")
    for s in slugs:
        print(f"   - {s}")
    assert "fix-broken-responsive-website" in slugs
    assert "accessible-registration-form" in slugs
    assert "debug-c-program-buffer-parser" in slugs
    assert "customer-support-technical-escalation" in slugs

    print("6. Testing Specific Challenge Detail...")
    ch = get_challenge("fix-broken-responsive-website")
    assert ch.title == "Fixing a Broken Responsive Website & Viewport Overflow"
    assert "HTML/CSS" in ch.skills_evaluated
    print("✓ Challenge detail loaded:", ch.title)

    print("7. Testing Skill Passport...")
    passport = get_student_passport(student_res.user.id)
    assert passport.full_name == "Aarav Sharma"
    assert len(passport.verified_skills) > 0
    assert len(passport.reviewed_evidence) > 0
    print("✓ Passport loaded:")
    print("   Student:", passport.full_name)
    print("   Blind ID:", passport.blind_id)
    print("   Hash:", passport.verification_hash)
    print("   Skills:", [s.skill_name for s in passport.verified_skills])
    print("   Evidence count:", len(passport.reviewed_evidence))

    print("8. Testing QR code generation...")
    qr_response = get_passport_qr_code(student_res.user.id)
    assert qr_response.media_type == "image/png"
    assert len(qr_response.body) > 100
    print(f"✓ QR PNG generated ({len(qr_response.body)} bytes)")

    print("9. Testing Employer Blind Candidate Discovery...")
    employer_user = {"id": emp_res.user.id, "role": "employer", "headline": "Talent Partner"}
    candidates = get_candidates(None, None, employer_user)
    assert len(candidates) >= 1
    c1 = candidates[0]
    print("✓ Candidate blind ID:", c1.blind_id)
    print("   Verified tasks:", c1.verified_submissions_count)
    print("   Top skills:", c1.top_skills)

    print("10. Testing Candidate Reveal...")
    rev = reveal_candidate(CandidateRevealRequest(student_id=c1.student_id), employer_user)
    assert rev.is_revealed is True
    assert rev.full_name == "Aarav Sharma"
    print("✓ Revealed name:", rev.full_name, "college:", rev.college)

    print("11. Testing Interview Invitation...")
    inv = send_interview_invite(
        CandidateInviteRequest(student_id=c1.student_id, note="We were thrilled by your work on C memory debugging!"),
        employer_user
    )
    assert inv["success"] is True
    print("✓ Invitation message:", inv["message"])

    print("\n=======================================================")
    print("🏆 ALL 11 BACKEND LOGICAL VALIDATIONS SUCCEEDED! 🏆")
    print("=======================================================")

if __name__ == "__main__":
    run_direct_tests()
