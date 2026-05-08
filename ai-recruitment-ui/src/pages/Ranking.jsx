import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const RANK_COLORS = [
  { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" },
  { bg: "#1a1040", color: "#7f77dd", border: "#2d2460" },
  { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" },
  { bg: "#2a1e08", color: "#ef9f27", border: "#4a3010" },
];

function getRankColor(i) {
  return RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)];
}

function getScoreStyle(score) {
  if (score >= 70) return { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" };
  if (score >= 40) return { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" };
  return { bg: "#2a1e08", color: "#ef9f27", border: "#4a3010" };
}

function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, c) => s + (parseFloat(c[key]) || 0), 0) / arr.length;
}

const SCORE_COLS = [
  { key: "semantic_score",      label: "Semantic",     max: 100 },
  { key: "skill_score",         label: "Skill",        max: 100 },
  { key: "experience_score",    label: "Experience",   max: 100 },
  { key: "certification_score", label: "Certification",max: 100 },
  { key: "project_score",       label: "Project",      max: 10  },
];

// ── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0d0f14",
    minHeight: "100vh",
    padding: "2rem",
    color: "#e8eaf0",
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
  date: {
    fontSize: "12px",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "1.75rem",
  },
  sCard: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    position: "relative",
    overflow: "hidden",
  },
  scLbl: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 6px 0",
  },
  tableWrap: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "14px",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.1rem 1.5rem",
    borderBottom: "1px solid #1f2433",
    flexWrap: "wrap",
    gap: "10px",
  },
  tableTitle: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#c8ccd8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },
  filterRow: {
    display: "flex",
    gap: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    fontWeight: 400,
    padding: "10px 14px",
    textAlign: "left",
    background: "#0f1219",
    borderBottom: "1px solid #1a1f2e",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 14px",
    fontSize: "13px",
    color: "#b0b8cc",
    borderBottom: "1px solid #181d2a",
    verticalAlign: "middle",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "11px",
    color: "#333b50",
    fontFamily: "'DM Mono', monospace",
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
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, accentColor }) {
  return (
    <div style={S.sCard}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "48px", height: "48px",
        borderRadius: "0 12px 0 48px",
        background: `${accentColor}15`,
      }} />
      <p style={S.scLbl}>{label}</p>
      <p style={{ fontSize: "26px", fontWeight: 500, lineHeight: 1, color: accentColor, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

function ScoreBar({ value, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? "#1d9e75" : pct >= 40 ? "#4a90d9" : "#ef9f27";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{
        width: "60px", height: "4px",
        background: "#1f2433", borderRadius: "2px", overflow: "hidden",
      }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
      <span style={{
        fontSize: "12px", fontFamily: "'DM Mono', monospace",
        color: "#b0b8cc", minWidth: "32px", textAlign: "right",
      }}>
        {Number(value).toFixed(value % 1 === 0 ? 0 : 2)}
      </span>
    </div>
  );
}

function FinalScorePill({ score }) {
  const s = getScoreStyle(score);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "4px 12px", borderRadius: "20px",
      fontSize: "13px", fontFamily: "'DM Mono', monospace", fontWeight: 500,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {Number(score).toFixed(2)}
    </span>
  );
}

function ShortlistChip({ value }) {
  const on = value === true || value === "true";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "11px", padding: "3px 9px", borderRadius: "20px",
      fontFamily: "'DM Mono', monospace",
      background: on ? "#0d2a1e" : "#1a1f2e",
      color: on ? "#1d9e75" : "#555c70",
      border: `1px solid ${on ? "#1d5038" : "#252c3f"}`,
    }}>
      <span style={{
        width: "5px", height: "5px", borderRadius: "50%",
        background: on ? "#1d9e75" : "#555c70",
      }} />
      {on ? "Yes" : "No"}
    </span>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: "11px", fontFamily: "'DM Mono', monospace",
        padding: "4px 12px", borderRadius: "20px", cursor: "pointer",
        border: `1px solid ${active ? "#2a3a5a" : "#252c3f"}`,
        color: active ? "#4a90d9" : "#555c70",
        background: active ? "#1a2d4a" : "transparent",
        transition: "all 0.15s",
        userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}

function today() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────────────────────

function Ranking() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "shortlisted" | "not_shortlisted"

  useEffect(() => {
    const user = localStorage.getItem("user_id");

    if (!user) {
      navigate("/login");
      return;
    }

    API.get("/results/ranking")
      .then((res) => setCandidates(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, []);

  if (candidates.length === 0) {
    return (
      <div style={S.loading}>
        <span style={{ opacity: 0.4 }}>⬤</span> Loading candidates…
      </div>
    );
  }

  // Filter
  const filtered = candidates.filter((c) => {
    if (filter === "shortlisted") return c.is_shortlisted === true || c.is_shortlisted === "true";
    if (filter === "not_shortlisted") return !c.is_shortlisted || c.is_shortlisted === "false";
    return true;
  });

  // Summary stats
  const shortlistedCount = candidates.filter(
    (c) => c.is_shortlisted === true || c.is_shortlisted === "true"
  ).length;
  const topScore = Math.max(...candidates.map((c) => parseFloat(c.final_score) || 0));
  const avgScore = avg(candidates, "final_score");

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <p style={S.eyebrow}>HireOn · Rankings</p>
          <h1 style={S.heading}>Candidate Ranking</h1>
        </div>
        <span style={S.date}>{today()}</span>
      </div>

      {/* ── Summary cards ── */}
      <div style={S.summaryGrid}>
        <SummaryCard label="Total"       value={candidates.length}          accentColor="#4a90d9" />
        <SummaryCard label="Shortlisted" value={shortlistedCount}           accentColor="#1d9e75" />
        <SummaryCard label="Top Score"   value={topScore.toFixed(2)}        accentColor="#ef9f27" />
        <SummaryCard label="Avg Score"   value={avgScore.toFixed(2)}        accentColor="#7f77dd" />
      </div>

      {/* ── Table ── */}
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <p style={S.tableTitle}>
            All Candidates
            <span style={{
              background: "#1d2a3a", border: "1px solid #2a3a5a",
              color: "#4a90d9", fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              padding: "3px 9px", borderRadius: "20px",
            }}>
              {filtered.length} {filter === "all" ? "total" : "shown"}
            </span>
          </p>
          <div style={S.filterRow}>
            <FilterChip label="All"            active={filter === "all"}            onClick={() => setFilter("all")} />
            <FilterChip label="Shortlisted"    active={filter === "shortlisted"}    onClick={() => setFilter("shortlisted")} />
            <FilterChip label="Not shortlisted" active={filter === "not_shortlisted"} onClick={() => setFilter("not_shortlisted")} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: "48px" }}>#</th>
                <th style={{ ...S.th, width: "70px" }}>ID</th>
                {SCORE_COLS.map((sc) => (
                  <th key={sc.key} style={S.th}>{sc.label}</th>
                ))}
                <th style={S.th}>Final Score</th>
                <th style={S.th}>Shortlisted</th>
                <th style={{ ...S.th, width: "24px" }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const rc = getRankColor(i);
                return (
                  <tr
                    key={c.candidate_id ?? i}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/candidate/${c.candidate_id}`)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#181d2a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Rank */}
                    <td style={S.td}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        justifyContent: "center", width: "28px", height: "28px",
                        borderRadius: "8px", fontSize: "12px",
                        fontFamily: "'DM Mono', monospace", fontWeight: 500,
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                      }}>
                        {i + 1}
                      </span>
                    </td>

                    {/* ID */}
                    <td style={{
                      ...S.td,
                      fontFamily: "'DM Mono', monospace",
                      color: "#e0e4f0", fontWeight: 500,
                    }}>
                      #{c.candidate_id}
                    </td>

                    {/* Score bars */}
                    {SCORE_COLS.map((sc) => (
                      <td key={sc.key} style={S.td}>
                        {c[sc.key] != null
                          ? <ScoreBar value={parseFloat(c[sc.key])} max={sc.max} />
                          : <span style={{ color: "#333b50" }}>—</span>
                        }
                      </td>
                    ))}

                    {/* Final score */}
                    <td style={S.td}>
                      {c.final_score != null
                        ? <FinalScorePill score={parseFloat(c.final_score)} />
                        : "—"
                      }
                    </td>

                    {/* Shortlisted */}
                    <td style={S.td}>
                      <ShortlistChip value={c.is_shortlisted} />
                    </td>

                    {/* Chevron */}
                    <td style={{ ...S.td, color: "#333b50", fontSize: "16px" }}>›</td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={SCORE_COLS.length + 4} style={{
                    ...S.td,
                    textAlign: "center",
                    color: "#333b50",
                    padding: "2rem",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12px",
                  }}>
                    No candidates match this filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={S.footer}>Click any row to view full candidate profile</p>
    </div>
  );
}

export default Ranking;