import React from "react";

type ZoomLevel = "small" | "normal" | "big" | "mega";

interface ZoomControlProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (newLevel: ZoomLevel) => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomLevel,
  onZoomChange,
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-gray-500">ZOOM</span>
      <div className="flex space-x-0 bg-gray-700 p-2 rounded-lg">
        <button
          onClick={() => onZoomChange("small")}
          className={`px-3 py-1 rounded-l-lg ${
            zoomLevel === "small"
              ? "bg-blue-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          }`}
        >
          1
        </button>
        <button
          onClick={() => onZoomChange("normal")}
          className={`px-3 py-1 ${
            zoomLevel === "normal"
              ? "bg-blue-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          }`}
        >
          2
        </button>
        <button
          onClick={() => onZoomChange("big")}
          className={`px-3 py-1 ${
            zoomLevel === "big"
              ? "bg-blue-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          }`}
        >
          3
        </button>
        <button
          onClick={() => onZoomChange("mega")}
          className={`px-3 py-1 rounded-r-lg ${
            zoomLevel === "mega"
              ? "bg-blue-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          }`}
        >
          4
        </button>
      </div>
    </div>
  );
};

export default ZoomControl;
