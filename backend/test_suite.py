from fastapi.testclient import TestClient
from backend.main import app

def test_full_flow():
    with TestClient(app) as client:
        print("--- 1. Testing Root & Health ---")
        res = client.get("/")
        assert res.status_code == 200
        assert "Teekhe Terminals" in res.json()["team"]
        print("✓ Root and Health endpoints working!")

        print("--- 2. Testing Demo Accounts ---")
        res = client.get("/api/auth/demo-accounts")
        assert res.status_code == 200
        demos = res.json()
        assert "student" in demos
        assert "employer" in demos
        print("✓ Demo accounts returned!")

        print("--- 3. Testing Student Login ---")
        res = client.post("/api/auth/login", json={
            "email": "student@skillproof.org",
            "password": "student123"
        })
        assert res.status_code == 200, res.text
        student_token = res.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}
        print("✓ Student authenticated successfully!")

        print("--- 4. Testing Employer Login ---")
        res = client.post("/api/auth/login", json={
            "email": "employer@skillproof.org",
            "password": "employer123"
        })
        assert res.status_code == 200, res.text
        employer_token = res.json()["access_token"]
        employer_headers = {"Authorization": f"Bearer {employer_token}"}
        print("✓ Employer authenticated successfully!")

        print("--- 5. Testing Challenges Listing ---")
        res = client.get("/api/challenges")
        assert res.status_code == 200
        challenges = res.json()
        assert len(challenges) >= 4
        slugs = [c["slug"] for c in challenges]
        print(f"✓ Found {len(challenges)} challenges: {slugs}")

        # Verify our pitch deck challenges are present
        assert "fix-broken-responsive-website" in slugs
        assert "accessible-registration-form" in slugs
        assert "debug-c-program-buffer-parser" in slugs
        assert "customer-support-technical-escalation" in slugs
        print("✓ All 4 core pitch deck challenges verified!")

        print("--- 6. Testing Challenge Detail ---")
        res = client.get("/api/challenges/fix-broken-responsive-website")
        assert res.status_code == 200
        assert "HTML/CSS" in res.json()["skills_evaluated"]
        print("✓ Challenge detail working!")

        print("--- 7. Testing Skill Passport Retrieval ---")
        res = client.get("/api/passport/me", headers=student_headers)
        assert res.status_code == 200
        passport = res.json()
        assert passport["full_name"] == "Aarav Sharma"
        assert len(passport["verified_skills"]) > 0
        assert len(passport["reviewed_evidence"]) > 0
        print(f"✓ Student passport loaded! Verified skills: {[s['skill_name'] for s in passport['verified_skills']]}")

        print("--- 8. Testing Public Passport & QR Endpoint ---")
        student_id = passport["student_id"]
        res = client.get(f"/api/passport/{student_id}")
        assert res.status_code == 200
        qr_res = client.get(f"/api/passport/{student_id}/qr")
        assert qr_res.status_code == 200
        assert qr_res.headers["content-type"] == "image/png"
        print("✓ Public passport view and QR code image generated!")

        print("--- 9. Testing Student Submissions Endpoint ---")
        sub_res = client.get("/api/submissions/my", headers=student_headers)
        assert sub_res.status_code == 200
        assert len(sub_res.json()) >= 3
        print(f"✓ Student has {len(sub_res.json())} submissions!")

        print("--- 10. Testing Employer Candidate Discovery (Blind Review) ---")
        res = client.get("/api/employer/candidates", headers=employer_headers)
        assert res.status_code == 200
        candidates = res.json()
        assert len(candidates) >= 1
        c1 = candidates[0]
        print(f"✓ Candidate blinded identifier: {c1['blind_id']}, Top skills: {c1['top_skills']}")

        print("--- 11. Testing Employer Reveal Candidate ---")
        reveal_res = client.post("/api/employer/candidates/reveal", headers=employer_headers, json={
            "student_id": c1["student_id"]
        })
        assert reveal_res.status_code == 200
        revealed = reveal_res.json()
        assert revealed["is_revealed"] is True
        assert revealed["full_name"] is not None
        print(f"✓ Successfully revealed candidate identity: {revealed['full_name']} ({revealed['college']})")

        print("--- 12. Testing Employer Interview Invitation ---")
        invite_res = client.post("/api/employer/candidates/invite", headers=employer_headers, json={
            "student_id": c1["student_id"],
            "note": "We were very impressed by your responsive design refactor and defensive C buffer parser."
        })
        assert invite_res.status_code == 200
        assert invite_res.json()["success"] is True
        print("✓ Interview invitation sent successfully!")

        print("\n==========================================")
        print("🎉 ALL END-TO-END TESTS PASSED CLEANLY! 🎉")
        print("==========================================")

if __name__ == "__main__":
    test_full_flow()
