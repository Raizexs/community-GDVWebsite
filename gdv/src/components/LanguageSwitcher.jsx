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
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
        aria-label="Change language"
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
          className="w-4 h-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span className="uppercase">{currentLanguage}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
        <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg vgvalpo-bgcolor1 my-border z-50">
          <div className="py-1">
            <button
              onClick={() => changeLanguage("en")}
              className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${
                currentLanguage === "en" ? "bg-white/5" : ""
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">🇺🇸</span>
                English
              </span>
            </button>
            <button
              onClick={() => changeLanguage("es")}
              className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${
                currentLanguage === "es" ? "bg-white/5" : ""
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">🇪🇸</span>
                Español
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
