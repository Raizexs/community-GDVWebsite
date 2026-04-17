import { extractRows } from "../praxsuite/praxsuiteClient";
import { gamesData as staticGamesData } from "../../data/gamesData";

let cachedGames = null;
let pendingGamesRequest = null;

export function getCachedGames() {
  return cachedGames;
}

function buildStaticGamesFallback() {
  return staticGamesData.map((game) => ({
    id: game.id,
    slug: game.id,
    titleKey: game.titleKey,
    descriptionKey: game.descriptionKey,
    image: game.image,
    imageUrl: null,
    imagePlatform: null,
    link: game.link,
    platforms: (game.platforms || []).map((platform, idx) => ({
      name: platform.name,
      iconUrl: platform.name,
      url: platform.url,
      platform: "",
      label: "",
      _key: `${game.id}-static-${idx}`,
    })),
    isActive: true,
  }));
}

function getGamesProvider() {
  return (
    process.env.REACT_APP_PRAXSUITE_GAMES_PROVIDER || "static"
  ).toLowerCase();
}

function getGamesProxyBaseUrl() {
  return (process.env.REACT_APP_GAMES_PROXY_URL || "").replace(/\/$/, "");
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function splitList(value) {
  if (Array.isArray(value))
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractMediaRaw(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = extractMediaRaw(entry);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    return (
      value.DownloadUrl ||
      value.BlobUrl ||
      value.url ||
      value.URL ||
      value.ImageUrl ||
      value.imageUrl ||
      value.image ||
      value.icon ||
      value.name ||
      null
    );
  }

  return null;
}

function normalizeMediaSource(rawValue, cacheToken) {
  const mediaRaw = extractMediaRaw(rawValue);
  if (typeof mediaRaw !== "string") return null;

  let value = mediaRaw.trim();
  if (!value) return null;

  // Some rows come as "image/png;base64,... null"
  value = value.replace(/\s+null$/i, "");

  if (value.startsWith("data:")) return value;
  if (value.includes(";base64,")) {
    return value.startsWith("image/")
      ? `data:${value}`
      : `data:image/png;${value}`;
  }

  // Bypass para Blob URLs estáticos
  if (/^https?:\/\/.*blob\.core\.windows\.net/i.test(value)) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    const proxyBase = getGamesProxyBaseUrl();
    const suffix = cacheToken
      ? `&v=${encodeURIComponent(String(cacheToken))}`
      : "";
    return proxyBase
      ? `${proxyBase}/api/images/download?url=${encodeURIComponent(value)}${suffix}`
      : `/api/images/download?url=${encodeURIComponent(value)}${suffix}`;
  }

  return null;
}

function normalizeGame(raw, cacheToken) {
  const titleEs = raw?.["Title (ES)"];
  const titleEn = raw?.["Title (EN)"];
  const descEs = raw?.["Description (ES)"];
  const descEn = raw?.["Description (EN)"];

  const imageGameArray = Array.isArray(raw?.ImageGame)
    ? raw.ImageGame
    : Array.isArray(raw?.imageGame)
      ? raw.imageGame
      : [];
  const imageFromArray =
    imageGameArray[0]?.DownloadUrl || imageGameArray[0]?.BlobUrl;
  const imageFromField =
    raw?.ImageGame || raw?.imageGame || raw?.Image || raw?.image;
  const mainImageUrlRaw = imageFromArray || imageFromField;
  const mainImageUrl = normalizeMediaSource(mainImageUrlRaw, cacheToken);

  const platformImages = Array.isArray(raw?.ImagePlatform)
    ? raw.ImagePlatform
    : [];
  const platformNames = Array.isArray(raw?.Platforms)
    ? raw.Platforms
    : typeof raw?.Platforms === "string"
      ? raw.Platforms.split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
  const storesResolved = Array.isArray(raw?.StoresResolved)
    ? raw.StoresResolved
    : [];

  const storeUrlByPlatform = new Map();
  storesResolved.forEach((storeRow) => {
    const url = storeRow?.url || storeRow?.store_url;
    if (!url) return;

    const platformsFromStore = Array.isArray(storeRow?.platform)
      ? storeRow.platform
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object")
              return item.Record || item.Name || item.name || "";
            return "";
          })
          .filter(Boolean)
      : splitList(storeRow?.platform || storeRow?.platforms);

    platformsFromStore.forEach((platformName) => {
      const key = normalizeName(platformName);
      if (key && !storeUrlByPlatform.has(key)) {
        storeUrlByPlatform.set(key, url);
      }
    });
  });

  const iconByPlatform = new Map();
  platformImages.forEach((img) => {
    const platformName = img?.platform || img?.namePlatform || img?.label || "";
    const key = normalizeName(platformName);
    const iconUrl = normalizeMediaSource(
      img?.DownloadUrl || img?.BlobUrl || img?.name || img?.icon || img?.image,
      cacheToken,
    );
    if (key && iconUrl && !iconByPlatform.has(key)) {
      iconByPlatform.set(key, {
        iconUrl,
        fallbackUrl: img?.url || img?.platform_url || "",
        label: platformName || "",
      });
    }
  });

  const uniquePlatforms = [...new Set(platformNames.filter(Boolean))];
  const platformsWithIcons = uniquePlatforms
    .map((platformName, idx) => {
      const key = normalizeName(platformName);
      const icon = iconByPlatform.get(key);
      const url = storeUrlByPlatform.get(key) || icon?.fallbackUrl || "";
      const iconUrl = icon?.iconUrl || null;

      if (!iconUrl || !url) return null;

      return {
        name: iconUrl,
        iconUrl,
        url,
        platform: platformName,
        label: icon?.label || platformName,
        _key: `${raw?.id_videogames || raw?.ID || raw?.Slug || "game"}-platform-${idx}`,
      };
    })
    .filter(Boolean);

  return {
    id: String(raw?.id_videogames ?? raw?.ID ?? raw?.id ?? ""),
    slug: raw?.Slug ?? raw?.slug,
    title: { es: titleEs, en: titleEn },
    description: { es: descEs, en: descEn },
    imageUrl: mainImageUrl ?? raw?.imageUrl,
    imagePlatform: mainImageUrl ?? raw?.imagePlatform,
    link: raw?.["Ver más (URL)"] ?? raw?.URL ?? raw?.link,
    platforms: platformsWithIcons,
    isActive: raw?.isActive ?? true,
  };
}

export async function fetchGames({ force = false } = {}) {
  if (getGamesProvider() !== "praxsuite") {
    const fallback = buildStaticGamesFallback();
    cachedGames = fallback;
    pendingGamesRequest = null;
    return fallback;
  }

  if (!force && cachedGames) {
    return cachedGames;
  }

  if (!force && pendingGamesRequest) {
    return pendingGamesRequest;
  }

  pendingGamesRequest = (async () => {
    try {
      const proxyBase = getGamesProxyBaseUrl();
      const cacheToken = Date.now();
      const gamesApiUrl = proxyBase
        ? `${proxyBase}/api/games?v=${cacheToken}`
        : `/api/games?v=${cacheToken}`;
      const response = await fetch(gamesApiUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Games backend returned status ${response.status}`);
      }

      const body = await response.json();
      const rows = extractRows(body);
      const normalized = rows.map((raw) =>
        normalizeGame(raw, raw.UPDATEDDATE || cacheToken),
      );
      const filtered = normalized.filter(
        (g) => g && (g.titleKey || g.title?.es || g.title?.en) && g.isActive,
      );

      cachedGames = filtered;
      return filtered;
    } finally {
      pendingGamesRequest = null;
    }
  })();

  try {
    return await pendingGamesRequest;
  } catch (error) {
    console.warn("Games backend fetch failed.", error);
    return buildStaticGamesFallback();
  }
}
