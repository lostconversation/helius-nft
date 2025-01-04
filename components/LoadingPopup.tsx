import React from "react";

interface LoadingPopupProps {
  progress: number;
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center border border-gray-700">
        <h2 className="text-lg font-semibold mb-2 text-gray-200">
          Fetching NFTs...
        </h2>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-gray-300">{progress}%</p>
      </div>
    </div>
  );
};

export default LoadingPopup;
