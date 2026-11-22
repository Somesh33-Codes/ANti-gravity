// Reusable UI Components — Snigdha: Frontend UI / Somesh: Dashboard & Features

export function Badge({ variant = "skill", children, ...props }) {
  return (
    <span className={`badge badge--${variant}`} {...props}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    verified: { label: "Verified", variant: "verified" },
    submitted: { label: "Submitted", variant: "pending" },
    in_review: { label: "In Review", variant: "review" },
    revision_requested: { label: "Needs Revision", variant: "pending" },
  };
  const { label, variant } = map[status] || { label: status, variant: "skill" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function DifficultyTag({ level }) {
  const colorMap = {
    Beginner: "beginner",
    Intermediate: "intermediate",
    Advanced: "advanced",
  };
  return <Badge variant={colorMap[level] || "skill"}>{level}</Badge>;
}

export function SkillTag({ name }) {
  return <Badge variant="skill">{name}</Badge>;
}

export function Alert({ type = "info", children }) {
  return (
    <div className={`alert alert--${type}`} role={type === "error" ? "alert" : "status"}>
      <span>{children}</span>
    </div>
  );
}

export function Spinner({ size = 20, label = "Loading…" }) {
  return (
    <span role="status" aria-label={label} style={{ display: "inline-block" }}>
      <svg
        width={size} height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ animation: "spin 0.8s linear infinite", color: "var(--cobalt)" }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
        <path d="M12 3a9 9 0 0 1 9 9" />
      </svg>
    </span>
  );
}

export function LoadingPage({ label = "Loading…" }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "0.75rem", minHeight: "60vh", color: "var(--ink-muted)",
        fontSize: "0.9rem"
      }}
    >
      <Spinner size={22} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "4rem 2rem", gap: "1rem",
        color: "var(--ink-muted)"
      }}
    >
      {Icon && (
        <div
          style={{
            width: 56, height: 56, background: "var(--bg-alt)",
            borderRadius: "var(--radius)", display: "flex",
            alignItems: "center", justifyContent: "center", color: "var(--ink-faint)"
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <div>
        <h3 style={{ fontSize: "1.1rem", color: "var(--ink)", marginBottom: "0.4rem" }}>{title}</h3>
        {description && <p style={{ fontSize: "0.88rem", maxWidth: "360px" }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ScoreCircle({ score, size = 72 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 85 ? "var(--success)" : score >= 65 ? "var(--cobalt)" : "var(--tangerine)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score: ${score}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-alt)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x="50%" y="50%"
        dominantBaseline="middle" textAnchor="middle"
        style={{ fontFamily: "var(--font-display)", fontSize: size < 60 ? "0.9rem" : "1.1rem", fontWeight: 700, fill: "var(--ink)" }}
      >
        {score}
      </text>
    </svg>
  );
}

export function RubricBreakdown({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {items.map((item, i) => {
        const pct = item.max ? Math.round((item.score / item.max) * 100) : 0;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{item.criterion}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                {item.score}/{item.max}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar__fill${pct >= 85 ? " progress-bar__fill--success" : pct < 60 ? " progress-bar__fill--warning" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {item.comments && (
              <p style={{ fontSize: "0.78rem", color: "var(--ink-faint)", marginTop: "0.25rem" }}>{item.comments}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ marginBottom: subtitle ? "0.5rem" : 0 }}>{title}</h1>
          {subtitle && <p style={{ maxWidth: "60ch", fontSize: "1rem" }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>{actions}</div>}
      </div>
    </header>
  );
}
