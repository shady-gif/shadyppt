import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const publicRoot = path.join(projectRoot, "public", "templates-2");
const dataRoot = path.join(
  projectRoot,
  "src",
  "features",
  "presentations",
  "data",
  "templates-2",
);

const decks = [
  {
    id: "template-6",
    title: "Comicbook",
    file: "/Users/sarrthakchauhan/Downloads/comicbook.pptx",
  },
  {
    id: "template-7",
    title: "Diagrams 2",
    file: "/Users/sarrthakchauhan/Downloads/diagrams 2.pptx",
  },
  {
    id: "template-8",
    title: "Visual F",
    file: "/Users/sarrthakchauhan/Downloads/visual f.pptx",
  },
  {
    id: "template-9",
    title: "Modern",
    file: "/Users/sarrthakchauhan/Downloads/modern.pptx",
  },
  {
    id: "template-10",
    title: "Video Should Try",
    file: "/Users/sarrthakchauhan/Downloads/video(should try).pptx",
  },
  {
    id: "template-11",
    title: "Cinematic F",
    file: "/Users/sarrthakchauhan/Downloads/cinematic f.pptx",
  },
];

function decodeXml(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function getAttr(xml, name) {
  const match = xml.match(new RegExp(`\\b${name}="([^"]*)"`));

  return match?.[1];
}

function parseRels(xml) {
  const rels = new Map();
  const relPattern = /<Relationship\b[^>]*>/g;
  let match;

  while ((match = relPattern.exec(xml))) {
    const relXml = match[0];
    const id = getAttr(relXml, "Id");
    const target = getAttr(relXml, "Target");

    if (id && target) {
      rels.set(id, target);
    }
  }

  return rels;
}

function resolveZipPath(baseDir, target) {
  return path.posix
    .normalize(path.posix.join(baseDir, target))
    .replace(/^\/+/, "");
}

function collectSlidePaths(zip, presentationXml) {
  const presentationRels = zip.file("ppt/_rels/presentation.xml.rels");

  if (!presentationRels) {
    return Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  }

  return presentationRels.async("string").then((relsXml) => {
    const rels = parseRels(relsXml);
    const slideIds = [...presentationXml.matchAll(/<p:sldId\b[^>]*r:id="([^"]+)"/g)];

    return slideIds
      .map((slideId) => rels.get(slideId[1]))
      .filter(Boolean)
      .map((target) => resolveZipPath("ppt", target));
  });
}

function parseSlideSize(presentationXml) {
  const sizeXml = presentationXml.match(/<p:sldSz\b[^>]*>/)?.[0] || "";
  const width = Number(getAttr(sizeXml, "cx")) || 12192000;
  const height = Number(getAttr(sizeXml, "cy")) || 6858000;

  return { width, height };
}

function parseRawTransform(xml) {
  const xfrm = xml.match(/<a:xfrm\b[\s\S]*?<\/a:xfrm>/)?.[0] || "";
  const off = xfrm.match(/<a:off\b[^>]*\/>/)?.[0] || "";
  const ext = xfrm.match(/<a:ext\b[^>]*\/>/)?.[0] || "";
  const chOff = xfrm.match(/<a:chOff\b[^>]*\/>/)?.[0] || "";
  const chExt = xfrm.match(/<a:chExt\b[^>]*\/>/)?.[0] || "";

  return {
    x: Number(getAttr(off, "x")) || 0,
    y: Number(getAttr(off, "y")) || 0,
    w: Number(getAttr(ext, "cx")) || 0,
    h: Number(getAttr(ext, "cy")) || 0,
    chX: Number(getAttr(chOff, "x")) || 0,
    chY: Number(getAttr(chOff, "y")) || 0,
    chW: Number(getAttr(chExt, "cx")) || 0,
    chH: Number(getAttr(chExt, "cy")) || 0,
    rotation: (Number(getAttr(xfrm, "rot")) || 0) / 60000,
  };
}

function mapTransform(rawTransform, frame, deckSize) {
  const frameChildWidth = frame.chW || frame.w || deckSize.width;
  const frameChildHeight = frame.chH || frame.h || deckSize.height;
  const width = rawTransform.w || deckSize.width;
  const height = rawTransform.h || deckSize.height;
  const globalX =
    frame.x + ((rawTransform.x - frame.chX) / frameChildWidth) * frame.w;
  const globalY =
    frame.y + ((rawTransform.y - frame.chY) / frameChildHeight) * frame.h;
  const globalW = (width / frameChildWidth) * frame.w;
  const globalH = (height / frameChildHeight) * frame.h;

  return {
    x: (globalX / deckSize.width) * 100,
    y: (globalY / deckSize.height) * 100,
    w: (globalW / deckSize.width) * 100,
    h: (globalH / deckSize.height) * 100,
    rotation: frame.rotation + rawTransform.rotation,
  };
}

function parseTransform(xml, deckSize, frame) {
  return mapTransform(parseRawTransform(xml), frame, deckSize);
}

function createChildFrame(groupXml, frame, deckSize) {
  const rawTransform = parseRawTransform(groupXml);
  const mapped = mapTransform(rawTransform, frame, deckSize);
  const frameHeight = (mapped.h / 100) * deckSize.height;
  const childHeight =
    rawTransform.chH || rawTransform.h || frame.chH || deckSize.height;

  return {
    x: (mapped.x / 100) * deckSize.width,
    y: (mapped.y / 100) * deckSize.height,
    w: (mapped.w / 100) * deckSize.width,
    h: frameHeight,
    chX: rawTransform.chX,
    chY: rawTransform.chY,
    chW: rawTransform.chW || rawTransform.w || frame.chW || deckSize.width,
    chH: childHeight,
    rotation: mapped.rotation,
    scale: frame.scale * (frameHeight / childHeight),
  };
}

function parseOpacity(xml) {
  const alpha = xml.match(/<a:alpha\b[^>]*val="(\d+)"/)?.[1];

  if (!alpha) {
    return 1;
  }

  return Number(alpha) / 100000;
}

function parseText(xml) {
  const paragraphs = [...xml.matchAll(/<a:p\b[\s\S]*?<\/a:p>/g)]
    .map(([paragraph]) =>
      [...paragraph.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join(""),
    )
    .filter((text) => text.length > 0);

  return paragraphs.join("\n");
}

function parseTextMeta(xml, scale = 1) {
  const fontFamily =
    xml.match(/typeface="([^"]+)"/)?.[1] || "Aptos";
  const fontSize = (Number(xml.match(/\bsz="(\d+)"/)?.[1]) / 100 || 34) * scale;
  const lineSpacing = Number(xml.match(/<a:spcPct\b[^>]*val="(\d+)"/)?.[1]);
  const align = xml.match(/\balgn="([^"]+)"/)?.[1] || "l";
  const color = xml.match(/<a:srgbClr\b[^>]*val="([A-Fa-f0-9]{6})"/)?.[1];

  return {
    color: color ? `#${color}` : "#111111",
    fontFamily,
    fontSize,
    lineHeight: lineSpacing ? lineSpacing / 100000 : 1.15,
    align,
    fontWeight: /<a:(?:b|rPr)\b[^>]*\bb="1"/.test(xml) ? 700 : 400,
  };
}

function parseFill(xml) {
  const fillBlock = xml.match(/<a:solidFill\b[\s\S]*?<\/a:solidFill>/)?.[0];
  const color = fillBlock?.match(/<a:srgbClr\b[^>]*val="([A-Fa-f0-9]{6})"/)?.[1];

  return color ? `#${color}` : "#ffffff";
}

function findElementEnd(xml, startIndex, tagName) {
  const pattern = new RegExp(`<p:${tagName}\\b|</p:${tagName}>`, "g");
  pattern.lastIndex = startIndex;
  let depth = 0;
  let match;

  while ((match = pattern.exec(xml))) {
    if (match[0].startsWith(`</p:${tagName}`)) {
      depth -= 1;

      if (depth === 0) {
        return pattern.lastIndex;
      }
    } else {
      depth += 1;
    }
  }

  return -1;
}

function parseSlideItems(xml, frame, deckSize) {
  const itemPattern = /<p:(grpSp|pic|sp)\b/g;
  const items = [];
  let match;

  while ((match = itemPattern.exec(xml))) {
    const kind = match[1];
    const endIndex = findElementEnd(xml, match.index, kind);

    if (endIndex === -1) {
      continue;
    }

    const itemXml = xml.slice(match.index, endIndex);

    if (kind === "grpSp") {
      const openEnd = itemXml.indexOf(">") + 1;
      const closeStart = itemXml.lastIndexOf("</p:grpSp>");
      const childXml = itemXml.slice(openEnd, closeStart);

      items.push(
        ...parseSlideItems(
          childXml,
          createChildFrame(itemXml, frame, deckSize),
          deckSize,
        ),
      );
    } else {
      items.push({
        kind,
        xml: itemXml,
        frame,
      });
    }

    itemPattern.lastIndex = endIndex;
  }

  return items;
}

async function copyMedia(zip, sourceZipPath, templateId, copiedMedia) {
  const sourceFile = zip.file(sourceZipPath);

  if (!sourceFile) {
    return null;
  }

  if (copiedMedia.has(sourceZipPath)) {
    return copiedMedia.get(sourceZipPath);
  }

  const fileName = path.posix.basename(sourceZipPath);
  const publicPath = `/templates-2/${templateId}/media/${fileName}`;
  const outputPath = path.join(publicRoot, templateId, "media", fileName);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, await sourceFile.async("nodebuffer"));
  copiedMedia.set(sourceZipPath, publicPath);

  return publicPath;
}

async function importDeck({ id, title, file }) {
  const sourceBuffer = await readFile(file);
  const zip = await JSZip.loadAsync(sourceBuffer);
  const presentationXml = await zip.file("ppt/presentation.xml").async("string");
  const deckSize = parseSlideSize(presentationXml);
  const slidePaths = await collectSlidePaths(zip, presentationXml);
  const copiedMedia = new Map();
  const slides = [];
  let textIndex = 0;

  await mkdir(path.join(publicRoot, id, "media"), { recursive: true });
  await writeFile(path.join(publicRoot, id, "source.pptx"), sourceBuffer);

  for (const [slideIndex, slidePath] of slidePaths.entries()) {
    const slideXml = await zip.file(slidePath).async("string");
    const relPath = slidePath.replace("slides/", "slides/_rels/") + ".rels";
    const relsXml = (await zip.file(relPath)?.async("string")) || "";
    const rels = parseRels(relsXml);
    const shapes = [];

    const rootFrame = {
      x: 0,
      y: 0,
      w: deckSize.width,
      h: deckSize.height,
      chX: 0,
      chY: 0,
      chW: deckSize.width,
      chH: deckSize.height,
      rotation: 0,
      scale: 1,
    };

    for (const [shapeIndex, item] of parseSlideItems(
      slideXml,
      rootFrame,
      deckSize,
    ).entries()) {
      const baseShape = {
        id: `${id}-slide-${slideIndex + 1}-shape-${shapeIndex + 1}`,
        ...parseTransform(item.xml, deckSize, item.frame),
        opacity: parseOpacity(item.xml),
      };

      if (item.kind === "pic" || item.xml.includes("<a:blip")) {
        const relId = item.xml.match(/<a:blip\b[^>]*r:embed="([^"]+)"/)?.[1];
        const target = relId ? rels.get(relId) : null;
        const sourceZipPath = target
          ? resolveZipPath(path.posix.dirname(slidePath), target)
          : null;
        const src = sourceZipPath
          ? await copyMedia(zip, sourceZipPath, id, copiedMedia)
          : null;

        if (src) {
          shapes.push({
            ...baseShape,
            type: "image",
            src,
          });
        }

        continue;
      }

      const text = parseText(item.xml);

      if (text) {
        shapes.push({
          ...baseShape,
          type: "text",
          text,
          textIndex,
          ...parseTextMeta(item.xml, item.frame.scale),
        });
        textIndex += 1;
      } else if (item.xml.includes("<a:solidFill")) {
        shapes.push({
          ...baseShape,
          type: "shape",
          fill: parseFill(item.xml),
        });
      }
    }

    slides.push({
      id: `${id}-${slideIndex + 1}`,
      title: `Slide ${slideIndex + 1}`,
      shapes,
    });
  }

  const deck = {
    id,
    title,
    source: `/templates-2/${id}/source.pptx`,
    width: deckSize.width,
    height: deckSize.height,
    slides,
  };

  await writeFile(
    path.join(dataRoot, `${id}.json`),
    `${JSON.stringify(deck, null, 2)}\n`,
  );

  return {
    id,
    title,
    href: `/templates-2/${id}`,
    slideCount: slides.length,
    thumbnail:
      slides[0]?.shapes.find((shape) => shape.type === "image")?.src || "",
    source: deck.source,
  };
}

const manifestPath = path.join(dataRoot, "manifest.json");
const currentManifest = JSON.parse(await readFile(manifestPath, "utf8"));
const importedSummaries = [];

for (const deck of decks) {
  importedSummaries.push(await importDeck(deck));
}

const importedIds = new Set(importedSummaries.map((summary) => summary.id));
const nextManifest = [
  ...currentManifest.filter((summary) => !importedIds.has(summary.id)),
  ...importedSummaries,
];

await writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
console.log(
  importedSummaries
    .map((summary) => `${summary.title}: ${summary.slideCount} slides`)
    .join("\n"),
);
