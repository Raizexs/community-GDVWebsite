import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const SociosHeader = () => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex justify-center items-center header-screen socios-header-img`}
    >
      <div
        className={`flex justify-center md:items-center md:text-center text-white flex-col px-8`}
      >
        <h1 className="mb-5 leading-tight uppercase text-4xl md:text-6xl md:w-9/12 font-bold">
          {t("partners.header.title")}
        </h1>
        <p className="md:w-8/12 mb-8">{t("partners.header.description")}</p>
        <Link
          to={"..."}
          className={
            "vgvalpo-gradient-btn rounded-md px-8 py-3 flex justify-center items-center"
          }
        >
          {t("partners.header.joinButton")}
        </Link>
      </div>
    </div>
  );
};
