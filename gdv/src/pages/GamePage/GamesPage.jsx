import { NavbarComponent } from "../../components/Navbar";
import { GameCard } from "../../components/GameCard";
import ChileIcon from "../../img/icons/Chile.png";
import { FooterComponent } from "../../components/Footer";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getShuffledGames } from "../../data/gamesData";

export const GamePage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Use centralized shuffled games data to be fair to all games
  const games = getShuffledGames();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredGames = games.filter((game) =>
    t(game.titleKey).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRandomGames = (gamesList) => {
    // Games are already shuffled from getShuffledGames, just return them
    return gamesList;
  };

  const randomGames = getRandomGames(filteredGames);

  return (
    <div className="">
      <NavbarComponent />
      <main>
        <section className="py-20 px-4 section-bg">
          <div className="mb-12 flex justify-center items-center flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 max-w-md mx-auto ">
              <img src={ChileIcon} alt="" className="w-10" />
              <h3 className="text-xl font-bold vgvalpo-textcolor3">
                {t("games.pageTitle")}
              </h3>
            </div>
            <div class="max-w-md mx-auto">
              <div class="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  class="w-80 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={t("games.searchPlaceholder")}
                />
                <button class="absolute right-0 top-0 bottom-0 vgvalpo-bgcolor5 text-white py-2 px-4 rounded-r-lg focus:outline-none">
                  <i class="bi bi-search text-white"></i>
                </button>
              </div>
            </div>
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
      </main>
      <FooterComponent />
    </div>
  );
};
