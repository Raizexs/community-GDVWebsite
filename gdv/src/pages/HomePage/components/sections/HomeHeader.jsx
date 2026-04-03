import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const HomeHeader = () => {
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

  return (
    <div
      className={`flex justify-center items-center header-screen home-header-img`}
    >
      <div
        className={`flex justify-center md:items-center md:text-center text-white flex-col px-8`}
      >
        <h1 className="mb-5 leading-tight uppercase text-4xl md:text-6xl md:w-9/12 font-bold">
          {currentLang === "es" ? (
            <>
              Haciendo Crecer la Industria de Videojuegos Chilena de{" "}
              <span className="text-cyan-400">Valparaíso</span>
            </>
          ) : (
            <>
              Making the Chilean video game Industry of{" "}
              <span className="text-cyan-400">Valparaíso</span> Grow
            </>
          )}
        </h1>
        <p className="md:w-7/12 mb-8">{t("home.header.description")}</p>
        <Link
          to={"..."}
          className={
            "vgvalpo-gradient-btn rounded-md px-8 py-3 flex justify-center items-center"
          }
        >
          {t("home.header.joinButton")}
        </Link>
      </div>
    </div>
  );
};
