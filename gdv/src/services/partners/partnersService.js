import { extractRows } from "../praxsuite/praxsuiteClient";
import AbstractDigital from "../../img/partners/ABSTRACTDIGITAL.png";
import BabyTeam from "../../img/partners/BABYTEAM.png";
import CangrejoIdeas from "../../img/partners/CANGREJOIDEAS.png";
import Gudhar from "../../img/partners/GUDHAR.png";
import RamCandy from "../../img/partners/RAMCANDY.png";
import SlimeTeam from "../../img/partners/SLIMETEAM.png";
import TaeLao from "../../img/partners/TAE-LAO.png";
import ChileGamesDatabase from "../../img/partners/CHILEGAMESDATABASE.png";
import TangaraStudio from "../../img/partners/TANGARASTUDIO.png";
import TesseractLogo from "../../img/partners/TESSERACT.png";

const staticPartners = [
  {
    logo: AbstractDigital,
    website: "https://www.abstractdw.com/",
    name: "Abstract Digital",
  },
  { logo: BabyTeam, website: "https://babyteam.cl/", name: "Baby Team" },
  {
    logo: CangrejoIdeas,
    website: "https://cangrejoideas.com/",
    name: "Cangrejo Ideas",
  },
  { logo: Gudhar, website: "https://www.gudhar.com/", name: "GUDHAR" },
  { logo: RamCandy, website: "https://ramcandy.com/", name: "Ram Candy" },
  {
    logo: SlimeTeam,
    website: "https://www.slimeteam.com/",
    name: "Slime Team",
  },
  { logo: TaeLao, website: "https://tae-lao.itch.io/", name: "Tae Lao" },
  { logo: ChileGamesDatabase, website: "https://chilegamesdatabase.com/", name: "ChileGamesDatabase" },
  {
    logo: TangaraStudio,
    website: "https://tangara.studio/",
    name: "Tangara Studio",
  },
  {
    logo: TesseractLogo,
    website: "https://tesseractsoftwares.com/",
    name: "Tesseract",
  },
];

let cachedPartners = null;
let pendingPartnersRequest = null;

export function getStaticPartnersFallback() {
  return staticPartners.map((partner) => ({ ...partner }));
}

function getPartnersProvider() {
  return (
    process.env.REACT_APP_PRAXSUITE_PARTNERS_PROVIDER || "praxsuite"
  ).toLowerCase();
}

function getPartnersProxyBaseUrl() {
  return (process.env.REACT_APP_PARTNERS_PROXY_URL || "").replace(/\/$/, "");
}

function extractMediaRaw(value) {
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

function normalizeMediaSource(rawValue, cacheToken) {
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
    const proxyBase = getPartnersProxyBaseUrl();
    const suffix = cacheToken
      ? `&v=${encodeURIComponent(String(cacheToken))}`
      : "";
    return proxyBase
      ? `${proxyBase}/api/images/download?url=${encodeURIComponent(value)}${suffix}`
      : `/api/images/download?url=${encodeURIComponent(value)}${suffix}`;
  }

  return null;
}

function normalizePartner(raw, cacheToken) {
  const name = raw?.Partner || raw?.name || raw?.Name || raw?.Title || raw?.title || "";
  const website = raw?.["Partner URL"] || raw?.website || raw?.Website || raw?.url || raw?.URL || raw?.link || raw?.Link || "";
  
  const imageField = raw?.["Image Partner"] || raw?.logo || raw?.Logo || raw?.image || raw?.Image || raw?.icon || raw?.Icon;
  const logo = normalizeMediaSource(imageField, cacheToken);

  return {
    name,
    website,
    logo
  };
}

export async function fetchPartners({ force = false } = {}) {
  if (getPartnersProvider() !== "praxsuite") {
    const fallback = getStaticPartnersFallback();
    cachedPartners = fallback;
    pendingPartnersRequest = null;
    return fallback;
  }

  if (!force && cachedPartners) {
    return cachedPartners;
  }

  if (pendingPartnersRequest) {
    return pendingPartnersRequest;
  }

  pendingPartnersRequest = (async () => {
    try {
      const proxyBase = getPartnersProxyBaseUrl();
      const cacheToken = Date.now();
      const partnersApiUrl = proxyBase
        ? `${proxyBase}/api/partners?v=${cacheToken}`
        : `/api/partners?v=${cacheToken}`;
      const response = await fetch(partnersApiUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Partners backend returned status ${response.status}`);
      }

      const body = await response.json();
      const rows = extractRows(body);
      const normalized = rows.map((raw) =>
        normalizePartner(raw, raw.UPDATEDDATE || cacheToken)
      );

      const filtered = normalized.filter((p) => p && p.name && p.logo);

      if (!filtered.length) {
        return getStaticPartnersFallback();
      }

      cachedPartners = filtered;
      return filtered;
    } finally {
      pendingPartnersRequest = null;
    }
  })();

  try {
    return await pendingPartnersRequest;
  } catch (error) {
    console.warn("Partners backend fetch failed.", error);
    return getStaticPartnersFallback();
  }
}
