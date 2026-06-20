import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PartnerCard } from "../PartnerCard";
import {
  fetchPartners,
  getStaticPartnersFallback,
} from "../../../../services/partners/partnersService";

function shufflePartners(data) {
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SociosStudiosSection() {
  const { t } = useTranslation();
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    const loadPartners = async () => {
      try {
        let data = await fetchPartners();
        if (!data || !Array.isArray(data) || data.length === 0) {
          data = getStaticPartnersFallback();
        }
        setSocios(shufflePartners(data));
      } catch (error) {
        console.error("Error cargando socios, usando fallback:", error);
        setSocios(shufflePartners(getStaticPartnersFallback()));
      }
    };

    loadPartners();
  }, []);

  return (
    <section className="pt-20 pb-10 px-4">
      <div className="mb-12 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          {t("partners.studios.label")}
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-5/12 text-2xl">
          {t("partners.studios.title")}
        </h3>
      </div>

      <div className="flex flex-col justify-center items-center w-full max-w-6xl mx-auto gap-7">
        {socios.length === 10 ? (
          <>
            <div className="flex flex-wrap justify-center gap-7 w-full">
              {socios.slice(0, 4).map((partner, idx) => (
                <PartnerCard key={partner.name || idx} partner={partner} />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-7 w-full">
              {socios.slice(4, 6).map((partner, idx) => (
                <PartnerCard key={partner.name || idx + 4} partner={partner} />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-7 w-full">
              {socios.slice(6, 10).map((partner, idx) => (
                <PartnerCard key={partner.name || idx + 6} partner={partner} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap justify-center gap-7 w-full">
            {socios.map((partner, idx) => (
              <PartnerCard key={partner.name || idx} partner={partner} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
