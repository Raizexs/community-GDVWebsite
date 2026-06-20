import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BitacoraCard } from "../../../BitacoraPage/components/BitacoraCard";
import {
  fetchFeaturedBitacoraPosts,
  getStaticBitacoraFallback,
} from "../../../../services/bitacora/bitacoraService";

export function BitacoraPreviewSection() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchFeaturedBitacoraPosts(3);
        setPosts(data?.length ? data : getStaticBitacoraFallback().slice(0, 3));
      } catch {
        setPosts(getStaticBitacoraFallback().slice(0, 3));
      }
    };

    loadPosts();
  }, []);

  if (!posts.length) return null;

  return (
    <section className="bitacora-home-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bitacora-home-header">
          <h6>— {t("bitacora.label")} —</h6>
          <h3>{t("bitacora.homeTitle")}</h3>
          <p>{t("bitacora.homeSubtitle")}</p>
        </div>

        <div className="bitacora-grid bitacora-grid-home mb-10">
          {posts.map((post) => (
            <BitacoraCard
              key={post.id || post.slug}
              post={post}
              variant="light"
              showFeaturedBadge
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/noticias" className="bitacora-home-cta">
            {t("bitacora.viewAll")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
