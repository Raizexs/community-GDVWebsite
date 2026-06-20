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
          <div className="flex justify-center items-center gap-1">
            {(gameplataforms || []).map((g, idx) => (
              <a
                key={g?._key || `${idx}`}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={g.iconUrl || g.icon || g.name}
                  alt={g.label || g.platform || "Platform"}
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
      <img src={image} alt="game-bg" className="rounded-lg" />
    </div>
  );
};
