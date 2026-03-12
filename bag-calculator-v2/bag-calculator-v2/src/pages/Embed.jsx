import { useState } from "react";
import {
  formatCurrency,
  formatMultiplier,
  NumberInput,
  ResultCard,
  MONO,
  SANS,
} from "../components/shared.jsx";

const TogglePill = ({ options, value, onChange }) => (
  <div style={{
    display: "flex", background: "#1A1A1A", borderRadius: "8px",
    padding: "3px", marginBottom: "12px", border: "1px solid #2A2A2A",
  }}>
    {options.map((opt) => (
      <button key={opt.value} onClick={() => onChange(opt.value)} style={{
        flex: 1, padding: "8px 10px", borderRadius: "6px", border: "none",
        cursor: "pointer", fontSize: "11px", fontWeight: "600", fontFamily: MONO,
        letterSpacing: "0.5px", textTransform: "uppercase", transition: "all 0.2s ease",
        background: value === opt.value ? "#F97316" : "transparent",
        color: value === opt.value ? "#000" : "#666",
      }}>{opt.label}</button>
    ))}
  </div>
);

export default function Embed() {
  const [positionSize, setPositionSize] = useState(1000);
  const [entryMC, setEntryMC] = useState(100000);
  const [targetMode, setTargetMode] = useState("mc");
  const [targetMC, setTargetMC] = useState(500000);
  const [targetPct, setTargetPct] = useState(500);

  const multiplier = targetMode === "mc" ? (entryMC > 0 ? targetMC / entryMC : 0) : (1 + targetPct / 100);
  const finalValue = positionSize * multiplier;
  const profit = finalValue - positionSize;
  const pctGain = (multiplier - 1) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#F5F5F5",
      fontFamily: SANS,
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: "360px" }}>
        {/* Compact header */}
        <p style={{ fontSize: "10px", color: "#F97316", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontFamily: MONO, marginBottom: "4px" }}>
          Profit calculator
        </p>

        <NumberInput label="Position size" value={positionSize} onChange={setPositionSize} placeholder="1000" small />
        <NumberInput label="Entry MC" value={entryMC} onChange={setEntryMC} placeholder="100000" small />

        <label style={{ display: "block", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#F97316", marginBottom: "6px", fontFamily: MONO }}>Target by</label>
        <TogglePill options={[{ label: "Market cap", value: "mc" }, { label: "% gain", value: "pct" }]} value={targetMode} onChange={setTargetMode} />

        {targetMode === "mc" ? (
          <NumberInput label="Target MC" value={targetMC} onChange={setTargetMC} placeholder="500000" small />
        ) : (
          <NumberInput label="Target % gain" value={targetPct} onChange={setTargetPct} prefix="" suffix="%" placeholder="500" small />
        )}

        {/* Result */}
        <div style={{ marginTop: "12px", marginBottom: "16px", display: "grid", gap: "8px" }}>
          <ResultCard label="Position value" value={formatCurrency(finalValue)} highlight sub={`${formatMultiplier(multiplier)}x`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <ResultCard label="Profit" value={profit >= 0 ? `+${formatCurrency(profit)}` : `-${formatCurrency(Math.abs(profit))}`} />
            <ResultCard label="% gain" value={`${pctGain >= 0 ? "+" : ""}${pctGain.toFixed(0)}%`} />
          </div>
        </div>

        {/* Powered by — always visible */}
        <a
          href="https://upgrade.chat/crypto-goats"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #2A2A2A",
            background: "rgba(249,115,22,0.06)",
            color: "#F97316",
            fontSize: "11px",
            fontWeight: "700",
            fontFamily: MONO,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#F97316";
            e.currentTarget.style.background = "rgba(249,115,22,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2A2A2A";
            e.currentTarget.style.background = "rgba(249,115,22,0.06)";
          }}
        >
          Powered by Crypto Goats
        </a>
        <p style={{ textAlign: "center", marginTop: "8px" }}>
          <a href="#/" style={{ fontSize: "11px", color: "#555", fontFamily: MONO, textDecoration: "none" }}>Open full calculator →</a>
        </p>
      </div>
    </div>
  );
}
