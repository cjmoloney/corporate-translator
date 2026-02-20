import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a Corporate Language Specialist — a master of transforming raw, unfiltered human emotion into impeccably professional, HR-safe communication.

Rules:
- Preserve the intent — if they're furious, the translation still lands with impact, just professionally
- Use the classics: "circling back", "alignment", "bandwidth", "going forward", "it would be remiss of me not to flag", "I want to make sure we're set up for success"
- Weaponised politeness is your specialty: "As per my last email..." or "Happy to clarify if there was any confusion"
- Never moralize — they came here to vent productively, not get therapy
- Match the energy — mild annoyance gets mild translation; nuclear rage gets full passive-aggressive corporate treatment

ALWAYS respond with ONLY valid JSON, no markdown fences, no extra text:
{
  "translation": "The full polished corporate version",
  "professionalism_level": "Board-Ready ✅",
  "escalations": [
    { "label": "Gentle Nudge", "text": "softer version" },
    { "label": "Final Warning (Still Polite)", "text": "stronger but still professional" }
  ]
}

Professionalism level must be one of:
- "Board-Ready ✅"
- "Safe for All-Hands 👍"
- "Push It One More Time 🔶"
- "Nuclear Option — Plausible Deniability Engaged ☢️"`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  const { raw, medium } = req.body;

  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    return res.status(400).json({ error: "No input provided." });
  }

  if (raw.length > 2000) {
    return res.status(400).json({ error: "Input too long. Please keep it under 2000 characters." });
  }

  try {
    const prompt = medium ? `Translate this for a ${medium}:\n\n${raw.trim()}` : raw.trim();

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({ error: "Translation failed. Please try again." });
  }
}
