import React from "react";

interface LoadingPopupProps {
  progress: number;
  message?: string;
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ progress, message }) => {
  const getMessage = () => {
    if (message) return message;

    if (progress < 20) return "Fetching NFTs...";
    if (progress < 30) return "Loading Drip NFTs...";
    if (progress < 40) return "Loading @ NFTs...";
    if (progress < 50) return "Loading Drip NFTs...";
    if (progress < 60) return "Scanning for Legit Artists...";
    if (progress < 80) return "Scanning for Spam...";
    if (progress < 90) return "Scanning for ???...";
    return "Finalizing...";
  };

  const getSubMessage = () => {
    if (progress < 20) return "Downloading NFT data from blockchain...";
    if (progress < 50) return "Quick scan of OG tags (Drip, @)...";
    if (progress < 90) return "Deep scan of custom artist rules...";
    return "Organizing results...";
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center max-w-md">
        <h2 className="text-lg font-semibold mb-2 text-white">
          {getMessage()}
        </h2>
        <p className="text-sm text-gray-300 mb-4">{getSubMessage()}</p>
        <div className="w-full bg-gray-600 rounded-full h-4 mb-2">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white font-mono">{progress}%</p>
      </div>
    </div>
  );
};

export default LoadingPopup;
