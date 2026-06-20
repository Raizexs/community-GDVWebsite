import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useImageOrientation } from "../../../hooks/useImageOrientation";
import { resolveLocalizedValue } from "../../../utils/localization";
import {
  formatBitacoraDate,
  getCategoryStyle,
} from "../../../utils/bitacoraFormat";

export function BitacoraCard({
  post,
  variant = "dark",
  showFeaturedBadge = false,
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";

  const title = resolveLocalizedValue(post.title, language);
  const excerpt = resolveLocalizedValue(post.excerpt, language);
  const categoryLabel = t(`bitacora.categories.${post.category}`, {
    defaultValue: post.category,
  });
  const formattedDate = formatBitacoraDate(post.publishedAt, language);
  const categoryClass = getCategoryStyle(post.category);
  const isLight = variant === "light";
  const { orientation, onImageLoad } = useImageOrientation(post.coverImage);
  const mediaOrientation = orientation || "auto";

  return (
    <article
      className={`bitacora-entry-card ${
        isLight ? "bitacora-entry-card-light" : "bitacora-entry-card-dark"
      }`}
    >
      <div
        className={`bitacora-entry-card-media motion-card-media-zoom bitacora-entry-card-media--${mediaOrientation}`}
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            className="bitacora-entry-card-image"
            onLoad={onImageLoad}
          />
        ) : (
          <div className="bitacora-entry-card-placeholder" />
        )}
        {showFeaturedBadge && post.featured ? (
          <span className="bitacora-featured-badge">
            <i className="bi bi-star-fill" /> {t("bitacora.featured")}
          </span>
        ) : null}
      </div>

      <div className="bitacora-entry-card-body">
        <div className="bitacora-entry-card-meta">
          <span className={`bitacora-entry-category ${categoryClass}`}>
            {categoryLabel}
          </span>
          {formattedDate ? (
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          ) : null}
        </div>
        <h3>{title}</h3>
        <p>{excerpt}</p>
        <Link to={`/noticias/${post.slug}`} className="bitacora-entry-read-more">
          <span>{t("bitacora.readMore")}</span>
          <i className="bi bi-chevron-right bitacora-read-more-icon" />
        </Link>
      </div>
    </article>
  );
}
