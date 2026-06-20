import { getPraxsuiteEventsConfig } from "../../config/appConfig";
import { fetchPraxsuiteTable } from "./praxsuiteApi";
import { assertClientRateLimit, logPraxsuiteError } from "./praxsuiteSecurity";

const EVENTS_ROWS_CACHE_TTL_MS = 4000;

let eventsRowsCache = {
  rows: null,
  timestamp: 0,
};

export async function fetchEventsRows({ force = false } = {}) {
  const cfg = getPraxsuiteEventsConfig();
  const now = Date.now();

  if (
    !force &&
    eventsRowsCache.rows &&
    now - eventsRowsCache.timestamp < EVENTS_ROWS_CACHE_TTL_MS
  ) {
    return eventsRowsCache.rows;
  }

  assertClientRateLimit("events");

  try {
    const rows = await fetchPraxsuiteTable(
      cfg.queryUrl,
      cfg.table,
      cfg.ref,
      cfg.apiKey,
      { skipRateLimit: true },
    );

    eventsRowsCache = { rows, timestamp: now };
    return rows;
  } catch (error) {
    logPraxsuiteError("fetchEventsRows", error);

    if (eventsRowsCache.rows) {
      return eventsRowsCache.rows;
    }

    throw error;
  }
}

export function clearEventsRowsCache() {
  eventsRowsCache = { rows: null, timestamp: 0 };
}
