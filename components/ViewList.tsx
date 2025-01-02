import React, { useState } from "react";
import { NFTAsset } from "@/utils/helius";
import { NFTImage } from "@/components/NFTImage";
import NFTModal from "@/components/NFTModal";

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
  const [selectedNFTs, setSelectedNFTs] = useState<NFTAsset[] | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  const handleTileClick = (creatorNFTs: NFTAsset[], creator: string) => {
    setSelectedNFTs(creatorNFTs);
    setSelectedCreator(creator);
  };

  const closeModal = () => {
    setSelectedNFTs(null);
    setSelectedCreator(null);
  };

  return (
    <div className="flex flex-wrap gap-6">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => {
        const displayNFTs =
          layoutMode === "mosaic" || openSymbols.has(creator)
            ? creatorNFTs
            : [creatorNFTs[0]];

        return (
          <div
            key={creator}
            className="bg-gray-800 rounded-xl shadow-md p-6 flex-grow-0 cursor-pointer"
            onClick={() => handleTileClick(creatorNFTs, creator)}
          >
            <h2 className="text-xl font-semibold text-gray-300 title-overflow">
              {creator}
            </h2>
            <p className="text-gray-500">{creatorNFTs.length} NFTs</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {displayNFTs.map((nft) => {
                const imageUrl =
                  nft.content.links?.image ||
                  nft.content.metadata?.image ||
                  nft.content.json_uri;

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
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {selectedNFTs && selectedCreator && (
        <NFTModal
          isOpen={!!selectedNFTs}
          onClose={closeModal}
          nfts={selectedNFTs}
          creator={selectedCreator}
        />
      )}
    </div>
  );
};

export default ViewList;
