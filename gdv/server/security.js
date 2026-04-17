const LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
const PRODUCTION_ORIGINS = [
  "https://gdvalparaiso.com",
  "https://www.gdvalparaiso.com",
];

function getAllowedOrigins() {
  const fromEnv = String(process.env.CORS_ALLOWED_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...LOCAL_ORIGINS, ...PRODUCTION_ORIGINS, ...fromEnv])];
}

function isRequestOriginAllowed(origin, allowedOrigins) {
  if (origin) {
    return allowedOrigins.includes(origin);
  }

  const allowNoOrigin =
    String(process.env.ALLOW_NO_ORIGIN || "").toLowerCase() === "true" ||
    process.env.NODE_ENV !== "production";

  return allowNoOrigin;
}

function getClientIp(req) {
  return String(
    req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "",
  )
    .split(",")[0]
    .trim();
}

function createRateLimiter({ windowMs, max, keyPrefix }) {
  const store = new Map();
  const prefix = keyPrefix || "global";

  return (req) => {
    const ip = getClientIp(req) || "unknown";
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const current = store.get(key);

    if (!current || now > current.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    current.count += 1;
    return current.count <= max;
  };
}

function getAllowedImageHosts() {
  const defaultHosts = "api.praxsuite.com,blob.core.windows.net,*.blob.core.windows.net";
  return String(process.env.IMAGE_PROXY_ALLOWED_HOSTS || defaultHosts)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeImageUrl(rawUrl) {
  let value = String(rawUrl || "").trim();
  if (!value) return "";
  if (value.startsWith("http://api.praxsuite.com/")) {
    value = value.replace("http://api.praxsuite.com/", "https://api.praxsuite.com/");
  }
  return value;
}

function isPrivateIpv4(hostname) {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const octets = match.slice(1).map(Number);
  if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isHostAllowed(hostname, allowedHosts) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;

  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (isPrivateIpv4(host)) return false;

  return allowedHosts.some((pattern) => {
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1); // .domain.tld
      return host.endsWith(suffix);
    }
    return host === pattern;
  });
}

function isSafeImageUrl(rawUrl, allowedHosts) {
  try {
    const parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (parsed.username || parsed.password) return false;
    return isHostAllowed(parsed.hostname, allowedHosts);
  } catch {
    return false;
  }
}

module.exports = {
  createRateLimiter,
  getClientIp,
  getAllowedImageHosts,
  getAllowedOrigins,
  isRequestOriginAllowed,
  isSafeImageUrl,
  normalizeImageUrl,
};

