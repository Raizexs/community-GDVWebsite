import { getPraxsuiteMembersConfig } from "../../config/appConfig";
import { fetchPraxsuiteTable } from "./praxsuiteApi";
import { assertClientRateLimit, logPraxsuiteError } from "./praxsuiteSecurity";

const MEMBERS_ROWS_CACHE_TTL_MS = 4000;

let membersRowsCache = {
  rows: null,
  timestamp: 0,
};

function env(name) {
  return (process.env[name] || "").trim();
}

export function getPartnersApiKeys() {
  const cfg = getPraxsuiteMembersConfig();
  const sharedKey = env("REACT_APP_PRAXSUITE_PUBLIC_KEY");
  return [...new Set([cfg.apiKey, sharedKey].filter(Boolean))];
}

export async function fetchPartnersRows({ force = false } = {}) {
  const cfg = getPraxsuiteMembersConfig();
  const now = Date.now();

  if (
    !force &&
    membersRowsCache.rows &&
    now - membersRowsCache.timestamp < MEMBERS_ROWS_CACHE_TTL_MS
  ) {
    return membersRowsCache.rows;
  }

  assertClientRateLimit("members");

  try {
    const rows = await fetchPraxsuiteTable(
      cfg.queryUrl,
      cfg.table,
      cfg.ref,
      cfg.apiKey,
      { skipRateLimit: true },
    );

    membersRowsCache = { rows, timestamp: now };
    return rows;
  } catch (error) {
    logPraxsuiteError("fetchMembersRows", error);

    if (membersRowsCache.rows) {
      return membersRowsCache.rows;
    }

    throw error;
  }
}

export function clearPartnersRowsCache() {
  membersRowsCache = { rows: null, timestamp: 0 };
}
