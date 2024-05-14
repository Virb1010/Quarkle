import { Tooltip } from "react-tooltip";
import StopIcon from "@/src/components/Icons/StopIcon";

const StopStreamingButton = ({ isLightMode, onClick, tooltipContent, size = "large" }) => {
  return (
    <>
      {size === "large" && (
        <div
          className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md bg-red-800 p-1 hover:bg-opacity-80 "
          data-tooltip-id="stop-streaming-tooltip"
          data-tooltip-content={tooltipContent}
          onClick={onClick}
        >
          <StopIcon size={18} className="text-white" />
          <p className=" text-sm text-white">Stop</p>
          <Tooltip id="stop-streaming-tooltip" />
        </div>
      )}

      {size === "small" && (
        <div data-tooltip-id="stop-streaming-tooltip" data-tooltip-content={tooltipContent} onClick={onClick}>
          <StopIcon size={18} className={`cursor-pointer p-1 text-black dark:text-white ${isLightMode ? "light" : ""}`} />
          <Tooltip id="stop-streaming-tooltip" />
        </div>
      )}
    </>
  );
};

export default StopStreamingButton;
