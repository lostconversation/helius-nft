import React, { useState, useEffect } from "react";

interface AnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const AnimationModal: React.FC<AnimationModalProps> = ({
  isOpen,
  onClose,
  url,
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        setIsShowing(true);
      });
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[60]"
      onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}
    >
      <div
        className={`absolute inset-0 bg-black/95 modal-background ${
          isShowing ? "show" : ""
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-900/90 ${
          isShowing ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          width: "auto",
          height: "auto",
          padding: "40px",
          transition: "all 0.3s ease-in-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex flex-col items-center ${
            isShowing ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-50 bg-gray-800/50 hover:bg-gray-700/50 px-2 py-1 rounded"
          >
            ×
          </button>

          <div className="flex items-center justify-center">
            <div
              className="flex items-center justify-center rounded-lg overflow-hidden w-full h-full"
              style={{
                minWidth: "50vw",
                minHeight: "50vh",
                maxWidth: "calc(100vw - 80px)",
                maxHeight: "calc(100vh - 80px)",
              }}
            >
              {/* Check if URL is a direct video file or embeddable */}
              {(() => {
                const isVideoFile = url.match(
                  /\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp|flv|wmv)$/i
                );
                const isVideoUrl =
                  url.includes("video") ||
                  url.includes("mp4") ||
                  url.includes("webm");

                console.log("🎬 Video URL:", url);
                console.log("🎬 Is video file:", isVideoFile);
                console.log("🎬 Is video URL:", isVideoUrl);

                // Use video tag for direct video files or URLs that look like videos
                if (isVideoFile || isVideoUrl) {
                  return (
                    <video
                      src={url}
                      className="rounded-lg w-full h-full object-contain"
                      style={{
                        width: "100%",
                        height: "100%",
                        minWidth: "50vw",
                        minHeight: "50vh",
                      }}
                      controls
                      autoPlay
                      muted
                      loop
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                } else {
                  // Use iframe for embeddable content
                  return (
                    <iframe
                      src={`${url}?autoplay=1`}
                      className="rounded-lg w-full h-full"
                      style={{
                        width: "100%",
                        height: "100%",
                        minWidth: "50vw",
                        minHeight: "50vh",
                      }}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationModal;
