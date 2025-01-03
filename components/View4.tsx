import React from "react";
import { NFTAsset } from "@/utils/helius";
import { NFTImage } from "@/components/NFTImage";

interface ViewMosaicProps {
  nfts: { [symbol: string]: NFTAsset[] };
  openSymbols: Set<string>;
  toggleSymbol: (symbol: string) => void;
  layoutMode: "mosaic" | "list";
  displayMode: "grid" | "data";
}

const ViewMosaic: React.FC<ViewMosaicProps> = ({
  nfts,
  openSymbols,
  toggleSymbol,
  layoutMode,
  displayMode,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => {
        const isOpen = openSymbols.has(creator);
        const displayNFTs =
          layoutMode === "mosaic" || isOpen ? creatorNFTs : [creatorNFTs[0]];

        return (
          <div
            key={creator}
            className="bg-gray-800 rounded-xl shadow-md p-6"
            onClick={() => toggleSymbol(creator)}
          >
            <h2 className="text-xl font-semibold text-gray-300">{creator}</h2>
            <p className="text-gray-500">{creatorNFTs.length} NFTs</p>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {displayNFTs.map((nft) => (
                <div key={nft.id} className="bg-gray-700 rounded-lg p-4 w-full">
                  <NFTImage
                    src={
                      nft.content.links?.image ||
                      nft.content.metadata?.image ||
                      nft.content.json_uri
                    }
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
                        <span className="font-semibold">Description:</span>{" "}
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
                        <span className="font-semibold">ID:</span> {nft.id}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">UpdateAuthority:</span>{" "}
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ViewMosaic;
