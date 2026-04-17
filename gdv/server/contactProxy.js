const fs = require("fs");
const path = require("path");
const http = require("http");
const { randomUUID } = require("crypto");
const {
  createRateLimiter,
  getClientIp,
  getAllowedOrigins,
  isRequestOriginAllowed,
} = require("./security");

loadEnvFile();

const DEFAULT_REF = "47114a1c-b38f-467b-a34c-af08b0cb7b79";
const BOT_SIGNAL_WINDOW_MS = Number(
  process.env.CONTACT_BOT_SIGNAL_WINDOW_MS || 10 * 60 * 1000,
);
const BOT_SIGNAL_LIMIT = Number(process.env.CONTACT_BOT_SIGNAL_LIMIT || 6);
const BOT_BLOCK_MS = Number(process.env.CONTACT_BOT_BLOCK_MS || 15 * 60 * 1000);
const CONTACT_MIN_FILL_MS = Number(process.env.CONTACT_MIN_FILL_MS || 1500);
const TURNSTILE_EXPECTED_ACTION =
  process.env.TURNSTILE_EXPECTED_ACTION || "contact_form";
const ipBotSignals = new Map();

// ============ SECURITY: Rate Limiting ============
const checkRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_CONTACT_API || 5),
  keyPrefix: "contact-api",
});

// ============ SECURITY: CORS Restrictions ============
const ALLOWED_ORIGINS = getAllowedOrigins();
const TURNSTILE_ALLOWED_HOSTNAMES = getTurnstileAllowedHostnames();

function loadEnvFile() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['\"]|['\"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(res, statusCode, payload) {
  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
}

function sendCorsHeaders(res, origin) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": origin || "",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
  });
  res.end();
}

function isValidEmail(email) {
  // RFC 5322 simplified
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

function getTurnstileAllowedHostnames() {
  const defaults = [
    "localhost",
    "127.0.0.1",
    "gdvalparaiso.com",
    "www.gdvalparaiso.com",
  ];
  const fromEnv = String(process.env.TURNSTILE_ALLOWED_HOSTNAMES || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set([...defaults, ...fromEnv])];
}

function getSignalState(ip) {
  const now = Date.now();
  const current = ipBotSignals.get(ip);

  if (!current) {
    const state = {
      score: 0,
      resetAt: now + BOT_SIGNAL_WINDOW_MS,
      blockedUntil: 0,
    };
    ipBotSignals.set(ip, state);
    return state;
  }

  if (now > current.resetAt) {
    current.score = 0;
    current.resetAt = now + BOT_SIGNAL_WINDOW_MS;
  }

  return current;
}

function getIpBlockRemainingMs(ip) {
  if (!ip) return 0;
  const state = getSignalState(ip);
  const now = Date.now();
  return state.blockedUntil > now ? state.blockedUntil - now : 0;
}

function registerBotSignal(ip, score = 1) {
  if (!ip) return;
  const state = getSignalState(ip);
  const now = Date.now();
  state.score += score;

  if (state.score >= BOT_SIGNAL_LIMIT) {
    state.blockedUntil = now + BOT_BLOCK_MS;
    state.score = 0;
    state.resetAt = now + BOT_SIGNAL_WINDOW_MS;
  }
}

function clearBotSignals(ip) {
  if (!ip) return;
  ipBotSignals.delete(ip);
}

async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, reason: "missing-token" };
  }

  try {
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);
    if (remoteIp) {
      body.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
    );

    const payload = await response.json().catch(() => ({}));
    const hostname = String(payload?.hostname || "").toLowerCase();
    const action = String(payload?.action || "");

    if (!payload?.success) {
      return {
        ok: false,
        reason:
          payload?.["error-codes"] ||
          payload?.error ||
          "captcha-verification-failed",
      };
    }

    if (TURNSTILE_EXPECTED_ACTION && action !== TURNSTILE_EXPECTED_ACTION) {
      return { ok: false, reason: "captcha-action-mismatch" };
    }

    if (hostname && !TURNSTILE_ALLOWED_HOSTNAMES.includes(hostname)) {
      return { ok: false, reason: "captcha-hostname-mismatch" };
    }

    return {
      ok: true,
      reason: "",
    };
  } catch (error) {
    return {
      ok: false,
      reason: error.message || "captcha-verification-request-failed",
    };
  }
}

function buildInsertPayload({ name, email, subject, message }) {
  const ref =
    process.env.REACT_APP_PRAXSUITE_CONTACT_REF ||
    process.env.PRAXSUITE_CONTACT_REF ||
    DEFAULT_REF;
  const table =
    process.env.REACT_APP_PRAXSUITE_CONTACT_TABLE ||
    process.env.PRAXSUITE_CONTACT_TABLE ||
    "CONTACTS";
  const customSubmissionField = process.env.PRAXSUITE_SUBMISSION_FIELD;
  const customSubmissionId = randomUUID();
  const nameField = process.env.PRAXSUITE_CONTACT_FIELD_NAME || "Name";
  const emailField = process.env.PRAXSUITE_CONTACT_FIELD_EMAIL || "Email";
  const subjectField = process.env.PRAXSUITE_CONTACT_FIELD_SUBJECT || "Subject";
  const messageField = process.env.PRAXSUITE_CONTACT_FIELD_MESSAGE || "Message";

  const row = {};
  row[nameField] = name.substring(0, 255);
  row[emailField] = email.substring(0, 254);
  row[subjectField] = subject.substring(0, 500);
  row[messageField] = message.substring(0, 5000);

  if (customSubmissionField) {
    row[customSubmissionField] = customSubmissionId;
  }

  const returningFields = [
    "ID",
    nameField,
    emailField,
    subjectField,
    messageField,
  ];
  if (customSubmissionField) {
    returningFields.push(customSubmissionField);
  }

  return {
    refs: {
      [table]: ref,
    },
    mutation: {
      type: "insert",
      table: table,
      values: [row],
      returning: returningFields,
    },
  };
}

function getAuthHeaders() {
  const apiKey =
    process.env.REACT_APP_PRAXSUITE_CONTACT_PUBLIC_KEY ||
    process.env.PRAXSUITE_PRIVATE_KEY ||
    process.env.PRAXSUITE_API_KEY ||
    process.env.PRAXSUITE_PUBLIC_KEY;
  if (!apiKey) return {};

  const headerName = process.env.PRAXSUITE_AUTH_HEADER || "Authorization";
  const authPrefix = process.env.PRAXSUITE_AUTH_PREFIX || "Bearer";
  const authValue = authPrefix ? `${authPrefix} ${apiKey}` : apiKey;

  return {
    [headerName]: authValue,
  };
}

function deriveQueryUrlFromWebhook(webhookUrl) {
  if (!webhookUrl) return "";

  const match = webhookUrl.match(/(.*\/gateway\/[^/]+)\/webhook\/[^/]+$/);
  if (!match) return "";

  return `${match[1]}/query`;
}

function getQueryUrl() {
  if (process.env.REACT_APP_PRAXSUITE_CONTACT_QUERY_URL) {
    return process.env.REACT_APP_PRAXSUITE_CONTACT_QUERY_URL;
  }
  if (process.env.PRAXSUITE_QUERY_URL) {
    return process.env.PRAXSUITE_QUERY_URL;
  }

  return deriveQueryUrlFromWebhook(process.env.PRAXSUITE_WEBHOOK_URL);
}

async function postToPraxsuite(contactData) {
  const queryUrl = getQueryUrl();
  if (!queryUrl) {
    return {
      ok: false,
      status: 500,
      body: {
        error:
          "Missing PRAXSUITE_QUERY_URL (or a webhook URL that can be converted to /query) in .env",
      },
    };
  }

  const payload = buildInsertPayload(contactData);

  try {
    const response = await fetch(queryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch (_error) {
      parsed = { raw: text };
    }

    return {
      ok: response.ok,
      status: response.status,
      body: parsed,
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      body: {
        error: "Could not reach Praxsuite query endpoint",
        detail: error.message,
      },
    };
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (_error) {
        reject(new Error("Invalid JSON payload"));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

const port = Number(process.env.CONTACT_API_PORT || 8080);

const server = http.createServer(async (req, res) => {
  // ============ SECURITY: Get client IP for rate limiting ============
  const clientIp = getClientIp(req);

  // ============ SECURITY: CORS Pre-flight ============
  const origin = req.headers.origin || "";
  const isAllowed = isRequestOriginAllowed(origin, ALLOWED_ORIGINS);

  if (req.method === "OPTIONS") {
    if (isAllowed) {
      sendCorsHeaders(res, origin);
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "CORS policy violation" }));
    }
    return;
  }

  // ============ SECURITY: Add CORS header to response ============
  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "");

  const blockedMs = getIpBlockRemainingMs(clientIp);
  if (blockedMs > 0) {
    res.setHeader("Retry-After", String(Math.ceil(blockedMs / 1000)));
    sendJson(res, 429, { error: "Too many suspicious attempts from this IP" });
    return;
  }

  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/contact") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  // ============ SECURITY: Rate Limiting ============
  if (!checkRateLimit(req)) {
    res.setHeader("Retry-After", "60");
    sendJson(res, 429, {
      error: "Too many requests. Maximum 5 requests per minute.",
    });
    return;
  }

  // ============ SECURITY: CORS Origin Check ============
  if (!isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", "");
    sendJson(res, 403, { error: "Origin not allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const captchaToken = String(body.captchaToken || "").trim();
    const honeypot = String(body.website || "").trim();
    const formStartedAt = Number(body.formStartedAt);
    const now = Date.now();

    // ============ SECURITY: Input Validation ============
    if (!name || !email || !subject || !message) {
      sendJson(res, 400, { error: "All fields are required" });
      return;
    }

    if (name.length > 255 || subject.length > 500 || message.length > 5000) {
      sendJson(res, 400, { error: "Input exceeds maximum length" });
      return;
    }

    if (!isValidEmail(email)) {
      sendJson(res, 400, { error: "Invalid email format" });
      return;
    }

    if (honeypot) {
      registerBotSignal(clientIp, 4);
      sendJson(res, 403, { error: "Suspicious activity detected" });
      return;
    }

    if (!Number.isFinite(formStartedAt)) {
      registerBotSignal(clientIp, 2);
      sendJson(res, 400, { error: "Invalid form metadata" });
      return;
    }

    if (now - formStartedAt < CONTACT_MIN_FILL_MS) {
      registerBotSignal(clientIp, 2);
      sendJson(res, 429, { error: "Form submitted too quickly" });
      return;
    }

    if (isTurnstileEnabled()) {
      const captchaVerification = await verifyTurnstileToken(
        captchaToken,
        clientIp,
      );
      if (!captchaVerification.ok) {
        registerBotSignal(clientIp, 3);
        sendJson(res, 403, {
          error: "Captcha verification failed",
        });
        return;
      }
    }

    const praxsuiteResponse = await postToPraxsuite({
      name,
      email,
      subject,
      message,
    });

    if (!praxsuiteResponse.ok) {
      console.error("Contact API PraxSuite Error:", praxsuiteResponse.body);
      sendJson(res, praxsuiteResponse.status, {
        error: "Contact submission failed",
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      message: "Contact successfully submitted",
    });
    clearBotSignals(clientIp);
  } catch (error) {
    console.error("Contact proxy unexpected error:", error);
    sendJson(res, 500, {
      error: "Unexpected server error",
    });
  }
});

server.listen(port, () => {
  console.log(`Contact proxy running on http://localhost:${port}`);
});
