import { GameCard } from "../../../../components/GameCard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { fetchGames } from "../../../../services/games/gamesService";
import { resolveLocalizedValue } from "../../../../utils/localization";

export const VideoGames = ({ homeContent }) => {
  const { t, i18n } = useTranslation();
  const [games, setGames] = useState([]);

  useEffect(() => {
    let mounted = true;

    fetchGames()
      .then((result) => {
        if (mounted) setGames(result);
      })
      .catch((error) => {
        console.error("Error loading home games:", error);
        if (mounted) setGames([]);
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
  const label = resolveLocalizedValue(homeContent?.gamesSection?.title, language) || t("home.videoGames.label");
  const title = resolveLocalizedValue(homeContent?.gamesSection?.description, language) || t("home.videoGames.title");
  const ctaHeading = resolveLocalizedValue(homeContent?.gamesCta?.title, language) || t("home.videoGames.ctaHeading");
  const ctaDescription = resolveLocalizedValue(homeContent?.gamesCta?.description, language) || t("home.videoGames.description");
  const ctaUrl = homeContent?.gamesCta?.url || "/videogames";

  return (
    <>
      <section className="py-20 px-4 section-bg">
        <div className="mb-12 flex flex-col justify-center items-center text-center">
          <h6 className="mb-2 vgvalpo-textcolor3 text-base">{label}</h6>
          <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
            {title}
          </h3>
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className="grid md:grid-cols-4 grid-cols-1 gap-7">
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
          </div>
        </div>
      </section>
      <section className={`flex justify-center items-center cta-games-bg`}>
        <div
          className={`flex justify-center md:items-center md:text-center text-white flex-col px-8`}
        >
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
        </div>
      </section>
    </>
  );
};
