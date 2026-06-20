import { useTranslation } from "react-i18next";
import { resolveLocalizedValue } from "../../../utils/localization";

const GDV_SOCIAL_LINKS = [
  {
    id: "instagram",
    href: "https://www.instagram.com/gdvalparaiso/",
    icon: "bi-instagram",
    labelKey: "bitacora.agenda.instagram",
    className: "bitacora-event-social-cta-btn bitacora-event-social-cta-btn-instagram",
  },
  {
    id: "discord",
    href: "https://discord.gg/7QCfZeeR5W",
    icon: "bi-discord",
    labelKey: "bitacora.agenda.discord",
    className: "bitacora-event-social-cta-btn bitacora-event-social-cta-btn-discord",
  },
];

export function EventCalendarSecondaryAction({ event, language }) {
  const { t } = useTranslation();
  const actionUrl = String(event?.actionUrl || "").trim();
  const actionLabel = resolveLocalizedValue(event?.actionLabel, language);

  if (actionUrl) {
    return (
      <a
        href={actionUrl}
        className="bitacora-event-action-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        {actionLabel || t("bitacora.agenda.defaultAction")}
        <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
      </a>
    );
  }

  return (
    <div className="bitacora-event-social-cta animate-fadeIn">
      <span className="bitacora-event-social-cta-badge">
        <i className="bi bi-bell-fill" aria-hidden="true" />
        {t("bitacora.agenda.followNetworksBadge")}
      </span>
      <p className="bitacora-event-social-cta-title">
        {t("bitacora.agenda.followNetworksTitle")}
      </p>
      <p className="bitacora-event-social-cta-text">
        {t("bitacora.agenda.followNetworks")}
      </p>
      <div className="bitacora-event-social-cta-actions">
        {GDV_SOCIAL_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={link.className}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className={`bi ${link.icon}`} aria-hidden="true" />
            {t(link.labelKey)}
          </a>
        ))}
      </div>
    </div>
  );
}
