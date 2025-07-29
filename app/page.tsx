"use client";

import { useState, useEffect } from "react";
import { loadNFTs, sortGroupedNFTs } from "@/utils/loadNFTs";
import Header from "@/components/Header";
import LoadingPopup from "@/components/LoadingPopup";
import { NFTAsset } from "@/utils/helius";
import View1 from "@/components/View1";
import View2 from "@/components/View2";
import View3 from "@/components/View3";
import { ViewMode, ZoomLevel } from "@/types/index";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

export default function Home() {
  const [nfts, setNfts] = useState<GroupedNFTs>({});
  const [allCategories, setAllCategories] = useState<{
    [key: string]: GroupedNFTs;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [address, setAddress] = useState("");
  const [viewType, setViewType] = useState<"created" | "owned">("owned");
  const [openSymbols, setOpenSymbols] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<
    "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
  >("quantityDesc");
  const [displayMode, setDisplayMode] = useState<"grid" | "data">("grid");
  const [layoutMode, setLayoutMode] = useState<"mosaic" | "list">("list");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "drip" | "@" | "youtu" | "legit" | "???" | "spam"
  >("legit");
  const [quantityFilter, setQuantityFilter] = useState<"all" | ">3" | "1">(
    "all"
  );
  const [inspectorFilter, setInspectorFilter] = useState<
    "all" | "animations" | "immutable" | "cNFT"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalAddresses] = useState([
    process.env.NEXT_PUBLIC_ADDRESS_1 || "",
    process.env.NEXT_PUBLIC_ADDRESS_2 || "",
    process.env.NEXT_PUBLIC_ADDRESS_3 || "",
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>("3");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("normal");
  const [loadTrigger, setLoadTrigger] = useState(0);

  const handleInspectorFilterChange = (
    filter: "all" | "animations" | "immutable" | "cNFT"
  ) => {
    setInspectorFilter(filter);
  };

  // Load ALL categories once when wallet is entered
  useEffect(() => {
    const loadAllCategories = async () => {
      if (!address) return;

      setLoading(true);
      try {
        console.log("🚀 Loading ALL categories for wallet:", address);

        // Load OG tags first (fast)
        const ogCategories = ["all", "drip", "@", "youtu"];
        const allCategoriesData: any = {};

        console.log("⚡ Loading OG tags (fast)...");
        for (let i = 0; i < ogCategories.length; i++) {
          const category = ogCategories[i];
          setProgress(Math.floor((i / ogCategories.length) * 40) + 10);
          console.log(`📥 Loading ${category}...`);

          const result = await loadNFTs(
            address,
            viewType,
            "quantityDesc", // Always use same sort for fetching
            category as any,
            quantityFilter,
            () => {} // Don't update progress for individual loads
          );

          allCategoriesData[category] = result;
        }

        // Load custom artists (slow)
        const customCategories = ["legit", "spam", "???"];
        console.log("🔍 Loading custom artists (slow scan)...");
        for (let i = 0; i < customCategories.length; i++) {
          const category = customCategories[i];
          setProgress(50 + Math.floor((i / customCategories.length) * 40));
          console.log(`🔍 Scanning ${category}...`);

          const result = await loadNFTs(
            address,
            viewType,
            "quantityDesc", // Always use same sort for fetching
            category as any,
            quantityFilter,
            () => {} // Don't update progress for individual loads
          );

          allCategoriesData[category] = result;
        }

        setAllCategories(allCategoriesData);
        setNfts(allCategoriesData.legit); // Start with legit
        setProgress(100);

        console.log("✅ All categories loaded and cached");
      } catch (error) {
        console.error("Error loading NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllCategories();
  }, [address, viewType, quantityFilter, loadTrigger]); // Removed sortType from dependencies

  // Handle filter changes instantly (no loading)
  useEffect(() => {
    if (!allCategories) return;

    console.log("🔄 Switching to filter:", typeFilter);

    // Map filter names to category keys
    const categoryMap: { [key: string]: string } = {
      all: "all",
      drip: "drip",
      "@": "at",
      youtu: "youtu",
      legit: "legit",
      spam: "spam",
      "???": "???",
    };

    const categoryKey = categoryMap[typeFilter];
    if (categoryKey && allCategories[categoryKey]) {
      // Apply sorting on the client side
      const sortedGrouped = sortGroupedNFTs(
        allCategories[categoryKey],
        sortType
      );
      setNfts(Object.fromEntries(sortedGrouped));
      console.log(
        `✅ Switched to ${typeFilter}: ${
          Object.keys(allCategories[categoryKey]).length
        } artists`
      );
    }
  }, [typeFilter, allCategories, sortType]); // Added sortType back for client-side sorting

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
            // Check specifically for animation_url in links
            return Boolean(nft.content.links?.animation_url);
          case "immutable":
            return nft.mutable === false;
          case "cNFT":
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

  const handleLoadNFTs = () => {
    if (address) {
      // Trigger the useEffect by incrementing the load trigger
      setLoadTrigger((prev) => prev + 1);
    }
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
        inspectorFilter={inspectorFilter}
        handleInspectorFilterChange={handleInspectorFilterChange}
        loadNFTs={handleLoadNFTs}
        additionalAddresses={additionalAddresses}
        viewMode={viewMode}
        setViewMode={setViewMode}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        nfts={filterNFTs(nfts)}
      />
      <div className="p-4">{renderCurrentView()}</div>
    </div>
  );
}
