import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { SociosHeader } from "./components/sections/SociosHeader";
import {
  fetchPartners,
} from "../../services/partners/partnersService";

export const SociosPage = () => {
  const { t } = useTranslation();
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPartners = async () => {
      const data = await fetchPartners();
      setSocios([...data].sort(() => Math.random() - 0.5));
    };

    loadPartners();
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

          <div className="flex flex-col justify-center items-center w-full max-w-6xl mx-auto gap-7">
            {socios.length === 10 ? (
              <>
                <div className="flex flex-wrap justify-center gap-7 w-full">
                  {socios.slice(0, 4).map((s) => (
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
                <div className="flex flex-wrap justify-center gap-7 w-full">
                  {socios.slice(4, 6).map((s) => (
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
                <div className="flex flex-wrap justify-center gap-7 w-full">
                  {socios.slice(6, 10).map((s) => (
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
              </>
            ) : (
              <div className="flex flex-wrap justify-center gap-7 w-full">
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
            )}
          </div>
        </section>
      </main>
      <FooterComponent />
    </div>
  );
};
