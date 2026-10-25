/* Centered stat card used in the Analytics and Profile stat rows. */
export default function StatTile({ Icon, value, label }) {
  return (
    <div className="widget" style={{ textAlign: "center" }}>
      <div className="widget-chip-icon" style={{ margin: "0 auto 10px" }}><Icon /></div>
      <p className="widget-chip-value">{value}</p>
      <p className="widget-chip-label">{label}</p>
    </div>
  );
}
