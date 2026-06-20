import Logo from "../img/gdv-icon2.PNG";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MEMBERSHIP_WIP_ROUTE } from "../utils/membershipRoute";

function isNavActive(pathname, path) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isAssociationActive(pathname) {
  return isNavActive(pathname, "/aboutus") || isNavActive(pathname, "/socios");
}

function navLinkClass(pathname, path, mobile = false) {
  const base = mobile ? "navbar-mobile-link" : "navbar-link";
  return `${base}${isNavActive(pathname, path) ? " is-active" : ""}`;
}

export const NavbarComponent = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenOption, setIsOpenOption] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsOpenOption(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleOption = () => {
    setIsOpenOption(!isOpenOption);
  };

  const associationActive = isAssociationActive(pathname);

  return (
    <div
      className={`NavbarComponent sticky top-0 z-50 w-full ${
        isScrolled ? "navbar-scrolled" : ""
      }`}
    >
      <nav className="navbar-inner vgvalpo-bgcolor1 px-6 py-5 my-border-bottom">
        <div className="px-8 mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="navbar-logo-link inline-flex shrink-0"
            aria-label={t("navbar.home")}
          >
            <img src={Logo} alt="" className="w-16" />
          </Link>

          <div className="hidden md:flex md:justify-center md:items-center space-x-10">
            <Link to="/" className={navLinkClass(pathname, "/")}>
              {t("navbar.home")}
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={toggleOption}
                className={`navbar-dropdown-btn ${
                  associationActive ? "is-active" : ""
                } ${isOpenOption ? "is-open" : ""}`}
                aria-expanded={isOpenOption}
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
                      to="/aboutus"
                      className={`navbar-dropdown-link ${
                        isNavActive(pathname, "/aboutus") ? "is-active" : ""
                      }`}
                    >
                      {t("navbar.aboutUs")}
                    </Link>
                    <Link
                      to="/socios"
                      className={`navbar-dropdown-link ${
                        isNavActive(pathname, "/socios") ? "is-active" : ""
                      }`}
                    >
                      {t("navbar.ourPartners")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to="/videogames" className={navLinkClass(pathname, "/videogames")}>
              {t("navbar.videoGames")}
            </Link>
            <Link to="/noticias" className={navLinkClass(pathname, "/noticias")}>
              {t("navbar.bitacora")}
            </Link>
            <Link to="/contact" className={navLinkClass(pathname, "/contact")}>
              {t("navbar.contact")}
            </Link>
            <LanguageSwitcher />
            <Link
              to={MEMBERSHIP_WIP_ROUTE}
              className="navbar-membership-btn vgvalpo-gradient-btn rounded-md px-6 py-3 flex justify-center items-center text-white"
              aria-label="Ir a membresia"
            >
              {t("navbar.membership")}
            </Link>
          </div>

          <div className="md:hidden flex justify-center items-center">
            <button
              type="button"
              onClick={toggleMenu}
              className="flex justify-center items-center"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
            >
              <i className="bi bi-list text-white text-4xl"></i>
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden absolute z-20 w-full vgvalpo-bgcolor1 p-4 px-6 my-border-top my-border-bottom">
          <Link to="/" className={navLinkClass(pathname, "/", true)}>
            {t("navbar.home")}
          </Link>
          <button
            type="button"
            onClick={toggleOption}
            className={`navbar-dropdown-btn w-full text-left py-4 ${
              associationActive ? "is-active" : ""
            } ${isOpenOption ? "is-open" : ""}`}
            aria-expanded={isOpenOption}
          >
            {t("navbar.association")}{" "}
            <i
              className={`bi bi-chevron-down text-xs ml-1 transition-transform ${isOpenOption ? "rotate-180" : ""}`}
            ></i>
          </button>
          {isOpenOption && (
            <div className="md:hidden z-20 w-full vgvalpo-bgcolor1 px-4 py-2 my-border rounded-md">
              <Link
                to="/aboutus"
                className={`navbar-mobile-link ${
                  isNavActive(pathname, "/aboutus") ? "is-active" : ""
                }`}
              >
                {t("navbar.aboutUs")}
              </Link>
              <Link
                to="/socios"
                className={`navbar-mobile-link ${
                  isNavActive(pathname, "/socios") ? "is-active" : ""
                }`}
              >
                {t("navbar.ourPartners")}
              </Link>
            </div>
          )}
          <Link
            to="/videogames"
            className={navLinkClass(pathname, "/videogames", true)}
          >
            {t("navbar.videoGames")}
          </Link>
          <Link to="/noticias" className={navLinkClass(pathname, "/noticias", true)}>
            {t("navbar.bitacora")}
          </Link>
          <Link to="/contact" className={navLinkClass(pathname, "/contact", true)}>
            {t("navbar.contact")}
          </Link>
          <div className="mb-4 mt-2">
            <LanguageSwitcher />
          </div>
          <Link
            to={MEMBERSHIP_WIP_ROUTE}
            className="navbar-membership-btn vgvalpo-gradient-btn rounded-md px-6 py-3 flex justify-center items-center w-40 mb-4 text-white"
          >
            {t("navbar.membership")}
          </Link>
        </div>
      )}
    </div>
  );
};
