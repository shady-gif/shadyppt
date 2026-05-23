import { TrendingUp } from "lucide-react";

import { PRESENTATION_TEMPLATE } from "@/features/presentations/lib/template";
import type { PresentationSlide } from "@/features/presentations/types/presentation";

type HeroSlidePreviewProps = {
  slide: PresentationSlide;
};

const chartHeights = [38, 62, 48, 78, 55, 88, 68];

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
  const { hero } = PRESENTATION_TEMPLATE;

  return (
    <div
      className={`relative aspect-video overflow-hidden ${PRESENTATION_TEMPLATE.preview.radiusClassName} border border-white/10 shadow-2xl shadow-violet-950/50`}
    >
      <div className="absolute inset-0 bg-[#07050f]" />

      <div className="absolute -left-16 top-8 size-72 rounded-full bg-violet-600/35 blur-3xl" />
      <div className="absolute -right-10 bottom-0 size-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute bottom-12 left-1/3 size-56 rounded-full bg-cyan-400/15 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[#120a24]/80 via-[#1a1038]/60 to-[#0d1a2e]/90" />

      <div className="relative flex h-full p-10">
        <div className="flex w-[58%] flex-col justify-between pr-6">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-sm">
              {hero.eyebrow}
            </span>

            <h2 className="mt-6 max-w-lg bg-gradient-to-br from-white via-white to-violet-200/90 bg-clip-text text-[2.35rem] font-bold leading-[1.08] tracking-tight text-transparent">
              {slide.title || "Untitled slide"}
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/62">
              {slide.body || "Slide content will appear here."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {hero.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 backdrop-blur-md"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                  {metric.label}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-white">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex w-[42%] items-center justify-center">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_24px_80px_-12px_rgba(124,58,237,0.45)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Performance
                </p>
                <p className="mt-0.5 text-sm font-medium text-white/80">
                  Quarterly revenue
                </p>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                <TrendingUp className="size-3.5" />
                {hero.chartBadge}
              </span>
            </div>

            <div className="flex h-36 items-end justify-between gap-2 px-1">
              {chartHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-fuchsia-400 opacity-90"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-between text-[10px] text-white/35">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
