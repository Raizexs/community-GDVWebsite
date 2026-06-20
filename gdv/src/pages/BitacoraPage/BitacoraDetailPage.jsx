import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { useImageOrientation } from "../../hooks/useImageOrientation";
import { resolveLocalizedValue } from "../../utils/localization";
import { formatBitacoraDate, getCategoryStyle } from "../../utils/bitacoraFormat";
import { ImageGalleryCarousel } from "./components/ImageGalleryCarousel";
import {
  fetchBitacoraPostBySlug,
  getStaticBitacoraFallback,
} from "../../services/bitacora/bitacoraService";

function LocalizedHtml({ value, className }) {
  if (!value) return null;
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: value }} />
  );
}

export const BitacoraDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPost = async () => {
      try {
        const data = await fetchBitacoraPostBySlug(slug);
        if (data) {
          setPost(data);
        } else {
          const fallback = getStaticBitacoraFallback().find(
            (entry) => entry.slug === slug,
          );
          setPost(fallback || null);
        }
      } catch {
        const fallback = getStaticBitacoraFallback().find(
          (entry) => entry.slug === slug,
        );
        setPost(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const title = resolveLocalizedValue(post?.title, language);
  const subtitle = resolveLocalizedValue(post?.subtitle, language);
  const author = resolveLocalizedValue(post?.author, language);
  const body = resolveLocalizedValue(post?.body, language);
  const aboutEvent = resolveLocalizedValue(post?.aboutEvent, language);
  const highlightFact = resolveLocalizedValue(post?.highlightFact, language);
  const organization = resolveLocalizedValue(post?.organization, language);
  const regionalImpact = resolveLocalizedValue(post?.regionalImpact, language);
  const coverCaption = resolveLocalizedValue(post?.coverCaption, language);
  const categoryLabel = t(`bitacora.categories.${post?.category}`, {
    defaultValue: post?.category,
  });
  const formattedDate = formatBitacoraDate(post?.publishedAt, language);
  const categoryClass = getCategoryStyle(post?.category);

  const eventDates = resolveLocalizedValue(post?.eventDetails?.dates, language);
  const eventLocation = resolveLocalizedValue(
    post?.eventDetails?.location,
    language,
  );
  const eventEntry = resolveLocalizedValue(post?.eventDetails?.entry, language);
  const { orientation: coverOrientation, onImageLoad: onCoverImageLoad } =
    useImageOrientation(post?.coverImage);

  return (
    <div className="bitacora-detail-page">
      <Helmet>
        <title>
          {title
            ? `${title} | GDV ${t("bitacora.pageTitle")}`
            : `GDV ${t("bitacora.pageTitle")}`}
        </title>
      </Helmet>
      <NavbarComponent />
      <main className="bitacora-page-main">
        <section className="bitacora-detail-section">
          <div className="bitacora-detail-container">
            <Link to="/noticias" className="bitacora-detail-back">
              <i className="bi bi-arrow-left" />
              {t("bitacora.backToList")}
            </Link>

            {loading ? (
              <p className="bitacora-state-message">{t("bitacora.loading")}</p>
            ) : post ? (
              <article key={slug} className="bitacora-detail-article animate-fadeIn">
                <div className="bitacora-detail-header">
                  <span className={`bitacora-entry-category ${categoryClass}`}>
                    {categoryLabel}
                  </span>
                  <h1>{title}</h1>
                  {subtitle ? <p className="bitacora-detail-subtitle">{subtitle}</p> : null}
                  {formattedDate || author ? (
                    <p className="bitacora-detail-meta">
                      {formattedDate
                        ? t("bitacora.publishedOn", { date: formattedDate })
                        : null}
                      {formattedDate && author ? " • " : null}
                      {author ? t("bitacora.byAuthor", { author }) : null}
                    </p>
                  ) : null}
                </div>

                {post.coverImage ? (
                  <figure
                    className={`bitacora-detail-hero bitacora-detail-hero--${coverOrientation || "auto"}`}
                  >
                    <img
                      src={post.coverImage}
                      alt={title}
                      onLoad={onCoverImageLoad}
                    />
                    {coverCaption ? (
                      <figcaption>{coverCaption}</figcaption>
                    ) : null}
                  </figure>
                ) : null}

                <LocalizedHtml
                  value={body}
                  className="bitacora-detail-body bitacora-body"
                />

                {aboutEvent ? (
                  <section className="bitacora-detail-block">
                    <h2 className="bitacora-detail-section-title">
                      {t("bitacora.aboutEvent")}
                    </h2>
                    <LocalizedHtml
                      value={aboutEvent}
                      className="bitacora-detail-body bitacora-body"
                    />
                    {highlightFact ? (
                      <p className="bitacora-detail-highlight">
                        <strong>{t("bitacora.highlightFact")}</strong> {highlightFact}
                      </p>
                    ) : null}
                  </section>
                ) : null}

                {eventDates || eventLocation || eventEntry ? (
                  <section className="bitacora-detail-block">
                    <h2 className="bitacora-detail-section-title">
                      {t("bitacora.eventDetails")}
                    </h2>
                    <dl className="bitacora-detail-dl">
                      {eventDates ? (
                        <>
                          <dt>{t("bitacora.dates")}</dt>
                          <dd>{eventDates}</dd>
                        </>
                      ) : null}
                      {eventLocation ? (
                        <>
                          <dt>{t("bitacora.location")}</dt>
                          <dd>{eventLocation}</dd>
                        </>
                      ) : null}
                      {eventEntry ? (
                        <>
                          <dt>{t("bitacora.entry")}</dt>
                          <dd>{eventEntry}</dd>
                        </>
                      ) : null}
                    </dl>
                  </section>
                ) : null}

                {organization || post.collaborators?.length ? (
                  <section className="bitacora-detail-block">
                    <h2 className="bitacora-detail-section-title">
                      {t("bitacora.organization")}
                    </h2>
                    <LocalizedHtml
                      value={organization}
                      className="bitacora-detail-body bitacora-body"
                    />
                    {post.collaborators?.length ? (
                      <div className="bitacora-detail-collaborators">
                        <h3>{t("bitacora.collaborators")}</h3>
                        <ul>
                          {post.collaborators.map((name) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {regionalImpact ? (
                  <section className="bitacora-detail-block">
                    <h2 className="bitacora-detail-section-title">
                      {t("bitacora.regionalImpact")}
                    </h2>
                    <p className="bitacora-detail-impact">{regionalImpact}</p>
                  </section>
                ) : null}

                {post.tags?.length ? (
                  <ul className="bitacora-detail-tags">
                    {post.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                ) : null}

                <ImageGalleryCarousel gallery={post.gallery} />
              </article>
            ) : (
              <div className="bitacora-detail-empty">
                <p>{t("bitacora.notFound")}</p>
                <Link to="/noticias" className="bitacora-register-btn">
                  {t("bitacora.backToList")}
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <FooterComponent />
    </div>
  );
};
