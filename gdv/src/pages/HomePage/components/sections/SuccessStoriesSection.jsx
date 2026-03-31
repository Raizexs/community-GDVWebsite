import { SuccessStories } from "../../../../components/SuccessStories";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { gamesData } from "../../../../data/gamesData";

import xbox from "../../../../img/plataforms/xbox.png";
import nintendo from "../../../../img/plataforms/nintendo.png";
import steam from "../../../../img/plataforms/steam.png";
import playstation from "../../../../img/plataforms/playstation.png";

import Gameimg1 from "../../../../img/TormentedSouls_header.jpg";
import Gameimg2 from "../../../../img/Colorbound_header.jpg";

export const SuccessStoriesSection = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const successStories = [
    {
      title: t("home.successStories.tormentedSouls.title"),
      description: t("home.successStories.tormentedSouls.description"),
      image: Gameimg1,
      info: "https://pqube.co.uk/games/tormented-souls/",
      plataforms: [
        { name: xbox, url: "..." },
        { name: nintendo, url: "..." },
        { name: playstation, url: "..." },
        {
          name: steam,
          url: "https://store.steampowered.com/app/1367590/Tormented_Souls/",
        },
      ],
    },
    {
      title: t("home.successStories.colorbound.title"),
      description: t("home.successStories.colorbound.description"),
      image: Gameimg2,
      info: "https://store.steampowered.com/app/3778610/Colorbound/",
      plataforms: [
        {
          name: steam,
          url: "https://store.steampowered.com/app/3778610/Colorbound/",
        },
      ],
    },
  ];

  return (
    <section className="py-20 px-4 games-bg">
      <div className="mb-12 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          {t("home.successStories.label")}
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
          {t("home.successStories.title")}
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
