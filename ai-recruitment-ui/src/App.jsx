import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Ranking from "./pages/Ranking";
import CandidateDetails from "./pages/CandidateDetails";
import DariInsights from "./pages/DariInsights";

import Login from "./pages/Login";      // ✅ ADD
import Signup from "./pages/Signup";    // ✅ ADD

function App() {
  const user = localStorage.getItem("user_id");   // ✅ HERE
  if (!user && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
  window.location.href = "/login";
  }
  
  return (
    <div style={{ display: "flex", background: "#020617", minHeight: "100vh" }}>
  
      {user && <Sidebar />}   {/* ✅ HERE */}

      <div style={{ flex: 1, padding: "20px", color: "white" }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="/" element={user ? <Upload /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/ranking" element={user ? <Ranking /> : <Navigate to="/login" />} />
          <Route path="/candidate/:id" element={user ? <CandidateDetails /> : <Navigate to="/login" />} />
          <Route path="/dari" element={user ? <DariInsights /> : <Navigate to="/login" />} />
        </Routes>      
      </div>

    </div>
  );
}

export default App;