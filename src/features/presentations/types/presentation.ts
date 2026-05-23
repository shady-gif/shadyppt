export type SlideLayout = "title" | "content" | "section" | "hero" | "editorial";

export type PresentationSlide = {
  id: string;
  title: string;
  body: string;
  layout: SlideLayout;
  speakerNotes?: string;
};

export type PresentationDeck = {
  id: string;
  title: string;
  slides: PresentationSlide[];
};

export const DEFAULT_PRESENTATION_DECK: PresentationDeck = {
  id: "deck-1",
  title: "Untitled Presentation",
  slides: [
    {
      id: "slide-1",
      title: "Revenue hit a new high",
      body: "Enterprise expansion and product-led growth drove record performance this quarter.",
      layout: "hero",
    },
    {
      id: "slide-2",
      title: "ARCHE",
      body: "The art of transforming spaces goes beyond aesthetics; it creates inspiring environments. Intentional design enhances daily life in various settings, like cozy living rooms, contemporary kitchens, and tranquil bedrooms. By carefully selecting colors, textures, and furnishings, each room reflects personality and purpose, turning houses into homes and workspaces into hubs of innovation.",
      layout: "editorial",
    },
  ],
};
