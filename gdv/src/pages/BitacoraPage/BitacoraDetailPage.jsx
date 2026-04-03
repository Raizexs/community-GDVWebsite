import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";
import LogDetail from "./components/sections/LogDetail";
import { getEntryBySlug } from "../../data/bitacoraData";

const BitacoraDetailPage = () => {
  const { slug } = useParams();
  const entry = getEntryBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!entry) {
    return <Navigate to="/bitacora" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1B182B]">
      <NavbarComponent />

      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <LogDetail entry={entry} />
      </main>

      <FooterComponent />
    </div>
  );
};

export default BitacoraDetailPage;
