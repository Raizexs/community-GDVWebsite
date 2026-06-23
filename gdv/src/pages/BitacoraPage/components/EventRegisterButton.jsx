import { useTranslation } from "react-i18next";
import { isEventRegistrationActive } from "../../../services/events/eventsService";

export function EventRegisterButton({ event, className = "" }) {
  const { t } = useTranslation();

  if (!isEventRegistrationActive(event)) {
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
