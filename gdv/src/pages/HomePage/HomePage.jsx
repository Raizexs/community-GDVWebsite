import React from "react";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { VideoGames } from "./components/sections/VideoGames";
import { HomeHeader } from "./components/sections/HomeHeader";
import { SuccessStoriesSection } from "./components/sections/SuccessStoriesSection";
import { Benefits } from "./components/sections/Benefits";
import { Jointheguild } from "../../components/Jointheguild";
import { useScrollRestoration } from "../../hooks/useScrollRestoration";
import { useEffect, useState } from "react";
import { fetchHomeContent, getCachedHomeContent } from "../../services/home/homeService";

export const HomePage = () => {
  useScrollRestoration();
  const [homeContent, setHomeContent] = useState(() => getCachedHomeContent());

  useEffect(() => {
    let mounted = true;
    fetchHomeContent()
      .then((result) => {
        if (mounted) setHomeContent(result);
      })
      .catch(() => {
        if (mounted) setHomeContent(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative">
      <NavbarComponent />
      <header>
        <HomeHeader homeContent={homeContent} />
      </header>
      <main>
        <VideoGames homeContent={homeContent} />
        <SuccessStoriesSection homeContent={homeContent} />
        <Benefits homeContent={homeContent} />
        <Jointheguild homeContent={homeContent} />
      </main>
      <FooterComponent homeContent={homeContent} />
    </div>
  );
};
