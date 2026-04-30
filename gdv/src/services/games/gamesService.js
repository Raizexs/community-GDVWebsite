import { extractRows } from "../praxsuite/praxsuiteClient";
import { gamesData as staticGamesData } from "../../data/gamesData";

import iconSteam from "../../img/plataforms/steam.png";
import iconPlaystation from "../../img/plataforms/playstation.png";
import iconXbox from "../../img/plataforms/xbox.png";
import iconEpic from "../../img/plataforms/epic.png";
import iconNintendo from "../../img/plataforms/nintendo.png";
import iconGOG from "../../img/plataforms/GOG.png";

const staticPlatformIcons = {
  steam: iconSteam,
  playstation: iconPlaystation,
  ps: iconPlaystation,
  xbox: iconXbox,
  epic: iconEpic,
  nintendo: iconNintendo,
  switch: iconNintendo,
  gog: iconGOG,
};

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

export function getStaticGamesFallback() {
  return buildStaticGamesFallback();
}

function getGamesProvider() {
  return (
    process.env.REACT_APP_PRAXSUITE_GAMES_PROVIDER || "praxsuite"
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

  const uniquePlatforms = [...new Set(platformNames.filter(Boolean))];
  let platformsWithIcons = uniquePlatforms
    .map((platformName, idx) => {
      const key = normalizeName(platformName);
      const staticIcon = staticPlatformIcons[key] || Object.entries(staticPlatformIcons).find(([k]) => key.includes(k))?.[1];
      const url = storeUrlByPlatform.get(key) || "";

      const tablePlatform = (raw?.ImagePlatform || []).find(p => normalizeName(p.platform) === key);
      let tableIconUrl = tablePlatform ? tablePlatform.name : "";
      
      if (Array.isArray(tableIconUrl)) {
        tableIconUrl = tableIconUrl[0]?.DownloadUrl || tableIconUrl[0]?.BlobUrl || tableIconUrl[0]?.url || "";
      } else if (typeof tableIconUrl === "object" && tableIconUrl !== null) {
        tableIconUrl = tableIconUrl.DownloadUrl || tableIconUrl.BlobUrl || tableIconUrl.url || "";
      }

      let finalIconUrl = (typeof tableIconUrl === 'string' && tableIconUrl.trim() !== '') ? tableIconUrl : staticIcon;

      if (finalIconUrl && finalIconUrl.startsWith('http') && finalIconUrl !== staticIcon) {
        finalIconUrl = normalizeMediaSource(finalIconUrl, null) || finalIconUrl;
      }

      return {
        name: platformName,
        iconUrl: finalIconUrl || "", 
        url,
        platform: platformName,
        label: platformName,
        _key: `${raw?.id_videogames || raw?.ID || raw?.Slug || "game"}-platform-${idx}`,
      };
    })
    .filter((p) => p.iconUrl && p.url);

  const slug = String(raw?.Slug ?? raw?.slug ?? "").toLowerCase();

  if (slug === "tormentedsouls") {
    platformsWithIcons = [
      { name: "Steam", iconUrl: iconSteam, url: "https://store.steampowered.com/app/1367590/Tormented_Souls/", platform: "Steam" },
      { name: "Nintendo", iconUrl: iconNintendo, url: "https://www.nintendo.com/store/products/tormented-souls-switch/", platform: "Nintendo" },
      { name: "PlayStation", iconUrl: iconPlaystation, url: "https://store.playstation.com/en-us/product/UP4293-PPSA02525_00-TORMENTEDSIEAPS5/", platform: "PlayStation" },
      { name: "Xbox", iconUrl: iconXbox, url: "https://www.xbox.com/en-us/games/store/tormented-souls/9mwz8jv5tsqg", platform: "Xbox" },
      { name: "Epic", iconUrl: iconEpic, url: "https://store.epicgames.com/en-US/p/tormented-souls", platform: "Epic" },
      { name: "GOG", iconUrl: iconGOG, url: "https://www.gog.com/en/game/tormented_souls", platform: "GOG" },
    ];
  } else if (slug === "colorbound") {
    platformsWithIcons = [
      { name: "Steam", iconUrl: iconSteam, url: "https://store.steampowered.com/app/3778610/Colorbound/", platform: "Steam" },
      { name: "Epic", iconUrl: iconEpic, url: "https://store.epicgames.com/en-US/p/colorbound-1c5e30", platform: "Epic" },
    ];
  }

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

  if (pendingGamesRequest) {
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

      const hasRenderablePlatforms = filtered.some(
        (game) => Array.isArray(game.platforms) && game.platforms.length > 0,
      );
      if (!filtered.length || !hasRenderablePlatforms) {
        return buildStaticGamesFallback();
      }

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
