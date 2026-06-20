import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { PageEnter } from "../../components/PageEnter";

export const ErrorPage = () => {
  const { t } = useTranslation();

  return (
    <div className="">
      <NavbarComponent />
      <PageEnter>
        <header>
          <div className="flex justify-center items-center header-screen contact-header-img">
            <div className="flex justify-center md:items-center md:text-center text-white flex-col px-8">
              <h1 className="mb-5 leading-tight text-4xl md:text-6xl font-bold">
                {t("errorPage.title")}
              </h1>
              <p className="mb-8 w-3/4">{t("errorPage.description")}</p>
              <Link
                to="/"
                className="vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
              >
                {t("errorPage.backHome")}
              </Link>
            </div>
          </div>
        </header>
      </PageEnter>
    </div>
  );
};
