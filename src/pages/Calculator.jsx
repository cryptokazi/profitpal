import { useState, useEffect, useRef, useCallback } from "react";
import {
  formatCurrency, formatPrice, formatMultiplier, chainLabels,
  fetchTokenData, NumberInput, ResultCard, PulsingDot, MONO, SANS,
} from "../components/shared.jsx";

const TogglePill = ({ options, value, onChange }) => (
  <div style={{
    display: "flex", background: "#1A1A1A", borderRadius: "8px",
    padding: "3px", marginBottom: "16px", border: "1px solid #2A2A2A",
  }}>
    {options.map((opt) => (
      <button key={opt.value} onClick={() => onChange(opt.value)} style={{
        flex: 1, padding: "10px 12px", borderRadius: "6px", border: "none",
        cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: MONO,
        letterSpacing: "0.5px", textTransform: "uppercase", transition: "all 0.2s ease",
        background: value === opt.value ? "#F97316" : "transparent",
        color: value === opt.value ? "#000" : "#666",
      }}>{opt.label}</button>
    ))}
  </div>
);

const QuickChip = ({ label, onClick, active }) => (
  <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: "20px",
    border: active ? "1px solid #F97316" : "1px solid #2A2A2A",
    background: active ? "rgba(249,115,22,0.1)" : "transparent",
    color: active ? "#F97316" : "#777", fontSize: "12px",
    fontFamily: MONO, cursor: "pointer", transition: "all 0.15s ease", fontWeight: "500",
  }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#aaa"; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#777"; } }}
  >{label}</button>
);

const TakeProfitRow = ({ pct, entry, positionSize, sellPct = 0, onSellChange }) => {
  const multiplier = 1 + pct / 100;
  const targetMC = entry * multiplier;
  const posValue = positionSize * multiplier;
  const profit = posValue - positionSize;
  const banked = positionSize * (sellPct / 100) * multiplier;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 56px 1fr", gap: "8px",
      padding: "10px 0", borderBottom: "1px solid #1A1A1A", alignItems: "center",
      fontSize: "13px", fontFamily: MONO,
    }}>
      <span style={{ color: "#F97316", fontWeight: "600" }}>{pct >= 1000 ? `${pct / 1000}K` : pct}%</span>
      <span style={{ color: "#999" }}>{formatCurrency(targetMC)}</span>
      <span style={{ color: "#F5F5F5", fontWeight: "500" }}>{formatCurrency(posValue)}</span>
      <span style={{ color: "#22C55E", fontWeight: "500" }}>+{formatCurrency(profit)}</span>
      <input
        type="text"
        inputMode="numeric"
        value={sellPct === 0 ? "" : sellPct}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          const num = raw === "" ? 0 : Math.min(100, Math.max(0, parseFloat(raw) || 0));
          onSellChange(pct, num);
        }}
        placeholder="0"
        style={{
          width: "100%", maxWidth: "48px", padding: "6px 4px", textAlign: "center",
          background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "6px",
          color: "#F5F5F5", fontSize: "12px", fontFamily: MONO,
        }}
      />
      <span style={{ color: banked > 0 ? "#22C55E" : "#555", fontWeight: "500", fontSize: "12px" }}>
        {banked > 0 ? formatCurrency(banked) : "—"}
      </span>
    </div>
  );
};

const ComparableRow = ({ name, mc, positionSize, entryMC }) => {
  const multiplier = entryMC > 0 ? mc / entryMC : 0;
  const posValue = positionSize * multiplier;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px",
      padding: "10px 0", borderBottom: "1px solid #1A1A1A", alignItems: "center",
      fontSize: "13px", fontFamily: MONO,
    }}>
      <div>
        <span style={{ color: "#F5F5F5", fontWeight: "500" }}>{name}</span>
        <span style={{ color: "#555", fontSize: "11px", marginLeft: "6px" }}>{formatCurrency(mc)}</span>
      </div>
      <span style={{ color: "#F5F5F5", fontWeight: "500", textAlign: "center" }}>{formatCurrency(posValue)}</span>
      <span style={{ color: "#22C55E", fontWeight: "500", textAlign: "right" }}>{formatMultiplier(multiplier)}x</span>
    </div>
  );
};

export default function Calculator() {
  const [positionSize, setPositionSize] = useState(1000);
  const [entryMC, setEntryMC] = useState(100000);
  const [targetMode, setTargetMode] = useState("mc");
  const [targetMC, setTargetMC] = useState(500000);
  const [targetPct, setTargetPct] = useState(500);
  const [showTable, setShowTable] = useState(false);
  const [showComparables, setShowComparables] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [sellAtTP, setSellAtTP] = useState(() => ({ 100: 0, 200: 0, 500: 0, 1000: 0, 2500: 0, 5000: 0, 10000: 0 }));

  const [caInput, setCaInput] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [caLoading, setCaLoading] = useState(false);
  const [caError, setCaError] = useState("");
  const debounceRef = useRef(null);

  const generateShareImage = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const w = 1080, h = 1080;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0D0D0D"; ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(249,115,22,0.06)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#F97316"; ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    const cornerLen = 30; ctx.lineWidth = 4;
    [[44,44,1,1],[w-44,44,-1,1],[44,h-44,1,-1],[w-44,h-44,-1,-1]].forEach(([x,y,dx,dy]) => {
      ctx.beginPath(); ctx.moveTo(x+cornerLen*dx,y); ctx.lineTo(x,y); ctx.lineTo(x,y+cornerLen*dy); ctx.stroke();
    });

    ctx.fillStyle = "#F97316"; ctx.font = "600 16px 'Courier New', monospace";
    ctx.textAlign = "center"; ctx.fillText("POWERED BY CRYPTO GOATS", w/2, 110);
    ctx.fillStyle = "#F5F5F5"; ctx.font = "bold 42px 'Courier New', monospace";
    ctx.fillText("POSITION CALCULATOR", w/2, 165);
    ctx.strokeStyle = "#2A2A2A"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100,195); ctx.lineTo(w-100,195); ctx.stroke();

    let yOffset = 240;
    if (tokenData) {
      ctx.fillStyle = "#F97316"; ctx.font = "bold 28px 'Courier New', monospace";
      ctx.fillText(tokenData.symbol, w/2, yOffset);
      ctx.fillStyle = "#777"; ctx.font = "500 16px 'Courier New', monospace";
      ctx.fillText(`${tokenData.name} · ${chainLabels[tokenData.chain]||tokenData.chain}`, w/2, yOffset+30);
      yOffset += 70;
    }

    ctx.fillStyle = "#666"; ctx.font = "600 14px 'Courier New', monospace";
    ctx.fillText("ENTRY", w/2-200, yOffset); ctx.fillText("POSITION", w/2, yOffset); ctx.fillText("TARGET", w/2+200, yOffset);
    ctx.fillStyle = "#F5F5F5"; ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText(formatCurrency(entryMC)+" MC", w/2-200, yOffset+32); ctx.fillText(formatCurrency(positionSize), w/2, yOffset+32);
    const effTarget = targetMode==="mc"?targetMC:entryMC*(1+targetPct/100);
    ctx.fillText(formatCurrency(effTarget)+" MC", w/2+200, yOffset+32);
    yOffset += 90;

    const mult = targetMode==="mc"?(entryMC>0?targetMC/entryMC:0):(1+targetPct/100);
    const fv = positionSize*mult, pr = fv-positionSize, pg = (mult-1)*100;

    ctx.fillStyle = "rgba(249,115,22,0.08)";
    ctx.beginPath(); ctx.roundRect(80,yOffset,w-160,180,16); ctx.fill();
    ctx.strokeStyle = "rgba(249,115,22,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(80,yOffset,w-160,180,16); ctx.stroke();
    ctx.fillStyle = "#777"; ctx.font = "600 14px 'Courier New', monospace"; ctx.fillText("POSITION VALUE", w/2, yOffset+40);
    ctx.fillStyle = "#F97316"; ctx.font = "bold 64px 'Courier New', monospace"; ctx.fillText(formatCurrency(fv), w/2, yOffset+110);
    ctx.fillStyle = "#999"; ctx.font = "500 20px 'Courier New', monospace"; ctx.fillText(`${formatMultiplier(mult)}x from entry`, w/2, yOffset+150);
    yOffset += 220;

    const boxW = (w-200)/2;
    ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.roundRect(80,yOffset,boxW,120,12); ctx.fill();
    ctx.strokeStyle = "#2A2A2A"; ctx.beginPath(); ctx.roundRect(80,yOffset,boxW,120,12); ctx.stroke();
    ctx.fillStyle = "#777"; ctx.font = "600 13px 'Courier New', monospace"; ctx.fillText("PROFIT", 80+boxW/2, yOffset+38);
    ctx.fillStyle = "#22C55E"; ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillText(pr>=0?`+${formatCurrency(pr)}`:`-${formatCurrency(Math.abs(pr))}`, 80+boxW/2, yOffset+82);

    ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.roundRect(w/2+20,yOffset,boxW,120,12); ctx.fill();
    ctx.strokeStyle = "#2A2A2A"; ctx.beginPath(); ctx.roundRect(w/2+20,yOffset,boxW,120,12); ctx.stroke();
    ctx.fillStyle = "#777"; ctx.font = "600 13px 'Courier New', monospace"; ctx.fillText("% GAIN", w/2+20+boxW/2, yOffset+38);
    ctx.fillStyle = "#F5F5F5"; ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillText(`${pg>=0?"+":""}${pg.toFixed(0)}%`, w/2+20+boxW/2, yOffset+82);

    ctx.fillStyle = "#F97316"; ctx.font = "bold 18px 'Courier New', monospace"; ctx.fillText("profit-pal.xyz", w/2, h-100);
    ctx.fillStyle = "#444"; ctx.font = "500 13px 'Courier New', monospace";
    ctx.fillText("For educational purposes only. Not financial advice.", w/2, h-70);

    return canvas;
  }, [positionSize, entryMC, targetMode, targetMC, targetPct, tokenData]);

  const handleShare = useCallback(async () => {
    setShareStatus("generating");
    try {
      const canvas = await generateShareImage();
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], "profitpal-position.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            try { await navigator.share({ title: "My Position - ProfitPal", files: [file] }); setShareStatus("shared"); }
            catch (e) { if (e.name !== "AbortError") { downloadImg(canvas); setShareStatus("downloaded"); } else setShareStatus(""); }
          } else { downloadImg(canvas); setShareStatus("downloaded"); }
        }, "image/png");
      } else {
        try {
          const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setShareStatus("copied");
        } catch { downloadImg(canvas); setShareStatus("downloaded"); }
      }
      setTimeout(() => setShareStatus(""), 2500);
    } catch { setShareStatus(""); }
  }, [generateShareImage]);

  const downloadImg = (canvas) => {
    const link = document.createElement("a"); link.download = "profitpal-position.png";
    link.href = canvas.toDataURL("image/png"); link.click();
  };

  const fetchToken = useCallback(async (ca) => {
    if (!ca || ca.length < 20) { setTokenData(null); setCaError(""); return; }
    setCaLoading(true); setCaError("");
    try {
      const token = await fetchTokenData(ca);
      setTokenData(token);
      if (token.marketCap > 0) setEntryMC(token.marketCap);
      setCaError("");
    } catch { setCaError("Token not found. Check the contract address."); setTokenData(null); }
    setCaLoading(false);
  }, []);

  const handleCaChange = (e) => {
    const val = e.target.value.trim(); setCaInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchToken(val), 600);
  };

  const clearToken = () => { setCaInput(""); setTokenData(null); setCaError(""); };

  const multiplier = targetMode === "mc" ? (entryMC > 0 ? targetMC / entryMC : 0) : (1 + targetPct / 100);
  const finalValue = positionSize * multiplier;
  const profit = finalValue - positionSize;
  const pctGain = (multiplier - 1) * 100;
  const effectiveTargetMC = targetMode === "mc" ? targetMC : entryMC * (1 + targetPct / 100);

  const quickMCs = [
    { label: "500K", value: 500000 }, { label: "1M", value: 1000000 },
    { label: "5M", value: 5000000 }, { label: "10M", value: 10000000 },
    { label: "50M", value: 50000000 }, { label: "100M", value: 100000000 },
  ];
  const quickPcts = [
    { label: "100%", value: 100 }, { label: "500%", value: 500 },
    { label: "1000%", value: 1000 }, { label: "5000%", value: 5000 }, { label: "10000%", value: 10000 },
  ];
  const tpLevels = [100, 200, 500, 1000, 2500, 5000, 10000];
  const comparables = [
    { name: "PEPE peak", mc: 7_000_000_000 }, { name: "WIF peak", mc: 4_500_000_000 },
    { name: "BONK peak", mc: 2_000_000_000 }, { name: "FLOKI", mc: 1_500_000_000 },
    { name: "MOG peak", mc: 800_000_000 }, { name: "BRETT peak", mc: 500_000_000 },
    { name: "SPX6900", mc: 100_000_000 }, { name: "Mid-tier", mc: 50_000_000 },
    { name: "Breakout", mc: 10_000_000 }, { name: "Early gem", mc: 1_000_000 },
  ];

  const toggleBtnStyle = (active) => ({
    width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #2A2A2A",
    background: "transparent", color: "#999", fontSize: "13px", fontFamily: MONO,
    fontWeight: "500", cursor: "pointer", transition: "all 0.2s", marginTop: "8px",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ color: "#F97316", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", fontFamily: MONO }}>
              Powered By Crypto Goats
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "8px 0 4px", fontFamily: SANS, letterSpacing: "-0.5px" }}>
            Position Calculator
          </h1>
          <p style={{ fontSize: "13px", color: "#666", fontFamily: MONO, margin: 0 }}>Know your numbers before you ape.</p>
        </div>

        {/* CA Lookup */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#F97316", marginBottom: "8px", fontFamily: MONO }}>
            Paste Contract Address
          </label>
          <div style={{
            display: "flex", alignItems: "center", background: "#1A1A1A",
            border: `1px solid ${caError ? "#EF4444" : tokenData ? "#22C55E" : "#2A2A2A"}`,
            borderRadius: "10px", padding: "0 12px", height: "52px", transition: "border-color 0.2s", gap: "8px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={caInput} onChange={handleCaChange} placeholder="0x... or token CA"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F5F5", fontSize: "14px", fontFamily: MONO }}
            />
            {caLoading && <div style={{ width: "18px", height: "18px", border: "2px solid #333", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
            {tokenData && !caLoading && <button onClick={clearToken} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "18px", padding: "0 4px" }}>×</button>}
          </div>
          {caError && <p style={{ fontSize: "11px", color: "#EF4444", fontFamily: MONO, marginTop: "6px" }}>{caError}</p>}
        </div>

        {/* Token Info */}
        {tokenData && (
          <div style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(34,197,94,0.04) 100%)",
            border: "1px solid rgba(249,115,22,0.2)", borderRadius: "12px", padding: "16px",
            marginBottom: "20px", animation: "fadeSlide 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#F5F5F5", fontFamily: MONO }}>{tokenData.symbol}</span>
                <span style={{ fontSize: "12px", color: "#777", marginLeft: "8px", fontFamily: MONO }}>{tokenData.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PulsingDot />
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#22C55E", fontFamily: MONO, textTransform: "uppercase" }}>LIVE</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[["Price", formatPrice(tokenData.price)], ["Market Cap", formatCurrency(tokenData.marketCap)], ["Chain", chainLabels[tokenData.chain] || tokenData.chain]].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize: "10px", color: "#666", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{l}</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#F5F5F5", fontFamily: MONO }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Liquidity</div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#999", fontFamily: MONO }}>{formatCurrency(tokenData.liquidity)}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>24h Change</div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: tokenData.priceChange24h >= 0 ? "#22C55E" : "#EF4444", fontFamily: MONO }}>
                  {tokenData.priceChange24h >= 0 ? "+" : ""}{tokenData.priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
            {tokenData.url && <a href={tokenData.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: "12px", fontSize: "11px", color: "#F97316", fontFamily: MONO, textDecoration: "none", opacity: 0.7 }}>View on DexScreener →</a>}
          </div>
        )}

        <NumberInput label="Position Size" value={positionSize} onChange={setPositionSize} placeholder="1000" />
        <NumberInput label={tokenData ? `Entry Market Cap (live from ${tokenData.symbol})` : "Entry Market Cap"} value={entryMC} onChange={setEntryMC} placeholder="100000" />

        <div style={{ marginTop: "8px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#F97316", marginBottom: "8px", fontFamily: MONO }}>Calculate Target By</label>
          <TogglePill options={[{ label: "Market Cap", value: "mc" }, { label: "% Gain", value: "pct" }]} value={targetMode} onChange={setTargetMode} />
        </div>

        {targetMode === "mc" ? (
          <>
            <NumberInput label="Target Market Cap" value={targetMC} onChange={setTargetMC} placeholder="500000" />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", marginTop: "-8px" }}>
              {quickMCs.map(q => <QuickChip key={q.value} label={q.label} onClick={() => setTargetMC(q.value)} active={targetMC === q.value} />)}
            </div>
          </>
        ) : (
          <>
            <NumberInput label="Target % Gain" value={targetPct} onChange={setTargetPct} prefix="" suffix="%" placeholder="500" />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", marginTop: "-8px" }}>
              {quickPcts.map(q => <QuickChip key={q.value} label={q.label} onClick={() => setTargetPct(q.value)} active={targetPct === q.value} />)}
            </div>
          </>
        )}

        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #2A2A2A, transparent)", margin: "8px 0 24px" }} />

        {/* Results */}
        <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
          <ResultCard label="Position Value" value={formatCurrency(finalValue)} highlight={true} sub={`${formatMultiplier(multiplier)}x from entry`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ResultCard label="Profit" value={profit >= 0 ? `+${formatCurrency(profit)}` : `-${formatCurrency(Math.abs(profit))}`} />
            <ResultCard label="% Gain" value={`${pctGain >= 0 ? "+" : ""}${pctGain.toFixed(0)}%`} />
          </div>
          {targetMode === "pct" && <ResultCard label="Target Market Cap" value={formatCurrency(effectiveTargetMC)} />}
        </div>

        {/* Share */}
        <button onClick={handleShare} disabled={shareStatus === "generating"} style={{
          width: "100%", padding: "14px", borderRadius: "10px",
          border: `1px solid ${shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded" ? "#22C55E" : "#F97316"}`,
          background: shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded" ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.08)",
          color: shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded" ? "#22C55E" : "#F97316",
          fontSize: "13px", fontFamily: MONO, fontWeight: "600", cursor: shareStatus === "generating" ? "wait" : "pointer",
          transition: "all 0.2s", marginTop: "8px", marginBottom: "4px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          letterSpacing: "0.5px", textTransform: "uppercase",
        }}>
          {shareStatus === "generating" ? (
            <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(249,115,22,0.3)", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />Generating...</>
          ) : shareStatus === "copied" || shareStatus === "shared" || shareStatus === "downloaded" ? (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>{shareStatus === "copied" ? "Copied to Clipboard" : shareStatus === "shared" ? "Shared" : "Image Saved"}</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share Position</>
          )}
        </button>

        {/* Comparables */}
        <button onClick={() => setShowComparables(!showComparables)} style={toggleBtnStyle()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; e.currentTarget.style.color = "#F97316"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#999"; }}
        >
          <span>{showComparables ? "Hide" : "Show"} Comparable Tokens</span>
          <span style={{ transform: showComparables ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
        </button>

        {showComparables && (
          <div style={{ marginTop: "16px", background: "#111", borderRadius: "12px", border: "1px solid #1A1A1A", padding: "16px", animation: "fadeSlide 0.3s ease" }}>
            <p style={{ fontSize: "11px", color: "#555", fontFamily: MONO, marginTop: 0, marginBottom: "12px" }}>Your bag if this token hit the same MC as...</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "0 0 10px", borderBottom: "1px solid #2A2A2A", fontSize: "10px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", color: "#555", fontFamily: MONO }}>
              <span>Token</span><span style={{ textAlign: "center" }}>Value</span><span style={{ textAlign: "right" }}>Multiple</span>
            </div>
            {comparables.filter(c => c.mc > entryMC).map(c => <ComparableRow key={c.name} name={c.name} mc={c.mc} positionSize={positionSize} entryMC={entryMC} />)}
          </div>
        )}

        {/* TP Levels */}
        <button onClick={() => setShowTable(!showTable)} style={toggleBtnStyle()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; e.currentTarget.style.color = "#F97316"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#999"; }}
        >
          <span>{showTable ? "Hide" : "Show"} Take-Profit Levels</span>
          <span style={{ transform: showTable ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
        </button>

        {showTable && (
          <div style={{ marginTop: "16px", background: "#111", borderRadius: "12px", border: "1px solid #1A1A1A", padding: "16px", animation: "fadeSlide 0.3s ease" }}>
            <p style={{ fontSize: "11px", color: "#777", fontFamily: MONO, marginTop: 0, marginBottom: "12px" }}>
              Set <strong style={{ color: "#F97316" }}>Sell %</strong> at each level (e.g. 25 at 5x, 25 at 10x = 50% hold). You bank that % of your position at that price.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 56px 1fr", gap: "8px", padding: "0 0 10px", borderBottom: "1px solid #2A2A2A", fontSize: "10px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", color: "#555", fontFamily: MONO }}>
              <span>Gain</span><span>MC at</span><span>Value</span><span>Profit</span><span>Sell %</span><span>Banked</span>
            </div>
            {tpLevels.map(pct => (
              <TakeProfitRow
                key={pct}
                pct={pct}
                entry={entryMC}
                positionSize={positionSize}
                sellPct={sellAtTP[pct] ?? 0}
                onSellChange={(level, val) => setSellAtTP(prev => ({ ...prev, [level]: val }))}
              />
            ))}
            {(() => {
              const totalSellPct = tpLevels.reduce((acc, pct) => acc + (sellAtTP[pct] ?? 0), 0);
              const totalBanked = tpLevels.reduce((acc, pct) => {
                const sp = sellAtTP[pct] ?? 0;
                return acc + positionSize * (sp / 100) * (1 + pct / 100);
              }, 0);
              const holdPct = 100 - totalSellPct;
              return (
                <>
                  {totalSellPct > 100 && (
                    <p style={{ fontSize: "11px", color: "#EF4444", fontFamily: MONO, marginTop: "12px", marginBottom: 0 }}>Sell % adds up to {totalSellPct.toFixed(0)}% — reduce so total ≤ 100%.</p>
                  )}
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #2A2A2A", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px" }}>Total banked (if all hit)</span>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#22C55E", fontFamily: MONO }}>{formatCurrency(totalBanked)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px" }}>Hold</span>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: holdPct >= 0 ? "#F97316" : "#EF4444", fontFamily: MONO }}>{holdPct.toFixed(0)}%</div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Embed widget */}
        <button onClick={() => setShowEmbedCode(!showEmbedCode)} style={toggleBtnStyle()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; e.currentTarget.style.color = "#F97316"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#999"; }}
        >
          <span>{showEmbedCode ? "Hide" : "Show"} Embed Widget Code</span>
          <span style={{ transform: showEmbedCode ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
        </button>

        {showEmbedCode && (
          <div style={{ marginTop: "16px", background: "#111", borderRadius: "12px", border: "1px solid #1A1A1A", padding: "16px", animation: "fadeSlide 0.3s ease" }}>
            <p style={{ fontSize: "11px", color: "#777", fontFamily: MONO, marginTop: 0, marginBottom: "12px" }}>
              Drop this on your site or share the link. Every embed shows <strong style={{ color: "#F97316" }}>Powered by Crypto Goats.</strong>
            </p>
            <p style={{ fontSize: "11px", color: "#555", fontFamily: MONO, marginBottom: "10px" }}>Embed in a website (replace with your live URL):</p>
            <pre style={{
              background: "#0D0D0D", padding: "12px", borderRadius: "8px", overflow: "auto",
              fontSize: "11px", fontFamily: MONO, color: "#999", border: "1px solid #2A2A2A",
              margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all",
            }}>
{`<iframe
  src="https://YOUR-DOMAIN.com/#/embed"
  width="380"
  height="420"
  frameborder="0"
  title="Profit calculator"
></iframe>`}
            </pre>
            <p style={{ fontSize: "11px", color: "#555", fontFamily: MONO, marginTop: "12px", marginBottom: 0 }}>
              Direct link: <a href="#/embed" style={{ color: "#F97316", textDecoration: "none" }}>#/embed</a> — open in new tab to share (e.g. in Discord).
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #1A1A1A" }}>
          <a href="https://upgrade.chat/crypto-goats" target="_blank" rel="noopener noreferrer"
            style={{ display: "block", width: "100%", padding: "16px", borderRadius: "10px", border: "none", background: "#F97316", color: "#000", fontSize: "14px", fontWeight: "700", fontFamily: MONO, letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", cursor: "pointer", transition: "all 0.2s", marginBottom: "20px" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FB923C"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F97316"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Join Crypto Goats</a>
          <p style={{ fontSize: "11px", color: "#444", fontFamily: MONO, lineHeight: 1.6, margin: 0 }}>
            For educational purposes only. Not financial advice.<br />Built by Crypto Goats.
          </p>
        </div>
      </div>
    </div>
  );
}
