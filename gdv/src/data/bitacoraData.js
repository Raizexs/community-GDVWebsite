import staticPosts from "./bitacoraPosts.json";

import coverLags from "../img/bitacora/lags.jpg";
import coverOjoDePescado from "../img/bitacora/ojo-de-pescado.jpg";
import coverFecich from "../img/bitacora/fecich-play.png";
import fecichPlay01 from "../img/bitacora/fecich-play-01.png";
import fecichPlay02 from "../img/bitacora/fecich-play-02.png";
import fecichPlay03 from "../img/bitacora/fecich-play-03.png";
import coverWebinar from "../img/bitacora/webinar-internacional.jpg";
import webinar01 from "../img/bitacora/webinar-internacional-01.jpg";
import coverLevelUp from "../img/bitacora/level-up.jpg";
import levelUp01 from "../img/bitacora/level-up-01.jpg";
import levelUp02 from "../img/bitacora/level-up-02.jpg";
import levelUp03 from "../img/bitacora/level-up-03.jpg";
import levelUp04 from "../img/bitacora/level-up-04.jpg";
import levelUp05 from "../img/bitacora/level-up-05.jpg";
import coverTallerOnline from "../img/bitacora/taller-online.png";

const COVER_IMAGES = {
  lags: coverLags,
  "ojo-de-pescado": coverOjoDePescado,
  fecich: coverFecich,
  "fecich-play": coverFecich,
  "fecich-play-01": fecichPlay01,
  "fecich-play-02": fecichPlay02,
  "fecich-play-03": fecichPlay03,
  "webinar-internacional": coverWebinar,
  "webinar-internacional-01": webinar01,
  "level-up": coverLevelUp,
  "level-up-01": levelUp01,
  "level-up-02": levelUp02,
  "level-up-03": levelUp03,
  "level-up-04": levelUp04,
  "level-up-05": levelUp05,
  "taller-online": coverTallerOnline,
};

const GALLERY_CAPTIONS = {
  "fecich-play-01": {
    es: "FECICH PLAY — experiencias narrativas",
    en: "FECICH PLAY — narrative experiences",
  },
  "fecich-play-02": {
    es: "Showcase de videojuegos chilenos",
    en: "Chilean video game showcase",
  },
  "fecich-play-03": {
    es: "Comunidad y networking en FECICH PLAY",
    en: "Community and networking at FECICH PLAY",
  },
  "webinar-internacional-01": {
    es: "Webinar internacional OMPI sobre propiedad intelectual",
    en: "WIPO international webinar on intellectual property",
  },
  "level-up-01": {
    es: "Level Up 2025 — apertura y Clúster de Mendoza",
    en: "Level Up 2025 — opening and Mendoza Cluster",
  },
  "level-up-02": {
    es: "Charlas y showcase de videojuegos locales",
    en: "Talks and local video game showcase",
  },
  "level-up-03": {
    es: "Participación de GDV Valparaíso en Mendoza",
    en: "GDV Valparaíso participation in Mendoza",
  },
  "level-up-04": {
    es: "Networking en el Polo TIC",
    en: "Networking at Polo TIC",
  },
  "level-up-05": {
    es: "Level Up 2025 — jornada de la industria",
    en: "Level Up 2025 — industry day",
  },
};

function enrichPost(post) {
  const coverImage =
    post.coverImage || COVER_IMAGES[post.coverImageKey] || null;

  const galleryFromKeys = (post.galleryKeys || [])
    .map((key) => ({
      src: COVER_IMAGES[key],
      caption: GALLERY_CAPTIONS[key] || { es: "", en: "" },
    }))
    .filter((item) => item.src);

  const gallery = post.gallery?.length > 0 ? post.gallery : galleryFromKeys;

  return {
    ...post,
    coverImage,
    gallery,
  };
}

export function getStaticBitacoraPosts() {
  return staticPosts
    .filter((post) => post.published !== false)
    .map((post) => enrichPost({ ...post }));
}
