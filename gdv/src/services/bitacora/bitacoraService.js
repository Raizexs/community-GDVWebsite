import { shouldLoadBitacoraFromPraxsuite } from "../../config/appConfig";
import { getStaticBitacoraPosts } from "../../data/bitacoraData";
import {
  fetchBitacoraRows,
  getBitacoraApiKeys,
} from "../praxsuite/praxsuiteBitacora";
import { resolveDisplayableMediaUrl } from "../praxsuite/praxsuiteMedia";
import {
  canLoadFromPraxsuite,
  logPraxsuiteError,
} from "../praxsuite/praxsuiteSecurity";

const BITACORA_UI_CACHE_TTL_MS = 4000;

let bitacoraUiCache = {
  data: null,
  timestamp: 0,
};
let pendingBitacoraRequest = null;

const VALID_CATEGORIES = new Set([
  "evento",
  "travesia",
  "hito",
  "actividades",
  "gremio",
]);

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

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function normalizeTags(raw) {
  const value =
    raw?.Tags || raw?.tags || raw?.Tag || raw?.tag || raw?.Labels || "";
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeCategory(raw) {
  const value = String(
    raw?.Category || raw?.category || raw?.Tipo || "gremio",
  )
    .trim()
    .toLowerCase();

  if (VALID_CATEGORIES.has(value)) return value;
  if (value.includes("event")) return "evento";
  if (value.includes("traves") || value.includes("journey")) return "travesia";
  if (value.includes("hito") || value.includes("milestone")) return "hito";
  if (value.includes("activ")) return "actividades";
  return "actividades";
}

function normalizeOptionalLocalized(raw, esKeys, enKeys) {
  const value = normalizeLocalizedField(raw, esKeys, enKeys);
  return value.es || value.en ? value : null;
}

function normalizeDate(raw) {
  const value =
    raw?.["Published At"] ||
    raw?.publishedAt ||
    raw?.PublishedAt ||
    raw?.Date ||
    raw?.date ||
    "";

  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

async function normalizeBitacoraPost(raw, apiKeys) {
  const title = normalizeLocalizedField(raw, ["Title ES", "titleEs", "title_es"], [
    "Title EN",
    "titleEn",
    "title_en",
  ]);
  const excerpt = normalizeLocalizedField(
    raw,
    ["Excerpt ES", "excerptEs", "excerpt_es"],
    ["Excerpt EN", "excerptEn", "excerpt_en"],
  );
  const body = normalizeLocalizedField(raw, ["Body ES", "bodyEs", "body_es"], [
    "Body EN",
    "bodyEn",
    "body_en",
  ]);

  const slug =
    pickField(raw, ["Slug", "slug"]) ||
    slugify(title.es || title.en) ||
    slugify(raw?.ID || raw?.id);

  const imageField =
    raw?.["Cover Image"] ||
    raw?.coverImage ||
    raw?.CoverImage ||
    raw?.image ||
    raw?.Image;

  const coverImage = await resolveDisplayableMediaUrl(imageField, apiKeys, {
    rateLimitBucket: "bitacoraMedia",
  });

  const id = String(raw?.ID || raw?.id || slug || "").trim() || slug;

  return {
    id,
    slug,
    title,
    subtitle: normalizeOptionalLocalized(
      raw,
      ["Subtitle ES", "subtitleEs"],
      ["Subtitle EN", "subtitleEn"],
    ),
    author: normalizeOptionalLocalized(
      raw,
      ["Author ES", "authorEs"],
      ["Author EN", "authorEn"],
    ),
    excerpt,
    body,
    aboutEvent: normalizeOptionalLocalized(
      raw,
      ["About Event ES", "aboutEventEs"],
      ["About Event EN", "aboutEventEn"],
    ),
    highlightFact: normalizeOptionalLocalized(
      raw,
      ["Highlight Fact ES", "highlightFactEs"],
      ["Highlight Fact EN", "highlightFactEn"],
    ),
    eventDetails: raw?.eventDetails || null,
    organization: normalizeOptionalLocalized(
      raw,
      ["Organization ES", "organizationEs"],
      ["Organization EN", "organizationEn"],
    ),
    collaborators: Array.isArray(raw?.collaborators)
      ? raw.collaborators
      : String(raw?.Collaborators || "")
          .split(/[,;|]/)
          .map((item) => item.trim())
          .filter(Boolean),
    regionalImpact: normalizeOptionalLocalized(
      raw,
      ["Regional Impact ES", "regionalImpactEs"],
      ["Regional Impact EN", "regionalImpactEn"],
    ),
    coverCaption: normalizeOptionalLocalized(
      raw,
      ["Cover Caption ES", "coverCaptionEs"],
      ["Cover Caption EN", "coverCaptionEn"],
    ),
    gallery: Array.isArray(raw?.gallery) ? raw.gallery : [],
    publishedAt: normalizeDate(raw),
    category: normalizeCategory(raw),
    coverImage: coverImage || null,
    tags: normalizeTags(raw),
    featured: parseBoolean(
      raw?.Featured ?? raw?.featured ?? raw?.Destacado,
      false,
    ),
    published: parseBoolean(
      raw?.Published ?? raw?.published ?? raw?.Publicado,
      true,
    ),
  };
}

function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    const dateA = a.publishedAt || "";
    const dateB = b.publishedAt || "";
    return dateB.localeCompare(dateA);
  });
}

async function loadBitacoraFromPraxsuite({ force = false } = {}) {
  const apiKeys = getBitacoraApiKeys();
  const rows = await fetchBitacoraRows({ force });
  const normalized = await Promise.all(
    rows.map((raw) => normalizeBitacoraPost(raw, apiKeys)),
  );

  const published = normalized.filter(
    (post) =>
      post.slug &&
      (post.title.es || post.title.en) &&
      post.published !== false,
  );

  if (!published.length) {
    return getStaticBitacoraPosts();
  }

  return sortPosts(published);
}

export function getStaticBitacoraFallback() {
  return sortPosts(getStaticBitacoraPosts());
}

export async function fetchBitacoraPosts({ force = false } = {}) {
  if (!shouldLoadBitacoraFromPraxsuite()) {
    const fallback = getStaticBitacoraFallback();
    bitacoraUiCache = { data: fallback, timestamp: Date.now() };
    pendingBitacoraRequest = null;
    return fallback;
  }

  const now = Date.now();
  if (
    !force &&
    bitacoraUiCache.data &&
    now - bitacoraUiCache.timestamp < BITACORA_UI_CACHE_TTL_MS
  ) {
    return bitacoraUiCache.data;
  }

  if (!canLoadFromPraxsuite("bitacora")) {
    return getStaticBitacoraFallback();
  }

  if (pendingBitacoraRequest) {
    return pendingBitacoraRequest;
  }

  pendingBitacoraRequest = (async () => {
    try {
      const data = await loadBitacoraFromPraxsuite({ force });
      bitacoraUiCache = { data, timestamp: Date.now() };
      return data;
    } finally {
      pendingBitacoraRequest = null;
    }
  })();

  try {
    return await pendingBitacoraRequest;
  } catch (error) {
    logPraxsuiteError("fetchBitacoraPosts", error);

    if (bitacoraUiCache.data?.length) {
      return bitacoraUiCache.data;
    }

    return getStaticBitacoraFallback();
  }
}

export async function fetchBitacoraPostBySlug(slug, options = {}) {
  const posts = await fetchBitacoraPosts(options);
  return posts.find((post) => post.slug === slug) || null;
}

export async function fetchFeaturedBitacoraPosts(limit = 3, options = {}) {
  const posts = await fetchBitacoraPosts(options);
  const featured = posts.filter((post) => post.featured);
  const source = featured.length ? featured : posts;
  return source.slice(0, limit);
}
