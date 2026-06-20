export function PageEnter({ children, className = "" }) {
  const classes = ["page-enter", "animate-fadeIn", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
