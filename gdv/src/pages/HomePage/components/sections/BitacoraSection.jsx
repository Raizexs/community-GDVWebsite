import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogCard from "../../../BitacoraPage/components/sections/LogCard";
import { getFeaturedEntries } from "../../../../data/bitacoraData";

export const BitacoraSection = () => {
  const { t } = useTranslation();

  const featuredEntries = getFeaturedEntries().slice(0, 3);

  if (featuredEntries.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 games-bg">
      <div className="container mx-auto">
        <div className="mb-12 flex flex-col justify-center items-center text-center">
          <h6 className="mb-2 vgvalpo-textcolor3 text-base">
            {t("home.bitacora.label")}
          </h6>
          <h3 className="font-bold text-black md:text-3xl md:w-6/12 text-2xl mb-4">
            {t("home.bitacora.title")}
          </h3>
          <p className="text-gray-600 text-lg max-w-3xl">
            {t("home.bitacora.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-6xl mx-auto">
          {featuredEntries.map((entry) => (
            <LogCard key={entry.id} entry={entry} />
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/bitacora"
            className="vgvalpo-gradient-btn rounded-md px-8 py-4 text-white font-bold text-lg transform transition-all duration-200 hover:scale-105 inline-flex items-center gap-3"
          >
            {t("home.bitacora.seeMoreButton")}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
