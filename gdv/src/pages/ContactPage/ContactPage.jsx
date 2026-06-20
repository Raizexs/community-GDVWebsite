import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { PageEnter } from "../../components/PageEnter";
import { FooterComponent } from "../../components/Footer";
import {
  getPraxsuiteContactConfig,
  getTurnstileAction,
  getTurnstileSiteKey,
  getTurnstileTheme,
  isPraxsuiteContactReady,
} from "../../config/appConfig";
import { insertPraxsuiteContact } from "../../services/praxsuite/praxsuiteApi";
import {
  logPraxsuiteError,
  PraxsuiteErrorCode,
} from "../../services/praxsuite/praxsuiteSecurity";

export const ContactPage = () => {
  const { t } = useTranslation();
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });

  const contactConfig = getPraxsuiteContactConfig();
  const contactReady = isPraxsuiteContactReady();
  const turnstileSiteKey = getTurnstileSiteKey();
  const captchaTheme = getTurnstileTheme();
  const turnstileAction = getTurnstileAction();
  const captchaEnabled = true;
  const widgetIdRef = useRef(null);
  const formStartedAtRef = useRef(Date.now());
  const captchaScriptId = "cf-turnstile-script";
  const captchaContainerId = "turnstile-widget";

  const resetCaptcha = () => {
    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setCaptchaToken("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !subject || !message) {
      setAlert({
        type: "error",
        message: t("contact.form.requiredFields"),
      });
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setAlert({
        type: "error",
        message: t("contact.form.captchaRequired"),
      });
      return;
    }

    if (formData.website && formData.website.trim() !== "") {
      setAlert({ type: "success", message: t("contact.form.success") });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
      return;
    }

    const timeToFill = Date.now() - formStartedAtRef.current;
    if (timeToFill < 3000) {
      setAlert({ type: "success", message: t("contact.form.success") });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
      return;
    }

    if (!contactReady) {
      setAlert({
        type: "error",
        message: t("contact.form.notConfigured"),
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setAlert({ type: "", message: "" });

      await insertPraxsuiteContact({
        queryUrl: contactConfig.queryUrl,
        ref: contactConfig.ref,
        apiKey: contactConfig.apiKey,
        name,
        email,
        subject,
        message,
      });

      setAlert({
        type: "success",
        message: t("contact.form.success"),
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
      formStartedAtRef.current = Date.now();
      if (captchaEnabled) {
        resetCaptcha();
      }
    } catch (error) {
      logPraxsuiteError("contactForm", error);
      const message =
        error?.code === PraxsuiteErrorCode.RATE_LIMIT
          ? t("contact.form.rateLimit")
          : t("contact.form.submitError");
      setAlert({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!captchaEnabled) return undefined;

    const renderCaptcha = () => {
      const captchaContainer = document.getElementById(captchaContainerId);
      if (
        !window.turnstile ||
        !captchaContainer ||
        widgetIdRef.current !== null
      ) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(`#${captchaContainerId}`, {
        sitekey: turnstileSiteKey,
        theme: captchaTheme,
        action: turnstileAction,
        callback: (token) => setCaptchaToken(token || ""),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => {
          setCaptchaToken("");
          setAlert({
            type: "error",
            message: t("contact.form.captchaLoadError"),
          });
        },
      });
    };

    if (window.turnstile) {
      renderCaptcha();
      return undefined;
    }

    const existingScript = document.getElementById(captchaScriptId);
    if (existingScript) {
      existingScript.addEventListener("load", renderCaptcha);
      return () => existingScript.removeEventListener("load", renderCaptcha);
    }

    const script = document.createElement("script");
    script.id = captchaScriptId;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderCaptcha);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", renderCaptcha);
    };
  }, [captchaEnabled, captchaTheme, t, turnstileAction, turnstileSiteKey]);

  return (
    <div className="">
      <NavbarComponent />
      <PageEnter>
        <main>
          <section className="games-bg">
            <div className="flex md:flex-row flex-col justify-center items-center">
              <div className="w-full py-20 md:h-myh h-44 bg-contact"></div>
              <form
                className="w-full header-screen bg-white p-9"
                onSubmit={handleSubmit}
              >
                <p className="text-3xl font-bold mb-8 vgvalpo-textcolor3">
                  {t("contact.form.title")}
                </p>
                <div className="mb-3">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-base font-bold"
                  >
                    {t("contact.form.name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-base font-bold"
                  >
                    {t("contact.form.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder={t("contact.form.emailPlaceholder")}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="subject"
                    className="block mb-2 text-base font-bold"
                  >
                    {t("contact.form.subject")}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label
                    htmlFor="message"
                    className="block mb-2 text-base font-bold"
                  >
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="block p-2.5 w-full text-base text-gray-900 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-y max-h-64 min-h-[120px]"
                    placeholder={t("contact.form.messagePlaceholder")}
                    required
                  ></textarea>
                </div>
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {!contactReady ? (
                  <p className="mb-5 text-amber-700 text-sm">
                    {t("contact.form.notConfigured")}
                  </p>
                ) : null}

                {alert.message ? (
                  <p
                    className={`mb-5 ${
                      alert.type === "success"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {alert.message}
                  </p>
                ) : null}

                {captchaEnabled ? (
                  <div className="mb-5">
                    <div id={captchaContainerId}></div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || !captchaToken || !contactReady}
                  className="text-white vgvalpo-bgcolor5 rounded-md px-10 text-base py-2 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t("contact.form.sending")
                    : t("contact.form.sendButton")}
                </button>
              </form>
            </div>
          </section>
        </main>
        <FooterComponent />
      </PageEnter>
    </div>
  );
};
