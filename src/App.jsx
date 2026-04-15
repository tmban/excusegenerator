import { useState, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes popIn { 0%{opacity:0;transform:scale(0.94)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
  .fade-up { animation: fadeUp 0.32s ease forwards; }
  .pop { animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  button, textarea, input { font-family: 'DM Sans', sans-serif; }
  textarea:focus, input:focus { outline: none; }
  textarea { resize: none; }

  input[type=range] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 6px; border-radius: 3px;
    cursor: pointer; background: transparent;
  }
  input[type=range].light::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: #e5e7eb; }
  input[type=range].dark::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.12); }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
    background: #007A33; border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,122,51,0.35); margin-top: -8px; cursor: pointer;
  }
  input[type=range].dark::-webkit-slider-thumb { background: #00a550; border-color: #0d2117; }
  input[type=range]::-moz-range-thumb {
    width: 22px; height: 22px; border-radius: 50%;
    background: #007A33; border: 3px solid #fff; cursor: pointer;
  }

  .star-btn { transition: transform 0.12s; background: none; border: none; cursor: pointer; }
  .star-btn:hover { transform: scale(1.25); }

  .bottom-actions { display: flex; gap: 8px; flex-direction: column; }
  .header-logo { white-space: nowrap; }

  .desktop-br { display: inline; }
  .mobile-space { display: none; }

  @media (max-width: 600px) {
    .two-col { grid-template-columns: 1fr !important; }
    .result-meta { flex-direction: column; gap: 2px !important; }
    .header-logo { white-space: nowrap; }
    .desktop-br { display: none; }
    .mobile-space { display: inline; }
  }
`;

const INTENSITY_LABELS = [
  "My dog ate it",
  "Barely believable",
  "Plausible stretch",
  "Creative liberties",
  "Somewhat dramatic",
  "Notably embellished",
  "Hard to verify",
  "Impressively fabricated",
  "Cinematic",
  "Full Oscar campaign",
];

function intensityColor(level, dark) {
  const t = (level - 1) / 9;
  if (t < 0.35) return dark ? "#4ade80" : "#15803d";
  if (t < 0.65) return dark ? "#fbbf24" : "#d97706";
  return dark ? "#f87171" : "#dc2626";
}

function StarRating({ value, onChange, dark }) {
  const [hov, setHov] = useState(0);
  const on = dark ? "#fbbf24" : "#d97706";
  const off = dark ? "rgba(255,255,255,0.18)" : "#d1d5db";
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} className="star-btn"
          onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
          style={{ fontSize: "1.2rem", lineHeight: 1, padding: 2, color: n <= (hov || value) ? on : off }}>★</button>
      ))}
      {value > 0 && <span style={{ fontSize: "0.72rem", marginLeft: 4, color: dark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>{value}/5</span>}
    </div>
  );
}

function ExcuseCard({ ex, idx, iCol, c, d, rating, onRate, onSave, alreadySaved, onCopy, copied }) {
  const [expanded, setExpanded] = useState(true);
  const cardBg = d
    ? idx % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,165,80,0.06)"
    : idx % 2 === 0 ? "#f4f9f5" : "#edf7ef";
  const headerBg = d
    ? idx % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,165,80,0.1)"
    : idx % 2 === 0 ? "#edf7ef" : "#e0f2e7";

  return (
    <div style={{ background: cardBg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: headerBg }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 400, color: iCol, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>{ex.tier_label}</span>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.7rem", color: c.textFaint, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0 }}>
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {expanded && (
          <div style={{ fontSize: "0.9rem", color: c.text, lineHeight: 1.78, marginBottom: 12 }}>
            {ex.excuse}
          </div>
        )}
        {expanded && (
          <div style={{ padding: "9px 12px", borderRadius: 8, background: d ? "rgba(255,255,255,0.03)" : "#fafff9", border: `1px solid ${c.border2}`, marginBottom: 12 }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.textFaint }}>Delivery tip · </span>
            <span style={{ fontSize: "0.8rem", color: c.textMuted }}>{ex.confidence_tip}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: expanded ? 12 : 0, borderTop: expanded ? `1px solid ${c.border2}` : "none" }}>
          <StarRating value={rating} onChange={onRate} dark={d} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onCopy(ex.excuse, `copy-${ex.id}`)}
              style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${c.border}`, background: copied === `copy-${ex.id}` ? c.accentBg : "transparent", color: copied === `copy-${ex.id}` ? c.accent : c.textMuted, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              {copied === `copy-${ex.id}` ? "✓" : "Copy"}
            </button>
            <button onClick={onSave} disabled={alreadySaved}
              style={{ padding: "6px 12px", borderRadius: 7, border: `1.5px solid ${c.accent}`, background: alreadySaved ? c.accentBg : "transparent", color: c.accent, fontSize: "0.75rem", fontWeight: 700, cursor: alreadySaved ? "default" : "pointer" }}>
              {alreadySaved ? "✓" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExcuseGeneratorPro() {
  const [dark, setDark] = useState(false);
  const [name, setName] = useState("");
  const [situation, setSituation] = useState("");
  const [recipient, setRecipient] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [excuses, setExcuses] = useState([]);
  const [ratings, setRatings] = useState({});
  const [saved, setSaved] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [copied, setCopied] = useState(null);
  const [history, setHistory] = useState([]);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const topRef = useRef(null);

  const d = dark;
  const c = {
    bg:        d ? "#0d2117" : "#ffffff",
    surface:   d ? "rgba(255,255,255,0.05)" : "#f4f9f5",
    surface2:  d ? "rgba(255,255,255,0.08)" : "#edf7ef",
    border:    d ? "rgba(255,255,255,0.10)" : "rgba(0,122,51,0.18)",
    border2:   d ? "rgba(255,255,255,0.06)" : "#e5e7eb",
    text:      d ? "#ffffff" : "#0a1a0f",
    textMuted: d ? "rgba(255,255,255,0.60)" : "rgba(10,26,15,0.56)",
    textFaint: d ? "rgba(255,255,255,0.28)" : "rgba(10,26,15,0.3)",
    accent:    d ? "#00a550" : "#007A33",
    accentBg:  d ? "rgba(0,165,80,0.12)" : "rgba(0,122,51,0.07)",
    inputBg:   d ? "rgba(255,255,255,0.06)" : "#ffffff",
    fieldCol:  d ? "rgba(0,165,80,0.8)" : "rgba(0,90,38,0.65)",
  };

  const canGenerate = situation.trim().length > 5;
  const iCol = intensityColor(intensity, d);

  function buildContext() {
    const rel = history.filter(h => h.rating >= 4 || h.saved).slice(-5);
    if (!rel.length) return "";
    return `\n\nUser rated these past excuses highly or saved them — calibrate to their taste:\n${rel.map(h =>
      `- Level ${h.intensity}/10, rated ${h.rating}/5${h.saved ? " (saved)" : ""}: "${h.excerpt}"`
    ).join("\n")}`;
  }

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setExcuses([]);
    setRatings({});
    setCopied(null);
    setShowRegenerate(false);
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });

    const prompt = `You are Excuse Generator Pro — a witty assistant that writes bespoke excuses.
${name ? `Name: ${name}` : ""}
Situation: "${situation}"
${recipient ? `Telling it to: "${recipient}"` : ""}
Intensity: ${intensity}/10 — "${INTENSITY_LABELS[intensity - 1]}"

${intensity <= 3 ? "Write plausible, mundane, boring excuses — no one would question them." : intensity <= 6 ? "Get creative. A stretch but not impossible. Add believable detail." : intensity <= 8 ? "Be dramatic. Specific. Hard to verify but delivered with total confidence." : "Go completely unhinged but tell it with utter sincerity. Cinematic detail. Absurd premise. Maximum entertainment."}

IMPORTANT: Do NOT use em dashes (—) anywhere in the excuses. Use commas, full stops, or conjunctions instead. Write naturally, not like AI copy.
${buildContext()}

Generate 3 DIFFERENT excuse variations for this situation, all at intensity ${intensity}/10 but with different angles, details, and delivery styles. Each should feel distinct — not just the same excuse reworded.

Return ONLY raw JSON, no markdown:
{
  "excuses": [
    {
      "id": "a",
      "tier_label": "<2-3 word label>",
      "excuse": "<complete excuse in first person, ${intensity <= 4 ? "2-3 sentences" : intensity <= 7 ? "3-4 sentences with specific detail" : "4-6 sentences, dramatic and specific"}>",
      "short_version": "<one punchy hook line, max 15 words>",
      "confidence_tip": "<one practical delivery tip>"
    },
    {
      "id": "b",
      "tier_label": "<2-3 word label — different angle>",
      "excuse": "<distinctly different variation>",
      "short_version": "<punchy hook>",
      "confidence_tip": "<delivery tip>"
    },
    {
      "id": "c",
      "tier_label": "<2-3 word label — third angle>",
      "excuse": "<third distinct variation>",
      "short_version": "<punchy hook>",
      "confidence_tip": "<delivery tip>"
    }
  ]
}`;

    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_tokens: 1400, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setExcuses(parsed.excuses.map(e => ({ ...e, intensity, situation, recipient: recipient || null, name: name || null })));
    } catch {
      alert("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  function handleRate(excuseId, stars) {
    setRatings(prev => ({ ...prev, [excuseId]: stars }));
    const ex = excuses.find(e => e.id === excuseId);
    if (!ex) return;
    const entry = { excerpt: ex.excuse.slice(0, 60), intensity, rating: stars, saved: saved.some(s => s.excuse === ex.excuse) };
    setHistory(prev => [...prev.filter(h => h.excerpt !== entry.excerpt), entry]);
  }

  function handleSave(ex) {
    if (saved.some(s => s.excuse === ex.excuse)) return;
    const item = { id: Date.now(), ...ex, rating: ratings[ex.id] || 0, savedAt: new Date().toLocaleTimeString() };
    setSaved(prev => [item, ...prev.slice(0, 29)]);
    const entry = { excerpt: ex.excuse.slice(0, 60), intensity, rating: ratings[ex.id] || 0, saved: true };
    setHistory(prev => [...prev.filter(h => h.excerpt !== entry.excerpt), entry]);
  }

  function copyText(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div ref={topRef} style={{ fontFamily: "'DM Sans', sans-serif", background: c.bg, minHeight: "100vh", color: c.text, transition: "background 0.3s, color 0.3s", display: "flex", flexDirection: "column" }}>
      <style>{STYLES}</style>

      {/* HEADER */}
      <header style={{ background: d ? "#0a1c12" : "#007A33", padding: "0 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => { setExcuses([]); setRatings({}); }} style={{ cursor: "pointer" }}>
            <div className="header-logo" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#fff", letterSpacing: "0.02em" }}>
              Excuse Generator <span style={{ opacity: 0.65, fontWeight: 600 }}>Pro</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved.length > 0 && (
              <button onClick={() => setShowSaved(!showSaved)}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: showSaved ? "#fff" : "transparent", color: showSaved ? "#007A33" : "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                Saved {saved.length}
              </button>
            )}
            <button onClick={() => setDark(!d)}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {d ? "☀" : "☽"}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 60px", flex: 1, width: "100%" }}>

        {/* SAVED PANEL */}
        {showSaved && saved.length > 0 && (
          <div className="fade-up" style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20, marginBottom: 28 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "0.9rem", color: c.text, marginBottom: 14 }}>Saved excuses</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto" }}>
              {saved.map(item => (
                <div key={item.id} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${c.border2}`, background: c.inputBg }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.accent }}>{item.tier_label}</span>
                      <span style={{ fontSize: "0.62rem", color: c.textFaint }}>· Level {item.intensity}/10</span>
                      {item.rating > 0 && <span style={{ fontSize: "0.62rem", color: "#f59e0b" }}>· {"★".repeat(item.rating)}</span>}
                      <span style={{ fontSize: "0.62rem", color: c.textFaint }}>· {item.savedAt}</span>
                    </div>
                    <button onClick={() => setSaved(prev => prev.filter(s => s.id !== item.id))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: c.textFaint, fontSize: "0.9rem", lineHeight: 1, padding: "0 0 0 8px", flexShrink: 0 }}>✕</button>
                  </div>
                  <div style={{ fontSize: "0.84rem", color: c.textMuted, lineHeight: 1.6, marginBottom: 8 }}>{item.excuse}</div>
                  <button onClick={() => copyText(item.excuse, `saved-${item.id}`)}
                    style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${c.border}`, background: "transparent", color: c.textMuted, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer" }}>
                    {copied === `saved-${item.id}` ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INPUT FORM */}
        {!loading && excuses.length === 0 && (
          <div className="fade-up">
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2rem", color: c.text, lineHeight: 1.15, marginBottom: 20 }}>
                What do you need<span className="desktop-br"><br /></span><span className="mobile-space"> </span>an excuse for?
              </div>
              <div style={{ fontSize: "1rem", color: c.textMuted, lineHeight: 1.6 }}>The more detail you give, the better your excuses will be. Context is everything.</div>
            </div>

            {/* Name + Recipient */}
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.fieldCol, marginBottom: 7 }}>
                  Your name <span style={{ opacity: 0.55, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Charlie"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.inputBg, color: c.text, fontSize: "0.9rem" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.fieldCol, marginBottom: 7 }}>
                  Telling it to <span style={{ opacity: 0.55, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </div>
                <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. My girlfriend"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.inputBg, color: c.text, fontSize: "0.9rem" }} />
              </div>
            </div>

            {/* Situation */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.fieldCol, marginBottom: 7 }}>What happened</div>
              <textarea value={situation} onChange={e => setSituation(e.target.value)}
                placeholder="e.g. I forgot our anniversary completely. I didn't realise until she texted asking what time we were going out. I'd had it in my head as next week and never double-checked. We had no plans, no reservation, nothing."
                rows={4}
                style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: `1.5px solid ${situation.trim().length > 5 ? c.accent : c.border}`, background: c.inputBg, color: c.text, fontSize: "0.9rem", lineHeight: 1.6, transition: "border-color 0.2s" }} />
            </div>

            {/* Intensity slider */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.fieldCol }}>Excuse intensity</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: iCol }}>
                  {INTENSITY_LABELS[intensity - 1]}
                </div>
              </div>
              <div style={{ position: "relative", paddingBottom: 4 }}>
                <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", height: 6, width: `${(intensity - 1) / 9 * 100}%`, borderRadius: 3, background: `linear-gradient(to right, ${d ? "#4ade80" : "#15803d"}, ${iCol})`, pointerEvents: "none", marginTop: -2 }} />
                <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(Number(e.target.value))} className={d ? "dark" : "light"} style={{ width: "100%", position: "relative", zIndex: 1 }} />
              </div>
              {/* Tick numbers on bar */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} onClick={() => setIntensity(n)} style={{ fontSize: "0.6rem", color: n === intensity ? iCol : c.textFaint, fontWeight: n === intensity ? 700 : 400, cursor: "pointer", userSelect: "none" }}>{n}</span>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={!canGenerate}
              style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: canGenerate ? c.accent : c.border2, color: canGenerate ? "#fff" : c.textFaint, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.03em", cursor: canGenerate ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Generate excuses
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "90px 0", gap: 24 }}>
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${c.border}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: c.accent, animation: "spin 0.85s linear infinite" }} />
              <div style={{ position: "absolute", inset: 9, borderRadius: "50%", border: "2px solid transparent", borderTopColor: d ? "#4ade80" : "#15803d", animation: "spin 1.4s linear infinite reverse" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: c.text, marginBottom: 6 }}>Crafting your level {intensity} excuse</div>
              <div style={{ fontSize: "0.82rem", color: c.textMuted }}>{INTENSITY_LABELS[intensity - 1]}...</div>
            </div>
          </div>
        )}

        {/* PRIVACY MODAL */}
        {showPrivacy && (
          <div onClick={() => setShowPrivacy(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: d ? "#0f2619" : "#fff", borderRadius: 16, border: `1px solid ${c.border}`, padding: "26px 26px 22px", maxWidth: 420, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: c.text, marginBottom: 18 }}>Privacy Policy</div>

              {[
                ["What we collect", "When you use Excuse Generator Pro, you may enter a name, a description of your situation, and who you're telling the excuse to. This text is sent to Anthropic's API to generate your excuses. We do not store, log, or retain any of this information on our servers. Once your excuses are generated, the input data is discarded."],
                ["Third-party processing", "Your input is processed by Anthropic, Inc. (anthropic.com) to generate responses. Anthropic may retain API request data in accordance with their own privacy policy. We recommend you do not submit sensitive personal information such as medical details, financial information, or information about third parties without their consent."],
                ["No tracking or cookies", "This application does not use cookies, analytics trackers, advertising pixels, or any form of persistent user tracking. We do not collect IP addresses, device identifiers, or browsing behaviour beyond what Vercel's infrastructure logs for security purposes."],
                ["GDPR", "If you are based in the European Economic Area, you have the right to know what data is processed about you. As described above, we process your input text only transiently to generate a response. No personal data is stored by us. For any privacy concerns, contact Vivid Vault Studios via thomasmbanefo.com."],
                ["Children", "This service is not directed at children under 13. If you are under 13, please do not use this application."],
                ["Changes", "This policy may be updated from time to time. Continued use of the app constitutes acceptance of the updated policy."],
              ].map(([heading, body]) => (
                <div key={heading} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.accent, marginBottom: 5 }}>{heading}</div>
                  <div style={{ fontSize: "0.84rem", color: c.textMuted, lineHeight: 1.7 }}>{body}</div>
                </div>
              ))}

              <div style={{ fontSize: "0.72rem", color: c.textFaint, marginBottom: 16 }}>Last updated: April 2025</div>
              <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: c.accent, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}

        {/* TERMS MODAL */}
        {showTerms && (
          <div onClick={() => setShowTerms(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: d ? "#0f2619" : "#fff", borderRadius: 16, border: `1px solid ${c.border}`, padding: "26px 26px 22px", maxWidth: 420, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: c.text, marginBottom: 18 }}>Terms of Service</div>

              {[
                ["Acceptance", "By using Excuse Generator Pro, you agree to these terms. If you do not agree, please do not use the service."],
                ["What this service is", "Excuse Generator Pro is an AI-powered tool that generates fictional excuses for entertainment and creative purposes. The excuses generated are not intended to be used to deceive, defraud, or harm any person or organisation."],
                ["Acceptable use", "You agree not to use this service to generate content that is harmful, abusive, defamatory, or illegal. You agree not to attempt to manipulate, exploit, or reverse-engineer the underlying AI system. You agree not to submit other people's personal information without their consent."],
                ["No liability", "The excuses generated are AI-produced and may be inaccurate, inappropriate, or ineffective. Vivid Vault Studios accepts no responsibility for any consequences arising from the use of generated content. Use at your own discretion."],
                ["Availability", "This service is provided as-is with no guarantee of uptime or availability. It may be modified or discontinued at any time without notice."],
                ["Intellectual property", "The application design, code, and branding are the property of Vivid Vault Studios. The AI-generated excuse text is not claimed as our intellectual property — you may use it freely."],
                ["Governing law", "These terms are governed by the laws of England and Wales."],
              ].map(([heading, body]) => (
                <div key={heading} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.accent, marginBottom: 5 }}>{heading}</div>
                  <div style={{ fontSize: "0.84rem", color: c.textMuted, lineHeight: 1.7 }}>{body}</div>
                </div>
              ))}

              <div style={{ fontSize: "0.72rem", color: c.textFaint, marginBottom: 16 }}>Last updated: April 2025</div>
              <button onClick={() => setShowTerms(false)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: c.accent, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}

        {/* RESULT — 3 cards */}
        {!loading && excuses.length > 0 && (
          <div className="fade-up">
            {/* Heading */}
            <div style={{ marginBottom: 22 }}>
              <div className="result-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.textFaint }}>
                <span>
                  {excuses[0]?.name ? `${excuses[0].name}'s excuses` : "Your excuses"}
                  {excuses[0]?.recipient ? ` · For ${excuses[0].recipient}` : ""}
                </span>
                <span style={{ color: iCol, whiteSpace: "nowrap", flexShrink: 0 }}>
                  Level {intensity}/10 — {INTENSITY_LABELS[intensity - 1]}
                </span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: c.text, lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                {situation}
              </div>
            </div>

            {/* 3 excuse cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              {excuses.map((ex, i) => {
                const exICol = intensityColor(ex.intensity, d);
                const alreadySaved = saved.some(s => s.excuse === ex.excuse);
                return (
                  <ExcuseCard
                    key={ex.id}
                    ex={ex}
                    idx={i}
                    iCol={exICol}
                    c={c}
                    d={d}
                    rating={ratings[ex.id] || 0}
                    onRate={stars => handleRate(ex.id, stars)}
                    onSave={() => handleSave(ex)}
                    alreadySaved={alreadySaved}
                    onCopy={copyText}
                    copied={copied}
                  />
                );
              })}
            </div>

            {/* Regenerate controls — only shown after clicking Regenerate */}
            {showRegenerate && (
              <div style={{ background: d ? "rgba(0,165,80,0.07)" : "#e8f5ec", border: `1px solid ${c.border}`, borderRadius: 12, padding: "16px", marginBottom: 12 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.fieldCol, marginBottom: 8 }}>Adjust your scenario</div>
                <textarea
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.inputBg, color: c.text, fontSize: "0.88rem", lineHeight: 1.5, marginBottom: 14 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.fieldCol }}>Adjust intensity</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: iCol }}>
                    {INTENSITY_LABELS[intensity - 1]}
                  </div>
                </div>
                <div style={{ position: "relative", paddingBottom: 4 }}>
                  <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", height: 6, width: `${(intensity - 1) / 9 * 100}%`, borderRadius: 3, background: `linear-gradient(to right, ${d ? "#4ade80" : "#15803d"}, ${iCol})`, pointerEvents: "none", marginTop: -2 }} />
                  <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(Number(e.target.value))} className={d ? "dark" : "light"} style={{ width: "100%", position: "relative", zIndex: 1 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <span key={n} onClick={() => setIntensity(n)} style={{ fontSize: "0.6rem", color: n === intensity ? iCol : c.textFaint, fontWeight: n === intensity ? 700 : 400, cursor: "pointer" }}>{n}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div className="bottom-actions" style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setShowRegenerate(true); generate(); }}
                style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: c.accent, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                Regenerate
              </button>
              {!showRegenerate && (
                <button onClick={() => { setExcuses([]); setRatings({}); setSituation(""); setName(""); setRecipient(""); setIntensity(5); setShowRegenerate(false); }}
                  style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1px solid ${c.border}`, background: "transparent", color: c.textMuted, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                  New scenario
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: "24px 28px", marginTop: "auto" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: "0.78rem", color: c.textMuted }}>
            Built by Vivid Vault Studios · © 2025
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowPrivacy(true)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: c.textMuted, fontWeight: 500, padding: 0 }}>
              Privacy policy
            </button>
            <button onClick={() => setShowTerms(true)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: c.textMuted, fontWeight: 500, padding: 0 }}>
              Terms of service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
