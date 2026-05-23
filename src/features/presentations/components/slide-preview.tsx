import { EditorialSlidePreview } from "@/features/presentations/components/editorial-slide-preview";
import { HeroSlidePreview } from "@/features/presentations/components/hero-slide-preview";
import { PRESENTATION_TEMPLATE } from "@/features/presentations/lib/template";
import type { PresentationSlide } from "@/features/presentations/types/presentation";

type SlidePreviewProps = {
  slide: PresentationSlide;
};

export function SlidePreview({ slide }: SlidePreviewProps) {
  if (slide.layout === "hero") {
    return <HeroSlidePreview slide={slide} />;
  }

  if (slide.layout === "editorial") {
    return <EditorialSlidePreview slide={slide} />;
  }

  const layout = PRESENTATION_TEMPLATE.layouts[slide.layout];

  return (
    <div
      className={`aspect-video border border-white/10 bg-[linear-gradient(135deg,#111111,#1c1c1f_48%,#0f172a)] ${PRESENTATION_TEMPLATE.preview.radiusClassName} ${PRESENTATION_TEMPLATE.preview.paddingClassName} shadow-2xl shadow-black/40`}
    >
      <div
        className={`flex h-full flex-col ${
          layout.centered
            ? "items-center justify-center text-center"
            : "justify-between"
        }`}
      >
        <div>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.22em] text-white/35">
            {layout.label} layout
          </p>

          <div
            className={`mb-10 h-2 rounded-full bg-white/30 ${
              layout.centered ? "mx-auto w-20" : "w-28"
            }`}
          />

          <h2
            className={`${layout.titleClassName} font-semibold leading-tight tracking-tight`}
          >
            {slide.title || "Untitled slide"}
          </h2>

          {layout.showBody && (
            <p className={`${layout.bodyClassName} mt-6 leading-8 text-white/58`}>
              {slide.body || "Slide content will appear here."}
            </p>
          )}
        </div>

        {layout.showBrand && (
          <div className="text-sm text-white/35">
            {PRESENTATION_TEMPLATE.brandLabel}
          </div>
        )}
      </div>
    </div>
  );
}