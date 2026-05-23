import { PresentationBuilder } from "@/features/presentations/components/presentation-builder";
import { DEFAULT_PRESENTATION_DECK } from "@/features/presentations/types/presentation";

export default function BuilderPage() {
  return <PresentationBuilder initialDeck={DEFAULT_PRESENTATION_DECK} />;
}