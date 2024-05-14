export default function AcceptIcon({ size = 18, className = "accept-icon" }) {
  const divStyle = {
    display: "flex", // Enables flexbox
    justifyContent: "center", // Centers horizontally
    alignItems: "center", // Centers vertically
    height: "100%", // Takes the full height of the parent (if needed)
    width: "100%", // Takes the full width of the parent (if needed)
    margin: "1px",
  };

  return (
    <div className={className} style={divStyle}>
      <i className="pi pi-check-circle" style={{ fontSize: `${size}px` }}></i>
    </div>
  );
}
