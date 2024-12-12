"use client";

import React from "react";

interface HeaderProps {
  address: string;
  setAddress: (address: string) => void;
  viewType: "created" | "owned";
  setViewType: (viewType: "created" | "owned") => void;
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc";
  setSortType: (
    sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
  ) => void;
  typeFilter: "all" | "drip" | "art" | "spam";
  setTypeFilter: (typeFilter: "all" | "drip" | "art" | "spam") => void;
  quantityFilter: "all" | ">3" | "1";
  setQuantityFilter: (quantityFilter: "all" | ">3" | "1") => void;
  layoutMode: "mosaic" | "list";
  setLayoutMode: (layoutMode: "mosaic" | "list") => void;
  displayMode: "grid" | "data";
  setDisplayMode: (displayMode: "grid" | "data") => void;
  inspectorFilter: "clear" | "all" | "animations" | "immutable" | "cNFT";
  handleInspectorFilterChange: (filter: string) => void;
  loadNFTs: () => void;
  additionalAddresses: string[];
}

const Header: React.FC<HeaderProps> = ({
  address,
  setAddress,
  viewType,
  setViewType,
  sortType,
  setSortType,
  typeFilter,
  setTypeFilter,
  quantityFilter,
  setQuantityFilter,
  layoutMode,
  setLayoutMode,
  displayMode,
  setDisplayMode,
  inspectorFilter,
  handleInspectorFilterChange,
  loadNFTs,
  additionalAddresses,
}) => {
  return (
    <header className="sticky top-0 bg-gray-800 p-4 shadow-md z-10">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-500">WALLET</span>
            <div className="flex space-x-2 bg-gray-700 p-2 rounded-lg">
              <div className="flex space-x-0">
                <button
                  onClick={() => setViewType("owned")}
                  className={`px-3 py-1 rounded-l-lg ${
                    viewType === "owned"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Owned
                </button>
                <button
                  onClick={() => setViewType("created")}
                  className={`px-3 py-1 rounded-r-lg ${
                    viewType === "created"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Created
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-grow px-3 py-1 bg-gray-600 text-gray-200 rounded-l-lg"
              />
              <button
                onClick={loadNFTs}
                className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-400 rounded-r-lg"
              >
                GO
              </button>
            </div>
            <div className="flex space-x-2 text-xs text-gray-400 mt-1">
              {additionalAddresses.map((addr, index) => (
                <span key={index} className="truncate">
                  {addr}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-500">ARTIST</span>
            <div className="flex space-x-2 bg-gray-700 p-2 rounded-lg">
              <div className="flex space-x-0">
                <button
                  onClick={() => setSortType("quantityDesc")}
                  className={`px-3 py-1 rounded-l-lg ${
                    sortType === "quantityDesc"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  # ↓
                </button>
                <button
                  onClick={() => setSortType("quantityAsc")}
                  className={`px-3 py-1 ${
                    sortType === "quantityAsc"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  # ↑
                </button>
                <button
                  onClick={() => setSortType("nameAsc")}
                  className={`px-3 py-1 ${
                    sortType === "nameAsc"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Abc
                </button>
                <button
                  onClick={() => setSortType("nameDesc")}
                  className={`px-3 py-1 rounded-r-lg ${
                    sortType === "nameDesc"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Zyx
                </button>
              </div>
              <div className="flex space-x-0">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1 rounded-l-lg ${
                    typeFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter("drip")}
                  className={`px-3 py-1 ${
                    typeFilter === "drip"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Drip
                </button>
                <button
                  onClick={() => setTypeFilter("art")}
                  className={`px-3 py-1 ${
                    typeFilter === "art"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Art
                </button>
                <button
                  onClick={() => setTypeFilter("spam")}
                  className={`px-3 py-1 rounded-r-lg ${
                    typeFilter === "spam"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Spam
                </button>
              </div>
              <div className="flex space-x-0">
                <button
                  onClick={() => setQuantityFilter("all")}
                  className={`px-3 py-1 rounded-l-lg ${
                    quantityFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setQuantityFilter(">3")}
                  className={`px-3 py-1 ${
                    quantityFilter === ">3"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  &gt; 3
                </button>
                <button
                  onClick={() => setQuantityFilter("1")}
                  className={`px-3 py-1 rounded-r-lg ${
                    quantityFilter === "1"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  1
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-start">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-500">VIEW</span>
            <div className="flex space-x-2 bg-gray-700 p-2 rounded-lg">
              <div className="flex space-x-0">
                <button
                  onClick={() => setLayoutMode("mosaic")}
                  className={`px-3 py-1 rounded-l-lg ${
                    layoutMode === "mosaic"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Mosaic
                </button>
                <button
                  onClick={() => setLayoutMode("list")}
                  className={`px-3 py-1 rounded-r-lg ${
                    layoutMode === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1 ml-4">
            <span className="text-xs text-gray-500">NFT</span>
            <div className="flex space-x-2 bg-gray-700 p-2 rounded-lg">
              <div className="flex space-x-0">
                <button
                  onClick={() => setDisplayMode("grid")}
                  className={`px-3 py-1 rounded-l-lg ${
                    displayMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setDisplayMode("data")}
                  className={`px-3 py-1 rounded-r-lg ${
                    displayMode === "data"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Data
                </button>
              </div>
              <div className="flex space-x-0">
                <button
                  onClick={() => handleInspectorFilterChange("clear")}
                  className={`px-3 py-1 rounded-l-lg ${
                    inspectorFilter === "clear"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={() => handleInspectorFilterChange("all")}
                  className={`px-3 py-1 ${
                    inspectorFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleInspectorFilterChange("animations")}
                  className={`px-3 py-1 ${
                    inspectorFilter === "animations"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Animations
                </button>
                <button
                  onClick={() => handleInspectorFilterChange("immutable")}
                  className={`px-3 py-1 ${
                    inspectorFilter === "immutable"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Immutable
                </button>
                <button
                  onClick={() => handleInspectorFilterChange("cNFT")}
                  className={`px-3 py-1 rounded-r-lg ${
                    inspectorFilter === "cNFT"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  cNFT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
