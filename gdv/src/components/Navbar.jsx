import Logo from "../img/gdv-icon2.PNG";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const NavbarComponent = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenOption, setIsOpenOption] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleOption = () => {
    setIsOpenOption(!isOpenOption);
  };

  return (
    <div className="NavbarComponent sticky top-0 z-10 w-full">
      <nav className="vgvalpo-bgcolor1 px-6 py-5 my-border-bottom">
        <div className="px-8 mx-auto flex justify-between items-center">
          <img src={Logo} alt="" className="w-16" />

          <div className="hidden md:flex md:justify-center md:items-center space-x-10">
            <Link to={"/"} className="text-white vg-link">
              {t("navbar.home")}
            </Link>
            <div className="relative">
              <button
                onClick={toggleOption}
                className="text-white flex items-center hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                {t("navbar.association")}{" "}
                <i
                  className={`bi bi-chevron-down text-xs ml-1 transition-transform ${isOpenOption ? "rotate-180" : ""}`}
                ></i>
              </button>
              {isOpenOption && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg vgvalpo-bgcolor1 my-border z-50">
                  <div className="py-1">
                    <Link
                      to={"/aboutus"}
                      className="block text-white px-4 py-2 vg-link hover:bg-white/10 transition-colors"
                    >
                      {t("navbar.aboutUs")}
                    </Link>
                    <Link
                      to={"/socios"}
                      className="block text-white px-4 py-2 vg-link hover:bg-white/10 transition-colors"
                    >
                      {t("navbar.ourPartners")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to={"/videogames"} className="text-white vg-link">
              {t("navbar.videoGames")}
            </Link>
            <Link to={"/contact"} className="text-white vg-link">
              {t("navbar.contact")}
            </Link>
            <LanguageSwitcher />
            <Link
              to={""}
              className={
                "vgvalpo-gradient-btn rounded-md px-6 py-3 flex justify-center items-center text-white"
              }
            >
              {t("navbar.membership")}
            </Link>
          </div>

          <div className="md:hidden flex justify-center items-center">
            <button
              onClick={toggleMenu}
              className="flex justify-center items-center"
            >
              <i className="bi bi-list text-white text-4xl"></i>
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden absolute z-20 w-full vgvalpo-bgcolor1 p-4 px-6 my-border-top my-border-bottom">
          <Link to={"/"} className="text-white py-4 block vg-link">
            {t("navbar.home")}
          </Link>
          <button
            onClick={toggleOption}
            className="text-white py-4 block w-full text-left flex items-center hover:bg-white/10 px-3 rounded-lg transition-colors"
          >
            {t("navbar.association")}{" "}
            <i className={`bi bi-chevron-down text-xs ml-1 transition-transform ${isOpenOption ? "rotate-180" : ""}`}></i>
          </button>
          {isOpenOption && (
            <div className="md:hidden z-20 w-full vgvalpo-bgcolor1 px-4 py-2 my-border rounded-md">
              <Link to={"/aboutus"} className="text-white py-4 block vg-link hover:bg-white/10 transition-colors px-2 rounded-lg">
                {t("navbar.aboutUs")}
              </Link>
              <Link to={"/socios"} className="text-white py-4 block vg-link hover:bg-white/10 transition-colors px-2 rounded-lg">
                {t("navbar.ourPartners")}
              </Link>
            </div>
          )}
          <Link to={"/videogames"} className="text-white py-4 block vg-link">
            {t("navbar.videoGames")}
          </Link>
          <Link to={"/contact"} className="text-white py-4 mb-4 block vg-link">
            {t("navbar.contact")}
          </Link>
          <div className="mb-4">
            <LanguageSwitcher />
          </div>
          <Link
            to={""}
            className={
              "vgvalpo-gradient-btn rounded-md px-6 py-3 flex justify-center items-center w-40 mb-4 text-white"
            }
          >
            {t("navbar.membership")}
          </Link>
        </div>
      )}
    </div>
  );
};
