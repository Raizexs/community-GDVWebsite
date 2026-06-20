export function PageEnter({ children, className = "" }) {
  const classes = ["page-enter", "motion-page-enter", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
