import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const GameCard = ({
  titleKey,
  descriptionKey,
  bgimg,
  link,
  gameplataforms,
}) => {
  const { t } = useTranslation();
  const [gamePlataforms, setGamePlataform] = useState([]);

  const AddPlataform = () => {
    setGamePlataform(gameplataforms);
  };

  useEffect(() => {
    AddPlataform();
  });

  return (
    <div className="w-72 bg-white card-shadow rounded-lg">
      <div className={`cardimg bg-black rounded-t-lg h-36 ${bgimg}`}></div>
      <div className="flex justify-center text-white flex-col">
        <div className="p-4">
          <h5 className="text-black font-bold mb-2">{t(titleKey)}</h5>
          <p className="text-black text-xs vgvalpo-textcolor6">
            {t(descriptionKey)}
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
              {gamePlataforms.map((p) => (
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={p.name}
                    alt="Platform"
                    style={{ width: "22px", height: "22px" }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
