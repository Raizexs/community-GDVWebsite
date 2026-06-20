import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchProviders,
  getStaticProvidersFallback,
} from "../../../../services/providers/providersService";
import { ServiceProviderCard } from "../ServiceProviderCard";
import { Reveal } from "../../../../components/Reveal";

export function ProvidersSection() {
  const { t } = useTranslation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await fetchProviders();
        setProviders(data?.length ? data : getStaticProvidersFallback());
      } catch {
        setProviders(getStaticProvidersFallback());
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  return (
    <section className="px-4 providers-section">
      <div className="max-w-6xl mx-auto">
        <Reveal
          onMount
          emphasis
          delay={620}
          className="mb-8 flex flex-col justify-center items-center text-center motion-section-header"
        >
          <h6 className="mb-2 vgvalpo-textcolor3 text-base">
            {t("partners.providers.label")}
          </h6>
          <h3 className="font-bold text-black md:text-3xl text-2xl providers-section-title mb-3">
            {t("partners.providers.title")}
          </h3>
          <p className="text-gray-600 max-w-2xl">
            {t("partners.providers.subtitle")}
          </p>
        </Reveal>

        {loading ? (
          <p className="text-center text-gray-600">
            {t("partners.providers.loading")}
          </p>
        ) : providers.length ? (
          <Reveal
            key="providers-loaded"
            onMount
            emphasis
            stagger
            delay={760}
            className="providers-grid"
          >
            {providers.map((provider) => (
              <ServiceProviderCard key={provider.id} provider={provider} />
            ))}
          </Reveal>
        ) : (
          <p className="text-center text-gray-600">
            {t("partners.providers.empty")}
          </p>
        )}
      </div>
    </section>
  );
}
