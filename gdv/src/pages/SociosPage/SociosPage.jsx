import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { SociosHeader } from "./components/sections/SociosHeader";
import { fetchPartners } from "../../services/partners/partnersService";

export const SociosPage = () => {
  const { t } = useTranslation();
  const [socios, setSocios] = useState([]);
  const [syncState, setSyncState] = useState("idle");
  const [lastSyncAt, setLastSyncAt] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    let mounted = true;
    const loadPartners = async () => {
      setSyncState("syncing");
      try {
        const partners = await fetchPartners({ force: true });
        if (!mounted) return;
        setSocios([...partners].sort(() => Math.random() - 0.5));
        setLastSyncAt(new Date());
        setSyncState("ok");
      } catch (error) {
        console.error("Error loading partners:", error);
        if (!mounted) return;
        setSyncState("error");
      }
    };

    loadPartners();
    const interval = setInterval(loadPartners, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="">
      <NavbarComponent />

      <header>
        <SociosHeader />
      </header>

      <main>
        <section className="py-20 px-4 games-bg">
          <div className="mb-12 flex flex-col justify-center items-center text-center">
            <h6 className="mb-2 vgvalpo-textcolor3 text-base">
              — {t("partners.label")} —
            </h6>
            <h3 className="font-bold text-black md:text-3xl md:w-5/12 text-2xl">
              {t("partners.title")}
            </h3>
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
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-7">
              {socios.map((s) => (
                <a
                  key={s.name}
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-60 h-32 p-6 flex justify-center items-center bg-white hover:shadow-xl rounded-lg socios-card"
                >
                  <img src={s.logo} alt={s.name} className="w-full" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterComponent />
    </div>
  );
};
