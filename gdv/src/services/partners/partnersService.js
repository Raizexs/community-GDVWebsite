import AbstractDigital from "../../img/partners/ABSTRACTDIGITAL.png";
import BabyTeam from "../../img/partners/BABYTEAM.png";
import CangrejoIdeas from "../../img/partners/CANGREJOIDEAS.png";
import Gudhar from "../../img/partners/GUDHAR.png";
import RamCandy from "../../img/partners/RAMCANDY.png";
import SlimeTeam from "../../img/partners/SLIMETEAM.png";
import TaeLao from "../../img/partners/TAE-LAO.png";
import Panpipe from "../../img/partners/panpipe.png";
import TangaraStudio from "../../img/partners/TANGARASTUDIO.png";
import TesseractLogo from "../../img/partners/TESSERACT.png";
import { shouldLoadPartnersFromPraxsuite } from "../../config/appConfig";
import {
  fetchPartnersRows,
  getPartnersApiKeys,
} from "../praxsuite/praxsuitePartners";
import { resolveDisplayableMediaUrl } from "../praxsuite/praxsuiteMedia";
import {
  canLoadFromPraxsuite,
  logPraxsuiteError,
} from "../praxsuite/praxsuiteSecurity";

const PARTNERS_UI_CACHE_TTL_MS = 4000;

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
    logo: Panpipe,
    website: "https://panpipestudio.com/",
    name: "Panpipe Studio",
  },
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

let partnersUiCache = {
  data: null,
  timestamp: 0,
};
let pendingPartnersRequest = null;

export function getStaticPartnersFallback() {
  return staticPartners.map((partner) => ({ ...partner }));
}

function normalizePartnerName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** URLs conocidas del fallback cuando PraxSuite trae el campo vacío o mal formado */
const KNOWN_PARTNER_URLS = Object.fromEntries(
  staticPartners.map((p) => [normalizePartnerName(p.name), p.website]),
);

function normalizeWebsiteUrl(raw) {
  let url = String(raw || "").trim();
  if (!url || url === "#" || url === "-") return "";

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/+/, "")}`;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

function resolvePartnerWebsite(name, rawUrl) {
  const fromTable = normalizeWebsiteUrl(rawUrl);
  if (fromTable) return fromTable;
  return KNOWN_PARTNER_URLS[normalizePartnerName(name)] || "";
}

async function normalizePartner(raw, apiKeys) {
  const name =
    raw?.Partner ||
    raw?.Miembro ||
    raw?.["Nombre (ES)"] ||
    raw?.name ||
    raw?.Name ||
    raw?.Title ||
    raw?.title ||
    "";
  const rawWebsite =
    raw?.["Partner URL"] ||
    raw?.["Miembro URL"] ||
    raw?.website ||
    raw?.Website ||
    raw?.url ||
    raw?.URL ||
    raw?.link ||
    raw?.Link ||
    "";
  const website = resolvePartnerWebsite(name, rawWebsite);

  const imageField =
    raw?.["Image Partner"] ||
    raw?.["Image Miembro"] ||
    raw?.["Logo Miembro"] ||
    raw?.logo ||
    raw?.Logo ||
    raw?.image ||
    raw?.Image ||
    raw?.icon ||
    raw?.Icon;

  const logo = await resolveDisplayableMediaUrl(imageField, apiKeys, {
    rateLimitBucket: "membersMedia",
  });

  return { name, website, logo };
}

async function loadPartnersFromPraxsuite({ force = false } = {}) {
  const apiKeys = getPartnersApiKeys();
  const rows = await fetchPartnersRows({ force });
  const normalized = await Promise.all(
    rows.map((raw) => normalizePartner(raw, apiKeys)),
  );
  const filtered = normalized.filter((p) => p && p.name && p.logo);

  if (!filtered.length) {
    return getStaticPartnersFallback();
  }

  return filtered;
}

export async function fetchPartners({ force = false } = {}) {
  if (!shouldLoadPartnersFromPraxsuite()) {
    const fallback = getStaticPartnersFallback();
    partnersUiCache = { data: fallback, timestamp: Date.now() };
    pendingPartnersRequest = null;
    return fallback;
  }

  const now = Date.now();
  if (
    !force &&
    partnersUiCache.data &&
    now - partnersUiCache.timestamp < PARTNERS_UI_CACHE_TTL_MS
  ) {
    return partnersUiCache.data;
  }

  if (!canLoadFromPraxsuite("members")) {
    return getStaticPartnersFallback();
  }

  if (pendingPartnersRequest) {
    return pendingPartnersRequest;
  }

  pendingPartnersRequest = (async () => {
    try {
      const data = await loadPartnersFromPraxsuite({ force });
      partnersUiCache = { data, timestamp: Date.now() };
      return data;
    } finally {
      pendingPartnersRequest = null;
    }
  })();

  try {
    return await pendingPartnersRequest;
  } catch (error) {
    logPraxsuiteError("fetchPartners", error);

    if (partnersUiCache.data?.length) {
      return partnersUiCache.data;
    }

    return getStaticPartnersFallback();
  }
}
