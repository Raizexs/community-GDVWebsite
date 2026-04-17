import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import { useEffect, useState } from "react";
import { AboutusSection } from "./components/sections/AboutusSection";
import { Members } from "./components/sections/Members";
import { Jointheguild } from "../../components/Jointheguild";
import { fetchAboutUsContent, getCachedAboutUsContent } from "../../services/aboutUs/aboutUsService";

export const AboutusPage = () => {
    const [aboutUsContent, setAboutUsContent] = useState(() => getCachedAboutUsContent());

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

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
            <main>
                <AboutusSection content={aboutUsContent} />
                <Members membersData={aboutUsContent?.members} />
                < Jointheguild />
            </main>
            <FooterComponent />
        </div>
    );
};
