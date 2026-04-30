import AbstractDigital from "../../img/partners/ABSTRACTDIGITAL.png";
import BabyTeam from "../../img/partners/BABYTEAM.png";
import CangrejoIdeas from "../../img/partners/CANGREJOIDEAS.png";
import Gudhar from "../../img/partners/GUDHAR.png";
import RamCandy from "../../img/partners/RAMCANDY.png";
import SlimeTeam from "../../img/partners/SLIMETEAM.png";
import TaeLao from "../../img/partners/TAE-LAO.png";
import ChileGamesDatabase from "../../img/partners/CHILEGAMESDATABASE.png";
import TangaraStudio from "../../img/partners/TANGARASTUDIO.png";
import TesseractLogo from "../../img/partners/TESSERACT.png";

const staticPartners = [
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
  { logo: ChileGamesDatabase, website: "https://chilegamesdatabase.com/", name: "ChileGamesDatabase" },
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

export function getStaticPartnersFallback() {
  return staticPartners.map((partner) => ({ ...partner }));
}

export async function fetchPartners({ force = false } = {}) {
  return getStaticPartnersFallback();
}
