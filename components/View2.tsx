import React, { useState } from "react";
import { NFTAsset } from "@/utils/helius";
import NFTModal from "@/components/NFTModal";
import Image from "next/image";

interface View2Props {
  nfts: { [symbol: string]: NFTAsset[] };
  openSymbols: Set<string>;
  toggleSymbol: (symbol: string) => void;
}

const View2: React.FC<View2Props> = ({ nfts, openSymbols, toggleSymbol }) => {
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
    return (
      nft.content.links?.image ||
      nft.content.metadata?.image ||
      nft.content.json_uri ||
      ""
    );
  };

  return (
    <div className="flex flex-wrap gap-6 p-4">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => (
        <div
          key={creator}
          className="bg-gray-800/30 rounded-xl p-6"
          style={{
            width: "calc(50% - 12px)", // 50% minus half the gap
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">{creator}</h2>
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {creatorNFTs.map((nft, index) => (
                <div
                  key={nft.id}
                  className="flex-shrink-0 cursor-pointer"
                  onClick={(e) =>
                    handleTileClick(nft, creatorNFTs, creator, index, e)
                  }
                >
                  <div className="relative w-[240px] h-[240px] bg-gray-700 rounded-lg p-4">
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
