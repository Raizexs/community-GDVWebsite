import { resolvePraxsuiteGatewayUrl } from "./praxsuiteGateway";
import {
  assertAllowedMediaUrl,
  assertClientRateLimit,
  isAllowedMediaUrl,
  logPraxsuiteError,
  PraxsuiteErrorCode,
} from "./praxsuiteSecurity";

export function extractMediaRaw(value) {
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

export function normalizeMediaSourceSync(rawValue) {
  const mediaRaw = extractMediaRaw(rawValue);
  if (typeof mediaRaw !== "string") return null;

  let value = mediaRaw.trim();
  if (!value) return null;

  value = value.replace(/\s+null$/i, "");

  if (value.startsWith("data:")) return value;
  if (value.includes(";base64,")) {
    return value.startsWith("image/")
      ? `data:${value}`
      : `data:image/png;${value}`;
  }

  if (/^https?:\/\/.*blob\.core\.windows\.net/i.test(value)) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    const resolved = resolvePraxsuiteGatewayUrl(value);
    return isAllowedMediaUrl(resolved) ? resolved : null;
  }

  return null;
}

/** Azure Blob y URLs públicas: usar directo en <img> sin gastar cupo media ni Bearer. */
export function canUseDirectMediaUrl(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return false;
  }
  return /blob\.core\.windows\.net/i.test(url);
}

async function fetchWithApiKeys(url, apiKeys, rateLimitBucket = "media") {
  assertClientRateLimit(rateLimitBucket);
  assertAllowedMediaUrl(url);

  for (const key of apiKeys) {
    const attempt = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        Referer: "https://portal.praxsuite.com/",
      },
      redirect: "follow",
    });
    if (attempt.ok) return attempt;
  }

  return fetch(url, {
    method: "GET",
    headers: { Referer: "https://portal.praxsuite.com/" },
    redirect: "follow",
  });
}

export async function resolveDisplayableMediaUrl(
  rawValue,
  apiKeys = [],
  { rateLimitBucket = "media" } = {},
) {
  const syncUrl = normalizeMediaSourceSync(rawValue);
  if (!syncUrl || !syncUrl.startsWith("http")) return syncUrl;

  if (canUseDirectMediaUrl(syncUrl)) {
    return syncUrl;
  }

  const uniqueKeys = [...new Set(apiKeys.filter(Boolean))];
  if (!uniqueKeys.length) return syncUrl;

  try {
    const response = await fetchWithApiKeys(syncUrl, uniqueKeys, rateLimitBucket);
    if (!response.ok) return syncUrl;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    if (error?.code === PraxsuiteErrorCode.RATE_LIMIT) {
      throw error;
    }
    logPraxsuiteError("resolveDisplayableMediaUrl", error, { url: syncUrl });
    return syncUrl;
  }
}
