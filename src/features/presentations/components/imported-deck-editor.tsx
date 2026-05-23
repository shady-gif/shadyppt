"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  Layers3,
  Loader2,
  MousePointer2,
  Sparkles,
  Type,
} from "lucide-react";

import rawArcheDeck from "@/features/presentations/data/arche-deck.json";
import { exportImportedDeckToPptx } from "@/features/presentations/lib/export-imported-deck-pptx";
import type {
  ImportedDeck,
  ImportedDeckAnimation,
  ImportedDeckFontPreset,
  ImportedDeckShape,
} from "@/features/presentations/types/imported-deck";

const archeDeck = rawArcheDeck as ImportedDeck;

const fontStacks: Record<string, string> = {
  "Cormorant Garamond Light":
    '"Cormorant Garamond", "Times New Roman", serif',
  "Cormorant Garamond": '"Cormorant Garamond", "Times New Roman", serif',
  Cinzel: '"Cinzel", Georgia, serif',
  "Cinzel Bold": '"Cinzel", Georgia, serif',
  Garet: '"Avenir Next", Avenir, Montserrat, Arial, sans-serif',
  "Garet Italics": '"Avenir Next", Avenir, Montserrat, Arial, sans-serif',
  times: '"Times New Roman", Times, Georgia, serif',
  sans: 'Inter, "Avenir Next", Avenir, Arial, sans-serif',
  cursive: '"Brush Script MT", "Snell Roundhand", "Segoe Script", cursive',
};

const fontPresets: {
  value: ImportedDeckFontPreset;
  label: string;
  className: string;
}[] = [
  {
    value: "times",
    label: "Times Roman",
    className: 'font-[family-name:"Times_New_Roman",Times,serif]',
  },
  {
    value: "sans",
    label: "Sans Serif",
    className: "font-sans",
  },
  {
    value: "cursive",
    label: "Cursive",
    className: 'font-[family-name:"Brush_Script_MT","Snell_Roundhand",cursive]',
  },
];

const animationOptions: {
  value: ImportedDeckAnimation;
  label: string;
}[] = [
  { value: "none", label: "None" },
  { value: "pop-up", label: "Pop-up" },
];

function toTextAlign(align: string) {
  if (align === "ctr") {
    return "center";
  }

  if (align === "r") {
    return "right";
  }

  if (align === "just") {
    return "justify";
  }

  return "left";
}

type SlideCanvasProps = {
  slideIndex: number;
  shapes: ImportedDeckShape[];
  selectedShapeId?: string;
  isThumbnail?: boolean;
  onSelectShape?: (shapeId: string) => void;
  onUpdateText?: (shapeId: string, text: string) => void;
};

function SlideCanvas({
  slideIndex,
  shapes,
  selectedShapeId,
  isThumbnail = false,
  onSelectShape,
  onUpdateText,
}: SlideCanvasProps) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden bg-[#ddd9d0] shadow-2xl shadow-black/25 [container-type:inline-size]"
      aria-label={`Slide ${slideIndex + 1}`}
      aria-hidden={isThumbnail}
    >
      {shapes.map((shape) => {
        const isSelected = shape.id === selectedShapeId;
        const hasPopUp = shape.animation === "pop-up" && !isThumbnail;
        const commonStyle = {
          left: `${shape.x}%`,
          top: `${shape.y}%`,
          width: `${shape.w}%`,
          height: `${shape.h}%`,
          opacity: shape.opacity,
          transform: `rotate(${shape.rotation}deg)`,
        };

        if (shape.type === "image") {
          const ShapeElement = isThumbnail ? "div" : "button";

          return (
            <ShapeElement
              key={shape.id}
              {...(!isThumbnail ? { type: "button" } : {})}
              aria-label="Slide image"
              className={`absolute block overflow-hidden ${
                isSelected ? "ring-2 ring-white" : ""
              }`}
              style={commonStyle}
              onClick={() => onSelectShape?.(shape.id)}
            >
              <span
                className={`absolute inset-0 block ${
                  hasPopUp ? "animate-[deck-pop-up_700ms_ease-out_both]" : ""
                }`}
              >
                <Image
                  src={shape.src}
                  alt=""
                  fill
                  sizes={isThumbnail ? "220px" : "90vw"}
                  className="object-cover"
                  draggable={false}
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  unoptimized={shape.src.endsWith(".svg")}
                />
              </span>
            </ShapeElement>
          );
        }

        if (shape.type === "shape") {
          const ShapeElement = isThumbnail ? "div" : "button";

          return (
            <ShapeElement
              key={shape.id}
              {...(!isThumbnail ? { type: "button" } : {})}
              aria-label="Design shape"
              className={`absolute block ${
                isSelected ? "ring-2 ring-white" : ""
              }`}
              style={{ ...commonStyle, backgroundColor: shape.fill }}
              onClick={() => onSelectShape?.(shape.id)}
            />
          );
        }

        return (
          <div
            key={shape.id}
            className={`absolute whitespace-pre-wrap break-words outline-none ${
              isSelected && !isThumbnail
                ? "ring-1 ring-white/80 ring-offset-2 ring-offset-transparent"
                : ""
            }`}
            style={{
              ...commonStyle,
              color: shape.color,
              fontFamily:
                fontStacks[shape.fontPreset ?? shape.fontFamily] ??
                fontStacks.Garet,
              fontSize: `${(shape.fontSize / 1280) * 100}cqw`,
              fontStyle: shape.fontFamily.includes("Italics")
                ? "italic"
                : "normal",
              fontWeight: shape.fontWeight,
              lineHeight: shape.lineHeight,
              textAlign: toTextAlign(shape.align),
            }}
            contentEditable={!isThumbnail}
            suppressContentEditableWarning
            onClick={() => onSelectShape?.(shape.id)}
            onBlur={(event) =>
              onUpdateText?.(shape.id, event.currentTarget.innerText)
            }
          >
            <span
              className={`block ${
                hasPopUp ? "animate-[deck-pop-up_700ms_ease-out_both]" : ""
              }`}
            >
              {shape.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type ImportedDeckEditorProps = {
  deck?: ImportedDeck;
  backHref?: string;
};

export function ImportedDeckEditor({
  deck = archeDeck,
  backHref = "/",
}: ImportedDeckEditorProps) {
  const [slides, setSlides] = useState(deck.slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedShapeId, setSelectedShapeId] = useState<string>();
  const [isExporting, setIsExporting] = useState(false);

  const activeSlide = slides[activeSlideIndex];
  const selectedTextShape = useMemo(
    () =>
      activeSlide.shapes.find(
        (shape) => shape.id === selectedShapeId && shape.type === "text",
      ),
    [activeSlide.shapes, selectedShapeId],
  );
  const selectedShape = useMemo(
    () => activeSlide.shapes.find((shape) => shape.id === selectedShapeId),
    [activeSlide.shapes, selectedShapeId],
  );

  function updateText(shapeId: string, text: string) {
    setSlides((currentSlides) =>
      currentSlides.map((slide, index) =>
        index === activeSlideIndex
          ? {
              ...slide,
              shapes: slide.shapes.map((shape) =>
                shape.id === shapeId && shape.type === "text"
                  ? { ...shape, text }
                  : shape,
              ),
            }
          : slide,
      ),
    );
  }

  function updateSelectedShape(nextShape: ImportedDeckShape) {
    setSlides((currentSlides) =>
      currentSlides.map((slide, index) =>
        index === activeSlideIndex
          ? {
              ...slide,
              shapes: slide.shapes.map((shape) =>
                shape.id === nextShape.id ? nextShape : shape,
              ),
            }
          : slide,
      ),
    );
  }

  function updateSelectedTextFont(fontPreset: ImportedDeckFontPreset) {
    if (!selectedTextShape || selectedTextShape.type !== "text") {
      return;
    }

    updateSelectedShape({
      ...selectedTextShape,
      fontPreset,
      fontFamily: fontPreset,
    });
  }

  function updateSelectedAnimation(animation: ImportedDeckAnimation) {
    if (!selectedShape) {
      return;
    }

    updateSelectedShape({
      ...selectedShape,
      animation,
    } as ImportedDeckShape);
  }

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      await exportImportedDeckToPptx({
        ...deck,
        slides,
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="h-screen bg-[#11100e] text-white">
      <div className="flex h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Back home"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                Imported editable deck
              </p>
              <h1 className="text-base font-medium">{deck.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {isExporting ? "Exporting..." : "Export PPTX"}
            </button>

            <Link
              href="/builder"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 text-sm font-medium text-white/78 transition hover:bg-white/12 hover:text-white"
            >
              <Layers3 className="size-4" />
              Builder
            </Link>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:grid-rows-1">
          <aside className="overflow-x-auto overflow-y-hidden border-b border-white/10 bg-black/18 p-4 lg:overflow-x-hidden lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
              <FileText className="size-4" />
              Slides
            </div>

            <div className="flex gap-3 lg:block lg:space-y-3">
              {slides.map((slide, index) => {
                const isActive = index === activeSlideIndex;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    className={`w-52 shrink-0 rounded-lg border p-2 text-left transition lg:w-full ${
                      isActive
                        ? "border-white/35 bg-white/10"
                        : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                    }`}
                    onClick={() => {
                      setActiveSlideIndex(index);
                      setSelectedShapeId(undefined);
                    }}
                  >
                    <SlideCanvas
                      slideIndex={index}
                      shapes={slide.shapes}
                      isThumbnail
                    />
                    <p className="mt-2 text-xs font-medium text-white/60">
                      Slide {index + 1}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-h-0 items-center justify-center overflow-auto bg-[#1a1917] p-4 lg:p-8">
            <div className="w-full max-w-[min(100%,calc((100vh-9rem)*16/9))]">
              <div className="mb-3 flex items-center justify-between text-xs text-white/45">
                <span>16:9 canvas</span>
                <span>{activeSlide.title || `Slide ${activeSlideIndex + 1}`}</span>
              </div>
              <SlideCanvas
                slideIndex={activeSlideIndex}
                shapes={activeSlide.shapes}
                selectedShapeId={selectedShapeId}
                onSelectShape={setSelectedShapeId}
                onUpdateText={updateText}
              />
            </div>
          </section>

          <aside className="max-h-72 overflow-y-auto border-t border-white/10 bg-black/18 p-4 lg:max-h-none lg:border-l lg:border-t-0">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
              <MousePointer2 className="size-4" />
              Selection
            </div>

            <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
              {selectedShape ? (
                <div className="flex items-center gap-2 text-sm text-white/64">
                  {selectedShape.type === "text" ? (
                    <Type className="size-4" />
                  ) : selectedShape.type === "image" ? (
                    <ImageIcon className="size-4" />
                  ) : (
                    <Layers3 className="size-4" />
                  )}
                  <span>
                    {selectedShape.type === "text"
                      ? "Text layer"
                      : selectedShape.type === "image"
                        ? "Image layer"
                        : "Shape layer"}
                  </span>
                </div>
              ) : null}

              {selectedTextShape && selectedTextShape.type === "text" ? (
                <div className="space-y-4">
                  <label
                    htmlFor="selected-text"
                    className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35"
                  >
                    Text
                  </label>
                  <textarea
                    id="selected-text"
                    value={selectedTextShape.text}
                    onChange={(event) =>
                      updateText(selectedTextShape.id, event.target.value)
                    }
                    className="min-h-56 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none transition focus:border-white/30"
                  />

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
                      <Type className="size-3.5" />
                      Font
                    </div>
                    <div className="grid gap-2">
                      {fontPresets.map((font) => {
                        const isSelected =
                          (selectedTextShape.fontPreset ??
                            selectedTextShape.fontFamily) === font.value;

                        return (
                          <button
                            key={font.value}
                            type="button"
                            onClick={() => updateSelectedTextFont(font.value)}
                            className={`flex h-10 items-center justify-between rounded-lg border px-3 text-sm transition ${
                              isSelected
                                ? "border-white/35 bg-white/15 text-white"
                                : "border-white/10 bg-black/20 text-white/62 hover:bg-white/8 hover:text-white"
                            }`}
                          >
                            <span className={font.className}>{font.label}</span>
                            {isSelected ? (
                              <span className="text-xs text-white/45">
                                Active
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-6 text-white/45">
                  Select a text layer to edit copy and fonts, or select a text
                  or image layer to add animation.
                </p>
              )}

              {selectedShape &&
              (selectedShape.type === "text" || selectedShape.type === "image") ? (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
                    <Sparkles className="size-3.5" />
                    Animation
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {animationOptions.map((option) => {
                      const isSelected =
                        (selectedShape.animation ?? "none") === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateSelectedAnimation(option.value)}
                          className={`h-10 rounded-lg border px-3 text-sm transition ${
                            isSelected
                              ? "border-white/35 bg-white/15 text-white"
                              : "border-white/10 bg-black/20 text-white/62 hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/38">
                    Pop-up previews on the canvas for the selected layer.
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
