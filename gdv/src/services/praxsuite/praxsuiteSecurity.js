const RATE_LIMIT_STORAGE_KEY = "gdv-praxsuite-rate-limits";
const RELOAD_QUOTA_STORAGE_KEY = "gdv-praxsuite-reload-quota";
const LEGACY_LOAD_QUOTA_KEY = "gdv-praxsuite-load-quota";

export const PRAXSUITE_RELOAD_QUOTA = {
  windowMs: 60_000,
  max: 3,
};

const RATE_LIMITS = {
  query: { windowMs: 60_000, max: 12 },
  media: { windowMs: 60_000, max: 41 },
  partners: { windowMs: 60_000, max: 12 },
  partnersMedia: { windowMs: 60_000, max: 41 },
  members: { windowMs: 60_000, max: 12 },
  membersMedia: { windowMs: 60_000, max: 41 },
  bitacora: { windowMs: 60_000, max: 12 },
  bitacoraMedia: { windowMs: 60_000, max: 41 },
  providers: { windowMs: 60_000, max: 12 },
  providersMedia: { windowMs: 60_000, max: 20 },
  events: { windowMs: 60_000, max: 12 },
  contact: { windowMs: 60_000, max: 3 },
};

const DEFAULT_GATEWAY_HOSTS = [
  "gateway.praxsuite.com",
  "api.praxsuite.com",
];

const DEFAULT_MEDIA_HOSTS = [
  "gateway.praxsuite.com",
  "api.praxsuite.com",
  "portal.praxsuite.com",
];

function clearLegacyLoadQuota() {
  try {
    sessionStorage.removeItem(LEGACY_LOAD_QUOTA_KEY);
  } catch {
    // ignore
  }
}

clearLegacyLoadQuota();

function readReloadQuotaStore() {
  try {
    const raw = sessionStorage.getItem(RELOAD_QUOTA_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeReloadQuotaStore(store) {
  try {
    sessionStorage.setItem(RELOAD_QUOTA_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function getReloadRecord(module) {
  const store = readReloadQuotaStore();
  const record = store[module];
  const now = Date.now();

  if (!record || now - record.startTime > PRAXSUITE_RELOAD_QUOTA.windowMs) {
    return null;
  }

  return record;
}

export function isPraxsuiteReloadQuotaExceeded(module) {
  const record = getReloadRecord(module);
  if (!record) return false;
  return record.count >= PRAXSUITE_RELOAD_QUOTA.max;
}

function registerPraxsuiteReload(module) {
  const now = Date.now();
  const store = readReloadQuotaStore();
  const record = store[module];

  if (!record || now - record.startTime > PRAXSUITE_RELOAD_QUOTA.windowMs) {
    store[module] = { count: 1, startTime: now };
    writeReloadQuotaStore(store);
    return true;
  }

  if (record.count >= PRAXSUITE_RELOAD_QUOTA.max) {
    return false;
  }

  store[module] = { count: record.count + 1, startTime: record.startTime };
  writeReloadQuotaStore(store);
  return true;
}

const reloadAttemptConsumedThisPage = new Set();

/**
 * true = puede cargar desde PraxSuite en esta recarga; false = mostrar estático.
 * Cuenta como máximo 1 intento por F5 (Strict Mode). La ventana se reinicia cada minuto.
 */
export function canLoadFromPraxsuite(module) {
  if (reloadAttemptConsumedThisPage.has(module)) {
    return !isPraxsuiteReloadQuotaExceeded(module);
  }

  reloadAttemptConsumedThisPage.add(module);
  return registerPraxsuiteReload(module);
}

function readRateLimitStore() {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRateLimitStore(store) {
  try {
    sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota o modo privado estricto
  }
}

export const PraxsuiteErrorCode = {
  RATE_LIMIT: "RATE_LIMIT",
  URL_NOT_ALLOWED: "URL_NOT_ALLOWED",
  API_ERROR: "API_ERROR",
};

export class PraxsuiteClientError extends Error {
  constructor(code, userMessage) {
    super(userMessage);
    this.name = "PraxsuiteClientError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

function env(name) {
  return (process.env[name] || "").trim();
}

function parseHostList(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

function getExtraHosts(envName) {
  return parseHostList(env(envName));
}

export function getAllowedGatewayHosts() {
  return [...new Set([...DEFAULT_GATEWAY_HOSTS, ...getExtraHosts("REACT_APP_PRAXSUITE_GATEWAY_HOST_ALLOWLIST")])];
}

export function getAllowedMediaHosts() {
  return [...new Set([...DEFAULT_MEDIA_HOSTS, ...getExtraHosts("REACT_APP_PRAXSUITE_MEDIA_HOST_ALLOWLIST")])];
}

function hostMatchesAllowlist(hostname, allowlist) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;

  return allowlist.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1);
      return host === allowed.slice(2) || host.endsWith(suffix);
    }
    return host === allowed;
  });
}

function isAzureBlobHost(hostname) {
  return /\.blob\.core\.windows\.net$/i.test(hostname);
}

export function isSafeHttpUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function assertAllowedGatewayUrl(url) {
  if (!isSafeHttpUrl(url)) {
    throw new PraxsuiteClientError(
      PraxsuiteErrorCode.URL_NOT_ALLOWED,
      "Invalid request.",
    );
  }

  const { hostname } = new URL(url.trim());
  if (!hostMatchesAllowlist(hostname, getAllowedGatewayHosts())) {
    throw new PraxsuiteClientError(
      PraxsuiteErrorCode.URL_NOT_ALLOWED,
      "Invalid request.",
    );
  }
}

export function isAllowedMediaUrl(url) {
  if (!isSafeHttpUrl(url)) return false;

  const { hostname } = new URL(url.trim());
  if (isAzureBlobHost(hostname)) return true;
  return hostMatchesAllowlist(hostname, getAllowedMediaHosts());
}

export function assertAllowedMediaUrl(url) {
  if (!isAllowedMediaUrl(url)) {
    throw new PraxsuiteClientError(
      PraxsuiteErrorCode.URL_NOT_ALLOWED,
      "Invalid request.",
    );
  }
}

export function assertClientRateLimit(bucket) {
  const config = RATE_LIMITS[bucket];
  if (!config) return;

  const now = Date.now();
  const store = readRateLimitStore();
  const record = store[bucket];

  if (!record || now - record.startTime > config.windowMs) {
    store[bucket] = { count: 1, startTime: now };
    writeRateLimitStore(store);
    return;
  }

  if (record.count >= config.max) {
    throw new PraxsuiteClientError(
      PraxsuiteErrorCode.RATE_LIMIT,
      "Too many requests. Please wait a moment and try again.",
    );
  }

  store[bucket] = { count: record.count + 1, startTime: record.startTime };
  writeRateLimitStore(store);
}

export function logPraxsuiteError(context, error, details) {
  const payload = {
    context,
    code: error?.code,
    message: error?.message,
    ...details,
  };
  console.warn("[PraxSuite]", payload);
}

export function throwPraxsuiteApiError(context, status, responseText) {
  logPraxsuiteError(context, null, {
    status,
    responsePreview: String(responseText || "").slice(0, 200),
  });
  throw new PraxsuiteClientError(
    PraxsuiteErrorCode.API_ERROR,
    "Service temporarily unavailable.",
  );
}
