"use client";

import { useState, useEffect } from "react";
import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";
import { getImageUrl } from "@/utils/imageUtils";
import { NFTImage } from "@/components/NFTImage";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

interface GroupedByCreator {
  [creator: string]: NFTAsset[];
}

export default function Home() {
  const [nfts, setNfts] = useState<GroupedNFTs>({});
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(
    "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC"
  );
  const [viewType, setViewType] = useState<"created" | "owned">("created");
  const [openSymbols, setOpenSymbols] = useState<Set<string>>(new Set());

  const loadNFTs = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const fetchedNFTs = await fetchNFTsByOwner(address, viewType);

      // First group by symbol
      const grouped = fetchedNFTs.reduce((acc: GroupedNFTs, nft) => {
        const symbol = nft.content.metadata.symbol || "Unknown Symbol";
        if (!acc[symbol]) {
          acc[symbol] = [];
        }
        acc[symbol].push(nft);
        return acc;
      }, {});

      // For each symbol, group by creator and sort
      Object.keys(grouped).forEach((symbol) => {
        // Group by creator
        const groupedByCreator = grouped[symbol].reduce(
          (acc: GroupedByCreator, nft) => {
            const creator = nft.authorities?.[0]?.address || "Unknown Creator";
            if (!acc[creator]) {
              acc[creator] = [];
            }
            acc[creator].push(nft);
            return acc;
          },
          {}
        );

        // Sort within each creator's group
        Object.values(groupedByCreator).forEach((creatorNFTs) => {
          creatorNFTs.sort((a, b) => {
            const nameA = a.content.metadata.name.toLowerCase();
            const nameB = b.content.metadata.name.toLowerCase();
            return nameA.localeCompare(nameB);
          });
        });

        // Flatten back into array, maintaining creator grouping
        grouped[symbol] = Object.entries(groupedByCreator)
          .sort(([creatorA], [creatorB]) => creatorA.localeCompare(creatorB))
          .flatMap(([creator, nfts]) => nfts);
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

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="mb-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("owned")}
              className={`px-4 py-2 rounded-lg ${
                viewType === "owned"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Owned By
            </button>
            <button
              onClick={() => setViewType("created")}
              className={`px-4 py-2 rounded-lg ${
                viewType === "created"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
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

          <button
            onClick={loadNFTs}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading &&
        Object.entries(nfts).map(([symbol, symbolNFTs]) => {
          // Group NFTs by creator for rendering
          const nftsByCreator: GroupedByCreator = {};
          symbolNFTs.forEach((nft) => {
            const creator = nft.authorities?.[0]?.address || "Unknown Creator";
            if (!nftsByCreator[creator]) {
              nftsByCreator[creator] = [];
            }
            nftsByCreator[creator].push(nft);
          });

          return (
            <div
              key={symbol}
              className="mb-12 bg-white rounded-xl shadow-md p-6"
            >
              <div
                className="border-b pb-4 mb-6 cursor-pointer"
                onClick={() => toggleSymbol(symbol)}
              >
                <h2 className="text-2xl font-semibold text-gray-800">
                  {symbol || "No Symbol"}
                </h2>
                <p className="text-gray-600">{symbolNFTs.length} NFTs</p>
              </div>

              {openSymbols.has(symbol) && (
                <div className="space-y-8">
                  {Object.entries(nftsByCreator).map(
                    ([creator, creatorNFTs]) => (
                      <div key={creator} className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-700">
                          Creator: {creator}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {creatorNFTs.map((nft) => {
                            const imageUrl =
                              nft.content.links?.image ||
                              nft.content.metadata?.image ||
                              nft.content.json_uri;

                            return (
                              <div
                                key={nft.id}
                                className="bg-white rounded-xl shadow-md p-6"
                              >
                                <NFTImage
                                  src={imageUrl}
                                  alt={nft.content.metadata.name || "NFT Image"}
                                />
                                <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                                  {nft.content.metadata.name}
                                </h2>
                                <ul className="text-sm text-gray-800 space-y-1">
                                  <li>
                                    <strong>Symbol:</strong>{" "}
                                    {nft.content.metadata.symbol || "N/A"}
                                  </li>
                                  <li className="break-all">
                                    <strong>Mint:</strong> {nft.id}
                                  </li>
                                  <li className="break-all">
                                    <strong>Collection:</strong>{" "}
                                    {nft.collection?.key || "N/A"}
                                  </li>
                                  <li className="break-all">
                                    <strong>Creator:</strong> {creator}
                                  </li>
                                  <li className="break-all">
                                    <strong>URI:</strong> {nft.content.json_uri}
                                  </li>
                                  <li>
                                    <strong>Is Mutable:</strong>{" "}
                                    {nft.mutable ? "Yes" : "No"}
                                  </li>
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
