import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const MATCH_STYLES = {
  High:   { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038", dot: "#1d9e75" },
  Medium: { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a", dot: "#4a90d9" },
  Low:    { bg: "#2a1e08", color: "#ef9f27", border: "#4a3010", dot: "#ef9f27" },
};

const REC_STYLES = {
  "Strongly Recommend": { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" },
  "Recommend":          { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" },
  "Consider":           { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" },
  "Do Not Recommend":   { bg: "#2a0808", color: "#e24b4a", border: "#5a1010" },
};

function getMatchStyle(level) {
  return MATCH_STYLES[level] || MATCH_STYLES["Medium"];
}

function getRecStyle(rec) {
  for (const key of Object.keys(REC_STYLES)) {
    if (rec && rec.toLowerCase().includes(key.toLowerCase())) return REC_STYLES[key];
  }
  return { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" };
}

// ── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0d0f14",
    minHeight: "100vh",
    padding: "2rem",
    color: "#e8eaf0",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontFamily: "'DM Mono', monospace",
    color: "#555c70",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0 0 1.5rem 0",
    transition: "color 0.15s",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "2rem",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#4a90d9",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 4px 0",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 500,
    color: "#f0f2f8",
    margin: 0,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  cardLabel: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 12px 0",
  },
  pill: (s) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "15px",
    fontWeight: 500,
    background: s.bg,
    color: s.color,
    border: `1px solid ${s.border}`,
  }),
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #181d2a",
    fontSize: "14px",
    color: "#c8ccd8",
  },
  dot: (color) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    marginTop: "6px",
  }),
  reasoningCard: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderLeft: "3px solid #4a90d9",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  reasoningText: {
    fontSize: "14px",
    color: "#b0b8cc",
    lineHeight: 1.7,
    margin: 0,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },
  scoreCard: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "12px",
    padding: "1rem",
    textAlign: "center",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#0d0f14",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    gap: "8px",
  },
  section: {
  background: "#13161f",
  border: "1px solid #1f2433",
  borderRadius: "14px",
  overflow: "hidden",
  marginTop: "16px",
},

sectionHeader: {
  padding: "1rem 1.5rem",
  borderBottom: "1px solid #1f2433",
},

sectionTitle: {
  fontSize: "14px",
  color: "#c8ccd8",
  margin: 0,
},
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreMiniCard({ label, value, max = 100 }) {
  const num = parseFloat(value) || 0;
  const pct = Math.min((num / max) * 100, 100);
  const color = pct >= 70 ? "#1d9e75" : pct >= 40 ? "#4a90d9" : "#ef9f27";

  return (
    <div style={S.scoreCard}>
      <p style={{
        fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
        color: "#555c70", fontFamily: "'DM Mono', monospace", margin: "0 0 8px 0",
      }}>
        {label}
      </p>
      <p style={{ fontSize: "20px", fontWeight: 500, color, margin: "0 0 8px 0" }}>
        {num.toFixed(num % 1 === 0 ? 0 : 2)}
      </p>
      <div style={{ height: "3px", background: "#1f2433", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

function ItemList({ items, dotColor }) {
  if (!items || items.length === 0) {
    return <p style={{ fontSize: "13px", color: "#333b50", fontFamily: "'DM Mono', monospace" }}>None listed</p>;
  }
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ ...S.listItem, ...(i === items.length - 1 ? { borderBottom: "none" } : {}) }}>
          <span style={S.dot(dotColor)} />
          {item}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user_id");

    if (!user) {
      navigate("/login");
      return;
    }
    API.get(`/results/candidate/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

    // Also fetch ranking scores for this candidate
    API.get("/results/ranking")
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const match = all.find((c) => String(c.candidate_id) === String(id));
        if (match) setScores(match);
      })
      .catch(() => {});
  }, [id]);

  if (!data) {
    return (
      <div style={S.loading}>
        <span style={{ opacity: 0.4 }}>⬤</span> Loading candidate…
      </div>
    );
  }

  if (data.error) {
    return (
      <div style={S.loading}>
        <span style={{ color: "#e24b4a" }}>Candidate not found</span>
      </div>
    );
  }

  const llm = data.llm || {};


  const matchStyle = getMatchStyle(llm.match_level);
  const recStyle   = getRecStyle(llm.recommendation);


  const strengths = Array.isArray(llm.strengths)
    ? llm.strengths
    : llm.strengths
    ? [llm.strengths]
    : [];

  const weaknesses = Array.isArray(llm.weaknesses)
    ? llm.weaknesses
    : llm.weaknesses
    ? [llm.weaknesses]
  : [];

  return (
    <div style={S.root}>

      {/* ── Back button ── */}
      <button
        style={S.backBtn}
        onClick={() => navigate(-1)}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#4a90d9")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#555c70")}
      >
        ‹ Back to ranking
      </button>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <p style={S.eyebrow}>HireOn · Candidate Profile</p>
          <h1 style={S.heading}>Candidate #{id}</h1>
        </div>
      </div>

      {/* ── Score mini cards (from ranking) ── */}
      {scores && (
        <div style={S.scoreGrid}>
          <ScoreMiniCard label="Semantic"      value={scores.semantic_score}      max={100} />
          <ScoreMiniCard label="Skill"         value={scores.skill_score}         max={100} />
          <ScoreMiniCard label="Experience"    value={scores.experience_score}    max={100} />
          <ScoreMiniCard label="Certification" value={scores.certification_score} max={100} />
          <ScoreMiniCard label="Final Score"   value={scores.final_score}         max={100} />
        </div>
      )}

      {/* ── Match + Recommendation ── */}
      <div style={S.grid2}>
        <div style={S.card}>
          <p style={S.cardLabel}>Match Level</p>
          <span style={S.pill(matchStyle)}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: matchStyle.dot }} />
            {llm.match_level || "—"}
          </span>
        </div>

        <div style={S.card}>
          <p style={S.cardLabel}>Recommendation</p>
          <span style={S.pill(recStyle)}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: recStyle.color }} />
            {llm.recommendation || "—"}
          </span>
        </div>
      </div>

      {/* ── Strengths + Weaknesses ── */}
      <div style={S.grid2}>
        <div style={S.card}>
          <p style={S.cardLabel}>Strengths</p>
          <ItemList items={strengths} dotColor="#1d9e75" />
        </div>

        <div style={S.card}>
          <p style={S.cardLabel}>Weaknesses</p>
          <ItemList items={weaknesses} dotColor="#ef9f27" />
        </div>
      </div>

      {/* ── Reasoning ── */}
      {llm.reasoning && (
        <div style={S.reasoningCard}>
          <p style={S.cardLabel}>Reasoning</p>
          <p style={S.reasoningText}>{llm.reasoning}</p>
        </div>
      )}

      {/* ✅ ── SHAP Explanation ── */}
      {data.shap && (
  <div style={S.section}>
    <div style={S.sectionHeader}>
      <p style={S.sectionTitle}>SHAP Explanation</p>
    </div>

    <div style={{ padding: "1rem 1.5rem" }}>
      {Object.entries(data.shap)
        .filter(([key]) => key.includes("score")) // keep only score fields
        .map(([key, value]) => {
          const val = parseFloat(value) || 0;
          const isPositive = val >= 0;

          return (
            <div key={key} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{key.replace("_", " ")}</span>
                <span style={{ color: isPositive ? "#1d9e75" : "#e24b4a" }}>
                  {val.toFixed(2)}
                </span>
              </div>

              <div style={{
                height: "4px",
                background: "#1f2433",
                borderRadius: "2px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${Math.min(Math.abs(val) * 2, 100)}%`,
                  height: "100%",
                  background: isPositive ? "#1d9e75" : "#e24b4a"
                }} />
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}
    </div>
  );
}

export default CandidateDetails;