import React, { useState, useEffect } from "react";
import { NFTAsset } from "@/utils/helius";
import NFTModal from "@/components/NFTModal";
import Image from "next/image";
import { calculateSize } from "@/utils/zoomUtils";

interface View3Props {
  nfts: { [symbol: string]: NFTAsset[] };
  openSymbols: Set<string>;
  toggleSymbol: (symbol: string) => void;
  zoomLevel: ZoomLevel;
}

const View2: React.FC<View3Props> = ({
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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    return (
      nft.content.links?.image ||
      nft.content.metadata?.image ||
      nft.content.json_uri ||
      ""
    );
  };

  const getTitleMaxWidth = (nftCount: number): string => {
    if (nftCount === 1) return "200px";
    if (nftCount === 2) return "400px";
    return `${nftCount * 240 + (nftCount - 1) * 16}px`; // images width + gaps
  };

  const getContainerWidth = (nftCount: number): string => {
    const baseSize = calculateSize(240, zoomLevel);
    const totalWidth = nftCount * baseSize + (nftCount - 1) * 16 + 48;
    if (totalWidth > windowWidth - 32) {
      return "100%";
    }
    return `${totalWidth}px`;
  };

  return (
    <div className="flex flex-wrap gap-6 p-4 justify-center overflow-hidden">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => (
        <div
          key={creator}
          className="bg-gray-800/30 rounded-xl p-6"
          style={{
            width: getContainerWidth(creatorNFTs.length),
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <h2
            className="text-2xl font-bold text-white mb-4 truncate text-center"
            style={{
              maxWidth: getTitleMaxWidth(creatorNFTs.length),
              margin: "0 auto 1rem auto",
            }}
          >
            {creator}
          </h2>
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2 justify-center">
              {creatorNFTs.map((nft, index) => (
                <div
                  key={nft.id}
                  className="flex-shrink-0 cursor-pointer"
                  onClick={(e) =>
                    handleTileClick(nft, creatorNFTs, creator, index, e)
                  }
                >
                  <div
                    className="relative w-[240px] h-[240px] bg-gray-700 rounded-lg p-4"
                    style={{
                      width: `${calculateSize(240, zoomLevel)}px`,
                      height: `${calculateSize(240, zoomLevel)}px`,
                    }}
                  >
                    <Image
                      src={getImageSrc(nft)}
                      alt={nft.content.metadata.name || "NFT Image"}
                      className="object-contain"
                      fill
                      unoptimized={true}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <h3 className="text-white text-sm truncate max-w-[240px]">
                      {nft.content.metadata.name}
                    </h3>
                  </div>
                </div>
              ))}
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
          currentIndex={selectedIndex}
        />
      )}
    </div>
  );
};

export default View2;
