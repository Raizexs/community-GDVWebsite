import { NavbarComponent } from "../../components/Navbar";
import { PageEnter } from "../../components/PageEnter";
import { FooterComponent } from "../../components/Footer";
import { useEffect, useState } from "react";
import { AboutusSection } from "./components/sections/AboutusSection";
import { Members } from "./components/sections/Members";
import { Jointheguild } from "../../components/Jointheguild";
import { Reveal } from "../../components/Reveal";
import {
  fetchAboutUsContent,
  getCachedAboutUsContent,
} from "../../services/aboutUs/aboutUsService";

export const AboutusPage = () => {
  const [aboutUsContent, setAboutUsContent] = useState(() =>
    getCachedAboutUsContent(),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
        let isMounted = true;

        const loadAboutUs = async () => {
            const content = await fetchAboutUsContent();
            if (isMounted) {
                setAboutUsContent(content);
            }
    };

    loadAboutUs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="">
      <NavbarComponent />
      <PageEnter>
        <main>
          <AboutusSection content={aboutUsContent} />
          <Reveal emphasis className="block">
            <Members membersData={aboutUsContent?.members} />
          </Reveal>
          <Reveal emphasis className="block">
            <Jointheguild />
          </Reveal>
        </main>
        <FooterComponent />
      </PageEnter>
    </div>
  );
};
