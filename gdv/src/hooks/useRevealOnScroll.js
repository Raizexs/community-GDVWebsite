import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useRevealOnScroll({
  disabled = false,
  emphasis = false,
  onMount = false,
  delay = 0,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(
    () => disabled || prefersReducedMotion(),
  );

  useEffect(() => {
    if (disabled || prefersReducedMotion()) {
      setIsVisible(true);
      return undefined;
    }

    if (onMount) {
      const timer = window.setTimeout(() => setIsVisible(true), delay);
      return () => window.clearTimeout(timer);
    }

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: emphasis ? 0.08 : 0.12,
        rootMargin: emphasis ? "0px 0px -4% 0px" : "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [disabled, emphasis, onMount, delay]);

  return { ref, isVisible };
}
