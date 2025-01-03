import React, { useState, useEffect } from "react";
import Image from "next/image";
import { NFTAsset } from "@/utils/helius";
import { motion, AnimatePresence } from "framer-motion";

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfts: NFTAsset[];
  creator: string;
  initialPosition: { x: number; y: number; width: number; height: number };
}

const NFTModal: React.FC<NFTModalProps> = ({
  isOpen,
  onClose,
  nfts,
  creator,
  initialPosition,
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"img" | "data">("img");

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsShowing(true);
      });
    }
  }, [isOpen]);

  // Restore ESC key functionality
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 300);
  };

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
    <div className="fixed inset-0 z-50" onClick={handleClose}>
      <div
        className={`absolute inset-0 bg-black modal-background ${
          isShowing ? "show" : ""
        }`}
      />
      <div
        className={`absolute rounded-xl bg-gray-900/80 modal-expand ${
          isShowing ? "show" : ""
        }`}
        style={{
          left: initialPosition.x,
          top: initialPosition.y,
          width: isShowing ? "100%" : initialPosition.width,
          height: isShowing ? "100%" : initialPosition.height,
          transform: isShowing ? "none" : "translate(0, 0)",
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
          <div className="flex-1 w-full flex justify-center px-8">
            {viewMode === "img" ? (
              // Image view
              <div className="w-full h-[65vh] flex justify-center items-center">
                <Image
                  src={getImageSrc(currentIndex)}
                  alt={nfts[currentIndex].content.metadata.name || "NFT Image"}
                  className="w-auto h-full object-contain cursor-default"
                  width={1920}
                  height={1080}
                  unoptimized={true}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              // Data view
              <div className="w-full flex gap-8">
                {/* Left side - Image */}
                <div className="w-1/2 h-[65vh] flex justify-center items-center">
                  <Image
                    src={getImageSrc(currentIndex)}
                    alt={
                      nfts[currentIndex].content.metadata.name || "NFT Image"
                    }
                    className="w-auto h-full object-contain cursor-default"
                    width={1920}
                    height={1080}
                    unoptimized={true}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Right side - Metadata */}
                <div
                  className="w-1/2 h-[65vh] bg-gray-800/50 rounded-xl p-6 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4 text-gray-400">
                    <p className="text-sm">
                      <span className="font-semibold">Title:</span>{" "}
                      {nfts[currentIndex].content.metadata.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Description:</span>{" "}
                      {nfts[currentIndex].content.metadata.description}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Attributes:</span>{" "}
                      {JSON.stringify(
                        nfts[currentIndex].content.metadata.attributes
                      )}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Links:</span>{" "}
                      {nfts[currentIndex].content.links?.external_url}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">ID:</span>{" "}
                      {nfts[currentIndex].id}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">UpdateAuthority:</span>{" "}
                      {nfts[currentIndex].updateAuthority}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">isMutable:</span>{" "}
                      {nfts[currentIndex].mutable ? "Yes" : "No"}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">cNFT:</span>{" "}
                      {nfts[currentIndex].compression?.compressed
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls at top right */}
          <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
            <div className="bg-gray-800 rounded-full flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode("img");
                }}
                className={`px-4 py-1 rounded-full transition-colors ${
                  viewMode === "img"
                    ? "bg-blue-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                img
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode("data");
                }}
                className={`px-4 py-1 rounded-full transition-colors ${
                  viewMode === "data"
                    ? "bg-blue-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                data
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-white hover:text-gray-300 text-6xl"
            >
              ×
            </button>
          </div>

          {/* Thumbnails at bottom */}
          {nfts.length > 1 && (
            <div className="w-full flex justify-center mb-8 mt-4">
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
    </div>
  );
};

export default NFTModal;
