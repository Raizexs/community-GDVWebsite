import { useTranslation } from "react-i18next";
import aboutus from "../../../../img/AboutUSImages/GDV.jpg";
import icon1 from "../../../../img/icons/Prize.png";
import icon2 from "../../../../img/icons/Goal.png";
import icon3 from "../../../../img/icons/Eye.png";

export const AboutusSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 px-4 section-bg">
      <div className="mb-12 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          — {t("aboutUs.label")} —
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-5/12 text-2xl">
          {t("aboutUs.title")}
        </h3>
      </div>

      <div className="flex justify-center items-center flex-col gap-16 mb-24">
        <div className="flex justify-center items-center flex-col md:flex-row gap-8">
          <img src={aboutus} alt="game-bg" className="rounded-lg md:w-1/3" />
          <div className="flex flex-col md:w-4/12">
            <div className="p-4">
              <h5 className="text-black font-bold text-3xl mb-2 vgvalpo-textcolor3">
                {t("aboutUs.whoWeAre.title")}
              </h5>
              <p className="text-black text-sm vgvalpo-textcolor6">
                {t("aboutUs.whoWeAre.description")}
              </p>
            </div>
            <div className="p-4">
              <h5 className="text-black font-bold text-3xl mb-2 vgvalpo-textcolor3">
                {t("aboutUs.ourAssociation.title")}
              </h5>
              <p className="text-black text-sm vgvalpo-textcolor6">
                {t("aboutUs.ourAssociation.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mb-8">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-20">
          <div className="w-60 flex items-center text-center flex-col">
            <img
              src={icon1}
              alt=""
              className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
            />
            <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
              {t("aboutUs.values.title")}
            </h5>
            <p className="text-sm vgvalpo-textcolor6">
              {t("aboutUs.values.description")}
            </p>
          </div>
          <div className="w-60 flex items-center text-center flex-col">
            <img
              src={icon2}
              alt=""
              className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
            />
            <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
              {t("aboutUs.objectives.title")}
            </h5>
            <p className="text-sm vgvalpo-textcolor6">
              {t("aboutUs.objectives.description")}
            </p>
          </div>
          <div className="w-60 flex items-center text-center flex-col">
            <img
              src={icon3}
              alt=""
              className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
            />
            <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
              {t("aboutUs.vision.title")}
            </h5>
            <p className="text-sm vgvalpo-textcolor6">
              {t("aboutUs.vision.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
