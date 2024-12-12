"use client";

import { useState, useEffect } from "react";
import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";
import Header from "@/components/Header";
import ViewMosaic from "@/components/ViewMosaic";
import ViewList from "@/components/ViewList";

export default function Home() {
  const [nfts, setNfts] = useState<{ [symbol: string]: NFTAsset[] }>({});
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCreatorNFTs, setSelectedCreatorNFTs] = useState<NFTAsset[]>(
    []
  );

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

      const tempGrouped = filteredNFTs.reduce(
        (acc: { [symbol: string]: NFTAsset[] }, nft) => {
          const creatorId = getCreatorIdentifier(nft);
          if (!acc[creatorId]) {
            acc[creatorId] = [];
          }
          acc[creatorId].push(nft);
          return acc;
        },
        {}
      );

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

  const openModal = (nfts: NFTAsset[]) => {
    setSelectedCreatorNFTs(nfts);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCreatorNFTs([]);
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <Header
        viewType={viewType}
        setViewType={setViewType}
        sortType={sortType}
        setSortType={setSortType}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        inspectorFilter={inspectorFilter}
        setInspectorFilter={setInspectorFilter}
      />

      <div className="p-4">
        {layoutMode === "mosaic" ? (
          <ViewMosaic nfts={nfts} openModal={openModal} />
        ) : (
          <ViewList
            nfts={nfts}
            toggleSymbol={toggleSymbol}
            displayMode={displayMode}
          />
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-300">All NFTs</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {selectedCreatorNFTs.map((nft) => (
                <div key={nft.id} className="bg-gray-700 rounded-lg p-4 w-full">
                  <NFTImage
                    src={
                      nft.content.links?.image ||
                      nft.content.metadata?.image ||
                      nft.content.json_uri
                    }
                    alt={nft.content.metadata.name || "NFT Image"}
                    layoutMode="mosaic"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
