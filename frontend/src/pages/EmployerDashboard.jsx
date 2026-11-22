import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { employerApi } from "../services/api";
import { LoadingPage, EmptyState, Alert, Spinner, ScoreCircle, PageHeader } from "../components/ui";
import { Search, Eye, Mail, Users, Filter } from "lucide-react";

export default function EmployerDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [minScore, setMinScore] = useState("");
  const [revealing, setRevealing] = useState(null);
  const [inviting, setInviting] = useState(null);
  const [inviteNote, setInviteNote] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const loadCandidates = (params = {}) => {
    setLoading(true);
    employerApi.candidates(params)
      .then(setCandidates)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCandidates(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadCandidates({ skill: skillFilter || undefined, min_score: minScore || undefined });
  };

  const handleReveal = async (studentId) => {
    setRevealing(studentId);
    try {
      const updated = await employerApi.reveal(studentId);
      setCandidates(cs => cs.map(c => c.student_id === studentId ? updated : c));
    } catch (err) {
      setError(err.message);
    } finally {
      setRevealing(null);
    }
  };

  const handleInvite = async (studentId) => {
    if (!inviteNote.trim()) return;
    setInviting(studentId);
    try {
      const res = await employerApi.invite(studentId, inviteNote);
      setInviteSuccess(res.message);
      setCandidates(cs => cs.map(c =>
        c.student_id === studentId ? { ...c, interview_invite_sent: true, invite_note: inviteNote } : c
      ));
      setInviteNote("");
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(null);
    }
  };

  if (loading) return <LoadingPage label="Loading candidate pool…" />;

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Employer Dashboard"
          title="Talent Discovery"
          subtitle="Evaluate real skill evidence before seeing any candidate's name, college, or background."
        />

        {/* Demo notice */}
        <div className="alert alert--info" style={{ marginBottom: "1.5rem" }}>
          <span>
            <strong>Blind Review Mode Active.</strong> Candidate identities are hidden by default.
            Review their verified code submissions first, then reveal identity only when you're ready to proceed.
            <em> (MVP demo — no real employer activity or persistent data beyond this session.)</em>
          </span>
        </div>

        {inviteSuccess && (
          <div className="alert alert--success" style={{ marginBottom: "1rem" }}>
            {inviteSuccess}
          </div>
        )}

        {error && <Alert type="error">{error}</Alert>}

        {/* Filters */}
        <form onSubmit={handleFilter} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem", padding: "1rem", background: "var(--bg-alt)", borderRadius: "var(--radius)", border: "1.5px solid var(--border)", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: "1 1 200px", marginBottom: 0 }}>
            <label className="form-label" htmlFor="skill-filter">Filter by Skill</label>
            <input id="skill-filter" type="text" className="form-input"
              placeholder="e.g. HTML/CSS, C Programming…"
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: "0 1 160px", marginBottom: 0 }}>
            <label className="form-label" htmlFor="score-filter">Min. Score</label>
            <input id="score-filter" type="number" className="form-input"
              placeholder="e.g. 80" min="0" max="100"
              value={minScore}
              onChange={e => setMinScore(e.target.value)} />
          </div>
          <button type="submit" className="btn btn--primary" style={{ flexShrink: 0 }}>
            <Filter size={14} /> Apply Filters
          </button>
          <button type="button" className="btn btn--outline" onClick={() => { setSkillFilter(""); setMinScore(""); loadCandidates(); }}>
            Clear
          </button>
        </form>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {[
            { label: "Total Candidates", value: candidates.length },
            { label: "Verified Evidence", value: candidates.reduce((acc, c) => acc + c.verified_submissions_count, 0) },
            { label: "Revealed Identities", value: candidates.filter(c => c.is_revealed).length },
            { label: "Invite Sent", value: candidates.filter(c => c.interview_invite_sent).length },
          ].map((s, i) => (
            <div key={i} className="card" style={{ flex: "1 1 140px", textAlign: "center", padding: "1rem" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)", marginTop: "0.25rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No candidates match your filters"
            description="Try adjusting your skill or score filter."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {candidates.map(c => (
              <CandidateCard
                key={c.student_id}
                candidate={c}
                revealing={revealing === c.student_id}
                inviting={inviting === c.student_id}
                inviteNote={inviting === c.student_id ? inviteNote : ""}
                onInviteNoteChange={setInviteNote}
                onReveal={() => handleReveal(c.student_id)}
                onInvite={() => handleInvite(c.student_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({ candidate: c, revealing, inviting, inviteNote, onInviteNoteChange, onReveal, onInvite }) {
  const [expanded, setExpanded] = useState(false);
  const score = c.skill_scores?.overall_demonstrated_score || 0;

  return (
    <article className="card card--hover" style={{ padding: "1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Identity Block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{
              width: 44, height: 44, background: c.is_revealed ? "var(--cobalt)" : "var(--bg-alt)",
              borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700,
              color: c.is_revealed ? "#fff" : "var(--ink-faint)", flexShrink: 0,
              border: "1.5px solid var(--border)"
            }}>
              {c.is_revealed ? c.full_name?.[0] : "?"}
            </div>
            <div>
              {c.is_revealed ? (
                <>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--ink)" }}>{c.full_name}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)" }}>{c.headline}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
                    {c.college} · <a href={`mailto:${c.email}`} style={{ color: "var(--cobalt)" }}>{c.email}</a>
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                    {c.blind_id}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)", fontStyle: "italic" }}>
                    Identity hidden · review skill evidence first
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Skills */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.9rem" }}>
            {c.top_skills.map(s => (
              <span key={s} className="badge badge--skill">{s}</span>
            ))}
          </div>

          {/* Evidence titles (collapsed) */}
          {c.sample_evidence_titles.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.4rem" }}>
                Verified Tasks
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {c.sample_evidence_titles.slice(0, expanded ? undefined : 2).map((t, i) => (
                  <p key={i} style={{ fontSize: "0.82rem", color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ width: 6, height: 6, background: "var(--success)", borderRadius: "50%", flexShrink: 0 }} aria-hidden="true" />
                    {t}
                  </p>
                ))}
              </div>
              {c.sample_evidence_titles.length > 2 && (
                <button className="btn btn--ghost btn--sm" style={{ marginTop: "0.3rem", padding: "0.2rem 0", fontSize: "0.78rem" }} onClick={() => setExpanded(!expanded)}>
                  {expanded ? "Show less" : `+${c.sample_evidence_titles.length - 2} more`}
                </button>
              )}
            </div>
          )}

          {/* Invite note (after reveal) */}
          {c.is_revealed && !c.interview_invite_sent && (
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add a note with your invite…"
                value={inviteNote}
                onChange={e => onInviteNoteChange(e.target.value)}
                style={{ flex: "1 1 200px", fontSize: "0.85rem" }}
              />
              <button className="btn btn--primary btn--sm" onClick={onInvite} disabled={inviting || !inviteNote.trim()}>
                {inviting ? <Spinner size={13} /> : <><Mail size={13} /> Send Interview Invite</>}
              </button>
            </div>
          )}

          {c.interview_invite_sent && (
            <div style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.6rem", background: "var(--success-pale)", borderRadius: "3px" }}>
              <span style={{ color: "var(--success)", fontSize: "0.78rem", fontWeight: 600 }}>✓ Interview invite sent</span>
            </div>
          )}
        </div>

        {/* Score + Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <ScoreCircle score={score} size={68} />
          <span style={{ fontSize: "0.68rem", textAlign: "center", color: "var(--ink-faint)" }}>
            {c.verified_submissions_count} verified task{c.verified_submissions_count !== 1 ? "s" : ""}
          </span>

          {!c.is_revealed ? (
            <button
              className="btn btn--outline btn--sm"
              onClick={onReveal}
              disabled={revealing}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {revealing ? <Spinner size={13} /> : <><Eye size={13} /> Reveal Identity</>}
            </button>
          ) : (
            <Link to={`/passport/${c.student_id}`} className="btn btn--ghost btn--sm">
              View Passport →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
