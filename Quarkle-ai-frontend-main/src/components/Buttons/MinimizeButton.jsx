const minimizeImg = "/images/minimize.png";
const expandImg = "/images/expand.png";

export default function MinimizeButton({
  isMinimized,
  setIsMinimized,
  isLightMode,
  className = "",
}) {
  return (
    <div className={`MinMaxTooltip ${className}`}>
      <>
        {!isMinimized && (
          <a
            data-tooltip-id="minimize-tooltip"
            data-tooltip-content="Minimize panel"
          >
            <img
              className={`Minimize-Icon ${!isMinimized ? "rotate" : ""}  ${
                isLightMode ? "light" : ""
              }`}
              onClick={() => setIsMinimized(isMinimized)}
              src={minimizeImg}
            ></img>
          </a>
        )}
        {isMinimized && (
          <a
            data-tooltip-id="minimize-tooltip"
            data-tooltip-content="Expand panel"
          >
            <img
              className={`Maximize-Icon ${isMinimized ? "rotate" : ""}  ${
                isLightMode ? "light" : ""
              }`}
              onClick={() => setIsMinimized(isMinimized)}
              src={expandImg}
            ></img>
          </a>
        )}
      </>
    </div>
  );
}
