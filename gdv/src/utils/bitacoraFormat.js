export const BITACORA_FILTER_OPTIONS = [
  "all",
  "actividades",
  "travesia",
  "hito",
  "evento",
];

export function formatBitacoraDate(dateValue, language = "es") {
  if (!dateValue) return "";

  return new Date(`${dateValue}T12:00:00`).toLocaleDateString(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const EVENT_DISPLAY_TIME_ZONE = "America/Santiago";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function naiveIsoFromUtcWallClock(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
}

function naiveIsoFromLocalWallClock(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function naiveIsoInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

export function normalizeEventStartsAt(value) {
  if (value == null || value === "") return "";

  const asString = String(value).trim();
  if (/^\d+(\.\d+)?$/.test(asString)) {
    const serial = Number(asString);
    const utcMs = (serial - 25569) * 86400000;
    const date = new Date(utcMs);
    if (Number.isNaN(date.getTime())) return "";
    return naiveIsoFromUtcWallClock(date);
  }

  if (typeof value === "number") {
    const utcMs = (value - 25569) * 86400000;
    const date = new Date(utcMs);
    if (Number.isNaN(date.getTime())) return "";
    return naiveIsoFromUtcWallClock(date);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  if (/Z$/i.test(asString)) {
    return naiveIsoFromUtcWallClock(parsed);
  }

  if (/[+-]\d{2}:\d{2}$/.test(asString)) {
    return naiveIsoInTimeZone(parsed, EVENT_DISPLAY_TIME_ZONE);
  }

  return naiveIsoFromLocalWallClock(parsed);
}

export function formatEventDateTime(isoValue, language = "es") {
  if (!isoValue) return "";

  const date = parseEventStartsAtDate(isoValue);
  if (Number.isNaN(date.getTime())) return "";

  const isNaiveWallClock = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.test(
    String(isoValue),
  );

  return date.toLocaleString(language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: isNaiveWallClock ? "UTC" : EVENT_DISPLAY_TIME_ZONE,
  });
}

export function parseEventStartsAtDate(isoValue) {
  if (!isoValue) return new Date(NaN);

  const naiveMatch = String(isoValue).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (naiveMatch) {
    return new Date(
      Date.UTC(
        Number(naiveMatch[1]),
        Number(naiveMatch[2]) - 1,
        Number(naiveMatch[3]),
        Number(naiveMatch[4]),
        Number(naiveMatch[5]),
      ),
    );
  }

  return new Date(isoValue);
}

export function parseEventStartsAtMs(isoValue) {
  return parseEventStartsAtDate(isoValue).getTime();
}

export function getCategoryStyle(category) {
  const styles = {
    actividades: "bitacora-filter-actividades",
    travesia: "bitacora-filter-travesia",
    hito: "bitacora-filter-hito",
    evento: "bitacora-filter-evento",
    gremio: "bitacora-filter-actividades",
  };

  return styles[category] || "bitacora-filter-evento";
}
