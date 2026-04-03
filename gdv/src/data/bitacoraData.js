import levelUp2025 from "../img/bitacora/level-up-2025.png";
import clusterVideojuegos2025 from "../img/bitacora/cluster-videojuegos-2025.png";
import cienJuegos2025 from "../img/bitacora/100-juegos-2025.png";
import mendozagamegdvalpo from "../img/bitacora/mendoza-game-gdv.png";
import fecichPlay from "../img/bitacora/fecich-play.png";
import fecichPlayCharla01 from "../img/bitacora/fecich-play-charla01.png";
import fecichPlayCharla02 from "../img/bitacora/fecich-play-charla02.png";
import fecichColab from "../img/bitacora/fecich-colaboradores.png";
import webinarInternational from "../img/bitacora/webinar-international.png";
import webinarInternational2 from "../img/bitacora/webinar-international-2.png";

const bitacoraImages = {
  "level-up-2025.png": levelUp2025,
  "cluster-videojuegos-2025.png": clusterVideojuegos2025,
  "100-juegos-2025.png": cienJuegos2025,
  "mendoza-game-gdv.png": mendozagamegdvalpo,
  "fecich-play.png": fecichPlay,
  "fecich-play-charla01.png": fecichPlayCharla01,
  "fecich-play-charla02.png": fecichPlayCharla02,
  "fecich-colaboradores.png": fecichColab,
  "webinar-international.png": webinarInternational,
  "webinar-international-2.png": webinarInternational2,
};

const getBitacoraImage = (filename) => {
  return bitacoraImages[filename] || levelUp2025;
};

export const bitacoraEntries = [
  {
    id: "entry-001",
    slug: "fecich-play-nuevas-experiencias-narrativas",
    titleKey: "bitacora.entries.entry001.title",
    subtitleKey: "bitacora.entries.entry001.subtitle",
    summaryKey: "bitacora.entries.entry001.summary",
    contentKey: "bitacora.entries.entry001.content",
    featuredImage: {
      url: getBitacoraImage("fecich-play.png"),
      alt: "FECICH PLAY - Nuevas Experiencias Narrativas en Quilpué",
      caption:
        "Showcase de videojuegos chilenos en Centro Cultural Daniel de la Vega",
    },
    gallery: [
      {
        url: getBitacoraImage("fecich-play-charla01.png"),
        alt: "FECICH PLAY - Nuevas Experiencias Narrativas",
        caption: "Showcase de videojuegos chilenos en Quilpué",
      },
      {
        url: getBitacoraImage("fecich-play-charla02.png"),
        alt: "FECICH PLAY - Nuevas Experiencias Narrativas",
        caption: "Showcase de videojuegos chilenos en Quilpué",
      },
      {
        url: getBitacoraImage("fecich-colaboradores.png"),
        alt: "FECICH PLAY - Nuevas Experiencias Narrativas",
        caption: "Showcase de videojuegos chilenos en Quilpué",
      },
    ],
    category: "eventos",
    tags: [
      "fecich",
      "quilpué",
      "showcase",
      "videojuegos chilenos",
      "valparaíso creativo",
    ],
    tagsKey: "bitacora.entries.entry001.tags",
    publishedAt: "2026-01-22T10:00:00Z",
    author: {
      name: "Comisión de Eventos",
      role: "Coordinación GDV",
    },
    status: "published",
    featured: true,
    createdAt: "2026-01-22T09:00:00Z",
    updatedAt: "2026-01-22T10:00:00Z",
    seo: {
      metaTitleKey: "bitacora.entries.entry001.seo.title",
      metaDescriptionKey: "bitacora.entries.entry001.seo.description",
      keywordsKey: "bitacora.entries.entry001.seo.keywords",
    },
  },
  {
    id: "entry-002",
    slug: "level-up-2025-cluster-videojuegos-valdoza",
    titleKey: "bitacora.entries.entry002.title",
    subtitleKey: "bitacora.entries.entry002.subtitle",
    summaryKey: "bitacora.entries.entry002.summary",
    contentKey: "bitacora.entries.entry002.content",
    featuredImage: {
      url: getBitacoraImage("mendoza-game-gdv.png"),
      alt: "Level Up 2025 - Lanzamiento Clúster de Videojuegos",
      caption: "Evento de lanzamiento del Clúster en Mendoza TIC",
    },
    gallery: [
      {
        url: getBitacoraImage("level-up-2025.png"),
        alt: "Level Up 2025 - Lanzamiento Clúster",
        caption: "Evento de lanzamiento del Clúster en Mendoza TIC",
      },
      {
        url: getBitacoraImage("cluster-videojuegos-2025.png"),
        alt: "Clúster de Videojuegos 2025",
        caption: "Presentación del Clúster de Videojuegos",
      },
      {
        url: getBitacoraImage("100-juegos-2025.png"),
        alt: "100 Juegos 2025",
        caption: "Exhibición de videojuegos participantes",
      },
    ],
    category: "hitos",
    tags: [
      "level up",
      "clúster",
      "valdoza",
      "mendoza",
      "binacional",
      "festival",
    ],
    tagsKey: "bitacora.entries.entry002.tags",
    publishedAt: "2025-12-03T14:00:00Z",
    author: {
      name: "Comisión Internacional",
      role: "Relaciones Binacionales",
    },
    status: "published",
    featured: true,
    createdAt: "2025-12-03T12:00:00Z",
    updatedAt: "2025-12-03T14:00:00Z",
    seo: {
      metaTitleKey: "bitacora.entries.entry002.seo.title",
      metaDescriptionKey: "bitacora.entries.entry002.seo.description",
      keywordsKey: "bitacora.entries.entry002.seo.keywords",
    },
  },
  {
    id: "entry-003",
    slug: "webinar-internacional-propiedad-intelectual-videojuegos",
    titleKey: "bitacora.entries.entry003.title",
    subtitleKey: "bitacora.entries.entry003.subtitle",
    summaryKey: "bitacora.entries.entry003.summary",
    contentKey: "bitacora.entries.entry003.content",
    featuredImage: {
      url: getBitacoraImage("webinar-international.png"),
      alt: "Webinar Internacional sobre Propiedad Intelectual en Videojuegos",
      caption: "Evento organizado por OMPI con participación de GDV Valparaíso",
    },
    gallery: [
      {
        url: getBitacoraImage("webinar-international-2.png"),
        alt: "Webinar Internacional sobre Propiedad Intelectual en Videojuegos",
        caption: "Evento organizado por OMPI con participación de GDV Valparaíso",
      },
    ],
    category: "eventos",
    tags: [
      "propiedad intelectual",
      "webinar",
      "ompi",
      "legal",
      "internacional",
    ],
    tagsKey: "bitacora.entries.entry003.tags",
    publishedAt: "2025-12-09T15:00:00Z",
    author: {
      name: "Comisión de Capacitación",
      role: "Coordinación GDV",
    },
    status: "published",
    featured: true,
    createdAt: "2025-12-09T14:00:00Z",
    updatedAt: "2025-12-09T15:00:00Z",
    seo: {
      metaTitleKey: "bitacora.entries.entry003.seo.title",
      metaDescriptionKey: "bitacora.entries.entry003.seo.description",
      keywordsKey: "bitacora.entries.entry003.seo.keywords",
    },
  },
];

export const getPublishedEntries = () => {
  return bitacoraEntries
    .filter((entry) => entry.status === "published")
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};

export const getFeaturedEntries = () => {
  return getPublishedEntries().filter((entry) => entry.featured);
};

export const getEntriesByCategory = (category) => {
  if (!category || category === "all") {
    return getPublishedEntries();
  }
  return getPublishedEntries().filter((entry) => entry.category === category);
};

export const getEntryBySlug = (slug) => {
  return bitacoraEntries.find(
    (entry) => entry.slug === slug && entry.status === "published",
  );
};

export const getRelatedEntries = (entryId, limit = 3) => {
  const currentEntry = bitacoraEntries.find((entry) => entry.id === entryId);
  if (!currentEntry) return [];

  return getPublishedEntries()
    .filter(
      (entry) =>
        entry.id !== entryId && entry.category === currentEntry.category,
    )
    .slice(0, limit);
};

export const formatDate = (isoDate, locale = "es-CL") => {
  return new Date(isoDate).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getPaginatedEntries = (page = 1, perPage = 9, category = null) => {
  const entries = category
    ? getEntriesByCategory(category)
    : getPublishedEntries();
  const totalPages = Math.ceil(entries.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  return {
    entries: entries.slice(startIndex, endIndex),
    totalPages,
    currentPage: page,
    totalEntries: entries.length,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const BITACORA_CATEGORIES = {
  ALL: "all",
  ACTIVIDADES: "actividades",
  TRAVESIAS: "travesias",
  HITOS: "hitos",
  EVENTOS: "eventos",
};

export const CATEGORY_COLORS = {
  actividades: {
    bg: "bg-[#24C5D7]",
    text: "text-[#24C5D7]",
    border: "border-[#24C5D7]",
  },
  travesias: {
    bg: "bg-[#2657EB]",
    text: "text-[#2657EB]",
    border: "border-[#2657EB]",
  },
  hitos: {
    bg: "bg-[#DE6161]",
    text: "text-[#DE6161]",
    border: "border-[#DE6161]",
  },
  eventos: {
    bg: "bg-[#8882a6]",
    text: "text-[#8882a6]",
    border: "border-[#8882a6]",
  },
};