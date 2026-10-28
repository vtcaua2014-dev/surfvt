import { Link, createFileRoute } from "@tanstack/react-router";
import MapHub from "@/components/MapHub";
import { mapIdFromRouteSlug } from "@/lib/game-types";

export const Route = createFileRoute("/$map")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(search["variant"] === "moded" ? { variant: "moded" as const } : {}),
  }),
  component: MapRoute,
});

function MapRoute() {
  const { map } = Route.useParams();
  const { variant } = Route.useSearch();
  const mapId = mapIdFromRouteSlug(map);

  if (!mapId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-foreground">
        <div>
          <h1 className="text-3xl font-bold">Jogo não encontrado</h1>
          <p className="mt-3 text-muted-foreground">
            Confira o endereço ou volte para a seleção de jogos.
          </p>
          <Link
            className="mt-5 inline-flex rounded-md bg-primary px-5 py-3 text-primary-foreground"
            to="/"
          >
            Voltar ao SurfVT14
          </Link>
        </div>
      </main>
    );
  }

  return (
    <MapHub
      key={mapId}
      initialMap={mapId}
      initialVeniceVariant={variant === "moded" ? "moded" : "normal"}
      autoLaunch
    />
  );
}
