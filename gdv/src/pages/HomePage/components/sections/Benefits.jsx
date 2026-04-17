import { useTranslation } from "react-i18next";
import { resolveLocalizedValue } from "../../../../utils/localization";
import icon1 from "../../../../img/icons/News.png";
import icon2 from "../../../..//img/icons/People Working Together.png";
import icon3 from "../../../../img/icons/Commercial.png";
import icon4 from "../../../../img/icons/Education.png";
import icon5 from "../../../../img/icons/Business.png";
import icon6 from "../../../../img/icons/Tear-Off Calendar.png";

export const Benefits = ({ homeContent }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const dynamicBenefits = (homeContent?.benefitItems || []).map((item, index) => ({
    key: `dynamic-${index}`,
    icon: item.icon,
    title: resolveLocalizedValue(item.title, language),
    description: resolveLocalizedValue(item.description, language),
  }));
  const staticBenefits = [
    { key: "press", icon: icon1 },
    { key: "networking", icon: icon2 },
    { key: "diffusion", icon: icon3 },
    { key: "education", icon: icon4 },
    { key: "consultancy", icon: icon5 },
    { key: "events", icon: icon6 },
  ].map((item) => ({
    ...item,
    title: t(`home.benefits.${item.key}.title`),
    description: t(`home.benefits.${item.key}.description`),
  }));
  const benefits = dynamicBenefits.length ? dynamicBenefits : staticBenefits;
  const sectionLabel =
    resolveLocalizedValue(homeContent?.benefitsSection?.title, language) || t("home.benefits.label");
  const sectionTitle =
    resolveLocalizedValue(homeContent?.benefitsSection?.description, language) || t("home.benefits.title");

  return (
    <section className="py-20 px-4 section-bg mt-12">
      <div className="mb-16 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">{sectionLabel}</h6>
        <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
          {sectionTitle}
        </h3>
      </div>

      <div className="flex justify-center items-center mb-8">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-20">
          {benefits.map((benefit) => (
            <div
              key={benefit.key}
              className="w-60 flex items-center text-center flex-col"
            >
              <img
                src={benefit.icon}
                alt=""
                className="w-4/12 vgvalpo-gradient p-5 rounded-full mb-4"
              />
              <h5 className="vgvalpo-textcolor5 font-bold mb-2 text-xl">
                {benefit.title}
              </h5>
              <p className="text-sm vgvalpo-textcolor6">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
