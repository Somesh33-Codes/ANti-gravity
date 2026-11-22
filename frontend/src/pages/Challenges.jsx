import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { challengesApi } from "../services/api";
import { DifficultyTag, SkillTag, LoadingPage, EmptyState, PageHeader } from "../components/ui";
import { BookOpen, Clock, Filter } from "lucide-react";

const CATEGORIES = ["Frontend Development", "Software Engineering", "Professional Skills"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";

  useEffect(() => {
    setLoading(true);
    challengesApi.list({ category, difficulty })
      .then(setChallenges)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, difficulty]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  if (loading) return <LoadingPage label="Loading challenges…" />;

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Challenge Library"
          title="Practical skill challenges"
          subtitle="Complete a task, submit your work, and earn verified skill evidence. No certificates needed."
        />

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem", padding: "1rem", background: "var(--bg-alt)", borderRadius: "var(--radius)", border: "1.5px solid var(--border)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 600, color: "var(--ink-muted)" }}>
            <Filter size={14} /> Filter:
          </span>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              className={`btn btn--sm ${!category ? "btn--primary" : "btn--outline"}`}
              onClick={() => setFilter("category", "")}
            >All categories</button>
            {CATEGORIES.map(c => (
              <button key={c}
                className={`btn btn--sm ${category === c ? "btn--primary" : "btn--outline"}`}
                onClick={() => setFilter("category", category === c ? "" : c)}
              >{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginLeft: "auto" }}>
            {DIFFICULTIES.map(d => (
              <button key={d}
                className={`btn btn--sm ${difficulty === d ? "btn--primary" : "btn--outline"}`}
                onClick={() => setFilter("difficulty", difficulty === d ? "" : d)}
              >{d}</button>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert--error" style={{ marginBottom: "1.5rem" }}>{error}</div>
        )}

        {challenges.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No challenges match your filters"
            description="Try removing a filter or check back later for new tasks."
            action={<button className="btn btn--outline btn--sm" onClick={() => setSearchParams({})}>Clear filters</button>}
          />
        ) : (
          <>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", marginBottom: "1rem" }}>
              {challenges.length} challenge{challenges.length !== 1 ? "s" : ""}
            </p>
            <div className="grid-2">
              {challenges.map(ch => (
                <ChallengeCard key={ch.id} challenge={ch} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge: ch }) {
  return (
    <article className="card card--hover" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cobalt)" }}>
            {ch.category}
          </span>
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", flexShrink: 0 }}>
            <DifficultyTag level={ch.difficulty} />
          </div>
        </div>
        <h3 style={{ fontSize: "1rem", lineHeight: 1.35, marginBottom: "0.5rem" }}>{ch.title}</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>{ch.summary}</p>
      </div>

      <div style={{ marginTop: "auto" }}>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
          {ch.skills_evaluated?.map(s => <SkillTag key={s} name={s} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--ink-faint)" }}>
            <Clock size={12} /> {ch.estimated_time}
          </span>
          <Link to={`/challenges/${ch.slug}`} className="btn btn--primary btn--sm">
            Open Challenge →
          </Link>
        </div>
      </div>
    </article>
  );
}
