import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PartnerCard } from "../PartnerCard";
import { Reveal } from "../../../../components/Reveal";
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
      <Reveal
        onMount
        emphasis
        delay={320}
        className="mb-12 flex flex-col justify-center items-center text-center motion-section-header"
      >
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          {t("partners.studios.label")}
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-5/12 text-2xl">
          {t("partners.studios.title")}
        </h3>
      </Reveal>

      {socios.length > 0 ? (
        <Reveal
          key="partners-loaded"
          onMount
          emphasis
          stagger
          delay={480}
          className="flex flex-wrap justify-center gap-7 w-full max-w-6xl mx-auto"
        >
          {socios.map((partner, idx) => (
            <PartnerCard key={partner.name || idx} partner={partner} />
          ))}
        </Reveal>
      ) : null}
    </section>
  );
}
