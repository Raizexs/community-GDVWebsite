import { shouldLoadEventsFromPraxsuite } from "../../config/appConfig";
import { getStaticEvents } from "../../data/eventsData";
import {
  normalizeEventStartsAt,
  parseEventStartsAtMs,
} from "../../utils/bitacoraFormat";
import { resolveLocalizedValue } from "../../utils/localization";
import { fetchEventsRows, clearEventsRowsCache } from "../praxsuite/praxsuiteEvents";
import {
  canLoadFromPraxsuite,
  logPraxsuiteError,
} from "../praxsuite/praxsuiteSecurity";

const EVENTS_UI_CACHE_TTL_MS = 4000;

let eventsUiCache = {
  events: null,
  fromPraxsuite: false,
  timestamp: 0,
};
let pendingEventsRequest = null;

function parseBoolean(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (value == null || value === "") return defaultValue;

  if (typeof value === "object") {
    if ("value" in value) return parseBoolean(value.value, defaultValue);
    if ("checked" in value) return parseBoolean(value.checked, defaultValue);
    if ("enabled" in value) return parseBoolean(value.enabled, defaultValue);
    if ("active" in value) return parseBoolean(value.active, defaultValue);
    if ("label" in value) return parseBoolean(value.label, defaultValue);
    if ("text" in value) return parseBoolean(value.text, defaultValue);
  }

  const normalized = String(value).trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "si" ||
    normalized === "sí" ||
    normalized === "on" ||
    normalized === "verdadero"
  );
}

function coerceScalarField(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    if (value.url) return value.url;
    if (value.href) return value.href;
    if (value.link) return value.link;
    if (value.value != null && value.value !== "") return value.value;
    if (value.date) return value.date;
    if (value.iso) return value.iso;
  }
  return value;
}

function readRawField(raw, keys, pattern) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(raw || {}, key)) {
      const value = raw[key];
      if (value != null && value !== "") {
        return value;
      }
      if (value === false || value === 0) {
        return value;
      }
    }
  }

  if (raw && typeof raw === "object") {
    for (const key of Object.keys(raw)) {
      if (!pattern.test(key)) continue;
      const value = raw[key];
      if (value != null && value !== "") {
        return value;
      }
      if (value === false || value === 0) {
        return value;
      }
    }
  }

  return null;
}

function pickField(raw, keys) {
  for (const key of keys) {
    const value = coerceScalarField(raw?.[key]);
    if (value == null || value === "") continue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value;
    if (String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function pickFieldByPattern(raw, pattern) {
  if (!raw || typeof raw !== "object") return "";

  for (const key of Object.keys(raw)) {
    if (!pattern.test(key)) continue;
    const value = coerceScalarField(raw[key]);
    if (value == null || value === "") continue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value;
    if (typeof value === "object") return value;
    if (String(value).trim() !== "") return value;
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

function normalizeSharedLocation(raw) {
  const value = pickField(raw, [
    "Location",
    "location",
    "Location ES",
    "locationEs",
    "Location EN",
    "locationEn",
  ]);
  if (!value) {
    return { es: "", en: "" };
  }
  return { es: value, en: value };
}

function normalizeDateTime(raw) {
  const value =
    pickField(raw, [
      "Starts At",
      "startsAt",
      "StartsAt",
      "Date",
      "date",
      "Start Date",
      "startDate",
    ]) || pickFieldByPattern(raw, /^starts?\s*at$/i);

  return normalizeEventStartsAt(value);
}

function isUpcomingEvent(startsAtMs) {
  const eventDate = new Date(startsAtMs);
  if (Number.isNaN(eventDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  );

  return eventDay >= today;
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

function extractUrlFromValue(value) {
  if (value == null || value === "") return "";

  if (typeof value === "object") {
    const candidate =
      value.url || value.href || value.link || value.value || value.text;
    return normalizeRegistrationUrl(candidate);
  }

  const str = String(value).trim();
  if (str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str);
      return normalizeRegistrationUrl(
        parsed?.url || parsed?.href || parsed?.link,
      );
    } catch {
      return normalizeRegistrationUrl(str);
    }
  }

  return normalizeRegistrationUrl(str);
}

function parseRegistrationUrl(raw) {
  const value = readRawField(
    raw,
    [
      "Registration URL",
      "Registration Url",
      "RegistrationURL",
      "registrationUrl",
      "registration_url",
      "Registration_URL",
      "Website",
      "website",
    ],
    /^registration\s*url$/i,
  );

  return extractUrlFromValue(value);
}

function parseRegistrationOpen(raw) {
  const value = readRawField(
    raw,
    [
      "Registration Open",
      "Registration open",
      "RegistrationOpen",
      "registrationOpen",
      "registration_open",
      "Registration_Open",
    ],
    /^registration\s*open$/i,
  );

  if (value === null || value === undefined) {
    return false;
  }

  return parseBoolean(value, false);
}

function isRegistrationOpen(value) {
  return parseBoolean(value, false);
}

export function isEventRegistrationActive(event) {
  return Boolean(
    event?.registrationUrl && isRegistrationOpen(event?.registrationOpen),
  );
}

function normalizeEventRecord(raw) {
  const title = normalizeLocalizedField(
    raw,
    ["Title (ES)", "Title ES", "titleEs", "title_es"],
    ["Title (EN)", "Title EN", "titleEn", "title_en"],
  );
  const description = normalizeLocalizedField(
    raw,
    [
      "Description (ES)",
      "Description ES",
      "descriptionEs",
      "description_es",
    ],
    [
      "Description (EN)",
      "Description EN",
      "descriptionEn",
      "description_en",
    ],
  );
  const location = normalizeSharedLocation(raw);

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
    registrationUrl: parseRegistrationUrl(raw),
    registrationOpen: parseRegistrationOpen(raw),
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
    startsAt: event.startsAt,
    registrationUrl: event.registrationUrl || "",
    registrationOpen: isRegistrationOpen(event.registrationOpen),
    startsAtMs: parseEventStartsAtMs(event.startsAt),
  };
}

function filterUpcoming(events, language) {
  return events
    .map((event) => localizeEvent(event, language))
    .filter((event) => event.title && !Number.isNaN(event.startsAtMs))
    .filter((event) => isUpcomingEvent(event.startsAtMs))
    .sort((a, b) => a.startsAtMs - b.startsAtMs);
}

function normalizeEventsPayload(payload) {
  if (Array.isArray(payload)) {
    return { events: payload, fromPraxsuite: false };
  }

  return {
    events: Array.isArray(payload?.events) ? payload.events : [],
    fromPraxsuite: Boolean(payload?.fromPraxsuite),
  };
}

function resolveUpcomingEvents(eventsPayload, language) {
  const { events, fromPraxsuite } = normalizeEventsPayload(eventsPayload);
  const upcoming = filterUpcoming(events, language);

  if (fromPraxsuite) {
    return upcoming;
  }

  if (upcoming.length) {
    return upcoming;
  }

  return filterUpcoming(getStaticEventsFallback(), language);
}

async function loadEventsFromPraxsuite({ force = false } = {}) {
  try {
    const rows = await fetchEventsRows({ force });
    if (!Array.isArray(rows) || !rows.length) {
      return { events: [], fromPraxsuite: true };
    }

    const normalized = rows.map((raw) => normalizeEventRecord(raw));
    const valid = normalized.filter(
      (event) => event.startsAt && (event.title.es || event.title.en),
    );

    return { events: valid, fromPraxsuite: true };
  } catch (error) {
    logPraxsuiteError("loadEventsFromPraxsuite", error);
    return { events: getStaticEvents(), fromPraxsuite: false };
  }
}

export function getStaticEventsFallback() {
  return getStaticEvents();
}

export function getStaticUpcomingEvents(language = "es") {
  return filterUpcoming(getStaticEventsFallback(), language);
}

export async function fetchUpcomingEvents({ language = "es", force = false } = {}) {
  try {
    if (force) {
      clearEventsRowsCache();
      eventsUiCache = { events: null, fromPraxsuite: false, timestamp: 0 };
    }

    const now = Date.now();
    if (
      !force &&
      eventsUiCache.events &&
      now - eventsUiCache.timestamp < EVENTS_UI_CACHE_TTL_MS
    ) {
      return resolveUpcomingEvents(eventsUiCache, language);
    }

    if (!shouldLoadEventsFromPraxsuite()) {
      const payload = { events: getStaticEventsFallback(), fromPraxsuite: false };
      eventsUiCache = { ...payload, timestamp: Date.now() };
      pendingEventsRequest = null;
      return resolveUpcomingEvents(payload, language);
    }

    if (!canLoadFromPraxsuite("events")) {
      return resolveUpcomingEvents(
        { events: getStaticEventsFallback(), fromPraxsuite: false },
        language,
      );
    }

    if (!pendingEventsRequest) {
      pendingEventsRequest = (async () => {
        try {
          const payload = await loadEventsFromPraxsuite({ force });
          eventsUiCache = { ...payload, timestamp: Date.now() };
          return payload;
        } catch (error) {
          logPraxsuiteError("fetchUpcomingEvents.load", error);
          const payload = {
            events: getStaticEventsFallback(),
            fromPraxsuite: false,
          };
          eventsUiCache = { ...payload, timestamp: Date.now() };
          return payload;
        } finally {
          pendingEventsRequest = null;
        }
      })();
    }

    const payload = await pendingEventsRequest;
    return resolveUpcomingEvents(payload, language);
  } catch (error) {
    logPraxsuiteError("fetchUpcomingEvents", error);

    if (eventsUiCache.events?.length) {
      return resolveUpcomingEvents(eventsUiCache, language);
    }

    return resolveUpcomingEvents(
      { events: getStaticEventsFallback(), fromPraxsuite: false },
      language,
    );
  }
}

export async function getNextCommunityEvent(options = {}) {
  const upcoming = await fetchUpcomingEvents(options);
  return upcoming[0] || null;
}
