import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatEventDateTime } from "../../../../utils/bitacoraFormat";
import {
  fetchUpcomingEvents,
  getStaticUpcomingEvents,
} from "../../../../services/events/eventsService";
import { Reveal } from "../../../../components/Reveal";
import { EventAgendaActions } from "../EventAgendaActions";
import { EventAgendaCard } from "../EventAgendaCard";

export function EventAgendaSection() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadEvents = async ({ force = false } = {}) => {
      try {
        const data = await fetchUpcomingEvents({ language, force });
        if (mounted) setUpcomingEvents(data || []);
      } catch {
        if (mounted) setUpcomingEvents(getStaticUpcomingEvents(language));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEvents();

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        loadEvents({ force: true });
      }
    };

    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [language]);

  const nextEvent = useMemo(() => upcomingEvents[0] || null, [upcomingEvents]);

  const calendarEvents = useMemo(
    () => upcomingEvents.slice(1),
    [upcomingEvents],
  );

  const furthestEventId = useMemo(
    () => upcomingEvents[upcomingEvents.length - 1]?.id || null,
    [upcomingEvents],
  );

  if (!loading && !upcomingEvents.length) return null;

  return (
    <section className="bitacora-agenda-section">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal className="bitacora-agenda-header motion-section-header">
          <h6>— {t("bitacora.agenda.label")} —</h6>
          <h2>{t("bitacora.agenda.title")}</h2>
          <p>{t("bitacora.agenda.subtitle")}</p>
        </Reveal>

        {loading ? (
          <p className="bitacora-state-message">
            {t("bitacora.agenda.loading")}
          </p>
        ) : (
          <>
            {nextEvent ? (
              <Reveal className="bitacora-next-event">
                <div className="bitacora-next-event-copy">
                  <span className="bitacora-next-event-badge">
                    {t("bitacora.agenda.nextEvent")}
                  </span>
                  <p className="bitacora-next-event-date">
                    {formatEventDateTime(nextEvent.startsAt, language)}
                  </p>
                  <h3>{nextEvent.title}</h3>
                  <p className="bitacora-next-event-description">
                    {nextEvent.description}
                  </p>
                  <p className="bitacora-next-event-location">
                    {nextEvent.location}
                  </p>
                </div>
                <EventAgendaActions
                  event={nextEvent}
                  language={language}
                  showSocialCta={nextEvent.id === furthestEventId}
                  className="bitacora-next-event-actions"
                />
              </Reveal>
            ) : null}

            <div className="bitacora-agenda-footer">
              <button
                type="button"
                className={`bitacora-agenda-calendar-btn ${
                  calendarOpen ? "bitacora-agenda-calendar-btn-open" : ""
                }`}
                onClick={() => setCalendarOpen((open) => !open)}
                aria-expanded={calendarOpen}
                aria-controls="bitacora-calendar-panel"
              >
                {calendarOpen
                  ? t("bitacora.agenda.hideCalendar")
                  : t("bitacora.agenda.viewCalendar")}
                <i className="bi bi-chevron-down bitacora-calendar-chevron" />
              </button>
            </div>

            <div
              id="bitacora-calendar-panel"
              className={`bitacora-calendar-panel ${
                calendarOpen ? "bitacora-calendar-panel-open" : ""
              }`}
              aria-hidden={!calendarOpen}
            >
              <div className="bitacora-calendar-panel-inner">
                <p className="bitacora-calendar-panel-label">
                  {t("bitacora.agenda.allUpcoming")}
                </p>
                {calendarEvents.length ? (
                  <Reveal className="bitacora-agenda-grid" stagger>
                    {calendarEvents.map((event) => (
                      <EventAgendaCard
                        key={event.id}
                        event={event}
                        language={language}
                        showSocialCta={event.id === furthestEventId}
                      />
                    ))}
                  </Reveal>
                ) : (
                  <p className="bitacora-calendar-empty-message">
                    {t("bitacora.agenda.noMoreEvents")}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
