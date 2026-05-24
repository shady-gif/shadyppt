import manifestData from "@/features/presentations/data/templates-2/manifest.json";
import template1Data from "@/features/presentations/data/templates-2/template-1.json";
import template2Data from "@/features/presentations/data/templates-2/template-2.json";
import template3Data from "@/features/presentations/data/templates-2/template-3.json";
import template4Data from "@/features/presentations/data/templates-2/template-4.json";
import template5Data from "@/features/presentations/data/templates-2/template-5.json";
import template6Data from "@/features/presentations/data/templates-2/template-6.json";
import template7Data from "@/features/presentations/data/templates-2/template-7.json";
import template8Data from "@/features/presentations/data/templates-2/template-8.json";
import template9Data from "@/features/presentations/data/templates-2/template-9.json";
import template10Data from "@/features/presentations/data/templates-2/template-10.json";
import template11Data from "@/features/presentations/data/templates-2/template-11.json";
import type { ImportedDeck } from "@/features/presentations/types/imported-deck";

export type TemplateTwoSummary = {
  id: string;
  title: string;
  href: string;
  slideCount: number;
  thumbnail: string;
  source: string;
};

export const templatesTwoManifest =
  manifestData as TemplateTwoSummary[];

export const templatesTwoDecks = {
  "template-1": template1Data as ImportedDeck,
  "template-2": template2Data as ImportedDeck,
  "template-3": template3Data as ImportedDeck,
  "template-4": template4Data as ImportedDeck,
  "template-5": template5Data as ImportedDeck,
  "template-6": template6Data as ImportedDeck,
  "template-7": template7Data as ImportedDeck,
  "template-8": template8Data as ImportedDeck,
  "template-9": template9Data as ImportedDeck,
  "template-10": template10Data as ImportedDeck,
  "template-11": template11Data as ImportedDeck,
} satisfies Record<string, ImportedDeck>;

export type TemplateTwoId = keyof typeof templatesTwoDecks;
