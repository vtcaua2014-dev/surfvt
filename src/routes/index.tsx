import { createFileRoute } from "@tanstack/react-router";
import MapHub from "@/components/MapHub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SurfVT14 — 27 opções para jogar" },
      {
        name: "description",
        content:
          "Explore 27 opções de mapas e jogos, escolha sua rota e jogue direto no navegador com o SurfVT14.",
      },
      { property: "og:title", content: "SurfVT14 — 27 opções para jogar" },
      {
        property: "og:description",
        content:
          "Explore 27 opções de mapas e jogos, escolha sua rota e jogue direto no navegador com o SurfVT14.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://surfvt14.vercel.app/" }],
  }),
  component: MapHub,
});
