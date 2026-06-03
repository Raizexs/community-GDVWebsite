import { gamesData as staticGamesData } from "../../data/gamesData";
import { shouldLoadGamesFromPraxsuite } from "../../config/appConfig";
import {
  canLoadFromPraxsuite,
  PraxsuiteErrorCode,
} from "../praxsuite/praxsuiteSecurity";
import {
  fetchMergedGamesFromPraxsuite,
  getGamesApiKeys,
} from "../praxsuite/praxsuiteGames";
import {
  canUseDirectMediaUrl,
  normalizeMediaSourceSync,
  resolveDisplayableMediaUrl,
} from "../praxsuite/praxsuiteMedia";

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

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function normalizeMediaSource(rawValue, apiKeys) {
  const syncUrl = normalizeMediaSourceSync(rawValue);
  if (!syncUrl || !syncUrl.startsWith("http")) return syncUrl;
  if (canUseDirectMediaUrl(syncUrl)) return syncUrl;

  try {
    return await resolveDisplayableMediaUrl(rawValue, apiKeys);
  } catch (error) {
    if (error?.code === PraxsuiteErrorCode.RATE_LIMIT) {
      return canUseDirectMediaUrl(syncUrl) ? syncUrl : null;
    }
    throw error;
  }
}

async function normalizeGame(raw, apiKeys) {
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
  const mainImageUrl = await normalizeMediaSource(mainImageUrlRaw, apiKeys);

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
      : String(storeRow?.platform || storeRow?.platforms || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

    platformsFromStore.forEach((platformName) => {
      const key = normalizeName(platformName);
      if (key && !storeUrlByPlatform.has(key)) {
        storeUrlByPlatform.set(key, url);
      }
    });
  });

  const uniquePlatforms = [...new Set(platformNames.filter(Boolean))];
  let platformsWithIcons = await Promise.all(
    uniquePlatforms.map(async (platformName, idx) => {
      const key = normalizeName(platformName);
      const staticIcon =
        staticPlatformIcons[key] ||
        Object.entries(staticPlatformIcons).find(([k]) => key.includes(k))?.[1];
      const tablePlatform = (raw?.ImagePlatform || []).find(
        (p) => normalizeName(p.platform) === key,
      );
      const url =
        storeUrlByPlatform.get(key) ||
        tablePlatform?.url ||
        "";

      let tableIconUrl = tablePlatform ? tablePlatform.name : "";

      if (Array.isArray(tableIconUrl)) {
        tableIconUrl =
          tableIconUrl[0]?.DownloadUrl ||
          tableIconUrl[0]?.BlobUrl ||
          tableIconUrl[0]?.url ||
          "";
      } else if (typeof tableIconUrl === "object" && tableIconUrl !== null) {
        tableIconUrl =
          tableIconUrl.DownloadUrl ||
          tableIconUrl.BlobUrl ||
          tableIconUrl.url ||
          "";
      }

      let finalIconUrl = staticIcon;

      if (
        !finalIconUrl &&
        typeof tableIconUrl === "string" &&
        tableIconUrl.trim() !== ""
      ) {
        finalIconUrl = tableIconUrl;
        if (finalIconUrl.startsWith("http")) {
          const resolved = await normalizeMediaSource(finalIconUrl, apiKeys);
          finalIconUrl = resolved || staticIcon || finalIconUrl;
        }
      }

      if (!finalIconUrl) {
        finalIconUrl = staticIcon || "";
      }

      return {
        name: platformName,
        iconUrl: finalIconUrl,
        url: url || "#",
        platform: platformName,
        label: platformName,
        _key: `${raw?.id_videogames || raw?.ID || raw?.Slug || "game"}-platform-${idx}`,
      };
    }),
  );

  platformsWithIcons = platformsWithIcons.filter((p) => p.iconUrl);

  const slug = String(raw?.Slug ?? raw?.slug ?? "").toLowerCase();

  if (slug === "tormentedsouls") {
    platformsWithIcons = [
      {
        name: "Steam",
        iconUrl: iconSteam,
        url: "https://store.steampowered.com/app/1367590/Tormented_Souls/",
        platform: "Steam",
      },
      {
        name: "Nintendo",
        iconUrl: iconNintendo,
        url: "https://www.nintendo.com/store/products/tormented-souls-switch/",
        platform: "Nintendo",
      },
      {
        name: "PlayStation",
        iconUrl: iconPlaystation,
        url: "https://store.playstation.com/en-us/product/UP4293-PPSA02525_00-TORMENTEDSIEAPS5/",
        platform: "PlayStation",
      },
      {
        name: "Xbox",
        iconUrl: iconXbox,
        url: "https://www.xbox.com/en-us/games/store/tormented-souls/9mwz8jv5tsqg",
        platform: "Xbox",
      },
      {
        name: "Epic",
        iconUrl: iconEpic,
        url: "https://store.epicgames.com/en-US/p/tormented-souls",
        platform: "Epic",
      },
      {
        name: "GOG",
        iconUrl: iconGOG,
        url: "https://www.gog.com/en/game/tormented_souls",
        platform: "GOG",
      },
    ];
  } else if (slug === "colorbound") {
    platformsWithIcons = [
      {
        name: "Steam",
        iconUrl: iconSteam,
        url: "https://store.steampowered.com/app/3778610/Colorbound/",
        platform: "Steam",
      },
      {
        name: "Epic",
        iconUrl: iconEpic,
        url: "https://store.epicgames.com/en-US/p/colorbound-1c5e30",
        platform: "Epic",
      },
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
  if (!shouldLoadGamesFromPraxsuite()) {
    const fallback = buildStaticGamesFallback();
    cachedGames = fallback;
    pendingGamesRequest = null;
    return fallback;
  }

  if (!force && cachedGames) {
    return cachedGames;
  }

  if (!canLoadFromPraxsuite("games")) {
    return buildStaticGamesFallback();
  }

  if (pendingGamesRequest) {
    return pendingGamesRequest;
  }

  pendingGamesRequest = (async () => {
    try {
      const apiKeys = getGamesApiKeys();
      const rows = await fetchMergedGamesFromPraxsuite();
      const normalized = await Promise.all(
        rows.map((raw) => normalizeGame(raw, apiKeys)),
      );
      const filtered = normalized.filter(
        (g) => g && (g.titleKey || g.title?.es || g.title?.en) && g.isActive,
      );

      if (!filtered.length) {
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
    console.warn("Games PraxSuite fetch failed:", error?.message || error);
    if (cachedGames?.length) return cachedGames;
    return buildStaticGamesFallback();
  }
}
