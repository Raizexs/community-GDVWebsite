import { SuccessStories } from "../../../../components/SuccessStories";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveLocalizedValue } from "../../../../utils/localization";
import { fetchGames } from "../../../../services/games/gamesService";
import Gameimg1 from "../../../../img/TormentedSouls_header.jpg";
import Gameimg2 from "../../../../img/Colorbound_header.jpg";

export const SuccessStoriesSection = ({ homeContent }) => {
  const { t, i18n } = useTranslation();
  const [gamesFallback, setGamesFallback] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchGames()
      .then((result) => {
        if (!mounted) return;
        setGamesFallback(result);
      })
      .catch(() => {
        if (!mounted) return;
        setGamesFallback([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const dynamicStories = useMemo(() => {
    const lang = i18n.resolvedLanguage || i18n.language || "es";
    return (homeContent?.successStories || [])
      .map((story) => ({
        title: resolveLocalizedValue(story.title, lang),
        description: resolveLocalizedValue(story.description, lang),
        image: story.imageUrl,
        info: story.link,
        plataforms: story.platforms || [],
      }))
      .filter((story) => story.title && story.image);
  }, [homeContent, i18n.language, i18n.resolvedLanguage]);

  const fallbackStories = useMemo(() => {
    const bySlug = new Map(gamesFallback.map((g) => [String(g.slug || "").toLowerCase(), g]));
    const tormented = bySlug.get("tormentedsouls");
    const colorbound = bySlug.get("colorbound");
    return [
      {
        title: tormented?.title || {
          es: t("home.successStories.tormentedSouls.title"),
          en: t("home.successStories.tormentedSouls.title"),
        },
        description: tormented?.description || {
          es: t("home.successStories.tormentedSouls.description"),
          en: t("home.successStories.tormentedSouls.description"),
        },
        image: tormented?.imageUrl || Gameimg1,
        info: tormented?.link || "https://pqube.co.uk/games/tormented-souls/",
        plataforms: tormented?.platforms || [],
      },
      {
        title: colorbound?.title || {
          es: t("home.successStories.colorbound.title"),
          en: t("home.successStories.colorbound.title"),
        },
        description: colorbound?.description || {
          es: t("home.successStories.colorbound.description"),
          en: t("home.successStories.colorbound.description"),
        },
        image: colorbound?.imageUrl || Gameimg2,
        info: colorbound?.link || "https://store.steampowered.com/app/3778610/Colorbound/",
        plataforms: colorbound?.platforms || [],
      },
    ].map((story) => ({
      ...story,
      title: resolveLocalizedValue(story.title, i18n.resolvedLanguage || i18n.language || "es"),
      description: resolveLocalizedValue(story.description, i18n.resolvedLanguage || i18n.language || "es"),
    }));
  }, [gamesFallback, i18n.language, i18n.resolvedLanguage, t]);

  const successStories = dynamicStories.length ? dynamicStories : fallbackStories;
  const label = resolveLocalizedValue(homeContent?.successSection?.title, i18n.resolvedLanguage || i18n.language) || t("home.successStories.label");
  const title = resolveLocalizedValue(homeContent?.successSection?.description, i18n.resolvedLanguage || i18n.language) || t("home.successStories.title");

  return (
    <section className="py-20 px-4 games-bg">
      <div className="mb-12 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">{label}</h6>
        <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
          {title}
        </h3>
      </div>

      <div className="flex justify-center items-center flex-col gap-16">
        {successStories.map((s, index) => (
          <SuccessStories
            key={index}
            title={s.title}
            description={s.description}
            image={s.image}
            gameplataforms={s.plataforms}
            info={s.info}
          />
        ))}
      </div>
    </section>
  );
};
