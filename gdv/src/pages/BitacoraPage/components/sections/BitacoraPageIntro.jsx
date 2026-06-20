import { useTranslation } from "react-i18next";
import { Reveal } from "../../../../components/Reveal";

export function BitacoraPageIntro() {
  const { t } = useTranslation();

  return (
    <Reveal className="bitacora-page-intro motion-section-header" emphasis>
      <h1>{t("bitacora.pageTitle")}</h1>
      <p>{t("bitacora.pageSubtitle")}</p>
    </Reveal>
  );
}
