// api/verdict.js
// Vercel serverless function — server-side proxy keeping API key safe.
// Protections: kill switch, CORS origin check, rate limiting, input sanitisation, injection blocking, token cap.

const rateLimit = new Map();

const ALLOWED_ORIGINS = [
  "https://excusegenerator-sage.vercel.app",
  "https://www.excusegenerator-sage.vercel.app",
];

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 15;
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  const entry = rateLimit.get(ip);
  if (now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxRequests) return true;
  entry.count++;
  return false;
}

function sanitiseString(str, maxLength = 500) {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "");
}

function sanitiseMessages(messages) {
  if (!Array.isArray(messages)) return null;
  if (messages.length > 10) return null;
  return messages.map(msg => {
    if (typeof msg !== "object" || !msg) return null;
    const role = msg.role === "assistant" ? "assistant" : "user";
    const content = typeof msg.content === "string"
      ? sanitiseString(msg.content, 4000)
      : null;
    if (!content) return null;
    return { role, content };
  }).filter(Boolean);
}

function containsInjection(str) {
  const patterns = [
    /ignore previous instructions/i,
    /ignore all instructions/i,
    /you are now a/i,
    /forget your instructions/i,
    /system prompt/i,
    /jailbreak/i,
    /dan mode/i,
    /<script/i,
    /javascript:/i,
    /\bdrop table/i,
    /\bunion select/i,
  ];
  return patterns.some(p => p.test(str));
}

export default async function handler(req, res) {
  // ── KILL SWITCH ──────────────────────────────────────────────────────────
  // To disable the app: add KILL_SWITCH=true in Vercel environment variables
  // and redeploy. Remove the variable to re-enable.
  if (process.env.KILL_SWITCH === "true") {
    return res.status(503).json({
      error: "Service temporarily unavailable. Please try again later."
    });
  }

  const origin = req.headers["origin"] || "";

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again in an hour." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { messages, max_tokens = 1400 } = req.body;

    const cleanMessages = sanitiseMessages(messages);
    if (!cleanMessages || cleanMessages.length === 0) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const allContent = cleanMessages.map(m => m.content).join(" ");
    if (containsInjection(allContent)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const safeTokens = Math.min(Number(max_tokens) || 1400, 2000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: safeTokens,
        messages: cleanMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
