import { useTranslation } from "react-i18next";
import aboutus from "../../../../img/AboutUSImages/GDV.jpg";
import icon1 from "../../../../img/icons/Prize.png";
import icon2 from "../../../../img/icons/Goal.png";
import icon3 from "../../../../img/icons/Eye.png";

export const AboutusSection = ({ content }) => {
  const { t, i18n } = useTranslation();
  const i18nLanguage = (i18n?.resolvedLanguage || i18n?.language || "").toLowerCase();
  const lang = i18nLanguage.startsWith("en") ? "en" : "es";

  const title = content?.title?.[lang] || t("aboutUs.title");
  const whoWeAreTitle = content?.whoWeAre?.title?.[lang] || t("aboutUs.whoWeAre.title");
  const whoWeAreDescription = content?.whoWeAre?.description?.[lang] || t("aboutUs.whoWeAre.description");
  const ourAssociationTitle = content?.ourAssociation?.title?.[lang] || t("aboutUs.ourAssociation.title");
  const ourAssociationDescription =
    content?.ourAssociation?.description?.[lang] || t("aboutUs.ourAssociation.description");
  const valuesTitle = content?.values?.title?.[lang] || t("aboutUs.values.title");
  const valuesDescription = content?.values?.description?.[lang] || t("aboutUs.values.description");
  const objectivesTitle = content?.objectives?.title?.[lang] || t("aboutUs.objectives.title");
  const objectivesDescription =
    content?.objectives?.description?.[lang] || t("aboutUs.objectives.description");
  const visionTitle = content?.vision?.title?.[lang] || t("aboutUs.vision.title");
  const visionDescription = content?.vision?.description?.[lang] || t("aboutUs.vision.description");
  const heroImage = content?.heroImage || aboutus;

  return (
    <section className="py-20 px-4 section-bg">
      <div className="mb-12 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          — {t("aboutUs.label")} —
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-5/12 text-2xl">
          {title}
        </h3>
      </div>

      <div className="flex justify-center items-center flex-col gap-16 mb-24">
        <div className="flex justify-center items-center flex-col md:flex-row gap-8">
          <img src={heroImage} alt="about-us" className="rounded-lg md:w-1/3" />
          <div className="flex flex-col md:w-4/12">
            <div className="p-4">
              <h5 className="text-black font-bold text-3xl mb-2 vgvalpo-textcolor3">
                {whoWeAreTitle}
              </h5>
              <p className="text-black text-sm vgvalpo-textcolor6">
                {whoWeAreDescription}
              </p>
            </div>
            <div className="p-4">
              <h5 className="text-black font-bold text-3xl mb-2 vgvalpo-textcolor3">
                {ourAssociationTitle}
              </h5>
              <p className="text-black text-sm vgvalpo-textcolor6">
                {ourAssociationDescription}
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
              {valuesTitle}
            </h5>
            <p className="text-sm vgvalpo-textcolor6">
              {valuesDescription}
            </p>
          </div>
          <div className="w-60 flex items-center text-center flex-col">
            <img
              src={icon2}
              alt=""
              className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
            />
            <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
              {objectivesTitle}
            </h5>
            <p className="text-sm vgvalpo-textcolor6">
              {objectivesDescription}
            </p>
          </div>
          <div className="w-60 flex items-center text-center flex-col">
            <img
              src={icon3}
              alt=""
              className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
            />
            <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
              {visionTitle}
            </h5>
            <p className="text-sm vgvalpo-textcolor6">
              {visionDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
