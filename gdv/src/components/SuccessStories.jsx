export const SuccessStories = ({
  title,
  description,
  image,
  gameplataforms,
  info,
}) => {
  return (
    <div className="flex justify-center items-center flex-col md:flex-row gap-5">
      <div className="p-4 md:w-3/12">
        <h5 className="text-black font-bold md:text-xl text-lg mb-2">
          {title}
        </h5>
        <p className="text-black text-sm vgvalpo-textcolor6 mb-2">
          {description}
        </p>
        <div className="flex gap-2">
          <b className="font-bold vgvalpo-textcolor3">Plataformas:</b>
          <div className="flex items-center gap-1 flex-wrap">
            {(gameplataforms || []).map((g, idx) => {
              const icon = g?.iconUrl || g?.icon || g?.name;
              const url = g?.url;
              const key = g?._key || `${idx}`;

              if (!icon) return null;

              const img = (
                <img
                  src={icon}
                  alt={g?.label || g?.platform || "Platform"}
                  className="success-story-platform-icon pointer-events-none"
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
                  aria-label={g?.label || g?.platform || "Platform"}
                >
                  {img}
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <img src={image} alt="game-bg" className="rounded-lg" />
    </div>
  );
};
