/** Pantalla “Algo épico está en desarrollo…” (ErrorPage). */
export const MEMBERSHIP_WIP_ROUTE = "/...";

const PLACEHOLDER_JOIN_URLS = new Set(["", "...", "/socios"]);

export function resolveMembershipJoinUrl(url) {
  const raw = String(url ?? "").trim();
  if (PLACEHOLDER_JOIN_URLS.has(raw)) {
    return MEMBERSHIP_WIP_ROUTE;
  }
  return raw;
}
