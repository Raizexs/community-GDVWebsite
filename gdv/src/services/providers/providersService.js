import { shouldLoadProvidersFromPraxsuite } from "../../config/appConfig";
import {
  getStaticProviders,
  getProviderImage,
  resolveProviderHeaderClass,
  staticProviders,
} from "../../data/providersData";
import {
  fetchProvidersRows,
  getProvidersApiKeys,
} from "../praxsuite/praxsuiteProviders";
import { resolveDisplayableMediaUrl } from "../praxsuite/praxsuiteMedia";
import {
  canLoadFromPraxsuite,
  logPraxsuiteError,
} from "../praxsuite/praxsuiteSecurity";

const PROVIDERS_UI_CACHE_TTL_MS = 4000;

const STATIC_BY_SLUG = Object.fromEntries(
  staticProviders.map((provider) => [provider.id, provider]),
);

const PROVIDER_SLUG_ALIASES = {
  "chilegames-database": "chile-games-database",
  praxsuite: "praxsuite",
  expertoscontables: "expertos-contables",
};

function normalizeProviderSlug(value) {
  const slug = slugify(value);
  return PROVIDER_SLUG_ALIASES[slug] || slug;
}

function resolveProviderId(raw, name) {
  const slug = normalizeProviderSlug(pickField(raw, ["Slug", "slug"]));
  if (slug && STATIC_BY_SLUG[slug]) return slug;

  const normalizedName = slugify(name.es || name.en);
  const byName = staticProviders.find(
    (provider) => slugify(provider.name.es || provider.name.en) === normalizedName,
  );
  if (byName) return byName.id;

  return (
    slug ||
    normalizedName ||
    String(raw?.ID || raw?.id || "").trim() ||
    `provider-${Math.random().toString(36).slice(2, 8)}`
  );
}

let providersUiCache = {
  data: null,
  timestamp: 0,
};
let pendingProvidersRequest = null;

function parseBoolean(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (value == null || value === "") return defaultValue;

  const normalized = String(value).trim().toLowerCase();
  return !(
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no"
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

function normalizeWebsiteUrl(raw) {
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

function parseSupplierUrl(raw) {
  const value =
    raw?.["Supplier URL"] ||
    raw?.supplierUrl ||
    raw?.Website ||
    raw?.website ||
    raw?.URL ||
    raw?.url;

  if (!value) return "";

  if (typeof value === "object" && value.url) {
    return normalizeWebsiteUrl(value.url);
  }

  const str = String(value).trim();
  if (str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str);
      return normalizeWebsiteUrl(parsed?.url);
    } catch {
      return normalizeWebsiteUrl(str);
    }
  }

  return normalizeWebsiteUrl(str);
}

function hasLocalizedText(value) {
  return Boolean(value?.es?.trim() || value?.en?.trim());
}

function normalizeCategory(raw) {
  const value = String(
    raw?.Category || raw?.category || raw?.Tipo || "devTools",
  ).trim();

  const normalized = value.replace(/\s+/g, "");
  if (normalized === "legalaccounting" || normalized === "legal") {
    return "legalAccounting";
  }
  if (normalized === "devtools" || normalized === "dev") return "devTools";
  return value || "devTools";
}

function normalizeProvider(raw, logo = "") {
  const name = normalizeLocalizedField(
    raw,
    ["Title (ES)", "Name ES", "nameEs", "name_es"],
    ["Title (EN)", "Name EN", "nameEn", "name_en"],
  );
  const description = normalizeLocalizedField(
    raw,
    ["Description (ES)", "Description ES", "descriptionEs", "description_es"],
    ["Description (EN)", "Description EN", "descriptionEn", "description_en"],
  );
  const tag = normalizeLocalizedField(
    raw,
    ["Tag (ES)", "Tag ES", "tagEs", "tag_es"],
    ["Tag (EN)", "Tag EN", "tagEn", "tag_en"],
  );

  const category = normalizeCategory(raw);
  const headerClass = resolveProviderHeaderClass(
    category,
    pickField(raw, ["Header Class", "headerClass", "HeaderClass"]),
  );

  const id = resolveProviderId(raw, name);

  return {
    id,
    category,
    headerClass,
    name,
    tag,
    description,
    logo,
    website: parseSupplierUrl(raw),
    isActive: parseBoolean(raw?.["Is Active"] ?? raw?.isActive ?? raw?.Active),
  };
}

function enrichFromStatic(provider) {
  const known = STATIC_BY_SLUG[provider.id];
  if (!known) return provider;

  return {
    ...provider,
    category: known.category || provider.category,
    headerClass: known.headerClass || provider.headerClass,
    name: hasLocalizedText(provider.name) ? provider.name : known.name,
    tag: hasLocalizedText(provider.tag) ? provider.tag : known.tag,
    description: hasLocalizedText(provider.description)
      ? provider.description
      : known.description,
    website: provider.website || known.website,
  };
}

async function normalizeProviderRow(raw, apiKeys) {
  const imageField =
    raw?.["Supplier File"] ||
    raw?.supplierFile ||
    pickField(raw, ["Logo", "logo", "Logo URL", "logoUrl"]);

  const logo = await resolveDisplayableMediaUrl(imageField, apiKeys, {
    rateLimitBucket: "providersMedia",
  });

  return enrichFromStatic(normalizeProvider(raw, logo || ""));
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function applyProviderImageFallback(provider) {
  return {
    ...provider,
    logo: provider.logo || getProviderImage(provider.id) || "",
  };
}

async function loadProvidersFromPraxsuite({ force = false } = {}) {
  const apiKeys = getProvidersApiKeys();
  const rows = await fetchProvidersRows({ force });
  const normalized = await Promise.all(
    rows.map((raw) => normalizeProviderRow(raw, apiKeys)),
  );
  const withImages = normalized.map(applyProviderImageFallback);
  const active = withImages.filter(
    (provider) =>
      (provider.name.es || provider.name.en) && provider.isActive !== false,
  );

  if (!active.length) {
    return getStaticProviders();
  }

  return active;
}

export function getStaticProvidersFallback() {
  return getStaticProviders();
}

export async function fetchProviders({ force = false } = {}) {
  if (!shouldLoadProvidersFromPraxsuite()) {
    const fallback = getStaticProvidersFallback();
    providersUiCache = { data: fallback, timestamp: Date.now() };
    pendingProvidersRequest = null;
    return fallback;
  }

  const now = Date.now();
  if (
    !force &&
    providersUiCache.data &&
    now - providersUiCache.timestamp < PROVIDERS_UI_CACHE_TTL_MS
  ) {
    return providersUiCache.data;
  }

  if (!canLoadFromPraxsuite("providers")) {
    return getStaticProvidersFallback();
  }

  if (pendingProvidersRequest) {
    return pendingProvidersRequest;
  }

  pendingProvidersRequest = (async () => {
    try {
      const data = await loadProvidersFromPraxsuite({ force });
      providersUiCache = { data, timestamp: Date.now() };
      return data;
    } finally {
      pendingProvidersRequest = null;
    }
  })();

  try {
    return await pendingProvidersRequest;
  } catch (error) {
    logPraxsuiteError("fetchProviders", error);

    if (providersUiCache.data?.length) {
      return providersUiCache.data;
    }

    return getStaticProvidersFallback();
  }
}
