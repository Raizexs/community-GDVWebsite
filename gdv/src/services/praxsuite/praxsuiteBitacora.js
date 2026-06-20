import { getPraxsuiteBitacoraConfig } from "../../config/appConfig";
import { fetchPraxsuiteTable } from "./praxsuiteApi";
import { assertClientRateLimit, logPraxsuiteError } from "./praxsuiteSecurity";

const BITACORA_ROWS_CACHE_TTL_MS = 4000;

let bitacoraRowsCache = {
  rows: null,
  timestamp: 0,
};

function env(name) {
  return (process.env[name] || "").trim();
}

export function getBitacoraApiKeys() {
  const cfg = getPraxsuiteBitacoraConfig();
  const sharedKey = env("REACT_APP_PRAXSUITE_PUBLIC_KEY");
  return [...new Set([cfg.apiKey, sharedKey].filter(Boolean))];
}

export async function fetchBitacoraRows({ force = false } = {}) {
  const cfg = getPraxsuiteBitacoraConfig();
  const now = Date.now();

  if (
    !force &&
    bitacoraRowsCache.rows &&
    now - bitacoraRowsCache.timestamp < BITACORA_ROWS_CACHE_TTL_MS
  ) {
    return bitacoraRowsCache.rows;
  }

  assertClientRateLimit("bitacora");

  try {
    const rows = await fetchPraxsuiteTable(
      cfg.queryUrl,
      cfg.table,
      cfg.ref,
      cfg.apiKey,
      { skipRateLimit: true },
    );

    bitacoraRowsCache = { rows, timestamp: now };
    return rows;
  } catch (error) {
    logPraxsuiteError("fetchBitacoraRows", error);

    if (bitacoraRowsCache.rows) {
      return bitacoraRowsCache.rows;
    }

    throw error;
  }
}

export function clearBitacoraRowsCache() {
  bitacoraRowsCache = { rows: null, timestamp: 0 };
}
