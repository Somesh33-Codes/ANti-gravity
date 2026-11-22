import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { passportApi } from "../services/api";
import { StatusBadge, ScoreCircle, RubricBreakdown, LoadingPage, Alert, EmptyState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { Award, Share2, ExternalLink } from "lucide-react";

const PROFICIENCY_COLOR = {
  "Beginner": "var(--tangerine)",
  "Advanced beginner": "var(--cobalt)",
  "Intermediate": "var(--cobalt)",
  "Good": "var(--success)",
  "Proficient": "var(--success)",
};

export default function Passport() {
  const { id } = useParams();
  const { user } = useAuth();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const isPublicView = !!id;

  useEffect(() => {
    const fetch = id ? passportApi.student(id) : passportApi.mine();
    fetch
      .then(p => {
        setPassport(p);
        setQrUrl(passportApi.qrUrl(p.student_id));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(passport.passport_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingPage label="Loading Skill Passport…" />;
  if (error) return (
    <div className="page"><div className="container">
      <Alert type="error">{error}</Alert>
    </div></div>
  );
  if (!passport) return null;

  const verifiedEvidence = passport.reviewed_evidence.filter(e => e.status === "verified");

  return (
    <div className="page">
      <div className="container">
        {/* Passport Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", marginBottom: "2.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cobalt)" }}>
                Skill Passport
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-faint)" }}>
                #{passport.verification_hash}
              </span>
            </div>
            <h1 style={{ marginBottom: "0.4rem" }}>{passport.full_name}</h1>
            <p style={{ fontSize: "1rem", color: "var(--ink-muted)", marginBottom: "0.5rem" }}>{passport.headline}</p>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-faint)" }}>
              {passport.college} · Class of {passport.graduation_year}
            </p>
            {passport.bio && (
              <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", maxWidth: "55ch", marginTop: "0.75rem", lineHeight: 1.7 }}>
                {passport.bio}
              </p>
            )}
          </div>

          {/* QR Code & Share */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            {qrUrl && (
              <img
                src={qrUrl}
                alt={`QR code linking to ${passport.full_name}'s Skill Passport`}
                width={110} height={110}
                style={{ border: "2px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", padding: "4px" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <button
              className="btn btn--outline btn--sm"
              onClick={handleCopy}
              style={{ width: "100%" }}
            >
              <Share2 size={13} /> {copied ? "Copied!" : "Copy Link"}
            </button>
            {!isPublicView && (
              <a href={passport.passport_url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                <ExternalLink size={13} /> Public View
              </a>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: "1.25rem 1.5rem", background: "var(--ink)", borderRadius: "var(--radius)", marginBottom: "2.5rem", color: "#fff" }}>
          {[
            { label: "Verified Skills", value: passport.verified_skills.length },
            { label: "Evidence Files", value: verifiedEvidence.length },
            { label: "Avg. Score", value: verifiedEvidence.length ? Math.round(verifiedEvidence.reduce((acc, e) => acc + e.score, 0) / verifiedEvidence.length) : "—" },
            { label: "Issued", value: passport.issued_date },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 120px" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, color: i === 2 ? "#6EE7B7" : "#fff" }}>{s.value}</p>
              <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.25rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Skills Column */}
          <section aria-labelledby="skills-col-heading">
            <h3 id="skills-col-heading" style={{ marginBottom: "1rem" }}>Verified Skills</h3>
            {passport.verified_skills.length === 0 ? (
              <EmptyState icon={Award} title="No verified skills yet" description="Complete a challenge to earn your first badge." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {passport.verified_skills.map((sk, i) => (
                  <div key={i} className="card" style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>{sk.skill_name}</p>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.3rem", flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: PROFICIENCY_COLOR[sk.proficiency_level] || "var(--cobalt)"
                          }}>
                            {sk.proficiency_level}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                            · {sk.tasks_completed_count} task{sk.tasks_completed_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <span className="badge badge--verified">✓ Verified</span>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                      <div className="progress-bar">
                        <div
                          className="progress-bar__fill progress-bar__fill--success"
                          style={{ width: `${Math.min(100, sk.tasks_completed_count * 20)}%` }}
                        />
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: "0.25rem" }}>
                        Verified {new Date(sk.verified_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Evidence Column */}
          <section aria-labelledby="evidence-col-heading">
            <h3 id="evidence-col-heading" style={{ marginBottom: "1rem" }}>Evidence Dossier</h3>
            {passport.reviewed_evidence.length === 0 ? (
              <EmptyState icon={Award} title="No evidence submitted yet" description="Submit your first challenge to populate this dossier." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {passport.reviewed_evidence.map((ev, i) => (
                  <Link key={i} to={`/submissions/${ev.id}`} style={{ textDecoration: "none" }}>
                    <div className={`card card--hover card--evidence${ev.status === "verified" ? " card--verified" : ev.status === "submitted" ? " card--pending" : ""}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cobalt)", marginBottom: "0.2rem", display: "block" }}>
                            {ev.challenge_category}
                          </span>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "0.4rem" }}>
                            {ev.challenge_title}
                          </p>
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                            <StatusBadge status={ev.status} />
                            {ev.review && (
                              <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>
                                {ev.review.similarity_score}% similarity · {ev.review.reviewer_name}
                              </span>
                            )}
                          </div>
                        </div>
                        {ev.status === "verified" && <ScoreCircle score={ev.score} size={52} />}
                      </div>

                      {ev.review?.feedback && (
                        <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: "0.6rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {ev.review.feedback}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Verification Footer */}
        <div style={{
          marginTop: "3rem", padding: "1rem 1.5rem",
          borderTop: "1.5px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem"
        }}>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
            <p><strong style={{ color: "var(--ink-muted)" }}>Verification ID:</strong> <span style={{ fontFamily: "var(--font-mono)" }}>{passport.verification_hash}</span></p>
            <p>Issued by SkillProof · Team Teekhe Terminals · <em>Demo platform — not a legally binding credential</em></p>
          </div>
          {!isPublicView && (
            <Link to="/challenges" className="btn btn--outline btn--sm">Add More Evidence →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
