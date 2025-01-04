import React from "react";

type ZoomLevel = "small" | "normal" | "big" | "mega";

interface ZoomControlProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (direction: "in" | "out") => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomLevel,
  onZoomChange,
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5">
      <button
        onClick={() => onZoomChange("out")}
        disabled={zoomLevel === "small"}
        className={`text-white font-bold w-6 h-6 flex items-center justify-center rounded-full 
          ${
            zoomLevel === "small"
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
      >
        -
      </button>
      <span className="text-white text-sm font-medium px-2">ZOOM</span>
      <button
        onClick={() => onZoomChange("in")}
        disabled={zoomLevel === "mega"}
        className={`text-white font-bold w-6 h-6 flex items-center justify-center rounded-full 
          ${
            zoomLevel === "mega"
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
      >
        +
      </button>
    </div>
  );
};

export default ZoomControl;
