import { EventCalendarSecondaryAction } from "./EventCalendarSecondaryAction";
import { EventRegisterButton } from "./EventRegisterButton";

export function EventAgendaActions({
  event,
  language,
  showSocialCta = false,
  className = "",
}) {
  const showRegister = Boolean(event?.registrationUrl);
  const showSocial = showSocialCta && !showRegister;

  if (!showRegister && !showSocial) {
    return null;
  }

  const wrapperClass = ["bitacora-agenda-card-actions", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      {showRegister ? <EventRegisterButton event={event} /> : null}
      {showSocial ? (
        <EventCalendarSecondaryAction event={event} language={language} />
      ) : null}
    </div>
  );
}
