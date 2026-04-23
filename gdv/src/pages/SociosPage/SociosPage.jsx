import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { SociosHeader } from "./components/sections/SociosHeader";
import {
  getStaticPartnersFallback,
} from "../../services/partners/partnersService";

export const SociosPage = () => {
  const { t } = useTranslation();
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const source = getStaticPartnersFallback();
    setSocios([...source].sort(() => Math.random() - 0.5));
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
