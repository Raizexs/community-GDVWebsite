import { getPraxsuitePartnersConfig } from "../../config/appConfig";
import { fetchPraxsuiteTable } from "./praxsuiteApi";
import { assertClientRateLimit, logPraxsuiteError } from "./praxsuiteSecurity";

const PARTNERS_ROWS_CACHE_TTL_MS = 4000;

let partnersRowsCache = {
  rows: null,
  timestamp: 0,
};

function env(name) {
  return (process.env[name] || "").trim();
}

export function getPartnersApiKeys() {
  const cfg = getPraxsuitePartnersConfig();
  const sharedKey = env("REACT_APP_PRAXSUITE_PUBLIC_KEY");
  return [...new Set([cfg.apiKey, sharedKey].filter(Boolean))];
}

export async function fetchPartnersRows({ force = false } = {}) {
  const cfg = getPraxsuitePartnersConfig();
  const now = Date.now();

  if (
    !force &&
    partnersRowsCache.rows &&
    now - partnersRowsCache.timestamp < PARTNERS_ROWS_CACHE_TTL_MS
  ) {
    return partnersRowsCache.rows;
  }

  assertClientRateLimit("partners");

  try {
    const rows = await fetchPraxsuiteTable(
      cfg.queryUrl,
      cfg.table,
      cfg.ref,
      cfg.apiKey,
      { skipRateLimit: true },
    );

    partnersRowsCache = { rows, timestamp: now };
    return rows;
  } catch (error) {
    logPraxsuiteError("fetchPartnersRows", error);

    if (partnersRowsCache.rows) {
      return partnersRowsCache.rows;
    }

    throw error;
  }
}

export function clearPartnersRowsCache() {
  partnersRowsCache = { rows: null, timestamp: 0 };
}
