"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImagePlus, Move, Scan } from "lucide-react";

import { usePointerGesture } from "@/components/marketing/luxury-editorial-section/use-pointer-gesture";
import type {
  EditorialImageId,
  EditorialImageState,
} from "@/stores/luxury-editorial-store";
import { useLuxuryEditorialStore } from "@/stores/luxury-editorial-store";
import { cn } from "@/lib/utils";

type ResizableImageFrameProps = {
  imageId: EditorialImageId;
  label: string;
  image: EditorialImageState;
  zIndex: number;
  onChange: (patch: Partial<EditorialImageState>) => void;
  onReplace: (src: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseObjectPosition(position: string) {
  const [x = "50%", y = "50%"] = position.split(" ");
  return {
    x: Number.parseFloat(x),
    y: Number.parseFloat(y),
  };
}

export function ResizableImageFrame({
  imageId,
  label,
  image,
  zIndex,
  onChange,
  onReplace,
}: ResizableImageFrameProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveGesture = usePointerGesture({
    onMove: (deltaX, deltaY) => {
      const bounds = containerRef.current?.parentElement;
      const current = useLuxuryEditorialStore.getState().images[imageId];

      if (!bounds) {
        return;
      }

      const width = bounds.clientWidth;
      const height = bounds.clientHeight;

      onChange({
        x: clamp(current.x + (deltaX / width) * 100, -20, 80),
        y: clamp(current.y + (deltaY / height) * 100, -10, 85),
      });
    },
  });

  const resizeGesture = usePointerGesture({
    onMove: (deltaX, deltaY) => {
      const bounds = containerRef.current?.parentElement;
      const current = useLuxuryEditorialStore.getState().images[imageId];

      if (!bounds) {
        return;
      }

      const width = bounds.clientWidth;
      const height = bounds.clientHeight;

      onChange({
        width: clamp(current.width + (deltaX / width) * 100, 24, 95),
        height: clamp(current.height + (deltaY / height) * 100, 20, 95),
      });
    },
  });

  const panGesture = usePointerGesture({
    onMove: (deltaX, deltaY) => {
      const current = useLuxuryEditorialStore.getState().images[imageId];
      const { x, y } = parseObjectPosition(current.objectPosition);
      const bounds = containerRef.current;

      if (!bounds) {
        return;
      }

      const nextX = clamp(
        x - (deltaX / bounds.clientWidth) * 28,
        0,
        100,
      );
      const nextY = clamp(
        y - (deltaY / bounds.clientHeight) * 28,
        0,
        100,
      );

      onChange({
        objectPosition: `${nextX}% ${nextY}%`,
      });
    },
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onReplace(reader.result);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/image absolute touch-none select-none",
        "rounded-[1.1rem] shadow-[0_28px_60px_-24px_rgba(58,52,46,0.45)]",
        "ring-1 ring-[#e8e2d8]/80 transition-shadow duration-300 hover:shadow-[0_32px_70px_-22px_rgba(58,52,46,0.5)]",
      )}
      style={{
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.width}%`,
        height: `${image.height}%`,
        zIndex,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.1rem] bg-[#e7e1d8]">
        <Image
          src={image.src}
          alt=""
          fill
          className="pointer-events-none object-cover"
          style={{ objectPosition: image.objectPosition }}
          sizes="(max-width: 1024px) 80vw, 40vw"
          draggable={false}
          unoptimized={image.src.startsWith("data:")}
        />

        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          aria-label={`Reframe ${label} image`}
          {...panGesture}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3d3832]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/image:opacity-100" />
      </div>

      <div className="absolute -top-11 left-0 z-20 flex items-center gap-1 rounded-md border border-[#d8d2c8] bg-[#faf8f5]/95 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover/image:opacity-100 group-focus-within/image:opacity-100">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#6f6860] transition hover:bg-[#ede8e1]"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="size-3" />
          Replace
        </button>

        <span className="h-4 w-px bg-[#ddd6cc]" />

        <span className="inline-flex items-center gap-1 px-1.5 text-[10px] text-[#9a9288]">
          <Scan className="size-3" />
          Drag to reframe
        </span>
      </div>

      <button
        type="button"
        aria-label={`Move ${label} image`}
        className="absolute -left-3 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8d2c8] bg-[#faf8f5] text-[#6f6860] opacity-0 shadow-sm transition hover:bg-white group-hover/image:opacity-100"
        {...moveGesture}
      >
        <Move className="size-3.5" />
      </button>

      <div
        aria-label={`Resize ${label} image`}
        className="absolute right-1.5 bottom-1.5 z-20 size-4 cursor-se-resize rounded-sm border border-[#c8bfb2] bg-[#faf8f5] opacity-0 transition group-hover/image:opacity-100"
        {...resizeGesture}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
