import { useTranslation } from "react-i18next";

export function BitacoraPageIntro() {
  const { t } = useTranslation();

  return (
    <div className="bitacora-page-intro">
      <h1>{t("bitacora.pageTitle")}</h1>
      <p>{t("bitacora.pageSubtitle")}</p>
    </div>
  );
}
