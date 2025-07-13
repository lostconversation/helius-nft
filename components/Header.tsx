import React from "react";
import ZoomControl from "./ZoomControl";
import { ZoomLevel } from "@/types";

interface HeaderProps {
  address: string;
  setAddress: (address: string) => void;
  viewType: "created" | "owned";
  setViewType: (viewType: "created" | "owned") => void;
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc";
  setSortType: (
    sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
  ) => void;
  typeFilter: "all" | "drip" | "@" | "youtu" | "???" | "spam";
  setTypeFilter: (
    typeFilter: "all" | "drip" | "@" | "youtu" | "???" | "spam"
  ) => void;
  inspectorFilter: "all" | "animations" | "immutable" | "cNFT";
  handleInspectorFilterChange: (
    filter: "all" | "animations" | "immutable" | "cNFT"
  ) => void;
  loadNFTs: () => void;
  additionalAddresses: string[];
  viewMode: "1" | "2" | "3";
  setViewMode: (viewMode: "1" | "2" | "3") => void;
  zoomLevel: ZoomLevel;
  onZoomChange: (newLevel: ZoomLevel) => void;
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
  inspectorFilter,
  handleInspectorFilterChange,
  loadNFTs,
  additionalAddresses,
  viewMode,
  setViewMode,
  zoomLevel,
  onZoomChange,
}) => {
  // Function to truncate address for display
  const truncateAddress = (addr: string): string => {
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };
  return (
    <header className="sticky top-0 bg-gray-800 p-4 shadow-md z-10">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          {/* Left Side - WALLET */}
          <div className="flex-1 flex flex-col space-y-2">
            {/* WALLET Section */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-500">WALLET</span>
              <div
                className="flex space-x-2 bg-gray-700 p-2 rounded-lg"
                style={{ maxWidth: "670px" }}
              >
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
                  value={address ? truncateAddress(address) : ""}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-grow px-3 py-1 bg-gray-600 text-gray-200 rounded-l-lg"
                  placeholder="Enter wallet address..."
                />
                <button
                  onClick={loadNFTs}
                  className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-400 rounded-r-lg"
                >
                  GO
                </button>
              </div>
              <div className="flex space-x-2 mt-1">
                {additionalAddresses.map((addr, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAddress(addr);
                      // Small delay to ensure address is set before triggering load
                      setTimeout(() => loadNFTs(), 10);
                    }}
                    className="px-2 py-1 text-xs bg-gray-600 text-gray-300 hover:bg-gray-500 rounded"
                  >
                    Wallet Test {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - ARTIST only */}
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
                  onClick={() => setTypeFilter("@")}
                  className={`px-3 py-1 ${
                    typeFilter === "@"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  @
                </button>
                <button
                  onClick={() => setTypeFilter("youtu")}
                  className={`px-3 py-1 ${
                    typeFilter === "youtu"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Youtu
                </button>
                <button
                  onClick={() => setTypeFilter("???")}
                  className={`px-3 py-1 ${
                    typeFilter === "???"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  ???
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
            </div>
          </div>
        </div>

        {/* VIEW, ZOOM, NFT Row */}
        <div className="flex justify-between">
          {/* VIEW and ZOOM group */}
          <div className="flex space-x-4">
            {/* VIEW Section */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-500">VIEW</span>
              <div className="flex space-x-0 bg-gray-700 p-2 rounded-lg">
                <button
                  onClick={() => setViewMode("1")}
                  className={`px-3 py-1 rounded-l-lg ${
                    viewMode === "1"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setViewMode("2")}
                  className={`px-3 py-1 ${
                    viewMode === "2"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setViewMode("3")}
                  className={`px-3 py-1 rounded-r-lg ${
                    viewMode === "3"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  3
                </button>
              </div>
            </div>

            {/* ZOOM Section */}
            <ZoomControl zoomLevel={zoomLevel} onZoomChange={onZoomChange} />
          </div>

          {/* NFT Section - right aligned */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-500">NFT</span>
            <div className="flex space-x-0 bg-gray-700 p-2 rounded-lg">
              <button
                onClick={() => handleInspectorFilterChange("all")}
                className={`px-3 py-1 rounded-l-lg ${
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
    </header>
  );
};

export default Header;
