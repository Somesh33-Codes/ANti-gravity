import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { challengesApi, submissionsApi } from "../services/api";
import { DifficultyTag, SkillTag, Alert, Spinner, LoadingPage, RubricBreakdown, PageHeader } from "../components/ui";
import { Clock, ChevronLeft, CheckCircle } from "lucide-react";

export default function ChallengeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    solution_code: "", solution_url: "", approach_explanation: "", reflection_answers: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    challengesApi.get(slug)
      .then(ch => { setChallenge(ch); setForm(f => ({ ...f, solution_code: ch.starter_code || "" })); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const validateForm = () => {
    const errs = {};
    if (!form.solution_code.trim() || form.solution_code.trim().length < 10)
      errs.solution_code = "Please provide your solution code (minimum 10 characters).";
    if (!form.approach_explanation.trim() || form.approach_explanation.trim().length < 20)
      errs.approach_explanation = "Please explain your approach (minimum 20 characters).";
    if (!form.reflection_answers.trim() || form.reflection_answers.trim().length < 10)
      errs.reflection_answers = "Please answer the reflection question.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      const result = await submissionsApi.submit({
        challenge_id: challenge.id,
        solution_code: form.solution_code,
        solution_url: form.solution_url,
        approach_explanation: form.approach_explanation,
        reflection_answers: form.reflection_answers,
      });
      setSubmitted(result);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingPage label="Loading challenge…" />;
  if (error) return (
    <div className="page"><div className="container">
      <Alert type="error">{error}</Alert>
      <Link to="/challenges" className="btn btn--outline btn--sm" style={{ marginTop: "1rem" }}>← Back to challenges</Link>
    </div></div>
  );

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: "1.5rem" }}>
          <Link to="/challenges" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--ink-muted)" }}>
            <ChevronLeft size={15} /> Back to Challenges
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>
          {/* Main Content */}
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cobalt)" }}>
                {challenge.category}
              </span>
              <h1 style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)", marginTop: "0.3rem", marginBottom: "0.75rem" }}>
                {challenge.title}
              </h1>
              <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--ink-muted)" }}>{challenge.description}</p>
            </div>

            <div className="card card--featured" style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ marginBottom: "1rem" }}>📋 Task Instructions</h4>
              <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {challenge.task_instructions.split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} style={{ fontSize: "0.9rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>
                    {line.replace(/^\d+\.\s*/, "")}
                  </li>
                ))}
              </ol>
            </div>

            {challenge.starter_code && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "0.75rem" }}>📄 Starter Code / Context</h4>
                <pre>{challenge.starter_code}</pre>
              </div>
            )}

            {challenge.test_rubric && challenge.test_rubric.length > 0 && (
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "1rem" }}>🎯 Evaluation Rubric</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {challenge.test_rubric.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", padding: "0.75rem", background: "var(--bg-alt)", borderRadius: "var(--radius-sm)" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--ink)" }}>{r.criterion}</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: "0.2rem" }}>{r.description}</p>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, color: "var(--cobalt)", flexShrink: 0 }}>{r.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Success */}
            {submitted && (
              <div className="card" style={{ borderLeft: "4px solid var(--success)", background: "var(--success-pale)" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle size={22} style={{ color: "var(--success)", flexShrink: 0, marginTop: "0.1rem" }} />
                  <div>
                    <h4 style={{ color: "var(--success)" }}>Submission verified!</h4>
                    <p style={{ fontSize: "0.88rem", color: "var(--success)", marginTop: "0.3rem" }}>
                      Score: <strong>{submitted.score}/100</strong> · {submitted.review?.reviewer_name}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginTop: "0.3rem" }}>
                      {submitted.review?.feedback}
                    </p>
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                      <Link to={`/submissions/${submitted.id}`} className="btn btn--sm btn--primary">View Full Evidence →</Link>
                      <Link to="/passport" className="btn btn--sm btn--outline">View Passport</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Form */}
            {!submitted && (
              <div>
                {!showForm ? (
                  <button className="btn btn--primary btn--lg" onClick={() => setShowForm(true)}>
                    Submit Your Work →
                  </button>
                ) : (
                  <div className="card card--featured">
                    <h4 style={{ marginBottom: "0.3rem" }}>Submit Your Evidence</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "1.5rem" }}>
                      Your submission will be verified by a peer reviewer. Explain your reasoning — reviewers value thinking over just correct output.
                    </p>

                    {submitError && <Alert type="error">{submitError}</Alert>}

                    <form onSubmit={handleSubmit} noValidate style={{ marginTop: submitError ? "1rem" : 0 }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="solution_code">Your Solution / Code</label>
                        <textarea id="solution_code"
                          className="form-textarea code-textarea"
                          value={form.solution_code}
                          onChange={e => { setForm(f => ({ ...f, solution_code: e.target.value })); setFormErrors(err => ({ ...err, solution_code: "" })); }}
                          aria-invalid={!!formErrors.solution_code}
                          aria-describedby={formErrors.solution_code ? "code-err" : "code-hint"}
                          rows={12}
                        />
                        {formErrors.solution_code
                          ? <span id="code-err" className="form-error" role="alert">{formErrors.solution_code}</span>
                          : <span id="code-hint" className="form-hint">Paste your complete working code here.</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="solution_url">Repository / Live Link (Optional)</label>
                        <input id="solution_url" type="url" className="form-input"
                          placeholder="https://github.com/your-username/solution"
                          value={form.solution_url}
                          onChange={e => setForm(f => ({ ...f, solution_url: e.target.value }))} />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="approach">Approach & Reasoning</label>
                        <textarea id="approach" className="form-textarea"
                          placeholder="Explain how you identified the problem, what approach you chose, and why."
                          value={form.approach_explanation}
                          onChange={e => { setForm(f => ({ ...f, approach_explanation: e.target.value })); setFormErrors(err => ({ ...err, approach_explanation: "" })); }}
                          aria-invalid={!!formErrors.approach_explanation}
                          aria-describedby={formErrors.approach_explanation ? "approach-err" : undefined}
                          rows={5}
                        />
                        {formErrors.approach_explanation && <span id="approach-err" className="form-error" role="alert">{formErrors.approach_explanation}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reflection">Reflection Question</label>
                        <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "0.4rem" }}>
                          What would you do differently on a second attempt, or what edge case almost tripped you up?
                        </p>
                        <textarea id="reflection" className="form-textarea"
                          placeholder="Be honest — reviewers appreciate genuine reflection over polished PR answers."
                          value={form.reflection_answers}
                          onChange={e => { setForm(f => ({ ...f, reflection_answers: e.target.value })); setFormErrors(err => ({ ...err, reflection_answers: "" })); }}
                          aria-invalid={!!formErrors.reflection_answers}
                          aria-describedby={formErrors.reflection_answers ? "refl-err" : undefined}
                          rows={4}
                        />
                        {formErrors.reflection_answers && <span id="refl-err" className="form-error" role="alert">{formErrors.reflection_answers}</span>}
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <button type="submit" className="btn btn--primary" disabled={submitting}>
                          {submitting ? <><Spinner size={15} /> Submitting…</> : "Submit for Verification →"}
                        </button>
                        <button type="button" className="btn btn--outline" onClick={() => setShowForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="card" style={{ position: "sticky", top: "80px" }}>
              <h4 style={{ marginBottom: "1rem" }}>Challenge Info</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <p className="text-xs text-faint" style={{ marginBottom: "0.2rem" }}>DIFFICULTY</p>
                  <DifficultyTag level={challenge.difficulty} />
                </div>
                <div>
                  <p className="text-xs text-faint" style={{ marginBottom: "0.2rem" }}>ESTIMATED TIME</p>
                  <p style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={14} /> {challenge.estimated_time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-faint" style={{ marginBottom: "0.4rem" }}>SKILLS EVALUATED</p>
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                    {challenge.skills_evaluated?.map(s => <SkillTag key={s} name={s} />)}
                  </div>
                </div>
              </div>

              <hr className="divider" />

              <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
                <p style={{ marginBottom: "0.3rem" }}>📌 <strong style={{ color: "var(--ink-muted)" }}>Verification note:</strong></p>
                <p>Submissions are reviewed by peers against the rubric above. Explain your reasoning — reviewers value thinking over just correct output.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
