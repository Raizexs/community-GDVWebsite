import { shouldLoadEventsFromPraxsuite } from "../../config/appConfig";
import { getStaticEvents } from "../../data/eventsData";
import { resolveLocalizedValue } from "../../utils/localization";
import { fetchEventsRows } from "../praxsuite/praxsuiteEvents";
import {
  canLoadFromPraxsuite,
  logPraxsuiteError,
} from "../praxsuite/praxsuiteSecurity";

const EVENTS_UI_CACHE_TTL_MS = 4000;

let eventsUiCache = {
  data: null,
  timestamp: 0,
};
let pendingEventsRequest = null;

function parseBoolean(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (value == null || value === "") return defaultValue;

  const normalized = String(value).trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "si" ||
    normalized === "sí"
  );
}

function pickField(raw, keys) {
  for (const key of keys) {
    const value = raw?.[key];
    if (value != null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function normalizeLocalizedField(raw, esKeys, enKeys) {
  const es = pickField(raw, esKeys);
  const en = pickField(raw, enKeys);
  if (es || en) {
    return { es: es || en, en: en || es };
  }
  return { es: "", en: "" };
}

function normalizeDateTime(raw) {
  const value =
    raw?.["Starts At"] ||
    raw?.startsAt ||
    raw?.StartsAt ||
    raw?.Date ||
    raw?.date ||
    "";

  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString();
}

function normalizeRegistrationUrl(raw) {
  let url = String(raw || "").trim();
  if (!url || url === "#" || url === "-") return "";

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/+/, "")}`;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

function normalizeEventRecord(raw) {
  const title = normalizeLocalizedField(raw, ["Title ES", "titleEs"], [
    "Title EN",
    "titleEn",
  ]);
  const description = normalizeLocalizedField(
    raw,
    ["Description ES", "descriptionEs"],
    ["Description EN", "descriptionEn"],
  );
  const location = normalizeLocalizedField(raw, ["Location ES", "locationEs"], [
    "Location EN",
    "locationEn",
  ]);

  const id =
    String(raw?.ID || raw?.id || "").trim() ||
    `event-${title.es || title.en}`.toLowerCase().replace(/\s+/g, "-");

  const startsAt = normalizeDateTime(raw);

  return {
    id,
    title,
    description,
    location,
    startsAt,
    registrationUrl: normalizeRegistrationUrl(
      pickField(raw, [
        "Registration URL",
        "registrationUrl",
        "Website",
        "website",
      ]),
    ),
    registrationOpen: parseBoolean(
      raw?.["Registration Open"] ?? raw?.registrationOpen ?? raw?.Open,
      false,
    ),
    actionUrl: pickField(raw, [
      "Action URL",
      "actionUrl",
      "Secondary Action URL",
      "secondaryActionUrl",
    ]),
    actionLabel: normalizeLocalizedField(
      raw,
      ["Action Label ES", "actionLabelEs"],
      ["Action Label EN", "actionLabelEn"],
    ),
    isOnline: parseBoolean(
      raw?.["Is Online"] ?? raw?.isOnline ?? raw?.Online,
      false,
    ),
  };
}

function localizeEvent(event, language) {
  return {
    ...event,
    title: resolveLocalizedValue(event.title, language),
    description: resolveLocalizedValue(event.description, language),
    location: resolveLocalizedValue(event.location, language),
    actionLabel: resolveLocalizedValue(event.actionLabel, language),
    startsAtMs: new Date(event.startsAt).getTime(),
  };
}

function filterUpcoming(events, language) {
  const now = Date.now();

  return events
    .map((event) => localizeEvent(event, language))
    .filter((event) => event.title && !Number.isNaN(event.startsAtMs))
    .filter((event) => event.startsAtMs >= now)
    .sort((a, b) => a.startsAtMs - b.startsAtMs);
}

async function loadEventsFromPraxsuite({ force = false } = {}) {
  const rows = await fetchEventsRows({ force });
  const normalized = rows.map((raw) => normalizeEventRecord(raw));
  const withDates = normalized.filter(
    (event) => event.startsAt && (event.title.es || event.title.en),
  );

  if (!withDates.length) {
    return getStaticEvents();
  }

  return withDates;
}

export function getStaticEventsFallback() {
  return getStaticEvents();
}

export async function fetchUpcomingEvents({ language = "es", force = false } = {}) {
  const now = Date.now();
  if (
    !force &&
    eventsUiCache.data &&
    now - eventsUiCache.timestamp < EVENTS_UI_CACHE_TTL_MS
  ) {
    return filterUpcoming(eventsUiCache.data, language);
  }

  if (!shouldLoadEventsFromPraxsuite()) {
    const raw = getStaticEventsFallback();
    eventsUiCache = { data: raw, timestamp: Date.now() };
    pendingEventsRequest = null;
    return filterUpcoming(raw, language);
  }

  if (!canLoadFromPraxsuite("events")) {
    return filterUpcoming(getStaticEventsFallback(), language);
  }

  if (pendingEventsRequest) {
    const cached = await pendingEventsRequest;
    return filterUpcoming(cached, language);
  }

  pendingEventsRequest = (async () => {
    try {
      const data = await loadEventsFromPraxsuite({ force });
      eventsUiCache = { data, timestamp: Date.now() };
      return data;
    } finally {
      pendingEventsRequest = null;
    }
  })();

  try {
    const data = await pendingEventsRequest;
    return filterUpcoming(data, language);
  } catch (error) {
    logPraxsuiteError("fetchUpcomingEvents", error);

    if (eventsUiCache.data?.length) {
      return filterUpcoming(eventsUiCache.data, language);
    }

    return filterUpcoming(getStaticEventsFallback(), language);
  }
}

export async function getNextCommunityEvent(options = {}) {
  const upcoming = await fetchUpcomingEvents(options);
  return upcoming[0] || null;
}
