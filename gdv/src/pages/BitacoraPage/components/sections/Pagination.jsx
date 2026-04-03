import React from "react";
import { useTranslation } from "react-i18next";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showNumbers = true,
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageClick = (pageNumber) => {
    onPageChange(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-center mt-12 mb-8 gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`
            px-5 py-2.5
            rounded-lg border-2
            font-semibold
            transition-all duration-200
            ${
              currentPage === 1
                ? "border-[#8882a6] text-[#8882a6] opacity-50 cursor-not-allowed"
                : "border-[#2657EB] text-[#2657EB] hover:bg-[#2657EB] hover:text-white transform hover:scale-105"
            }
          `}
          aria-label={t("bitacora.pagination.previous")}
        >
          ← {t("bitacora.pagination.previous")}
        </button>

        {showNumbers && (
          <div className="hidden md:flex items-center gap-2">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-[#8882a6]"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`
                    w-10 h-10
                    rounded-lg
                    font-semibold
                    transition-all duration-200
                    ${
                      currentPage === page
                        ? "bg-[#2657EB] text-white border-2 border-[#2657EB]"
                        : "border-2 border-[#8882a6] text-[#8882a6] hover:border-[#2657EB] hover:text-[#2657EB]"
                    }
                  `}
                  aria-label={`${t("bitacora.pagination.page")} ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            px-5 py-2.5
            rounded-lg border-2
            font-semibold
            transition-all duration-200
            ${
              currentPage === totalPages
                ? "border-[#8882a6] text-[#8882a6] opacity-50 cursor-not-allowed"
                : "border-[#2657EB] text-[#2657EB] hover:bg-[#2657EB] hover:text-white transform hover:scale-105"
            }
          `}
          aria-label={t("bitacora.pagination.next")}
        >
          {t("bitacora.pagination.next")} →
        </button>
      </div>

      <div className="text-[#8882a6] text-sm">
        {t("bitacora.pagination.page")} {currentPage}{" "}
        {t("bitacora.pagination.of")} {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
