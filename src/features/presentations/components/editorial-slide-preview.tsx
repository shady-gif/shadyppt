import Image from "next/image";

import { PRESENTATION_TEMPLATE } from "@/features/presentations/lib/template";
import type { PresentationSlide } from "@/features/presentations/types/presentation";

type EditorialSlidePreviewProps = {
  slide: PresentationSlide;
};

export function EditorialSlidePreview({ slide }: EditorialSlidePreviewProps) {
  const { editorial } = PRESENTATION_TEMPLATE;

  return (
    <div
      className={`relative aspect-video overflow-hidden ${PRESENTATION_TEMPLATE.preview.radiusClassName} border border-white/10 shadow-2xl shadow-black/50`}
    >
      <Image
        src={editorial.backgroundImage}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1200px) 100vw, 900px"
      />

      <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-black/88 via-black/72 to-black/10" />

      <header className="absolute inset-x-0 top-0 z-10 grid grid-cols-3 items-start px-8 pt-7 text-[10px] font-normal uppercase tracking-[0.22em] text-white/92">
        <span>{editorial.headerLeft}</span>
        <span className="text-center">{editorial.headerCenter}</span>
        <span className="text-right">{editorial.headerRight}</span>
      </header>

      <div className="absolute inset-y-0 left-0 z-10 flex w-[52%] flex-col justify-between px-9 pb-8 pt-20">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="font-[family-name:var(--font-editorial)] text-[4.25rem] font-normal leading-none tracking-[0.1em] text-white">
            {slide.title || "ARCHE"}
          </h2>

          <p className="mt-8 max-w-[17rem] text-justify text-[10.5px] font-light leading-[1.65] tracking-[0.01em] text-white/88">
            {slide.body ||
              "The art of transforming spaces goes beyond aesthetics; it creates inspiring environments."}
          </p>
        </div>

        <p className="text-center text-[9px] font-normal uppercase tracking-[0.32em] text-white/90">
          {editorial.footer}
        </p>
      </div>
    </div>
  );
}
