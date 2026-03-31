import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Jointheguild = () => {
  const { t } = useTranslation();

  return (
    <section className={`flex justify-center items-center cta-gremio-bg`}>
      <div
        className={`flex justify-center md:items-center md:text-center text-white flex-col px-8`}
      >
        <h1 className="mb-3 leading-tight text-2xl uppercase md:text-3xl md:w-10/12 font-bold">
          {t("joinGuild.title")}
        </h1>
        <p className="md:w-7/12 mb-6">{t("joinGuild.description")}</p>
        <Link
          to={"..."}
          className={
            "vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
          }
        >
          {t("joinGuild.joinButton")}
        </Link>
      </div>
    </section>
  );
};
