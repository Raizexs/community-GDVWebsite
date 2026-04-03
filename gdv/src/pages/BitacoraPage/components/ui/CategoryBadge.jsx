import React from "react";
import { useTranslation } from "react-i18next";

const CategoryBadge = ({ category, size = "md", className = "" }) => {
  const { t } = useTranslation();

  const categoryStyles = {
    actividades: {
      bg: "bg-[#24C5D7]",
      text: "text-[#24C5D7]",
      border: "border-[#24C5D7]",
    },
    travesias: {
      bg: "bg-[#2657EB]",
      text: "text-[#2657EB]",
      border: "border-[#2657EB]",
    },
    hitos: {
      bg: "bg-[#DE6161]",
      text: "text-[#DE6161]",
      border: "border-[#DE6161]",
    },
    eventos: {
      bg: "bg-[#8882a6]",
      text: "text-[#8882a6]",
      border: "border-[#8882a6]",
    },
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const style = categoryStyles[category] || categoryStyles.actividades;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${style.bg} ${style.text} ${style.border}
        bg-opacity-20 border
        font-semibold rounded-full
        ${sizeClass}
        ${className}
      `}
    >
      {t(`bitacora.categories.${category}`)}
    </span>
  );
};

export default CategoryBadge;
