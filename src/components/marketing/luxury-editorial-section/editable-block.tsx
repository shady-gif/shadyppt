"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type EditableBlockProps = {
  value: string;
  fontSize: number;
  onTextChange: (text: string) => void;
  onFontSizeChange: (fontSize: number) => void;
  className?: string;
  style?: React.CSSProperties;
  minFontSize?: number;
  maxFontSize?: number;
  "aria-label": string;
};

export function EditableBlock({
  value,
  fontSize,
  onTextChange,
  onFontSizeChange,
  className,
  style,
  minFontSize = 11,
  maxFontSize = 72,
  "aria-label": ariaLabel,
}: EditableBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!ref.current || document.activeElement === ref.current) {
      return;
    }

    if (ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <div className="group/block relative">
      {isFocused && (
        <div className="absolute -top-10 left-0 z-30 flex items-center gap-1 rounded-md border border-[#d8d2c8] bg-[#faf8f5] p-0.5 shadow-sm">
          <button
            type="button"
            aria-label="Decrease font size"
            className="flex size-7 items-center justify-center rounded text-[#6f6860] transition hover:bg-[#ede8e1]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              onFontSizeChange(Math.max(minFontSize, fontSize - 1))
            }
          >
            <Minus className="size-3.5" />
          </button>

          <span className="min-w-8 text-center text-[10px] tracking-wide text-[#8a8278]">
            {fontSize}
          </span>

          <button
            type="button"
            aria-label="Increase font size"
            className="flex size-7 items-center justify-center rounded text-[#6f6860] transition hover:bg-[#ede8e1]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              onFontSizeChange(Math.min(maxFontSize, fontSize + 1))
            }
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      )}

      <div
        ref={ref}
        role="textbox"
        contentEditable
        suppressContentEditableWarning
        aria-label={ariaLabel}
        spellCheck
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onTextChange(ref.current?.textContent?.trim() ?? "");
        }}
        onInput={() => onTextChange(ref.current?.textContent ?? "")}
        className={cn(
          "outline-none transition-[box-shadow] duration-200",
          "rounded-sm focus-visible:ring-2 focus-visible:ring-[#c8bfb2]/60",
          isFocused && "bg-[#f3efe8]/60",
          className,
        )}
        style={{ fontSize: `${fontSize}px`, ...style }}
      />
    </div>
  );
}
