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

let partnersCache = {
  data: null,
  timestamp: 0,
};
const PARTNERS_CACHE_TTL = 4000;

const ALLOWED_ORIGINS = getAllowedOrigins();
const IMAGE_ALLOWED_HOSTS = getAllowedImageHosts();
const checkPartnersApiRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_PARTNERS_API || 120),
  keyPrefix: "partners-api",
});
const checkImageProxyRateLimit = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_IMAGE_PROXY || 180),
  keyPrefix: "partners-image",
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

function getAuthHeaders() {
  const apiKey = process.env.REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY;
  if (!apiKey) {
    console.error("❌ No REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY found in environment");
    return {};
  }

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
    process.env.REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY,
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

function getQueryUrl() {
  return (
    process.env.REACT_APP_PRAXSUITE_PARTNERS_QUERY_URL || process.env.PRAXSUITE_QUERY_URL
  );
}

function buildPartnersQuery() {
  const table = process.env.REACT_APP_PRAXSUITE_PARTNERS_TABLE || "PARTNERS";
  const ref = process.env.REACT_APP_PRAXSUITE_PARTNERS_REF;

  if (!ref) {
    throw new Error("Missing REACT_APP_PRAXSUITE_PARTNERS_REF in .env");
  }

  return {
    refs: {
      [table]: ref,
    },
    query: {
      from: table,
      select: [],
    },
  };
}

async function fetchPartnersFromPraxsuite() {
  const queryUrl = getQueryUrl();
  if (!queryUrl) {
    throw new Error("Missing PRAXSUITE_QUERY_URL in .env");
  }

  try {
    const response = await fetch(queryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(buildPartnersQuery()),
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
    };
  } catch (error) {
    console.error("❌ Error fetching from PraxSuite:", error.message);
    return {
      ok: false,
      status: 502,
      body: {
        error: "Could not reach Praxsuite query endpoint",
        detail: error.message,
      },
    };
  }
}

loadEnvFile();
const port = Number(process.env.PARTNERS_API_PORT || 8083);

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

  if (req.method !== "GET" || (pathname !== "/api/partners" && !pathname.startsWith("/api/images/"))) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (!isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", "");
    sendJson(res, 403, { error: "Origin not allowed" });
    return;
  }

  if (pathname === "/api/partners" && !checkPartnersApiRateLimit(req)) {
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
      const url = new URL(req.url, "http://localhost:8083");
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
        const noAuthAttempt = await fetch(imageUrl, {
          method: "GET",
          headers: {
            Referer: "https://portal.praxsuite.com/",
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

  if (pathname === "/api/partners") {
    try {
      const now = Date.now();

      if (partnersCache.data && now - partnersCache.timestamp < PARTNERS_CACHE_TTL) {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        });
        res.end(JSON.stringify(partnersCache.data));
        return;
      }

      const praxsuiteResponse = await fetchPartnersFromPraxsuite();

      if (!praxsuiteResponse.ok) {
        if (partnersCache.data) {
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          });
          res.end(JSON.stringify(partnersCache.data));
          return;
        }

        sendJson(res, praxsuiteResponse.status, {
          error: "Failed to fetch partners",
        });
        return;
      }

      partnersCache.data = praxsuiteResponse.body;
      partnersCache.timestamp = now;

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(JSON.stringify(praxsuiteResponse.body));
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      sendJson(res, 500, {
        error: "Unexpected server error",
      });
    }
  }
});

server.listen(port, () => {
  console.log(`✅ Partners proxy running on http://localhost:${port}`);
  console.log(`   Endpoint: GET http://localhost:${port}/api/partners`);
  console.log(`   CORS allowed: ${ALLOWED_ORIGINS.join(", ")}`);
});
