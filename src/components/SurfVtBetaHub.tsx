import {
  ArrowUpRight,
  Download,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isIndependentGame } from "@/lib/game-types";

type BetaMap = {
  id: string;
  name: string;
  region: string;
  path: string;
  icon?: string;
  downloadUrl?: string;
  downloadOnly?: boolean;
  showMark?: boolean;
};

type BetaFilter = "all" | "surfers" | "other";

type BetaCopy = {
  homeEyebrow: string;
  homeDescription: string;
  featuredLabel: string;
  collection: string;
  pickMap: string;
  mapsAvailable: string;
  searchPlaceholder: string;
  clearSearch: string;
  noMapsFound: string;
  selectedBuild: string;
  build: string;
  play: string;
  map: string;
  selectedMap: string;
  communityTitle: string;
  communitySub: string;
  communityCta: string;
};

type BetaLabels = {
  all: string;
  surfers: string;
  other: string;
  headlineA: string;
  headlineB: string;
  random: string;
  download: string;
  warning: string;
};

type BetaHubProps = {
  maps: BetaMap[];
  searchResults: BetaMap[];
  selected: BetaMap;
  selectedMapId: string;
  mapSearch: string;
  filter: BetaFilter;
  labels: BetaLabels;
  copy: BetaCopy;
  p14Backup?: {
    title: string;
    instructions: string;
    warning: string;
    download: string;
  };
  busy: boolean;
  onSearch: (value: string) => void;
  onFilter: (value: BetaFilter) => void;
  onSelectMap: (id: string) => void;
  onPlay: () => void;
};

export default function SurfVtBetaHub({
  maps,
  searchResults,
  selected,
  selectedMapId,
  mapSearch,
  filter,
  labels,
  copy,
  p14Backup,
  busy,
  onSearch,
  onFilter,
  onSelectMap,
  onPlay,
}: BetaHubProps) {
  const visibleMaps = searchResults.filter(
    (map) =>
      filter === "all" ||
      (filter === "other"
        ? isIndependentGame(map.id)
        : !isIndependentGame(map.id)),
  );

  const pickRandomMap = () => {
    const matchingCategory = maps.filter(
      (map) =>
        filter === "all" ||
        (filter === "other"
          ? isIndependentGame(map.id)
          : !isIndependentGame(map.id)),
    );
    const pool = visibleMaps.length ? visibleMaps : matchingCategory;
    const nextMap = pool[Math.floor(Math.random() * pool.length)];
    if (nextMap) onSelectMap(nextMap.id);
  };

  return (
    <section className="beta-home" aria-label="Beta SurfVT">
      <div className="beta-hero-grid">
        <article className="beta-hero-copy">
          <p className="beta-eyebrow">
            <span aria-hidden="true" />
            {copy.homeEyebrow}
          </p>
          <h2>
            {labels.headlineA}
            <span>{labels.headlineB}</span>
          </h2>
          <p className="beta-intro">{copy.homeDescription}</p>
          <div className="beta-hero-stats" aria-label={copy.mapsAvailable}>
            <div>
              <strong>{maps.length}</strong>
              <span>{copy.mapsAvailable}</span>
            </div>
            <div>
              <strong>WEBGL</strong>
              <span>{copy.build}</span>
            </div>
          </div>
          <div className="beta-hero-actions">
            <Button
              type="button"
              className="beta-play-button"
              onClick={onPlay}
              disabled={busy}
            >
              <Play aria-hidden="true" />
              {copy.play} {selected.name}
            </Button>
            <Button asChild variant="outline" className="beta-browse-button">
              <a href="#collection">
                {copy.collection}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="beta-random-button"
              onClick={pickRandomMap}
              disabled={busy || maps.length === 0}
            >
              <Sparkles aria-hidden="true" />
              {labels.random}
            </Button>
          </div>
        </article>

        <aside className="beta-feature-column">
          <article className="beta-featured-build">
            <div className="beta-featured-art">
              {selected.icon ? (
                <img
                  src={selected.icon}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <span aria-hidden="true">{selected.name.slice(0, 1)}</span>
              )}
              <span className="beta-featured-badge">{copy.featuredLabel}</span>
              <span className="beta-featured-index">
                {String(
                  maps.findIndex((map) => map.id === selectedMapId) + 1,
                ).padStart(2, "0")}
              </span>
            </div>
            <div className="beta-featured-details">
              <div>
                <span className="beta-kicker">{copy.selectedBuild}</span>
                <h3>{selected.name}</h3>
                <p>{selected.region}</p>
              </div>
              <span className="beta-build-chip">
                {selected.downloadOnly ? labels.download : "WEBGL"}
              </span>
            </div>
            <Button
              type="button"
              className="beta-featured-launch"
              onClick={onPlay}
              disabled={busy}
            >
              <Play aria-hidden="true" />
              {copy.play} {selected.name}
            </Button>
          </article>

          <a
            id="community"
            className="beta-community-card"
            href="https://discord.gg/jNVZU6pgrm"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/discord-server-icon.png" alt="" />
            <span>
              <strong>{copy.communityTitle}</strong>
              <small>{copy.communitySub}</small>
              <b>
                {copy.communityCta} <ArrowUpRight aria-hidden="true" />
              </b>
            </span>
          </a>
        </aside>
      </div>

      <section id="collection" className="beta-build-library">
        <header className="beta-library-heading">
          <div>
            <p className="beta-eyebrow">SURFVT // BUILDS</p>
            <h2>{copy.collection}</h2>
            <p>{copy.pickMap}</p>
          </div>
          <span className="beta-build-count" role="status">
            {visibleMaps.length}/{maps.length} {copy.mapsAvailable}
          </span>
        </header>

        <div className="beta-library-controls">
          <label className="beta-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={mapSearch}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
            />
            {mapSearch && (
              <button
                type="button"
                onClick={() => onSearch("")}
                aria-label={copy.clearSearch}
              >
                <X aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="beta-filter-row" role="group" aria-label={copy.map}>
            {(["all", "surfers", "other"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={filter === option ? "is-active" : ""}
                aria-pressed={filter === option}
                onClick={() => onFilter(option)}
              >
                {labels[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="beta-map-grid">
          {visibleMaps.map((map) => {
            const active = map.id === selectedMapId;
            return (
              <article
                key={map.id}
                className={`beta-map-card ${active ? "is-selected" : ""}`}
              >
                <button
                  type="button"
                  className="beta-map-select"
                  aria-pressed={active}
                  onClick={() => onSelectMap(map.id)}
                >
                  <span className="beta-map-art">
                    {map.icon ? (
                      <img
                        src={map.icon}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : map.showMark === false ? null : (
                      <span aria-hidden="true">{map.name.slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="beta-map-copy">
                    <strong>{map.name}</strong>
                    <small>{map.region}</small>
                  </span>
                </button>
                <div className="beta-map-footer">
                  <span className="beta-map-status">
                    {isIndependentGame(map.id)
                      ? labels.other
                      : map.downloadOnly
                        ? labels.download
                        : labels.surfers}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => onSelectMap(map.id)}
                  >
                    {active ? copy.selectedMap : copy.map}
                  </Button>
                </div>
              </article>
            );
          })}
          {visibleMaps.length === 0 && (
            <p className="beta-empty-results" role="status">
              {copy.noMapsFound}
            </p>
          )}
        </div>

        <div className="beta-selected-build">
          <p>
            <span className="beta-kicker">{copy.selectedBuild}</span>
            <strong>{selected.name}</strong>
            <small>{selected.region}</small>
          </p>
          <Button type="button" onClick={onPlay} disabled={busy}>
            <Play aria-hidden="true" />
            {copy.play} {selected.name}
          </Button>
        </div>

        {isIndependentGame(selected.id) && (
          <p className="beta-independent-note" role="note">
            {labels.warning}
          </p>
        )}

        {selected.id === "subwaycrackers" && p14Backup && (
          <div className="beta-p14-backup" role="note">
            <div>
              <strong>{p14Backup.title}</strong>
              <p>{p14Backup.instructions}</p>
              <small>{p14Backup.warning}</small>
            </div>
            <a
              href="/downloads/subwaycrackers-p14-save.bin"
              download="SubwayCrackers-P14-save.bin"
            >
              <Download aria-hidden="true" />
              {p14Backup.download}
            </a>
          </div>
        )}
      </section>
    </section>
  );
}
