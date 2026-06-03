const LEGACY_GATEWAY_URL_PATTERN =
  /^https?:\/\/api\.praxsuite\.com\/api\/v1\/gateway\/([0-9a-f-]+)\/(.+?)\/?$/i;

export function resolvePraxsuiteGatewayUrl(url) {
  if (!url || typeof url !== "string") return url;

  const trimmed = url.trim();
  const legacyMatch = trimmed.match(LEGACY_GATEWAY_URL_PATTERN);

  if (legacyMatch) {
    return `https://gateway.praxsuite.com/${legacyMatch[1]}/${legacyMatch[2]}`;
  }

  return trimmed.replace(/\/$/, "");
}
