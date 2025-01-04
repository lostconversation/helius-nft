import React, { useState } from "react";
import { NFTAsset } from "@/utils/helius";
import NFTModal from "@/components/NFTModal";
import Image from "next/image";
import { calculateSize } from "@/utils/zoomUtils";

interface View1Props {
  nfts: { [symbol: string]: NFTAsset[] };
  openSymbols: Set<string>;
  toggleSymbol: (symbol: string) => void;
  zoomLevel: ZoomLevel;
}

const View1: React.FC<View1Props> = ({
  nfts,
  openSymbols,
  toggleSymbol,
  zoomLevel,
}) => {
  const [selectedNFTs, setSelectedNFTs] = useState<NFTAsset[] | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const tileSize = calculateSize(240, zoomLevel);

  const handleTileClick = (
    creatorNFTs: NFTAsset[],
    creator: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
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
  };

  const getImageSrc = (nft: NFTAsset): string => {
    return (
      nft.content.links?.image ||
      nft.content.metadata?.image ||
      nft.content.json_uri ||
      ""
    );
  };

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => {
        const displayNFTs = [creatorNFTs[0]];
        const tileId = `tile-${creator}`;

        // Calculate container size based on zoom level
        const getContainerSize = () => {
          switch (zoomLevel) {
            case "small":
              return 160;
            case "normal":
              return 320;
            case "big":
              return 360;
            case "mega":
              return 400;
            default:
              return 320;
          }
        };

        // Calculate image size based on zoom level
        const getImageSize = () => {
          switch (zoomLevel) {
            case "small":
              return 112;
            case "normal":
              return 272;
            case "big":
              return 312;
            case "mega":
              return 352;
            default:
              return 272;
          }
        };

        return (
          <div
            id={tileId}
            key={creator}
            className="bg-gray-800 rounded-xl shadow-md p-6 flex-grow-0 cursor-pointer transition-all duration-200"
            style={{
              width: `${getContainerSize()}px`,
            }}
            onClick={(e) => handleTileClick(creatorNFTs, creator, e)}
          >
            <h2 className="text-xl font-semibold text-gray-300 title-overflow">
              {creator}
            </h2>
            <p className="text-gray-500">
              {creatorNFTs.length} {creatorNFTs.length === 1 ? "NFT" : "NFTs"}
            </p>
            <div className="mt-4 w-full">
              {displayNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="relative bg-gray-700 rounded-lg overflow-hidden w-full"
                  style={{
                    width: `${getImageSize()}px`,
                    height: `${getImageSize()}px`,
                  }}
                >
                  <Image
                    src={getImageSrc(nft)}
                    alt={nft.content.metadata.name || "NFT Image"}
                    className="object-cover"
                    fill
                    sizes={`${getImageSize()}px`}
                    unoptimized={true}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {selectedNFTs && selectedCreator && clickPosition && (
        <NFTModal
          isOpen={!!selectedNFTs}
          onClose={() => {
            setSelectedNFTs(null);
            setSelectedCreator(null);
            setClickPosition(null);
          }}
          nfts={selectedNFTs}
          creator={selectedCreator}
          initialPosition={clickPosition}
        />
      )}
    </div>
  );
};

export default View1;
