import { ImportedDeckEditor } from "@/features/presentations/components/imported-deck-editor";
import rawArcheDeck from "@/features/presentations/data/arche-deck.json";
import type { ImportedDeck } from "@/features/presentations/types/imported-deck";

export default function TemplatePage() {
  return <ImportedDeckEditor deck={rawArcheDeck as ImportedDeck} />;
}
