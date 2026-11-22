import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Spinner } from "../components/ui";

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 36, height: 36, background: "var(--ink)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff", fontStyle: "italic" }}>Sp</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--ink)" }}>SkillProof</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: "0.9rem" }}>{subtitle}</p>}
        </div>
        <div className="card">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fill = (email, password) => setForm({ email, password });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "employer" ? "/employer" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your SkillProof account">
      <form onSubmit={handleSubmit} noValidate>
        {error && <Alert type="error">{error}</Alert>}
        <div className="form-group" style={{ marginTop: error ? "1rem" : 0 }}>
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-input" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email" required aria-required="true"
            aria-invalid={!!error} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="form-input" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="current-password" required aria-required="true" />
        </div>
        <button type="submit" className="btn btn--primary w-full" disabled={loading} style={{ marginTop: "0.5rem" }}>
          {loading ? <><Spinner size={15} /> Signing in…</> : "Sign In →"}
        </button>
      </form>

      <hr className="divider" />
      <div>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.6rem" }}>
          Quick demo accounts
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {[
            { label: "Student (Aarav — full passport)", e: "student@skillproof.org", p: "student123" },
            { label: "Employer (Neha — blind review)", e: "employer@skillproof.org", p: "employer123" },
          ].map(d => (
            <button key={d.e} type="button"
              className="btn btn--outline btn--sm w-full"
              onClick={() => fill(d.e, d.p)}
              style={{ justifyContent: "flex-start", fontWeight: 400 }}
            >
              <span style={{ fontWeight: 600, minWidth: 60 }}>Fill →</span> {d.label}
            </button>
          ))}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "1.25rem" }}>
        No account? <Link to="/register">Create one free</Link>
      </p>
    </AuthCard>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "employer" ? "employer" : "student";

  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirmPassword: "",
    role: defaultRole, college: "", graduation_year: "2028",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2) errs.full_name = "Full name must be at least 2 characters.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email address.";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setServerError("");
    setLoading(true);
    try {
      const user = await register({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        college: form.college.trim(),
        graduation_year: parseInt(form.graduation_year) || 2028,
      });
      navigate(user.role === "employer" ? "/employer" : "/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Start building your Skill Passport today">
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <Alert type="error">{serverError}</Alert>}

        <div className="form-group">
          <label className="form-label" htmlFor="role">I am a</label>
          <select id="role" className="form-select" value={form.role} onChange={e => setField("role", e.target.value)}>
            <option value="student">Student — building my Skill Passport</option>
            <option value="employer">Employer — hiring by demonstrated skill</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="full_name">Full Name</label>
          <input id="full_name" type="text" className="form-input" value={form.full_name}
            onChange={e => setField("full_name", e.target.value)}
            autoComplete="name" required aria-required="true"
            aria-describedby={errors.full_name ? "name-err" : undefined}
            aria-invalid={!!errors.full_name} />
          {errors.full_name && <span id="name-err" className="form-error" role="alert">{errors.full_name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" className="form-input" value={form.email}
            onChange={e => setField("email", e.target.value)}
            autoComplete="email" required aria-required="true"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
          {errors.email && <span id="email-err" className="form-error" role="alert">{errors.email}</span>}
        </div>

        {form.role === "student" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="college">College / Institution</label>
              <input id="college" type="text" className="form-input" value={form.college}
                onChange={e => setField("college", e.target.value)} placeholder="e.g. GEC Bilaspur" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="grad_year">Grad Year</label>
              <input id="grad_year" type="number" className="form-input" value={form.graduation_year}
                onChange={e => setField("graduation_year", e.target.value)} min="2024" max="2032" style={{ width: 90 }} />
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginTop: "0.75rem" }}>
          <label className="form-label" htmlFor="reg-pass">Password</label>
          <input id="reg-pass" type="password" className="form-input" value={form.password}
            onChange={e => setField("password", e.target.value)}
            autoComplete="new-password" required aria-required="true"
            aria-invalid={!!errors.password} aria-describedby={errors.password ? "pass-err" : "pass-hint"} />
          {errors.password
            ? <span id="pass-err" className="form-error" role="alert">{errors.password}</span>
            : <span id="pass-hint" className="form-hint">Minimum 6 characters</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirm-pass">Confirm Password</label>
          <input id="confirm-pass" type="password" className="form-input" value={form.confirmPassword}
            onChange={e => setField("confirmPassword", e.target.value)}
            autoComplete="new-password" required aria-required="true"
            aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "conf-err" : undefined} />
          {errors.confirmPassword && <span id="conf-err" className="form-error" role="alert">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn btn--primary w-full" disabled={loading} style={{ marginTop: "0.5rem" }}>
          {loading ? <><Spinner size={15} /> Creating account…</> : "Create Account →"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "1.25rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthCard>
  );
}
