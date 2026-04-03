import React from "react";
import { useTranslation } from "react-i18next";
import { BITACORA_CATEGORIES } from "../../../../data/bitacoraData";

const CategoryFilter = ({ activeCategory = "all", onCategoryChange }) => {
  const { t } = useTranslation();

  const categories = [
    { id: BITACORA_CATEGORIES.ALL, label: t("bitacora.header.allCategories") },
    {
      id: BITACORA_CATEGORIES.ACTIVIDADES,
      label: t("bitacora.categories.actividades"),
    },
    {
      id: BITACORA_CATEGORIES.TRAVESIAS,
      label: t("bitacora.categories.travesias"),
    },
    { id: BITACORA_CATEGORIES.HITOS, label: t("bitacora.categories.hitos") },
    {
      id: BITACORA_CATEGORIES.EVENTOS,
      label: t("bitacora.categories.eventos"),
    },
  ];

  const categoryColors = {
    all: {
      border: "border-[#2657EB]",
      text: "text-[#2657EB]",
      bg: "bg-[#2657EB]",
      hover: "hover:border-[#2657EB] hover:text-[#2657EB]",
    },
    actividades: {
      border: "border-[#24C5D7]",
      text: "text-[#24C5D7]",
      bg: "bg-[#24C5D7]",
      hover: "hover:border-[#24C5D7] hover:text-[#24C5D7]",
    },
    travesias: {
      border: "border-[#2657EB]",
      text: "text-[#2657EB]",
      bg: "bg-[#2657EB]",
      hover: "hover:border-[#2657EB] hover:text-[#2657EB]",
    },
    hitos: {
      border: "border-[#DE6161]",
      text: "text-[#DE6161]",
      bg: "bg-[#DE6161]",
      hover: "hover:border-[#DE6161] hover:text-[#DE6161]",
    },
    eventos: {
      border: "border-[#8882a6]",
      text: "text-[#8882a6]",
      bg: "bg-[#8882a6]",
      hover: "hover:border-[#8882a6] hover:text-[#8882a6]",
    },
  };

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
  };

  return (
    <div className="mb-8">
      <div className="text-[#8882a6] text-sm font-semibold mb-4">
        {t("bitacora.header.categoriesLabel")}
      </div>

      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const colors = categoryColors[category.id] || categoryColors.all;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                px-5 py-2.5
                rounded-lg
                border-2
                font-semibold text-sm
                transition-all duration-200
                transform hover:scale-105
                ${
                  isActive
                    ? `${colors.bg} ${colors.border} text-white shadow-lg`
                    : `${colors.border} ${colors.text} ${colors.hover} bg-transparent`
                }
              `}
              aria-pressed={isActive}
              aria-label={`${t("bitacora.header.categoriesLabel")} ${category.label}`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="md:hidden">
        <select
          value={activeCategory}
          onChange={(e) => handleCategoryClick(e.target.value)}
          className="
            w-full
            px-4 py-3
            bg-[#1B182B]
            border-2 border-[#2657EB]
            text-white
            rounded-lg
            font-semibold
            focus:outline-none focus:ring-2 focus:ring-[#2657EB]
            cursor-pointer
          "
          aria-label={t("bitacora.header.categoriesLabel")}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CategoryFilter;
