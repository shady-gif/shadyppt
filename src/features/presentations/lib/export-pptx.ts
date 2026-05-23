import pptxgen from "pptxgenjs";

import { PRESENTATION_TEMPLATE } from "@/features/presentations/lib/template";
import type {
  PresentationDeck,
  PresentationSlide,
} from "@/features/presentations/types/presentation";

function createSafeFileName(title: string) {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalizedTitle || "deck"}.pptx`;
}

function hexColor(color: string) {
  return color.replace("#", "");
}

let cachedEditorialImageData: string | undefined;

async function loadEditorialBackgroundImage() {
  if (cachedEditorialImageData) {
    return cachedEditorialImageData;
  }

  const response = await fetch(PRESENTATION_TEMPLATE.editorial.backgroundImage);

  if (!response.ok) {
    throw new Error("Failed to load editorial slide background image.");
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  cachedEditorialImageData = `data:image/png;base64,${btoa(binary)}`;
  return cachedEditorialImageData;
}

function addSlideBackground(slide: pptxgen.Slide) {
  slide.background = {
    color: hexColor(PRESENTATION_TEMPLATE.colors.background),
  };

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: PRESENTATION_TEMPLATE.slide.width,
    h: PRESENTATION_TEMPLATE.slide.height,
    fill: {
      color: hexColor(PRESENTATION_TEMPLATE.colors.backgroundDeep),
      transparency: 16,
    },
    line: {
      color: hexColor(PRESENTATION_TEMPLATE.colors.backgroundDeep),
      transparency: 100,
    },
  });

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: PRESENTATION_TEMPLATE.slide.width,
    h: PRESENTATION_TEMPLATE.slide.height,
    fill: {
      color: "1C1C1F",
      transparency: 28,
    },
    line: {
      color: "1C1C1F",
      transparency: 100,
    },
  });
}

function addAccentRule(
  slide: pptxgen.Slide,
  options: { x: number; y: number; w: number; centered?: boolean },
) {
  slide.addShape("roundRect", {
    x: options.x,
    y: options.y,
    w: options.w,
    h: 0.08,
    rectRadius: 0.04,
    fill: { color: "8A8A8A", transparency: 8 },
    line: { color: "8A8A8A", transparency: 100 },
    rotate: 0,
  });

  if (options.centered) {
    slide.addShape("roundRect", {
      x: options.x + options.w * 0.25,
      y: options.y + 0.18,
      w: options.w * 0.5,
      h: 0.04,
      rectRadius: 0.02,
      fill: { color: "FFFFFF", transparency: 70 },
      line: { color: "FFFFFF", transparency: 100 },
    });
  }
}

function addBrand(slide: pptxgen.Slide) {
  slide.addText(PRESENTATION_TEMPLATE.brandLabel, {
    x: 0.75,
    y: 6.85,
    w: 2,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: "777777",
  });
}

function addContentSlide(slide: pptxgen.Slide, content: PresentationSlide) {
  addSlideBackground(slide);

  addAccentRule(slide, { x: 0.85, y: 0.75, w: 1.15 });

  slide.addText(content.title || "Untitled slide", {
    x: 0.85,
    y: 1.62,
    w: 8.6,
    h: 1.25,
    fontFace: "Aptos Display",
    fontSize: 38,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });

  slide.addText(content.body || "Slide content will appear here.", {
    x: 0.85,
    y: 3.08,
    w: 7.7,
    h: 1.8,
    fontFace: "Aptos",
    fontSize: 18,
    color: "A6A6A6",
    margin: 0,
    breakLine: false,
    fit: "shrink",
    valign: "top",
  });

  addBrand(slide);
}

function addTitleSlide(slide: pptxgen.Slide, content: PresentationSlide) {
  addSlideBackground(slide);

  addAccentRule(slide, { x: 5.9, y: 1.55, w: 1.5, centered: true });

  slide.addText(content.title || "Untitled slide", {
    x: 1.45,
    y: 2.18,
    w: 10.3,
    h: 1.4,
    fontFace: "Aptos Display",
    fontSize: 44,
    bold: true,
    align: "center",
    color: "FFFFFF",
    margin: 0,
    fit: "shrink",
  });

  slide.addText(content.body || "Slide content will appear here.", {
    x: 2.05,
    y: 3.75,
    w: 9,
    h: 1.05,
    fontFace: "Aptos",
    fontSize: 19,
    align: "center",
    color: "A6A6A6",
    margin: 0,
    fit: "shrink",
  });
}

function addHeroGlowOrb(
  slide: pptxgen.Slide,
  options: { x: number; y: number; w: number; h: number; color: string },
) {
  slide.addShape("ellipse", {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    fill: { color: options.color, transparency: 72 },
    line: { color: options.color, transparency: 100 },
  });
}

function addHeroSlide(slide: pptxgen.Slide, content: PresentationSlide) {
  const { hero } = PRESENTATION_TEMPLATE;

  slide.background = { color: "07050F" };

  addHeroGlowOrb(slide, { x: -0.4, y: 0.2, w: 4.2, h: 4.2, color: "7C3AED" });
  addHeroGlowOrb(slide, { x: 9.8, y: 4.2, w: 4.5, h: 4.5, color: "D946EF" });
  addHeroGlowOrb(slide, { x: 4.5, y: 5.1, w: 3.2, h: 3.2, color: "22D3EE" });

  slide.addShape("rect", {
    x: 0.75,
    y: 0.72,
    w: 3.15,
    h: 0.38,
    rectRadius: 0.19,
    fill: { color: "FFFFFF", transparency: 88 },
    line: { color: "FFFFFF", transparency: 82 },
  });

  slide.addText(hero.eyebrow, {
    x: 0.92,
    y: 0.8,
    w: 2.9,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 8,
    color: "D4D4D8",
    margin: 0,
  });

  slide.addText(content.title || "Untitled slide", {
    x: 0.75,
    y: 1.35,
    w: 7.1,
    h: 1.45,
    fontFace: "Aptos Display",
    fontSize: 34,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    fit: "shrink",
  });

  slide.addText(content.body || "Slide content will appear here.", {
    x: 0.75,
    y: 2.82,
    w: 6.4,
    h: 0.95,
    fontFace: "Aptos",
    fontSize: 13,
    color: "A1A1AA",
    margin: 0,
    fit: "shrink",
    valign: "top",
  });

  const metricY = 5.55;
  const metricW = 2.35;
  hero.metrics.forEach((metric, index) => {
    const x = 0.75 + index * (metricW + 0.22);

    slide.addShape("roundRect", {
      x,
      y: metricY,
      w: metricW,
      h: 1.05,
      rectRadius: 0.12,
      fill: { color: "FFFFFF", transparency: 92 },
      line: { color: "FFFFFF", transparency: 88 },
    });

    slide.addText(metric.label.toUpperCase(), {
      x: x + 0.18,
      y: metricY + 0.14,
      w: metricW - 0.36,
      h: 0.2,
      fontFace: "Aptos",
      fontSize: 6.5,
      color: "71717A",
      margin: 0,
    });

    slide.addText(metric.value, {
      x: x + 0.18,
      y: metricY + 0.38,
      w: metricW - 0.36,
      h: 0.42,
      fontFace: "Aptos Display",
      fontSize: 18,
      bold: true,
      color: "FFFFFF",
      margin: 0,
    });
  });

  const cardX = 8.35;
  const cardY = 1.05;
  const cardW = 4.25;
  const cardH = 5.55;

  slide.addShape("roundRect", {
    x: cardX,
    y: cardY,
    w: cardW,
    h: cardH,
    rectRadius: 0.18,
    fill: { color: "FFFFFF", transparency: 91 },
    line: { color: "FFFFFF", transparency: 84 },
  });

  slide.addText("PERFORMANCE", {
    x: cardX + 0.28,
    y: cardY + 0.28,
    w: 2,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 6.5,
    color: "71717A",
    margin: 0,
  });

  slide.addText("Quarterly revenue", {
    x: cardX + 0.28,
    y: cardY + 0.48,
    w: 2.4,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: "E4E4E7",
    margin: 0,
  });

  slide.addShape("roundRect", {
    x: cardX + 2.55,
    y: cardY + 0.3,
    w: 1.35,
    h: 0.34,
    rectRadius: 0.17,
    fill: { color: "10B981", transparency: 82 },
    line: { color: "10B981", transparency: 100 },
  });

  slide.addText(hero.chartBadge, {
    x: cardX + 2.62,
    y: cardY + 0.37,
    w: 1.2,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 7.5,
    bold: true,
    color: "6EE7B7",
    align: "center",
    margin: 0,
  });

  const barBaseY = cardY + 4.55;
  const barHeights = [1.05, 1.75, 1.35, 2.15, 1.5, 2.45, 1.9];
  const barW = 0.38;
  const barGap = 0.14;
  const barStartX = cardX + 0.35;

  barHeights.forEach((barHeight, index) => {
    const x = barStartX + index * (barW + barGap);

    slide.addShape("roundRect", {
      x,
      y: barBaseY - barHeight,
      w: barW,
      h: barHeight,
      rectRadius: 0.05,
      fill: { color: index % 2 === 0 ? "7C3AED" : "E879F9", transparency: 4 },
      line: { color: "7C3AED", transparency: 100 },
    });
  });

}

function addEditorialSlide(
  slide: pptxgen.Slide,
  content: PresentationSlide,
  imageData: string,
) {
  const { editorial } = PRESENTATION_TEMPLATE;
  const slideW = PRESENTATION_TEMPLATE.slide.width;
  const slideH = PRESENTATION_TEMPLATE.slide.height;
  const panelW = slideW / 2;

  slide.addImage({
    data: imageData,
    x: 0,
    y: 0,
    w: slideW,
    h: slideH,
    sizing: { type: "cover", w: slideW, h: slideH },
  });

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: panelW + 0.2,
    h: slideH,
    fill: { color: "000000", transparency: 40 },
    line: { color: "000000", transparency: 100 },
  });

  slide.addShape("rect", {
    x: panelW - 0.25,
    y: 0,
    w: 0.45,
    h: slideH,
    fill: { color: "000000", transparency: 58 },
    line: { color: "000000", transparency: 100 },
  });

  slide.addText(editorial.headerLeft, {
    x: 0.55,
    y: 0.4,
    w: 2.4,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 7,
    color: "F5F5F4",
    margin: 0,
    charSpacing: 2,
  });

  slide.addText(editorial.headerCenter, {
    x: 5.65,
    y: 0.4,
    w: 2.1,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 7,
    color: "F5F5F4",
    align: "center",
    margin: 0,
    charSpacing: 2,
  });

  slide.addText(editorial.headerRight, {
    x: 11.15,
    y: 0.4,
    w: 1.65,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 7,
    color: "F5F5F4",
    align: "right",
    margin: 0,
    charSpacing: 2,
  });

  slide.addText(content.title || "ARCHE", {
    x: 0.55,
    y: 2.25,
    w: panelW - 0.75,
    h: 1.35,
    fontFace: "Georgia",
    fontSize: 52,
    color: "FFFFFF",
    align: "center",
    margin: 0,
    charSpacing: 4,
    fit: "shrink",
  });

  slide.addText(content.body || "Slide content will appear here.", {
    x: 1.05,
    y: 3.82,
    w: panelW - 1.35,
    h: 2.35,
    fontFace: "Aptos",
    fontSize: 7.5,
    color: "E7E5E4",
    align: "justify",
    margin: 0,
    fit: "shrink",
    valign: "top",
  });

  slide.addText(editorial.footer, {
    x: 0.55,
    y: 6.78,
    w: panelW - 0.75,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 6.5,
    color: "F5F5F4",
    align: "center",
    margin: 0,
    charSpacing: 3,
  });
}

function addSectionSlide(slide: pptxgen.Slide, content: PresentationSlide) {
  addSlideBackground(slide);

  addAccentRule(slide, { x: 5.9, y: 2.38, w: 1.5, centered: true });

  slide.addText(content.title || "Untitled section", {
    x: 1.9,
    y: 3.03,
    w: 9.3,
    h: 1.2,
    fontFace: "Aptos Display",
    fontSize: 40,
    bold: true,
    align: "center",
    color: "FFFFFF",
    margin: 0,
    fit: "shrink",
  });
}

function addPresentationSlide(
  pptx: pptxgen,
  content: PresentationSlide,
  editorialImageData?: string,
) {
  const slide = pptx.addSlide();

  if (content.layout === "hero") {
    addHeroSlide(slide, content);
    return;
  }

  if (content.layout === "editorial") {
    if (!editorialImageData) {
      throw new Error("Editorial slide background image is missing.");
    }

    addEditorialSlide(slide, content, editorialImageData);
    return;
  }

  if (content.layout === "title") {
    addTitleSlide(slide, content);
    return;
  }

  if (content.layout === "section") {
    addSectionSlide(slide, content);
    return;
  }

  addContentSlide(slide, content);
}

export async function exportDeckToPptx(deck: PresentationDeck) {
  const pptx = new pptxgen();

  pptx.author = "DeckForge";
  pptx.company = "DeckForge";
  pptx.subject = deck.title;
  pptx.title = deck.title;
  pptx.layout = "LAYOUT_WIDE";
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
  };

  const hasEditorialSlide = deck.slides.some(
    (slide) => slide.layout === "editorial",
  );
  const editorialImageData = hasEditorialSlide
    ? await loadEditorialBackgroundImage()
    : undefined;

  deck.slides.forEach((slide) =>
    addPresentationSlide(pptx, slide, editorialImageData),
  );

  await pptx.writeFile({
    fileName: createSafeFileName(deck.title),
  });
}
