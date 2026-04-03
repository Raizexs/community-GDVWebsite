import React from "react";
import { useTranslation } from "react-i18next";
import CategoryFilter from "./CategoryFilter";

const BitacoraHeader = ({ activeCategory, onCategoryChange }) => {
  const { t } = useTranslation();

  return (
    <header className="mb-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t("bitacora.header.title")}
        </h1>
        <p className="text-[#8882a6] text-lg md:text-xl max-w-3xl mx-auto">
          {t("bitacora.header.description")}
        </p>
      </div>

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
    </header>
  );
};

export default BitacoraHeader;
