import { formatEventDateTime } from "../../../utils/bitacoraFormat";
import { EventAgendaActions } from "./EventAgendaActions";

export function EventAgendaCard({
  event,
  language,
  showSocialCta = false,
  isHighlighted = false,
}) {
  return (
    <article
      className={`bitacora-agenda-card ${
        isHighlighted ? "bitacora-agenda-card-highlight" : ""
      }`}
    >
      <p className="bitacora-agenda-card-date">
        {formatEventDateTime(event.startsAt, language)}
      </p>
      <h4>{event.title}</h4>
      <p>{event.description}</p>
      <p className="bitacora-agenda-card-location">{event.location}</p>
      <EventAgendaActions
        event={event}
        language={language}
        showSocialCta={showSocialCta}
      />
    </article>
  );
}
