import React, { useState, useEffect } from "react";
import Image from "next/image";
import { NFTAsset } from "@/utils/helius";
import NFTMetadata from "./NFTMetadata";
import AnimationModal from "./AnimationModal";
import { getImageUrl } from "@/utils/loadNFTs";

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfts: NFTAsset[];
  creator: string;
  initialPosition: { x: number; y: number; width: number; height: number };
  initialIndex?: number;
}

const NFTModal: React.FC<NFTModalProps> = ({
  isOpen,
  onClose,
  nfts,
  creator,
  initialPosition,
  initialIndex = 0,
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        setIsShowing(true);
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          handleClose();
        } else if (event.key === "ArrowLeft") {
          handlePrevious();
        } else if (event.key === "ArrowRight") {
          handleNext();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 800);
  };

  if (!isOpen) return null;

  const getImageSrc = (index: number) => {
    const imageUrl =
      nfts[index].content.links?.image ||
      nfts[index].content.metadata?.image ||
      nfts[index].content.json_uri;
    return getImageUrl(imageUrl || "");
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : nfts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < nfts.length - 1 ? prev + 1 : 0));
  };

  const handlePlayAnimation = () => {
    const animationUrl = nfts[currentIndex].content.links?.animation_url;
    if (animationUrl) {
      setShowAnimation(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={handleClose}>
      <div
        className={`absolute inset-0 bg-gray-900/95 modal-background ${
          isShowing ? "show" : ""
        }`}
        style={{
          transition: "opacity 0.8s ease-in-out",
        }}
      />
      <div
        className={`absolute rounded-xl bg-gray-900/95 modal-expand ${
          isShowing ? "show" : ""
        }`}
        style={{
          left: initialPosition.x,
          top: initialPosition.y,
          width: isShowing ? "100%" : initialPosition.width,
          height: isShowing ? "100%" : initialPosition.height,
          transform: isShowing ? "none" : "translate(0, 0)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`w-full h-full flex flex-col items-center ${
            isShowing ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Artist name at top */}
          <div className="text-center text-white mb-16 mt-8">
            <h2 className="text-4xl font-bold">{creator}</h2>
          </div>

          {/* Main content area */}
          <div className="flex-1 w-full relative">
            {/* Centered Image and Title */}
            <div className="w-full flex flex-col items-center">
              <div className="h-[65vh] flex justify-center items-center relative">
                <Image
                  src={getImageSrc(currentIndex)}
                  alt={nfts[currentIndex].content.metadata.name || "NFT Image"}
                  className="w-auto h-full object-contain cursor-default"
                  width={1920}
                  height={1080}
                  unoptimized={true}
                  onClick={(e) => e.stopPropagation()}
                />
                {/* Play icon for videos */}
                {nfts[currentIndex].content.links?.animation_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAnimation();
                      }}
                      className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors"
                    >
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
                    </button>
                  </div>
                )}
              </div>
              {/* Title under image */}
              <div
                className="text-center text-white mt-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">
                  {nfts[currentIndex].content.metadata.name}
                </h3>

                {/* Navigation arrows */}
                {nfts.length > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={handlePrevious}
                      className="bg-gray-800/50 hover:bg-gray-700/50 text-white p-2 rounded-full transition-colors"
                    >
                      ←
                    </button>
                    <span className="text-gray-400 text-sm">
                      {currentIndex + 1} / {nfts.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="bg-gray-800/50 hover:bg-gray-700/50 text-white p-2 rounded-full transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Floating metadata sidebar with toggle */}
            {showMetadata && (
              <div
                className="absolute top-0 right-8 w-96 h-[65vh] bg-gray-800/70 rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full p-6 overflow-y-auto">
                  <NFTMetadata nft={nfts[currentIndex]} />
                </div>
                {/* Close button for metadata panel */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMetadata(false);
                  }}
                  className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl z-50 bg-gray-700/50 hover:bg-gray-600/50 px-2 py-1 rounded"
                >
                  ×
                </button>
              </div>
            )}

            {/* Open button for metadata panel - positioned where the panel would be */}
            {!showMetadata && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMetadata(true);
                }}
                className="absolute top-2 text-white hover:text-gray-300 text-xl z-50 bg-gray-700/50 hover:bg-gray-600/50 px-2 py-1 rounded"
                style={{
                  right: "40px", // 8px more than right-8 (32px + 8px = 40px)
                }}
              >
                +
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-6xl z-50"
          >
            ×
          </button>

          {/* Thumbnails at bottom */}
          {nfts.length > 1 && (
            <div className="w-full flex justify-center mb-8">
              <div
                className="flex gap-4 overflow-x-auto px-4 py-2 max-w-[80vw]"
                onClick={(e) => e.stopPropagation()}
              >
                {nfts.map((nft, index) => (
                  <div
                    key={nft.id}
                    className={`flex-shrink-0 cursor-pointer transition-opacity ${
                      index === currentIndex
                        ? "opacity-100 ring-2 ring-white"
                        : "opacity-50 hover:opacity-75"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <Image
                      src={getImageSrc(index)}
                      alt={nft.content.metadata.name || "NFT Thumbnail"}
                      className="w-auto h-20 object-contain"
                      width={100}
                      height={100}
                      unoptimized={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animation Modal */}
      {showAnimation && (
        <AnimationModal
          isOpen={showAnimation}
          onClose={() => setShowAnimation(false)}
          url={nfts[currentIndex].content.links?.animation_url || ""}
        />
      )}
    </div>
  );
};

export default NFTModal;
