"use client";

import { useState } from "react";
import { Loader2, Plus, Presentation, Settings2, Trash2 } from "lucide-react";

import type {
  PresentationDeck,
  PresentationSlide,
  SlideLayout,
} from "@/features/presentations/types/presentation";
import { SlidePreview } from "@/features/presentations/components/slide-preview";
import { exportDeckToPptx } from "@/features/presentations/lib/export-pptx";

type PresentationBuilderProps = {
  initialDeck: PresentationDeck;
};

const layoutOptions: Array<{
  value: SlideLayout;
  label: string;
  description: string;
}> = [
  {
    value: "hero",
    label: "Hero Pro",
    description: "Canva-style premium slide with chart & metrics",
  },
  {
    value: "editorial",
    label: "Editorial Split",
    description: "Full-bleed photo with dark left panel & serif title",
  },
  {
    value: "title",
    label: "Title",
    description: "Opening or big statement slide",
  },
  {
    value: "content",
    label: "Content",
    description: "Main title and supporting body",
  },
  {
    value: "section",
    label: "Section",
    description: "Divider for a new topic",
  },
];

function createBlankSlide(slideNumber: number): PresentationSlide {
  return {
    id: `slide-${crypto.randomUUID()}`,
    title: `Slide ${slideNumber}`,
    body: "",
    layout: "content",
  };
}

export function PresentationBuilder({ initialDeck }: PresentationBuilderProps) {
  const [deck, setDeck] = useState(initialDeck);
  const [activeSlideId, setActiveSlideId] = useState(initialDeck.slides[0].id);
  const [isExporting, setIsExporting] = useState(false);

  const activeSlide =
    deck.slides.find((slide) => slide.id === activeSlideId) ?? deck.slides[0];

  function updateActiveSlide(
    field: "title" | "body",
    value: string,
  ) {
    setDeck((currentDeck) => ({
      ...currentDeck,
      slides: currentDeck.slides.map((slide) =>
        slide.id === activeSlide.id
          ? {
              ...slide,
              [field]: value,
            }
          : slide,
      ),
    }));
  }

  function updateActiveSlideLayout(
    value: SlideLayout,
  ) {
    setDeck((currentDeck) => ({
      ...currentDeck,
      slides: currentDeck.slides.map((slide) =>
        slide.id === activeSlide.id
          ? {
              ...slide,
              layout: value,
            }
          : slide,
      ),
    }));
  }

  function deleteActiveSlide() {
    if (deck.slides.length === 1) {
      return;
    }

    const activeSlideIndex = deck.slides.findIndex(
      (slide) => slide.id === activeSlide.id,
    );

    const nextSlides = deck.slides.filter(
      (slide) => slide.id !== activeSlide.id,
    );
    const nextActiveSlide =
      nextSlides[Math.max(0, activeSlideIndex - 1)] ?? nextSlides[0];

    setDeck((currentDeck) => ({
      ...currentDeck,
      slides: nextSlides,
    }));

    setActiveSlideId(nextActiveSlide.id);
  }

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      await exportDeckToPptx(deck);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="min-w-0">
            <p className="text-sm text-white/45">DeckForge Builder</p>

            <input
              value={deck.title}
              onChange={(event) =>
                setDeck((currentDeck) => ({
                  ...currentDeck,
                  title: event.target.value,
                }))
              }
              className="mt-1 w-80 rounded-md border border-transparent bg-transparent px-0 text-base font-medium text-white outline-none transition placeholder:text-white/25 focus:border-white/10 focus:bg-white/[0.05] focus:px-2"
              placeholder="Untitled Presentation"
              aria-label="Deck title"
            />
          </div>

          <button
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting && <Loader2 className="size-4 animate-spin" />}
            {isExporting ? "Exporting..." : "Export PPTX"}
          </button>
        </header>

        <section className="grid flex-1 grid-cols-[360px_1fr_300px] overflow-hidden">
          <aside className="border-r border-white/10 bg-white/[0.025] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-white/70">Slides</div>

              <div className="flex items-center gap-2">
                <button
                  onClick={deleteActiveSlide}
                  disabled={deck.slides.length === 1}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Delete active slide"
                >
                  <Trash2 className="size-4" />
                </button>

                <button
                  onClick={() => {
                    const nextSlide = createBlankSlide(deck.slides.length + 1);

                    setDeck((currentDeck) => ({
                      ...currentDeck,
                      slides: [...currentDeck.slides, nextSlide],
                    }));

                    setActiveSlideId(nextSlide.id);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                  aria-label="Add slide"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="mb-5 space-y-2">
              {deck.slides.map((slide, index) => {
                const isActive = slide.id === activeSlide.id;

                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideId(slide.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-white/25 bg-white/10"
                        : "border-white/10 bg-black/25 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Slide {index + 1} · {slide.layout}
                    </p>
                    <p className="mt-2 truncate text-sm font-medium text-white">
                      {slide.title || "Untitled slide"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
              <div>
                <label
                  htmlFor="slide-title"
                  className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35"
                >
                  Slide title
                </label>

                <input
                  id="slide-title"
                  value={activeSlide.title}
                  onChange={(event) =>
                    updateActiveSlide("title", event.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-white/[0.08]"
                  placeholder="Enter slide title"
                />
              </div>

              <div>
                <label
                  htmlFor="slide-body"
                  className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35"
                >
                  Slide body
                </label>

                <textarea
                  id="slide-body"
                  value={activeSlide.body}
                  onChange={(event) =>
                    updateActiveSlide("body", event.target.value)
                  }
                  className="min-h-40 w-full resize-none rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-white/[0.08]"
                  placeholder="Paste slide content here"
                />
              </div>
            </div>
          </aside>

          <section className="flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
                <Presentation className="size-4" />
                Live preview
              </div>

              <SlidePreview slide={activeSlide} />
            </div>
          </section>

          <aside className="border-l border-white/10 bg-white/[0.025] p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
              <Settings2 className="size-4" />
              Template
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
              {layoutOptions.map((layout) => {
                const isActive = activeSlide.layout === layout.value;

                return (
                  <button
                    key={layout.value}
                    onClick={() => updateActiveSlideLayout(layout.value)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      isActive
                        ? "border-white/30 bg-white/12"
                        : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{layout.label}</p>
                      {isActive && (
                        <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs text-white/70">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      {layout.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
