import { useTranslation } from "react-i18next";
import { Reveal } from "../../../components/Reveal";
import {
  BITACORA_FILTER_OPTIONS,
  getCategoryStyle,
} from "../../../utils/bitacoraFormat";

export function BitacoraFilters({ activeCategory, onChange }) {
  const { t } = useTranslation();

  return (
    <Reveal className="bitacora-filters">
      <span className="bitacora-filters-label">{t("bitacora.filterBy")}</span>
      <div className="bitacora-filters-list">
        {BITACORA_FILTER_OPTIONS.map((category) => {
          const isActive = activeCategory === category;
          const styleClass =
            category === "all" ? "bitacora-filter-all" : getCategoryStyle(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              aria-pressed={isActive}
              className={`bitacora-filter-btn ${styleClass} ${
                isActive ? "bitacora-filter-btn-active" : ""
              }`}
            >
              {t(`bitacora.categories.${category}`, { defaultValue: category })}
            </button>
          );
        })}
      </div>
    </Reveal>
  );
}
