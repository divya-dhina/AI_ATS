import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const RANK_COLORS = [
  { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" },   // #1 blue
  { bg: "#1a1040", color: "#7f77dd", border: "#2d2460" },   // #2 purple
  { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" },   // #3 teal
  { bg: "#2a1e08", color: "#ef9f27", border: "#4a3010" },   // #4+ amber
];

function getRankColor(index) {
  return RANK_COLORS[Math.min(index, RANK_COLORS.length - 1)];
}

function getScoreStyle(score) {
  if (score >= 70) return { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" };
  if (score >= 40) return { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" };
  return { bg: "#2a1e08", color: "#ef9f27", border: "#4a3010" };
}

function scoreBar(value, max = 100) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? "#1d9e75" : pct >= 40 ? "#4a90d9" : "#ef9f27";
  return { pct, color };
}

function today() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Score columns in display order
const SCORE_COLS = [
  { key: "semantic_score",       label: "Semantic" },
  { key: "skill_score",          label: "Skill" },
  { key: "experience_score",     label: "Experience" },
  { key: "certification_score",  label: "Certification" },
  { key: "project_score",        label: "Project" },
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
    marginBottom: "4px",
    fontFamily: "'DM Mono', monospace",
    margin: 0,
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
  alert: {
    background: "#151a2a",
    border: "1px solid #2a3a5a",
    borderLeft: "3px solid #ef9f27",
    borderRadius: "10px",
    padding: "14px 18px",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  alertDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#ef9f27",
    flexShrink: 0,
  },
  alertText: {
    fontSize: "13px",
    color: "#e8c87a",
    margin: 0,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
    marginBottom: "1.75rem",
  },
  card: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
    position: "relative",
    overflow: "hidden",
  },
  cardLabel: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    marginBottom: "10px",
    margin: "0 0 10px 0",
  },
  cardSub: {
    fontSize: "11px",
    color: "#555c70",
    marginTop: "6px",
    fontFamily: "'DM Mono', monospace",
    margin: "6px 0 0 0",
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
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #1f2433",
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
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
    padding: "14px 14px",
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
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#0d0f14",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    gap: "8px",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 100 }) {
  const { pct, color } = scoreBar(value, max);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{
        flex: 1,
        height: "4px",
        background: "#1f2433",
        borderRadius: "2px",
        overflow: "hidden",
        minWidth: "40px",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: "2px",
          transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{
        fontSize: "12px",
        fontFamily: "'DM Mono', monospace",
        color: "#b0b8cc",
        minWidth: "34px",
        textAlign: "right",
      }}>
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
}

function RankBadge({ rank }) {
  const s = getRankColor(rank - 1);
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "28px",
      height: "28px",
      borderRadius: "8px",
      fontSize: "12px",
      fontFamily: "'DM Mono', monospace",
      fontWeight: 500,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {rank}
    </span>
  );
}

function FinalScorePill({ score }) {
  const s = getScoreStyle(score);
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontFamily: "'DM Mono', monospace",
      fontWeight: 500,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {Number(score).toFixed(2)}
    </span>
  );
}

function StatusChip({ shortlisted }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "11px",
      padding: "3px 9px",
      borderRadius: "20px",
      fontFamily: "'DM Mono', monospace",
      background: shortlisted ? "#0d2a1e" : "#1a2d4a",
      color: shortlisted ? "#1d9e75" : "#4a90d9",
      border: `1px solid ${shortlisted ? "#1d5038" : "#2a3a5a"}`,
    }}>
      <span style={{
        width: "5px", height: "5px", borderRadius: "50%",
        background: shortlisted ? "#1d9e75" : "#4a90d9",
      }} />
      {shortlisted ? "Shortlisted" : "Reviewing"}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user_id");

    if (!user) {
      navigate("/login");
      return;
    }
      API.get("/results/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div style={S.loading}>
        <span style={{ opacity: 0.4 }}>⬤</span> Loading dashboard…
      </div>
    );
  }

  const isShortlisted = data.shortlisted && data.shortlisted.length > 0;
  const displayData = isShortlisted
    ? data.shortlisted
    : data.top_candidates || [];

  if (!displayData || displayData.length === 0) {
    return (
      <div style={S.empty}>
        <span style={{ fontSize: "24px", opacity: 0.2 }}>◎</span>
        <p style={{ margin: 0 }}>No candidates available</p>
      </div>
    );
  }

  const conversionRate =
    data.total_candidates > 0
      ? (((data.shortlisted?.length || 0) / data.total_candidates) * 100).toFixed(1)
      : "0.0";

  const tableLabel = isShortlisted ? "Shortlisted Candidates" : "Top Candidates";

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <p style={S.eyebrow}>Recruitment Intelligence</p>
          <h1 style={S.heading}>Dashboard</h1>
        </div>
        <span style={S.date}>{today()}</span>
      </div>

      {/* ── Alert ── */}
      {data.message && (
        <div style={S.alert}>
          <div style={S.alertDot} />
          <p style={S.alertText}>{data.message}</p>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={S.cards}>
        <div style={S.card}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "60px", height: "60px",
            borderRadius: "0 14px 0 60px",
            background: "#4a90d915",
          }} />
          <p style={S.cardLabel}>Total Candidates</p>
          <p style={{ fontSize: "38px", fontWeight: 500, lineHeight: 1, color: "#4a90d9", margin: 0 }}>
            {data.total_candidates ?? "—"}
          </p>
          <p style={S.cardSub}>across all rankings</p>
        </div>

        <div style={S.card}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "60px", height: "60px",
            borderRadius: "0 14px 0 60px",
            background: "#1d9e7515",
          }} />
          <p style={S.cardLabel}>Top Score</p>
          <p style={{ fontSize: "38px", fontWeight: 500, lineHeight: 1, color: "#1d9e75", margin: 0 }}>
            {data.top_score != null ? Number(data.top_score).toFixed(2) : "—"}
          </p>
          <p style={S.cardSub}>highest final score</p>
        </div>

        <div style={S.card}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "60px", height: "60px",
            borderRadius: "0 14px 0 60px",
            background: "#ef9f2715",
          }} />
          <p style={S.cardLabel}>Shortlisted</p>
          <p style={{ fontSize: "38px", fontWeight: 500, lineHeight: 1, color: "#ef9f27", margin: 0 }}>
            {data.shortlisted?.length ?? 0}
          </p>
          <p style={S.cardSub}>{conversionRate}% conversion rate</p>
        </div>
      </div>

      {/* ── Candidate table ── */}
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <p style={S.tableTitle}>
            {tableLabel}
            <span style={{
              background: isShortlisted ? "#0d2a1e" : "#1d2a3a",
              border: `1px solid ${isShortlisted ? "#1d5038" : "#2a3a5a"}`,
              color: isShortlisted ? "#1d9e75" : "#4a90d9",
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              padding: "3px 9px",
              borderRadius: "20px",
            }}>
              {displayData.length} {isShortlisted ? "selected" : "shown"}
            </span>
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <colgroup>
              <col style={{ width: "48px" }} />  {/* rank */}
              <col style={{ width: "90px" }} />  {/* candidate id */}
              {SCORE_COLS.map((sc) => (
                <col key={sc.key} style={{ width: "auto" }} />
              ))}
              <col style={{ width: "110px" }} /> {/* final score */}
              <col style={{ width: "110px" }} /> {/* status */}
              <col style={{ width: "24px" }} />  {/* chevron */}
            </colgroup>

            <thead>
              <tr>
                <th style={S.th}>#</th>
                <th style={S.th}>ID</th>
                {SCORE_COLS.map((sc) => (
                  <th key={sc.key} style={S.th}>{sc.label}</th>
                ))}
                <th style={S.th}>Final Score</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th }} />
              </tr>
            </thead>

            <tbody>
              {displayData.map((c, i) => {
                const shortlistStatus = c.is_shortlisted ?? isShortlisted;

                return (
                  <tr
                    key={i}
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
                      <RankBadge rank={i + 1} />
                    </td>

                    {/* Candidate ID */}
                    <td style={{ ...S.td, fontFamily: "'DM Mono', monospace", color: "#e0e4f0", fontWeight: 500 }}>
                      #{c.candidate_id ?? "—"}
                    </td>

                    {/* Individual score bars */}
                    {SCORE_COLS.map((sc) => (
                      <td key={sc.key} style={S.td}>
                        {c[sc.key] != null ? (
                          <ScoreBar value={c[sc.key]} max={100} />
                        ) : (
                          <span style={{ color: "#333b50" }}>—</span>
                        )}
                      </td>
                    ))}

                    {/* Final score pill */}
                    <td style={S.td}>
                      {c.final_score != null ? (
                        <FinalScorePill score={c.final_score} />
                      ) : "—"}
                    </td>

                    {/* Status */}
                    <td style={S.td}>
                      <StatusChip shortlisted={shortlistStatus} />
                    </td>

                    {/* Chevron */}
                    <td style={{ ...S.td, color: "#333b50", fontSize: "16px" }}>›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={S.footer}>Click any row to view full candidate profile</p>
    </div>
  );
}

export default Dashboard;