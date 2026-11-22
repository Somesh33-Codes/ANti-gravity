import json
import sqlite3
from datetime import datetime, timezone
from backend.database.db import get_db, init_db
from backend.utils.security import get_password_hash

def seed_database():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] > 0:
            print("Database already contains data, skipping seed.")
            return

        print("Seeding SkillProof database with realistic data for Team Teekhe Terminals...")

        # 1. Insert Users
        # Student 1: Aarav Sharma (Tier-3 college, 1st yr CSE with strong practical skills)
        pw_student = get_password_hash("student123")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, headline, college, graduation_year, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "student@skillproof.org",
            pw_student,
            "Aarav Sharma",
            "student",
            "First-Year CSE Student & Practical Systems Builder",
            "Government Engineering College, Bilaspur",
            2028,
            "Passionate about writing clean C code, fixing tricky CSS responsive layouts, and solving real customer software issues. Proving competence through verified work."
        ))
        aarav_id = cursor.lastrowid

        # Student 2: Priya Nair (Frontend & Accessibility focus)
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, headline, college, graduation_year, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "priya@skillproof.org",
            pw_student,
            "Priya Nair",
            "student",
            "Aspiring Frontend Engineer & UI Craftsman",
            "Shri Shankaracharya Technical Campus",
            2028,
            "Focused on semantic HTML, WCAG accessibility, and responsive layouts that perform well on low-bandwidth devices."
        ))
        priya_id = cursor.lastrowid

        # Employer: Neha Kapoor (Apex Digital Labs)
        pw_employer = get_password_hash("employer123")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, headline, college, graduation_year, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "employer@skillproof.org",
            pw_employer,
            "Neha Kapoor",
            "employer",
            "Head of Engineering Recruitment @ Apex Digital Labs",
            "IIT Delhi (Alum)",
            2015,
            "We believe in blind, skill-first hiring. We hire based on code evidence and architectural reasoning rather than college tier labels."
        ))
        employer_id = cursor.lastrowid

        # 2. Insert Skills
        skills = [
            ("HTML/CSS", "Frontend", "Semantic layout, flexbox, CSS grid, media queries, accessibility"),
            ("C Programming", "Software Engineering", "Pointers, memory allocation, arrays, boundary conditions, standard I/O"),
            ("Communication", "Professional Skills", "Technical articulation, empathetic customer escalation response, documentation"),
            ("Problem-Solving", "General Engineering", "Root cause debugging, edge case identification, performance tradeoffs"),
            ("JavaScript / DOM", "Frontend", "Client-side validation, event delegation, async DOM operations")
        ]
        for name, category, desc in skills:
            cursor.execute("INSERT OR IGNORE INTO skills (name, category, description) VALUES (?, ?, ?)", (name, category, desc))

        # 3. Insert Practical Pitch-Deck Challenges
        challenges = [
            {
                "title": "Fixing a Broken Responsive Website & Viewport Overflow",
                "slug": "fix-broken-responsive-website",
                "summary": "Debug a fractured multi-column page layout that breaks on mobile screens, overflows horizontally, and suffers from rigid fixed-pixel widths.",
                "description": (
                    "In real engineering work, you rarely build from a blank slate. You are handed existing markup with stubborn layout bugs. "
                    "This challenge puts you in the shoes of a frontend developer tasked with fixing a broken product landing page. "
                    "The client reported that their mobile users cannot read product features because columns stack incorrectly, "
                    "navigation spills outside the screen, and images cause horizontal scrollbars."
                ),
                "category": "Frontend Development",
                "difficulty": "Beginner",
                "estimated_time": "45 mins",
                "skills_evaluated": json.dumps(["HTML/CSS", "Problem-Solving"]),
                "task_instructions": (
                    "1. Diagnose why horizontal scrolling occurs on viewports narrower than 480px.\n"
                    "2. Convert fixed-width table/div elements to fluid CSS Grid or Flexbox layouts.\n"
                    "3. Implement proper meta viewport behavior and relative typography (rem/ch).\n"
                    "4. Ensure images have max-width: 100% and height: auto.\n"
                    "5. Document your approach, explaining specifically why the previous CSS failed."
                ),
                "starter_code": (
                    "/* BROKEN CSS SNIPPET TO FIX */\n"
                    ".container {\n"
                    "  width: 1200px; /* Bug: causes overflow on mobile */\n"
                    "  margin: 0 auto;\n"
                    "}\n"
                    ".feature-card {\n"
                    "  float: left;\n"
                    "  width: 380px;\n"
                    "  margin: 10px;\n"
                    "}\n"
                    "img.hero-banner {\n"
                    "  width: 1200px;\n"
                    "}\n"
                    "/* Requirement: Refactor using modern CSS Grid/Flexbox without fixed widths */"
                ),
                "test_rubric": json.dumps([
                    {"criterion": "Viewport Responsiveness", "weight": "30%", "description": "No horizontal scroll from 320px to 1440px"},
                    {"criterion": "CSS Architecture", "weight": "30%", "description": "Clean Flexbox/Grid usage replacing legacy floats"},
                    {"criterion": "Approach & Reasoning", "weight": "40%", "description": "Clear explanation of viewport root cause and layout refactor"}
                ]),
                "created_by": employer_id
            },
            {
                "title": "Accessible Candidate Registration Form with Custom Validation",
                "slug": "accessible-registration-form",
                "summary": "Build a robust, keyboard-navigable registration form with live semantic error states, ARIA announcements, and input sanitization.",
                "description": (
                    "Forms are where user input meets business rules. A high quality form must not only look crisp; it must be fully accessible "
                    "to screen readers, allow keyboard navigation, provide immediate and non-jarring validation messages, and handle edge cases gracefully."
                ),
                "category": "Frontend Development",
                "difficulty": "Intermediate",
                "estimated_time": "60 mins",
                "skills_evaluated": json.dumps(["HTML/CSS", "JavaScript / DOM", "Problem-Solving"]),
                "task_instructions": (
                    "1. Construct semantic form markup using proper <label>, <input>, and <fieldset> tags.\n"
                    "2. Implement real-time validation for email formatting, password strength criteria, and matching confirmations.\n"
                    "3. Connect error states using aria-describedby and aria-invalid attributes for accessibility.\n"
                    "4. Add keyboard accessibility (Tab, Enter, Escape) and submit state prevention.\n"
                    "5. Provide code and explanation of your validation strategy."
                ),
                "starter_code": (
                    "<!-- REGISTRATION FORM STARTER -->\n"
                    "<form id=\"register-form\" novalidate>\n"
                    "  <div class=\"field-group\">\n"
                    "    <label for=\"fullName\">Full Name</label>\n"
                    "    <input type=\"text\" id=\"fullName\" name=\"fullName\" required aria-required=\"true\">\n"
                    "    <span class=\"error-msg\" id=\"name-error\" role=\"alert\"></span>\n"
                    "  </div>\n"
                    "  <!-- Complete email, password, role select, and submit handler with JS -->\n"
                    "</form>"
                ),
                "test_rubric": json.dumps([
                    {"criterion": "ARIA & Accessibility", "weight": "35%", "description": "Screen reader compatible with live error announcements"},
                    {"criterion": "Validation Logic", "weight": "35%", "description": "Handles edge cases, trimming, and instant feedback"},
                    {"criterion": "User Experience", "weight": "30%", "description": "Clean layout, clear error recovery states"}
                ]),
                "created_by": employer_id
            },
            {
                "title": "Debugging Memory & Boundary Conditions in a C Buffer Parser",
                "slug": "debug-c-program-buffer-parser",
                "summary": "Identify off-by-one errors, missing null terminators, and uninitialized pointers in a C string parsing utility.",
                "description": (
                    "In low-level systems programming, subtle pointer arithmetic and boundary mistakes lead to buffer overflows and undefined behavior. "
                    "Analyze the provided C code snippet designed to parse comma-separated key-value tokens, find the 3 distinct defects, and provide the corrected code with memory safety commentary."
                ),
                "category": "Software Engineering",
                "difficulty": "Intermediate",
                "estimated_time": "50 mins",
                "skills_evaluated": json.dumps(["C Programming", "Problem-Solving"]),
                "task_instructions": (
                    "1. Locate the off-by-one buffer boundary calculation in parse_tokens().\n"
                    "2. Fix the missing string null-terminator in the destination array.\n"
                    "3. Guard against NULL pointer dereference when processing empty token segments.\n"
                    "4. Submit the corrected C program with a technical walkthrough explaining how each defect was isolated and resolved."
                ),
                "starter_code": (
                    "#include <stdio.h>\n"
                    "#include <stdlib.h>\n"
                    "#include <string.h>\n\n"
                    "/* BUGGY C CODE: Find the 3 memory/boundary bugs */\n"
                    "void parse_tokens(const char *input, char tokens[5][32]) {\n"
                    "    int count = 0;\n"
                    "    int char_idx = 0;\n"
                    "    for (int i = 0; i <= strlen(input); i++) { /* Bug 1: condition & re-eval */\n"
                    "        if (input[i] == ',' || input[i] == '\\0') {\n"
                    "            tokens[count][char_idx] = '\\0'; /* Bug 2: boundary overflow check missing */\n"
                    "            count++;\n"
                    "            char_idx = 0;\n"
                    "        } else {\n"
                    "            tokens[count][char_idx++] = input[i];\n"
                    "        }\n"
                    "    }\n"
                    "}"
                ),
                "test_rubric": json.dumps([
                    {"criterion": "Bug Isolation", "weight": "40%", "description": "All 3 memory/boundary flaws correctly identified"},
                    {"criterion": "Corrected Implementation", "weight": "35%", "description": "C99 compliant code compiles with no warnings (-Wall -Wextra)"},
                    {"criterion": "Safety Reasoning", "weight": "25%", "description": "Accurate explanation of buffer overflows & strlen overhead"}
                ]),
                "created_by": employer_id
            },
            {
                "title": "Technical Escalation: Incident Resolution & Client Communication",
                "slug": "customer-support-technical-escalation",
                "summary": "Draft an empathetic, precise, and reassuring technical response to an enterprise customer experiencing an unexpected API outage.",
                "description": (
                    "Great engineers are also exceptional communicators. When production breaks, clients are frustrated and anxious. "
                    "You are handed an angry support ticket from an operations manager whose webhook integration halted during peak checkout hours. "
                    "Write a professional response that acknowledges their frustration, explains the root cause without jargon-overload, outlines the fix, and details preventative measures."
                ),
                "category": "Professional Skills",
                "difficulty": "Beginner",
                "estimated_time": "35 mins",
                "skills_evaluated": json.dumps(["Communication", "Problem-Solving"]),
                "task_instructions": (
                    "1. Open with immediate empathy and validation of the customer's operational impact.\n"
                    "2. Provide an honest, calm explanation of the 504 Gateway Timeout root cause (database pool exhaustion).\n"
                    "3. Summarize the immediate mitigation deployed by the team.\n"
                    "4. Detail two concrete preventative safeguards (circuit breakers + horizontal replica autoscaling).\n"
                    "5. Offer next steps and direct contact availability, maintaining a calm, authoritative, and respectful tone."
                ),
                "starter_code": (
                    "CUSTOMER TICKET: \"Ticket #84920 - URGENT: Our automated billing checkout failed for 28 minutes!\n"
                    "Our customers are calling us asking why cards were rejected. We pay for 99.9% uptime SLA!\n"
                    "What happened and how will you compensate us? We need answers ASAP.\"\n\n"
                    "YOUR TASK: Draft your complete response email below."
                ),
                "test_rubric": json.dumps([
                    {"criterion": "Tone & Empathy", "weight": "35%", "description": "Defuses tension without making false promises"},
                    {"criterion": "Technical Clarity", "weight": "35%", "description": "Explains complex systems failures in accessible language"},
                    {"criterion": "Accountability & Next Steps", "weight": "30%", "description": "Clear resolution timeline and preventative safeguards"}
                ]),
                "created_by": employer_id
            }
        ]

        challenge_ids = {}
        for ch in challenges:
            cursor.execute("""
                INSERT INTO challenges (title, slug, summary, description, category, difficulty, estimated_time, skills_evaluated, task_instructions, starter_code, test_rubric, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ch["title"], ch["slug"], ch["summary"], ch["description"], ch["category"],
                ch["difficulty"], ch["estimated_time"], ch["skills_evaluated"],
                ch["task_instructions"], ch["starter_code"], ch["test_rubric"], ch["created_by"]
            ))
            challenge_ids[ch["slug"]] = cursor.lastrowid

        # 4. Insert Verified Submissions for Aarav (To showcase a populated Skill Passport)
        # Submission 1: Fixing Broken Responsive Website
        cursor.execute("""
            INSERT INTO submissions (challenge_id, student_id, solution_url, solution_code, approach_explanation, reflection_answers, status, score, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'verified', 94, datetime('now', '-5 days'), datetime('now', '-4 days'))
        """, (
            challenge_ids["fix-broken-responsive-website"],
            aarav_id,
            "https://github.com/aarav-dev/responsive-fix-demo",
            (
                "/* REFACTORED RESPONSIVE CSS */\n"
                ":root {\n"
                "  --content-max-width: 1200px;\n"
                "  --gap-standard: clamp(1rem, 3vw, 2rem);\n"
                "}\n\n"
                ".container {\n"
                "  width: min(100% - 2rem, var(--content-max-width));\n"
                "  margin-inline: auto;\n"
                "}\n\n"
                ".features-grid {\n"
                "  display: grid;\n"
                "  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));\n"
                "  gap: var(--gap-standard);\n"
                "}\n\n"
                "img.responsive-asset {\n"
                "  max-width: 100%;\n"
                "  height: auto;\n"
                "  display: block;\n"
                "  object-fit: cover;\n"
                "}"
            ),
            (
                "I identified that the primary defect stemmed from hardcoded pixel widths (`width: 1200px`) on top-level wrappers "
                "and legacy `float: left` rules with no clearfix. On viewports below 480px, child blocks forced the viewport to stretch horizontally. "
                "I refactored the layout to use CSS Grid with `repeat(auto-fit, minmax(min(100%, 300px), 1fr))`, eliminating all horizontal overflow "
                "and ensuring smooth transitions between mobile, tablet, and desktop without bulky media query overrides."
            ),
            (
                "Follow-up: Why use `min(100% - 2rem, 1200px)` instead of `max-width: 1200px; width: 100%`?\n"
                "Answer: `width: min()` allows intrinsic margin buffering on mobile screens without requiring separate padding hacks on parent wrappers, "
                "preventing content from clinging to the screen edge on 320px devices."
            )
        ))
        sub1_id = cursor.lastrowid

        # Review for Submission 1
        cursor.execute("""
            INSERT INTO reviews (submission_id, reviewer_name, reviewer_role, similarity_score, similarity_notes, feedback, rubric_breakdown, verified_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-4 days'))
        """, (
            sub1_id,
            "Vikram Sethi",
            "Staff Frontend Engineer & Reviewer",
            6,
            "6% syntax overlap with common modern CSS templates. Original architectural explanation and clamp logic verified.",
            "Exceptional architectural clarity. The use of min() with clamp() demonstrates genuine understanding of fluid responsive design beyond copy-pasting standard media queries.",
            json.dumps([
                {"criterion": "Viewport Responsiveness", "score": 30, "max": 30, "comments": "Flawless rendering down to 320px iPhone SE viewport."},
                {"criterion": "CSS Architecture", "score": 28, "max": 30, "comments": "Modern CSS Grid replacing float anti-patterns."},
                {"criterion": "Approach & Reasoning", "score": 36, "max": 40, "comments": "Thorough root cause analysis articulated in the dossier."}
            ])
        ))

        # Submission 2: Debugging C Buffer Parser
        cursor.execute("""
            INSERT INTO submissions (challenge_id, student_id, solution_url, solution_code, approach_explanation, reflection_answers, status, score, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'verified', 91, datetime('now', '-3 days'), datetime('now', '-2 days'))
        """, (
            challenge_ids["debug-c-program-buffer-parser"],
            aarav_id,
            "https://gist.github.com/aarav-dev/c-parser-fix",
            (
                "#include <stdio.h>\n"
                "#include <stdlib.h>\n"
                "#include <string.h>\n\n"
                "#define MAX_TOKENS 5\n"
                "#define MAX_TOKEN_LEN 32\n\n"
                "int parse_tokens_safe(const char *input, char tokens[MAX_TOKENS][MAX_TOKEN_LEN]) {\n"
                "    if (!input) return -1; /* Guard against NULL dereference */\n"
                "    \n"
                "    size_t input_len = strlen(input); /* Cache length to prevent O(N^2) loop */\n"
                "    int token_idx = 0;\n"
                "    int char_idx = 0;\n"
                "    \n"
                "    for (size_t i = 0; i <= input_len; i++) {\n"
                "        char c = input[i];\n"
                "        if (c == ',' || c == '\\0') {\n"
                "            if (token_idx >= MAX_TOKENS) break; /* Boundary guard */\n"
                "            tokens[token_idx][char_idx] = '\\0'; /* Explicit null termination */\n"
                "            token_idx++;\n"
                "            char_idx = 0;\n"
                "        } else {\n"
                "            if (token_idx < MAX_TOKENS && char_idx < MAX_TOKEN_LEN - 1) {\n"
                "                tokens[token_idx][char_idx++] = c;\n"
                "            }\n"
                "        }\n"
                "    }\n"
                "    return token_idx;\n"
                "}"
            ),
            (
                "I isolated three critical defects in the starter code:\n"
                "1. `i <= strlen(input)` recomputed string length on every single iteration, degrading complexity to O(N^2) and risking reading past bounds.\n"
                "2. `tokens[count][char_idx]` wrote into the 2D array without validating if `char_idx >= 32` or `count >= 5`, causing stack corruption on long inputs.\n"
                "3. Missing NULL pointer check at function entrance.\n"
                "I cached `strlen`, added strict dimensional bounds checks, and guaranteed explicit '\\0' termination reserving the final byte."
            ),
            (
                "Follow-up: What would happen if input is an empty string `\"\"`?\n"
                "Answer: `strlen` is 0. The loop executes for `i=0` seeing `\\0`, sets `tokens[0][0] = '\\0'`, increments `token_idx` to 1, and returns 1 empty token without crashing or reading unallocated memory."
            )
        ))
        sub2_id = cursor.lastrowid

        # Review for Submission 2
        cursor.execute("""
            INSERT INTO reviews (submission_id, reviewer_name, reviewer_role, similarity_score, similarity_notes, feedback, rubric_breakdown, verified_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))
        """, (
            sub2_id,
            "Dr. Sanjay Roy",
            "Systems Architecture Reviewer",
            4,
            "4% similarity. Idiomatic safe C defensive programming style verified.",
            "Clean defensive C implementation. Excellent catch on the strlen(input) performance trap inside the loop condition.",
            json.dumps([
                {"criterion": "Bug Isolation", "score": 38, "max": 40, "comments": "All three memory flaws and the O(N^2) issue caught."},
                {"criterion": "Corrected Implementation", "score": 32, "max": 35, "comments": "C99 safe code with boundary guards."},
                {"criterion": "Safety Reasoning", "score": 21, "max": 25, "comments": "Precise explanation of stack corruption dynamics."}
            ])
        ))

        # Submission 3: Technical Escalation & Communication
        cursor.execute("""
            INSERT INTO submissions (challenge_id, student_id, solution_url, solution_code, approach_explanation, reflection_answers, status, score, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'verified', 89, datetime('now', '-1 days'), datetime('now', '-18 hours'))
        """, (
            challenge_ids["customer-support-technical-escalation"],
            aarav_id,
            "",
            (
                "Subject: Update regarding Ticket #84920: Root Cause & Preventative Safeguards for Checkout Incident\n\n"
                "Dear Operations Team,\n\n"
                "First and foremost, I sincerely apologize for the 28-minute outage you experienced during peak checkout hours today. We understand completely how critical payment processing is to your customers and your revenue, and we take full responsibility for the disruption this caused.\n\n"
                "WHAT OCCURRED:\n"
                "At 14:12 UTC, an unexpected surge in concurrent checkout requests exhausted our primary database connection pool, resulting in 504 Gateway Timeouts on upstream payment webhooks.\n\n"
                "IMMEDIATE RESOLUTION:\n"
                "By 14:40 UTC, our infrastructure team doubled the pool capacity, cleared stale socket connections, and restarted the gateway worker cluster. Normal service was verified restored across all endpoints.\n\n"
                "PREVENTATIVE ACTIONS DEPLOYED:\n"
                "1. Immediate Implementation of Circuit Breakers: Rather than dropping webhooks, requests will gracefully queue during sudden spikes.\n"
                "2. Dynamic Read/Write Replica Autoscaling: Added automated provisioning triggered at 65% pool utilization.\n\n"
                "In alignment with our Enterprise SLA, our account lead will reach out before 17:00 UTC with your automated billing credit. I remain personally available at this thread should you require raw audit logs for your internal post-mortem.\n\n"
                "Warm regards,\n"
                "Aarav Sharma — Technical Operations & Support"
            ),
            (
                "In this communication, my strategy was to avoid defensive or dismissive corporate jargon. "
                "I immediately acknowledged the business pain (failed checkouts for end-customers), explained the technical cause concisely (connection pool exhaustion), "
                "and clearly outlined engineering safeguards rather than vague promises. I also proactively addressed the contractual SLA credit to rebuild trust."
            ),
            (
                "Follow-up: How do you handle customers demanding immediate financial compensation on the phone?\n"
                "Answer: Validate their urgency without committing to unauthorized figures on the spot; confirm that their account contract SLA guarantees compensation, and commit to an exact same-day delivery time with account executives."
            )
        ))
        sub3_id = cursor.lastrowid

        # Review for Submission 3
        cursor.execute("""
            INSERT INTO reviews (submission_id, reviewer_name, reviewer_role, similarity_score, similarity_notes, feedback, rubric_breakdown, verified_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-18 hours'))
        """, (
            sub3_id,
            "Meera Swaminathan",
            "Customer Operations Lead",
            2,
            "Original empathetic email draft. No template copying detected.",
            "Masterful blend of technical truthfulness and customer empathy. Exactly what high-growth tech startups need in client-facing engineers.",
            json.dumps([
                {"criterion": "Tone & Empathy", "score": 33, "max": 35, "comments": "Immediate de-escalation with genuine accountability."},
                {"criterion": "Technical Clarity", "score": 31, "max": 35, "comments": "Explains pool exhaustion without confusing the reader."},
                {"criterion": "Accountability & Next Steps", "score": 25, "max": 30, "comments": "Actionable post-mortem points and SLA commitment."}
            ])
        ))

        # 5. Insert Student Skills for Aarav
        cursor.execute("""
            INSERT INTO student_skills (student_id, skill_name, proficiency_level, tasks_completed_count)
            VALUES (?, ?, ?, ?)
        """, (aarav_id, "HTML/CSS", "Intermediate", 3))

        cursor.execute("""
            INSERT INTO student_skills (student_id, skill_name, proficiency_level, tasks_completed_count)
            VALUES (?, ?, ?, ?)
        """, (aarav_id, "C Programming", "Advanced beginner", 8))

        cursor.execute("""
            INSERT INTO student_skills (student_id, skill_name, proficiency_level, tasks_completed_count)
            VALUES (?, ?, ?, ?)
        """, (aarav_id, "Communication", "Good", 4))

        cursor.execute("""
            INSERT INTO student_skills (student_id, skill_name, proficiency_level, tasks_completed_count)
            VALUES (?, ?, ?, ?)
        """, (aarav_id, "Problem-Solving", "Intermediate", 10))

        # 6. Insert Submission for Priya (In Review state to showcase active submission pipeline)
        cursor.execute("""
            INSERT INTO submissions (challenge_id, student_id, solution_url, solution_code, approach_explanation, reflection_answers, status, score, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'submitted', 0, datetime('now', '-2 hours'), datetime('now', '-2 hours'))
        """, (
            challenge_ids["accessible-registration-form"],
            priya_id,
            "https://github.com/priya-codes/accessible-form",
            (
                "/* ACCESSIBLE FORM IMPLEMENTATION */\n"
                "const form = document.querySelector('#register-form');\n"
                "const errorLiveRegion = document.querySelector('#form-live-status');\n\n"
                "form.addEventListener('submit', (e) => {\n"
                "  e.preventDefault();\n"
                "  const isValid = validateInputs();\n"
                "  if (!isValid) {\n"
                "    errorLiveRegion.textContent = 'Please correct the highlighted errors before submitting.';\n"
                "    focusFirstInvalidField();\n"
                "  } else {\n"
                "    submitPayload();\n"
                "  }\n"
                "});"
            ),
            (
                "Implemented WCAG 2.1 AA accessible form validation. Focused on aria-live regions so non-sighted users "
                "get auditory feedback when an error occurs, plus keyboard focus management jumping directly to the first invalid field."
            ),
            (
                "Follow-up: Why not just use browser HTML5 default tooltips?\n"
                "Answer: Default browser tooltips vanish too quickly, cannot be styled for high-contrast visibility, and vary inconsistently across iOS VoiceOver and NVDA."
            )
        ))

        cursor.execute("""
            INSERT INTO student_skills (student_id, skill_name, proficiency_level, tasks_completed_count)
            VALUES (?, ?, ?, ?)
        """, (priya_id, "HTML/CSS", "Advanced beginner", 2))

        cursor.execute("""
            INSERT INTO student_skills (student_id, skill_name, proficiency_level, tasks_completed_count)
            VALUES (?, ?, ?, ?)
        """, (priya_id, "JavaScript / DOM", "Beginner", 1))

        print("Database seeded successfully with users, challenges, verified submissions, and skill passports!")

if __name__ == "__main__":
    seed_database()
