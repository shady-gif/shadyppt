import JSZip from "jszip";

import type {
  ImportedDeck,
  ImportedDeckFontPreset,
  ImportedDeckShape,
} from "@/features/presentations/types/imported-deck";

const pptxFontNames: Record<ImportedDeckFontPreset, string> = {
  times: "Times New Roman",
  sans: "Aptos",
  cursive: "Brush Script MT",
};

function createSafeFileName(title: string) {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalizedTitle || "template"}.pptx`;
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function replaceTextRuns(shapeXml: string, nextText: string) {
  let textRunIndex = 0;

  return shapeXml.replace(/<a:t>([\s\S]*?)<\/a:t>/g, () => {
    const replacement = textRunIndex === 0 ? escapeXml(nextText) : "";
    textRunIndex += 1;

    return `<a:t>${replacement}</a:t>`;
  });
}

function replaceTextFont(
  shapeXml: string,
  fontPreset: ImportedDeckFontPreset | undefined,
) {
  if (!fontPreset) {
    return shapeXml;
  }

  const typeface = pptxFontNames[fontPreset];
  let nextShapeXml = shapeXml;

  for (const tag of ["latin", "cs", "ea"] as const) {
    const tagPattern = new RegExp(`<a:${tag}\\b[^>]*/>`, "g");

    if (tagPattern.test(nextShapeXml)) {
      nextShapeXml = nextShapeXml.replace(
        new RegExp(`(<a:${tag}\\b[^>]*typeface=")[^"]*("[^>]*/>)`, "g"),
        `$1${typeface}$2`,
      );
    }
  }

  return nextShapeXml;
}

function replaceTextShape(
  shapeXml: string,
  textShape: Extract<ImportedDeckShape, { type: "text" }>,
) {
  return replaceTextFont(
    replaceTextRuns(shapeXml, textShape.text),
    textShape.fontPreset,
  );
}

function replaceSlideText(slideXml: string, slideIndex: number, deck: ImportedDeck) {
  const textShapes = deck.slides[slideIndex].shapes.filter(
    (shape) => shape.type === "text",
  );
  let textShapeIndex = 0;

  return slideXml.replace(/<p:sp\b[\s\S]*?<\/p:sp>/g, (shapeXml) => {
    if (!shapeXml.includes("<a:t>")) {
      return shapeXml;
    }

    const textShape = textShapes[textShapeIndex];
    textShapeIndex += 1;

    if (!textShape || textShape.type !== "text") {
      return shapeXml;
    }

    return replaceTextShape(shapeXml, textShape);
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportImportedDeckToPptx(deck: ImportedDeck) {
  const response = await fetch(deck.source);

  if (!response.ok) {
    throw new Error("Failed to load the source template PPTX.");
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer());

  await Promise.all(
    deck.slides.map(async (_slide, index) => {
      const slidePath = `ppt/slides/slide${index + 1}.xml`;
      const file = zip.file(slidePath);

      if (!file) {
        return;
      }

      const slideXml = await file.async("string");
      zip.file(slidePath, replaceSlideText(slideXml, index, deck));
    }),
  );

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  downloadBlob(blob, createSafeFileName(deck.title));
}
