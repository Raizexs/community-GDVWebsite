import steam from "../img/plataforms/steam.png";
import itchio from "../img/icons/itchio-icon.png";

const itchIo = { name: itchio, url: "" };

export const gamesData = [
  {
    id: "tormentedSouls",
    titleKey: "gamesData.tormentedSouls.title",
    descriptionKey: "gamesData.tormentedSouls.description",
    image: "bg-tormented-souls",
    link: "https://pqube.co.uk/games/tormented-souls/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/1367590/Tormented_Souls/",
      },
    ],
  },
  {
    id: "colorbound",
    titleKey: "gamesData.colorbound.title",
    descriptionKey: "gamesData.colorbound.description",
    image: "bg-colorbound",
    link: "https://store.steampowered.com/app/3778610/Colorbound/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/3778610/Colorbound/",
      },
    ],
  },
  {
    id: "auraEchoes",
    titleKey: "gamesData.auraEchoes.title",
    descriptionKey: "gamesData.auraEchoes.description",
    image: "bg-aura-echoes",
    link: "https://store.steampowered.com/app/4006440/Aura_Echoes_of_Pain/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/4006440/Aura_Echoes_of_Pain/",
      },
    ],
  },
  {
    id: "armAround",
    titleKey: "gamesData.armAround.title",
    descriptionKey: "gamesData.armAround.description",
    image: "bg-arm-around",
    link: "https://store.steampowered.com/app/3072400/Arm_Around/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/3072400/Arm_Around/",
      },
    ],
  },
  {
    id: "spellrain",
    titleKey: "gamesData.spellrain.title",
    descriptionKey: "gamesData.spellrain.description",
    image: "bg-spellrain",
    link: "https://store.steampowered.com/app/2242440/SPELLRAIN/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/2242440/SPELLRAIN/",
      },
    ],
  },
  {
    id: "astralRot",
    titleKey: "gamesData.astralRot.title",
    descriptionKey: "gamesData.astralRot.description",
    image: "bg-astral-rot",
    link: "https://store.steampowered.com/app/2474170/Astral_Rot",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/2474170/Astral_Rot",
      },
    ],
  },
  {
    id: "mixForgotten",
    titleKey: "gamesData.mixForgotten.title",
    descriptionKey: "gamesData.mixForgotten.description",
    image: "bg-mix-forgotten",
    link: "https://store.steampowered.com/app/2373720/Mix_the_Forgotten/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/2373720/Mix_the_Forgotten/",
      },
    ],
  },
  {
    id: "bulboBelief",
    titleKey: "gamesData.bulboBelief.title",
    descriptionKey: "gamesData.bulboBelief.description",
    image: "bg-bulbo-belief",
    link: "https://store.steampowered.com/app/3549280/Bulbos_Belief_System/",
    platforms: [
      {
        name: steam,
        url: "https://store.steampowered.com/app/3549280/Bulbos_Belief_System/",
      },
    ],
  },
  {
    id: "spoonfool",
    titleKey: "gamesData.spoonfool.title",
    descriptionKey: "gamesData.spoonfool.description",
    image: "bg-spoonfool",
    link: "https://outfind.itch.io/spoonfool-keep-your-cool",
    platforms: [
      { name: itchio, url: "https://outfind.itch.io/spoonfool-keep-your-cool" },
    ],
  },
  {
    id: "lillyWilly",
    titleKey: "gamesData.lillyWilly.title",
    descriptionKey: "gamesData.lillyWilly.description",
    image: "bg-lilly-willy",
    link: "https://outfind.itch.io/lilly-and-willy",
    platforms: [
      { name: itchio, url: "https://outfind.itch.io/lilly-and-willy" },
    ],
  },
  {
    id: "frogward",
    titleKey: "gamesData.frogward.title",
    descriptionKey: "gamesData.frogward.description",
    image: "bg-frogward",
    link: "https://outfind.itch.io/frogward",
    platforms: [{ name: itchio, url: "https://outfind.itch.io/frogward" }],
  },
];

export const getShuffledGames = (
  games = gamesData,
  numberOfGames = games.length,
) => {
  const shuffled = [...games].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numberOfGames);
};
