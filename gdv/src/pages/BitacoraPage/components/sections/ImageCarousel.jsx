import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const ImageCarousel = ({ images = [] }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold text-white mb-6">
        {t("bitacora.detail.carousel.title")}
      </h3>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <div
          className="relative w-full bg-gray-900 flex items-center justify-center"
          style={{ aspectRatio: "16/9" }}
        >
          {currentImage && currentImage.url && (
            <>
              <img
                src={currentImage.url}
                alt={currentImage.alt || "Imagen"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Error loading image:", currentImage.url);
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23333' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="
                absolute left-4 top-1/2 transform -translate-y-1/2 z-10
                bg-white/20 hover:bg-white/40
                text-white p-3 rounded-full
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#2657EB]
              "
              aria-label={t("bitacora.detail.carousel.previousImage")}
            >
              <svg
                className="w-6 h-6"
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
            </button>

            <button
              onClick={goToNext}
              className="
                absolute right-4 top-1/2 transform -translate-y-1/2 z-10
                bg-white/20 hover:bg-white/40
                text-white p-3 rounded-full
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#2657EB]
              "
              aria-label={t("bitacora.detail.carousel.nextImage")}
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </>
        )}

        {currentImage && currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
            <p className="text-sm md:text-base">{currentImage.caption}</p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <div className="flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    index === currentIndex
                      ? "bg-[#24C5D7] w-8"
                      : "bg-[#8882a6] w-2 hover:bg-[#a49dc3]"
                  }
                `}
                aria-label={`${t("bitacora.detail.carousel.goToImage")} ${
                  index + 1
                }`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>

          <div className="text-[#8882a6] text-sm font-semibold">
            {currentIndex + 1} {t("bitacora.detail.carousel.of")} {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
