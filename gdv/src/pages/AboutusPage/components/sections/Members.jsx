import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import profile1 from "../../../../img/AboutUSImages/Alejandro.jpg";
import profile2 from "../../../../img/AboutUSImages/Jacob.jpg";
import profile3 from "../../../../img/AboutUSImages/Directorio_Sven (1).png";

export const Members = () => {
  const { t } = useTranslation();
  const members = [
    {
      profile: profile1,
      name: "Alejandro Aranguiz",
      rol: t("aboutUs.members.president"),
      facebooklink: "...",
      instagramlink: "https://www.linkedin.com/in/alejandroaranguizc",
    },
    {
      profile: profile2,
      name: "Jacob Wischrey",
      rol: t("aboutUs.members.finances"),
      facebooklink: "...",
      instagramlink: "https://www.linkedin.com/in/jwilschrey/",
    },
    {
      profile: profile3,
      name: "Sven von Brand L.",
      rol: t("aboutUs.members.secretary"),
      facebooklink: "...",
      instagramlink: "https://www.linkedin.com/in/svbrand/",
    },
  ];

  return (
    <section className="py-20 px-4 games-bg">
      <div className="mb-16 flex flex-col justify-center items-center text-center">
        <h6 className="mb-2 vgvalpo-textcolor3 text-base">
          — {t("aboutUs.members.label")} —
        </h6>
        <h3 className="font-bold text-black md:text-3xl md:w-4/12 text-2xl">
          {t("aboutUs.members.title")}
        </h3>
      </div>

      <div className="flex justify-center items-center">
        <div className="grid md:grid-cols-4 grid-cols-1 gap-16">
          {members.map((m) => (
            <div className="w-60 flex items-center text-center flex-col">
              <div className="vgvalpo-gradient p-1 rounded-full mb-4">
                <img
                  src={m.profile}
                  alt=""
                  className="rounded-full w-80 h-60 md:w-32 md:h-32 border-4"
                />
              </div>
              <h5 className="text-black font-bold mb-1 text-xl">{m.name}</h5>
              <p className="text-lg vgvalpo-textcolor5 mb-3">{m.rol}</p>
              <div className="flex justify-center items-center gap-2">
                <a
                  href={m.instagramlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-linkedin flex items-center justify-center w-9 h-9 rounded-lg transition duration-500 hover:-translate-y-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 32 32"
                    fill="white"
                  >
                    <path d="M27 0H5C2.2 0 0 2.2 0 5v22c0 2.8 2.2 5 5 5h22c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM9.4 27H5.7V12.1h3.7V27zm-1.9-17.1c-1.2 0-2.1-.9-2.1-2.1s.9-2.1 2.1-2.1c1.2 0 2.1.9 2.1 2.1s-.9 2.1-2.1 2.1zm19.5 17.1h-3.7v-7.2c0-1.7-.6-2.8-2.1-2.8-1.1 0-1.7.7-2 1.4-.1.3-.1.7-.1 1.1V27h-3.7s.1-12.3 0-13.9h3.7v2c.5-.8 1.4-2 3.5-2 2.6 0 4.5 1.7 4.5 5.4V27z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
