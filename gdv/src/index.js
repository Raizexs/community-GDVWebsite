import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useParams,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./styles/index.css";
import "./i18n/i18n";

import { HomePage } from "./pages/HomePage/HomePage";
import { GamePage } from "./pages/GamePage/GamesPage";
import { AboutusPage } from "./pages/AboutusPage/AboutusPage";
import { ErrorPage } from "./pages/ErrorPage/ErrorPage";
import { SociosPage } from "./pages/SociosPage/SociosPage";
import { ContactPage } from "./pages/ContactPage/ContactPage";
import { BitacoraPage } from "./pages/BitacoraPage/BitacoraPage";
import { BitacoraDetailPage } from "./pages/BitacoraPage/BitacoraDetailPage";

const GA_MEASUREMENT_ID = "G-P366WVNXK2";

function AnalyticsPageView() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return <Outlet />;
}

function BitacoraSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/noticias/${slug}`} replace />;
}

const router = createBrowserRouter([
  {
    element: <AnalyticsPageView />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/videogames",
        element: <GamePage />,
      },
      {
        path: "/aboutus",
        element: <AboutusPage />,
      },
      {
        path: "/socios",
        element: <SociosPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/noticias",
        element: <BitacoraPage />,
      },
      {
        path: "/noticias/:slug",
        element: <BitacoraDetailPage />,
      },
      {
        path: "/bitacora",
        element: <Navigate to="/noticias" replace />,
      },
      {
        path: "/bitacora/:slug",
        element: <BitacoraSlugRedirect />,
      },
      {
        path: "/...",
        element: <ErrorPage />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
);
