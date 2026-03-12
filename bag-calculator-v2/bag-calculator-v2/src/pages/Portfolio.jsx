import { useState, useEffect, useRef, useCallback } from "react";
import {
  formatCurrency, formatPrice, formatMultiplier, chainLabels,
  fetchTokenData, NumberInput, ResultCard, PulsingDot, MONO, SANS,
} from "../components/shared.jsx";

const STORAGE_KEY = "profitpal_portfolio";

const loadPositions = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const savePositions = (positions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
};

const AddPositionForm = ({ onAdd, onCancel }) => {
  const [ca, setCa] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [positionSize, setPositionSize] = useState(0);
  const [entryMC, setEntryMC] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  const handleCaChange = (e) => {
    const val = e.target.value.trim();
    setCa(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!val || val.length < 20) { setTokenData(null); setError(""); return; }
      setLoading(true); setError("");
      try {
        const data = await fetchTokenData(val);
        setTokenData(data);
        setName(data.name); setSymbol(data.symbol);
        if (data.marketCap > 0) setEntryMC(data.marketCap);
      } catch { setError("Token not found"); setTokenData(null); }
      setLoading(false);
    }, 600);
  };

  const handleAdd = () => {
    if (!positionSize || !entryMC) return;
    onAdd({
      id: Date.now().toString(),
      ca: ca || null,
      name: name || "Unknown",
      symbol: symbol || "???",
      positionSize,
      entryMC,
      chain: tokenData?.chain || null,
      liveMC: tokenData?.marketCap || null,
      livePrice: tokenData?.price || null,
      priceChange24h: tokenData?.priceChange24h || 0,
      lastUpdated: Date.now(),
    });
  };

  return (
    <div style={{
      background: "#111", border: "1px solid #2A2A2A", borderRadius: "12px",
      padding: "20px", marginBottom: "16px", animation: "fadeSlide 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", fontFamily: MONO, color: "#F97316", textTransform: "uppercase", letterSpacing: "1px" }}>
          Add Position
        </span>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "20px", fontFamily: MONO }}>×</button>
      </div>

      {/* CA Input */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#F97316", marginBottom: "8px", fontFamily: MONO }}>
          Contract Address (optional)
        </label>
        <div style={{
          display: "flex", alignItems: "center", background: "#1A1A1A",
          border: `1px solid ${error ? "#EF4444" : tokenData ? "#22C55E" : "#2A2A2A"}`,
          borderRadius: "10px", padding: "0 12px", height: "44px", gap: "8px",
        }}>
          <input type="text" value={ca} onChange={handleCaChange} placeholder="Paste CA to auto-fill..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F5F5", fontSize: "13px", fontFamily: MONO }}
          />
          {loading && <div style={{ width: "16px", height: "16px", border: "2px solid #333", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
        </div>
        {error && <p style={{ fontSize: "11px", color: "#EF4444", fontFamily: MONO, marginTop: "4px" }}>{error}</p>}
        {tokenData && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <PulsingDot />
            <span style={{ fontSize: "12px", fontFamily: MONO, color: "#F5F5F5" }}>{tokenData.symbol}</span>
            <span style={{ fontSize: "11px", fontFamily: MONO, color: "#666" }}>{tokenData.name}</span>
            <span style={{ fontSize: "11px", fontFamily: MONO, color: "#555" }}>·</span>
            <span style={{ fontSize: "11px", fontFamily: MONO, color: "#999" }}>{formatCurrency(tokenData.marketCap)} MC</span>
          </div>
        )}
      </div>

      {/* Manual name/symbol if no CA */}
      {!tokenData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "4px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#F97316", marginBottom: "8px", fontFamily: MONO }}>Token Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pepe"
              style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", padding: "12px", color: "#F5F5F5", fontSize: "13px", fontFamily: MONO, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#F97316", marginBottom: "8px", fontFamily: MONO }}>Symbol</label>
            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. PEPE"
              style={{ width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", padding: "12px", color: "#F5F5F5", fontSize: "13px", fontFamily: MONO, outline: "none" }}
            />
          </div>
        </div>
      )}

      <NumberInput label="Position Size (USD)" value={positionSize} onChange={setPositionSize} placeholder="1000" small />
      <NumberInput label="Entry Market Cap" value={entryMC} onChange={setEntryMC} placeholder="100000" small />

      <button onClick={handleAdd} disabled={!positionSize || !entryMC} style={{
        width: "100%", padding: "14px", borderRadius: "10px", border: "none",
        background: positionSize && entryMC ? "#F97316" : "#333",
        color: positionSize && entryMC ? "#000" : "#666",
        fontSize: "13px", fontWeight: "700", fontFamily: MONO, letterSpacing: "1px",
        textTransform: "uppercase", cursor: positionSize && entryMC ? "pointer" : "not-allowed",
        transition: "all 0.2s", marginTop: "8px",
      }}>
        Add to Portfolio
      </button>
    </div>
  );
};

const PositionCard = ({ position, onRemove, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const mult = position.liveMC && position.entryMC > 0 ? position.liveMC / position.entryMC : null;
  const currentValue = mult ? position.positionSize * mult : null;
  const pnl = currentValue ? currentValue - position.positionSize : null;
  const pnlPct = mult ? (mult - 1) * 100 : null;

  const handleRefresh = async () => {
    if (!position.ca) return;
    setRefreshing(true);
    try {
      const data = await fetchTokenData(position.ca);
      onRefresh(position.id, {
        liveMC: data.marketCap,
        livePrice: data.price,
        priceChange24h: data.priceChange24h,
        name: data.name,
        symbol: data.symbol,
        chain: data.chain,
        lastUpdated: Date.now(),
      });
    } catch (e) { console.error("Refresh failed", e); }
    setRefreshing(false);
  };

  return (
    <div style={{
      background: "#111", border: "1px solid #1A1A1A", borderRadius: "12px",
      padding: "16px", marginBottom: "10px", transition: "all 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#2A2A2A"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1A1A1A"}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#F5F5F5", fontFamily: MONO }}>{position.symbol}</span>
          <span style={{ fontSize: "12px", color: "#555", fontFamily: MONO }}>{position.name}</span>
          {position.chain && <span style={{ fontSize: "10px", color: "#444", fontFamily: MONO, background: "#1A1A1A", padding: "2px 6px", borderRadius: "4px" }}>{chainLabels[position.chain] || position.chain}</span>}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {position.ca && (
            <button onClick={handleRefresh} disabled={refreshing} style={{
              background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "14px",
              transition: "color 0.2s", padding: "2px",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#F97316"}
              onMouseLeave={e => e.currentTarget.style.color = "#555"}
              title="Refresh live data"
            >
              {refreshing ? (
                <div style={{ width: "14px", height: "14px", border: "2px solid #333", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              ) : "↻"}
            </button>
          )}
          <button onClick={() => onRemove(position.id)} style={{
            background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "16px",
            transition: "color 0.2s", padding: "2px",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}
          >×</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Invested</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#F5F5F5", fontFamily: MONO }}>{formatCurrency(position.positionSize)}</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Entry MC</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#999", fontFamily: MONO }}>{formatCurrency(position.entryMC)}</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Live MC</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: position.liveMC ? "#F5F5F5" : "#333", fontFamily: MONO }}>
            {position.liveMC ? formatCurrency(position.liveMC) : "—"}
          </div>
        </div>
      </div>

      {/* PnL row */}
      {currentValue !== null && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
          marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1A1A1A",
        }}>
          <div>
            <div style={{ fontSize: "10px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Value</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#F97316", fontFamily: MONO }}>{formatCurrency(currentValue)}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>P&L</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: pnl >= 0 ? "#22C55E" : "#EF4444", fontFamily: MONO }}>
              {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#555", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Multiple</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: mult >= 1 ? "#22C55E" : "#EF4444", fontFamily: MONO }}>
              {formatMultiplier(mult)}x
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [refreshingAll, setRefreshingAll] = useState(false);

  useEffect(() => {
    setPositions(loadPositions());
  }, []);

  const addPosition = (pos) => {
    const updated = [...positions, pos];
    setPositions(updated);
    savePositions(updated);
    setShowAdd(false);
  };

  const removePosition = (id) => {
    const updated = positions.filter(p => p.id !== id);
    setPositions(updated);
    savePositions(updated);
  };

  const refreshPosition = (id, data) => {
    const updated = positions.map(p => p.id === id ? { ...p, ...data } : p);
    setPositions(updated);
    savePositions(updated);
  };

  const refreshAll = async () => {
    setRefreshingAll(true);
    const updated = [...positions];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].ca) {
        try {
          const data = await fetchTokenData(updated[i].ca);
          updated[i] = {
            ...updated[i],
            liveMC: data.marketCap,
            livePrice: data.price,
            priceChange24h: data.priceChange24h,
            name: data.name,
            symbol: data.symbol,
            chain: data.chain,
            lastUpdated: Date.now(),
          };
        } catch (e) { console.error(`Failed to refresh ${updated[i].symbol}`, e); }
      }
    }
    setPositions(updated);
    savePositions(updated);
    setRefreshingAll(false);
  };

  // Portfolio totals
  const totalInvested = positions.reduce((sum, p) => sum + p.positionSize, 0);
  const totalValue = positions.reduce((sum, p) => {
    if (p.liveMC && p.entryMC > 0) return sum + p.positionSize * (p.liveMC / p.entryMC);
    return sum + p.positionSize;
  }, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? ((totalValue / totalInvested) - 1) * 100 : 0;
  const hasLiveData = positions.some(p => p.liveMC);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ color: "#F97316", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", fontFamily: MONO }}>
              Powered By Crypto Goats
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "8px 0 4px", fontFamily: SANS, letterSpacing: "-0.5px" }}>
            Portfolio Tracker
          </h1>
          <p style={{ fontSize: "13px", color: "#666", fontFamily: MONO, margin: 0 }}>Track your bags in one place.</p>
        </div>

        {/* Portfolio Summary */}
        {positions.length > 0 && (
          <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
            <ResultCard label="Total Portfolio Value" value={formatCurrency(totalValue)} highlight={true}
              sub={hasLiveData ? `${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(1)}% overall` : "Add CAs for live tracking"}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <ResultCard label="Total Invested" value={formatCurrency(totalInvested)} />
              <ResultCard label="Total P&L"
                value={hasLiveData ? `${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)}` : "—"}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            flex: 1, padding: "14px", borderRadius: "10px", border: "none",
            background: "#F97316", color: "#000", fontSize: "13px", fontWeight: "700",
            fontFamily: MONO, letterSpacing: "1px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#FB923C"}
            onMouseLeave={e => e.currentTarget.style.background = "#F97316"}
          >
            + Add Position
          </button>
          {positions.length > 0 && positions.some(p => p.ca) && (
            <button onClick={refreshAll} disabled={refreshingAll} style={{
              padding: "14px 20px", borderRadius: "10px", border: "1px solid #2A2A2A",
              background: "transparent", color: "#999", fontSize: "13px", fontWeight: "600",
              fontFamily: MONO, cursor: refreshingAll ? "wait" : "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; e.currentTarget.style.color = "#F97316"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#999"; }}
            >
              {refreshingAll ? (
                <div style={{ width: "16px", height: "16px", border: "2px solid #333", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              ) : "↻"}
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAdd && <AddPositionForm onAdd={addPosition} onCancel={() => setShowAdd(false)} />}

        {/* Positions */}
        {positions.length === 0 && !showAdd && (
          <div style={{
            textAlign: "center", padding: "48px 20px", border: "1px dashed #2A2A2A",
            borderRadius: "12px", marginTop: "8px",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📊</div>
            <p style={{ fontSize: "14px", color: "#555", fontFamily: MONO, marginBottom: "4px" }}>No positions yet</p>
            <p style={{ fontSize: "12px", color: "#333", fontFamily: MONO }}>Add your first position to start tracking</p>
          </div>
        )}

        {positions.map(p => (
          <PositionCard key={p.id} position={p} onRemove={removePosition} onRefresh={refreshPosition} />
        ))}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #1A1A1A" }}>
          <a href="https://upgrade.chat/crypto-goats" target="_blank" rel="noopener noreferrer"
            style={{
              display: "block", width: "100%", padding: "16px", borderRadius: "10px", border: "none",
              background: "#F97316", color: "#000", fontSize: "14px", fontWeight: "700", fontFamily: MONO,
              letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
              transition: "all 0.2s", marginBottom: "20px",
            }}
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
