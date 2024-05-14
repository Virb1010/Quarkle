export default function MinimizeLeftPanel({ isMinimized, setIsMinimized, isLightMode, className = "" }) {
  return (
    <div className={`MinMaxTooltip ${className}`}>
      <div className="ml-5cursor-pointer m-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-[#14142d]">
        {!isMinimized && (
          <a data-tooltip-id="minimize-tooltip" data-tooltip-content="Minimize panel">
            <i
              className={`pi ${isMinimized ? "pi-angle-double-right" : "pi-angle-double-left"} ${
                isLightMode ? "text-black" : "text-white"
              }`}
              onClick={() => setIsMinimized(!isMinimized)}
            ></i>
          </a>
        )}
        {isMinimized && (
          <a data-tooltip-id="minimize-tooltip" data-tooltip-content="Expand panel">
            <i
              className={`pi ${isMinimized ? "pi-angle-double-right" : "pi-angle-double-left"} ${
                isLightMode ? "text-black" : "text-white"
              }`}
              onClick={() => setIsMinimized(!isMinimized)}
            ></i>
          </a>
        )}
      </div>
    </div>
  );
}
