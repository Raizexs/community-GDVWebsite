import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "../../../../components/Reveal";
import { resolveLocalizedValue } from "../../../../utils/localization";
import { resolveMembershipJoinUrl } from "../../../../utils/membershipRoute";
import homeHeroFallback from "../../../../img/riosdelluvia.jpg";

function renderValparaisoHighlighted(text) {
  const raw = String(text || "");
  if (!raw) return raw;

  const match = raw.match(/valpara[ií]so/i);
  if (!match) return raw;

  const start = match.index || 0;
  const end = start + match[0].length;
  const before = raw.slice(0, start);
  const word = raw.slice(start, end);
  const after = raw.slice(end);

  return (
    <>
      {before}
      <span className="text-cyan-400">{word}</span>
      {after}
    </>
  );
}

export const HomeHeader = ({ homeContent }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const dynamicTitle = resolveLocalizedValue(
    homeContent?.hero?.title,
    language,
  );
  const dynamicDescription = resolveLocalizedValue(
    homeContent?.hero?.description,
    language,
  );
  const heroUrl = resolveMembershipJoinUrl(homeContent?.hero?.url || "...");
  const dynamicHeroRaw =
    typeof homeContent?.hero?.hero === "string"
      ? homeContent.hero.hero.trim()
      : "";
  const dynamicHero =
    dynamicHeroRaw && dynamicHeroRaw.toLowerCase() !== "null"
      ? dynamicHeroRaw
      : "";
  const titleText = dynamicTitle || t("home.header.title");
  const descriptionText = dynamicDescription || t("home.header.description");
  const [heroBackground, setHeroBackground] = useState(
    dynamicHero || homeHeroFallback,
  );

  useEffect(() => {
    if (!dynamicHero) {
      setHeroBackground(homeHeroFallback);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) setHeroBackground(dynamicHero);
    };
    image.onerror = () => {
      if (!cancelled) setHeroBackground(homeHeroFallback);
    };
    image.src = dynamicHero;

    return () => {
      cancelled = true;
    };
  }, [dynamicHero]);

  return (
    <div
      className="flex justify-center items-center header-screen home-header-img"
      style={{
        backgroundImage: `linear-gradient(#000000ab, #000000ab), url(${heroBackground})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Reveal
        className="flex justify-center md:items-center md:text-center text-white flex-col px-8 motion-section-header"
      >
        <h1 className="mb-5 leading-tight uppercase text-4xl md:text-6xl md:w-9/12 font-bold">
          {renderValparaisoHighlighted(titleText)}
        </h1>
        <p className="md:w-7/12 mb-8">{descriptionText}</p>
        {/^https?:\/\//i.test(heroUrl) ? (
          <a
            href={heroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              "vgvalpo-gradient-btn rounded-md px-8 py-3 flex justify-center items-center"
            }
          >
            {t("home.header.joinButton")}
          </a>
        ) : (
          <Link
            to={heroUrl}
            className={
              "vgvalpo-gradient-btn rounded-md px-8 py-3 flex justify-center items-center"
            }
          >
            {t("home.header.joinButton")}
          </Link>
        )}
      </Reveal>
    </div>
  );
};
