import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useImageOrientation } from "../../../hooks/useImageOrientation";
import { resolveLocalizedValue } from "../../../utils/localization";

const CROSSFADE_MS = 400;
const SWIPE_THRESHOLD = 50;

function useSwipeNavigation(onPrev, onNext, enabled = true) {
  const touchStart = useRef(null);
  const didSwipe = useRef(false);

  const onTouchStart = useCallback(
    (event) => {
      if (!enabled) return;
      const touch = event.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      didSwipe.current = false;
    },
    [enabled],
  );

  const onTouchMove = useCallback(
    (event) => {
      if (!enabled || !touchStart.current) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      if (Math.abs(deltaX) > 24 && Math.abs(deltaX) > Math.abs(deltaY)) {
        didSwipe.current = true;
      }
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (event) => {
      if (!enabled || !touchStart.current) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;

      if (didSwipe.current && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        if (deltaX < 0) onNext();
        else onPrev();
      }

      touchStart.current = null;
    },
    [enabled, onNext, onPrev],
  );

  const consumeSwipe = useCallback(() => {
    const wasSwipe = didSwipe.current;
    didSwipe.current = false;
    return wasSwipe;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, consumeSwipe };
}

function GalleryLightbox({
  gallery,
  activeIndex,
  language,
  onClose,
  onNavigate,
  closeLabel,
  prevLabel,
  nextLabel,
  defaultAlt,
}) {
  const item = gallery[activeIndex];
  const caption = resolveLocalizedValue(item?.caption, language);
  const altText = caption || defaultAlt;
  const { orientation, onImageLoad } = useImageOrientation(item?.src);
  const lightboxImageClass = [
    "bitacora-gallery-lightbox-image",
    orientation === "landscape"
      ? "bitacora-gallery-lightbox-image--landscape"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const goPrev = useCallback(
    () => onNavigate(activeIndex - 1),
    [activeIndex, onNavigate],
  );
  const goNext = useCallback(
    () => onNavigate(activeIndex + 1),
    [activeIndex, onNavigate],
  );

  const swipe = useSwipeNavigation(goPrev, goNext, gallery.length > 1);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && gallery.length > 1) goPrev();
      if (event.key === "ArrowRight" && gallery.length > 1) goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gallery.length, goNext, goPrev, onClose]);

  return (
    <div
      className="bitacora-gallery-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={altText}
    >
      <button
        type="button"
        className="bitacora-gallery-lightbox-close"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <i className="bi bi-x-lg" />
      </button>

      {gallery.length > 1 ? (
        <button
          type="button"
          className="bitacora-gallery-lightbox-nav bitacora-gallery-lightbox-nav-prev"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          aria-label={prevLabel}
        >
          <i className="bi bi-chevron-left" />
        </button>
      ) : null}

      <div
        className="bitacora-gallery-lightbox-content"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <img
          src={item.src}
          alt={altText}
          className={lightboxImageClass}
          onLoad={onImageLoad}
          draggable={false}
        />
        {caption ? (
          <p className="bitacora-gallery-lightbox-caption">{caption}</p>
        ) : null}
      </div>

      {gallery.length > 1 ? (
        <button
          type="button"
          className="bitacora-gallery-lightbox-nav bitacora-gallery-lightbox-nav-next"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          aria-label={nextLabel}
        >
          <i className="bi bi-chevron-right" />
        </button>
      ) : null}
    </div>
  );
}

function GallerySlide({ src, alt, caption, onOpen, zoomLabel }) {
  const { orientation, onImageLoad } = useImageOrientation(src);
  const imageClass = [
    "bitacora-gallery-image",
    orientation === "landscape" ? "bitacora-gallery-image--landscape" : "",
    orientation === "portrait" ? "bitacora-gallery-image--portrait" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className="bitacora-gallery-slide"
      onClick={onOpen}
      aria-label={zoomLabel}
    >
      <img
        src={src}
        alt={alt}
        className={imageClass}
        onLoad={onImageLoad}
        decoding="async"
        draggable={false}
      />
      {caption ? (
        <span className="bitacora-gallery-caption">{caption}</span>
      ) : null}
      <span className="bitacora-gallery-zoom-hint" aria-hidden="true">
        <i className="bi bi-zoom-in" />
      </span>
    </button>
  );
}

export function ImageGalleryCarousel({ gallery = [] }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState(null);
  const [fadeActive, setFadeActive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!transition) {
      setFadeActive(false);
      return undefined;
    }

    setFadeActive(false);
    const timer = window.setTimeout(() => setFadeActive(true), 24);

    return () => window.clearTimeout(timer);
  }, [transition]);

  const goTo = useCallback(
    (index) => {
      const total = gallery.length;
      const nextIndex = (index + total) % total;
      if (nextIndex === activeIndex || isAnimatingRef.current) return;

      const preload = new Image();
      preload.src = gallery[nextIndex].src;

      const startTransition = () => {
        isAnimatingRef.current = true;
        setTransition({ from: activeIndex, to: nextIndex });

        window.setTimeout(() => {
          setActiveIndex(nextIndex);
          setTransition(null);
          isAnimatingRef.current = false;
        }, CROSSFADE_MS);
      };

      if (preload.complete) {
        startTransition();
      } else {
        preload.onload = startTransition;
        preload.onerror = startTransition;
      }
    },
    [activeIndex, gallery],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const carouselSwipe = useSwipeNavigation(
    goPrev,
    goNext,
    gallery.length > 1,
  );

  const navigateLightbox = useCallback(
    (index) => {
      const total = gallery.length;
      const nextIndex = (index + total) % total;
      setLightboxIndex(nextIndex);
      setActiveIndex(nextIndex);
    },
    [gallery.length],
  );

  const activeItem = gallery[activeIndex];
  const { orientation: activeOrientation } = useImageOrientation(
    activeItem?.src,
  );

  if (!gallery.length) return null;
  const caption = resolveLocalizedValue(activeItem.caption, language);
  const altText = caption || t("bitacora.galleryImageAlt");
  const zoomLabel = t("bitacora.galleryZoom");
  const closeLabel = t("bitacora.galleryClose");

  const openLightbox = (index) => {
    if (carouselSwipe.consumeSwipe()) return;
    setLightboxIndex(index);
  };
  const closeLightbox = () => setLightboxIndex(null);

  const viewportClass = [
    "bitacora-gallery-viewport",
    transition && fadeActive ? "bitacora-gallery-viewport--fading" : "",
    activeOrientation === "landscape"
      ? "bitacora-gallery-viewport--landscape"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="bitacora-gallery">
      <h2 className="bitacora-detail-section-title">
        {t("bitacora.galleryTitle")}
      </h2>

      <div className="bitacora-gallery-frame">
        <div
          className={viewportClass}
          onTouchStart={carouselSwipe.onTouchStart}
          onTouchMove={carouselSwipe.onTouchMove}
          onTouchEnd={carouselSwipe.onTouchEnd}
        >
          {transition ? (
            <>
              <div className="bitacora-gallery-layer bitacora-gallery-layer--out">
                <GallerySlide
                  src={gallery[transition.from].src}
                  alt=""
                  caption=""
                  onOpen={() => openLightbox(transition.from)}
                  zoomLabel={zoomLabel}
                />
              </div>
              <div className="bitacora-gallery-layer bitacora-gallery-layer--in">
                <GallerySlide
                  src={gallery[transition.to].src}
                  alt=""
                  caption=""
                  onOpen={() => openLightbox(transition.to)}
                  zoomLabel={zoomLabel}
                />
              </div>
            </>
          ) : (
            <GallerySlide
              src={activeItem.src}
              alt={altText}
              caption={caption}
              onOpen={() => openLightbox(activeIndex)}
              zoomLabel={zoomLabel}
            />
          )}
        </div>
      </div>

      {gallery.length > 1 ? (
        <div className="bitacora-gallery-dots">
          {gallery.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              className={`bitacora-gallery-dot ${
                index === activeIndex ? "bitacora-gallery-dot-active" : ""
              }`}
              onClick={() => goTo(index)}
              aria-label={t("bitacora.galleryGoTo", { index: index + 1 })}
            />
          ))}
          <span className="bitacora-gallery-counter">
            {t("bitacora.galleryCounter", {
              current: activeIndex + 1,
              total: gallery.length,
            })}
          </span>
        </div>
      ) : null}

      {lightboxIndex !== null ? (
        <GalleryLightbox
          gallery={gallery}
          activeIndex={lightboxIndex}
          language={language}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
          closeLabel={closeLabel}
          prevLabel={t("bitacora.galleryPrev")}
          nextLabel={t("bitacora.galleryNext")}
          defaultAlt={t("bitacora.galleryImageAlt")}
        />
      ) : null}
    </section>
  );
}
