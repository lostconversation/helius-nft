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
    <div className="fixed inset-0 z-[60]" onClick={handleClose}>
      <div
        className={`absolute inset-0 bg-black modal-background ${
          isShowing ? "show" : ""
        }`}
      />
      <div
        className={`absolute inset-4 rounded-xl bg-gray-900/80 modal-expand ${
          isShowing ? "show" : ""
        }`}
      >
        <div
          className={`w-full h-full flex flex-col items-center ${
            isShowing ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-6xl z-50"
          >
            ×
          </button>

          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="w-[90%] h-[90%] flex items-center justify-center">
              <iframe
                src={`${url}?autoplay=1`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationModal;
