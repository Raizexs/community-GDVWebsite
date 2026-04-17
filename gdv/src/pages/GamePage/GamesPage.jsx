import { NavbarComponent } from "../../components/Navbar";
import { GameCard } from "../../components/GameCard";
import ChileIcon from "../../img/icons/Chile.png";
import { FooterComponent } from "../../components/Footer";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchGames, getCachedGames } from "../../services/games/gamesService";
import { resolveLocalizedValue } from "../../utils/localization";

export const GamePage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState(() => getCachedGames() || []);
  const [syncState, setSyncState] = useState("idle");
  const [lastSyncAt, setLastSyncAt] = useState(null);

  // Auto-fetch games every 3 seconds
  useEffect(() => {
    const loadGames = async () => {
      setSyncState("syncing");
      try {
        const result = await fetchGames({ force: true });
        setGames(result);
        setLastSyncAt(new Date());
        setSyncState("ok");
      } catch (error) {
        console.error("Error loading games:", error);
        setSyncState("error");
      }
    };

    // Load immediately on mount
    loadGames();

    // Then poll every 3 seconds
    const interval = setInterval(loadGames, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredGames = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return games.filter((game) => {
      const localizedTitle = resolveLocalizedValue(game.title, i18n.language);
      const title =
        (game.title && typeof game.title === "object" ? game.title[i18n.language] || game.title.es : "") ||
        localizedTitle ||
        (game.titleKey ? t(game.titleKey) : "");

      return title.toLowerCase().includes(query);
    });
  }, [games, i18n.language, searchQuery, t]);

  const getRandomGames = (gamesList) => {
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
            <div className="max-w-md mx-auto">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={t("games.searchPlaceholder")}
                />
                <button className="absolute right-0 top-0 bottom-0 vgvalpo-bgcolor5 text-white py-2 px-4 rounded-r-lg focus:outline-none">
                  <i className="bi bi-search text-white"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="mb-4 w-full max-w-3xl rounded-md border px-4 py-2 text-sm bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    syncState === "syncing"
                      ? "bg-yellow-500 animate-pulse"
                      : syncState === "ok"
                        ? "bg-green-500"
                        : syncState === "error"
                          ? "bg-red-500"
                          : "bg-gray-400"
                  }`}
                ></span>
                <span className="text-gray-700">
                  {syncState === "syncing" && "Sincronizando cambios de PraxSuite..."}
                  {syncState === "ok" && "Cambios de PraxSuite sincronizados"}
                  {syncState === "error" && "Sin conexión con PraxSuite, mostrando contenido de respaldo"}
                  {syncState === "idle" && "Esperando sincronización inicial..."}
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                {lastSyncAt ? `Última sync: ${lastSyncAt.toLocaleTimeString()}` : "Sin sync aún"}
              </span>
            </div>
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
      </main>
      <FooterComponent />
    </div>
  );
};
