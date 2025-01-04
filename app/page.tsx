"use client";

import { useState, useEffect } from "react";
import { loadNFTs } from "@/utils/loadNFTs";
import Header from "@/components/Header";
import LoadingPopup from "@/components/LoadingPopup";
import { NFTAsset } from "@/utils/helius";
import View1 from "@/components/View1";
import View2 from "@/components/View2";
import View3 from "@/components/View3";
import { ViewMode } from "@/types/index";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

type ZoomLevel = "small" | "normal" | "big" | "mega";

export default function Home() {
  const [nfts, setNfts] = useState<GroupedNFTs>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
  const [typeFilter, setTypeFilter] = useState<
    "all" | "drip" | "@" | "youtu" | "???" | "spam"
  >("youtu");
  const [quantityFilter, setQuantityFilter] = useState<"all" | ">3" | "1">(
    "all"
  );
  const [inspectorFilter, setInspectorFilter] = useState<
    "all" | "animations" | "immutable" | "cNFT"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalAddresses] = useState([
    "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC",
    "HQA4k1mrf8gDMd2GK1JYV2Sgm6kghMSsDTJ1zyAHGMQr",
    "5hWu757purMHhha9THytqkNgv5Cqbim4ossod2PBUJwM",
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>("1");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("normal");

  const handleInspectorFilterChange = (
    filter: "all" | "animations" | "immutable" | "cNFT"
  ) => {
    setInspectorFilter(filter);
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const groupedNFTs = await loadNFTs(
          address,
          viewType,
          sortType,
          typeFilter,
          quantityFilter,
          setProgress
        );

        // Sort the grouped NFTs based on the sortType
        const sortedGroupedNFTs = Object.entries(groupedNFTs).sort(
          ([creatorA, nftsA], [creatorB, nftsB]) => {
            if (sortType === "quantityDesc") {
              return nftsB.length - nftsA.length;
            } else if (sortType === "quantityAsc") {
              return nftsA.length - nftsB.length;
            } else if (sortType === "nameAsc") {
              return creatorA.localeCompare(creatorB);
            } else if (sortType === "nameDesc") {
              return creatorB.localeCompare(creatorA);
            }
            return 0;
          }
        );

        setNfts(Object.fromEntries(sortedGroupedNFTs));
      } catch (error) {
        console.error("Error loading NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
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

  const filterNFTs = (nfts: { [symbol: string]: NFTAsset[] }) => {
    if (inspectorFilter === "all") return nfts;

    const filteredNFTs: { [symbol: string]: NFTAsset[] } = {};

    Object.entries(nfts).forEach(([symbol, assets]) => {
      const filteredAssets = assets.filter((nft) => {
        switch (inspectorFilter) {
          case "animations":
            // Check if NFT has animation_url in content
            return nft.content.files?.some(
              (file) =>
                file.type?.includes("video") || file.type?.includes("animation")
            );
          case "immutable":
            // Check if NFT is mutable
            return nft.mutable;
          case "cNFT":
            // Check if NFT is compressed
            return nft.compression?.compressed === true;
          default:
            return true;
        }
      });

      if (filteredAssets.length > 0) {
        filteredNFTs[symbol] = filteredAssets;
      }
    });

    return filteredNFTs;
  };

  const handleZoomChange = (newLevel: ZoomLevel) => {
    setZoomLevel(newLevel);
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case "1":
        return (
          <View1
            nfts={filterNFTs(nfts)}
            openSymbols={openSymbols}
            toggleSymbol={toggleSymbol}
            zoomLevel={zoomLevel}
          />
        );
      case "2":
        return (
          <View2
            nfts={filterNFTs(nfts)}
            openSymbols={openSymbols}
            toggleSymbol={toggleSymbol}
            zoomLevel={zoomLevel}
          />
        );
      case "3":
        return (
          <View3
            nfts={filterNFTs(nfts)}
            openSymbols={openSymbols}
            toggleSymbol={toggleSymbol}
            zoomLevel={zoomLevel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      {loading && <LoadingPopup progress={progress} />}
      <Header
        address={address}
        setAddress={setAddress}
        viewType={viewType}
        setViewType={setViewType}
        sortType={sortType}
        setSortType={setSortType}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        quantityFilter={quantityFilter}
        setQuantityFilter={setQuantityFilter}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        inspectorFilter={inspectorFilter}
        handleInspectorFilterChange={handleInspectorFilterChange}
        additionalAddresses={additionalAddresses}
        viewMode={viewMode}
        setViewMode={setViewMode}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
      />
      <div className="p-4">
        {renderCurrentView()}

        {viewMode === "4" && (
          <View4
            nfts={nfts}
            openSymbols={openSymbols}
            toggleSymbol={toggleSymbol}
          />
        )}
      </div>
    </div>
  );
}
