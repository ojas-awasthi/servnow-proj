function Card({
  children,
  className = "",
  interactive = false,
  onClick,
}) {
  const interactiveStyles = interactive
    ? "cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg active:translate-y-0"
    : "";

  return (
    <div
      onClick={onClick}
      className={[
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        interactiveStyles,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;