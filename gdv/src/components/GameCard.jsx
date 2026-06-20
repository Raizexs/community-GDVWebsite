import { useTranslation } from "react-i18next";
import { resolveLocalizedValue } from "../utils/localization";

export const GameCard = ({
  titleKey,
  descriptionKey,
  title,
  description,
  bgimg,
  imageUrl,
  link,
  gameplataforms,
}) => {
  const { t, i18n } = useTranslation();

  const localizedTitle = resolveLocalizedValue(title, i18n.language);
  const titleText =
    (title && typeof title === "object"
      ? title[i18n.language] || title.es
      : "") ||
    localizedTitle ||
    (titleKey ? t(titleKey) : "");

  const localizedDescription = resolveLocalizedValue(
    description,
    i18n.language,
  );
  const descriptionText =
    (description && typeof description === "object"
      ? description[i18n.language] || description.es
      : "") ||
    localizedDescription ||
    (descriptionKey ? t(descriptionKey) : "");

  return (
    <div className="game-card w-72 max-w-full bg-white card-shadow rounded-lg overflow-hidden">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={titleText}
            className="rounded-t-lg h-36 w-full object-cover bg-black"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div
            className={`cardimg bg-black rounded-t-lg h-36 ${bgimg}`}
            style={{ display: "none" }}
          ></div>
        </>
      ) : (
        <div className={`cardimg bg-black rounded-t-lg h-36 ${bgimg}`}></div>
      )}

      <div className="flex justify-center text-white flex-col">
        <div className="p-4 min-w-0">
          <h5 className="game-card-title text-black font-bold mb-2 select-text">
            {titleText}
          </h5>
          <p className="game-card-description text-black text-xs vgvalpo-textcolor6 select-text">
            {descriptionText}
          </p>
          <div className="game-card-footer">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="game-card-see-more vgvalpo-bgcolor5"
            >
              {t("gameCard.seeMore")}
            </a>
            <div className="game-card-platforms">
              {(gameplataforms || []).map((p, idx) => {
                const icon = p?.iconUrl || p?.icon || p?.name;
                const url = p?.url;
                const key = p?._key || `${idx}`;

                if (!icon) return null;

                const img = (
                  <img
                    src={icon}
                    alt={p?.label || p?.platform || "Platform"}
                    className="game-card-platform-icon pointer-events-none"
                    loading="lazy"
                    draggable={false}
                  />
                );

                if (!url || url === "#") {
                  return (
                    <span key={key} className="inline-flex">
                      {img}
                    </span>
                  );
                }

                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="platform-link inline-flex shrink-0"
                    aria-label={p?.label || p?.platform || "Platform"}
                  >
                    {img}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
