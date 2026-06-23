import { getPraxsuiteProvidersConfig } from "../../config/appConfig";
import { fetchPraxsuiteTable } from "./praxsuiteApi";
import { assertClientRateLimit, logPraxsuiteError } from "./praxsuiteSecurity";

const PROVIDERS_ROWS_CACHE_TTL_MS = 4000;

let providersRowsCache = {
  rows: null,
  timestamp: 0,
};

function env(name) {
  return (process.env[name] || "").trim();
}

export function getProvidersApiKeys() {
  const cfg = getPraxsuiteProvidersConfig();
  const sharedKey = env("REACT_APP_PRAXSUITE_PUBLIC_KEY");
  return [...new Set([cfg.apiKey, sharedKey].filter(Boolean))];
}

export async function fetchProvidersRows({ force = false } = {}) {
  const cfg = getPraxsuiteProvidersConfig();
  const now = Date.now();

  if (
    !force &&
    providersRowsCache.rows &&
    now - providersRowsCache.timestamp < PROVIDERS_ROWS_CACHE_TTL_MS
  ) {
    return providersRowsCache.rows;
  }

  assertClientRateLimit("providers");

  try {
    const rows = await fetchPraxsuiteTable(
      cfg.queryUrl,
      cfg.table,
      cfg.ref,
      cfg.apiKey,
      { skipRateLimit: true },
    );

    providersRowsCache = { rows: Array.isArray(rows) ? rows : [], timestamp: now };
    return providersRowsCache.rows;
  } catch (error) {
    logPraxsuiteError("fetchProvidersRows", error);

    if (providersRowsCache.rows) {
      return providersRowsCache.rows;
    }

    throw error;
  }
}

export function clearProvidersRowsCache() {
  providersRowsCache = { rows: null, timestamp: 0 };
}
