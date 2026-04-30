import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    // Retrieve saved scroll position for this path
    const savedScrollPosition = sessionStorage.getItem(
      `scrollPosition_${location.pathname}`,
    );

    if (savedScrollPosition !== null) {
      // Restore the scroll position
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }
  }, [location.pathname]);

  // Save scroll position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(
        `scrollPosition_${location.pathname}`,
        window.scrollY,
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also save when user is about to navigate away
    const handleScroll = () => {
      sessionStorage.setItem(
        `scrollPosition_${location.pathname}`,
        window.scrollY,
      );
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);
};
