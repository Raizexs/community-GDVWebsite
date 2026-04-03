import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CategoryBadge from "../ui/CategoryBadge";
import ImageCarousel from "./ImageCarousel";
import LogCard from "./LogCard";
import { formatDate, getRelatedEntries } from "../../../../data/bitacoraData";

const LogDetail = ({ entry }) => {
  const { t, i18n } = useTranslation();

  if (!entry) return null;

  const formattedDate = formatDate(
    entry.publishedAt,
    i18n.language === "en" ? "en-US" : "es-CL",
  );
  const relatedEntries = getRelatedEntries(entry.id, 3);

  const renderContent = (content) => {
    return content.split("\n").map((paragraph, index) => {
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
            {paragraph.replace("## ", "")}
          </h2>
        );
      }

      if (paragraph.trim().startsWith("- ")) {
        return (
          <li
            key={index}
            className="text-[#8882a6] text-lg leading-relaxed ml-6"
          >
            {paragraph.replace(/^- /, "")}
          </li>
        );
      }

      if (paragraph.includes("**")) {
        const parts = paragraph.split("**");
        return (
          <p
            key={index}
            className="text-[#8882a6] text-lg leading-relaxed mt-6 mb-4"
          >
            {parts.map((part, i) =>
              i % 2 === 0 ? (
                part
              ) : (
                <strong key={i} className="text-white font-semibold">
                  {part}
                </strong>
              ),
            )}
          </p>
        );
      }

      if (paragraph.trim()) {
        return (
          <p
            key={index}
            className="text-[#8882a6] text-lg leading-relaxed mb-4"
          >
            {paragraph}
          </p>
        );
      }

      return null;
    });
  };

  return (
    <article className="max-w-4xl mx-auto">
      <Link
        to="/bitacora"
        className="
          inline-flex items-center gap-2
          text-[#2657EB] hover:text-[#24C5D7]
          font-semibold
          mb-8
          transition-colors duration-200
          group
        "
      >
        <svg
          className="w-5 h-5 transform transition-transform duration-200 group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {t("bitacora.detail.backToList")}
      </Link>

      <div className="mb-4">
        <CategoryBadge category={entry.category} size="md" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        {t(entry.titleKey)}
      </h1>

      {entry.subtitleKey && (
        <p className="text-xl text-[#8882a6] mb-6">{t(entry.subtitleKey)}</p>
      )}

      <div className="flex items-center gap-2 text-[#8882a6] mb-8">
        <span>
          {t("bitacora.detail.publishedOn")} {formattedDate}
        </span>
        <span>•</span>
        <span>
          {t("bitacora.detail.by")} {entry.author.name}
          {entry.author.role && ` - ${entry.author.role}`}
        </span>
      </div>

      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 shadow-2xl">
        <img
          src={entry.featuredImage.url}
          alt={entry.featuredImage.alt}
          className="w-full h-full object-cover"
        />
        {entry.featuredImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3">
            <p className="text-white text-sm text-center">
              {entry.featuredImage.caption}
            </p>
          </div>
        )}
      </div>

      <div className="prose prose-invert max-w-none mb-12">
        {renderContent(t(entry.contentKey))}
      </div>

      {entry.gallery && entry.gallery.length > 0 && (
        <ImageCarousel images={entry.gallery} />
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="my-12 pt-8 border-t border-[#8882a6] border-opacity-30">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#8882a6] font-semibold">
              {t("bitacora.detail.tags")}
            </span>
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="
                  px-3 py-1
                  bg-[#2657EB] bg-opacity-20
                  text-[#2657EB]
                  border border-[#2657EB]
                  rounded-full
                  text-sm
                "
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {relatedEntries.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#8882a6] border-opacity-30">
          <h3 className="text-2xl font-bold text-white mb-8">
            {t("bitacora.detail.relatedTitle")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEntries.map((relatedEntry) => (
              <LogCard key={relatedEntry.id} entry={relatedEntry} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default LogDetail;
