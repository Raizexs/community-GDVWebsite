const fs = require("fs");
const path = require("path");
const http = require("http");
const {
  createRateLimiter,
  getAllowedImageHosts,
  getAllowedOrigins,
  isRequestOriginAllowed,
  isSafeImageUrl,
  normalizeImageUrl,
} = require("./security");

// ============ SECURITY: Cache Limit ============
let gamesCache = {
  data: null,
  timestamp: 0,
};
const GAMES_CACHE_TTL = 4000; // 4 seconds

// ============ SECURITY: CORS Restrictions ============
const ALLOWED_ORIGINS = getAllowedOrigins();
const IMAGE_ALLOWED_HOSTS = getAllowedImageHosts();
const checkGamesApiRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_GAMES_API || 12),
  keyPrefix: "games-api",
});
const checkImageProxyRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_IMAGE_PROXY || 15),
  keyPrefix: "games-image",
});

function loadEnvFile() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['\"]|['\"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(res, statusCode, payload) {
  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  };

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
}

function sendCorsHeaders(res, origin) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": origin || "",
    "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Pragma",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Max-Age": "86400",
  });
  res.end();
}

function getAuthHeadersByKey(apiKey) {
  if (!apiKey) return {};
  const headerName = process.env.PRAXSUITE_AUTH_HEADER || "Authorization";
  const authPrefix = process.env.PRAXSUITE_AUTH_PREFIX || "Bearer";
  const authValue = authPrefix ? `${authPrefix} ${apiKey}` : apiKey;
  return {
    [headerName]: authValue,
  };
}

function getAuthCandidates() {
  const headerName = process.env.PRAXSUITE_AUTH_HEADER || "Authorization";
  const authPrefix = process.env.PRAXSUITE_AUTH_PREFIX || "Bearer";
  const keys = [
    process.env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY,
    process.env.PRAXSUITE_PUBLIC_KEY,
    process.env.PRAXSUITE_PRIVATE_KEY,
  ].filter(Boolean);

  const uniqueKeys = [...new Set(keys)];
  return uniqueKeys.map((key) => ({
    [headerName]: authPrefix ? `${authPrefix} ${key}` : key,
  }));
}

function detectMimeFromBuffer(buffer, fallback = "application/octet-stream") {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 8) {
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a;
    if (isPng) return "image/png";
  }

  if (bytes.length >= 3) {
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (isJpeg) return "image/jpeg";
  }

  if (bytes.length >= 6) {
    const header = String.fromCharCode(...bytes.slice(0, 6));
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }

  return fallback;
}

function getQueryUrl(defaultQueryUrl) {
  return defaultQueryUrl || process.env.PRAXSUITE_QUERY_URL;
}

function getGamesConfig() {
  return {
    key: "games",
    table: process.env.REACT_APP_PRAXSUITE_GAMES_TABLE || "VIDEOGAMES",
    ref: process.env.REACT_APP_PRAXSUITE_GAMES_REF,
    queryUrl: process.env.REACT_APP_PRAXSUITE_GAMES_QUERY_URL,
    apiKey:
      process.env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY ||
      process.env.PRAXSUITE_PUBLIC_KEY ||
      process.env.PRAXSUITE_PRIVATE_KEY,
    limit: 50,
  };
}

function getPlatformsConfig() {
  return {
    key: "platforms",
    table:
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_TABLE ||
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORMS_TABLE ||
      "VIDEOGAMES_PLATFORM",
    ref:
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_REF ||
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORMS_REF,
    queryUrl:
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_QUERY_URL ||
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORMS_QUERY_URL ||
      process.env.REACT_APP_PRAXSUITE_GAMES_QUERY_URL,
    apiKey:
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_PUBLIC_KEY ||
      process.env.REACT_APP_PRAXSUITE_GAMES_PLATFORMS_PUBLIC_KEY ||
      process.env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY ||
      process.env.PRAXSUITE_PUBLIC_KEY ||
      process.env.PRAXSUITE_PRIVATE_KEY,
  };
}

function getStoresConfig() {
  return {
    key: "stores",
    table: process.env.REACT_APP_PRAXSUITE_GAMES_STORES_TABLE || "VIDEOGAMES_STORES",
    ref: process.env.REACT_APP_PRAXSUITE_GAMES_STORES_REF,
    queryUrl:
      process.env.REACT_APP_PRAXSUITE_GAMES_STORES_QUERY_URL ||
      process.env.REACT_APP_PRAXSUITE_GAMES_QUERY_URL,
    apiKey:
      process.env.REACT_APP_PRAXSUITE_GAMES_STORES_PUBLIC_KEY ||
      process.env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY ||
      process.env.PRAXSUITE_PUBLIC_KEY ||
      process.env.PRAXSUITE_PRIVATE_KEY,
  };
}

function buildTableQuery(config) {
  if (!config.ref) {
    throw new Error(`Missing ref for ${config.table} in .env`);
  }

  const query = {
    from: config.table,
    select: [],
  };

  if (config.limit) {
    query.limit = config.limit;
  }

  return {
    refs: {
      [config.table]: config.ref,
    },
    query,
  };
}

async function fetchTableFromPraxsuite(config) {
  const queryUrl = getQueryUrl(config.queryUrl);
  if (!queryUrl) {
    throw new Error("Missing PRAXSUITE_QUERY_URL in .env");
  }

  try {
    const response = await fetch(queryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeadersByKey(config.apiKey),
      },
      body: JSON.stringify(buildTableQuery(config)),
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch (_error) {
      parsed = { raw: text };
    }

    return {
      ok: response.ok,
      status: response.status,
      body: parsed,
      key: config.key,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${config.table} from PraxSuite:`, error.message);
    return {
      ok: false,
      status: 502,
      body: {
        error: "Could not reach Praxsuite query endpoint",
        detail: error.message,
      },
      key: config.key,
    };
  }
}

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
      .map((v) => {
        if (v && typeof v === "object") {
          return String(v.Record || v.Name || v.name || v.value || "").trim();
        }
        return String(v || "").trim();
      })
      .filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function extractPlatformNames(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return String(item.Record || item.Name || item.name || item.value || "").trim();
        }
        return String(item || "").trim();
      })
      .filter(Boolean);
  }

  return splitList(value);
}

function buildGamesPayload(gamesBody, platformsBody, storesBody) {
  const gamesRows = Array.isArray(gamesBody?.data) ? gamesBody.data : [];
  const platformRows = Array.isArray(platformsBody?.data) ? platformsBody.data : [];
  const storeRows = Array.isArray(storesBody?.data) ? storesBody.data : [];

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

  const mergedGames = gamesRows.map((game) => {
    const platformNames = splitList(game?.["VIDEOGAMES-PLATFORM"] || game?.Platforms);
    const storeKeys = splitList(game?.["VIDEOGAMES-STORES"] || game?.Stores);
    const gameStoreRows = storeKeys
      .map((storeKey) => storeByKey.get(normalizeName(storeKey)))
      .filter(Boolean);
    const storeUrlByPlatform = new Map();

    gameStoreRows.forEach((storeRow) => {
      const storeUrl = String(storeRow?.store_url || storeRow?.url || "").trim();
      if (!storeUrl) return;
      const storePlatforms = extractPlatformNames(storeRow?.platforms || storeRow?.platform);
      storePlatforms.forEach((platformName) => {
        const key = normalizeName(platformName);
        if (key && !storeUrlByPlatform.has(key)) {
          storeUrlByPlatform.set(key, storeUrl);
        }
      });
    });

    const mergedPlatforms = platformNames.map((platformName) => {
      const platformRow = platformByName.get(normalizeName(platformName)) || {};
      const platformKey = normalizeName(platformName);

      return {
        platform: platformName,
        name:
          platformRow?.icon ||
          platformRow?.Icon ||
          platformRow?.image ||
          platformRow?.Image ||
          "",
        url: storeUrlByPlatform.get(platformKey) || platformRow?.platform_url || platformRow?.url || "#",
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
      URL: game?.["Ver más (URL)"] || game?.URL || game?.link || mergedStores[0]?.url || "",
      ImageGame:
        game?.ImageGame ||
        game?.imageGame ||
        game?.Image ||
        game?.image ||
        [],
    };
  });

  return {
    data: mergedGames,
    meta: {
      source: "games+platforms+stores",
      gamesCount: mergedGames.length,
      platformsCount: platformRows.length,
      storesCount: storeRows.length,
    },
  };
}

loadEnvFile();
const port = Number(process.env.GAMES_API_PORT || 8082);

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const isAllowed = isRequestOriginAllowed(origin, ALLOWED_ORIGINS);

  // ============ SECURITY: CORS Pre-flight ============
  if (req.method === "OPTIONS") {
    if (isAllowed) {
      sendCorsHeaders(res, origin);
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "CORS policy violation" }));
    }
    return;
  }

  // ============ SECURITY: Add CORS header to response ============
  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "");

  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  const pathname = (() => {
    try {
      return new URL(req.url, "http://localhost").pathname;
    } catch {
      return req.url;
    }
  })();

  if (req.method !== "GET" || (pathname !== "/api/games" && !pathname.startsWith("/api/images/"))) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  // ============ SECURITY: CORS Origin Check ============
  if (!isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", "");
    sendJson(res, 403, { error: "Origin not allowed" });
    return;
  }

  if (pathname === "/api/games" && !checkGamesApiRateLimit(req)) {
    res.setHeader("Retry-After", "60");
    sendJson(res, 429, { error: "Too many requests" });
    return;
  }

  // Handle image proxying
  if (pathname === "/api/images/download") {
    if (!checkImageProxyRateLimit(req)) {
      res.setHeader("Retry-After", "60");
      sendJson(res, 429, { error: "Too many requests" });
      return;
    }

    try {
      const url = new URL(req.url, "http://localhost:8082");
      const imageUrlRaw = url.searchParams.get("url");
      
      if (!imageUrlRaw) {
        sendJson(res, 400, { error: "Missing url parameter" });
        return;
      }

      const imageUrl = normalizeImageUrl(imageUrlRaw);
      if (!isSafeImageUrl(imageUrl, IMAGE_ALLOWED_HOSTS)) {
        sendJson(res, 400, { error: "Invalid image url host" });
        return;
      }

      let imageResponse = null;
      const authCandidates = getAuthCandidates();
      for (const authHeaders of authCandidates) {
        const attempt = await fetch(imageUrl, {
          method: "GET",
          headers: {
            "Referer": "https://portal.praxsuite.com/",
            ...authHeaders,
          },
          redirect: "follow",
        });
        if (attempt.ok) {
          imageResponse = attempt;
          break;
        }
      }

      if (!imageResponse) {
        const noAuthAttempt = await fetch(imageUrl, {
          method: "GET",
          headers: {
            "Referer": "https://portal.praxsuite.com/",
          },
          redirect: "follow",
        });
        imageResponse = noAuthAttempt;
      }

      if (!imageResponse.ok) {
        sendJson(res, imageResponse.status, { error: "Failed to fetch image" });
        return;
      }

      const buffer = await imageResponse.arrayBuffer();
      const sourceType = imageResponse.headers.get("content-type") || "application/octet-stream";
      const contentType =
        sourceType === "application/octet-stream"
          ? detectMimeFromBuffer(buffer, sourceType)
          : sourceType;

      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(Buffer.from(buffer));
    } catch (error) {
      console.error("Image proxy error:", error);
      sendJson(res, 500, { error: "Failed to proxy image" });
    }
    return;
  }

  // Handle games data request
  if (pathname === "/api/games") {
    try {
      const now = Date.now();

      if (gamesCache.data && now - gamesCache.timestamp < GAMES_CACHE_TTL) {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        });
        res.end(JSON.stringify(gamesCache.data));
        return;
      }

      const [gamesResponse, platformsResponse, storesResponse] = await Promise.all([
        fetchTableFromPraxsuite(getGamesConfig()),
        fetchTableFromPraxsuite(getPlatformsConfig()),
        fetchTableFromPraxsuite(getStoresConfig()),
      ]);

      if (!gamesResponse.ok || !platformsResponse.ok || !storesResponse.ok) {
        // En caso de fallo devolvemos la última caché válida de emergencia
        if (gamesCache.data) {
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          });
          res.end(JSON.stringify(gamesCache.data));
          return;
        }

        sendJson(res, gamesResponse.status || platformsResponse.status || storesResponse.status, {
          error: "Failed to fetch games",
        });
        return;
      }

      const mergedPayload = buildGamesPayload(
        gamesResponse.body,
        platformsResponse.body,
        storesResponse.body,
      );

      gamesCache.data = mergedPayload;
      gamesCache.timestamp = now;

      // Return the games data
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(JSON.stringify(mergedPayload));
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      sendJson(res, 500, {
        error: "Unexpected server error",
      });
    }
  }
});

server.listen(port, () => {
  // Silent startup
});
