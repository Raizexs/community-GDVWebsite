import { extractRows } from "../praxsuite/praxsuiteClient";

let cachedHomeContent = null;
let pendingHomeRequest = null;

export function getCachedHomeContent() {
  return cachedHomeContent;
}

function getHomeProxyBaseUrl() {
  return (process.env.REACT_APP_HOME_PROXY_URL || "").replace(/\/$/, "");
}

function getField(raw, candidates) {
  for (const key of candidates) {
    if (raw?.[key] != null) return raw[key];
  }

  if (!raw || typeof raw !== "object") return undefined;
  const normalizedMap = Object.keys(raw).reduce((acc, key) => {
    acc[key.toLowerCase()] = raw[key];
    return acc;
  }, {});

  for (const key of candidates) {
    const value = normalizedMap[key.toLowerCase()];
    if (value != null) return value;
  }

  return undefined;
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–-]+/g, " ")
    .replace(/[_/]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function localizedText(raw, esCandidates, enCandidates) {
  return {
    es: cleanText(getField(raw, esCandidates)),
    en: cleanText(getField(raw, enCandidates)),
  };
}

function isTitleLike(value, candidates) {
  const normalized = normalizeName(value);
  return candidates.some((candidate) => normalized.includes(normalizeName(candidate)));
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
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
      value.Icon ||
      value.IconUrl ||
      value.Hero ||
      value.image ||
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

  value = value.replace(/\s+null$/i, "");
  if (value.startsWith("data:")) return value;
  if (value.includes(";base64,")) {
    return value.startsWith("image/") ? `data:${value}` : `data:image/png;${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    const proxyBase = getHomeProxyBaseUrl();
    const suffix = cacheToken ? `&v=${encodeURIComponent(String(cacheToken))}` : "";
    return proxyBase
      ? `${proxyBase}/api/images/download?url=${encodeURIComponent(value)}${suffix}`
      : `/api/images/download?url=${encodeURIComponent(value)}${suffix}`;
  }

  return value;
}

function normalizeStorePlatforms(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.Record || item.Name || item.name || "";
        return "";
      })
      .filter(Boolean);
  }
  return splitList(value);
}

function extractGameImageUrl(rawGame) {
  const rawImage = getField(rawGame, ["ImageGame", "imageGame", "Image", "image"]);
  if (Array.isArray(rawImage) && rawImage.length) {
    return rawImage[0]?.DownloadUrl || rawImage[0]?.BlobUrl || rawImage[0] || null;
  }
  return rawImage;
}

function mapGamesBySlug(games) {
  return new Map(games.map((g) => [normalizeName(g.slug || g.id), g]));
}

function mapPlatformsByName(platformRows, cacheToken) {
  const map = new Map();
  platformRows.forEach((row) => {
    const platformName = getField(row, ["videogames_platform", "platform", "name"]);
    const key = normalizeName(platformName);
    if (!key) return;
    if (map.has(key)) return;

    map.set(key, {
      iconUrl: normalizeMediaSource(
        getField(row, ["icon", "Icon", "image", "Image", "DownloadUrl"]),
        cacheToken,
      ),
      defaultUrl: getField(row, ["platform_url", "url"]),
      label: platformName,
    });
  });
  return map;
}

function mapStoreUrlByPlatform(storeRows) {
  const map = new Map();
  storeRows.forEach((store) => {
    const url = getField(store, ["store_url", "url"]);
    if (!url) return;
    const platforms = normalizeStorePlatforms(getField(store, ["platforms", "platform"]));
    platforms.forEach((platform) => {
      const key = normalizeName(platform);
      if (key && !map.has(key)) {
        map.set(key, url);
      }
    });
  });
  return map;
}

function buildPlatformsForStory(platformNames, platformMeta, storeUrlByPlatform, storyStoreRows) {
  const storyStoreUrlByPlatform = new Map();
  storyStoreRows.forEach((store) => {
    const url = getField(store, ["store_url", "url"]);
    if (!url) return;
    const platforms = normalizeStorePlatforms(getField(store, ["platforms", "platform"]));
    platforms.forEach((platformName) => {
      const key = normalizeName(platformName);
      if (key && !storyStoreUrlByPlatform.has(key)) {
        storyStoreUrlByPlatform.set(key, url);
      }
    });
  });

  const uniquePlatforms = [...new Set(platformNames.filter(Boolean))];
  return uniquePlatforms
    .map((platformName, idx) => {
      const key = normalizeName(platformName);
      const meta = platformMeta.get(key);
      const url = storyStoreUrlByPlatform.get(key) || storeUrlByPlatform.get(key) || meta?.defaultUrl || "";
      const iconUrl = meta?.iconUrl || null;
      if (!iconUrl || !url) return null;
      return {
        name: iconUrl,
        iconUrl,
        url,
        platform: platformName,
        label: meta?.label || platformName,
        _key: `story-platform-${idx}-${key}`,
      };
    })
    .filter(Boolean);
}

function normalizeHomeRows(homeRows, cacheToken) {
  return homeRows.map((row, idx) => ({
    title: localizedText(row, ["Title (ES)", "title (es)"], ["Title (EN)", "title (en)"]),
    description: localizedText(
      row,
      ["Description (ES)", "description (es)"],
      ["Description (EN)", "description (en)"],
    ),
    icon: normalizeMediaSource(getField(row, ["Icon", "icon"]), cacheToken),
    videogameSlug: getField(row, ["VIDEOGAMES", "videogames"]),
    platforms: splitList(getField(row, ["VIDEOGAMES-PLATFORMS", "VIDEOGAMES_PLATFORM"])),
    stores: splitList(getField(row, ["VIDEOGAMES-STORES", "VIDEOGAMES_STORES"])),
    _order: idx,
  }));
}

function normalizeSectionRows(sectionRows, cacheToken) {
  return sectionRows.map((row, idx) => ({
    title: localizedText(row, ["Title (ES)", "title (es)"], ["Title (EN)", "title (en)"]),
    description: localizedText(
      row,
      ["Description (ES)", "description (es)"],
      ["Description (EN)", "description (en)"],
    ),
    url: getField(row, ["URL", "Url", "url"]),
    hero: normalizeMediaSource(getField(row, ["Hero", "hero", "Image", "image"]), cacheToken),
    _order: idx,
  }));
}

function buildHomeContent({ homeRows, sectionRows, quickAccessRows, socialRows, gamesRows, platformRows, storeRows, cacheToken }) {
  const home = normalizeHomeRows(homeRows, cacheToken);
  const sections = normalizeSectionRows(sectionRows, cacheToken);
  const quickAccess = quickAccessRows.map((row) => ({
    title: localizedText(row, ["Title (ES)", "title (es)"], ["Title (EN)", "title (en)"]),
    url: getField(row, ["URL", "Url", "url"]),
  }));
  const social = socialRows.map((row, idx) => ({
    name: getField(row, ["social_media", "Social Media", "Name", "name"]),
    description: localizedText(
      row,
      ["Description (ES)", "description (es)", "Content (ES)", "content (es)"],
      ["Description (EN)", "description (en)", "Content (EN)", "content (en)"],
    ),
    url: getField(row, ["URL", "Url", "url"]),
    iconUrl: normalizeMediaSource(getField(row, ["Icon", "icon"]), cacheToken),
    _key: `social-${idx}`,
  })).filter((item) => item.name || item.url);

  const gamesBySlug = mapGamesBySlug(gamesRows);
  const storesByKey = new Map(
    storeRows.map((row) => [
      normalizeName(getField(row, ["videogames_store", "store", "name"])),
      row,
    ]),
  );
  const platformMeta = mapPlatformsByName(platformRows, cacheToken);
  const storeUrlByPlatform = mapStoreUrlByPlatform(storeRows);

  const sectionByTitle = new Map();
  home.forEach((row) => {
    const esKey = normalizeName(row.title.es);
    const enKey = normalizeName(row.title.en);
    if (esKey && !sectionByTitle.has(esKey)) sectionByTitle.set(esKey, row);
    if (enKey && !sectionByTitle.has(enKey)) sectionByTitle.set(enKey, row);
  });

  const gamesSection =
    sectionByTitle.get(normalizeName("Grandes Juegos")) ||
    sectionByTitle.get(normalizeName("Great Games")) ||
    null;
  const successSection =
    sectionByTitle.get(normalizeName("Historias de éxito")) ||
    sectionByTitle.get(normalizeName("Success stories")) ||
    null;
  const benefitsSection =
    sectionByTitle.get(normalizeName("Beneficios de ser miembro")) ||
    sectionByTitle.get(normalizeName("Benefits of being a member")) ||
    null;
  const aboutUsSection =
    sectionByTitle.get(normalizeName("Sobre nosotros")) ||
    sectionByTitle.get(normalizeName("About us")) ||
    null;
  const aboutUsRow =
    aboutUsSection ||
    home.find((row) =>
      isTitleLike(row.title.es || row.title.en, ["sobre nosotros", "about us", "aboutus", "nosotros"]),
    ) ||
    null;
  const benefitItems = home.filter((row) => row.icon && !row.videogameSlug);
  const firstStory = successSection;

  const successStories = [];
  if (firstStory?.videogameSlug) {
    const game = gamesBySlug.get(normalizeName(firstStory.videogameSlug));
    if (game) {
      const storyStoreRows = firstStory.stores
        .map((storeKey) => storesByKey.get(normalizeName(storeKey)))
        .filter(Boolean);
      successStories.push({
        title: localizedText(game, ["Title (ES)"], ["Title (EN)"]),
        description: localizedText(game, ["Description (ES)"], ["Description (EN)"]),
        imageUrl: normalizeMediaSource(extractGameImageUrl(game), cacheToken),
        link: getField(game, ["Ver más (URL)", "URL", "link"]),
        platforms: buildPlatformsForStory(
          firstStory.platforms,
          platformMeta,
          storeUrlByPlatform,
          storyStoreRows,
        ),
      });
    }
  }

  if (!successStories.length) {
    const fallbackStoryRows = home.filter((row) => row.videogameSlug).slice(0, 2);
    fallbackStoryRows.forEach((storyRow) => {
      const game = gamesBySlug.get(normalizeName(storyRow.videogameSlug));
      if (!game) return;
      const storyStoreRows = storyRow.stores
        .map((storeKey) => storesByKey.get(normalizeName(storeKey)))
        .filter(Boolean);
      successStories.push({
        title: localizedText(game, ["Title (ES)"], ["Title (EN)"]),
        description: localizedText(game, ["Description (ES)"], ["Description (EN)"]),
        imageUrl: normalizeMediaSource(extractGameImageUrl(game), cacheToken),
        link: getField(game, ["Ver más (URL)", "URL", "link"]),
        platforms: buildPlatformsForStory(
          storyRow.platforms,
          platformMeta,
          storeUrlByPlatform,
          storyStoreRows,
        ),
      });
    });
  }

  const hero = sections[0] || {};
  const gamesCta = sections[1] || {};
  const joinCta = sections[2] || {};
  const quickAccessHeader = quickAccess.find((row) => !row.url) || null;

  return {
    hero,
    gamesSection,
    successSection,
    benefitsSection,
    benefitItems,
    gamesCta,
    joinCta,
    successStories,
    aboutUsTitle: aboutUsRow?.title || null,
    aboutUsDescription: aboutUsRow?.description || null,
    quickAccess,
    quickAccessHeader,
    social,
  };
}

export async function fetchHomeContent({ force = false } = {}) {
  const provider = (process.env.REACT_APP_PRAXSUITE_HOME_PROVIDER || "static").toLowerCase();
  if (provider !== "praxsuite") {
    cachedHomeContent = null;
    pendingHomeRequest = null;
    return null;
  }

  if (!force && cachedHomeContent) {
    return cachedHomeContent;
  }

  if (!force && pendingHomeRequest) {
    return pendingHomeRequest;
  }

  pendingHomeRequest = (async () => {
    try {
      const cacheToken = Date.now();
      const proxyBase = getHomeProxyBaseUrl();
      const homeApiUrl = proxyBase ? `${proxyBase}/api/home?v=${cacheToken}` : `/api/home?v=${cacheToken}`;

      const response = await fetch(homeApiUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Home backend returned status ${response.status}`);
      }

      const body = await response.json();
      const content = buildHomeContent({
        homeRows: extractRows(body?.home || []),
        sectionRows: extractRows(body?.sections || []),
        quickAccessRows: extractRows(body?.quickAccess || []),
        socialRows: extractRows(body?.social || []),
        gamesRows: extractRows(body?.games || []),
        platformRows: extractRows(body?.platforms || []),
        storeRows: extractRows(body?.stores || []),
        cacheToken,
      });

      cachedHomeContent = content;
      return content;
    } catch (error) {
      console.warn("Home backend fetch failed, using i18n/static fallback.", error);
      return cachedHomeContent;
    } finally {
      pendingHomeRequest = null;
    }
  })();

  try {
    return await pendingHomeRequest;
  } catch (error) {
    console.warn("Home request failed.", error);
    return null;
  }
}
