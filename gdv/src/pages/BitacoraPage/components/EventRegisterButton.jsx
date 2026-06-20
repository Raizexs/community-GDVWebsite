import { useTranslation } from "react-i18next";

export function EventRegisterButton({ event, className = "" }) {
  const { t } = useTranslation();

  if (!event?.registrationUrl) {
    return null;
  }

  return (
    <a
      href={event.registrationUrl}
      className={`bitacora-register-btn ${className}`.trim()}
      target="_blank"
      rel="noopener noreferrer"
    >
      {t("bitacora.agenda.register")}
    </a>
  );
}
