export type MvpTextAnimation = "none" | "jiggle" | "pop-up";

export type MvpFontPreset = "sans" | "times";

export type MvpPptShape =
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      text: string;
      color: string;
      fontSize: number;
      fontPreset: MvpFontPreset;
      lineHeight: number;
      align: string;
      fontWeight: number;
      opacity: number;
      animation: MvpTextAnimation;
    }
  | {
      id: string;
      type: "image";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      src: string;
      opacity: number;
      radius?: "full";
    }
  | {
      id: string;
      type: "shape";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      fill: string;
      opacity: number;
      radius?: "full";
    }
  | {
      id: string;
      type: "line";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      stroke: string;
      strokeWidth: number;
      opacity: number;
      flipH: boolean;
      flipV: boolean;
    };

export type MvpPptSlide = {
  id: string;
  title: string;
  shapes: MvpPptShape[];
};

export type MvpPptDeck = {
  title: string;
  width: number;
  height: number;
  sourceBuffer: ArrayBuffer;
  slides: MvpPptSlide[];
};
