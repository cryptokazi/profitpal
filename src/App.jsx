import { useState, useEffect, useRef, useCallback } from "react";

const formatCurrency = (value) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  if (value >= 0.01) return `$${value.toFixed(2)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(10)}`;
};

const formatPrice = (value) => {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(10)}`;
};

const formatMultiplier = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(1);
};

const chainLabels = {
  solana: "SOL",
  ethereum: "ETH",
  bsc: "BSC",
  arbitrum: "ARB",
  base: "BASE",
  polygon: "MATIC",
  avalanche: "AVAX",
  optimism: "OP",
  fantom: "FTM",
};

const NumberInput = ({ label, value, onChange, prefix = "$", suffix = "", placeholder = "0", disabled = false }) => {
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
        background: disabled ? "#141414" : "#1A1A1A",
        border: "1px solid #2A2A2A",
        borderRadius: "10px",
        padding: "0 16px",
        height: "52px",
        transition: "border-color 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = "#F97316" }}
        onMouseLeave={e => { if (!disabled && document.activeElement !== inputRef.current) e.currentTarget.style.borderColor = "#2A2A2A" }}
      >
        {prefix && <span style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", marginRight: "4px" }}>{prefix}</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
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

const ComparableRow = ({ name, mc, positionSize, entryMC }) => {
  const multiplier = entryMC > 0 ? mc / entryMC : 0;
  const posValue = positionSize * multiplier;
  const profit = posValue - positionSize;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "8px",
      padding: "10px 0",
      borderBottom: "1px solid #1A1A1A",
      alignItems: "center",
      fontSize: "13px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div>
        <span style={{ color: "#F5F5F5", fontWeight: "500" }}>{name}</span>
        <span style={{ color: "#555", fontSize: "11px", marginLeft: "6px" }}>{formatCurrency(mc)}</span>
      </div>
      <span style={{ color: "#F5F5F5", fontWeight: "500", textAlign: "center" }}>{formatCurrency(posValue)}</span>
      <span style={{ color: "#22C55E", fontWeight: "500", textAlign: "right" }}>
        {formatMultiplier(multiplier)}x
      </span>
    </div>
  );
};

const PulsingDot = () => (
  <span style={{
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22C55E",
    marginRight: "8px",
    animation: "pulse 1.5s ease-in-out infinite",
  }} />
);

export default function ProfitPal() {
  const [positionSize, setPositionSize] = useState(1000);
  const [entryMC, setEntryMC] = useState(100000);
  const [targetMode, setTargetMode] = useState("mc");
  const [targetMC, setTargetMC] = useState(500000);
  const [targetPct, setTargetPct] = useState(500);
  const [showTable, setShowTable] = useState(false);
  const [showComparables, setShowComparables] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  // CA lookup state
  const [caInput, setCaInput] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [caLoading, setCaLoading] = useState(false);
  const [caError, setCaError] = useState("");
  const debounceRef = useRef(null);

  const generateShareImage = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const w = 1080;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, w, h);

    // Subtle gradient overlay
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(249,115,22,0.06)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Border accent
    ctx.strokeStyle = "#F97316";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Corner accents
    const cornerLen = 30;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#F97316";
    [[44, 44, 1, 1], [w - 44, 44, -1, 1], [44, h - 44, 1, -1], [w - 44, h - 44, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + cornerLen * dx, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + cornerLen * dy);
      ctx.stroke();
    });

    // Header - Powered by
    ctx.fillStyle = "#F97316";
    ctx.font = "600 16px 'Courier New', monospace";
    ctx.letterSpacing = "4px";
    ctx.textAlign = "center";
    ctx.fillText("POWERED BY CRYPTO GOATS", w / 2, 110);

    // Title
    ctx.fillStyle = "#F5F5F5";
    ctx.font = "bold 42px 'Courier New', monospace";
    ctx.fillText("POSITION CALCULATOR", w / 2, 165);

    // Divider line
    ctx.strokeStyle = "#2A2A2A";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 195);
    ctx.lineTo(w - 100, 195);
    ctx.stroke();

    // Token info if available
    let yOffset = 240;
    if (tokenData) {
      ctx.fillStyle = "#F97316";
      ctx.font = "bold 28px 'Courier New', monospace";
      ctx.fillText(`${tokenData.symbol}`, w / 2, yOffset);
      ctx.fillStyle = "#777";
      ctx.font = "500 16px 'Courier New', monospace";
      ctx.fillText(`${tokenData.name} · ${chainLabels[tokenData.chain] || tokenData.chain}`, w / 2, yOffset + 30);
      yOffset += 70;
    }

    // Entry details
    ctx.fillStyle = "#666";
    ctx.font = "600 14px 'Courier New', monospace";
    ctx.fillText("ENTRY", w / 2 - 200, yOffset);
    ctx.fillText("POSITION", w / 2, yOffset);
    ctx.fillText("TARGET", w / 2 + 200, yOffset);

    ctx.fillStyle = "#F5F5F5";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText(formatCurrency(entryMC) + " MC", w / 2 - 200, yOffset + 32);
    ctx.fillText(formatCurrency(positionSize), w / 2, yOffset + 32);
    const effTarget = targetMode === "mc" ? targetMC : entryMC * (1 + targetPct / 100);
    ctx.fillText(formatCurrency(effTarget) + " MC", w / 2 + 200, yOffset + 32);

    yOffset += 90;

    // Main result - big number
    const mult = targetMode === "mc" ? (entryMC > 0 ? targetMC / entryMC : 0) : (1 + targetPct / 100);
    const fv = positionSize * mult;
    const pr = fv - positionSize;
    const pg = (mult - 1) * 100;

    // Result background box
    ctx.fillStyle = "rgba(249,115,22,0.08)";
    ctx.beginPath();
    ctx.roundRect(80, yOffset, w - 160, 180, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(249,115,22,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(80, yOffset, w - 160, 180, 16);
    ctx.stroke();

    ctx.fillStyle = "#777";
    ctx.font = "600 14px 'Courier New', monospace";
    ctx.fillText("POSITION VALUE", w / 2, yOffset + 40);

    ctx.fillStyle = "#F97316";
    ctx.font = "bold 64px 'Courier New', monospace";
    ctx.fillText(formatCurrency(fv), w / 2, yOffset + 110);

    ctx.fillStyle = "#999";
    ctx.font = "500 20px 'Courier New', monospace";
    ctx.fillText(`${formatMultiplier(mult)}x from entry`, w / 2, yOffset + 150);

    yOffset += 220;

    // Profit and % gain boxes
    const boxW = (w - 200) / 2;

    // Profit box
    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath();
    ctx.roundRect(80, yOffset, boxW, 120, 12);
    ctx.fill();
    ctx.strokeStyle = "#2A2A2A";
    ctx.beginPath();
    ctx.roundRect(80, yOffset, boxW, 120, 12);
    ctx.stroke();

    ctx.fillStyle = "#777";
    ctx.font = "600 13px 'Courier New', monospace";
    ctx.fillText("PROFIT", 80 + boxW / 2, yOffset + 38);
    ctx.fillStyle = "#22C55E";
    ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillText(pr >= 0 ? `+${formatCurrency(pr)}` : `-${formatCurrency(Math.abs(pr))}`, 80 + boxW / 2, yOffset + 82);

    // % Gain box
    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath();
    ctx.roundRect(w / 2 + 20, yOffset, boxW, 120, 12);
    ctx.fill();
    ctx.strokeStyle = "#2A2A2A";
    ctx.beginPath();
    ctx.roundRect(w / 2 + 20, yOffset, boxW, 120, 12);
    ctx.stroke();

    ctx.fillStyle = "#777";
    ctx.font = "600 13px 'Courier New', monospace";
    ctx.fillText("% GAIN", w / 2 + 20 + boxW / 2, yOffset + 38);
    ctx.fillStyle = "#F5F5F5";
    ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillText(`${pg >= 0 ? "+" : ""}${pg.toFixed(0)}%`, w / 2 + 20 + boxW / 2, yOffset + 82);

    yOffset += 160;

    // Divider
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, yOffset);
    ctx.lineTo(w - 100, yOffset);
    ctx.stroke();

    yOffset += 40;

    // Footer branding
    ctx.fillStyle = "#F97316";
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillText("profitpal.app", w / 2, h - 100);

    ctx.fillStyle = "#444";
    ctx.font = "500 13px 'Courier New', monospace";
    ctx.fillText("For educational purposes only. Not financial advice.", w / 2, h - 70);

    return canvas;
  }, [positionSize, entryMC, targetMode, targetMC, targetPct, tokenData]);

  const handleShare = useCallback(async () => {
    setShareStatus("generating");
    try {
      const canvas = await generateShareImage();

      // Try native share (mobile)
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], "profitpal-position.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "My Position - ProfitPal",
                text: "Check out my position calculation on ProfitPal",
                files: [file],
              });
              setShareStatus("shared");
            } catch (e) {
              if (e.name !== "AbortError") {
                downloadImage(canvas);
                setShareStatus("downloaded");
              } else {
                setShareStatus("");
              }
            }
          } else {
            downloadImage(canvas);
            setShareStatus("downloaded");
          }
        }, "image/png");
      } else {
        // Try clipboard
        try {
          const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setShareStatus("copied");
        } catch {
          downloadImage(canvas);
          setShareStatus("downloaded");
        }
      }

      setTimeout(() => setShareStatus(""), 2500);
    } catch (err) {
      console.error("Share error:", err);
      setShareStatus("");
    }
  }, [generateShareImage]);

  const downloadImage = (canvas) => {
    const link = document.createElement("a");
    link.download = "profitpal-position.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    setAnimate(true);
  }, []);

  const fetchToken = useCallback(async (ca) => {
    if (!ca || ca.length < 20) {
      setTokenData(null);
      setCaError("");
      return;
    }

    setCaLoading(true);
    setCaError("");

    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (!data.pairs || data.pairs.length === 0) {
        setCaError("Token not found. Check the contract address.");
        setTokenData(null);
        setCaLoading(false);
        return;
      }

      // Sort by liquidity, pick the best pair
      const sorted = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      const best = sorted[0];

      const token = {
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

      setTokenData(token);
      if (token.marketCap > 0) setEntryMC(token.marketCap);
      setCaError("");
    } catch (err) {
      setCaError("Couldn't fetch token data. Try again.");
      setTokenData(null);
    }

    setCaLoading(false);
  }, []);

  const handleCaChange = (e) => {
    const val = e.target.value.trim();
    setCaInput(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchToken(val), 600);
  };

  const clearToken = () => {
    setCaInput("");
    setTokenData(null);
    setCaError("");
  };

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

  const comparables = [
    { name: "PEPE peak", mc: 7_000_000_000 },
    { name: "WIF peak", mc: 4_500_000_000 },
    { name: "BONK peak", mc: 2_000_000_000 },
    { name: "FLOKI", mc: 1_500_000_000 },
    { name: "MOG peak", mc: 800_000_000 },
    { name: "BRETT peak", mc: 500_000_000 },
    { name: "SPX6900", mc: 100_000_000 },
    { name: "Mid-tier", mc: 50_000_000 },
    { name: "Breakout", mc: 10_000_000 },
    { name: "Early gem", mc: 1_000_000 },
  ];

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

        {/* CA Lookup */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#F97316",
            marginBottom: "8px",
            fontFamily: "'JetBrains Mono', monospace"
          }}>Paste Contract Address</label>
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#1A1A1A",
            border: `1px solid ${caError ? "#EF4444" : tokenData ? "#22C55E" : "#2A2A2A"}`,
            borderRadius: "10px",
            padding: "0 12px",
            height: "52px",
            transition: "border-color 0.2s",
            gap: "8px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={caInput}
              onChange={handleCaChange}
              placeholder="0x... or token CA"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#F5F5F5",
                fontSize: "14px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: "400",
              }}
            />
            {caLoading && (
              <div style={{
                width: "18px",
                height: "18px",
                border: "2px solid #333",
                borderTopColor: "#F97316",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }} />
            )}
            {tokenData && !caLoading && (
              <button onClick={clearToken} style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "18px",
                padding: "0 4px",
                lineHeight: 1,
              }}>×</button>
            )}
          </div>
          {caError && (
            <p style={{
              fontSize: "11px",
              color: "#EF4444",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: "6px",
              marginBottom: 0,
            }}>{caError}</p>
          )}
        </div>

        {/* Token Info Card */}
        {tokenData && (
          <div style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(34,197,94,0.04) 100%)",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            animation: "fadeSlide 0.3s ease",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div>
                  <span style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#F5F5F5",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{tokenData.symbol}</span>
                  <span style={{
                    fontSize: "12px",
                    color: "#777",
                    marginLeft: "8px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{tokenData.name}</span>
                </div>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <PulsingDot />
                <span style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#22C55E",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>LIVE</span>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Price</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(tokenData.price)}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Market Cap</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(tokenData.marketCap)}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Chain</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#F5F5F5", fontFamily: "'JetBrains Mono', monospace" }}>{chainLabels[tokenData.chain] || tokenData.chain}</div>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Liquidity</div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(tokenData.liquidity)}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>24h Change</div>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: tokenData.priceChange24h >= 0 ? "#22C55E" : "#EF4444",
                  fontFamily: "'JetBrains Mono', monospace"
                }}>{tokenData.priceChange24h >= 0 ? "+" : ""}{tokenData.priceChange24h.toFixed(2)}%</div>
              </div>
            </div>

            {tokenData.url && (
              <a
                href={tokenData.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: "12px",
                  fontSize: "11px",
                  color: "#F97316",
                  fontFamily: "'JetBrains Mono', monospace",
                  textDecoration: "none",
                  opacity: 0.7,
                }}
              >
                View on DexScreener →
              </a>
            )}
          </div>
        )}

        {/* Position Size */}
        <NumberInput
          label="Position Size"
          value={positionSize}
          onChange={setPositionSize}
          placeholder="1000"
        />

        {/* Entry Market Cap */}
        <NumberInput
          label={tokenData ? `Entry Market Cap (live from ${tokenData.symbol})` : "Entry Market Cap"}
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

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={shareStatus === "generating"}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #F97316",
            background: shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded"
              ? "rgba(34,197,94,0.15)"
              : "rgba(249,115,22,0.08)",
            color: shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded"
              ? "#22C55E"
              : "#F97316",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: "600",
            cursor: shareStatus === "generating" ? "wait" : "pointer",
            transition: "all 0.2s",
            marginTop: "8px",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            borderColor: shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded"
              ? "#22C55E" : "#F97316",
          }}
          onMouseEnter={e => {
            if (!shareStatus) {
              e.currentTarget.style.background = "rgba(249,115,22,0.15)";
            }
          }}
          onMouseLeave={e => {
            if (!shareStatus) {
              e.currentTarget.style.background = "rgba(249,115,22,0.08)";
            }
          }}
        >
          {shareStatus === "generating" ? (
            <>
              <div style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(249,115,22,0.3)",
                borderTopColor: "#F97316",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }} />
              Generating...
            </>
          ) : shareStatus === "copied" ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Copied to Clipboard
            </>
          ) : shareStatus === "shared" ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Shared
            </>
          ) : shareStatus === "downloaded" ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Image Saved
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share Position
            </>
          )}
        </button>

        {/* Comparables Toggle */}
        <button
          onClick={() => setShowComparables(!showComparables)}
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
          <span>{showComparables ? "Hide" : "Show"} Comparable Tokens</span>
          <span style={{ transform: showComparables ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
        </button>

        {/* Comparables Table */}
        {showComparables && (
          <div style={{
            marginTop: "16px",
            background: "#111",
            borderRadius: "12px",
            border: "1px solid #1A1A1A",
            padding: "16px",
            animation: "fadeSlide 0.3s ease",
          }}>
            <p style={{
              fontSize: "11px",
              color: "#555",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 0,
              marginBottom: "12px",
            }}>Your bag if this token hit the same MC as...</p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
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
              <span>Token</span>
              <span style={{ textAlign: "center" }}>Value</span>
              <span style={{ textAlign: "right" }}>Multiple</span>
            </div>
            {comparables
              .filter(c => c.mc > entryMC)
              .map(c => (
                <ComparableRow
                  key={c.name}
                  name={c.name}
                  mc={c.mc}
                  positionSize={positionSize}
                  entryMC={entryMC}
                />
              ))
            }
          </div>
        )}

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
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          input::placeholder { color: #333; }
          * { box-sizing: border-box; }
        `}</style>
      </div>
    </div>
  );
}
