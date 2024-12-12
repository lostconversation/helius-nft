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
      {/* Add your header content here, including buttons and filters */}
      {/* Example: */}
      <div className="flex justify-between items-center">
        <div>
          <button onClick={() => setViewType("created")}>Created</button>
          <button onClick={() => setViewType("owned")}>Owned</button>
        </div>
        <div>
          <button onClick={() => setSortType("quantityDesc")}>Sort Desc</button>
          <button onClick={() => setSortType("quantityAsc")}>Sort Asc</button>
        </div>
        <div>
          <button onClick={() => setDisplayMode("grid")}>Grid</button>
          <button onClick={() => setDisplayMode("data")}>Data</button>
        </div>
        <div>
          <button onClick={() => setInspectorFilter("clear")}>Clear</button>
          <button onClick={() => setInspectorFilter("all")}>All</button>
          {/* Add more buttons as needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
