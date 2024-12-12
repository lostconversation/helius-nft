"use client";

import React from "react";

interface HeaderProps {
  viewType: "created" | "owned";
  setViewType: (viewType: "created" | "owned") => void;
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc";
  setSortType: (
    sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
  ) => void;
  displayMode: "grid" | "data";
  setDisplayMode: (displayMode: "grid" | "data") => void;
  inspectorFilter: "clear" | "all" | "animations" | "immutable" | "cNFT";
  setInspectorFilter: (
    filter: "clear" | "all" | "animations" | "immutable" | "cNFT"
  ) => void;
}

const Header: React.FC<HeaderProps> = ({
  viewType,
  setViewType,
  sortType,
  setSortType,
  displayMode,
  setDisplayMode,
  inspectorFilter,
  setInspectorFilter,
}) => {
  return (
    <header className="sticky top-0 bg-gray-900 p-4 shadow-md z-10">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => setViewType("created")}
            className={`px-4 py-2 ${
              viewType === "created" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Created
          </button>
          <button
            onClick={() => setViewType("owned")}
            className={`px-4 py-2 ${
              viewType === "owned" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Owned
          </button>
        </div>
        <div>
          <button
            onClick={() => setSortType("quantityDesc")}
            className={`px-4 py-2 ${
              sortType === "quantityDesc" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Sort Desc
          </button>
          <button
            onClick={() => setSortType("quantityAsc")}
            className={`px-4 py-2 ${
              sortType === "quantityAsc" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Sort Asc
          </button>
        </div>
        <div>
          <button
            onClick={() => setDisplayMode("grid")}
            className={`px-4 py-2 ${
              displayMode === "grid" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Grid
          </button>
          <button
            onClick={() => setDisplayMode("data")}
            className={`px-4 py-2 ${
              displayMode === "data" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Data
          </button>
        </div>
        <div>
          <button
            onClick={() => setInspectorFilter("clear")}
            className={`px-4 py-2 ${
              inspectorFilter === "clear" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            Clear
          </button>
          <button
            onClick={() => setInspectorFilter("all")}
            className={`px-4 py-2 ${
              inspectorFilter === "all" ? "bg-blue-500" : "bg-gray-700"
            } text-white rounded`}
          >
            All
          </button>
          {/* Add more buttons as needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
