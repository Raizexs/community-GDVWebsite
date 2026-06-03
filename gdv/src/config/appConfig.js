/**
 * Variables de entorno (3 para producción):
 *   REACT_APP_PRAXSUITE_QUERY_URL
 *   REACT_APP_PRAXSUITE_TABLES   JSON: ref + key por módulo (no commitear)
 *   REACT_APP_TURNSTILE_SITE_KEY
 *
 * Compatibilidad: REACT_APP_PRAXSUITE_API_KEYS + REACT_APP_PRAXSUITE_REFS (JSON separados)
 */

const DEFAULT_TABLE_NAMES = {
  games: "VIDEOGAMES",
  platform: "VIDEOGAMES-PLATFORM",
  stores: "VIDEOGAMES-STORES",
  partners: "PARTNERS",
  contact: "CONTACT",
};

const LEGACY_ENV_BY_MODULE = {
  games: {
    ref: "REACT_APP_PRAXSUITE_GAMES_REF",
    key: "REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY",
  },
  platform: {
    ref: "REACT_APP_PRAXSUITE_GAMES_PLATFORM_REF",
    key: "REACT_APP_PRAXSUITE_GAMES_PLATFORM_PUBLIC_KEY",
  },
  stores: {
    ref: "REACT_APP_PRAXSUITE_GAMES_STORES_REF",
    key: "REACT_APP_PRAXSUITE_GAMES_STORES_PUBLIC_KEY",
  },
  partners: {
    ref: "REACT_APP_PRAXSUITE_PARTNERS_REF",
    key: "REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY",
  },
  contact: {
    ref: "REACT_APP_PRAXSUITE_CONTACT_REF",
    key: "REACT_APP_PRAXSUITE_CONTACT_PUBLIC_KEY",
  },
};

function env(name) {
  return (process.env[name] || "").trim();
}

function parseJsonEnv(name) {
  const raw = env(name);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    console.warn(`${name} no es JSON válido.`);
    return null;
  }
}

let cachedModules = null;

function normalizeModuleEntry(name, entry, fallbackKey, fallbackRef) {
  const table = entry?.table || DEFAULT_TABLE_NAMES[name] || name;
  const ref = entry?.ref || fallbackRef || "";
  const key =
    entry?.key || entry?.apiKey || entry?.publicKey || fallbackKey || "";
  return { table, ref, key };
}

function parseModulesFromEnv() {
  if (cachedModules) return cachedModules;

  const fromTables = parseJsonEnv("REACT_APP_PRAXSUITE_TABLES");
  const fromKeys = parseJsonEnv("REACT_APP_PRAXSUITE_API_KEYS");
  const fromRefs = parseJsonEnv("REACT_APP_PRAXSUITE_REFS");
  const sharedKey = env("REACT_APP_PRAXSUITE_PUBLIC_KEY");

  const moduleNames = [
    "games",
    "platform",
    "stores",
    "partners",
    "contact",
  ];

  cachedModules = {};
  for (const name of moduleNames) {
    const tablesEntry =
      fromTables?.[name] && typeof fromTables[name] === "object"
        ? fromTables[name]
        : null;
    const keysEntry = fromKeys?.[name];
    const refsEntry = fromRefs?.[name];

    const legacy = LEGACY_ENV_BY_MODULE[name] || {};
    const legacyKey = env(legacy.key);
    const legacyRef = env(legacy.ref);

    const fallbackKey =
      (typeof keysEntry === "string" ? keysEntry : keysEntry?.key) ||
      legacyKey ||
      sharedKey ||
      "";
    const fallbackRef =
      (typeof refsEntry === "string" ? refsEntry : refsEntry?.ref) ||
      legacyRef ||
      "";

    if (tablesEntry) {
      cachedModules[name] = normalizeModuleEntry(
        name,
        tablesEntry,
        fallbackKey,
        fallbackRef,
      );
    } else if (fallbackKey || fallbackRef) {
      cachedModules[name] = normalizeModuleEntry(
        name,
        {},
        fallbackKey,
        fallbackRef,
      );
    }
  }

  return cachedModules;
}

function getModule(name) {
  const modules = parseModulesFromEnv();
  return modules?.[name] || { table: DEFAULT_TABLE_NAMES[name], ref: "", key: "" };
}

export function getPraxsuiteQueryUrl() {
  return (
    env("REACT_APP_PRAXSUITE_QUERY_URL") ||
    env("REACT_APP_PRAXSUITE_GAMES_QUERY_URL") ||
    env("REACT_APP_PRAXSUITE_PARTNERS_QUERY_URL") ||
    env("REACT_APP_PRAXSUITE_CONTACT_QUERY_URL")
  );
}

export function getPraxsuiteGamesConfig() {
  const queryUrl = getPraxsuiteQueryUrl();
  const games = getModule("games");
  const platform = getModule("platform");
  const stores = getModule("stores");
  return {
    gamesQueryUrl: queryUrl,
    platformQueryUrl: queryUrl,
    storesQueryUrl: queryUrl,
    gamesRef: games.ref,
    gamesKey: games.key,
    platformRef: platform.ref,
    platformKey: platform.key,
    storesRef: stores.ref,
    storesKey: stores.key,
  };
}

export function getPraxsuitePartnersConfig() {
  const partners = getModule("partners");
  return {
    queryUrl: getPraxsuiteQueryUrl(),
    ref: partners.ref,
    apiKey: partners.key,
    table: partners.table,
  };
}

export function getPraxsuiteContactConfig() {
  const contact = getModule("contact");
  return {
    queryUrl: getPraxsuiteQueryUrl(),
    ref: contact.ref,
    apiKey: contact.key,
  };
}

export function isPraxsuiteGamesReady() {
  const c = getPraxsuiteGamesConfig();
  return Boolean(
    c.gamesQueryUrl &&
      c.gamesRef &&
      c.gamesKey &&
      c.platformRef &&
      c.platformKey &&
      c.storesRef &&
      c.storesKey,
  );
}

export function isPraxsuitePartnersReady() {
  const c = getPraxsuitePartnersConfig();
  return Boolean(c.queryUrl && c.ref && c.apiKey);
}

export function isPraxsuiteContactReady() {
  const c = getPraxsuiteContactConfig();
  return Boolean(c.queryUrl && c.ref && c.apiKey);
}

function getDataSource() {
  return (env("REACT_APP_DATA_SOURCE") || "auto").toLowerCase();
}

export function shouldLoadGamesFromPraxsuite() {
  const mode = getDataSource();
  if (mode === "static") return false;
  if (mode === "praxsuite") return isPraxsuiteGamesReady();
  return isPraxsuiteGamesReady();
}

export function shouldLoadPartnersFromPraxsuite() {
  const mode = getDataSource();
  if (mode === "static") return false;
  if (mode === "praxsuite") return isPraxsuitePartnersReady();
  return isPraxsuitePartnersReady();
}

export function getTurnstileSiteKey() {
  return env("REACT_APP_TURNSTILE_SITE_KEY") || "1x00000000000000000000AA";
}

export function getTurnstileTheme() {
  const theme = (env("REACT_APP_TURNSTILE_THEME") || "light").toLowerCase();
  return ["light", "dark", "auto"].includes(theme) ? theme : "light";
}

export function getTurnstileAction() {
  return env("REACT_APP_TURNSTILE_ACTION") || "contact_form";
}
