import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// ── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0d0f14",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  card: {
    background: "#13161f",
    border: "1px solid #1f2433",
    borderRadius: "18px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "400px",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  logoIcon: {
    width: "32px", height: "32px",
    borderRadius: "9px",
    background: "#1a2d4a",
    border: "1px solid #2a3a5a",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoName: {
    fontSize: "17px", fontWeight: 500, color: "#f0f2f8",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#4a90d9",
    fontFamily: "'DM Mono', monospace",
    textAlign: "center",
    margin: "0 0 6px 0",
  },
  title: {
    fontSize: "22px", fontWeight: 500, color: "#f0f2f8",
    textAlign: "center", margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "13px", color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    textAlign: "center", margin: "0 0 2rem 0",
  },
  fieldLabel: {
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 6px 0",
  },
  input: {
    width: "100%",
    background: "#0d0f14",
    border: "1px solid #1f2433",
    borderRadius: "9px",
    padding: "11px 14px",
    fontSize: "14px",
    color: "#e8eaf0",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "#4a90d9",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    border: "none",
    cursor: "pointer",
    marginTop: "14px",
  },
  divider: {
    display: "flex", alignItems: "center", gap: "12px",
    margin: "1.25rem 0",
  },
  divLine: { flex: 1, height: "1px", background: "#1f2433" },
  divTxt: {
    fontSize: "11px", color: "#333b50",
    fontFamily: "'DM Mono', monospace",
  },
  switchRow: {
    textAlign: "center", fontSize: "13px", color: "#555c70",
  },
  alert: (type) => ({
    fontSize: "12px",
    color: type === "error" ? "#e24b4a" : "#1d9e75",
    fontFamily: "'DM Mono', monospace",
    marginTop: "10px",
    padding: "10px 14px",
    background: type === "error" ? "#2a0808" : "#0d2a1e",
    border: `1px solid ${type === "error" ? "#5a1010" : "#1d5038"}`,
    borderRadius: "8px",
  }),
};

// ── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null); // { type: "error"|"success", msg }
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }
    try {
      setLoading(true);
      setStatus(null);
      const res = await axios.post("http://127.0.0.1:8000/auth/login", form);
      localStorage.setItem("user_id", res.data.user_id);
      setStatus({ type: "success", msg: "Login successful! Redirecting…" });
      setTimeout(() => {
      window.location.href = "/";   // ✅ forces reload
    }, 1200);
    } catch {
      setStatus({ type: "error", msg: "Invalid email or password." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="4" height="4" rx="1" fill="#4a90d9"/>
              <rect x="8" y="2" width="4" height="4" rx="1" fill="#4a90d9" opacity="0.5"/>
              <rect x="2" y="8" width="4" height="4" rx="1" fill="#4a90d9" opacity="0.5"/>
              <rect x="8" y="8" width="4" height="4" rx="1" fill="#4a90d9"/>
            </svg>
          </div>
          <span style={S.logoName}>HireOn</span>
        </div>

        <p style={S.eyebrow}>Welcome back</p>
        <h2 style={S.title}>Sign in to HireOn</h2>
        <p style={S.subtitle}>Enter your credentials to continue</p>

        {/* Email */}
        <div style={{ marginBottom: "14px" }}>
          <p style={S.fieldLabel}>Email</p>
          <input
            style={S.input}
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKeyDown}
            onFocus={(e) => (e.target.style.borderColor = "#2a3a5a")}
            onBlur={(e) => (e.target.style.borderColor = "#1f2433")}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "6px" }}>
          <p style={S.fieldLabel}>Password</p>
          <input
            style={S.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
            onFocus={(e) => (e.target.style.borderColor = "#2a3a5a")}
            onBlur={(e) => (e.target.style.borderColor = "#1f2433")}
          />
        </div>

        {/* Status */}
        {status && <p style={S.alert(status.type)}>{status.msg}</p>}

        {/* Submit */}
        <button
          style={{
            ...S.btnPrimary,
            background: loading ? "#1f2433" : "#4a90d9",
            color: loading ? "#555c70" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleLogin}
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#3a80c9"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#4a90d9"; }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={S.divider}>
          <div style={S.divLine} />
          <span style={S.divTxt}>or</span>
          <div style={S.divLine} />
        </div>

        <p style={S.switchRow}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: "#4a90d9", textDecoration: "underline", textUnderlineOffset: "2px" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}