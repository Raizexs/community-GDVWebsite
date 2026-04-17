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

let homeCache = {
  data: null,
  timestamp: 0,
};
const HOME_CACHE_TTL = 4000;

const ALLOWED_ORIGINS = getAllowedOrigins();
const IMAGE_ALLOWED_HOSTS = getAllowedImageHosts();
const checkHomeApiRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_HOME_API || 120),
  keyPrefix: "home-api",
});
const checkImageProxyRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_IMAGE_PROXY || 180),
  keyPrefix: "home-image",
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
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  });
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

function getAuthCandidates() {
  const headerName = process.env.PRAXSUITE_AUTH_HEADER || "Authorization";
  const authPrefix = process.env.PRAXSUITE_AUTH_PREFIX || "Bearer";
  const keys = [
    process.env.REACT_APP_PRAXSUITE_HOME_PUBLIC_KEY,
    process.env.REACT_APP_PRAXSUITE_HOME_SECTIONS_PUBLIC_KEY,
    process.env.REACT_APP_PRAXSUITE_HOME_QUICKACCESS_PUBLIC_KEY,
    process.env.REACT_APP_PRAXSUITE_HOME_SOCIAL_PUBLIC_KEY,
    process.env.PRAXSUITE_PUBLIC_KEY,
    process.env.PRAXSUITE_PRIVATE_KEY,
  ].filter(Boolean);

  const uniqueKeys = [...new Set(keys)];
  return uniqueKeys.map((key) => ({
    [headerName]: authPrefix ? `${authPrefix} ${key}` : key,
  }));
}

function getAuthHeadersByKey(apiKey) {
  if (!apiKey) return {};
  const headerName = process.env.PRAXSUITE_AUTH_HEADER || "Authorization";
  const authPrefix = process.env.PRAXSUITE_AUTH_PREFIX || "Bearer";
  const authValue = authPrefix ? `${authPrefix} ${apiKey}` : apiKey;
  return { [headerName]: authValue };
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

function getTablesConfig() {
  return [
    {
      key: "home",
      table: process.env.REACT_APP_PRAXSUITE_HOME_TABLE || "HOME",
      ref: process.env.REACT_APP_PRAXSUITE_HOME_REF,
      queryUrl: process.env.REACT_APP_PRAXSUITE_HOME_QUERY_URL,
      apiKey:
        process.env.REACT_APP_PRAXSUITE_HOME_PUBLIC_KEY ||
        process.env.PRAXSUITE_PUBLIC_KEY ||
        process.env.PRAXSUITE_PRIVATE_KEY,
    },
    {
      key: "sections",
      table: process.env.REACT_APP_PRAXSUITE_HOME_SECTIONS_TABLE || "HOME_SECTIONS",
      ref: process.env.REACT_APP_PRAXSUITE_HOME_SECTIONS_REF,
      queryUrl:
        process.env.REACT_APP_PRAXSUITE_HOME_SECTIONS_QUERY_URL ||
        process.env.REACT_APP_PRAXSUITE_HOME_QUERY_URL,
      apiKey:
        process.env.REACT_APP_PRAXSUITE_HOME_SECTIONS_PUBLIC_KEY ||
        process.env.REACT_APP_PRAXSUITE_HOME_PUBLIC_KEY ||
        process.env.PRAXSUITE_PUBLIC_KEY ||
        process.env.PRAXSUITE_PRIVATE_KEY,
    },
    {
      key: "quickAccess",
      table: process.env.REACT_APP_PRAXSUITE_HOME_QUICKACCESS_TABLE || "HOME_QUICKACCESS",
      ref: process.env.REACT_APP_PRAXSUITE_HOME_QUICKACCESS_REF,
      queryUrl:
        process.env.REACT_APP_PRAXSUITE_HOME_QUICKACCESS_QUERY_URL ||
        process.env.REACT_APP_PRAXSUITE_HOME_QUERY_URL,
      apiKey:
        process.env.REACT_APP_PRAXSUITE_HOME_QUICKACCESS_PUBLIC_KEY ||
        process.env.REACT_APP_PRAXSUITE_HOME_PUBLIC_KEY ||
        process.env.PRAXSUITE_PUBLIC_KEY ||
        process.env.PRAXSUITE_PRIVATE_KEY,
    },
    {
      key: "social",
      table: process.env.REACT_APP_PRAXSUITE_HOME_SOCIAL_TABLE || "HOME_SOCIAL",
      ref: process.env.REACT_APP_PRAXSUITE_HOME_SOCIAL_REF,
      queryUrl:
        process.env.REACT_APP_PRAXSUITE_HOME_SOCIAL_QUERY_URL ||
        process.env.REACT_APP_PRAXSUITE_HOME_QUERY_URL,
      apiKey:
        process.env.REACT_APP_PRAXSUITE_HOME_SOCIAL_PUBLIC_KEY ||
        process.env.REACT_APP_PRAXSUITE_HOME_PUBLIC_KEY ||
        process.env.PRAXSUITE_PUBLIC_KEY ||
        process.env.PRAXSUITE_PRIVATE_KEY,
    },
    {
      key: "games",
      table: process.env.REACT_APP_PRAXSUITE_GAMES_TABLE || "VIDEOGAMES",
      ref: process.env.REACT_APP_PRAXSUITE_GAMES_REF,
      queryUrl: process.env.REACT_APP_PRAXSUITE_GAMES_QUERY_URL,
      apiKey:
        process.env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY ||
        process.env.PRAXSUITE_PUBLIC_KEY ||
        process.env.PRAXSUITE_PRIVATE_KEY,
    },
    {
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
    },
    {
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
    },
  ];
}

function buildTableQuery(config) {
  if (!config.ref) {
    throw new Error(`Missing ref for table ${config.table} in .env`);
  }

  return {
    refs: {
      [config.table]: config.ref,
    },
    query: {
      from: config.table,
      select: [],
    },
  };
}

async function fetchTableFromPraxsuite(config) {
  const queryUrl = getQueryUrl(config.queryUrl);
  if (!queryUrl) {
    throw new Error("Missing PRAXSUITE_QUERY_URL in .env");
  }

  try {
    const preferredKeys = [config.apiKey, process.env.PRAXSUITE_PUBLIC_KEY, process.env.PRAXSUITE_PRIVATE_KEY]
      .filter(Boolean);
    const globalKeys = getAuthCandidates()
      .map((headers) => {
        const value = headers[process.env.PRAXSUITE_AUTH_HEADER || "Authorization"] || "";
        return String(value).replace(/^Bearer\s+/i, "").trim();
      })
      .filter(Boolean);
    const authKeys = [...new Set([...preferredKeys, ...globalKeys])];

    let lastResult = null;
    for (const key of authKeys) {
      const response = await fetch(queryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeadersByKey(key),
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

      lastResult = {
        ok: response.ok,
        status: response.status,
        body: parsed,
        key: config.key,
      };
      if (response.ok) {
        return lastResult;
      }
    }

    return (
      lastResult || {
        ok: false,
        status: 401,
        body: { error: "Invalid API key." },
        key: config.key,
      }
    );
  } catch (error) {
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

loadEnvFile();
const port = Number(process.env.HOME_API_PORT || 8085);

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const isAllowed = isRequestOriginAllowed(origin, ALLOWED_ORIGINS);

  if (req.method === "OPTIONS") {
    if (isAllowed) {
      sendCorsHeaders(res, origin);
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "CORS policy violation" }));
    }
    return;
  }

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

  if (req.method !== "GET" || (pathname !== "/api/home" && !pathname.startsWith("/api/images/"))) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (!isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", "");
    sendJson(res, 403, { error: "Origin not allowed" });
    return;
  }

  if (pathname === "/api/home" && !checkHomeApiRateLimit(req)) {
    res.setHeader("Retry-After", "60");
    sendJson(res, 429, { error: "Too many requests" });
    return;
  }

  if (pathname === "/api/images/download") {
    if (!checkImageProxyRateLimit(req)) {
      res.setHeader("Retry-After", "60");
      sendJson(res, 429, { error: "Too many requests" });
      return;
    }

    try {
      const url = new URL(req.url, "http://localhost:8085");
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
            Referer: "https://portal.praxsuite.com/",
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
        imageResponse = await fetch(imageUrl, {
          method: "GET",
          headers: {
            Referer: "https://portal.praxsuite.com/",
          },
          redirect: "follow",
        });
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

  if (pathname === "/api/home") {
    try {
      const now = Date.now();

      if (homeCache.data && now - homeCache.timestamp < HOME_CACHE_TTL) {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        });
        res.end(JSON.stringify(homeCache.data));
        return;
      }

      const configs = getTablesConfig();
      const enabledConfigs = configs.filter((cfg) => Boolean(cfg.ref));
      if (!enabledConfigs.length) {
        sendJson(res, 500, { error: "No HOME table refs configured" });
        return;
      }

      const responses = await Promise.all(enabledConfigs.map((cfg) => fetchTableFromPraxsuite(cfg)));
      const failed = responses.find((r) => !r.ok);

      if (failed) {
        if (homeCache.data) {
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          });
          res.end(JSON.stringify(homeCache.data));
          return;
        }

        sendJson(res, failed.status || 500, {
          error: "Failed to fetch home tables",
        });
        return;
      }

      const payload = responses.reduce((acc, item) => {
        acc[item.key] = item.body;
        return acc;
      }, {});

      homeCache.data = payload;
      homeCache.timestamp = now;

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(JSON.stringify(payload));
    } catch (error) {
      console.error("Unexpected server error:", error);
      sendJson(res, 500, { error: "Unexpected server error" });
    }
  }
});

server.listen(port, () => {
  console.log(`✅ Home proxy running on http://localhost:${port}`);
  console.log(`   Endpoint: GET http://localhost:${port}/api/home`);
  console.log(`   CORS allowed: ${ALLOWED_ORIGINS.join(", ")}`);
});
