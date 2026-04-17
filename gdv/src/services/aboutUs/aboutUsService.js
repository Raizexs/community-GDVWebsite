import { extractRows } from "../praxsuite/praxsuiteClient";
import aboutusFallback from "../../img/AboutUSImages/GDV.jpg";

let cachedAboutUsContent = null;
let pendingAboutUsRequest = null;

export function getCachedAboutUsContent() {
  return cachedAboutUsContent;
}

function getAboutUsProxyBaseUrl() {
  return (process.env.REACT_APP_ABOUT_US_PROXY_URL || "").replace(/\/$/, "");
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
  if (value.toLowerCase() === "null") return null;

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
    const proxyBase = getAboutUsProxyBaseUrl();
    const suffix = cacheToken
      ? `&v=${encodeURIComponent(String(cacheToken))}`
      : "";
    return proxyBase
      ? `${proxyBase}/api/images/download?url=${encodeURIComponent(value)}${suffix}`
      : `/api/images/download?url=${encodeURIComponent(value)}${suffix}`;
  }

  return null;
}

function normalizeAboutRow(raw, cacheToken) {
  const imageField = getField(raw, ["Image", "IMAGE", "image"]);
  const imageArray = Array.isArray(imageField) ? imageField : [];
  const imageUrlRaw =
    imageArray[0]?.DownloadUrl ||
    imageArray[0]?.BlobUrl ||
    (typeof imageField === "string" ? imageField : null);

  return {
    titleEs: getField(raw, ["Title (ES)", "title (es)", "Title ES"]),
    titleEn: getField(raw, ["Title (EN)", "title (en)", "Title EN"]),
    contentEs: getField(raw, [
      "Contentss (ES)",
      "Contents (ES)",
      "Content (ES)",
    ]),
    contentEn: getField(raw, [
      "Contentss (EN)",
      "Contents (EN)",
      "Content (EN)",
    ]),
    imageUrl: normalizeMediaSource(imageUrlRaw, cacheToken),
    linkedInUrl: getField(raw, [
      "LinkedIn URL",
      "Linkedin URL",
      "linkedin url",
    ]),
    isActive: getField(raw, ["isActive", "IsActive", "active"]),
  };
}

function normalizeMemberRow(raw, cacheToken) {
  const photoField = getField(raw, ["Photo", "photo", "Image", "image"]);
  const photoArray = Array.isArray(photoField) ? photoField : [];
  const photoRaw =
    photoArray[0]?.DownloadUrl ||
    photoArray[0]?.BlobUrl ||
    (typeof photoField === "string" ? photoField : null);

  return {
    name: getField(raw, ["Name", "name", "Title (ES)", "Title (EN)"]),
    roleEs: getField(raw, [
      "Role (ES)",
      "Rol (ES)",
      "role (es)",
      "Contentss (ES)",
    ]),
    roleEn: getField(raw, [
      "Role (EN)",
      "Rol (EN)",
      "role (en)",
      "Contentss (EN)",
    ]),
    profile: normalizeMediaSource(photoRaw, cacheToken),
    linkedInUrl: getField(raw, [
      "LinkedIn URL",
      "Linkedin URL",
      "linkedin url",
    ]),
    isActive: getField(raw, ["isActive", "IsActive", "active"]),
  };
}

function getSectionByTitle(rows, titleEs, titleEn) {
  return rows.find((row) => {
    const es = String(row.titleEs || "")
      .trim()
      .toLowerCase();
    const en = String(row.titleEn || "")
      .trim()
      .toLowerCase();
    return es === titleEs.toLowerCase() || en === titleEn.toLowerCase();
  });
}

function buildAboutUsContent(sectionRows, memberRows) {
  const sections = sectionRows.filter((r) => r.isActive !== false);
  const members = memberRows
    .filter((r) => r.isActive !== false)
    .map((r) => ({
      name: r.name,
      roleEs: r.roleEs,
      roleEn: r.roleEn,
      profile: r.profile,
      linkedInUrl: r.linkedInUrl,
    }));

  const firstTextRow = sections.find((r) => r.contentEs || r.contentEn) || {};
  const aboutHeader =
    getSectionByTitle(sections, "Sobre nosotros", "About us") || firstTextRow;
  const whoWeAre =
    getSectionByTitle(sections, "Quiénes somos", "Who we are") || {};
  const ourAssociation =
    getSectionByTitle(sections, "Nuestra asociación", "Our association") || {};
  const values = getSectionByTitle(sections, "Valores", "Values") || {};
  const objectives =
    getSectionByTitle(sections, "Objetivos", "Objectives") || {};
  const vision = getSectionByTitle(sections, "Visión", "Vision") || {};
  const heroImageRow =
    sections.find(
      (r) => r.imageUrl && String(r.titleEn || "").toLowerCase() === "about us",
    ) || sections.find((r) => r.imageUrl);

  return {
    title: {
      es: aboutHeader.contentEs,
      en: aboutHeader.contentEn,
    },
    whoWeAre: {
      title: {
        es: whoWeAre.titleEs || "Quiénes somos",
        en: whoWeAre.titleEn || "Who we are",
      },
      description: {
        es: whoWeAre.contentEs,
        en: whoWeAre.contentEn,
      },
    },
    ourAssociation: {
      title: {
        es: ourAssociation.titleEs || "Nuestra asociación",
        en: ourAssociation.titleEn || "Our association",
      },
      description: {
        es: ourAssociation.contentEs,
        en: ourAssociation.contentEn,
      },
    },
    values: {
      title: {
        es: values.titleEs || "Valores",
        en: values.titleEn || "Values",
      },
      description: {
        es: values.contentEs,
        en: values.contentEn,
      },
    },
    objectives: {
      title: {
        es: objectives.titleEs || "Objetivos",
        en: objectives.titleEn || "Objectives",
      },
      description: {
        es: objectives.contentEs,
        en: objectives.contentEn,
      },
    },
    vision: {
      title: {
        es: vision.titleEs || "Visión",
        en: vision.titleEn || "Vision",
      },
      description: {
        es: vision.contentEs,
        en: vision.contentEn,
      },
    },
    heroImage: heroImageRow?.imageUrl || aboutusFallback,
    members,
  };
}

export async function fetchAboutUsContent({ force = false } = {}) {
  const provider = (
    process.env.REACT_APP_PRAXSUITE_ABOUT_US_PROVIDER || "static"
  ).toLowerCase();
  if (provider !== "praxsuite") {
    cachedAboutUsContent = null;
    pendingAboutUsRequest = null;
    return null;
  }

  if (!force && cachedAboutUsContent) {
    return cachedAboutUsContent;
  }

  if (!force && pendingAboutUsRequest) {
    return pendingAboutUsRequest;
  }

  pendingAboutUsRequest = (async () => {
    try {
      const cacheToken = Date.now();
      const proxyBase = getAboutUsProxyBaseUrl();
      const aboutApiUrl = proxyBase
        ? `${proxyBase}/api/about-us?v=${cacheToken}`
        : `/api/about-us?v=${cacheToken}`;

      const response = await fetch(aboutApiUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`AboutUs backend returned status ${response.status}`);
      }

      const body = await response.json();
      const sectionRows = extractRows(body?.sections || body).map((raw) =>
        normalizeAboutRow(raw, cacheToken),
      );
      const memberRows = extractRows(body?.members || []).map((raw) =>
        normalizeMemberRow(raw, cacheToken),
      );
      if (!sectionRows.length) {
        return cachedAboutUsContent;
      }

      const content = buildAboutUsContent(sectionRows, memberRows);
      cachedAboutUsContent = content;
      return content;
    } catch (error) {
      console.warn(
        "AboutUs backend fetch failed, using i18n/static fallback.",
        error,
      );
      return cachedAboutUsContent;
    } finally {
      pendingAboutUsRequest = null;
    }
  })();

  try {
    return await pendingAboutUsRequest;
  } catch (error) {
    console.warn("AboutUs request failed.", error);
    return null;
  }
}
