import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/landing.css";

const EVIDENCE_PREVIEW = [
  {
    title: "Responsive Layout Debugger",
    category: "Frontend Dev",
    submitter: "Candidate SP-1001",
    score: 94,
    status: "verified",
    skills: ["HTML/CSS", "Problem-Solving"],
  },
  {
    title: "C Buffer Parser Fix",
    category: "Systems Eng.",
    submitter: "Candidate SP-1001",
    score: 91,
    status: "verified",
    skills: ["C Programming"],
  },
];

const SAMPLE_CHALLENGES = [
  {
    title: "Fix a Broken Responsive Website",
    category: "Frontend Development",
    summary: "Debug real viewport overflow and float anti-patterns in a production-style layout.",
    difficulty: "Beginner",
    time: "45 mins",
    skills: ["HTML/CSS", "Problem-Solving"],
  },
  {
    title: "Accessible Registration Form",
    category: "Frontend Development",
    summary: "Build keyboard-navigable form with ARIA error states and input validation.",
    difficulty: "Intermediate",
    time: "60 mins",
    skills: ["HTML/CSS", "JS / DOM"],
  },
  {
    title: "Debug Memory Bugs in C",
    category: "Software Engineering",
    summary: "Find off-by-one errors, missing null terminators, and uninitialized pointers.",
    difficulty: "Intermediate",
    time: "50 mins",
    skills: ["C Programming", "Problem-Solving"],
  },
  {
    title: "Technical Escalation Response",
    category: "Professional Skills",
    summary: "Write an empathetic, technically precise response to an enterprise support escalation.",
    difficulty: "Beginner",
    time: "35 mins",
    skills: ["Communication"],
  },
];

const STEPS = [
  { n: "1", label: "Pick a Challenge", desc: "Select a realistic task from the library — frontend, systems, or communication." },
  { n: "2", label: "Submit Evidence", desc: "Share your code, approach, and reasoning. No certificates required." },
  { n: "3", label: "Get Verified", desc: "A peer reviewer evaluates your work against an objective rubric." },
  { n: "4", label: "Build Your Passport", desc: "Your verified skills accumulate into a shareable, employer-ready profile." },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__grid-bg" aria-hidden="true" />
        <div className="container hero__inner">
          <div>
            <div className="hero__eyebrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <circle cx="6" cy="6" r="5" />
              </svg>
              Skill-first hiring platform
            </div>
            <h1 className="hero__title">
              Prove what you can <em>do</em>,<br />
              not just what you studied.
            </h1>
            <p className="hero__subtitle">
              SkillProof replaces credential screening with verified practical evidence.
              Complete real challenges, earn reviewed skill badges, and share a Skill Passport
              employers can actually trust.
            </p>
            <div className="hero__cta">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn--primary btn--lg">Go to Dashboard</Link>
                  <Link to="/challenges" className="btn btn--outline btn--lg">Browse Challenges</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn--primary btn--lg">Build Your Passport →</Link>
                  <Link to="/register?role=employer" className="btn btn--outline btn--lg">Hire by Skill</Link>
                </>
              )}
            </div>
            <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--ink-faint)" }}>
              🎓 Teekhe Terminals · MVP Demo · No real verification or persistent employer activity
            </p>
          </div>

          {/* Evidence card preview */}
          <div className="hero__card-stack" aria-hidden="true">
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem" }}>
              Skill Evidence Dossier
            </p>
            {EVIDENCE_PREVIEW.map((ev, i) => (
              <div key={i} className={`hero__evidence-card${ev.status === "verified" ? " hero__evidence-card--verified" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cobalt)", marginBottom: "0.2rem" }}>
                      {ev.category}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>{ev.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--ink-faint)", marginTop: "0.15rem" }}>{ev.submitter}</p>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: "var(--success)" }}>{ev.score}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--ink-faint)" }}>/ 100</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                  {ev.skills.map(s => (
                    <span key={s} className="badge badge--skill">{s}</span>
                  ))}
                  <span className="badge badge--verified" style={{ marginLeft: "auto" }}>✓ Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="how-it-works" aria-labelledby="how-heading">
        <div className="container">
          <h2 id="how-heading" style={{ textAlign: "center" }}>How SkillProof works</h2>
          <p style={{ textAlign: "center", maxWidth: "50ch", margin: "0.75rem auto 0", fontSize: "1rem" }}>
            Four steps from blank resume to employer-trusted evidence.
          </p>
          <div className="steps-row">
            {STEPS.map((s, i) => (
              <div key={i} className="step">
                <div className="step__number" aria-hidden="true">{s.n}</div>
                <h4>{s.label}</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenges Preview ────────────────────────────────── */}
      <section className="challenges-section" aria-labelledby="challenges-heading">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <p className="page-header__eyebrow">Practical Tasks</p>
              <h2 id="challenges-heading">Real problems, not toy exercises</h2>
            </div>
            <Link to={user ? "/challenges" : "/register"} className="btn btn--outline btn--sm">
              See all challenges →
            </Link>
          </div>
          <div className="grid-2">
            {SAMPLE_CHALLENGES.map((ch, i) => (
              <div key={i} className="challenge-preview-card">
                <p className="challenge-preview-card__category">{ch.category}</p>
                <h4 className="challenge-preview-card__title">{ch.title}</h4>
                <p className="challenge-preview-card__summary">{ch.summary}</p>
                <div className="challenge-preview-card__footer">
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {ch.skills.map(s => <span key={s} className="badge badge--skill">{s}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className={`badge badge--${ch.difficulty.toLowerCase()}`}>{ch.difficulty}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>⏱ {ch.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Employer Value Prop ───────────────────────────────── */}
      <section className="employer-section" aria-labelledby="employer-heading">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div>
              <p className="page-header__eyebrow">For Employers</p>
              <h2 id="employer-heading">Review work before seeing a name</h2>
              <p style={{ marginTop: "0.75rem", fontSize: "1rem" }}>
                Our blind review model lets you evaluate code quality, debugging ability, and
                communication competence before the candidate's college or resume enters the picture.
                Reveal identity only when the evidence meets your bar.
              </p>
              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Filter candidates by demonstrated skills", "Read annotated evidence with similarity scores", "Reveal identity & contact only after skill review"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ width: 20, height: 20, background: "var(--success-pale)", color: "var(--success)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <Link to={user?.role === "employer" ? "/employer" : "/register?role=employer"} className="btn btn--primary" style={{ marginTop: "1.75rem" }}>
                Discover Candidates →
              </Link>
            </div>
            <div className="blind-review-demo" aria-label="Blind review demonstration">
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: "1rem" }}>
                Skill-First Candidate Feed
              </p>
              {[
                { id: "SP-1001", skills: ["HTML/CSS", "Problem-Solving"], score: 93, tasks: 3 },
                { id: "SP-1002", skills: ["JavaScript / DOM", "HTML/CSS"], score: 86, tasks: 2 },
                { id: "SP-1003", skills: ["C Programming", "Communication"], score: 91, tasks: 2 },
              ].map((c, i) => (
                <div key={i} className="blind-candidate-row">
                  <div>
                    <span className="candidate-id">Candidate {c.id}</span>
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
                      {c.skills.map(s => <span key={s} style={{ fontSize: "0.68rem", padding: "0.15rem 0.4rem", background: "rgba(255,255,255,0.1)", borderRadius: "3px", color: "rgba(255,255,255,0.75)" }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: i === 0 ? "#6EE7B7" : "#93C5FD" }}>{c.score}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>{c.tasks} tasks verified</span>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: "0.72rem", textAlign: "center", opacity: 0.35, marginTop: "1.25rem" }}>
                Identity revealed only after skill-based review is complete
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="container footer">
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--ink)", marginBottom: "0.2rem" }}>SkillProof</p>
          <p className="footer__copy">Built by Team Teekhe Terminals · Hackathon MVP 2026 · Demo data only</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span className="footer__copy">Suhavi · Anmol · Snigdha · Rajat · Somesh</span>
        </div>
      </footer>
    </main>
  );
}
