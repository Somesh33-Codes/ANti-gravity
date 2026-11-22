import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { submissionsApi } from "../services/api";
import { StatusBadge, ScoreCircle, RubricBreakdown, LoadingPage, Alert } from "../components/ui";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    submissionsApi.get(id)
      .then(setSub)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage label="Loading submission…" />;
  if (error) return (
    <div className="page"><div className="container">
      <Alert type="error">{error}</Alert>
      <Link to="/dashboard" className="btn btn--outline btn--sm" style={{ marginTop: "1rem" }}>← Dashboard</Link>
    </div></div>
  );

  const review = sub.review;
  const isEmployerView = user?.role === "employer";

  return (
    <div className="page">
      <div className="container--narrow">
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            to={isEmployerView ? "/employer" : "/dashboard"}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--ink-muted)" }}
          >
            <ChevronLeft size={15} /> {isEmployerView ? "Back to Candidates" : "Back to Dashboard"}
          </Link>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cobalt)", marginBottom: "0.3rem", display: "block" }}>
              {sub.challenge_category}
            </span>
            <h1 style={{ fontSize: "clamp(1.2rem, 3vw, 1.75rem)", marginBottom: "0.5rem" }}>{sub.challenge_title}</h1>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <StatusBadge status={sub.status} />
              {sub.student_name && (
                <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>by {sub.student_name}</span>
              )}
              <span style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
                Submitted {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          {sub.status === "verified" && <ScoreCircle score={sub.score} size={80} />}
        </div>

        {/* Review Card */}
        {review && (
          <div className="card card--verified" style={{ marginBottom: "2rem", background: "var(--success-pale)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--success)" }}>✓ Peer Review Complete</p>
                <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "0.1rem" }}>
                  {review.reviewer_name} · {review.reviewer_role}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Similarity Score</span>
                <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--success)" }}>{review.similarity_score}% overlap</p>
                <p style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>industry corpus check</p>
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.7, marginBottom: "1rem" }}>
              {review.feedback}
            </p>
            {review.similarity_notes && (
              <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)", fontStyle: "italic" }}>
                Originality: {review.similarity_notes}
              </p>
            )}
          </div>
        )}

        {/* Rubric Breakdown */}
        {review?.rubric_breakdown && review.rubric_breakdown.length > 0 && (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h4 style={{ marginBottom: "1rem" }}>Rubric Breakdown</h4>
            <RubricBreakdown items={review.rubric_breakdown} />
          </div>
        )}

        {/* Approach */}
        <div className="card card--evidence" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.75rem" }}>Approach & Reasoning</h4>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
            {sub.approach_explanation}
          </p>
        </div>

        {/* Reflection */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.75rem" }}>Reflection Answers</h4>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
            {sub.reflection_answers}
          </p>
        </div>

        {/* Solution Code */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h4>Submitted Code</h4>
            {sub.solution_url && (
              <a href={sub.solution_url} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
                <ExternalLink size={13} /> View Repository
              </a>
            )}
          </div>
          <pre style={{ maxHeight: "400px", overflowY: "auto" }}>{sub.solution_code}</pre>
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {!isEmployerView && (
            <Link to="/passport" className="btn btn--primary">View Skill Passport →</Link>
          )}
          <Link to="/challenges" className="btn btn--outline">Browse More Challenges</Link>
        </div>
      </div>
    </div>
  );
}
