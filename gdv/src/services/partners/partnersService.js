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
import {
  getPraxsuitePartnersConfig,
  shouldLoadPartnersFromPraxsuite,
} from "../../config/appConfig";
import { fetchPraxsuiteTable } from "../praxsuite/praxsuiteApi";
import { resolveDisplayableMediaUrl } from "../praxsuite/praxsuiteMedia";

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
    logo: ChileGamesDatabase,
    website: "https://chilegamesdatabase.com/",
    name: "ChileGamesDatabase",
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

let cachedPartners = null;
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

async function normalizePartner(raw) {
  const name =
    raw?.Partner ||
    raw?.name ||
    raw?.Name ||
    raw?.Title ||
    raw?.title ||
    "";
  const rawWebsite =
    raw?.["Partner URL"] ||
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
    raw?.logo ||
    raw?.Logo ||
    raw?.image ||
    raw?.Image ||
    raw?.icon ||
    raw?.Icon;
  const cfg = getPraxsuitePartnersConfig();
  const logo = await resolveDisplayableMediaUrl(imageField, [cfg.apiKey]);

  return { name, website, logo };
}

export async function fetchPartners({ force = false } = {}) {
  if (!shouldLoadPartnersFromPraxsuite()) {
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
      const cfg = getPraxsuitePartnersConfig();
      const rows = await fetchPraxsuiteTable(
        cfg.queryUrl,
        cfg.table,
        cfg.ref,
        cfg.apiKey,
      );
      const normalized = await Promise.all(rows.map((raw) => normalizePartner(raw)));
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
    console.warn("Partners PraxSuite fetch failed:", error?.message || error);
    return getStaticPartnersFallback();
  }
}
