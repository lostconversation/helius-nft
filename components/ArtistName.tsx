import React from "react";
import { getDisplayName, isDripArtist } from "@/utils/loadNFTs";
import Image from "next/image";

interface ArtistNameProps {
  creatorId: string;
  className?: string;
}

const ArtistName: React.FC<ArtistNameProps> = ({
  creatorId,
  className = "",
}) => {
  const displayName = getDisplayName(creatorId);
  const isDrip = isDripArtist(creatorId);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span>{displayName}</span>
      {isDrip && (
        <Image
          src="/drip_logo.svg"
          alt="Drip"
          width={48}
          height={48}
          className="inline-block"
        />
      )}
    </div>
  );
};

export default ArtistName;
