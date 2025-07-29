import React, { useState, useEffect } from "react";
import { NFTAsset } from "@/utils/helius";
import NFTModal from "@/components/NFTModal";
import Image from "next/image";
import { calculateSize } from "@/utils/zoomUtils";
import { getImageUrl, getDisplayName } from "@/utils/loadNFTs";
import { ZoomLevel } from "@/types";
import ArtistName from "./ArtistName";

interface View2Props {
  nfts: { [symbol: string]: NFTAsset[] };
  openSymbols: Set<string>;
  toggleSymbol: (symbol: string) => void;
  zoomLevel: ZoomLevel;
}

const View2: React.FC<View2Props> = ({
  nfts,
  openSymbols,
  toggleSymbol,
  zoomLevel,
}) => {
  const [selectedNFTs, setSelectedNFTs] = useState<NFTAsset[] | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const handleTileClick = (
    nft: NFTAsset,
    creatorNFTs: NFTAsset[],
    creator: string,
    nftIndex: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    const tile = event.currentTarget;
    const rect = tile.getBoundingClientRect();

    setClickPosition({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
    setSelectedNFTs(creatorNFTs);
    setSelectedCreator(creator);
    setSelectedIndex(nftIndex);
  };

  const getImageSrc = (nft: NFTAsset): string => {
    const imageUrl =
      nft.content.links?.image ||
      nft.content.metadata?.image ||
      nft.content.json_uri ||
      "";
    return getImageUrl(imageUrl);
  };

  const renderPreviewTile = (nfts: NFTAsset[], creator: string) => {
    const displayNFTs = nfts.slice(0, 4);
    const remainingCount = nfts.length > 4 ? nfts.length - 4 : 0;

    const gridConfig = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-2",
      4: "grid-cols-2",
    }[Math.min(4, nfts.length)];

    return (
      <div className={`grid ${gridConfig} gap-2 aspect-square w-full h-full`}>
        {displayNFTs.map((nft, index) => {
          const isLarge = nfts.length === 3 && index === 0;
          const gridSpan = isLarge ? "row-span-2" : "";

          return (
            <div
              key={nft.id}
              className={`relative cursor-pointer ${gridSpan} bg-gray-700/50 rounded-lg overflow-hidden`}
              onClick={(e) => handleTileClick(nft, nfts, creator, index, e)}
            >
              <div className="absolute inset-0">
                <Image
                  src={getImageSrc(nft)}
                  alt={nft.content.metadata.name || "NFT"}
                  className="object-cover"
                  fill
                  unoptimized={true}
                />
              </div>
              {/* Play icon for videos */}
              {nft.content.links?.animation_url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/30 rounded-full p-4">
                    <svg
                      className="w-12 h-12 text-white/50"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-6 p-4 justify-center">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => (
        <div
          key={creator}
          className="bg-gray-800/30 rounded-xl p-6"
          style={{
            width: `min(${calculateSize(400, zoomLevel)}px, 100%)`,
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <div className="relative">
            <h2 className="text-xl font-semibold text-gray-300 title-overflow mb-4">
              <ArtistName creatorId={creator} />
            </h2>
            {creatorNFTs.length > 4 && (
              <div className="absolute top-0 right-0 bg-black/50 px-3 py-1.5 rounded-full text-white text-sm font-medium">
                +{creatorNFTs.length - 4}
              </div>
            )}
            <div className="relative aspect-square">
              {renderPreviewTile(creatorNFTs, creator)}
            </div>
          </div>
        </div>
      ))}

      {selectedNFTs && selectedCreator && clickPosition && (
        <NFTModal
          isOpen={!!selectedNFTs}
          onClose={() => {
            setSelectedNFTs(null);
            setSelectedCreator(null);
            setClickPosition(null);
            setSelectedIndex(0);
          }}
          nfts={selectedNFTs}
          creator={selectedCreator}
          initialPosition={clickPosition}
          initialIndex={selectedIndex}
        />
      )}
    </div>
  );
};

export default View2;
