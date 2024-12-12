"use client";

import { useState, useEffect } from "react";
import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";
import Header from "@/components/Header";
import ViewMosaic from "@/components/ViewMosaic";
import ViewList from "@/components/ViewList";

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
  const [typeFilter, setTypeFilter] = useState<
    "all" | "drip" | "@" | "youtu" | "???" | "spam"
  >("all");
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
          const isAtSymbol = creatorId.startsWith("@");
          const isYoutu = creatorId.toLowerCase().startsWith("youtu");
          const isLongName = creatorId.length >= 20;

          if (
            (typeFilter === "drip" && !isDrip) ||
            (typeFilter === "@" && !isAtSymbol) ||
            (typeFilter === "youtu" && !isYoutu) ||
            (typeFilter === "???" && !isLongName) ||
            (typeFilter === "spam" &&
              (isDrip || isAtSymbol || isYoutu || isLongName))
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
        loadNFTs={loadNFTs}
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
