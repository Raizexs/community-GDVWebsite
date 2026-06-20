import { GameCard } from "../../../../components/GameCard";
import { Reveal } from "../../../../components/Reveal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  fetchGames,
  getCachedGames,
  getStaticGamesFallback,
} from "../../../../services/games/gamesService";
import { resolveLocalizedValue } from "../../../../utils/localization";

export const VideoGames = ({ homeContent }) => {
  const { t, i18n } = useTranslation();
  const [games, setGames] = useState([]);

  useEffect(() => {
    let mounted = true;

    const cached = getCachedGames();
    if (cached?.length) {
      setGames(cached);
      return () => {
        mounted = false;
      };
    }

    fetchGames()
      .then((result) => {
        if (mounted)
          setGames(
            Array.isArray(result) && result.length
              ? result
              : getStaticGamesFallback(),
          );
      })
      .catch((error) => {
        console.error("Error loading home games:", error);
        if (mounted) setGames(getStaticGamesFallback());
      });

    return () => {
      mounted = false;
    };
  }, []);

  const randomGames = useMemo(() => {
    const shuffled = [...games].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [games]);
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const label =
    resolveLocalizedValue(homeContent?.gamesSection?.title, language) ||
    t("home.videoGames.label");
  const title =
    resolveLocalizedValue(homeContent?.gamesSection?.description, language) ||
    t("home.videoGames.title");
  const ctaHeading =
    resolveLocalizedValue(homeContent?.gamesCta?.title, language) ||
    t("home.videoGames.ctaHeading");
  const ctaDescription =
    resolveLocalizedValue(homeContent?.gamesCta?.description, language) ||
    t("home.videoGames.description");
  const ctaUrl = homeContent?.gamesCta?.url || "/videogames";

  return (
    <>
      <section className="py-20 px-4 section-bg">
        <Reveal className="mb-12 flex flex-col justify-center items-center text-center motion-section-header" emphasis>
          <h6 className="mb-2 vgvalpo-textcolor3 text-base">{label}</h6>
          <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
            {title}
          </h3>
        </Reveal>

        <div className="flex flex-col justify-center items-center">
          <Reveal className="grid md:grid-cols-4 grid-cols-1 gap-7" stagger emphasis>
            {randomGames.map((g) => (
              <GameCard
                key={g.id}
                bgimg={g.image}
                imageUrl={g.imageUrl}
                titleKey={g.titleKey}
                descriptionKey={g.descriptionKey}
                title={g.title}
                description={g.description}
                link={g.link}
                gameplataforms={g.platforms}
              />
            ))}
          </Reveal>
        </div>
      </section>
      <section className={`flex justify-center items-center cta-games-bg`}>
        <Reveal className="flex justify-center md:items-center md:text-center text-white flex-col px-8 motion-section-header">
          <h1 className="mb-3 leading-tight text-2xl uppercase md:text-3xl md:w-9/12 font-bold">
            {ctaHeading}
          </h1>
          <p className="md:w-7/12 mb-6">{ctaDescription}</p>
          {/^https?:\/\//i.test(ctaUrl) ? (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
              }
            >
              {t("home.videoGames.seeGamesButton")}
            </a>
          ) : (
            <Link
              to={ctaUrl}
              className={
                "vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
              }
            >
              {t("home.videoGames.seeGamesButton")}
            </Link>
          )}
        </Reveal>
      </section>
    </>
  );
};
