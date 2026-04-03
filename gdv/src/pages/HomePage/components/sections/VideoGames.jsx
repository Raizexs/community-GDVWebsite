import { GameCard } from "../../../../components/GameCard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getShuffledGames } from "../../../../data/gamesData";
import { useEffect, useState } from "react";

export const VideoGames = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const games = getShuffledGames();

  const getRandomGames = (gamesList, numberOfGames) => {
    return gamesList.slice(0, numberOfGames);
  };

  const randomGames = getRandomGames(games, 8);

  return (
    <>
      <section className="py-20 px-4 section-bg">
        <div className="mb-12 flex flex-col justify-center items-center text-center">
          <h6 className="mb-2 vgvalpo-textcolor3 text-base">
            {t("home.videoGames.label")}
          </h6>
          <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
            {t("home.videoGames.title")}
          </h3>
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className="grid md:grid-cols-4 grid-cols-1 gap-7">
            {randomGames.map((g) => (
              <GameCard
                key={g.id}
                bgimg={g.image}
                titleKey={g.titleKey}
                descriptionKey={g.descriptionKey}
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
            {t("home.videoGames.ctaHeading")}
          </h1>
          <p className="md:w-7/12 mb-6">{t("home.videoGames.description")}</p>
          <Link
            to={"/videogames"}
            className={
              "vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
            }
          >
            {t("home.videoGames.seeGamesButton")}
          </Link>
        </div>
      </section>
    </>
  );
};
