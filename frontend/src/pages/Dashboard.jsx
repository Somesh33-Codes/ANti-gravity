import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submissionsApi, passportApi } from "../services/api";
import { StatusBadge, ScoreCircle, LoadingPage, EmptyState, PageHeader } from "../components/ui";
import { BookOpen, Award, Clock, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([submissionsApi.mySubmissions(), passportApi.mine()])
      .then(([subs, pass]) => { setSubmissions(subs); setPassport(pass); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage label="Loading your dashboard…" />;

  const verified = submissions.filter(s => s.status === "verified");
  const pending = submissions.filter(s => s.status !== "verified");
  const avgScore = verified.length
    ? Math.round(verified.reduce((acc, s) => acc + s.score, 0) / verified.length)
    : null;

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Student Dashboard"
          title={`Welcome back, ${user.full_name.split(" ")[0]}.`}
          subtitle="Track your challenge submissions, skill progress, and verification history."
          actions={<Link to="/challenges" className="btn btn--primary"><BookOpen size={15} /> Find Challenges</Link>}
        />

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Challenges Submitted", value: submissions.length, sub: "lifetime" },
            { label: "Skills Verified", value: passport?.verified_skills?.length || 0, sub: "earned & reviewed" },
            { label: "Avg. Evidence Score", value: avgScore ? `${avgScore}` : "—", sub: avgScore ? "out of 100" : "submit a challenge" },
            { label: "Passport Status", value: (passport?.verified_skills?.length || 0) > 0 ? "Active" : "Building", sub: "shareable link ready" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: i === 2 ? "var(--success)" : "var(--ink)", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontWeight: 600, fontSize: "0.82rem", marginTop: "0.3rem", color: "var(--ink)" }}>{s.label}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Recent Submissions */}
          <section aria-labelledby="submissions-heading">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 id="submissions-heading" style={{ fontSize: "1.1rem" }}>Recent Submissions</h3>
              <Link to="/challenges" className="btn btn--ghost btn--sm">Browse more →</Link>
            </div>

            {submissions.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No submissions yet"
                description="Pick your first challenge to start building verified skill evidence."
                action={<Link to="/challenges" className="btn btn--primary btn--sm">Browse Challenges</Link>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {submissions.slice(0, 5).map(sub => (
                  <Link
                    key={sub.id}
                    to={`/submissions/${sub.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className={`card card--hover card--evidence${sub.status === "verified" ? " card--verified" : sub.status === "submitted" ? " card--pending" : ""}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cobalt)", marginBottom: "0.2rem" }}>
                            {sub.challenge_category}
                          </p>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {sub.challenge_title}
                          </p>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.4rem", flexWrap: "wrap" }}>
                            <StatusBadge status={sub.status} />
                            <span style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                              {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        {sub.status === "verified" && (
                          <div style={{ flexShrink: 0 }}>
                            <ScoreCircle score={sub.score} size={52} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Skill Summary */}
          <section aria-labelledby="skills-heading">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 id="skills-heading" style={{ fontSize: "1.1rem" }}>Verified Skills</h3>
              <Link to="/passport" className="btn btn--ghost btn--sm">Full Passport →</Link>
            </div>

            {(!passport?.verified_skills || passport.verified_skills.length === 0) ? (
              <EmptyState
                icon={Award}
                title="No skills verified yet"
                description="Complete and pass a challenge to earn your first verified skill badge."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {passport.verified_skills.map((sk, i) => (
                  <div key={i} className="card" style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>{sk.skill_name}</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: "0.1rem" }}>
                          {sk.proficiency_level} · {sk.tasks_completed_count} task{sk.tasks_completed_count !== 1 ? "s" : ""} completed
                        </p>
                      </div>
                      <span className="badge badge--verified">✓ Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pending.length > 0 && (
              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "var(--warning-pale)", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.85rem" }}>
                <Clock size={15} style={{ color: "var(--warning)", flexShrink: 0 }} />
                <span style={{ color: "var(--warning)" }}>
                  <strong>{pending.length}</strong> submission{pending.length > 1 ? "s" : ""} pending review
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
