import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className={`navbar-lang-btn ${isOpen ? "is-open" : ""}`}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="navbar-lang-icon"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span className="navbar-lang-label uppercase">{currentLanguage}</span>
        <svg
          className={`navbar-lang-chevron ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg vgvalpo-bgcolor1 my-border z-50">
          <div className="py-1">
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`navbar-lang-option ${
                currentLanguage === "en" ? "is-active" : ""
              }`}
            >
              <span className="navbar-lang-option-flag" aria-hidden="true">
                🇺🇸
              </span>
              English
            </button>
            <button
              type="button"
              onClick={() => changeLanguage("es")}
              className={`navbar-lang-option ${
                currentLanguage === "es" ? "is-active" : ""
              }`}
            >
              <span className="navbar-lang-option-flag" aria-hidden="true">
                🇪🇸
              </span>
              Español
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
