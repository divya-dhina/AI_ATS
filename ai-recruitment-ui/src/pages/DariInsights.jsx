import { useEffect, useState } from "react";
import API from "../services/api";

// ── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0d0f14",
    minHeight: "100vh",
    padding: "2rem",
    color: "#e8eaf0",
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
    margin: "0 0 2rem 0",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
    marginBottom: "1.75rem",
  },
  summaryCard: (accentColor) => ({
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
    position: "relative",
    overflow: "hidden",
  }),
  cardLabel: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 8px 0",
  },
  section: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "16px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.1rem 1.5rem",
    borderBottom: "1px solid #1f2433",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#c8ccd8",
    margin: 0,
  },
  badge: {
    background: "#1d2a3a",
    border: "1px solid #2a3a5a",
    color: "#4a90d9",
    fontSize: "11px",
    fontFamily: "'DM Mono', monospace",
    padding: "3px 9px",
    borderRadius: "20px",
  },
  th: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    fontWeight: 400,
    padding: "10px 1.5rem",
    textAlign: "left",
    background: "#0f1219",
    borderBottom: "1px solid #1a1f2e",
  },
  td: {
    padding: "12px 1.5rem",
    fontSize: "13px",
    color: "#b0b8cc",
    borderBottom: "1px solid #181d2a",
    verticalAlign: "middle",
  },
  clusterChip: (i) => {
    const COLORS = [
      { bg: "#1a2d4a", color: "#4a90d9", border: "#2a3a5a" },
      { bg: "#1a1040", color: "#7f77dd", border: "#2d2460" },
      { bg: "#0d2a1e", color: "#1d9e75", border: "#1d5038" },
      { bg: "#2a1e08", color: "#ef9f27", border: "#4a3010" },
    ];
    const c = COLORS[i % COLORS.length];
    return {
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 500,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      marginBottom: "4px",
    };
  },
  imgGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },
  imgCard: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "14px",
    overflow: "hidden",
  },
  imgLabel: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    padding: "10px 14px",
    borderBottom: "1px solid #1f2433",
  },
  statRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px",
    background: "#1f2433",
  },
  statCell: (color) => ({
    background: "#13161f",
    padding: "1rem 1.5rem",
  }),
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

const ACCENT_COLORS = ["#4a90d9", "#1d9e75", "#ef9f27"];

function SummaryCard({ label, value, index }) {
  const color = ACCENT_COLORS[index] || "#4a90d9";
  return (
    <div style={S.summaryCard(color)}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "56px", height: "56px",
        borderRadius: "0 14px 0 56px",
        background: `${color}15`,
      }} />
      <p style={S.cardLabel}>{label}</p>
      <p style={{ fontSize: "32px", fontWeight: 500, lineHeight: 1, color, margin: 0 }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function SkillBar({ skill, count, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <tr>
      <td style={S.td}>
        <span style={{ color: "#e0e4f0", fontWeight: 500 }}>{skill}</span>
      </td>
      <td style={{ ...S.td, width: "50%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            flex: 1, height: "4px", background: "#1f2433",
            borderRadius: "2px", overflow: "hidden",
          }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: "#4a90d9", borderRadius: "2px",
            }} />
          </div>
          <span style={{
            fontSize: "12px", fontFamily: "'DM Mono', monospace",
            color: "#4a90d9", minWidth: "20px", textAlign: "right",
          }}>
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function DariInsights() {
  const [insights, setInsights] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user_id");

    if (!user) {
      navigate("/login");
      return;
    }
    API.get("/insights")
      .then((res) => setInsights(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!insights) {
    return (
      <div style={S.loading}>
        <span style={{ opacity: 0.4 }}>⬤</span> Loading insights…
      </div>
    );
  }

  const { summary, skills_chart, experience_chart, clusters, images } = insights;
  const maxSkillCount = skills_chart?.values?.length
    ? Math.max(...skills_chart.values)
    : 1;

  return (
    <div style={S.root}>
      <p style={S.eyebrow}>HireOn · Analytics</p>
      <h1 style={S.heading}>DARI Insights</h1>

      {/* ── Summary cards ── */}
      <div style={S.summaryGrid}>
        <SummaryCard label="Total Candidates" value={summary?.total_candidates} index={0} />
        <SummaryCard label="Avg Experience"   value={summary?.avg_experience}   index={1} />
        <SummaryCard label="Top Skill"        value={summary?.top_skill || "N/A"} index={2} />
      </div>

      {/* ── Skills table ── */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <p style={S.sectionTitle}>Top Skills</p>
          <span style={S.badge}>{skills_chart?.labels?.length ?? 0} skills</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>Skill</th>
              <th style={S.th}>Candidates</th>
            </tr>
          </thead>
          <tbody>
            {skills_chart?.labels
            ?.slice(0, showAllSkills ? skills_chart.labels.length : 5)
            .map((skill, i) => (
              <SkillBar
                key={i}
                skill={skill}
                count={skills_chart.values[i]}
                maxCount={maxSkillCount}
              />
            ))}
            {(!skills_chart?.labels || skills_chart.labels.length === 0) && (
              <tr>
                <td colSpan={2} style={{ ...S.td, textAlign: "center", color: "#333b50" }}>
                  No skill data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
              {skills_chart?.labels?.length > 5 && (
        <div style={{ padding: "12px", textAlign: "center" }}>
          <button
            onClick={() => setShowAllSkills(!showAllSkills)}
            style={{
              background: "transparent",
              border: "1px solid #2a3a5a",
              color: "#4a90d9",
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {showAllSkills ? "Show Less" : "Show More"}
          </button>
        </div>
)}
      </div>

      {/* ── Experience stats ── */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <p style={S.sectionTitle}>Experience Stats</p>
        </div>
        <div style={S.statRow}>
          {[
            { label: "Average", value: experience_chart?.average, color: "#4a90d9" },
            { label: "Min",     value: experience_chart?.min,     color: "#1d9e75" },
            { label: "Max",     value: experience_chart?.max,     color: "#ef9f27" },
          ].map(({ label, value, color }) => (
            <div key={label} style={S.statCell(color)}>
              <p style={{ ...S.cardLabel, margin: "0 0 6px 0" }}>{label}</p>
              <p style={{ fontSize: "24px", fontWeight: 500, color, margin: 0 }}>
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Clusters ── */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <p style={S.sectionTitle}>Candidate Clusters</p>
          <span style={S.badge}>{Object.keys(clusters || {}).length} clusters</span>
        </div>
        <div style={{ padding: "1rem 1.5rem" }}>
          {clusters && Object.entries(clusters).map(([cluster, candidates], i) => (
            <div key={cluster} style={{
              padding: "12px 0",
              borderBottom: i < Object.keys(clusters).length - 1 ? "1px solid #181d2a" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={S.clusterChip(parseInt(cluster))}>Cluster {cluster}</span>
                <span style={{
                  fontSize: "11px", color: "#555c70",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {candidates.map((name, j) => (
                  <span key={j} style={{
                    fontSize: "12px", color: "#b0b8cc",
                    background: "#1a1f2e", padding: "3px 10px",
                    borderRadius: "6px", border: "1px solid #252c3f",
                    fontFamily: "'DM Mono', monospace",
                    maxWidth: "260px", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart images ── */}
      {images && (
        <div style={S.imgGrid}>
          {[
            { key: "skills",     label: "Skills distribution" },
            { key: "experience", label: "Experience distribution" },
            { key: "clusters",   label: "Candidate clusters" },
          ].map(({ key, label }) => (
            <div key={key} style={S.imgCard}>
              <p style={S.imgLabel}>{label}</p>
              <img
                src={`http://localhost:8000${images[key]}`}
                alt={label}
                style={{ width: "100%", display: "block" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DariInsights;