"use client";

import { useState, useEffect } from "react";
import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";
import { NFTImage } from "@/components/NFTImage";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

export default function Home() {
  const [nfts, setNfts] = useState<GroupedNFTs>({});
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(
    "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC"
  );
  const [viewType, setViewType] = useState<"created" | "owned">("owned");
  const [openSymbols, setOpenSymbols] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<
    "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
  >("quantityDesc");
  const [displayMode, setDisplayMode] = useState<"grid" | "data">("grid");
  const [layoutMode, setLayoutMode] = useState<"mosaic" | "list">("list");
  const [typeFilter, setTypeFilter] = useState<"all" | "drip" | "art" | "spam">(
    "all"
  );
  const [quantityFilter, setQuantityFilter] = useState<"all" | ">3" | "1">(
    "all"
  );
  const [inspectorFilter, setInspectorFilter] = useState<
    "clear" | "all" | "animations" | "immutable" | "cNFT"
  >("clear");
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalAddresses] = useState([
    "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC",
    "HQA4k1mrf8gDMd2GK1JYV2Sgm6kghMSsDTJ1zyAHGMQr",
    "5hWu757purMHhha9THytqkNgv5Cqbim4ossod2PBUJwM",
  ]);

  const gridSize = 4; // Number of slots per row

  const getCreatorIdentifier = (nft: NFTAsset): string => {
    const dripHausUrl = nft.content.links?.external_url;
    const isDripProject =
      dripHausUrl?.startsWith("https://drip.haus/") ||
      dripHausUrl === "https://drip.haus";
    const dripArtist = isDripProject ? dripHausUrl?.split("/").pop() : null;
    if (isDripProject) return `DRIP: ${dripArtist || "drip.haus"}`;

    if (dripHausUrl) {
      return dripHausUrl
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");
    }

    const artistAttribute = nft.content.metadata.attributes?.find(
      (attr) => (attr.trait_type || attr.traitType)?.toLowerCase() === "artist"
    );
    if (artistAttribute?.value) return artistAttribute.value;

    if (nft.compression?.creator_hash) return nft.compression.creator_hash;

    if (nft.content.metadata.symbol) return nft.content.metadata.symbol;

    return nft.authorities?.[0]?.address || "Unknown";
  };

  const handleSortTypeChange = (
    type: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
  ) => {
    console.log(`Changing sort type to: ${type}`);
    setSortType(type);
  };

  const loadNFTs = async () => {
    if (!address) return;

    setLoading(true);
    try {
      console.log("Fetching NFTs for address:", address);
      const fetchedNFTs = await fetchNFTsByOwner(address, viewType);

      console.log("Fetched NFTs:", fetchedNFTs);

      // Apply type and quantity filters
      const filteredNFTs = fetchedNFTs.filter((nft) => {
        const creatorId = getCreatorIdentifier(nft);

        // Type filter
        if (typeFilter !== "all") {
          const isDrip = creatorId.startsWith("DRIP:");
          const isArt = creatorId.startsWith("@");
          if (
            (typeFilter === "drip" && !isDrip) ||
            (typeFilter === "art" && !isArt) ||
            (typeFilter === "spam" && isDrip) // Assuming spam is the opposite of drip
          ) {
            return false;
          }
        }

        // Quantity filter
        const creatorNFTs = fetchedNFTs.filter(
          (n) => getCreatorIdentifier(n) === creatorId
        );
        if (quantityFilter === ">3" && creatorNFTs.length <= 3) {
          return false;
        }
        if (quantityFilter === "1" && creatorNFTs.length !== 1) {
          return false;
        }

        return true;
      });

      console.log("Filtered NFTs:", filteredNFTs);

      const tempGrouped = filteredNFTs.reduce((acc: GroupedNFTs, nft) => {
        const creatorId = getCreatorIdentifier(nft);
        if (!acc[creatorId]) {
          acc[creatorId] = [];
        }
        acc[creatorId].push(nft);
        return acc;
      }, {});

      console.log("Grouped NFTs by creator:", tempGrouped);

      // Apply sorting based on sortType
      const sortedGrouped = Object.entries(tempGrouped).sort(
        ([aKey, aValue], [bKey, bValue]) => {
          switch (sortType) {
            case "quantityDesc":
              return bValue.length - aValue.length;
            case "quantityAsc":
              return aValue.length - bValue.length;
            case "nameAsc":
              return aKey.localeCompare(bKey);
            case "nameDesc":
              return bKey.localeCompare(aKey);
            default:
              return 0;
          }
        }
      );

      console.log("Sorted grouped NFTs:", sortedGrouped);

      setNfts(Object.fromEntries(sortedGrouped));
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, [address, viewType, sortType, typeFilter, quantityFilter]);

  const toggleSymbol = (symbol: string) => {
    setOpenSymbols((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  const handleInspectorFilterChange = (filter: string) => {
    setInspectorFilter(
      filter as "clear" | "all" | "animations" | "immutable" | "cNFT"
    );
    if (filter === "clear") {
      setOpenSymbols(new Set());
    } else if (filter === "all") {
      setOpenSymbols(new Set(Object.keys(nfts)));
    } else {
      const filteredSymbols = new Set<string>();
      Object.entries(nfts).forEach(([creator, creatorNFTs]) => {
        const hasMatchingNFTs = creatorNFTs.some((nft) => {
          switch (filter) {
            case "animations":
              return nft.content.links?.animation_url;
            case "immutable":
              return !nft.mutable;
            case "cNFT":
              return nft.compression?.compressed;
            default:
              return true;
          }
        });
        if (hasMatchingNFTs) {
          filteredSymbols.add(creator);
        }
      });
      setOpenSymbols(filteredSymbols);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
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

      <div className="p-4">
        <div
          className={`${
            layoutMode === "mosaic"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "flex flex-wrap gap-6"
          }`}
        >
          {Object.entries(nfts).map(([creator, creatorNFTs]) => {
            const isOpen = openSymbols.has(creator);
            const displayNFTs =
              layoutMode === "mosaic" || isOpen
                ? creatorNFTs
                : [creatorNFTs[0]];
            const isSingleNFT = creatorNFTs.length === 1;

            return (
              <div
                key={creator}
                className={`bg-gray-800 rounded-xl shadow-md p-6 ${
                  layoutMode === "list" && isSingleNFT
                    ? "flex-grow-0"
                    : "w-full"
                } ${
                  layoutMode === "mosaic"
                    ? `col-span-${Math.min(creatorNFTs.length, gridSize)}`
                    : ""
                }`}
                onClick={() => toggleSymbol(creator)}
              >
                <h2 className="text-xl font-semibold text-gray-300">
                  {creator}
                </h2>
                <p className="text-gray-500">{creatorNFTs.length} NFTs</p>
                <div
                  className={`${
                    layoutMode === "mosaic"
                      ? "grid grid-cols-1 gap-4 mt-4"
                      : "flex flex-wrap gap-4 mt-4"
                  }`}
                >
                  {displayNFTs.map((nft, index) => {
                    const imageUrl =
                      nft.content.links?.image ||
                      nft.content.metadata?.image ||
                      nft.content.json_uri;

                    return (
                      <div
                        key={nft.id}
                        className={`bg-gray-700 rounded-lg p-4 ${
                          layoutMode === "mosaic" ? "w-full" : "max-w-[300px]"
                        }`}
                      >
                        <NFTImage
                          src={imageUrl}
                          alt={nft.content.metadata.name || "NFT Image"}
                          layoutMode={layoutMode}
                        />
                        {displayMode === "data" && (
                          <div className="mt-2 text-gray-400 max-w-full">
                            <p className="text-sm">
                              <span className="font-semibold">Title:</span>{" "}
                              {nft.content.metadata.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">
                                Description:
                              </span>{" "}
                              {nft.content.metadata.description}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Attributes:</span>{" "}
                              {JSON.stringify(nft.content.metadata.attributes)}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Links:</span>{" "}
                              {nft.content.links?.external_url}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">ID:</span>{" "}
                              {nft.id}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">
                                UpdateAuthority:
                              </span>{" "}
                              {nft.updateAuthority}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">isMutable:</span>{" "}
                              {nft.mutable ? "Yes" : "No"}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">cNFT:</span>{" "}
                              {nft.compression?.compressed ? "Yes" : "No"}
                            </p>
                            <button className="text-blue-500 hover:underline">
                              Show raw data
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
