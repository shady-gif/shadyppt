import { create } from "zustand";

export type EditorialImageId = "primary" | "secondary";

export type EditorialImageState = {
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  objectPosition: string;
};

export type EditorialTextBlock = {
  text: string;
  fontSize: number;
};

type LuxuryEditorialState = {
  heading: EditorialTextBlock;
  lead: EditorialTextBlock;
  bulletsLeft: string[];
  bulletsRight: string[];
  closing: EditorialTextBlock;
  brand: string;
  ctaLabel: string;
  images: Record<EditorialImageId, EditorialImageState>;
  updateHeading: (patch: Partial<EditorialTextBlock>) => void;
  updateLead: (patch: Partial<EditorialTextBlock>) => void;
  updateClosing: (patch: Partial<EditorialTextBlock>) => void;
  setBrand: (brand: string) => void;
  setCtaLabel: (ctaLabel: string) => void;
  setBullet: (column: "left" | "right", index: number, value: string) => void;
  updateImage: (
    id: EditorialImageId,
    patch: Partial<EditorialImageState>,
  ) => void;
  replaceImage: (id: EditorialImageId, src: string) => void;
};

const defaultImages: Record<EditorialImageId, EditorialImageState> = {
  primary: {
    src: "/slides/editorial-interior.png",
    width: 74,
    height: 92,
    x: 20,
    y: 4,
    objectPosition: "58% 42%",
  },
  secondary: {
    src: "/slides/editorial-interior.png",
    width: 56,
    height: 36,
    x: -6,
    y: 48,
    objectPosition: "72% 55%",
  },
};

export const useLuxuryEditorialStore = create<LuxuryEditorialState>((set) => ({
  heading: {
    text: "TIMELESS INTERIOR ELEGANCE",
    fontSize: 42,
  },
  lead: {
    text: "We shape serene residential environments where proportion, material honesty, and light create a calm sophistication that endures beyond trend.",
    fontSize: 15,
  },
  bulletsLeft: [
    "Bespoke spatial planning",
    "Curated natural materials",
    "Artisan collaboration",
  ],
  bulletsRight: [
    "Lighting & atmosphere design",
    "Furniture curation",
    "End-to-end project stewardship",
  ],
  closing: {
    text: "Every residence is composed as a quiet narrative—balancing warmth and restraint, function and beauty, for clients who value understated luxury.",
    fontSize: 14,
  },
  brand: "ARCHE STUDIO",
  ctaLabel: "VIEW",
  images: defaultImages,

  updateHeading: (patch) =>
    set((state) => ({ heading: { ...state.heading, ...patch } })),

  updateLead: (patch) =>
    set((state) => ({ lead: { ...state.lead, ...patch } })),

  updateClosing: (patch) =>
    set((state) => ({ closing: { ...state.closing, ...patch } })),

  setBrand: (brand) => set({ brand }),
  setCtaLabel: (ctaLabel) => set({ ctaLabel }),

  setBullet: (column, index, value) =>
    set((state) => {
      const key = column === "left" ? "bulletsLeft" : "bulletsRight";
      const bullets = [...state[key]];
      bullets[index] = value;
      return { [key]: bullets };
    }),

  updateImage: (id, patch) =>
    set((state) => ({
      images: {
        ...state.images,
        [id]: { ...state.images[id], ...patch },
      },
    })),

  replaceImage: (id, src) =>
    set((state) => ({
      images: {
        ...state.images,
        [id]: { ...state.images[id], src },
      },
    })),
}));
