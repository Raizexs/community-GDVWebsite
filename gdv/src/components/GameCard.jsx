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
    (title && typeof title === "object" ? title[i18n.language] || title.es : "") ||
    localizedTitle ||
    (titleKey ? t(titleKey) : "");

  const localizedDescription = resolveLocalizedValue(description, i18n.language);
  const descriptionText =
    (description && typeof description === "object" ? description[i18n.language] || description.es : "") ||
    localizedDescription ||
    (descriptionKey ? t(descriptionKey) : "");

  return (
    <div className="w-72 bg-white card-shadow rounded-lg">
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
        <div className="p-4">
          <h5 className="text-black font-bold mb-2">{titleText}</h5>
          <p className="text-black text-xs vgvalpo-textcolor6">
            {descriptionText}
          </p>
          <div className="flex justify-between mt-4">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "vgvalpo-bgcolor5 rounded-md px-6 text-sm py-2 flex justify-center items-center"
              }
            >
              {t("gameCard.seeMore")}
            </a>
            <div className="flex justify-center items-center gap-1">
              {(gameplataforms || []).map((p, idx) => {
                const icon = p?.iconUrl || p?.icon || p?.name;
                const url = p?.url;
                const key = p?._key || `${idx}`;

                if (!url || !icon) return null;

                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={icon}
                      alt={p?.label || p?.platform || "Platform"}
                      style={{ width: "22px", height: "22px", borderRadius: "9999px", objectFit: "cover" }}
                      loading="lazy"
                    />
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
