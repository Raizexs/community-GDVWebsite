// Simple in-memory rate limiting (Edge-local)
const rateLimitCache = new Map();

function checkRateLimit(ip, path) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = path.includes("/images") ? 180 : 120;
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

// In-memory cache for partners data (Edge-local)
let partnersCache = {
  data: null,
  timestamp: 0,
};
const PARTNERS_CACHE_TTL = 4000; // 4 seconds

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
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    data = { raw: text };
  }
  return data;
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Validar variables de entorno requeridas
    const requiredEnvVars = [
      "PRAXSUITE_QUERY_URL",
      "REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY",
      "REACT_APP_PRAXSUITE_PARTNERS_REF",
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
          env.REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY,
          env.PRAXSUITE_PUBLIC_KEY,
          env.PRAXSUITE_PRIVATE_KEY
        ].filter(Boolean);
        
        // Remover llaves duplicadas
        const uniqueKeys = [...new Set(keys)];

        let imageResponse = null;
        for (const key of uniqueKeys) {
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
            headers: {
              Referer: "https://portal.praxsuite.com/",
            },
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

      // ENDPOINT: Partners (GET a /api/partners)
      if (url.pathname.includes("/api/partners") && request.method === "GET") {
        const now = Date.now();
        if (
          partnersCache.data &&
          now - partnersCache.timestamp < PARTNERS_CACHE_TTL
        ) {
          return new Response(JSON.stringify(partnersCache.data), {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          });
        }

        const tableName = env.REACT_APP_PRAXSUITE_PARTNERS_TABLE || "PARTNERS";
        
        const data = await fetchTable(
          env.PRAXSUITE_QUERY_URL,
          tableName,
          env.REACT_APP_PRAXSUITE_PARTNERS_REF,
          env.REACT_APP_PRAXSUITE_PARTNERS_PUBLIC_KEY
        );

        partnersCache.data = data;
        partnersCache.timestamp = now;

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
      }

      return new Response(JSON.stringify({ error: "Ruta no encontrada" }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error(error);
      
      // Si hay un error, intentamos servir el caché anterior (stale cache)
      if (url.pathname.includes("/api/partners") && partnersCache.data) {
        return new Response(JSON.stringify(partnersCache.data), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
      }

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
