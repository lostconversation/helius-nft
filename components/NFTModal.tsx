import React, { useState, useEffect } from "react";
import Image from "next/image";
import { NFTAsset } from "@/utils/helius";

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfts: NFTAsset[];
  creator: string;
}

const NFTModal: React.FC<NFTModalProps> = ({
  isOpen,
  onClose,
  nfts,
  creator,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % nfts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? nfts.length - 1 : prevIndex - 1
    );
  };

  const getImageSrc = (index: number) => {
    return (
      nfts[index].content.links?.image ||
      nfts[index].content.metadata?.image ||
      nfts[index].content.json_uri
    );
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-900 opacity-95" />
      <div
        className="relative w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-6xl z-50"
        >
          ×
        </button>

        {/* Artist info at top */}
        <div className="text-center text-white mb-8">
          <h2 className="text-4xl font-bold mb-2">{creator}</h2>
          <p className="text-xl opacity-75">
            NFT {currentIndex + 1} of {nfts.length}
          </p>
        </div>

        {/* Main content area */}
        <div className="relative w-full h-[80vh] flex justify-center items-center">
          <div className="w-full h-full flex justify-center items-center">
            <Image
              src={getImageSrc(currentIndex)}
              alt={nfts[currentIndex].content.metadata.name || "NFT Image"}
              className="w-auto h-full object-contain cursor-default"
              width={1920}
              height={1080}
              unoptimized={true}
            />
          </div>

          {/* Side previews - only show if there's more than one NFT */}
          {nfts.length > 1 && (
            <>
              <div className="fixed left-0 top-0 h-full flex items-center">
                <div className="px-4">
                  <Image
                    src={getImageSrc(
                      (currentIndex - 1 + nfts.length) % nfts.length
                    )}
                    alt="Previous NFT"
                    className="max-h-[100px] w-auto opacity-50 hover:opacity-75 transition-opacity cursor-pointer"
                    width={100}
                    height={100}
                    unoptimized={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                  />
                </div>
              </div>
              <div className="fixed right-0 top-0 h-full flex items-center">
                <div className="px-4">
                  <Image
                    src={getImageSrc((currentIndex + 1) % nfts.length)}
                    alt="Next NFT"
                    className="max-h-[100px] w-auto opacity-50 hover:opacity-75 transition-opacity cursor-pointer"
                    width={100}
                    height={100}
                    unoptimized={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Image title at bottom */}
        <div className="text-center text-white mt-8">
          <h3 className="text-2xl font-bold">
            {nfts[currentIndex].content.metadata.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default NFTModal;
