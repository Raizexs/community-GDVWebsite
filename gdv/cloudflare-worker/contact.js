// Simple in-memory rate limiting (Edge-local)
const rateLimitCache = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const limit = 5; // 5 peticiones por minuto
  const key = `contact-${ip}`;

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

    // Configuración de CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Manejar preflight OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Validar variables de entorno requeridas
    const requiredEnvVars = [
      "TURNSTILE_SECRET_KEY",
      "REACT_APP_PRAXSUITE_CONTACT_PUBLIC_KEY",
      "REACT_APP_PRAXSUITE_CONTACT_QUERY_URL",
      "REACT_APP_PRAXSUITE_CONTACT_REF",
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

    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit excedido. Intenta de nuevo más tarde.",
        }),
        {
          status: 429,
          headers: corsHeaders,
        },
      );
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const body = await request.json();
      const token = body.captchaToken || body["cf-turnstile-response"];

      if (!token) {
        return new Response(JSON.stringify({ error: "Captcha requerido" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      // 1. Validar Token en Cloudflare Turnstile
      const formData = new FormData();
      formData.append("secret", env.TURNSTILE_SECRET_KEY);
      formData.append("response", token);

      const turnstileVerify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        },
      );

      const outcome = await turnstileVerify.json();

      if (!outcome.success) {
        return new Response(
          JSON.stringify({ error: "Validación de Captcha fallida" }),
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      // 2. Si es humano, reenviar los datos a PraxSuite como "Insert Mutation"
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim();
      const subject = String(body.subject || "").trim();
      const message = String(body.message || "").trim();

      if (!name || !email || !subject || !message) {
        return new Response(
          JSON.stringify({ error: "Todos los campos son requeridos" }),
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      const table = "CONTACT";
      const ref = env.REACT_APP_PRAXSUITE_CONTACT_REF;

      const praxPayload = {
        refs: {
          [table]: ref,
        },
        mutation: {
          type: "insert",
          table: table,
          values: [
            {
              Name: name.substring(0, 255),
              Email: email.substring(0, 254),
              Subject: subject.substring(0, 500),
              Message: message.substring(0, 5000),
            },
          ],
          returning: ["ID", "Name", "Email", "Subject", "Message"],
        },
      };

      const praxsuiteResponse = await fetch(
        env.REACT_APP_PRAXSUITE_CONTACT_QUERY_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.REACT_APP_PRAXSUITE_CONTACT_PUBLIC_KEY}`,
          },
          body: JSON.stringify(praxPayload),
        },
      );

      if (!praxsuiteResponse.ok) {
        const errorText = await praxsuiteResponse.text();
        console.error("PraxSuite Contact Error:", errorText);
        return new Response(
          JSON.stringify({
            error: "Error procesando el formulario con el servidor final",
          }),
          {
            status: 502,
            headers: corsHeaders,
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Contact successfully submitted",
        }),
        {
          status: 200,
          headers: corsHeaders,
        },
      );
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
