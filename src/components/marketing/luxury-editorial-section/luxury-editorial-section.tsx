"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { EditableBlock } from "@/components/marketing/luxury-editorial-section/editable-block";
import { ResizableImageFrame } from "@/components/marketing/luxury-editorial-section/resizable-image-frame";
import { useLuxuryEditorialStore } from "@/stores/luxury-editorial-store";
import { cn } from "@/lib/utils";

function InlineEditable({
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label": string;
}) {
  return (
    <span
      role="textbox"
      contentEditable
      suppressContentEditableWarning
      aria-label={ariaLabel}
      onBlur={(event) =>
        onChange(event.currentTarget.textContent?.trim() ?? "")
      }
      className={cn(
        "outline-none transition-colors duration-200",
        "rounded-sm focus-visible:bg-[#f3efe8]/80 focus-visible:ring-2 focus-visible:ring-[#c8bfb2]/50",
        className,
      )}
    >
      {value}
    </span>
  );
}

export function LuxuryEditorialSection() {
  const router = useRouter();
  const {
    heading,
    lead,
    bulletsLeft,
    bulletsRight,
    closing,
    brand,
    ctaLabel,
    images,
    updateHeading,
    updateLead,
    updateClosing,
    setBrand,
    setCtaLabel,
    setBullet,
    updateImage,
    replaceImage,
  } = useLuxuryEditorialStore();

  return (
    <section
      className="relative overflow-hidden bg-[#f7f4ef] text-[#3a3530]"
      aria-label="Luxury editorial portfolio section"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.75),transparent_42%),radial-gradient(circle_at_88%_80%,rgba(232,224,212,0.55),transparent_38%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="grid items-stretch gap-14 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-10 xl:gap-16">
          <div className="flex flex-col justify-between gap-12 lg:min-h-[640px] lg:pr-4">
            <div className="space-y-8">
              <EditableBlock
                aria-label="Section heading"
                value={heading.text}
                fontSize={heading.fontSize}
                onTextChange={(text) => updateHeading({ text })}
                onFontSizeChange={(fontSize) => updateHeading({ fontSize })}
                minFontSize={28}
                maxFontSize={64}
                className={cn(
                  "max-w-xl font-[family-name:var(--font-editorial)] font-normal uppercase",
                  "leading-[1.02] tracking-[0.07em] text-[#2f2a26]",
                )}
              />

              <EditableBlock
                aria-label="Lead paragraph"
                value={lead.text}
                fontSize={lead.fontSize}
                onTextChange={(text) => updateLead({ text })}
                onFontSizeChange={(fontSize) => updateLead({ fontSize })}
                minFontSize={12}
                maxFontSize={22}
                className="max-w-lg font-[family-name:var(--font-editorial-body)] font-light leading-[1.75] tracking-[0.01em] text-[#6f6860]"
              />

              <div className="h-px w-full max-w-md bg-[#d8d2c8]" />

              <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
                <ul className="space-y-3 font-[family-name:var(--font-editorial-body)] text-[13px] leading-relaxed tracking-[0.02em] text-[#5f5952]">
                  {bulletsLeft.map((bullet, index) => (
                    <li key={`left-${index}`} className="flex gap-3">
                      <span className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-[#b8aea2]" />
                      <InlineEditable
                        aria-label={`Left bullet ${index + 1}`}
                        value={bullet}
                        onChange={(value) => setBullet("left", index, value)}
                        className="flex-1"
                      />
                    </li>
                  ))}
                </ul>

                <ul className="space-y-3 font-[family-name:var(--font-editorial-body)] text-[13px] leading-relaxed tracking-[0.02em] text-[#5f5952]">
                  {bulletsRight.map((bullet, index) => (
                    <li key={`right-${index}`} className="flex gap-3">
                      <span className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-[#b8aea2]" />
                      <InlineEditable
                        aria-label={`Right bullet ${index + 1}`}
                        value={bullet}
                        onChange={(value) => setBullet("right", index, value)}
                        className="flex-1"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <EditableBlock
                aria-label="Closing paragraph"
                value={closing.text}
                fontSize={closing.fontSize}
                onTextChange={(text) => updateClosing({ text })}
                onFontSizeChange={(fontSize) => updateClosing({ fontSize })}
                minFontSize={12}
                maxFontSize={20}
                className="max-w-lg font-[family-name:var(--font-editorial-body)] font-light leading-[1.8] text-[#6f6860]"
              />
            </div>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <InlineEditable
                aria-label="Brand name"
                value={brand}
                onChange={setBrand}
                className="font-[family-name:var(--font-editorial-body)] text-[11px] uppercase tracking-[0.34em] text-[#8a8278]"
              />

              <button
                type="button"
                onClick={() => router.push("/builder")}
                className="group inline-flex w-fit items-center justify-center border border-[#b8aea2] bg-transparent px-8 py-3 font-[family-name:var(--font-editorial-body)] text-[11px] uppercase tracking-[0.28em] text-[#4a443d] transition duration-300 hover:border-[#8f8578] hover:bg-[#f3efe8] hover:text-[#2f2a26]"
              >
                <span
                  role="textbox"
                  contentEditable
                  suppressContentEditableWarning
                  aria-label="Call to action label"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  onBlur={(event) =>
                    setCtaLabel(event.currentTarget.textContent?.trim() ?? "VIEW")
                  }
                  className="outline-none"
                >
                  {ctaLabel}
                </span>
              </button>
            </div>
          </div>

          <div className="relative min-h-[460px] sm:min-h-[540px] lg:min-h-[640px]">
            <div className="absolute inset-y-4 right-0 left-0 rounded-[1.4rem] bg-[#ede8e1]/50 sm:inset-y-6 lg:inset-y-10" />

            <div className="relative mx-auto h-full min-h-[460px] w-full max-w-[520px] sm:min-h-[540px] sm:max-w-[560px] lg:mx-0 lg:max-w-none lg:min-h-[620px]">
              <ResizableImageFrame
                imageId="primary"
                label="primary portrait"
                image={images.primary}
                zIndex={10}
                onChange={(patch) => updateImage("primary", patch)}
                onReplace={(src) => replaceImage("primary", src)}
              />

              <ResizableImageFrame
                imageId="secondary"
                label="secondary landscape"
                image={images.secondary}
                zIndex={20}
                onChange={(patch) => updateImage("secondary", patch)}
                onReplace={(src) => replaceImage("secondary", src)}
              />
            </div>
          </div>
        </div>

        <p className="mt-10 text-center font-[family-name:var(--font-editorial-body)] text-[10px] uppercase tracking-[0.22em] text-[#a69d92] lg:hidden">
          Tap images to replace · drag handles to resize · drag image to reframe
        </p>
      </motion.div>
    </section>
  );
}
