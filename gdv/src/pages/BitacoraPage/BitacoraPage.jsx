import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { PageEnter } from "../../components/PageEnter";
import { FooterComponent } from "../../components/Footer";
import { BitacoraPageIntro } from "./components/sections/BitacoraPageIntro";
import { BitacoraCard } from "./components/BitacoraCard";
import { BitacoraFilters } from "./components/BitacoraFilters";
import { EventAgendaSection } from "./components/sections/EventAgendaSection";
import {
  fetchBitacoraPosts,
  getStaticBitacoraFallback,
} from "../../services/bitacora/bitacoraService";

export const BitacoraPage = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPosts = async () => {
      try {
        const data = await fetchBitacoraPosts();
        setPosts(data?.length ? data : getStaticBitacoraFallback());
      } catch {
        setPosts(getStaticBitacoraFallback());
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  return (
    <div className="bitacora-page">
      <NavbarComponent />
      <PageEnter className="flex flex-col flex-1">
        <main className="bitacora-page-main">
          <BitacoraPageIntro />
          <section className="bitacora-list-section">
            <div className="max-w-6xl mx-auto px-4">
              <BitacoraFilters
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />

              {loading ? (
                <p className="bitacora-state-message">
                  {t("bitacora.loading")}
                </p>
              ) : filteredPosts.length ? (
                <div
                  key={activeCategory}
                  className="bitacora-grid bitacora-grid-animated"
                >
                  {filteredPosts.map((post) => (
                    <BitacoraCard key={post.id || post.slug} post={post} />
                  ))}
                </div>
              ) : (
                <p className="bitacora-state-message">{t("bitacora.empty")}</p>
              )}
            </div>
          </section>

          <EventAgendaSection />
        </main>
        <FooterComponent />
      </PageEnter>
    </div>
  );
};
