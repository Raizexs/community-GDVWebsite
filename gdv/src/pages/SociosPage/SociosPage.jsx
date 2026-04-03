import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { Link } from "react-router-dom";
import { SociosHeader } from "./components/sections/SociosHeader";

import AbstractDigital from "../../img/partners/Logo Abstract - color horizontal.png";
import BabyTeam from "../../img/partners/BABYTEAM.png";
import CangrejoIdeas from "../../img/partners/logo_cangrejo_color.png";
import Gudhar from "../../img/partners/Gudhar_sinfondo (1).png";
import RamCandy from "../../img/partners/Logo_color_02.png";
import SlimeTeam from "../../img/partners/LOGO_B_NB512.png";
import TaeLao from "../../img/partners/logo02-vertical-light.png";
import TangaraStudio from "../../img/partners/logo01-horizontal-light.png";
import TesseractLogo from "../../img/partners/Tesseract Logo Black cortado.png";

export const SociosPage = () => {
  const { t } = useTranslation();
  const [socios, setSocios] = useState([]);

  const AddSocios = () => {
    const sociosList = [
      {
        logo: AbstractDigital,
        website: "https://www.abstractdw.com/",
        name: "Abstract Digital",
      },
      { logo: BabyTeam, website: "https://babyteam.cl/", name: "Baby Team" },
      {
        logo: CangrejoIdeas,
        website: "https://cangrejoideas.com/",
        name: "Cangrejo Ideas",
      },
      { logo: Gudhar, website: "https://www.gudhar.com/", name: "GUDHAR" },
      { logo: RamCandy, website: "https://ramcandy.com/", name: "Ram Candy" },
      {
        logo: SlimeTeam,
        website: "https://www.slimeteam.com/",
        name: "Slime Team",
      },
      { logo: TaeLao, website: "https://tae-lao.itch.io/", name: "Tae Lao" },
      {
        logo: TangaraStudio,
        website: "https://tangara.studio/",
        name: "Tangara Studio",
      },
      {
        logo: TesseractLogo,
        website: "https://tesseractsoftwares.com/",
        name: "Tesseract",
      },
    ];

    const shuffledSocios = [...sociosList].sort(() => Math.random() - 0.5);
    setSocios(shuffledSocios);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    AddSocios();
  }, []);

  return (
    <div className="">
      <NavbarComponent />

      <header>
        <SociosHeader />
      </header>

      <main>
        <section className="py-20 px-4 games-bg">
          <div className="mb-12 flex flex-col justify-center items-center text-center">
            <h6 className="mb-2 vgvalpo-textcolor3 text-base">
              — {t("partners.label")} —
            </h6>
            <h3 className="font-bold text-black md:text-3xl md:w-5/12 text-2xl">
              {t("partners.title")}
            </h3>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-7">
              {socios.map((s) => (
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-60 h-32 p-6 flex justify-center items-center bg-white hover:shadow-xl rounded-lg socios-card"
                >
                  <img src={s.logo} alt={s.name} className="w-full" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterComponent />
    </div>
  );
};
