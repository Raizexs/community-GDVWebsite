import { useTranslation } from "react-i18next";
import { resolveLocalizedValue } from "../../../utils/localization";

function ProviderMedia({ provider }) {
  if (provider.logo) {
    return (
      <div className="provider-card-logo-wrap">
        <img
          src={provider.logo}
          alt=""
          className="provider-card-logo pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`provider-card-header ${provider.headerClass} flex items-center justify-center`}
    >
      <i className="bi bi-briefcase provider-card-header-icon" />
    </div>
  );
}

export function ServiceProviderCard({ provider }) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";

  const name = resolveLocalizedValue(provider.name, language);
  const tag = resolveLocalizedValue(provider.tag, language);
  const description = resolveLocalizedValue(provider.description, language);
  const hasWebsite = Boolean(provider.website);

  const primaryContent = (
    <>
      <ProviderMedia provider={provider} />
      <h4 className="provider-card-title text-lg font-bold vgvalpo-textcolor3">
        {name}
      </h4>
    </>
  );

  return (
    <article className="provider-card provider-card-simple bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col h-full w-full">
      {hasWebsite ? (
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          className="provider-card-primary-link"
        >
          {primaryContent}
        </a>
      ) : (
        <div className="provider-card-primary-static">{primaryContent}</div>
      )}

      <div className="provider-card-body">
        {tag ? <p className="provider-card-tag">{tag}</p> : null}
        <p className="provider-card-description text-gray-600 text-sm">
          {description}
        </p>
      </div>
    </article>
  );
}
