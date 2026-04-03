import React from "react";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { VideoGames } from "./components/sections/VideoGames";
import { HomeHeader } from "./components/sections/HomeHeader";
import { SuccessStoriesSection } from "./components/sections/SuccessStoriesSection";
import { Benefits } from "./components/sections/Benefits";
import { BitacoraSection } from "./components/sections/BitacoraSection";
import { Jointheguild } from "../../components/Jointheguild";
import { useScrollRestoration } from "../../hooks/useScrollRestoration";

export const HomePage = () => {
  useScrollRestoration();

  return (
    <div className="relative">
      <NavbarComponent />
      <header>
        <HomeHeader />
      </header>
      <main>
        <VideoGames />
        <SuccessStoriesSection />
        <BitacoraSection />
        <Benefits />
        <Jointheguild />
      </main>
      <FooterComponent />
    </div>
  );
};
