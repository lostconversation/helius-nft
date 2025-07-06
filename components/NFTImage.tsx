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

  return (
    <div className="relative h-64 mb-4 bg-gray-100 rounded-lg overflow-hidden">
      {!isError ? (
        <Image
          src={getImageUrl(src)}
          alt={alt}
          width={width}
          height={height}
          className="object-contain w-full h-full"
          onError={() => setIsError(true)}
          onLoad={() => setIsLoading(false)}
          unoptimized={true}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-200">
          <span className="text-gray-500">Failed to load image</span>
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
