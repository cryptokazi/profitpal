import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Calculator from "./pages/Calculator.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Embed from "./pages/Embed.jsx";
import { MONO, SANS } from "./components/shared.jsx";

export default function App() {
  const location = useLocation();
  const isEmbed = location.pathname === "/embed";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#F5F5F5",
      fontFamily: SANS,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Nav — hidden on embed page */}
      {!isEmbed && <nav style={{
        display: "flex",
        justifyContent: "center",
        gap: "4px",
        padding: "16px 16px 0",
        maxWidth: "480px",
        margin: "0 auto",
      }}>
        <NavLink to="/" style={({ isActive }) => ({
          flex: 1,
          padding: "12px",
          borderRadius: "8px 8px 0 0",
          border: "none",
          background: isActive ? "#1A1A1A" : "transparent",
          color: isActive ? "#F97316" : "#555",
          fontSize: "12px",
          fontWeight: "600",
          fontFamily: MONO,
          letterSpacing: "1px",
          textTransform: "uppercase",
          textDecoration: "none",
          textAlign: "center",
          transition: "all 0.2s",
          borderBottom: isActive ? "2px solid #F97316" : "2px solid transparent",
        })}>
          Calculator
        </NavLink>
        <NavLink to="/portfolio" style={({ isActive }) => ({
          flex: 1,
          padding: "12px",
          borderRadius: "8px 8px 0 0",
          border: "none",
          background: isActive ? "#1A1A1A" : "transparent",
          color: isActive ? "#F97316" : "#555",
          fontSize: "12px",
          fontWeight: "600",
          fontFamily: MONO,
          letterSpacing: "1px",
          textTransform: "uppercase",
          textDecoration: "none",
          textAlign: "center",
          transition: "all 0.2s",
          borderBottom: isActive ? "2px solid #F97316" : "2px solid transparent",
        })}>
          Portfolio
        </NavLink>
      </nav>}

      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/embed" element={<Embed />} />
      </Routes>

      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        input::placeholder { color: #333; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
