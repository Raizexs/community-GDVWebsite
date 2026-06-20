import { SuccessStories } from "../../../../components/SuccessStories";
import { useTranslation } from "react-i18next";
import { resolveLocalizedValue } from "../../../../utils/localization";
import Gameimg1 from "../../../../img/TormentedSouls_header.jpg";
import Gameimg2 from "../../../../img/Colorbound_header.jpg";

import iconSteam from "../../../../img/plataforms/steam.png";
import iconPlaystation from "../../../../img/plataforms/playstation.png";
import iconXbox from "../../../../img/plataforms/xbox.png";
import iconEpic from "../../../../img/plataforms/epic.png";
import iconNintendo from "../../../../img/plataforms/nintendo.png";
import iconGOG from "../../../../img/plataforms/GOG.png";

export const SuccessStoriesSection = ({ homeContent }) => {
  const { t, i18n } = useTranslation();

  const successStories = [
    {
      title: {
        es: t("home.successStories.tormentedSouls.title"),
        en: t("home.successStories.tormentedSouls.title"),
      },
      description: {
        es: t("home.successStories.tormentedSouls.description"),
        en: t("home.successStories.tormentedSouls.description"),
      },
      image: Gameimg1,
      info: "https://pqube.co.uk/games/tormented-souls/",
      plataforms: [
        {
          name: "Steam",
          iconUrl: iconSteam,
          url: "https://store.steampowered.com/app/1367590/Tormented_Souls/",
          platform: "Steam",
        },
        {
          name: "Nintendo",
          iconUrl: iconNintendo,
          url: "https://www.nintendo.com/store/products/tormented-souls-switch/",
          platform: "Nintendo",
        },
        {
          name: "PlayStation",
          iconUrl: iconPlaystation,
          url: "https://store.playstation.com/en-us/product/UP4293-PPSA02525_00-TORMENTEDSIEAPS5/",
          platform: "PlayStation",
        },
        {
          name: "Xbox",
          iconUrl: iconXbox,
          url: "https://www.xbox.com/en-us/games/store/tormented-souls/9mwz8jv5tsqg",
          platform: "Xbox",
        },
        {
          name: "Epic",
          iconUrl: iconEpic,
          url: "https://store.epicgames.com/en-US/p/tormented-souls",
          platform: "Epic",
        },
        {
          name: "GOG",
          iconUrl: iconGOG,
          url: "https://www.gog.com/en/game/tormented_souls",
          platform: "GOG",
        },
      ],
    },
    {
      title: {
        es: t("home.successStories.colorbound.title"),
        en: t("home.successStories.colorbound.title"),
      },
      description: {
        es: t("home.successStories.colorbound.description"),
        en: t("home.successStories.colorbound.description"),
      },
      image: Gameimg2,
      info: "https://whitethorngames.com/colorbound",
      plataforms: [
        {
          name: "Steam",
          iconUrl: iconSteam,
          url: "https://store.steampowered.com/app/3778610/Colorbound/",
          platform: "Steam",
        },
        {
          name: "Epic",
          iconUrl: iconEpic,
          url: "https://store.epicgames.com/en-US/p/colorbound-1c5e30",
          platform: "Epic",
        },
      ],
    },
  ].map((story) => ({
    ...story,
    title: resolveLocalizedValue(
      story.title,
      i18n.resolvedLanguage || i18n.language || "es",
    ),
    description: resolveLocalizedValue(
      story.description,
      i18n.resolvedLanguage || i18n.language || "es",
    ),
  }));

  const label =
    resolveLocalizedValue(
      homeContent?.successSection?.title,
      i18n.resolvedLanguage || i18n.language,
    ) || t("home.successStories.label");
  const title =
    resolveLocalizedValue(
      homeContent?.successSection?.description,
      i18n.resolvedLanguage || i18n.language,
    ) || t("home.successStories.title");

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
