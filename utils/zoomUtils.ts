import { ZoomLevel } from "@/types";

export const getZoomMultiplier = (zoomLevel: ZoomLevel): number => {
  switch (zoomLevel) {
    case "small":
      return 0.5;
    case "normal":
      return 1;
    case "big":
      return 1.5;
    case "mega":
      return 2;
  }
};

export const calculateSize = (
  baseSize: number,
  zoomLevel: ZoomLevel
): number => {
  return Math.round(baseSize * getZoomMultiplier(zoomLevel));
};
