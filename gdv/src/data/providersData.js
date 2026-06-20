import logoVgchile from "../img/providers/vgchile.svg";
import logoChileGamesDatabase from "../img/providers/chile-games-database.svg";
import logoProchile from "../img/providers/prochile.svg";
import logoPraxsuite from "../img/providers/praxsuite.svg";
import logoExpertosContables from "../img/providers/expertos-contables.svg";

/** Logos locales por id de aliado (fallback cuando PraxSuite no entrega Logo). */
export const PROVIDER_IMAGES = {
  vgchile: logoVgchile,
  "chile-games-database": logoChileGamesDatabase,
  prochile: logoProchile,
  praxsuite: logoPraxsuite,
  "expertos-contables": logoExpertosContables,
};

export const PROVIDER_CATEGORIES = [
  "all",
  "guild",
  "catalog",
  "international",
  "devTools",
  "legalAccounting",
];

const CATEGORY_HEADER_CLASS = {
  guild: "provider-header-devtools",
  catalog: "provider-header-cloud",
  international: "provider-header-marketing",
  devTools: "provider-header-devtools",
  legalAccounting: "provider-header-marketing",
};

export function resolveProviderHeaderClass(category, headerClass) {
  if (headerClass) return headerClass;
  return CATEGORY_HEADER_CLASS[category] || "provider-header-default";
}

export const staticProviders = [
  {
    id: "vgchile",
    category: "guild",
    headerClass: "provider-header-devtools",
    logo: PROVIDER_IMAGES.vgchile,
    name: {
      es: "VGChile",
      en: "VGChile",
    },
    tag: {
      es: "Gremio nacional",
      en: "National guild",
    },
    description: {
      es: "Red nacional que representa, conecta y visibiliza a la industria chilena de videojuegos.",
      en: "National network that represents, connects, and showcases the Chilean video game industry.",
    },
    website: "https://www.videogameschile.com/",
    isActive: true,
  },
  {
    id: "chile-games-database",
    category: "catalog",
    headerClass: "provider-header-cloud",
    logo: PROVIDER_IMAGES["chile-games-database"],
    name: {
      es: "Chile Games Database",
      en: "Chile Games Database",
    },
    tag: {
      es: "Catálogo / vitrina",
      en: "Catalog / showcase",
    },
    description: {
      es: "Plataforma para descubrir juegos, estudios y proyectos desarrollados en Chile.",
      en: "Platform to discover games, studios, and projects developed in Chile.",
    },
    website: "https://www.chilegamesdatabase.com/",
    isActive: true,
  },
  {
    id: "prochile",
    category: "international",
    headerClass: "provider-header-marketing",
    logo: PROVIDER_IMAGES.prochile,
    name: {
      es: "ProChile",
      en: "ProChile",
    },
    tag: {
      es: "Internacionalización",
      en: "Internationalization",
    },
    description: {
      es: "Apoyo para ferias, exportación, misiones comerciales y conexión con mercados globales.",
      en: "Support for trade fairs, export, trade missions, and connections with global markets.",
    },
    website: "https://www.prochile.gob.cl/",
    isActive: true,
  },
  {
    id: "praxsuite",
    category: "devTools",
    headerClass: "provider-header-devtools",
    logo: PROVIDER_IMAGES.praxsuite,
    name: {
      es: "PraxSuite",
      en: "PraxSuite",
    },
    tag: {
      es: "Plataforma / tecnología",
      en: "Platform / technology",
    },
    description: {
      es: "Plataforma que impulsa la gestión y operación digital del gremio y sus aliados.",
      en: "Platform powering digital management and operations for the guild and its allies.",
    },
    website: "https://praxsuite.com/es/",
    isActive: true,
  },
  {
    id: "expertos-contables",
    category: "legalAccounting",
    headerClass: "provider-header-marketing",
    logo: PROVIDER_IMAGES["expertos-contables"],
    name: {
      es: "Expertos Contables",
      en: "Expertos Contables",
    },
    tag: {
      es: "Legal y contabilidad",
      en: "Legal and accounting",
    },
    description: {
      es: "Asesoría contable y tributaria para estudios y empresas del ecosistema de videojuegos.",
      en: "Accounting and tax advisory for studios and companies in the video game ecosystem.",
    },
    website: "https://www.econtablesytributarios.cl/",
    isActive: true,
  },
];

export function getStaticProviders() {
  return staticProviders
    .filter((provider) => provider.isActive !== false)
    .map((provider) => ({
      ...provider,
      logo: provider.logo || PROVIDER_IMAGES[provider.id] || "",
    }));
}

export function getProviderImage(providerId) {
  return PROVIDER_IMAGES[providerId] || "";
}
