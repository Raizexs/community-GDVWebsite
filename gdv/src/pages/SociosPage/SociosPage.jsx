import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { SociosHeader } from "./components/sections/SociosHeader";
import {
  fetchPartners,
  getStaticPartnersFallback,
} from "../../services/partners/partnersService";

const cardClassName =
  "w-60 h-32 p-4 flex justify-center items-center bg-white hover:shadow-xl rounded-lg socios-card";

function PartnerCard({ partner }) {
  const content = (
    <img
      src={partner.logo}
      alt={partner.name}
      className="max-w-full max-h-full object-contain"
    />
  );

  if (!partner.website) {
    return <div className={cardClassName}>{content}</div>;
  }

  return (
    <a
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
    >
      {content}
    </a>
  );
}

export const SociosPage = () => {
  const { t } = useTranslation();
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPartners = async () => {
      try {
        let data = await fetchPartners();
        if (!data || !Array.isArray(data) || data.length === 0) {
          data = getStaticPartnersFallback();
        }
        
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        setSocios(shuffled);
      } catch (error) {
        console.error("Error cargando socios, usando fallback:", error);
        const fallbackData = getStaticPartnersFallback();
        const shuffled = [...fallbackData];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setSocios(shuffled);
      }
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
                  {socios.slice(0, 4).map((s, idx) => (
                    <PartnerCard key={s.name || idx} partner={s} />
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-7 w-full">
                  {socios.slice(4, 6).map((s, idx) => (
                    <PartnerCard key={s.name || idx + 4} partner={s} />
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-7 w-full">
                  {socios.slice(6, 10).map((s, idx) => (
                    <PartnerCard key={s.name || idx + 6} partner={s} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap justify-center gap-7 w-full">
                {socios.map((s, idx) => (
                  <PartnerCard key={s.name || idx} partner={s} />
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
