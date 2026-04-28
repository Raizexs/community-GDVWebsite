// Simple in-memory rate limiting (Edge-local)
const rateLimitCache = new Map();

function checkRateLimit(ip, path) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = path.includes("/images") ? 75 : 12;
  const key = `${ip}-${path}`;

  if (!rateLimitCache.has(key)) {
    rateLimitCache.set(key, { count: 1, startTime: now });
    return true;
  }

  const record = rateLimitCache.get(key);
  if (now - record.startTime > windowMs) {
    rateLimitCache.set(key, { count: 1, startTime: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
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

async function fetchTable(url, tableName, ref, apiKey) {
  const payload = {
    refs: { [tableName]: ref },
    query: { from: tableName, select: [] },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PraxSuite error: ${response.status} - ${errorText}`);
  }

  const text = await response.text();
  const data = JSON.parse(text);
  return Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.rows)
      ? data.rows
      : Array.isArray(data?.result)
        ? data.result
        : [];
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const allowedOrigins = [
      "https://gdvalparaiso.com",
      "http://localhost:3000",
      "http://localhost:8080",
    ];
    const allowOrigin = allowedOrigins.includes(origin)
      ? origin
      : "https://gdvalparaiso.com";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Validar variables de entorno requeridas
    const requiredEnvVars = [
      "PRAXSUITE_QUERY_URL",
      "REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY",
      "REACT_APP_PRAXSUITE_GAMES_STORES_PUBLIC_KEY",
      "REACT_APP_PRAXSUITE_GAMES_PLATFORM_PUBLIC_KEY",
      "REACT_APP_PRAXSUITE_GAMES_REF",
      "REACT_APP_PRAXSUITE_GAMES_PLATFORM_REF",
      "REACT_APP_PRAXSUITE_GAMES_STORES_REF",
    ];

    for (const v of requiredEnvVars) {
      if (!env[v]) {
        return new Response(
          JSON.stringify({
            error: `Falta configurar la variable (Secret) en Cloudflare: ${v}`,
          }),
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    const url = new URL(request.url);
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    if (!checkRateLimit(ip, url.pathname)) {
      return new Response(JSON.stringify({ error: "Rate limit excedido." }), {
        status: 429,
        headers: corsHeaders,
      });
    }

    try {
      // ENDPOINT: Imágenes
      if (url.pathname.includes("/api/images/download")) {
        let imageUrlRaw = url.searchParams.get("url");
        if (!imageUrlRaw) {
          return new Response(
            JSON.stringify({ error: "Missing url parameter" }),
            { status: 400, headers: corsHeaders },
          );
        }

        // Forzar HTTPS para evitar que el redirect de PraxSuite bote los headers de Autorización
        if (imageUrlRaw.startsWith("http://api.praxsuite.com/")) {
          imageUrlRaw = imageUrlRaw.replace(
            "http://api.praxsuite.com/",
            "https://api.praxsuite.com/",
          );
        }

        const keys = [
          env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY,
          env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_PUBLIC_KEY,
          env.REACT_APP_PRAXSUITE_GAMES_STORES_PUBLIC_KEY,
        ].filter(Boolean);

        let imageResponse = null;
        for (const key of keys) {
          const attempt = await fetch(imageUrlRaw, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${key}`,
              Referer: "https://portal.praxsuite.com/",
            },
            redirect: "follow",
          });
          if (attempt.ok) {
            imageResponse = attempt;
            break;
          }
        }

        if (!imageResponse) {
          // Intento sin auth
          const fallbackResponse = await fetch(imageUrlRaw, {
            method: "GET",
            redirect: "follow",
          });
          if (!fallbackResponse.ok) throw new Error("Failed to fetch image");
          imageResponse = fallbackResponse;
        }

        return new Response(imageResponse.body, {
          status: imageResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type":
              imageResponse.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }

      // ENDPOINT: Juegos (GET a /api/games)
      if (url.pathname.includes("/api/games") && request.method === "GET") {
        const [gamesRows, platformRows, storeRows] = await Promise.all([
          fetchTable(
            env.PRAXSUITE_QUERY_URL,
            "VIDEOGAMES",
            env.REACT_APP_PRAXSUITE_GAMES_REF,
            env.REACT_APP_PRAXSUITE_GAMES_PUBLIC_KEY,
          ),
          fetchTable(
            env.PRAXSUITE_QUERY_URL,
            "VIDEOGAMES-PLATFORM",
            env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_REF,
            env.REACT_APP_PRAXSUITE_GAMES_PLATFORM_PUBLIC_KEY,
          ),
          fetchTable(
            env.PRAXSUITE_QUERY_URL,
            "VIDEOGAMES-STORES",
            env.REACT_APP_PRAXSUITE_GAMES_STORES_REF,
            env.REACT_APP_PRAXSUITE_GAMES_STORES_PUBLIC_KEY,
          ),
        ]);

        const platformByName = new Map(
          platformRows.map((row) => [
            normalizeName(
              row?.videogames_platform || row?.platform || row?.name,
            ),
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
          const platformNames = splitList(
            game?.["VIDEOGAMES-PLATFORM"] || game?.Platforms,
          );
          const storeKeys = splitList(
            game?.["VIDEOGAMES-STORES"] || game?.Stores,
          );
          const gameStoreRows = storeKeys
            .map((storeKey) => storeByKey.get(normalizeName(storeKey)))
            .filter(Boolean);

          const storeUrlByPlatform = new Map();
          gameStoreRows.forEach((storeRow) => {
            const storeUrl = String(
              storeRow?.store_url || storeRow?.url || "",
            ).trim();
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

        const finalPayload = {
          data: mergedGames,
          meta: { source: "games+platforms+stores (Worker)" },
        };

        return new Response(JSON.stringify(finalPayload), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      return new Response(JSON.stringify({ error: "Ruta no encontrada" }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({
          error: "Error interno del servidor",
          details: error.message,
        }),
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }
  },
};
