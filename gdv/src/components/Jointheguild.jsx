import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { resolveLocalizedValue } from "../utils/localization";
import { resolveMembershipJoinUrl } from "../utils/membershipRoute";

export const Jointheguild = ({ homeContent }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "es";
  const title =
    resolveLocalizedValue(homeContent?.joinCta?.title, language) ||
    t("joinGuild.title");
  const description =
    resolveLocalizedValue(homeContent?.joinCta?.description, language) ||
    t("joinGuild.description");
  const joinUrl = resolveMembershipJoinUrl(homeContent?.joinCta?.url || "...");

  return (
    <section className={`flex justify-center items-center cta-gremio-bg`}>
      <Reveal className="flex justify-center md:items-center md:text-center text-white flex-col px-8 motion-section-header">
        <h1 className="mb-3 leading-tight text-2xl uppercase md:text-3xl md:w-10/12 font-bold">
          {title}
        </h1>
        <p className="md:w-7/12 mb-6">{description}</p>
        {/^https?:\/\//i.test(joinUrl) ? (
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              "vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
            }
          >
            {t("joinGuild.joinButton")}
          </a>
        ) : (
          <Link
            to={joinUrl}
            className={
              "vgvalpo-bgcolor5 rounded-md px-8 py-3 flex justify-center items-center"
            }
          >
            {t("joinGuild.joinButton")}
          </Link>
        )}
      </Reveal>
    </section>
  );
};
