import { getPraxsuiteGamesConfig } from "../../config/appConfig";
import { fetchPraxsuiteTable } from "./praxsuiteApi";

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object")
          return item.Record || item.Name || item.name || "";
        return "";
      })
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractPlatformNames(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object")
          return item.Record || item.Name || item.name || "";
        return "";
      })
      .filter(Boolean);
  }
  return splitList(value);
}

export function getGamesApiKeys() {
  const cfg = getPraxsuiteGamesConfig();
  return [cfg.gamesKey, cfg.platformKey, cfg.storesKey].filter(Boolean);
}

export async function fetchMergedGamesFromPraxsuite() {
  const cfg = getPraxsuiteGamesConfig();

  const [gamesRows, platformRows, storeRows] = await Promise.all([
    fetchPraxsuiteTable(
      cfg.gamesQueryUrl,
      "VIDEOGAMES",
      cfg.gamesRef,
      cfg.gamesKey,
    ),
    fetchPraxsuiteTable(
      cfg.platformQueryUrl,
      "VIDEOGAMES-PLATFORM",
      cfg.platformRef,
      cfg.platformKey,
    ),
    fetchPraxsuiteTable(
      cfg.storesQueryUrl,
      "VIDEOGAMES-STORES",
      cfg.storesRef,
      cfg.storesKey,
    ),
  ]);

  const platformByName = new Map(
    platformRows.map((row) => [
      normalizeName(row?.videogames_platform || row?.platform || row?.name),
      row,
    ]),
  );

  const storeByKey = new Map(
    storeRows.map((row) => [
      normalizeName(row?.videogames_store || row?.store || row?.name),
      row,
    ]),
  );

  return gamesRows.map((game) => {
    const platformNames = splitList(
      game?.["VIDEOGAMES-PLATFORM"] || game?.Platforms,
    );
    const storeKeys = splitList(game?.["VIDEOGAMES-STORES"] || game?.Stores);
    const gameStoreRows = storeKeys
      .map((storeKey) => storeByKey.get(normalizeName(storeKey)))
      .filter(Boolean);

    const storeUrlByPlatform = new Map();
    gameStoreRows.forEach((storeRow) => {
      const storeUrl = String(storeRow?.store_url || storeRow?.url || "").trim();
      if (!storeUrl) return;
      const storePlatforms = extractPlatformNames(
        storeRow?.platforms || storeRow?.platform,
      );
      storePlatforms.forEach((platformName) => {
        const key = normalizeName(platformName);
        if (key && !storeUrlByPlatform.has(key)) {
          storeUrlByPlatform.set(key, storeUrl);
        }
      });
    });

    const mergedPlatforms = platformNames.map((platformName) => {
      const platformRow =
        platformByName.get(normalizeName(platformName)) || {};
      const platformKey = normalizeName(platformName);
      return {
        platform: platformName,
        name:
          platformRow?.icon ||
          platformRow?.Icon ||
          platformRow?.image ||
          platformRow?.Image ||
          "",
        url:
          storeUrlByPlatform.get(platformKey) ||
          platformRow?.platform_url ||
          platformRow?.url ||
          "#",
        _key: `${game?.id_videogames || game?.ID || game?.Slug || "game"}-${platformName}`,
      };
    });

    const mergedStores = storeKeys
      .map((storeKey) => {
        const storeRow = storeByKey.get(normalizeName(storeKey));
        if (!storeRow) return null;
        return {
          store: storeRow?.videogames_store || storeKey,
          platform: storeRow?.platforms,
          url: storeRow?.store_url,
          _key: storeRow?.videogames_store || storeKey,
        };
      })
      .filter(Boolean);

    return {
      ...game,
      Platforms: platformNames,
      ImagePlatform: mergedPlatforms,
      StoresResolved: mergedStores,
      URL:
        game?.["Ver más (URL)"] ||
        game?.URL ||
        game?.link ||
        mergedStores[0]?.url ||
        "",
      ImageGame:
        game?.ImageGame ||
        game?.imageGame ||
        game?.Image ||
        game?.image ||
        [],
    };
  });
}
