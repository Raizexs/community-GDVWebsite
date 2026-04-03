import React from "react";
import { useTranslation } from "react-i18next";
import gdvIcon from "../../../../img/gdv-new.jpg";

const EmptyState = ({ variant = "empty", onClearFilters }) => {
  const { t } = useTranslation();

  const isNoResults = variant === "no-results";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4">
      <div className="mb-6">
        {isNoResults ? (
          <img
            src={gdvIcon}
            alt="no results"
            className="w-24 h-24 vgvalpo-gradient-gdv-new p-1 rounded-full"
          />
        ) : (
          <div className="text-6xl text-[#8882a6] opacity-60">📋</div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-white mb-3 text-center">
        {isNoResults
          ? t("bitacora.emptyState.noResults")
          : t("bitacora.emptyState.title")}
      </h3>

      <p className="text-[#8882a6] text-center max-w-md mb-8">
        {!isNoResults && t("bitacora.emptyState.description")}
      </p>

      {isNoResults && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="
            px-6 py-3
            bg-[#2657EB] hover:bg-[#1e47c7]
            text-white font-semibold
            rounded-lg
            transition-all duration-200
            transform hover:scale-105
          "
        >
          {t("bitacora.emptyState.clearFilters")}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
