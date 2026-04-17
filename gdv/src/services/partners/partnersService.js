import { extractRows } from "../praxsuite/praxsuiteClient";

import AbstractDigital from "../../img/partners/Logo Abstract - color horizontal.png";
import BabyTeam from "../../img/partners/BABYTEAM.png";
import CangrejoIdeas from "../../img/partners/logo_cangrejo_color.png";
import Gudhar from "../../img/partners/Gudhar_sinfondo (1).png";
import RamCandy from "../../img/partners/Logo_color_02.png";
import SlimeTeam from "../../img/partners/LOGO_B_NB512.png";
import TaeLao from "../../img/partners/logo02-vertical-light.png";
import TangaraStudio from "../../img/partners/logo01-horizontal-light.png";
import TesseractLogo from "../../img/partners/Tesseract Logo Black cortado.png";

const provider = (process.env.REACT_APP_PRAXSUITE_PARTNERS_PROVIDER || "static").toLowerCase();
let cachedPartners = null;
let pendingPartnersRequest = null;

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

function getPartnersProxyBaseUrl() {
  return (process.env.REACT_APP_PARTNERS_PROXY_URL || "").replace(/\/$/, "");
}

function getField(raw, candidates) {
  for (const key of candidates) {
    if (raw?.[key] != null) return raw[key];
  }

  if (!raw || typeof raw !== "object") return undefined;
  const normalizedMap = Object.keys(raw).reduce((acc, key) => {
    acc[key.toLowerCase()] = raw[key];
    return acc;
  }, {});

  for (const key of candidates) {
    const value = normalizedMap[key.toLowerCase()];
    if (value != null) return value;
  }

  return undefined;
}

function normalizeMediaSource(rawValue, cacheToken) {
  if (typeof rawValue !== "string") return null;
  let value = rawValue.trim();
  if (!value) return null;

  value = value.replace(/\s+null$/i, "");
  if (value.startsWith("data:")) return value;
  if (value.includes(";base64,")) {
    return value.startsWith("image/") ? `data:${value}` : `data:image/png;${value}`;
  }

  if (/^https?:\/\/.*blob\.core\.windows\.net/i.test(value)) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    const proxyBase = getPartnersProxyBaseUrl();
    const suffix = cacheToken ? `&v=${encodeURIComponent(String(cacheToken))}` : "";
    return proxyBase
      ? `${proxyBase}/api/images/download?url=${encodeURIComponent(value)}${suffix}`
      : `/api/images/download?url=${encodeURIComponent(value)}${suffix}`;
  }

  return value;
}

function normalizePartner(raw, cacheToken) {
  const imageField = getField(raw, [
    "IMAGE PARTNER",
    "Image Partner",
    "image partner",
    "Logo",
    "logo",
    "LogoUrl",
    "logoUrl",
  ]);
  const imagesArray = Array.isArray(imageField) ? imageField : [];
  const imageUrlRaw =
    imagesArray[0]?.DownloadUrl ||
    imagesArray[0]?.BlobUrl ||
    (typeof imageField === "string" ? imageField : null) ||
    getField(raw, ["LogoUrl", "logoUrl", "logo"]);
  const normalizedImage = normalizeMediaSource(imageUrlRaw, cacheToken);

  return {
    id: String(getField(raw, ["ID", "id", "Id", "PARTNER", "Partner", "name"]) ?? ""),
    name: getField(raw, ["PARTNER", "Partner", "Name", "name"]),
    website: getField(raw, ["PARTNER URL", "Partner URL", "Website", "website"]),
    logoUrl: normalizedImage,
  };
}

export async function fetchPartners({ force = false } = {}) {
  if (provider !== "praxsuite") {
    cachedPartners = staticPartners;
    pendingPartnersRequest = null;
    return staticPartners;
  }

  if (!force && cachedPartners) {
    return cachedPartners;
  }

  if (!force && pendingPartnersRequest) {
    return pendingPartnersRequest;
  }

  pendingPartnersRequest = (async () => {
    const cacheToken = Date.now();
    const proxyBase = getPartnersProxyBaseUrl();
    const partnersApiUrl = proxyBase
      ? `${proxyBase}/api/partners?v=${cacheToken}`
      : `/api/partners?v=${cacheToken}`;

    const response = await fetch(partnersApiUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Partners backend returned status ${response.status}`);
    }

    const body = await response.json();
    const rows = extractRows(body);

    const normalized = rows
      .map((r) => normalizePartner(r, r.UPDATEDDATE || cacheToken))
      .filter((p) => p?.name);

    const partners = normalized.map((p) => ({
      name: p.name,
      website: p.website,
      logo: p.logoUrl,
    }));

    cachedPartners = partners;
    return partners;
  })();

  try {
    return await pendingPartnersRequest;
  } catch (error) {
    console.warn("Partners backend fetch failed, using static fallback.", error);
    pendingPartnersRequest = null;
    return staticPartners;
  } finally {
    pendingPartnersRequest = null;
  }
}
