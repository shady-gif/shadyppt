"use client";

import JSZip from "jszip";

import type {
  MvpFontPreset,
  MvpPptDeck,
  MvpPptShape,
} from "@/features/presentations/types/mvp-pptx";

const pptxFontNames: Record<MvpFontPreset, string> = {
  sans: "Aptos",
  times: "Times New Roman",
};

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getAttr(xml: string, name: string) {
  return xml.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function parseRels(xml: string) {
  const rels = new Map<string, string>();

  for (const [relXml] of xml.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = getAttr(relXml, "Id");
    const target = getAttr(relXml, "Target");

    if (id && target) {
      rels.set(id, target);
    }
  }

  return rels;
}

function normalizeZipPath(path: string) {
  const parts: string[] = [];

  for (const part of path.split("/")) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return parts.join("/");
}

function resolveZipPath(baseDir: string, target: string) {
  return normalizeZipPath(`${baseDir}/${target}`);
}

async function collectSlidePaths(zip: JSZip, presentationXml: string) {
  const relFile = zip.file("ppt/_rels/presentation.xml.rels");

  if (!relFile) {
    return Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
  }

  const rels = parseRels(await relFile.async("string"));

  return [...presentationXml.matchAll(/<p:sldId\b[^>]*r:id="([^"]+)"/g)]
    .map((slideId) => rels.get(slideId[1]))
    .filter((target): target is string => Boolean(target))
    .map((target) => resolveZipPath("ppt", target));
}

function parseSlideSize(presentationXml: string) {
  const sizeXml = presentationXml.match(/<p:sldSz\b[^>]*>/)?.[0] || "";
  const width = Number(getAttr(sizeXml, "cx")) || 12192000;
  const height = Number(getAttr(sizeXml, "cy")) || 6858000;

  return { width, height };
}

type DeckSize = { width: number; height: number };

type EmuFrame = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
};

type CoordinateSpace = {
  x: number;
  y: number;
  w: number;
  h: number;
  chX: number;
  chY: number;
  chW: number;
  chH: number;
};

function parseRawTransform(xml: string, deckSize: DeckSize): EmuFrame {
  const xfrm = xml.match(/<a:xfrm\b[\s\S]*?<\/a:xfrm>/)?.[0] || "";
  const off = xfrm.match(/<a:off\b[^>]*\/>/)?.[0] || "";
  const ext = xfrm.match(/<a:ext\b[^>]*\/>/)?.[0] || "";
  const x = Number(getAttr(off, "x")) || 0;
  const y = Number(getAttr(off, "y")) || 0;
  const w = Number(getAttr(ext, "cx")) || deckSize.width;
  const h = Number(getAttr(ext, "cy")) || deckSize.height;
  const rotation = Number(getAttr(xfrm, "rot")) || 0;

  return { x, y, w, h, rotation: rotation / 60000 };
}

function parseGroupSpace(xml: string, parentSpace: CoordinateSpace, deckSize: DeckSize) {
  const rawGroup = parseRawTransform(xml, deckSize);
  const xfrm = xml.match(/<p:grpSpPr\b[\s\S]*?<\/p:grpSpPr>/)?.[0] || "";
  const chOff = xfrm.match(/<a:chOff\b[^>]*\/>/)?.[0] || "";
  const chExt = xfrm.match(/<a:chExt\b[^>]*\/>/)?.[0] || "";
  const mappedGroup = mapFrameToDeck(rawGroup, parentSpace, deckSize);

  return {
    x: (mappedGroup.x / 100) * deckSize.width,
    y: (mappedGroup.y / 100) * deckSize.height,
    w: (mappedGroup.w / 100) * deckSize.width,
    h: (mappedGroup.h / 100) * deckSize.height,
    chX: Number(getAttr(chOff, "x")) || 0,
    chY: Number(getAttr(chOff, "y")) || 0,
    chW: Number(getAttr(chExt, "cx")) || rawGroup.w || deckSize.width,
    chH: Number(getAttr(chExt, "cy")) || rawGroup.h || deckSize.height,
  };
}

function mapFrameToDeck(frame: EmuFrame, space: CoordinateSpace, deckSize: DeckSize) {
  const safeChW = space.chW || deckSize.width;
  const safeChH = space.chH || deckSize.height;
  const x = space.x + ((frame.x - space.chX) / safeChW) * space.w;
  const y = space.y + ((frame.y - space.chY) / safeChH) * space.h;
  const w = (frame.w / safeChW) * space.w;
  const h = (frame.h / safeChH) * space.h;

  return {
    x: (x / deckSize.width) * 100,
    y: (y / deckSize.height) * 100,
    w: (w / deckSize.width) * 100,
    h: (h / deckSize.height) * 100,
    rotation: frame.rotation,
  };
}

function parseOpacity(xml: string) {
  const alpha = xml.match(/<a:alpha\b[^>]*val="(\d+)"/)?.[1];

  return alpha ? Number(alpha) / 100000 : 1;
}

function parseText(xml: string) {
  return [...xml.matchAll(/<a:p\b[\s\S]*?<\/a:p>/g)]
    .map(([paragraph]) =>
      [...paragraph.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join(""),
    )
    .filter(Boolean)
    .join("\n");
}

function toFontPreset(fontFamily: string): MvpFontPreset {
  return /times|serif/i.test(fontFamily) ? "times" : "sans";
}

function parseTextMeta(xml: string) {
  const fontFamily = xml.match(/typeface="([^"]+)"/)?.[1] || "Aptos";
  const fontSize = Number(xml.match(/\bsz="(\d+)"/)?.[1]) / 100 || 34;
  const lineSpacing = Number(xml.match(/<a:spcPct\b[^>]*val="(\d+)"/)?.[1]);
  const align = xml.match(/\balgn="([^"]+)"/)?.[1] || "l";
  const color = xml.match(/<a:srgbClr\b[^>]*val="([A-Fa-f0-9]{6})"/)?.[1];

  return {
    color: color ? `#${color}` : "#111111",
    fontPreset: toFontPreset(fontFamily),
    fontSize,
    lineHeight: lineSpacing ? lineSpacing / 100000 : 1.15,
    align,
    fontWeight: /<a:rPr\b[^>]*\bb="1"/.test(xml) ? 700 : 400,
  };
}

function parseFill(xml: string) {
  const fillBlock = xml.match(/<a:solidFill\b[\s\S]*?<\/a:solidFill>/)?.[0];
  const color = fillBlock?.match(/<a:srgbClr\b[^>]*val="([A-Fa-f0-9]{6})"/)?.[1];

  return color ? `#${color}` : "#ffffff";
}

function parseLine(xml: string) {
  const lineBlock = xml.match(/<a:ln\b[\s\S]*?<\/a:ln>/)?.[0];

  if (!lineBlock || lineBlock.includes("<a:noFill")) {
    return null;
  }

  const color = lineBlock.match(/<a:srgbClr\b[^>]*val="([A-Fa-f0-9]{6})"/)?.[1];
  const width = Number(getAttr(lineBlock, "w")) || 19050;

  return {
    stroke: color ? `#${color}` : "#111111",
    strokeWidth: Math.max(1, width / 12700),
  };
}

function parseFlip(xml: string) {
  const xfrm = xml.match(/<a:xfrm\b[^>]*>/)?.[0] || "";

  return {
    flipH: getAttr(xfrm, "flipH") === "true",
    flipV: getAttr(xfrm, "flipV") === "true",
  };
}

function parseRadius(xml: string): "full" | undefined {
  const isEllipse = /<a:prstGeom\b[^>]*prst="ellipse"/.test(xml);
  const hasRoundBezier = xml.includes("<a:cubicBezTo");
  const raw = parseRawTransform(xml, { width: 1, height: 1 });
  const isNearlySquare =
    raw.w > 0 && raw.h > 0 && Math.abs(raw.w - raw.h) / Math.max(raw.w, raw.h) < 0.08;

  return isEllipse || (hasRoundBezier && isNearlySquare) ? "full" : undefined;
}

function getOuterInnerXml(xml: string, tagName: string) {
  const openMatch = xml.match(new RegExp(`<p:${tagName}\\b[^>]*>`));

  if (!openMatch || openMatch.index === undefined) {
    return "";
  }

  const openEnd = openMatch.index + openMatch[0].length;
  const closeTag = `</p:${tagName}>`;
  const closeStart = xml.lastIndexOf(closeTag);

  if (closeStart < openEnd) {
    return "";
  }

  return xml.slice(openEnd, closeStart);
}

function getImmediateDrawableElements(xml: string) {
  const elements: { kind: "pic" | "sp" | "grpSp"; xml: string }[] = [];
  const tagPattern = /<\/?p:(sp|pic|grpSp)\b[^>]*>/g;
  const stack: string[] = [];
  let currentStart = -1;
  let currentKind: "pic" | "sp" | "grpSp" | null = null;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(xml))) {
    const isClosing = match[0].startsWith("</");
    const kind = match[1] as "pic" | "sp" | "grpSp";

    if (!isClosing) {
      if (stack.length === 0) {
        currentStart = match.index;
        currentKind = kind;
      }

      stack.push(kind);
      continue;
    }

    stack.pop();

    if (stack.length === 0 && currentStart >= 0 && currentKind) {
      elements.push({
        kind: currentKind,
        xml: xml.slice(currentStart, tagPattern.lastIndex),
      });
      currentStart = -1;
      currentKind = null;
    }
  }

  return elements;
}

function parseSlideItems(slideXml: string, deckSize: DeckSize) {
  const tree = slideXml.match(/<p:spTree\b[\s\S]*?<\/p:spTree>/)?.[0] || "";
  const rootSpace: CoordinateSpace = {
    x: 0,
    y: 0,
    w: deckSize.width,
    h: deckSize.height,
    chX: 0,
    chY: 0,
    chW: deckSize.width,
    chH: deckSize.height,
  };
  const items: { kind: "pic" | "sp"; xml: string; frame: ReturnType<typeof mapFrameToDeck> }[] = [];

  function visit(containerXml: string, space: CoordinateSpace) {
    for (const item of getImmediateDrawableElements(containerXml)) {
      if (item.kind === "grpSp") {
        visit(
          getOuterInnerXml(item.xml, "grpSp"),
          parseGroupSpace(item.xml, space, deckSize),
        );
        continue;
      }

      items.push({
        kind: item.kind,
        xml: item.xml,
        frame: mapFrameToDeck(parseRawTransform(item.xml, deckSize), space, deckSize),
      });
    }
  }

  visit(tree, rootSpace);

  return items;
}

function mimeFromPath(filePath: string) {
  const extension = filePath.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "svg") {
    return "image/svg+xml";
  }

  if (extension === "gif") {
    return "image/gif";
  }

  return "image/png";
}

async function mediaToDataUrl(zip: JSZip, sourceZipPath: string) {
  const sourceFile = zip.file(sourceZipPath);

  if (!sourceFile) {
    return null;
  }

  const base64 = await sourceFile.async("base64");

  return `data:${mimeFromPath(sourceZipPath)};base64,${base64}`;
}

async function parseImageFill(
  zip: JSZip,
  xml: string,
  slidePath: string,
  rels: Map<string, string>,
) {
  const relId =
    xml.match(/<a:blip\b[^>]*r:embed="([^"]+)"/)?.[1] ||
    xml.match(/<a:blip\b[^>]*r:link="([^"]+)"/)?.[1];
  const target = relId ? rels.get(relId) : null;
  const sourceZipPath = target
    ? resolveZipPath(slidePath.split("/").slice(0, -1).join("/"), target)
    : null;

  return sourceZipPath ? mediaToDataUrl(zip, sourceZipPath) : null;
}

function replaceTextRuns(shapeXml: string, nextText: string) {
  let textRunIndex = 0;

  return shapeXml.replace(/<a:t>([\s\S]*?)<\/a:t>/g, () => {
    const replacement = textRunIndex === 0 ? escapeXml(nextText) : "";
    textRunIndex += 1;

    return `<a:t>${replacement}</a:t>`;
  });
}

function replaceTextFont(shapeXml: string, fontPreset: MvpFontPreset) {
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

function replaceSlideText(slideXml: string, slideIndex: number, deck: MvpPptDeck) {
  const textShapes = deck.slides[slideIndex].shapes.filter(
    (shape): shape is Extract<MvpPptShape, { type: "text" }> =>
      shape.type === "text",
  );
  let textShapeIndex = 0;

  return slideXml.replace(/<p:sp\b[\s\S]*?<\/p:sp>/g, (shapeXml) => {
    if (!shapeXml.includes("<a:t>")) {
      return shapeXml;
    }

    const textShape = textShapes[textShapeIndex];
    textShapeIndex += 1;

    if (!textShape) {
      return shapeXml;
    }

    return replaceTextFont(
      replaceTextRuns(shapeXml, textShape.text),
      textShape.fontPreset,
    );
  });
}

function createSafeFileName(title: string) {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalizedTitle || "edited-presentation"}.pptx`;
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

export async function parseMvpPptx(file: File): Promise<MvpPptDeck> {
  const sourceBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(sourceBuffer);
  const presentationXml = await zip.file("ppt/presentation.xml")?.async("string");

  if (!presentationXml) {
    throw new Error("This file does not look like a valid PPTX.");
  }

  const deckSize = parseSlideSize(presentationXml);
  const slidePaths = await collectSlidePaths(zip, presentationXml);
  const slides: MvpPptDeck["slides"] = [];

  for (const [slideIndex, slidePath] of slidePaths.entries()) {
    const slideXml = await zip.file(slidePath)?.async("string");

    if (!slideXml) {
      continue;
    }

    const relPath = slidePath.replace("slides/", "slides/_rels/") + ".rels";
    const relsXml = (await zip.file(relPath)?.async("string")) || "";
    const rels = parseRels(relsXml);
    const shapes: MvpPptShape[] = [];

    for (const [shapeIndex, item] of parseSlideItems(slideXml, deckSize).entries()) {
      const baseShape = {
        id: `slide-${slideIndex + 1}-shape-${shapeIndex + 1}`,
        ...item.frame,
        opacity: parseOpacity(item.xml),
      };

      if (item.kind === "pic" || item.xml.includes("<a:blipFill")) {
        const src = await parseImageFill(zip, item.xml, slidePath, rels);

        if (src) {
          shapes.push({
            ...baseShape,
            type: "image",
            src,
            radius: parseRadius(item.xml),
          });
          continue;
        }
      }

      const text = parseText(item.xml);

      if (text) {
        shapes.push({
          ...baseShape,
          type: "text",
          text,
          ...parseTextMeta(item.xml),
          animation: "none",
        });
      } else if (/<a:prstGeom\b[^>]*prst="line"/.test(item.xml)) {
        const line = parseLine(item.xml);

        if (line) {
          shapes.push({
            ...baseShape,
            type: "line",
            ...line,
            ...parseFlip(item.xml),
          });
        }
      } else if (item.xml.includes("<a:solidFill")) {
        shapes.push({
          ...baseShape,
          type: "shape",
          fill: parseFill(item.xml),
          radius: parseRadius(item.xml),
        });
      }
    }

    slides.push({
      id: `slide-${slideIndex + 1}`,
      title: `Slide ${slideIndex + 1}`,
      shapes,
    });
  }

  return {
    title: file.name.replace(/\.pptx$/i, ""),
    width: deckSize.width,
    height: deckSize.height,
    sourceBuffer,
    slides,
  };
}

export async function exportMvpPptx(deck: MvpPptDeck) {
  const zip = await JSZip.loadAsync(deck.sourceBuffer.slice(0));
  const presentationXml = await zip.file("ppt/presentation.xml")?.async("string");

  if (!presentationXml) {
    throw new Error("Could not export this PPTX.");
  }

  const slidePaths = await collectSlidePaths(zip, presentationXml);

  await Promise.all(
    slidePaths.map(async (slidePath, index) => {
      const file = zip.file(slidePath);

      if (!file || !deck.slides[index]) {
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

  downloadBlob(blob, createSafeFileName(`${deck.title}-edited`));
}
