import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Upload",        path: "/" },
  { label: "Dashboard",     path: "/dashboard" },
  { label: "Ranking",       path: "/ranking" },
  { label: "DARI Insights", path: "/dari" },
];


function Sidebar() {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("user_id");
    window.location.href = "/login";
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{
      width: "220px",
      background: "#0a0c11",
      borderRight: "1px solid #1a1f2e",
      height: "100vh",
      padding: "1.5rem 1rem",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      flexShrink: 0,
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: "0 0.5rem 2rem 0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "26px", height: "26px", borderRadius: "7px",
            background: "#1a2d4a", border: "1px solid #2a3a5a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="4" height="4" rx="1" fill="#4a90d9"/>
              <rect x="8" y="2" width="4" height="4" rx="1" fill="#4a90d9" opacity="0.5"/>
              <rect x="2" y="8" width="4" height="4" rx="1" fill="#4a90d9" opacity="0.5"/>
              <rect x="8" y="8" width="4" height="4" rx="1" fill="#4a90d9"/>
            </svg>
          </div>
          <span style={{
            fontSize: "15px", fontWeight: 500, color: "#f0f2f8",
            letterSpacing: "0.01em",
          }}>
            HireOn
          </span>
        </div>
      </div>

      {/* ── Nav label ── */}
      <p style={{
        fontSize: "10px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#333b50",
        fontFamily: "'DM Mono', monospace",
        padding: "0 0.5rem",
        margin: "0 0 8px 0",
      }}>
        Navigation
      </p>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {NAV_ITEMS.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <li key={path} style={{ marginBottom: "2px" }}>
                <Link
                  to={path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: active ? 500 : 400,
                    color: active ? "#4a90d9" : "#7a8299",
                    background: active ? "#1a2d4a" : "transparent",
                    border: `1px solid ${active ? "#2a3a5a" : "transparent"}`,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "#13161f";
                      e.currentTarget.style.color = "#c8ccd8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#7a8299";
                    }
                  }}
                >
                  {/* Active indicator dot */}
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: active ? "#4a90d9" : "#252c3f",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* ── Footer ── */}
      <button onClick={handleLogout} style={{
        marginTop: "10px",
        padding: "8px",
        background: "#2a0808",
        color: "#e24b4a",
        border: "1px solid #5a1010",
        borderRadius: "8px",
        cursor: "pointer"
        }}>
        Logout
      </button>
      <div style={{
        padding: "12px",
        background: "#13161f",
        border: "1px solid #1f2433",
        borderRadius: "10px",
      }}>
        <p style={{
          fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
          color: "#333b50", fontFamily: "'DM Mono', monospace", margin: "0 0 4px 0",
        }}>
          Version
        </p>
        <p style={{
          fontSize: "12px", color: "#555c70",
          fontFamily: "'DM Mono', monospace", margin: 0,
        }}>
          HireOn v1.0
        </p>
      </div>
    </div>
  );
}

export default Sidebar;