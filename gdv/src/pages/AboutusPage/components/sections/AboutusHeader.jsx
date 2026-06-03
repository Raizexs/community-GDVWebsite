import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MEMBERSHIP_WIP_ROUTE } from "../../../../utils/membershipRoute";

export const AboutusHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center header-screen aboutus-header-img">
      <div className="flex justify-center md:items-center md:text-center text-white flex-col px-8">
        <h1 className="mb-5 leading-tight uppercase text-4xl md:text-6xl md:w-7/12 font-bold">
          Juntos apoyamos el talento chileno en los{" "}
          <b className="font-bold vgvalpo-textcolor4">videojuegos</b>
        </h1>
        <p className="md:w-7/12 mb-8">
          ¡Somos un gremio dedicado apoyar el talento chileno en videojuegos!
          Descubre experiencias únicas que reflejan nuestra cultura y pasión por
          lo videojuegos y mucho más.
        </p>
        <Link
          to={MEMBERSHIP_WIP_ROUTE}
          className="vgvalpo-gradient-btn rounded-md px-8 py-3 flex justify-center items-center"
        >
          {t("joinGuild.joinButton")}
        </Link>
      </div>
    </div>
  );
};
