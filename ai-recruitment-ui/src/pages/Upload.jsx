import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useEffect } from "react";   // ✅ add at top if not already

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  idle:     { bg: "#151a2a", border: "#2a3a5a", accent: "#4a90d9", dotColor: "#4a90d9", textColor: "#a8c4e8" },
  uploading:{ bg: "#151a2a", border: "#2a3a5a", accent: "#4a90d9", dotColor: "#4a90d9", textColor: "#a8c4e8" },
  processing:{ bg:"#1a1a0a", border: "#3a3010", accent: "#ef9f27", dotColor: "#ef9f27", textColor: "#e8c87a" },
  done:     { bg: "#0d2a1e", border: "#1d5038", accent: "#1d9e75", dotColor: "#1d9e75", textColor: "#a0d4b8" },
  error:    { bg: "#2a0808", border: "#5a1010", accent: "#e24b4a", dotColor: "#e24b4a", textColor: "#e8a0a0" },
};

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
    marginBottom: "4px",
    margin: "0 0 4px 0",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 500,
    color: "#f0f2f8",
    margin: "0 0 4px 0",
  },
  subtext: {
    fontSize: "13px",
    color: "#555c70",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 2rem 0",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "2rem",
  },
  stepSep: {
    flex: 1,
    height: "1px",
    background: "#1f2433",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  fileList: {
    background: "#0d2a1e",
    border: "1px solid #1d5038",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "16px",
  },
  fileListTitle: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#1d9e75",
    fontFamily: "'DM Mono', monospace",
    margin: "0 0 8px 0",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 0",
    borderBottom: "1px solid #1a3a28",
    fontSize: "13px",
    color: "#a0d4b8",
  },
  fileDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#1d9e75",
    flexShrink: 0,
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ number, label, state }) {
  const numStyle = {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 500,
    flexShrink: 0,
    ...(state === "done"
      ? { background: "#0d2a1e", border: "1px solid #1d5038", color: "#1d9e75" }
      : state === "active"
      ? { background: "#1a2d4a", border: "1px solid #2a3a5a", color: "#4a90d9" }
      : { background: "transparent", border: "1px solid #252c3f", color: "#555c70" }),
  };
  const labelStyle = {
    fontSize: "12px",
    fontFamily: "'DM Mono', monospace",
    color: state === "done" ? "#1d9e75" : state === "active" ? "#4a90d9" : "#555c70",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={numStyle}>{number}</span>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

function DropZone({ type, file, files, onFileChange, onFilesChange, hasFile }) {
  const inputRef = useRef();
  const isJD = type === "jd";

  const zoneStyle = {
    background: "#13161f",
    border: `1.5px dashed ${hasFile ? "#1d9e75" : "#252c3f"}`,
    borderStyle: hasFile ? "solid" : "dashed",
    borderRadius: "14px",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    cursor: "pointer",
    transition: "border-color 0.2s",
  };

  const iconBg = isJD ? "#1a2d4a" : "#0d2a1e";
  const iconColor = isJD ? "#4a90d9" : "#1d9e75";

  return (
    <div
      style={zoneStyle}
      onClick={() => inputRef.current.click()}
      onMouseEnter={(e) => {
        if (!hasFile) e.currentTarget.style.borderColor = "#4a90d9";
      }}
      onMouseLeave={(e) => {
        if (!hasFile) e.currentTarget.style.borderColor = "#252c3f";
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (isJD) onFileChange(e.dataTransfer.files[0]);
        else onFilesChange([...e.dataTransfer.files]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={!isJD}
        accept=".pdf,.docx,.txt"
        style={{ display: "none" }}
        onChange={(e) => {
          if (isJD) onFileChange(e.target.files[0]);
          else onFilesChange([...e.target.files]);
        }}
      />

      {/* Icon */}
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: iconBg, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        {isJD ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="2" width="12" height="16" rx="2" stroke={iconColor} strokeWidth="1.5"/>
            <path d="M7 7h6M7 10h6M7 13h4" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="10" height="13" rx="2" stroke={iconColor} strokeWidth="1.5"/>
            <rect x="7" y="2" width="10" height="13" rx="2" stroke={iconColor} strokeWidth="1.2" strokeDasharray="2 1"/>
            <path d="M6 8h4M6 11h3" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      {/* Label */}
      <p style={{ fontSize: "14px", fontWeight: 500, color: "#c8ccd8", margin: 0, textAlign: "center" }}>
        {isJD ? "Job Description" : "Resumes"}
      </p>

      {/* File info or hint */}
      {isJD && file ? (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "13px", color: "#a8c4e8",
          fontFamily: "'DM Mono', monospace",
          background: "#1a2d4a", padding: "6px 12px",
          borderRadius: "8px", border: "1px solid #2a3a5a",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4a90d9", flexShrink: 0 }} />
          {file.name}
        </div>
      ) : !isJD && files.length > 0 ? (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "12px", color: "#a0d4b8",
          fontFamily: "'DM Mono', monospace",
          background: "#0d2a1e", padding: "5px 12px",
          borderRadius: "8px", border: "1px solid #1d5038",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1d9e75" }} />
          {files.length} file{files.length > 1 ? "s" : ""} selected
        </div>
      ) : (
        <p style={{
          fontSize: "11px", color: "#555c70",
          fontFamily: "'DM Mono', monospace",
          textAlign: "center", margin: 0,
        }}>
          {isJD ? "Drop file here or click to browse" : "Drop multiple PDFs here\nor click to browse"}
        </p>
      )}

      {/* Accept label */}
      <span style={{
        fontSize: "11px", color: "#555c70",
        fontFamily: "'DM Mono', monospace",
        background: "#1a1f2e", padding: "3px 10px",
        borderRadius: "20px", border: "1px solid #252c3f",
      }}>
        {isJD ? ".pdf · .docx · .txt" : ".pdf · .docx · multiple allowed"}
      </span>
    </div>
  );
}

function StatusBanner({ statusKey, message }) {
  const s = STATUS_STYLES[statusKey] || STATUS_STYLES.idle;
  if (!message) return null;
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderLeft: `3px solid ${s.accent}`,
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}>
      <div style={{
        width: "7px", height: "7px",
        borderRadius: "50%",
        background: s.dotColor,
        flexShrink: 0,
      }} />
      <span style={{ fontSize: "13px", color: s.textColor }}>{message}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function Upload() {
  const [jd, setJd] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusKey, setStatusKey] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("Upload files and click Process to begin");

  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("user_id");

    if (!user) {
      navigate("/login");
    }
  }, []);

  // Derive step states
  const filesReady = jd && resumes.length > 0;
  const step1State = filesReady ? "done" : "active";
  const step2State = loading ? "active" : filesReady && statusKey === "idle" ? "active" : "idle";
  const step3State = statusKey === "done" ? "active" : "idle";

  const handleUpload = async () => {
    if (!jd || resumes.length === 0) {
      setStatusKey("error");
      setStatusMsg("Please upload a job description and at least one resume");
      return;
    }

    const formData = new FormData();
    formData.append("jd", jd);
    resumes.forEach((file) => formData.append("resumes", file));

    try {
      setLoading(true);
      setStatusKey("uploading");
      setStatusMsg("Uploading files…");

      await API.post("/upload", formData);

      setStatusKey("processing");
      setStatusMsg("Running ranking pipeline — this may take a moment…");
      await API.post("/process");

      setStatusKey("done");
      setStatusMsg("Processing complete! Redirecting to dashboard…");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setStatusKey("error");
      setStatusMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <p style={S.eyebrow}>HireOn · Upload</p>
      <h1 style={S.heading}>Upload Candidates</h1>
      <p style={S.subtext}>Upload a job description and candidate resumes to begin processing</p>

      {/* ── Steps ── */}
      <div style={S.stepRow}>
        <StepIndicator number="1" label="Upload files" state={step1State} />
        <div style={S.stepSep} />
        <StepIndicator number="2" label="Process pipeline" state={step2State} />
        <div style={S.stepSep} />
        <StepIndicator number="3" label="View dashboard" state={step3State} />
      </div>

      {/* ── Drop zones ── */}
      <div style={S.grid}>
        <DropZone
          type="jd"
          file={jd}
          hasFile={!!jd}
          onFileChange={setJd}
        />
        <DropZone
          type="resumes"
          files={resumes}
          hasFile={resumes.length > 0}
          onFilesChange={setResumes}
        />
      </div>

      {/* ── Resume file list ── */}
      {resumes.length > 0 && (
        <div style={S.fileList}>
          <p style={S.fileListTitle}>{resumes.length} resume{resumes.length > 1 ? "s" : ""} selected</p>
          {resumes.map((file, i) => (
            <div
              key={i}
              style={{
                ...S.fileItem,
                ...(i === resumes.length - 1 ? { borderBottom: "none" } : {}),
              }}
            >
              <span style={S.fileDot} />
              {file.name}
            </div>
          ))}
        </div>
      )}

      {/* ── Status banner ── */}
      <StatusBanner statusKey={statusKey} message={statusMsg} />

      {/* ── CTA button ── */}
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 28px",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          background: loading ? "#1f2433" : "#4a90d9",
          color: loading ? "#555c70" : "#fff",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = "#3a80c9";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.background = "#4a90d9";
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: "16px", height: "16px",
              border: "2px solid #33333355",
              borderTopColor: "#888",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              flexShrink: 0,
            }} />
            Processing…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.5"/>
              <path d="M6 8l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Process Candidates
          </>
        )}
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default Upload;