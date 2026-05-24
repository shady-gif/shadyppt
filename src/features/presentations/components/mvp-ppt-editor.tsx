"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  FileUp,
  Loader2,
  MousePointer2,
  Sparkles,
  Type,
} from "lucide-react";

import { exportMvpPptx, parseMvpPptx } from "@/features/presentations/lib/mvp-pptx";
import type {
  MvpFontPreset,
  MvpPptDeck,
  MvpPptShape,
  MvpTextAnimation,
} from "@/features/presentations/types/mvp-pptx";

const fontOptions: { value: MvpFontPreset; label: string; className: string }[] = [
  { value: "sans", label: "Sans Serif", className: "font-sans" },
  {
    value: "times",
    label: "Times New Roman",
    className: 'font-[family-name:"Times_New_Roman",Times,serif]',
  },
];

const animationOptions: {
  value: MvpTextAnimation;
  label: string;
  className: string;
}[] = [
  { value: "none", label: "None", className: "" },
  { value: "jiggle", label: "Jiggle", className: "animate-[ppt-jiggle_520ms_ease-in-out_both]" },
  { value: "pop-up", label: "Pop-up", className: "animate-[ppt-pop-up_580ms_ease-out_both]" },
];

const fontStacks: Record<MvpFontPreset, string> = {
  sans: 'Inter, "Avenir Next", Avenir, Arial, sans-serif',
  times: '"Times New Roman", Times, Georgia, serif',
};

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
  shapes: MvpPptShape[];
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
      className="relative aspect-video w-full overflow-hidden bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] [container-type:inline-size]"
      aria-label={`Slide ${slideIndex + 1}`}
      aria-hidden={isThumbnail}
    >
      {shapes.map((shape) => {
        const isSelected = shape.id === selectedShapeId;
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
              className={`absolute block overflow-hidden ${
                isSelected ? "ring-2 ring-[#7c3aed]" : ""
              } ${shape.radius === "full" ? "rounded-full" : ""}`}
              style={commonStyle}
              onClick={() => onSelectShape?.(shape.id)}
              tabIndex={isThumbnail ? -1 : 0}
            >
              <Image
                src={shape.src}
                alt=""
                fill
                sizes={isThumbnail ? "160px" : "90vw"}
                className="object-cover"
                draggable={false}
                unoptimized
              />
            </ShapeElement>
          );
        }

        if (shape.type === "shape") {
          const ShapeElement = isThumbnail ? "div" : "button";

          return (
            <ShapeElement
              key={shape.id}
              {...(!isThumbnail ? { type: "button" } : {})}
              aria-label="Slide shape"
              className={`absolute block ${
                isSelected ? "ring-2 ring-[#7c3aed]" : ""
              } ${shape.radius === "full" ? "rounded-full" : ""}`}
              style={{ ...commonStyle, backgroundColor: shape.fill }}
              onClick={() => onSelectShape?.(shape.id)}
              tabIndex={isThumbnail ? -1 : 0}
            />
          );
        }

        if (shape.type === "line") {
          return (
            <svg
              key={shape.id}
              className={`pointer-events-none absolute overflow-visible ${
                isSelected ? "ring-2 ring-[#7c3aed]" : ""
              }`}
              style={commonStyle}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <line
                x1={shape.flipH ? 100 : 0}
                y1={shape.flipV ? 100 : 0}
                x2={shape.flipH ? 0 : 100}
                y2={shape.flipV ? 0 : 100}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          );
        }

        const animationClass =
          !isThumbnail
            ? animationOptions.find((option) => option.value === shape.animation)
                ?.className ?? ""
            : "";

        return (
          <div
            key={shape.id}
            className={`absolute whitespace-pre-wrap break-words outline-none transition ${
              isSelected && !isThumbnail
                ? "ring-2 ring-[#7c3aed] ring-offset-2 ring-offset-white"
                : ""
            } ${animationClass}`}
            style={{
              ...commonStyle,
              color: shape.color,
              fontFamily: fontStacks[shape.fontPreset],
              fontSize: `${(shape.fontSize / 1280) * 100}cqw`,
              fontWeight: shape.fontWeight,
              lineHeight: shape.lineHeight,
              textAlign: toTextAlign(shape.align),
            }}
            contentEditable={!isThumbnail}
            suppressContentEditableWarning
            role={isThumbnail ? undefined : "textbox"}
            tabIndex={isThumbnail ? -1 : 0}
            onFocus={() => onSelectShape?.(shape.id)}
            onClick={() => onSelectShape?.(shape.id)}
            onInput={(event) =>
              onUpdateText?.(shape.id, event.currentTarget.innerText)
            }
          >
            {shape.text}
          </div>
        );
      })}
    </div>
  );
}

export function MvpPptEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deck, setDeck] = useState<MvpPptDeck>();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedShapeId, setSelectedShapeId] = useState<string>();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>();

  const activeSlide = deck?.slides[activeSlideIndex];
  const selectedTextShape = useMemo(
    () =>
      activeSlide?.shapes.find(
        (shape): shape is Extract<MvpPptShape, { type: "text" }> =>
          shape.id === selectedShapeId && shape.type === "text",
      ),
    [activeSlide?.shapes, selectedShapeId],
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setError(undefined);

    try {
      const nextDeck = await parseMvpPptx(file);
      setDeck(nextDeck);
      setActiveSlideIndex(0);
      setSelectedShapeId(undefined);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not open that PPTX.",
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  function updateShape(shapeId: string, updater: (shape: MvpPptShape) => MvpPptShape) {
    setDeck((currentDeck) => {
      if (!currentDeck) {
        return currentDeck;
      }

      return {
        ...currentDeck,
        slides: currentDeck.slides.map((slide, slideIndex) =>
          slideIndex === activeSlideIndex
            ? {
                ...slide,
                shapes: slide.shapes.map((shape) =>
                  shape.id === shapeId ? updater(shape) : shape,
                ),
              }
            : slide,
        ),
      };
    });
  }

  function updateSelectedFont(fontPreset: MvpFontPreset) {
    if (!selectedTextShape) {
      return;
    }

    updateShape(selectedTextShape.id, (shape) =>
      shape.type === "text" ? { ...shape, fontPreset } : shape,
    );
  }

  function updateSelectedAnimation(animation: MvpTextAnimation) {
    if (!selectedTextShape) {
      return;
    }

    updateShape(selectedTextShape.id, (shape) =>
      shape.type === "text" ? { ...shape, animation } : shape,
    );
  }

  async function handleExport() {
    if (!deck || isExporting) {
      return;
    }

    setIsExporting(true);
    setError(undefined);

    try {
      await exportMvpPptx(deck);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not export this PPTX.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f8f7fb] text-[#111827]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
      />

      <div className="flex h-screen flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/8 bg-white/85 px-4 backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#111827] text-white">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                {deck?.title ?? "PPT Editor MVP"}
              </h1>
              <p className="truncate text-xs text-[#6b7280]">
                Upload, edit text, pick a font, add a tiny animation, export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-black/20"
            >
              {isImporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileUp className="size-4" />
              )}
              <span className="hidden sm:inline">
                {isImporting ? "Opening..." : "Upload PPT"}
              </span>
            </button>

            <select
              value={selectedTextShape?.fontPreset ?? "sans"}
              onChange={(event) =>
                updateSelectedFont(event.target.value as MvpFontPreset)
              }
              disabled={!selectedTextShape}
              className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Font"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>

            <select
              value={selectedTextShape?.animation ?? "none"}
              onChange={(event) =>
                updateSelectedAnimation(event.target.value as MvpTextAnimation)
              }
              disabled={!selectedTextShape}
              className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Animation"
            >
              {animationOptions.map((animation) => (
                <option key={animation.value} value={animation.value}>
                  {animation.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={!deck || isExporting}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#7c3aed] px-3 text-sm font-semibold text-white shadow-sm shadow-[#7c3aed]/20 transition hover:-translate-y-0.5 hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[112px_minmax(0,1fr)] overflow-hidden lg:grid-cols-[224px_minmax(0,1fr)] lg:grid-rows-1">
          <aside className="overflow-x-auto border-b border-black/8 bg-white/65 p-3 backdrop-blur-xl lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="flex gap-3 lg:block lg:space-y-3">
              {deck ? (
                deck.slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`w-40 shrink-0 rounded-lg border p-2 text-left transition lg:w-full ${
                      index === activeSlideIndex
                        ? "border-[#7c3aed]/45 bg-[#7c3aed]/8"
                        : "border-black/8 bg-white hover:border-black/14"
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
                    <p className="mt-2 text-xs font-medium text-[#6b7280]">
                      {slide.title}
                    </p>
                  </button>
                ))
              ) : (
                <div className="flex h-full min-h-20 items-center justify-center rounded-lg border border-dashed border-black/12 bg-white px-3 text-center text-xs text-[#6b7280] lg:min-h-64">
                  Slides appear here after upload.
                </div>
              )}
            </div>
          </aside>

          <section className="min-h-0 overflow-auto p-4 sm:p-6 lg:p-8">
            {deck && activeSlide ? (
              <div className="mx-auto w-full max-w-[min(100%,calc((100vh-8rem)*16/9))]">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[#6b7280]">
                  <div className="inline-flex items-center gap-2">
                    <MousePointer2 className="size-3.5" />
                    <span>
                      {selectedTextShape
                        ? "Click text and type directly"
                        : "Select a text box to edit"}
                    </span>
                  </div>
                  <span>{activeSlide.title}</span>
                </div>

                <SlideCanvas
                  slideIndex={activeSlideIndex}
                  shapes={activeSlide.shapes}
                  selectedShapeId={selectedShapeId}
                  onSelectShape={setSelectedShapeId}
                  onUpdateText={(shapeId, text) =>
                    updateShape(shapeId, (shape) =>
                      shape.type === "text" ? { ...shape, text } : shape,
                    )
                  }
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex w-full max-w-xl flex-col items-center rounded-lg border border-dashed border-black/12 bg-white px-6 py-12 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#7c3aed]/35 hover:shadow-xl hover:shadow-[#7c3aed]/10"
                >
                  <span className="mb-5 flex size-14 items-center justify-center rounded-lg bg-[#e9d5ff] text-[#6d28d9] transition group-hover:scale-105">
                    {isImporting ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <FileUp className="size-6" />
                    )}
                  </span>
                  <span className="text-lg font-semibold">Upload a PPTX</span>
                  <span className="mt-2 max-w-sm text-sm leading-6 text-[#6b7280]">
                    The editor will render slide thumbnails and editable text boxes
                    right in the browser.
                  </span>
                </button>
              </div>
            )}

            {error ? (
              <p className="mx-auto mt-4 max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mx-auto mt-4 flex max-w-[min(100%,calc((100vh-8rem)*16/9))] flex-wrap items-center gap-2 text-xs text-[#6b7280]">
              <Type className="size-3.5" />
              <span>
                Fonts are intentionally limited to Sans Serif and Times New Roman.
              </span>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
