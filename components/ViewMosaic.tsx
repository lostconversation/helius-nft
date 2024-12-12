import React from "react";
import { NFTAsset } from "@/utils/helius";
import { NFTImage } from "@/components/NFTImage";

interface ViewMosaicProps {
  nfts: { [symbol: string]: NFTAsset[] };
  openModal: (nfts: NFTAsset[]) => void;
}

const ViewMosaic: React.FC<ViewMosaicProps> = ({ nfts, openModal }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Object.entries(nfts).map(([creator, creatorNFTs]) => (
        <div
          key={creator}
          className="bg-gray-800 rounded-xl shadow-md p-6"
          onClick={() => openModal(creatorNFTs)}
        >
          <h2 className="text-xl font-semibold text-gray-300">{creator}</h2>
          <p className="text-gray-500">{creatorNFTs.length} NFTs</p>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="bg-gray-700 rounded-lg p-4 w-full">
              <NFTImage
                src={
                  creatorNFTs[0].content.links?.image ||
                  creatorNFTs[0].content.metadata?.image ||
                  creatorNFTs[0].content.json_uri
                }
                alt={creatorNFTs[0].content.metadata.name || "NFT Image"}
                layoutMode="mosaic"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewMosaic;
