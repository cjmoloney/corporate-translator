import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const LOADING_MSGS = [
  "Polishing your rage…",
  "Applying corporate veneer…",
  "Weaponising politeness…",
  "Finding alignment…",
  "Circling back on your fury…",
  "Scheduling your feelings…",
  "Adding synergy…",
];

const PLACEHOLDERS = [
  "e.g. 'Dave keeps taking credit for my work in meetings and I want to flip the table…'",
  "e.g. 'Karen replied-all to a 200-person thread just to say she agrees…'",
  "e.g. 'They scheduled a meeting about the meeting. Again. I can't.'",
  "e.g. 'My manager dumped three new urgent priorities on me at 4:58pm on Friday…'",
  "e.g. 'Nobody reads my documentation and then asks me questions answered in the documentation…'",
];

const PROF_COLORS = {
  "Board-Ready ✅": "#1a6b3c",
  "Safe for All-Hands 👍": "#2563eb",
  "Push It One More Time 🔶": "#d97706",
  "Nuclear Option — Plausible Deniability Engaged ☢️": "#c0392b",
};

export default function Home() {
  const [raw, setRaw] = useState("");
  const [medium, setMedium] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedEsc, setCopiedEsc] = useState(null);
  const [history, setHistory] = useState([]);
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const [charCount, setCharCount] = useState(0);
  const intervalRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    setCharCount(raw.length);
  }, [raw]);

  async function translate() {
    if (!raw.trim() || loading) return;
    setError("");
    setResult(null);
    setLoading(true);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[i]);
    }, 1300);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, medium }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult({ ...data, original: raw });
      setHistory((h) => [{ raw, translation: data.translation }, ...h].slice(0, 5));

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      clearInterval(intervalRef.current);
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
  }

  function copyMain() {
    navigator.clipboard.writeText(result.translation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyEscalation(text, i) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEsc(i);
      setTimeout(() => setCopiedEsc(null), 2000);
    });
  }

  function reset() {
    setRaw("");
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const mono = "'DM Mono', monospace";
  const serif = "'Playfair Display', Georgia, serif";
  const sans = "'DM Sans', Georgia, sans-serif";

  return (
    <>
      <Head>
        <title>Corporate Translator™</title>
      </Head>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* ── Masthead ── */}
        <header style={{
          textAlign: "center",
          padding: "40px 24px 28px",
          borderBottom: "3px double #1a1208",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "0 clamp(16px, 5vw, 60px)",
            fontFamily: mono, fontSize: 10,
            letterSpacing: "0.15em", textTransform: "uppercase",
            opacity: 0.55, marginBottom: 10, flexWrap: "wrap", gap: 6,
          }}>
            <span>Est. This Very Moment</span>
            <span>The Professional's Companion</span>
            <span>No Rage Too Raw</span>
          </div>
          <div style={{ height: 1, background: "#1a1208", margin: "10px 0" }} />
          <h1 style={{
            fontFamily: serif, fontWeight: 700,
            fontSize: "clamp(34px, 8vw, 72px)",
            lineHeight: 1, letterSpacing: "-0.02em", margin: "10px 0",
          }}>
            Corporate{" "}
            <em style={{ fontWeight: 400, color: "#c9a84c" }}>Translator</em>
          </h1>
          <div style={{ height: 1, background: "#1a1208", margin: "10px 0" }} />
          <p style={{
            fontFamily: mono, fontSize: 11,
            letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6,
          }}>
            Turning Fury into Fluency Since Today™
          </p>
        </header>

        <main style={{ maxWidth: 860, margin: "0 auto", padding: "44px 24px 80px" }}>

          {/* ── Intro card ── */}
          <div style={{
            background: "#1a1208", color: "#f5f0e8",
            padding: "24px 32px", marginBottom: 40,
            borderLeft: "4px solid #c9a84c",
          }}>
            <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.65 }}>
              "Tell me what you <em>really</em> want to say. Unfiltered. Uncivilised.
              I'll hand it back wrapped in seven layers of plausible deniability."
            </p>
            <p style={{
              fontFamily: mono, fontSize: 10, letterSpacing: "0.15em",
              textTransform: "uppercase", opacity: 0.55, marginTop: 12,
            }}>
              — Your friend in HR (who privately agrees with you)
            </p>
          </div>

          {/* ── Input ── */}
          <div style={{ marginBottom: 10 }}>
            <Label>Your Unfiltered Thoughts</Label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={2000}
              rows={5}
              style={{
                width: "100%", background: "white",
                border: "1.5px solid #1a1208", borderLeft: "4px solid #c0392b",
                padding: "18px 22px",
                fontFamily: sans, fontSize: 15, lineHeight: 1.75, color: "#1a1208",
                resize: "vertical", outline: "none",
                transition: "box-shadow 0.2s",
              }}
              onFocus={(e) => { e.target.style.boxShadow = "4px 4px 0 #1a1208"; }}
              onBlur={(e) => { e.target.style.boxShadow = "none"; }}
            />
            <div style={{
              fontFamily: mono, fontSize: 10, textAlign: "right", opacity: 0.4,
              letterSpacing: "0.1em", marginTop: 4,
            }}>
              {charCount}/2000
            </div>
          </div>

          {/* ── Controls ── */}
          <div style={{
            display: "flex", gap: 10, alignItems: "center",
            flexWrap: "wrap", marginBottom: 36,
          }}>
            <button
              onClick={translate}
              disabled={loading || !raw.trim()}
              style={{
                background: loading || !raw.trim() ? "#888" : "#1a1208",
                color: "#f5f0e8", border: "none",
                padding: "13px 32px", fontFamily: mono,
                fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: loading || !raw.trim() ? "not-allowed" : "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading && raw.trim()) {
                  e.target.style.transform = "translate(-2px,-2px)";
                  e.target.style.boxShadow = "4px 4px 0 #c9a84c";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "none";
                e.target.style.boxShadow = "none";
              }}
            >
              {loading ? "✦ Translating…" : "✦ Translate"}
            </button>

            <button
              onClick={reset}
              style={{
                background: "transparent", color: "#1a1208",
                border: "1.5px solid #1a1208", padding: "13px 22px",
                fontFamily: mono, fontSize: 12, letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.target.style.background = "#1a1208"; e.target.style.color = "#f5f0e8"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#1a1208"; }}
            >
              Clear
            </button>

            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              style={{
                border: "1.5px solid #d4c9b0", background: "white",
                padding: "13px 16px", fontFamily: mono, fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#1a1208", outline: "none", cursor: "pointer",
                flex: "1 1 120px", maxWidth: 200,
              }}
            >
              <option value="">Any Medium</option>
              <option value="email">Email</option>
              <option value="Slack message">Slack</option>
              <option value="performance review comment">Perf Review</option>
              <option value="meeting response">Meeting Reply</option>
              <option value="Teams message">Teams</option>
              <option value="LinkedIn comment">LinkedIn</option>
            </select>

            <span style={{ fontFamily: mono, fontSize: 10, opacity: 0.4, letterSpacing: "0.1em" }}>
              or Ctrl+Enter
            </span>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div className="animate-pulse" style={{
                fontFamily: serif, fontStyle: "italic", fontSize: 22,
              }}>
                {loadingMsg}
              </div>
              <div style={{
                fontFamily: mono, fontSize: 10, letterSpacing: "0.15em",
                textTransform: "uppercase", opacity: 0.4, marginTop: 10,
              }}>
                Applying corporate veneer
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div style={{
              background: "#fff3f3", borderLeft: "4px solid #c0392b",
              padding: "14px 18px", fontFamily: mono, fontSize: 12,
              color: "#c0392b", marginBottom: 28,
            }}>
              {error}
            </div>
          )}

          {/* ── Result ── */}
          {result && !loading && (
            <div ref={resultRef} className="animate-fade-up">
              <Divider>Translation Complete</Divider>

              {/* What you wanted to say */}
              <Block icon="🎯" label="What You Wanted to Say">
                <div style={{
                  background: "#fff3f3", borderLeft: "4px solid #c0392b",
                  padding: "16px 20px", fontFamily: sans,
                  fontStyle: "italic", fontSize: 15, lineHeight: 1.7, color: "#666",
                }}>
                  {result.original}
                </div>
              </Block>

              {/* Translation */}
              <Block icon="💼" label="Corporate Translation">
                <div style={{
                  background: "white", border: "1.5px solid #1a1208",
                  borderLeft: "4px solid #1a6b3c", padding: "20px 24px",
                  fontFamily: sans, fontSize: 16, lineHeight: 1.85,
                  position: "relative",
                }}>
                  {result.translation}
                  <button
                    onClick={copyMain}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      background: "#1a1208", color: "#f5f0e8", border: "none",
                      padding: "6px 14px", fontFamily: mono, fontSize: 10,
                      letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </Block>

              {/* Professionalism level */}
              <Block icon="📊" label="Professionalism Level">
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  border: "1.5px solid #1a1208", padding: "10px 20px",
                  fontFamily: mono, fontSize: 13, letterSpacing: "0.05em",
                  color: PROF_COLORS[result.professionalism_level] || "#1a1208",
                  fontWeight: 600,
                }}>
                  {result.professionalism_level}
                </div>
              </Block>

              {/* Escalations */}
              <Block icon="💡" label="Escalation Versions">
                {result.escalations?.map((e, i) => (
                  <div key={i} style={{
                    background: "#f5f0e8", border: "1px dashed #1a1208",
                    padding: "16px 20px", marginBottom: 10, position: "relative",
                  }}>
                    <div style={{
                      fontFamily: mono, fontSize: 10, letterSpacing: "0.15em",
                      textTransform: "uppercase", color: "#c9a84c",
                      fontWeight: 600, marginBottom: 6,
                    }}>
                      {e.label}
                    </div>
                    <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.75, paddingRight: 64 }}>
                      {e.text}
                    </p>
                    <button
                      onClick={() => copyEscalation(e.text, i)}
                      style={{
                        position: "absolute", top: 10, right: 10,
                        background: "transparent", color: "#1a1208",
                        border: "1px solid #1a1208", padding: "4px 10px",
                        fontFamily: mono, fontSize: 9, letterSpacing: "0.1em",
                        textTransform: "uppercase", cursor: "pointer",
                      }}
                    >
                      {copiedEsc === i ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </Block>

              <button
                onClick={reset}
                style={{
                  background: "transparent", color: "#1a1208",
                  border: "1.5px solid #1a1208", padding: "12px 28px",
                  fontFamily: mono, fontSize: 12, letterSpacing: "0.15em",
                  textTransform: "uppercase", cursor: "pointer", marginTop: 8,
                }}
                onMouseEnter={(e) => { e.target.style.background = "#1a1208"; e.target.style.color = "#f5f0e8"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#1a1208"; }}
              >
                ← Translate Another
              </button>
            </div>
          )}

          {/* ── History ── */}
          {history.length > 1 && (
            <div style={{
              marginTop: 60, borderTop: "3px double #1a1208", paddingTop: 28,
            }}>
              <h2 style={{
                fontFamily: serif, fontStyle: "italic",
                fontSize: 22, marginBottom: 18, fontWeight: 400,
              }}>
                Previous Translations
              </h2>
              {history.slice(1).map((h, i) => (
                <div
                  key={i}
                  onClick={() => { setRaw(h.raw); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{
                    borderBottom: "1px solid #d4c9b0", padding: "14px 0",
                    cursor: "pointer", transition: "padding-left 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "10px"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; }}
                >
                  <div style={{
                    fontSize: 13, color: "#c0392b", fontStyle: "italic",
                    fontFamily: sans, marginBottom: 3,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    "{h.raw}"
                  </div>
                  <div style={{
                    fontSize: 13, color: "#1a6b3c", fontFamily: sans,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    → {h.translation.substring(0, 110)}…
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: "center", padding: "28px 24px",
          borderTop: "1px solid #d4c9b0",
          fontFamily: mono, fontSize: 10,
          letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4,
        }}>
          Corporate Translator™ — All feelings heard. All consequences avoided. Usually.
        </footer>
      </div>
    </>
  );
}

// ── Small helper components ──

function Label({ children }) {
  return (
    <div style={{
      fontFamily: "'DM Mono', monospace", fontSize: 10,
      letterSpacing: "0.2em", textTransform: "uppercase",
      opacity: 0.6, marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function Block({ icon, label, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <Label>{label}</Label>
      </div>
      {children}
    </div>
  );
}

function Divider({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, marginBottom: 32,
    }}>
      <div style={{ flex: 1, height: 2, background: "#1a1208" }} />
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic", fontSize: 14, whiteSpace: "nowrap",
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 2, background: "#1a1208" }} />
    </div>
  );
}
