import { useState, useEffect, useRef } from "react";

export const formatCurrency = (value) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  if (value >= 0.01) return `$${value.toFixed(2)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(10)}`;
};

export const formatPrice = (value) => {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(10)}`;
};

export const formatMultiplier = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(1);
};

export const chainLabels = {
  solana: "SOL", ethereum: "ETH", bsc: "BSC", arbitrum: "ARB",
  base: "BASE", polygon: "MATIC", avalanche: "AVAX", optimism: "OP", fantom: "FTM",
};

export const MONO = "'JetBrains Mono', monospace";
export const SANS = "'Inter', -apple-system, sans-serif";

export const fetchTokenData = async (ca) => {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  if (!data.pairs || data.pairs.length === 0) throw new Error("Token not found");
  const sorted = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
  const best = sorted[0];
  return {
    name: best.baseToken?.name || "Unknown",
    symbol: best.baseToken?.symbol || "???",
    price: parseFloat(best.priceUsd) || 0,
    marketCap: best.marketCap || best.fdv || 0,
    liquidity: best.liquidity?.usd || 0,
    chain: best.chainId || "unknown",
    volume24h: best.volume?.h24 || 0,
    priceChange24h: best.priceChange?.h24 || 0,
    url: best.url || "",
  };
};

export const NumberInput = ({ label, value, onChange, prefix = "$", suffix = "", placeholder = "0", disabled = false, small = false }) => {
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
    <div style={{ marginBottom: small ? "10px" : "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "600",
        letterSpacing: "1.5px", textTransform: "uppercase",
        color: "#F97316", marginBottom: "8px", fontFamily: MONO,
      }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", background: disabled ? "#141414" : "#1A1A1A",
        border: "1px solid #2A2A2A", borderRadius: "10px", padding: "0 16px",
        height: small ? "44px" : "52px", transition: "border-color 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = "#F97316" }}
        onMouseLeave={e => { if (!disabled && document.activeElement !== inputRef.current) e.currentTarget.style.borderColor = "#2A2A2A" }}
      >
        {prefix && <span style={{ color: "#666", fontFamily: MONO, fontSize: "15px", marginRight: "4px" }}>{prefix}</span>}
        <input ref={inputRef} type="text" inputMode="decimal" value={displayValue}
          onChange={handleChange} placeholder={placeholder} disabled={disabled}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#F5F5F5", fontSize: small ? "15px" : "18px", fontFamily: MONO, fontWeight: "500",
          }}
          onFocus={e => e.currentTarget.parentElement.style.borderColor = "#F97316"}
          onBlur={e => e.currentTarget.parentElement.style.borderColor = "#2A2A2A"}
        />
        {suffix && <span style={{ color: "#666", fontFamily: MONO, fontSize: "13px", marginLeft: "4px" }}>{suffix}</span>}
      </div>
    </div>
  );
};

export const ResultCard = ({ label, value, highlight = false, sub = null }) => (
  <div style={{
    background: highlight ? "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 100%)" : "#1A1A1A",
    border: highlight ? "1px solid rgba(249,115,22,0.3)" : "1px solid #2A2A2A",
    borderRadius: "12px", padding: "20px", textAlign: "center",
  }}>
    <div style={{
      fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px",
      textTransform: "uppercase", color: "#777", marginBottom: "8px", fontFamily: MONO,
    }}>{label}</div>
    <div style={{
      fontSize: highlight ? "32px" : "24px", fontWeight: "700",
      color: highlight ? "#F97316" : "#F5F5F5", fontFamily: MONO, lineHeight: 1.2,
    }}>{value}</div>
    {sub && <div style={{ fontSize: "13px", color: "#666", marginTop: "6px", fontFamily: MONO }}>{sub}</div>}
  </div>
);

export const PulsingDot = () => (
  <span style={{
    display: "inline-block", width: "8px", height: "8px", borderRadius: "50%",
    background: "#22C55E", marginRight: "8px", animation: "pulse 1.5s ease-in-out infinite",
  }} />
);
