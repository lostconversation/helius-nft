"use client";

import { useState, useEffect } from "react";
import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";
import { getImageUrl } from "@/utils/imageUtils";
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
  const [sortType, setSortType] = useState<"name" | "quantity">("name");
  const [allClustersOpen, setAllClustersOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<"grid" | "data">("grid");

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

  const loadNFTs = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const fetchedNFTs = await fetchNFTsByOwner(address, viewType);

      const tempGrouped = fetchedNFTs.reduce((acc: GroupedNFTs, nft) => {
        const creatorId = getCreatorIdentifier(nft);
        if (!acc[creatorId]) {
          acc[creatorId] = [];
        }
        acc[creatorId].push(nft);
        return acc;
      }, {});

      const grouped: GroupedNFTs = {};
      Object.entries(tempGrouped).forEach(([creatorId, nfts]) => {
        if (creatorId.startsWith("DRIP:")) {
          const artistName = creatorId.replace("DRIP: ", "");
          Object.entries(tempGrouped).forEach(([otherId, otherNfts]) => {
            if (
              !otherId.startsWith("DRIP:") &&
              artistName.toLowerCase() === otherId.toLowerCase()
            ) {
              nfts.push(...otherNfts);
              delete tempGrouped[otherId];
            }
          });
          grouped[creatorId] = nfts;
        } else {
          const matchingDripKey = Object.keys(tempGrouped).find(
            (key) =>
              key.startsWith("DRIP:") &&
              key.replace("DRIP: ", "").toLowerCase() ===
                creatorId.toLowerCase()
          );

          if (!matchingDripKey && tempGrouped[creatorId]) {
            grouped[creatorId] = nfts;
          }
        }
      });

      Object.keys(grouped).forEach((creatorId) => {
        grouped[creatorId].sort((a, b) => {
          const nameA = a.content.metadata.name.toLowerCase();
          const nameB = b.content.metadata.name.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      });

      setNfts(grouped);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, [address, viewType]);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="sticky top-0 z-50 mb-8 bg-white shadow-md">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewType("owned")}
                className={`px-4 py-2 rounded-lg ${
                  viewType === "owned"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Owned By
              </button>
              <button
                onClick={() => setViewType("created")}
                className={`px-4 py-2 rounded-lg ${
                  viewType === "created"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Created By
              </button>
            </div>

            <div className="flex-grow">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Solana address"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSortType("name")}
                className={`px-4 py-2 rounded-lg ${
                  sortType === "name"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Order by Name
              </button>
              <button
                onClick={() => setSortType("quantity")}
                className={`px-4 py-2 rounded-lg ${
                  sortType === "quantity"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Order by Quantity
              </button>
            </div>

            <button
              onClick={() => {
                setAllClustersOpen(!allClustersOpen);
                setOpenSymbols(
                  new Set(allClustersOpen ? [] : Object.keys(nfts))
                );
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {allClustersOpen ? "Close All" : "Open All"}
            </button>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayMode === "grid"}
                  onChange={() =>
                    setDisplayMode(displayMode === "data" ? "grid" : "data")
                  }
                  className="sr-only"
                />
                <div className="flex w-28 h-8 bg-gray-200 rounded-full">
                  {/* Left Side (Grid) */}
                  <div
                    className={`flex-1 flex items-center justify-center transition-colors ${
                      displayMode === "grid"
                        ? "bg-blue-500 text-white rounded-l-full"
                        : "text-gray-500 hover:bg-gray-300 hover:rounded-l-full"
                    }`}
                  >
                    Grid
                  </div>
                  {/* Right Side (List) */}
                  <div
                    className={`flex-1 flex items-center justify-center transition-colors ${
                      displayMode === "data"
                        ? "bg-blue-500 text-white rounded-r-full"
                        : "text-gray-500 hover:bg-gray-300 hover:rounded-r-full"
                    }`}
                  >
                    List
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="Scroll to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading &&
        Object.entries(nfts)
          .sort(([creatorA, nftsA], [creatorB, nftsB]) => {
            const isDripA = creatorA.startsWith("DRIP:");
            const isDripB = creatorB.startsWith("DRIP:");

            if (isDripA && !isDripB) return -1;
            if (!isDripA && isDripB) return 1;

            if (isDripA === isDripB) {
              if (sortType === "quantity") {
                const countDiff = nftsB.length - nftsA.length;
                if (countDiff !== 0) return countDiff;
              }

              return creatorA.localeCompare(creatorB);
            }

            return 0;
          })
          .map(([creator, creatorNFTs]) => (
            <div
              key={creator}
              className="mb-12 bg-white rounded-xl shadow-md p-6"
            >
              <div
                className="border-b pb-4 mb-6 cursor-pointer"
                onClick={() => toggleSymbol(creator)}
              >
                <h2 className="text-2xl font-semibold text-gray-800">
                  {creator}
                </h2>
                <p className="text-gray-600">{creatorNFTs.length} NFTs</p>
              </div>

              {openSymbols.has(creator) || allClustersOpen ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {creatorNFTs.map((nft) => {
                    const imageUrl =
                      nft.content.links?.image ||
                      nft.content.metadata?.image ||
                      nft.content.json_uri;

                    const solscanUrl = `https://solscan.io/token/${nft.id}`;
                    const dripHausUrl = nft.content.links?.external_url;
                    const animationUrl = nft.content.links?.animation_url;
                    const dripHausArtist = dripHausUrl?.split("/").pop();

                    const description = nft.content.metadata.description;
                    const attributes = nft.content.metadata.attributes || [];

                    return (
                      <div
                        key={nft.id}
                        className="bg-white rounded-xl shadow-md p-6"
                      >
                        <NFTImage
                          src={imageUrl}
                          alt={nft.content.metadata.name || "NFT Image"}
                        />
                        <div className={displayMode === "grid" ? "hidden" : ""}>
                          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                            {nft.content.metadata.name}
                          </h2>

                          {description && (
                            <p className="text-sm text-gray-600 mb-4">
                              {description}
                            </p>
                          )}

                          <ul className="text-sm text-gray-800 space-y-1">
                            {nft.content.metadata.symbol && (
                              <li>
                                <strong>Symbol:</strong>{" "}
                                {nft.content.metadata.symbol}
                              </li>
                            )}

                            {attributes.length > 0 && (
                              <li>
                                <strong>Attributes:</strong>
                                <ul className="pl-4">
                                  {attributes.map((attr, index) => (
                                    <li key={index}>
                                      {attr?.trait_type || attr?.traitType ? (
                                        <span>
                                          <span className="font-medium">
                                            {attr.trait_type || attr.traitType}:
                                          </span>{" "}
                                          {attr.value}
                                        </span>
                                      ) : (
                                        <span className="font-medium">
                                          Unknown Trait: {attr.value}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            )}

                            <li>
                              <strong>Links:</strong>
                              <div className="pl-4">
                                {dripHausUrl && (
                                  <a
                                    href={dripHausUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline block"
                                  >
                                    {dripHausUrl}
                                  </a>
                                )}
                                <a
                                  href={solscanUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 underline block"
                                >
                                  View on Solscan
                                </a>
                                {animationUrl && (
                                  <a
                                    href={animationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline block"
                                  >
                                    View Animation
                                  </a>
                                )}
                              </div>
                            </li>

                            <li className="break-all">
                              <strong>ID:</strong> {nft.id}
                            </li>

                            <li>
                              <strong>Update Authority:</strong>{" "}
                              <span className="break-all">
                                {nft.authorities?.[0]?.address || "Unknown"}
                              </span>
                            </li>

                            <li className="break-all">
                              <strong>Mint:</strong> {nft.id}
                            </li>

                            <li>
                              <strong>Is Mutable:</strong>{" "}
                              {nft.mutable ? "Yes" : "No"}
                            </li>

                            <li>
                              <strong>cNFT:</strong>{" "}
                              {nft.compression?.compressed ? "Yes" : "No"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
    </div>
  );
}
