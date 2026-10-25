import { Link } from "react-router-dom";

/** The Cadence logo mark — the same inline SVG every page repeated. */
export function BrandMark({ size = 20 }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path d="M2 14L7 4L10 11L13 6L18 14" stroke="#D8F34E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Brand({ to = "/home", size = 20 }) {
  return (
    <Link to={to} className="brand" aria-label="Cadence home">
      <BrandMark size={size} />
      <span className="brand-name">Cadence</span>
    </Link>
  );
}
