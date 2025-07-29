import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/utils/loadNFTs";

interface NFTImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function NFTImage({
  src,
  alt,
  width = 300,
  height = 300,
}: NFTImageProps) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  const handleImageError = (error: any) => {
    console.error("🖼️ Image load error:", error);
    console.error("🖼️ Failed URL:", getImageUrl(src));

    // For Superteam URLs, try fallback to regular img tag
    if (src.includes("superteam-nft-membership.vercel.app") && !useFallback) {
      console.log("🖼️ Trying fallback for Superteam URL");
      setUseFallback(true);
      return;
    }

    setIsError(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleFallbackError = () => {
    console.error("🖼️ Fallback image also failed");
    setIsError(true);
  };

  const handleFallbackLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative h-64 mb-4 bg-gray-100 rounded-lg overflow-hidden">
      {!isError ? (
        useFallback ? (
          <img
            src={getImageUrl(src)}
            alt={alt}
            className="object-contain w-full h-full"
            onError={handleFallbackError}
            onLoad={handleFallbackLoad}
            crossOrigin="anonymous"
          />
        ) : (
          <Image
            src={getImageUrl(src)}
            alt={alt}
            width={width}
            height={height}
            className="object-contain w-full h-full"
            onError={handleImageError}
            onLoad={handleImageLoad}
            unoptimized={true}
          />
        )
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-200">
          <span className="text-gray-500">Failed to load image</span>
          <div className="text-xs text-gray-400 mt-2">
            CORS or redirect issue
          </div>
        </div>
      )}
      {isLoading && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
