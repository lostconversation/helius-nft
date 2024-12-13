"use client";

import { useState, useEffect } from "react";
import { loadNFTs } from "@/utils/loadNFTs";
import Header from "@/components/Header";
import ViewMosaic from "@/components/ViewMosaic";
import ViewList from "@/components/ViewList";
import LoadingPopup from "@/components/LoadingPopup";
import { NFTAsset } from "@/utils/helius";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

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
  >("youtu"); // Start with "YouTu"
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

  const handleInspectorFilterChange = (filter: string) => {
    if (filter !== inspectorFilter) {
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
    }
  };

  useEffect(() => {
    // Register the service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").then(
          (registration) => {
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );
          },
          (error) => {
            console.error("Service Worker registration failed:", error);
          }
        );
      });
    }

    // Fetch NFTs
    const fetchNFTs = async () => {
      console.log("Fetching NFTs with sortType:", sortType);
      console.log("Fetching NFTs with typeFilter:", typeFilter);
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
        setNfts(groupedNFTs);
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
      />
      <div className="p-4">
        {layoutMode === "mosaic" ? (
          <ViewMosaic
            nfts={nfts}
            openSymbols={openSymbols}
            toggleSymbol={toggleSymbol}
            layoutMode={layoutMode}
            displayMode={displayMode}
          />
        ) : (
          <ViewList
            nfts={nfts}
            openSymbols={openSymbols}
            toggleSymbol={toggleSymbol}
            layoutMode={layoutMode}
            displayMode={displayMode}
          />
        )}
      </div>
    </div>
  );
}
