import { notFound } from "next/navigation";

import { ImportedDeckEditor } from "@/features/presentations/components/imported-deck-editor";
import {
  templatesTwoDecks,
  templatesTwoManifest,
  type TemplateTwoId,
} from "@/features/presentations/data/templates-2";

export function generateStaticParams() {
  return templatesTwoManifest.map((template) => ({
    templateId: template.id,
  }));
}

export default async function TemplateTwoEditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const deck = templatesTwoDecks[templateId as TemplateTwoId];

  if (!deck) {
    notFound();
  }

  return <ImportedDeckEditor deck={deck} backHref="/templates-2" />;
}
