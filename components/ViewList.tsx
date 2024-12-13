import React from "react";
import { NFTAsset } from "@/utils/helius";
import { NFTImage } from "@/components/NFTImage";

interface ViewListProps {
  nfts: { [symbol: string]: NFTAsset[] };
  openSymbols: Set<string>;
  toggleSymbol: (symbol: string) => void;
  layoutMode: "mosaic" | "list";
  displayMode: "grid" | "data";
}

const ViewList: React.FC<ViewListProps> = ({
  nfts,
  openSymbols,
  toggleSymbol,
  layoutMode,
  displayMode,
}) => {
  return (
    <div className="flex flex-wrap gap-6">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => {
        const isOpen = openSymbols.has(creator);
        const displayNFTs =
          layoutMode === "mosaic" || isOpen ? creatorNFTs : [creatorNFTs[0]];

        return (
          <div
            key={creator}
            className="bg-gray-800 rounded-xl shadow-md p-6 flex-grow-0"
            onClick={() => toggleSymbol(creator)}
          >
            <h2 className="text-xl font-semibold text-gray-300">{creator}</h2>
            <p className="text-gray-500">{creatorNFTs.length} NFTs</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {displayNFTs.map((nft) => {
                const imageUrl =
                  nft.content.links?.image ||
                  nft.content.metadata?.image ||
                  nft.content.json_uri;

                const solscanUrl = `https://solscan.io/token/${nft.id}`;
                const dripHausUrl = nft.content.links?.external_url;
                const animationUrl = nft.content.links?.animation_url;
                const attributes = nft.content.metadata.attributes || [];

                return (
                  <div
                    key={nft.id}
                    className="bg-gray-700 rounded-lg p-4 max-w-[300px]"
                  >
                    <NFTImage
                      src={imageUrl}
                      alt={nft.content.metadata.name || "NFT Image"}
                      layoutMode={layoutMode}
                    />
                    {displayMode === "data" && (
                      <div className="mt-2 text-gray-400 max-w-full">
                        <h2 className="text-sm font-semibold">
                          {nft.content.metadata.name}
                        </h2>
                        <p className="text-sm">
                          <span className="font-semibold">Description:</span>{" "}
                          {nft.content.metadata.description}
                        </p>
                        {attributes.length > 0 && (
                          <div className="text-sm">
                            <span className="font-semibold">Attributes:</span>
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
                          </div>
                        )}
                        <p className="text-sm">
                          <span className="font-semibold">Links:</span>{" "}
                          {dripHausUrl && (
                            <a
                              href={dripHausUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline"
                            >
                              {dripHausUrl}
                            </a>
                          )}
                          <a
                            href={solscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline"
                          >
                            View on Solscan
                          </a>
                          {animationUrl && (
                            <a
                              href={animationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline"
                            >
                              View Animation
                            </a>
                          )}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">ID:</span> {nft.id}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">
                            Update Authority:
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
  );
};

export default ViewList;
