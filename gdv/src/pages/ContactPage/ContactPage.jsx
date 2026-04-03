import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavbarComponent } from "../../components/Navbar";
import { FooterComponent } from "../../components/Footer";

export const ContactPage = () => {
  const { t } = useTranslation();
  const [alert, setAlert] = useState("");
  const NameRef = useRef();
  const emailRef = useRef();
  const subjectRef = useRef();
  const messageRef = useRef();

  const FormAlert = () => {
    const name = NameRef.current.value;
    const email = emailRef.current.value;
    const subject = subjectRef.current.value;
    const message = messageRef.current.value;

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      subject.trim() === "" ||
      message.trim() === ""
    ) {
      setAlert(t("contact.form.requiredFields"));

      setTimeout(() => {
        setAlert("");
      }, 3000);
    }
  };

  const HandleSubmit = (e) => {
    e.preventDefault();
    FormAlert();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <NavbarComponent />
      <main>
        <section className="games-bg">
          <div className="flex md:flex-row flex-col justify-center items-center">
            <div className="w-full py-20 md:h-myh h-44 bg-contact"></div>
            <form
              className="w-full header-screen bg-white p-9"
              onSubmit={HandleSubmit}
              action="..."
              method="POST"
            >
              <p className="text-3xl font-bold mb-8 vgvalpo-textcolor3">
                {t("contact.form.title")}
              </p>
              <div class="mb-3">
                <label for="name" className="block mb-2 text-base font-bold">
                  {t("contact.form.name")}
                </label>
                <input
                  type="text"
                  ref={NameRef}
                  id="name"
                  name="name"
                  className="border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="email" className="block mb-2 text-base font-bold">
                  {t("contact.form.email")}
                </label>
                <input
                  type="email"
                  ref={emailRef}
                  id="email"
                  name="email"
                  className="border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder={t("contact.form.emailPlaceholder")}
                  required
                />
              </div>
              <div class="mb-3">
                <label for="subject" className="block mb-2 text-base font-bold">
                  {t("contact.form.subject")}
                </label>
                <input
                  type="text"
                  ref={subjectRef}
                  id="subject"
                  name="subject"
                  className="border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
              </div>
              <div class="mb-2">
                <label for="message" className="block mb-2 text-base font-bold">
                  {t("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  ref={messageRef}
                  name="message"
                  rows="4"
                  className="block p-2.5 w-full text-base text-gray-900 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("contact.form.messagePlaceholder")}
                  required
                ></textarea>
              </div>

              <p className="text-red-600 mb-5">{alert}</p>

              <button
                type="submit"
                className="text-white vgvalpo-bgcolor5 rounded-md px-10 text-base py-2 flex justify-center items-center"
              >
                {t("contact.form.sendButton")}
              </button>
            </form>
          </div>
        </section>
      </main>
      <FooterComponent />
    </div>
  );
};
