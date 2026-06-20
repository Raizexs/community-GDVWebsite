import { useEffect } from "react";
import { NavbarComponent } from "../../components/Navbar";
import { PageEnter } from "../../components/PageEnter";
import { FooterComponent } from "../../components/Footer";
import { SociosHeader } from "./components/sections/SociosHeader";
import { SociosStudiosSection } from "./components/sections/SociosStudiosSection";
import { ProvidersSection } from "./components/sections/ProvidersSection";

export const SociosPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <NavbarComponent />

      <PageEnter>
        <header>
          <SociosHeader />
        </header>

        <main className="games-bg">
          <SociosStudiosSection />
          <ProvidersSection />
        </main>

        <FooterComponent />
      </PageEnter>
    </div>
  );
};
