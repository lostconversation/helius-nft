import { NFTAsset } from "@/utils/helius";
import { useState } from "react";
import AnimationModal from "./AnimationModal";

interface NFTMetadataProps {
  nft: NFTAsset;
}

const NFTMetadata: React.FC<NFTMetadataProps> = ({ nft }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const solscanUrl = `https://solscan.io/token/${nft.id}`;
  const dripHausUrl = nft.content.links?.external_url;
  const animationUrl = nft.content.links?.animation_url;
  const description = nft.content.metadata.description;
  const attributes = nft.content.metadata.attributes || [];

  return (
    <>
      <div className="text-gray-600 space-y-8 text-xl">
        {/* Description */}
        {description && (
          <div>
            <span className="font-semibold text-gray-500 text-xl">
              Description:
            </span>
            <p className="mt-2 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Attributes/Traits */}
        {attributes.length > 0 && (
          <div>
            <span className="font-semibold text-gray-500 text-xl">
              Attributes:
            </span>
            <ul className="mt-2 space-y-2">
              {attributes.map((attr, index) => (
                <li key={index} className="text-xl">
                  {attr?.trait_type || attr?.traitType ? (
                    <span>
                      <span className="font-medium">
                        {attr.trait_type || attr.traitType}:
                      </span>{" "}
                      {attr.value}
                    </span>
                  ) : (
                    <span className="font-medium">
                      Unknown Trait: {attr.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        <div>
          <span className="font-semibold text-gray-500 text-xl">Links:</span>
          <div className="mt-2 space-y-2">
            {dripHausUrl && (
              <a
                href={dripHausUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 block"
              >
                {dripHausUrl}
              </a>
            )}
            <a
              href={solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 block"
            >
              View on Solscan
            </a>
            {animationUrl && (
              <button
                onClick={() => setShowAnimation(true)}
                className="text-blue-500 hover:text-blue-400 block"
              >
                View Animation
              </button>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-gray-500 text-xl">ID:</span>{" "}
            <span className="break-all">{nft.id}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-500 text-xl">
              Update Authority:
            </span>{" "}
            <span className="break-all">
              {nft.authorities?.[0]?.address || "Unknown"}
            </span>
          </p>
          <p>
            <span className="font-semibold text-gray-500 text-xl">
              Is Mutable:
            </span>{" "}
            {nft.mutable ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-semibold text-gray-500 text-xl">cNFT:</span>{" "}
            {nft.compression?.compressed ? "Yes" : "No"}
          </p>
        </div>

        {/* Raw Data Toggle */}
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="text-blue-500 hover:text-blue-400 text-base font-medium"
        >
          {showRawData ? "Hide Raw Data" : "Show Raw Data"}
        </button>

        {/* Raw Data Display */}
        {showRawData && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg overflow-auto">
            <h3 className="font-bold mb-2 text-gray-400 text-lg">
              Raw NFT Data:
            </h3>
            <pre className="text-sm font-mono whitespace-pre-wrap break-all text-gray-400">
              {JSON.stringify(
                {
                  id: nft.id,
                  content: {
                    metadata: nft.content.metadata,
                    links: nft.content.links,
                    json_uri: nft.content.json_uri,
                  },
                  authorities: nft.authorities,
                  collection: nft.collection,
                  mutable: nft.mutable,
                  compression: nft.compression,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Render AnimationModal only when it's actually showing */}
      {showAnimation && (
        <AnimationModal
          isOpen={showAnimation}
          onClose={() => setShowAnimation(false)}
          url={animationUrl!}
        />
      )}
    </>
  );
};

export default NFTMetadata;
