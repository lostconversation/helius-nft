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

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll when modal is open
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        setIsShowing(true);
      });
    }
    return () => {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 400); // Increased animation duration
  };

  if (!isOpen) return null;

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
          <div className="flex-1 w-full relative">
            {/* Centered Image and Title */}
            <div className="w-full flex flex-col items-center">
              <div className="h-[65vh] flex justify-center items-center">
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
              {/* Title under image */}
              <div
                className="text-center text-white mt-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold">
                  {nfts[currentIndex].content.metadata.name}
                </h3>
              </div>
            </div>

            {/* Floating metadata sidebar */}
            <div
              className="absolute top-0 right-8 w-72 h-[65vh] bg-gray-800/30 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top half - Formatted metadata */}
              <div className="h-1/2 p-4 overflow-y-auto border-b border-gray-700/50">
                <div className="space-y-4 text-gray-400">
                  <p className="text-sm">
                    <span className="font-semibold">Description:</span>
                    <br />
                    {nfts[currentIndex].content.metadata.description}
                  </p>
                  <div>
                    <span className="font-semibold">Attributes:</span>
                    <br />
                    <span className="text-xs">
                      {JSON.stringify(
                        nfts[currentIndex].content.metadata.attributes,
                        null,
                        2
                      )}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">Links:</span>
                    <br />
                    {nfts[currentIndex].content.links?.external_url}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">ID:</span>
                    <br />
                    {nfts[currentIndex].id}
                  </p>
                </div>
              </div>

              {/* Bottom half - Raw metadata */}
              <div className="h-1/2 p-4 overflow-y-auto bg-gray-800/40">
                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(nfts[currentIndex].content.metadata, null, 2)}
                </pre>
              </div>
            </div>
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
    </div>
  );
};

export default NFTModal;
