import type { SlideLayout } from "@/features/presentations/types/presentation";

export const PRESENTATION_TEMPLATE = {
  name: "DeckForge Premium",
  brandLabel: "DeckForge",

  slide: {
    width: 13.333,
    height: 7.5,
    aspectRatio: "16 / 9",
  },

  colors: {
    background: "#111111",
    backgroundDeep: "#0f172a",
    foreground: "#ffffff",
    mutedForeground: "rgba(255, 255, 255, 0.58)",
    subtleForeground: "rgba(255, 255, 255, 0.35)",
    border: "rgba(255, 255, 255, 0.10)",
    accent: "rgba(255, 255, 255, 0.30)",
  },

  hero: {
    eyebrow: "Investor update · Q1 2026",
    metrics: [
      { label: "Revenue growth", value: "+42%" },
      { label: "ARR", value: "$2.4M" },
      { label: "Net retention", value: "128%" },
    ],
    chartBadge: "+42% QoQ",
  },

  editorial: {
    backgroundImage: "/slides/editorial-interior.png",
    headerLeft: "interior brand",
    headerCenter: "2030",
    headerRight: "presentation",
    footer: "INTERIOR DESIGN",
  },

  preview: {
    background:
      "linear-gradient(135deg, #111111, #1c1c1f 48%, #0f172a)",
    paddingClassName: "p-12",
    radiusClassName: "rounded-2xl",
  },

  layouts: {
    title: {
      label: "Title",
      titleClassName: "mx-auto max-w-3xl text-center text-6xl",
      bodyClassName: "mx-auto max-w-2xl text-center text-xl",
      centered: true,
      showBody: true,
      showBrand: false,
    },
    content: {
      label: "Content",
      titleClassName: "max-w-2xl text-5xl",
      bodyClassName: "max-w-xl text-lg",
      centered: false,
      showBody: true,
      showBrand: true,
    },
    section: {
      label: "Section",
      titleClassName: "mx-auto max-w-2xl text-center text-5xl",
      bodyClassName: "mx-auto max-w-xl text-center text-base",
      centered: true,
      showBody: false,
      showBrand: false,
    },
    hero: {
      label: "Hero Pro",
      titleClassName: "text-4xl font-bold leading-[1.08] tracking-tight",
      bodyClassName: "text-base leading-relaxed",
      centered: false,
      showBody: true,
      showBrand: false,
    },
    editorial: {
      label: "Editorial Split",
      titleClassName: "font-[family-name:var(--font-editorial)] text-7xl tracking-[0.08em]",
      bodyClassName: "text-[11px] leading-relaxed text-justify",
      centered: true,
      showBody: true,
      showBrand: false,
    },
  } satisfies Record<
    SlideLayout,
    {
      label: string;
      titleClassName: string;
      bodyClassName: string;
      centered: boolean;
      showBody: boolean;
      showBrand: boolean;
    }
  >,
} as const;