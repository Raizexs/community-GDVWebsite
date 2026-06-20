const cardBaseClassName =
  "socios-card w-60 h-32 p-4 flex justify-center items-center bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow";

export function PartnerCard({ partner }) {
  const content = (
    <img
      src={partner.logo}
      alt={partner.name}
      className="max-w-full max-h-full object-contain pointer-events-none"
      draggable={false}
    />
  );

  if (!partner.website) {
    return <div className={cardBaseClassName}>{content}</div>;
  }

  return (
    <a
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardBaseClassName} socios-card-link`}
      aria-label={partner.name}
    >
      {content}
    </a>
  );
}
