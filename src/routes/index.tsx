import { createFileRoute } from "@tanstack/react-router";
import MapHub from "@/components/MapHub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Subway Surfers Map Hub — SurfVT14" },
      {
        name: "description",
        content:
          "Escolha entre seis mapas Subway Surfers e jogue direto no SurfVT14.",
      },
      { property: "og:title", content: "Subway Surfers Map Hub — SurfVT14" },
      {
        property: "og:description",
        content:
          "Escolha entre seis mapas Subway Surfers e jogue direto no SurfVT14.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapHub,
});
