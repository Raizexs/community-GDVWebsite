import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const ImageGallery = ({ images = [] }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  };

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold text-white mb-6">
        {t("bitacora.detail.gallery")}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(image)}
            className="
              relative
              aspect-video
              rounded-lg
              overflow-hidden
              group
              cursor-pointer
              transform
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-xl
              focus:outline-none
              focus:ring-2
              focus:ring-[#2657EB]
            "
            aria-label={`Ver imagen: ${image.alt}`}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            <div
              className="
              absolute inset-0
              bg-black bg-opacity-0
              group-hover:bg-opacity-40
              transition-all duration-300
              flex items-center justify-center
            "
            >
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={closeLightbox}
              className="
                absolute -top-12 right-0
                text-white
                hover:text-[#24C5D7]
                transition-colors
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-[#2657EB]
                p-2
                rounded
              "
              aria-label="Cerrar imagen"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col items-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />

              {selectedImage.caption && (
                <p className="text-white text-center mt-4 max-w-2xl">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#8882a6] text-sm">
            Presiona ESC o haz clic fuera de la imagen para cerrar
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
