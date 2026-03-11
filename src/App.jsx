import { useState, useEffect, useRef } from "react";

const formatCurrency = (value) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatMultiplier = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(1);
};

const GoatIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3L3 7" />
    <path d="M19 3L21 7" />
    <ellipse cx="12" cy="13" rx="8" ry="8" />
    <circle cx="9" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <path d="M10 15.5Q12 17.5 14 15.5" />
    <path d="M8 8Q6 5 5 6" />
    <path d="M16 8Q18 5 19 6" />
  </svg>
);

const NumberInput = ({ label, value, onChange, prefix = "$", suffix = "", placeholder = "0" }) => {
  const [displayValue, setDisplayValue] = useState(value ? value.toString() : "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(value ? value.toString() : "");
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplayValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
    else if (raw === "") onChange(0);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: "#F97316",
        marginBottom: "8px",
        fontFamily: "'JetBrains Mono', monospace"
      }}>{label}</label>
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "#1A1A1A",
        border: "1px solid #2A2A2A",
        borderRadius: "10px",
        padding: "0 16px",
        height: "52px",
        transition: "border-color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#F97316"}
        onMouseLeave={e => { if (document.activeElement !== inputRef.current) e.currentTarget.style.borderColor = "#2A2A2A" }}
      >
        {prefix && <span style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", marginRight: "4px" }}>{prefix}</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#F5F5F5",
            fontSize: "18px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: "500",
          }}
          onFocus={e => e.currentTarget.parentElement.style.borderColor = "#F97316"}
          onBlur={e => e.currentTarget.parentElement.style.borderColor = "#2A2A2A"}
        />
        {suffix && <span style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", marginLeft: "4px" }}>{suffix}</span>}
      </div>
    </div>
  );
};

const TogglePill = ({ options, value, onChange }) => (
  <div style={{
    display: "flex",
    background: "#1A1A1A",
    borderRadius: "8px",
    padding: "3px",
    marginBottom: "16px",
    border: "1px solid #2A2A2A",
  }}>
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "600",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          transition: "all 0.2s ease",
          background: value === opt.value ? "#F97316" : "transparent",
          color: value === opt.value ? "#000" : "#666",
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const QuickChip = ({ label, onClick, active }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 14px",
      borderRadius: "20px",
      border: active ? "1px solid #F97316" : "1px solid #2A2A2A",
      background: active ? "rgba(249,115,22,0.1)" : "transparent",
      color: active ? "#F97316" : "#777",
      fontSize: "12px",
      fontFamily: "'JetBrains Mono', monospace",
      cursor: "pointer",
      transition: "all 0.15s ease",
      fontWeight: "500",
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.borderColor = "#555";
        e.currentTarget.style.color = "#aaa";
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.borderColor = "#2A2A2A";
        e.currentTarget.style.color = "#777";
      }
    }}
  >
    {label}
  </button>
);

const ResultCard = ({ label, value, highlight = false, sub = null }) => (
  <div style={{
    background: highlight ? "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 100%)" : "#1A1A1A",
    border: highlight ? "1px solid rgba(249,115,22,0.3)" : "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
  }}>
    <div style={{
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#777",
      marginBottom: "8px",
      fontFamily: "'JetBrains Mono', monospace"
    }}>{label}</div>
    <div style={{
      fontSize: highlight ? "32px" : "24px",
      fontWeight: "700",
      color: highlight ? "#F97316" : "#F5F5F5",
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: 1.2,
    }}>{value}</div>
    {sub && <div style={{
      fontSize: "13px",
      color: "#666",
      marginTop: "6px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>{sub}</div>}
  </div>
);

const TakeProfitRow = ({ pct, entry, positionSize }) => {
  const multiplier = pct / 100;
  const targetMC = entry * (1 + multiplier);
  const posValue = positionSize * (1 + multiplier);
  const profit = posValue - positionSize;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 1fr 1fr",
      gap: "8px",
      padding: "10px 0",
      borderBottom: "1px solid #1A1A1A",
      alignItems: "center",
      fontSize: "13px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ color: "#F97316", fontWeight: "600" }}>{pct >= 1000 ? `${pct / 1000}K` : pct}%</span>
      <span style={{ color: "#999" }}>{formatCurrency(targetMC)}</span>
      <span style={{ color: "#F5F5F5", fontWeight: "500" }}>{formatCurrency(posValue)}</span>
      <span style={{ color: "#22C55E", fontWeight: "500" }}>+{formatCurrency(profit)}</span>
    </div>
  );
};

export default function CryptoGoatsCalculator() {
  const [positionSize, setPositionSize] = useState(1000);
  const [entryMC, setEntryMC] = useState(100000);
  const [targetMode, setTargetMode] = useState("mc");
  const [targetMC, setTargetMC] = useState(500000);
  const [targetPct, setTargetPct] = useState(500);
  const [showTable, setShowTable] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const multiplier = targetMode === "mc"
    ? (entryMC > 0 ? targetMC / entryMC : 0)
    : (1 + targetPct / 100);

  const finalValue = positionSize * multiplier;
  const profit = finalValue - positionSize;
  const pctGain = ((multiplier - 1) * 100);
  const effectiveTargetMC = targetMode === "mc" ? targetMC : entryMC * (1 + targetPct / 100);

  const quickMCs = [
    { label: "500K", value: 500000 },
    { label: "1M", value: 1000000 },
    { label: "5M", value: 5000000 },
    { label: "10M", value: 10000000 },
    { label: "50M", value: 50000000 },
    { label: "100M", value: 100000000 },
  ];

  const quickPcts = [
    { label: "100%", value: 100 },
    { label: "500%", value: 500 },
    { label: "1000%", value: 1000 },
    { label: "5000%", value: 5000 },
    { label: "10000%", value: 10000 },
  ];

  const tpLevels = [100, 200, 500, 1000, 2500, 5000, 10000];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#F5F5F5",
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: "flex",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        width: "100%",
        maxWidth: "480px",
        opacity: animate ? 1 : 0,
        transform: animate ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            color: "#F97316",
            marginBottom: "8px",
          }}>
            <span style={{
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
            }}>Powered By Crypto Goats</span>
          </div>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "700",
            margin: "8px 0 4px",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.5px",
            color: "#F5F5F5",
          }}>Position Calculator</h1>
          <p style={{
            fontSize: "13px",
            color: "#666",
            fontFamily: "'JetBrains Mono', monospace",
            margin: 0,
          }}>Know your numbers before you ape.</p>
        </div>

        {/* Position Size */}
        <NumberInput
          label="Position Size"
          value={positionSize}
          onChange={setPositionSize}
          placeholder="1000"
        />

        {/* Entry Market Cap */}
        <NumberInput
          label="Entry Market Cap"
          value={entryMC}
          onChange={setEntryMC}
          placeholder="100000"
        />

        {/* Target Mode Toggle */}
        <div style={{ marginTop: "8px" }}>
          <label style={{
            display: "block",
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#F97316",
            marginBottom: "8px",
            fontFamily: "'JetBrains Mono', monospace"
          }}>Calculate Target By</label>
          <TogglePill
            options={[
              { label: "Market Cap", value: "mc" },
              { label: "% Gain", value: "pct" },
            ]}
            value={targetMode}
            onChange={setTargetMode}
          />
        </div>

        {/* Target Input */}
        {targetMode === "mc" ? (
          <>
            <NumberInput
              label="Target Market Cap"
              value={targetMC}
              onChange={setTargetMC}
              placeholder="500000"
            />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", marginTop: "-8px" }}>
              {quickMCs.map((q) => (
                <QuickChip
                  key={q.value}
                  label={q.label}
                  onClick={() => setTargetMC(q.value)}
                  active={targetMC === q.value}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <NumberInput
              label="Target % Gain"
              value={targetPct}
              onChange={setTargetPct}
              prefix=""
              suffix="%"
              placeholder="500"
            />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", marginTop: "-8px" }}>
              {quickPcts.map((q) => (
                <QuickChip
                  key={q.value}
                  label={q.label}
                  onClick={() => setTargetPct(q.value)}
                  active={targetPct === q.value}
                />
              ))}
            </div>
          </>
        )}

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, #2A2A2A, transparent)",
          margin: "8px 0 24px",
        }} />

        {/* Results */}
        <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
          <ResultCard
            label="Position Value"
            value={formatCurrency(finalValue)}
            highlight={true}
            sub={`${formatMultiplier(multiplier)}x from entry`}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ResultCard
              label="Profit"
              value={profit >= 0 ? `+${formatCurrency(profit)}` : `-${formatCurrency(Math.abs(profit))}`}
            />
            <ResultCard
              label="% Gain"
              value={`${pctGain >= 0 ? "+" : ""}${pctGain.toFixed(0)}%`}
            />
          </div>
          {targetMode === "pct" && (
            <ResultCard
              label="Target Market Cap"
              value={formatCurrency(effectiveTargetMC)}
            />
          )}
        </div>

        {/* TP Table Toggle */}
        <button
          onClick={() => setShowTable(!showTable)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #2A2A2A",
            background: "transparent",
            color: "#999",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#F97316";
            e.currentTarget.style.color = "#F97316";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#2A2A2A";
            e.currentTarget.style.color = "#999";
          }}
        >
          <span>{showTable ? "Hide" : "Show"} Take-Profit Levels</span>
          <span style={{ transform: showTable ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
        </button>

        {/* TP Table */}
        {showTable && (
          <div style={{
            marginTop: "16px",
            background: "#111",
            borderRadius: "12px",
            border: "1px solid #1A1A1A",
            padding: "16px",
            animation: "fadeSlide 0.3s ease",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 1fr 1fr",
              gap: "8px",
              padding: "0 0 10px",
              borderBottom: "1px solid #2A2A2A",
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#555",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>Gain</span>
              <span>MC at</span>
              <span>Value</span>
              <span>Profit</span>
            </div>
            {tpLevels.map(pct => (
              <TakeProfitRow key={pct} pct={pct} entry={entryMC} positionSize={positionSize} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid #1A1A1A",
        }}>
          <a
            href="https://upgrade.chat/crypto-goats"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "16px",
              borderRadius: "10px",
              border: "none",
              background: "#F97316",
              color: "#000",
              fontSize: "14px",
              fontWeight: "700",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1px",
              textTransform: "uppercase",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "20px",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#FB923C";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#F97316";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Join Crypto Goats
          </a>
          <p style={{
            fontSize: "11px",
            color: "#444",
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.6,
            margin: 0,
          }}>
            For educational purposes only. Not financial advice.
            <br />Built by Crypto Goats.
          </p>
        </div>

        <style>{`
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          input::placeholder { color: #333; }
          * { box-sizing: border-box; }
        `}</style>
      </div>
    </div>
  );
}
