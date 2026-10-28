export type MapId =
  | "moggers"
  | "cairo"
  | "london"
  | "beijing"
  | "hongkong"
  | "houston"
  | "iceland"
  | "neworleans"
  | "paris"
  | "saintpetersburg"
  | "zurich"
  | "subwaycrackers"
  | "barcelona"
  | "mexico"
  | "miami"
  | "newyork"
  | "sanfrancisco"
  | "tokyo"
  | "bangkok"
  | "berlin"
  | "buenosaires"
  | "havana"
  | "monaco"
  | "moscow"
  | "rio"
  | "venice"
  | "winterholiday";

const mapIds: MapId[] = [
  "zurich",
  "subwaycrackers",
  "cairo",
  "london",
  "berlin",
  "havana",
  "houston",
  "venice",
  "sanfrancisco",
  "beijing",
  "barcelona",
  "buenosaires",
  "miami",
  "bangkok",
  "monaco",
  "moscow",
  "rio",
  "winterholiday",
  "hongkong",
  "iceland",
  "neworleans",
  "paris",
  "saintpetersburg",
  "mexico",
  "newyork",
  "tokyo",
  "moggers",
];

const routeAliases: Partial<Record<MapId, string>> = {
  subwaycrackers: "subway-crackers",
  sanfrancisco: "san-francisco",
  buenosaires: "buenos-aires",
  winterholiday: "winter-holiday",
  hongkong: "hong-kong",
  newyork: "new-york",
  neworleans: "new-orleans",
  saintpetersburg: "saint-petersburg",
};

export function mapRouteSlug(mapId: MapId): string {
  return routeAliases[mapId] || mapId;
}

export function mapIdFromRouteSlug(slug: string): MapId | undefined {
  return mapIds.find((mapId) => mapRouteSlug(mapId) === slug);
}

export function isIndependentGame(mapId: string): boolean {
  return mapId === "moggers" || mapId === "subwaycrackers";
}
