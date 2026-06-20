import { Children } from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

function wrapStaggerChildren(children) {
  return Children.map(children, (child, index) => {
    if (child == null || child === false) return null;

    return (
      <div className="motion-stagger-item" key={child.key ?? index}>
        {child}
      </div>
    );
  });
}

export function Reveal({
  as: Component = "div",
  children,
  className = "",
  stagger = false,
  emphasis = false,
  onMount = false,
  delay = 0,
  style,
  disabled = false,
}) {
  const { ref, isVisible } = useRevealOnScroll({
    disabled,
    emphasis,
    onMount,
    delay,
  });

  const classes = [
    "motion-reveal",
    emphasis ? "motion-reveal-emphasis" : "",
    stagger ? "motion-stagger" : "",
    stagger && emphasis ? "motion-stagger-emphasis" : "",
    isVisible ? "is-visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component ref={ref} className={classes} style={style}>
      {stagger ? wrapStaggerChildren(children) : children}
    </Component>
  );
}
