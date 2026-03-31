import icon1 from "../../../../img/icons/News.png";
import icon2 from "../../../..//img/icons/People Working Together.png";
import icon3 from "../../../../img/icons/Commercial.png";
import icon4 from "../../../../img/icons/Education.png";
import icon5 from "../../../../img/icons/Business.png";
import icon6 from "../../../../img/icons/Tear-Off Calendar.png";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Benefits = () => {
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

  const benefits = [
    { key: "press", icon: icon1 },
    { key: "networking", icon: icon2 },
    { key: "diffusion", icon: icon3 },
    { key: "education", icon: icon4 },
    { key: "consultancy", icon: icon5 },
    { key: "events", icon: icon6 },
  ];

  return (
    <section className="py-20 px-4 section-bg">
      <div className="mb-16 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          {t("home.benefits.label")}
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
          {t("home.benefits.title")}
        </h3>
      </div>

      <div className="flex justify-center items-center mb-8">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-20">
          {benefits.map((benefit) => (
            <div
              key={benefit.key}
              className="w-60 flex items-center text-center flex-col"
            >
              <img
                src={benefit.icon}
                alt=""
                className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
              />
              <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
                {t(`home.benefits.${benefit.key}.title`)}
              </h5>
              <p className="text-sm vgvalpo-textcolor6">
                {t(`home.benefits.${benefit.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
