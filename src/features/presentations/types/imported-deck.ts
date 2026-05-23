export type ImportedDeckAnimation = "none" | "pop-up";

export type ImportedDeckFontPreset = "times" | "sans" | "cursive";

export type ImportedDeckShape =
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
      animation?: ImportedDeckAnimation;
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
      animation?: ImportedDeckAnimation;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      text: string;
      textIndex: number;
      color: string;
      fontFamily: string;
      fontSize: number;
      lineHeight: number;
      align: string;
      fontWeight: number;
      opacity: number;
      fontPreset?: ImportedDeckFontPreset;
      animation?: ImportedDeckAnimation;
    };

export type ImportedDeckSlide = {
  id: string;
  title: string;
  shapes: ImportedDeckShape[];
};

export type ImportedDeck = {
  id?: string;
  title: string;
  source: string;
  width: number;
  height: number;
  slides: ImportedDeckSlide[];
};
