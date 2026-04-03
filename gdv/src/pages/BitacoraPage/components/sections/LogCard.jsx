import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CategoryBadge from "../ui/CategoryBadge";
import { formatDate } from "../../../../data/bitacoraData";

const LogCard = ({ entry }) => {
  const { t, i18n } = useTranslation();

  const formattedDate = formatDate(
    entry.publishedAt,
    i18n.language === "en" ? "en-US" : "es-CL",
  );

  return (
    <article className="log-card group relative flex flex-col bg-[#1B182B] rounded-lg overflow-hidden card-shadow hover:shadow-2xl">
      {entry.featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-3 py-1 bg-[#DE6161] text-white text-xs font-bold rounded-full shadow-lg">
            ★ {t("bitacora.card.featuredLabel")}
          </span>
        </div>
      )}

      <Link
        to={`/bitacora/${entry.slug}`}
        className="relative block w-full aspect-video overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B182B] via-transparent to-transparent opacity-70 z-10" />
        <img
          src={entry.featuredImage.url}
          alt={entry.featuredImage.alt}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </Link>

      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={entry.category} size="sm" />
          <span className="text-[#8882a6] text-sm">{formattedDate}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#24C5D7] transition-colors duration-200">
          <Link to={`/bitacora/${entry.slug}`}>{t(entry.titleKey)}</Link>
        </h3>

        <p className="text-[#8882a6] text-sm mb-5 line-clamp-3 flex-grow">
          {t(entry.summaryKey)}
        </p>

        <Link
          to={`/bitacora/${entry.slug}`}
          className="
            inline-flex items-center gap-2
            text-[#2657EB] hover:text-[#24C5D7]
            font-semibold text-sm
            transition-all duration-200
            group/link
          "
        >
          {t("bitacora.card.readMore")}
          <svg
            className="w-4 h-4 transform transition-transform duration-200 group-hover/link:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default LogCard;
