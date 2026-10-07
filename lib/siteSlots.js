export const SLOTS = [
  {
    slot: "hero",
    label: "Hero background",
    fallback: "/destinations/baguio.jpg",
  },
  {
    slot: "baguio",
    label: "Featured: Baguio",
    fallback: "/destinations/baguio.jpg",
  },
  {
    slot: "elnido",
    label: "Featured: El Nido",
    fallback: "/destinations/elnido.jpg",
  },
  {
    slot: "siargao",
    label: "Featured: Siargao",
    fallback: "/destinations/siargao.webp",
  },
  { slot: "cebu", label: "Featured: Cebu", fallback: "/destinations/cebu.jpg" },
];

export const SLOT_KEYS = SLOTS.map((s) => s.slot);
