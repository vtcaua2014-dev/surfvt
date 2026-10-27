import { useCallback, useEffect, useRef, useState } from "react";
import {
  Flag,
  Maximize2,
  Palette,
  Play,
  TriangleAlert,
  Swords,
  Heart,
  Zap,
  Flame,
  X,
  Settings,
  Gauge,
  Keyboard,
  Music2,
  UserRound,
  Trophy,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";

import nightCity from "@/assets/night-city-lobby.jpg";
import newYork from "@/assets/new-york-lobby.jpg";
import { Button } from "@/components/ui/button";
import SurfVtBetaHub from "@/components/SurfVtBetaHub";
import P14Overlays from "@/components/P14Overlays";

type MapId =
  | "moggers"
  | "cairo"
  | "london"
  | "beijing"
  | "cairo"
  | "hongkong"
  | "houston"
  | "iceland"
  | "neworleans"
  | "paris"
  | "saintpetersburg"
  | "zurich"
  | "subwaycrackers"
  | "barcelona"
  | "london"
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
type Theme = "netos" | "spider" | "aot" | "scott" | "jujutsu";
type VeniceVariant = "moded" | "normal";

const maps: Array<{
  id: MapId;
  name: string;
  region: string;
  path: string;
  icon?: string;
  timerCompatible?: boolean;
  downloadUrl?: string;
  downloadOnly?: boolean;
  showMark?: boolean;
}> = [
  {
    id: "zurich",
    name: "Zurich",
    region: "SUÍÇA · BUILD ORIGINAL",
    path: "/maps/zurich/index.html",
    icon: "/map-icons/zurich.png",
  },
  {
    id: "subwaycrackers",
    name: "Subway Crackers",
    region: "JOGO · TEXTURAS E SKINS ORIGINAIS",
    path: "/maps/subwaycrackers/index.html",
    icon: "/maps/subwaycrackers/loading.png",
    timerCompatible: false,
  },
  {
    id: "cairo",
    name: "Cairo",
    region: "EGITO",
    path: "/maps/cairo/index.html",
    icon: "/map-icons/cairo.webp",
  },
  {
    id: "london",
    name: "London",
    region: "REINO UNIDO",
    path: "/maps/london/index.html",
    icon: "/map-icons/london.webp",
  },
  {
    id: "berlin",
    name: "Berlin",
    region: "ALEMANHA · BUILD ORIGINAL",
    path: "/maps/berlin/index.html",
    icon: "/map-icons/berlin-new.webp",
  },
  {
    id: "havana",
    name: "Havana",
    region: "CUBA · BUILD ORIGINAL",
    path: "/maps/havana/index.html",
    icon: "/map-icons/havana.webp",
  },
  {
    id: "houston",
    name: "Houston",
    region: "EUA · BUILD ORIGINAL",
    path: "/maps/houston/index.html",
    icon: "/map-icons/houston.png",
  },
  {
    id: "venice",
    name: "Venice",
    region: "ITÁLIA · BUILD ORIGINAL",
    path: "/maps/venice/index.html",
    icon: "/map-icons/venice-new.png",
  },
  {
    id: "sanfrancisco",
    name: "San Francisco",
    region: "EUA · BUILD ORIGINAL",
    path: "/maps/sanfrancisco/index.html",
    icon: "/map-icons/san-francisco.png",
  },
  {
    id: "beijing",
    name: "Beijing",
    region: "CHINA",
    path: "/maps/beijing/index.html",
    icon: "/map-icons/beijing.webp",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    region: "ESPANHA",
    path: "/maps/barcelona/index.html",
    icon: "/map-icons/barcelona.webp",
  },
  {
    id: "buenosaires",
    name: "Buenos Aires",
    region: "ARGENTINA",
    path: "/maps/buenosaires/index.html",
    icon: "/map-icons/buenos-aires.webp",
  },
  {
    id: "miami",
    name: "Miami",
    region: "EUA · WORLD TOUR",
    path: "/maps/miami/index.html",
    icon: "/map-icons/miami.webp",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    region: "TAILÂNDIA",
    icon: "/map-icons/tavv/bangkok.webp",
    path: "/maps/bangkok/index.html",
  },
  {
    id: "monaco",
    name: "Monaco",
    region: "MÔNACO",
    icon: "/map-icons/tavv/monaco.webp",
    path: "/maps/monaco/index.html",
  },
  {
    id: "moscow",
    name: "Moscow",
    region: "RÚSSIA",
    icon: "/map-icons/tavv/moscow.webp",
    path: "/maps/moscow/index.html",
  },
  {
    id: "rio",
    name: "Rio",
    region: "BRASIL",
    icon: "/map-icons/tavv/rio.webp",
    path: "/maps/rio/index.html",
  },
  {
    id: "winterholiday",
    name: "Winter Holiday",
    region: "ESPECIAL",
    icon: "/map-icons/tavv/winterholiday.webp",
    path: "/maps/winterholiday/index.html",
  },
  {
    id: "hongkong",
    name: "Hong Kong",
    region: "CHINA",
    icon: "/map-icons/tavv/hongkong.webp",
    path: "/maps/hongkong/index.html",
  },
  {
    id: "iceland",
    name: "Iceland",
    region: "ISLÂNDIA",
    icon: "/map-icons/tavv/iceland.jpg",
    path: "/maps/iceland/index.html",
  },
  {
    id: "neworleans",
    name: "New Orleans",
    region: "EUA",
    icon: "/map-icons/gjsantolin/new-orleans.webp",
    path: "/maps/neworleans/index.html",
  },
  {
    id: "paris",
    name: "Paris",
    region: "FRANÇA",
    icon: "/map-icons/tavv/paris.webp",
    path: "/maps/paris/index.html",
  },
  {
    id: "saintpetersburg",
    name: "Saint Petersburg",
    region: "RÚSSIA",
    icon: "/map-icons/tavv/saintpetersburg.webp",
    path: "/maps/saintpetersburg/index.html",
  },
  {
    id: "mexico",
    name: "Mexico",
    region: "MÉXICO",
    icon: "/map-icons/tavv/mexico.webp",
    path: "/maps/mexico/index.html",
  },
  {
    id: "newyork",
    name: "New York",
    region: "EUA",
    icon: "/map-icons/tavv/newyork.jpg",
    path: "/maps/newyork/index.html",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    region: "JAPÃO",
    icon: "/map-icons/tavv/tokyo.webp",
    path: "/maps/tokyo/index.html",
  },
  {
    id: "moggers",
    name: "Subway Moggers",
    region: "JOGO INDEPENDENTE · NÃO É MAPA DE SUBWAY",
    path: "/moggers/index.html",
    icon: "/moggers/imagemog.png",
    timerCompatible: false,
  },
];

const themeMeta: Record<
  Theme,
  {
    label: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    rank: string;
    token: string;
    shop: string;
  }
> = {
  netos: {
    label: "NETOS",
    eyebrow: "SURFVT14 // LOCAL NETWORK",
    title: "MAPA",
    subtitle: "",
    rank: "",
    token: "TOKENS",
    shop: "",
  },
  spider: {
    label: "SPIDER-UI",
    eyebrow: "SPIDER-UI // SYNC NETWORK",
    title: "MAPA",
    subtitle:
      "Uma corrida neon com leitura rápida de pista e reflexos no limite.",
    rank: "SYNC STATUS · 74%",
    token: "COINS",
    shop: "ROSTER",
  },
  aot: {
    label: "ODM CORPS",
    eyebrow: "ODM SURVEY CORPS // RELATÓRIO TÁTICO",
    title: "MAPA",
    subtitle:
      "Relatório de campo: selecione uma pista e avance pela névoa além da muralha.",
    rank: "RECRUTA · 3º ESQUADRÃO",
    token: "LÂMINAS",
    shop: "FICHAS DA TROPA",
  },
  scott: {
    label: "8-BIT ARCADE",
    eyebrow: "CHA CHA CHA // TORONTO ARCADE",
    title: "MAPA",
    subtitle:
      "Press start para entrar na pista. Neve em pixel, riffs e uma batalha por vez.",
    rank: "HP / XP · 82%",
    token: "COINS",
    shop: "CHAR SELECT",
  },
  jujutsu: {
    label: "CURSED ENERGY",
    eyebrow: "JUJUTSU HQ // SHIBUYA NIGHT",
    title: "MAPA",
    subtitle:
      "Concentre a energia amaldiçoada e escolha sua pista antes do próximo confronto.",
    rank: "FEITICEIRO · GRAU 2",
    token: "TALISMÃS",
    shop: "DOMÍNIOS",
  },
};

const themeVisuals: Record<
  Theme,
  { image: string; label: string; caption: string }
> = {
  netos: {
    image: nightCity,
    label: "NEON CITY / NETWORK",
    caption: "referência visual · skyline digital",
  },
  spider: {
    image: newYork,
    label: "SPIDER-UI / NIGHT RUN",
    caption: "referência visual · interface urbana",
  },
  aot: {
    image: "/manus-storage/attack-on-titan_596b5582.png",
    label: "ODM CORPS / FIELD ARCHIVE",
    caption: "referência visual · tropa e equipamento",
  },
  scott: {
    image: "/manus-storage/scott-pilgrim-comic_46f3b331.jpg",
    label: "8-BIT ARCADE / COMIC PANEL",
    caption: "referência visual · HQ, banda e pixels",
  },
  jujutsu: {
    image: "/manus-storage/jujutsu-energy_32d92998.png",
    label: "CURSED ENERGY / DOMAIN",
    caption: "referência visual · energia amaldiçoada",
  },
};

const themeBackdropNames: Record<Theme, { title: string; subtitle: string }> = {
  netos: { title: "NetOS", subtitle: "Cyberpunk" },
  spider: { title: "Spider-UI", subtitle: "Homem-Aranha" },
  aot: { title: "ODM Corps", subtitle: "Attack on Titan" },
  scott: { title: "8Bit Arcade", subtitle: "Scott Pilgrim" },
  jujutsu: { title: "Cursed Energy", subtitle: "Jujutsu Kaisen" },
};

const themeBackdropImages: Record<Theme, string> = {
  netos: nightCity,
  spider: newYork,
  aot: "/manus-storage/attack-on-titan_596b5582.png",
  scott: "/manus-storage/scott-pilgrim-comic_46f3b331.jpg",
  jujutsu: "/manus-storage/jujutsu-energy_32d92998.png",
};

type ControlScheme = "WASD" | "IJKL" | "SETAS" | "PERSONALIZADO";
type Language = "pt-BR" | "en" | "de" | "fr" | "zh";
type BetaFilter = "all" | "surfers" | "other";
const betaUiLabels: Record<
  Language,
  Record<BetaFilter, string> & {
    headlineA: string;
    headlineB: string;
    random: string;
    download: string;
    warning: string;
  }
> = {
  "pt-BR": {
    all: "TODOS",
    surfers: "SUBWAY SURFERS",
    other: "JOGO INDEPENDENTE",
    headlineA: "ESCOLHA SUA",
    headlineB: "PRÓXIMA PISTA.",
    random: "SURPREENDA-ME",
    download: "DOWNLOAD",
    warning:
      "Jogo independente; não é um mapa de Subway Surfers. Cronômetros não são compatíveis.",
  },
  en: {
    all: "ALL",
    surfers: "SUBWAY SURFERS",
    other: "INDEPENDENT GAME",
    headlineA: "RUN THE",
    headlineB: "RIGHT TRACK.",
    random: "SURPRISE ME",
    download: "DOWNLOAD",
    warning:
      "Independent game, not a Subway Surfers map. Timers are not supported.",
  },
  de: {
    all: "ALLE",
    surfers: "SUBWAY SURFERS",
    other: "EIGENSTÄNDIGES SPIEL",
    headlineA: "WÄHLE DEINE",
    headlineB: "NÄCHSTE STRECKE.",
    random: "ZUFALLSAUSWAHL",
    download: "HERUNTERLADEN",
    warning:
      "Eigenständiges Spiel, keine Subway-Surfers-Karte. Timer werden nicht unterstützt.",
  },
  fr: {
    all: "TOUS",
    surfers: "SUBWAY SURFERS",
    other: "JEU INDÉPENDANT",
    headlineA: "CHOISIS TA",
    headlineB: "PROCHAINE PISTE.",
    random: "SURPRENEZ-MOI",
    download: "TÉLÉCHARGER",
    warning:
      "Jeu indépendant, pas une carte Subway Surfers. Les chronomètres ne sont pas compatibles.",
  },
  zh: {
    all: "全部",
    surfers: "SUBWAY SURFERS",
    other: "独立游戏",
    headlineA: "选择你的",
    headlineB: "下一条赛道。",
    random: "随机选择",
    download: "下载",
    warning: "这是独立游戏，不是 Subway Surfers 地图；不支持计时器。",
  },
};
type Resolution =
  "fullscreen" | "608x1080" | "890x1080" | "640x1080" | "840x1080";
type FpsCap = "unlocked" | "30" | "60" | "120" | "240";
type GraphicsMode = "off" | "performance" | "low" | "medium" | "high" | "ultra";
type TimerStyle = "native" | "livesplit" | "chrono";
type HubSettings = {
  saturation: "off" | "low" | "medium" | "high";
  graphicsMode: GraphicsMode;
  timerEnabled: boolean;
  timerStyle: TimerStyle;
  timerStartHotkey: string;
  timerPauseHotkey: string;
  timerResetHotkey: string;
  timerAutoMode: boolean;
  autoBoostEnabled: boolean;
  autoBoostHotkey: string;
  autoBoostCorner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center";
  autoBoostCount: number;
  autoBoostDelay: number;
  wasdEnabled: boolean;
  controls: ControlScheme;
  customControls: { up: string; left: string; down: string; right: string };
  fps: boolean;
  fpsCap: FpsCap;
  soundcloud: boolean;
  soundcloudUrl: string;
  language: Language;
  resolution: Resolution;
  volume: number;
};
const defaultSettings: HubSettings = {
  saturation: "off",
  graphicsMode: "off",
  timerEnabled: true,
  timerStyle: "chrono",
  timerStartHotkey: "q",
  timerPauseHotkey: "q",
  timerResetHotkey: "r",
  timerAutoMode: true,
  autoBoostEnabled: false,
  autoBoostHotkey: "B",
  autoBoostCorner: "bottomLeft",
  autoBoostCount: 3,
  autoBoostDelay: 60,
  wasdEnabled: true,
  controls: "WASD",
  customControls: { up: "T", left: "F", down: "G", right: "H" },
  fps: false,
  fpsCap: "unlocked",
  soundcloud: false,
  soundcloudUrl: "https://soundcloud.com/bdwx/sets/u7j3r9nbxpeu",
  language: "pt-BR",
  resolution: "fullscreen",
  volume: 100,
};
type UserProfile = {
  name: string;
  gamesPlayed: number;
  totalPlayTimeMs: number;
  level: number;
  tokens: number;
  favoriteTheme: Theme;
  favoriteMap: MapId;
  createdAt: string;
  lastPlayedAt: string | null;
  provider: "local" | "discord" | "google";
  avatarUrl: string | null;
};
const defaultProfile: UserProfile = {
  name: "",
  gamesPlayed: 0,
  totalPlayTimeMs: 0,
  level: 0,
  tokens: 0,
  favoriteTheme: "netos",
  favoriteMap: "zurich",
  createdAt: new Date().toISOString(),
  lastPlayedAt: null,
  provider: "local",
  avatarUrl: null,
};

function readStoredProfile(): UserProfile {
  try {
    const stored = JSON.parse(localStorage.getItem("surfvt14-profile") || "{}");
    if (stored.provider !== "google" && stored.provider !== "discord")
      return {
        ...defaultProfile,
        createdAt: stored.createdAt || defaultProfile.createdAt,
      };
    const favoriteMap =
      stored.favoriteMap === "san-francisco"
        ? "sanfrancisco"
        : stored.favoriteMap || defaultProfile.favoriteMap;
    return {
      ...defaultProfile,
      ...stored,
      favoriteMap: maps.some((map) => map.id === favoriteMap)
        ? (favoriteMap as MapId)
        : defaultProfile.favoriteMap,
    };
  } catch {
    return defaultProfile;
  }
}

function formatTime(milliseconds: number) {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const tenths = Math.floor((milliseconds % 1000) / 100);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function formatProfileDuration(milliseconds: number) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  return `${hours}h ${totalMinutes % 60}min`;
}

const uiCopy: Record<
  Language,
  {
    settings: string;
    play: string;
    close: string;
    clearSearch: string;
    map: string;
    mapsAvailable: string;
    online: string;
    soundcloud: string;
    fps: string;
    language: string;
    brandWelcome: string;
    collection: string;
    community: string;
    about: string;
    communityTitle: string;
    communitySub: string;
    nextRun: string;
    pickMap: string;
    collectionHelper: string;
    selectedBuild: string;
    unity: string;
    render: string;
    build: string;
    mapLabel: string;
    madeForRunners: string;
    profileLocal: string;
    profileSynced: string;
    profileLocalDetail: string;
    profileSyncedDetail: string;
    playerName: string;
    games: string;
    playTime: string;
    favoriteTheme: string;
    favoriteMap: string;
    resetStats: string;
    onlineHint: string;
    signDiscord: string;
    signGoogle: string;
    syncProfile: string;
    tokens: string;
    level: string;
    accountOnly: string;
    noLocalProfile: string;
    resolution: string;
    volume: string;
    browserFps: string;
    saturation: string;
    gameTimer: string;
    timerType: string;
    wasd: string;
    pcKeys: string;
    autoBoost: string;
    autoBoostHotkey: string;
    note: string;
    loadingFiles: string;
    loadingUnity: string;
    loadingTrack: string;
    localBuild: string;
    selectedMap: string;
    homeEyebrow: string;
    homeDescription: string;
    searchPlaceholder: string;
    noMapsFound: string;
    featuredLabel: string;
    aboutTitle: string;
    aboutBody: string;
    communityCta: string;
  }
> = {
  "pt-BR": {
    settings: "CONFIGURAÇÕES",
    play: "JOGAR",
    close: "FECHAR",
    clearSearch: "LIMPAR BUSCA",
    map: "SELECIONE O MAPA",
    mapsAvailable: "opções disponíveis",
    online: "CONTA ONLINE",
    soundcloud: "PLAYER SOUNDCLOUD",
    fps: "CONTADOR DE FPS",
    language: "IDIOMA DO SITE",
    brandWelcome: "",
    collection: "Coleção de mapas",
    community: "Comunidade",
    about: "Sobre",
    communityTitle: "DISCORD DA COMUNIDADE",
    communitySub: "novidades, suporte e eventos · entrar no servidor",
    nextRun: "",
    pickMap: "Escolha uma versão e comece a jogar",
    collectionHelper: "",
    selectedBuild: "Build selecionada",
    unity: "UNITY",
    render: "RENDER",
    build: "BUILD",
    mapLabel: "MAPA",
    madeForRunners: "",
    profileLocal: "PERFIL LOCAL",
    profileSynced: "PERFIL SINCRONIZADO",
    profileLocalDetail: "Entre com Google ou Discord para criar seu perfil.",
    profileSyncedDetail: "Seu perfil está vinculado à conta escolhida.",
    playerName: "NOME DO JOGADOR",
    games: "PARTIDAS",
    playTime: "TEMPO JOGADO",
    favoriteTheme: "TEMA FAVORITO",
    favoriteMap: "MAPA FAVORITO",
    resetStats: "REINICIAR ESTATÍSTICAS",
    onlineHint: "Sincronize seu perfil com um provedor",
    signDiscord: "Entrar com Discord",
    signGoogle: "Entrar com Google",
    syncProfile: "Sincronizar perfil",
    tokens: "TOKENS",
    level: "NÍVEL",
    accountOnly: "Disponível após o login",
    noLocalProfile: "Faça login para exibir seu perfil",
    resolution: "RESOLUÇÃO DO JOGO",
    volume: "VOLUME DO JOGO",
    browserFps: "FPS DO NAVEGADOR",
    saturation: "SATURAÇÃO",
    gameTimer: "CRONÔMETRO NO JOGO",
    timerType: "TIPO DE CRONÔMETRO",
    wasd: "WASD NA TELA · PC E CELULAR",
    pcKeys: "TECLAS NA TELA · APENAS PC",
    autoBoost: "AUTOBOOST · 3 CLIQUES NO FOGUETE",
    autoBoostHotkey: "HOTKEY DO AUTOBOOST",
    note: "As configurações são aplicadas imediatamente e ficam salvas neste navegador.",
    loadingFiles: "CARREGANDO ARQUIVOS DO MAPA",
    loadingUnity: "INICIANDO MOTOR UNITY",
    loadingTrack: "PREPARANDO A PISTA",
    localBuild: "BUILD LOCAL · SURFVT14",
    selectedMap: "Mapa selecionado",
    homeEyebrow: "HUB DA COMUNIDADE · WEBGL",
    homeDescription:
      "Explore os mapas, escolha sua versão e entre na pista — direto no navegador.",
    searchPlaceholder: "Buscar por mapa ou região…",
    noMapsFound: "Nenhum mapa encontrado. Tente outro nome ou região.",
    featuredLabel: "ROTA SELECIONADA",
    aboutTitle: "Sobre o SurfVT",
    aboutBody:
      "O SurfVT reúne 27 opções jogáveis no navegador — mapas e um jogo independente — além de perfis opcionais e configurações salvas neste navegador.",
    communityCta: "ABRIR DISCORD",
  },
  en: {
    settings: "SETTINGS",
    play: "PLAY",
    close: "CLOSE",
    clearSearch: "CLEAR SEARCH",
    map: "SELECT MAP",
    mapsAvailable: "playable options",
    online: "ONLINE ACCOUNT",
    soundcloud: "SOUNDCLOUD PLAYER",
    fps: "FPS COUNTER",
    language: "SITE LANGUAGE",
    brandWelcome: "",
    collection: "Map collection",
    community: "Community",
    about: "About",
    communityTitle: "COMMUNITY DISCORD",
    communitySub: "news, support and events · join the server",
    nextRun: "",
    pickMap: "Choose a version and start playing",
    collectionHelper: "",
    selectedBuild: "Selected build",
    unity: "UNITY",
    render: "RENDER",
    build: "BUILD",
    mapLabel: "MAP",
    madeForRunners: "",
    profileLocal: "LOCAL PROFILE",
    profileSynced: "SYNCED PROFILE",
    profileLocalDetail:
      "Sign in with Google or Discord to create your profile.",
    profileSyncedDetail: "Your profile is linked to the selected account.",
    playerName: "PLAYER NAME",
    games: "RUNS",
    playTime: "PLAY TIME",
    favoriteTheme: "FAVORITE THEME",
    favoriteMap: "FAVORITE MAP",
    resetStats: "RESET STATS",
    onlineHint: "Sync your profile with a provider",
    signDiscord: "Sign in with Discord",
    signGoogle: "Sign in with Google",
    syncProfile: "Sync profile",
    tokens: "TOKENS",
    level: "LEVEL",
    accountOnly: "Available after sign-in",
    noLocalProfile: "Sign in to display your profile",
    resolution: "GAME RESOLUTION",
    volume: "GAME VOLUME",
    browserFps: "BROWSER FPS",
    saturation: "SATURATION",
    gameTimer: "IN-GAME TIMER",
    timerType: "TIMER TYPE",
    wasd: "WASD ON SCREEN · PC AND MOBILE",
    pcKeys: "ON-SCREEN KEYS · PC ONLY",
    autoBoost: "AUTOBOOST · 3 ROCKET CLICKS",
    autoBoostHotkey: "AUTOBOOST HOTKEY",
    note: "Settings apply immediately and are saved in this browser.",
    loadingFiles: "LOADING MAP FILES",
    loadingUnity: "STARTING UNITY ENGINE",
    loadingTrack: "PREPARING THE TRACK",
    localBuild: "LOCAL BUILD · SURFVT14",
    selectedMap: "Selected map",
    homeEyebrow: "COMMUNITY HUB · WEBGL",
    homeDescription:
      "Explore the maps, choose a build and hit the track—right in your browser.",
    searchPlaceholder: "Search by map or region…",
    noMapsFound: "No maps found. Try another name or region.",
    featuredLabel: "SELECTED ROUTE",
    aboutTitle: "About SurfVT",
    aboutBody:
      "SurfVT brings together 27 browser-playable options—maps and one standalone game—along with optional profiles and settings saved in this browser.",
    communityCta: "OPEN DISCORD",
  },
  de: {
    settings: "EINSTELLUNGEN",
    play: "SPIELEN",
    close: "SCHLIESSEN",
    clearSearch: "SUCHE LEEREN",
    map: "KARTE WÄHLEN",
    mapsAvailable: "Spieloptionen verfügbar",
    online: "ONLINE-KONTO",
    soundcloud: "SOUNDCLOUD-PLAYER",
    fps: "FPS-ZÄHLER",
    language: "SEITENSPRACHE",
    brandWelcome: "",
    collection: "Kartensammlung",
    community: "Community",
    about: "Über uns",
    communityTitle: "COMMUNITY-DISCORD",
    communitySub: "Neuigkeiten, Hilfe und Events · Server beitreten",
    nextRun: "",
    pickMap: "Wähle eine Version und starte das Spiel",
    collectionHelper: "",
    selectedBuild: "Ausgewählter Build",
    unity: "UNITY",
    render: "RENDER",
    build: "BUILD",
    mapLabel: "KARTE",
    madeForRunners: "",
    profileLocal: "LOKALES PROFIL",
    profileSynced: "SYNCHRONISIERTES PROFIL",
    profileLocalDetail: "Melde dich mit Google oder Discord an.",
    profileSyncedDetail: "Dein Profil ist mit dem Konto verknüpft.",
    playerName: "SPIELERNAME",
    games: "LÄUFE",
    playTime: "SPIELZEIT",
    favoriteTheme: "LIEBLINGSTHEMA",
    favoriteMap: "LIEBLINGSKARTE",
    resetStats: "STATISTIKEN ZURÜCKSETZEN",
    onlineHint: "Profil mit einem Anbieter synchronisieren",
    signDiscord: "Mit Discord anmelden",
    signGoogle: "Mit Google anmelden",
    syncProfile: "Profil synchronisieren",
    tokens: "TOKEN",
    level: "LEVEL",
    accountOnly: "Nach der Anmeldung verfügbar",
    noLocalProfile: "Anmelden, um dein Profil zu sehen",
    resolution: "SPIELAUFLÖSUNG",
    volume: "SPIELLAUTSTÄRKE",
    browserFps: "BROWSER-FPS",
    saturation: "SÄTTIGUNG",
    gameTimer: "SPIELTIMER",
    timerType: "TIMERTYP",
    wasd: "WASD · PC UND MOBIL",
    pcKeys: "TASTEN · NUR PC",
    autoBoost: "AUTOBOOST · 3 ROCKET-KLICKS",
    autoBoostHotkey: "AUTOBOOST-HOTKEY",
    note: "Einstellungen werden sofort angewendet und im Browser gespeichert.",
    loadingFiles: "KARTENDATEIEN WERDEN GELADEN",
    loadingUnity: "UNITY-ENGINE WIRD GESTARTET",
    loadingTrack: "STRECKE WIRD VORBEREITET",
    localBuild: "LOKALER BUILD · SURFVT14",
    selectedMap: "Ausgewählte Karte",
    homeEyebrow: "COMMUNITY-HUB · WEBGL",
    homeDescription:
      "Entdecke die Karten, wähle einen Build und starte direkt im Browser.",
    searchPlaceholder: "Karte oder Region suchen…",
    noMapsFound:
      "Keine Karte gefunden. Suche nach einem anderen Namen oder Ort.",
    featuredLabel: "AUSGEWÄHLTE ROUTE",
    aboutTitle: "Über SurfVT",
    aboutBody:
      "SurfVT vereint 27 im Browser spielbare Optionen – Karten und ein eigenständiges Spiel – sowie optionale Profile und lokal gespeicherte Einstellungen.",
    communityCta: "DISCORD ÖFFNEN",
  },
  fr: {
    settings: "PARAMÈTRES",
    play: "JOUER",
    close: "FERMER",
    clearSearch: "EFFACER LA RECHERCHE",
    map: "CHOISIR LA CARTE",
    mapsAvailable: "options jouables",
    online: "COMPTE EN LIGNE",
    soundcloud: "LECTEUR SOUNDCLOUD",
    fps: "COMPTEUR FPS",
    language: "LANGUE DU SITE",
    brandWelcome: "",
    collection: "Collection de cartes",
    community: "Communauté",
    about: "À propos",
    communityTitle: "DISCORD DE LA COMMUNAUTÉ",
    communitySub: "actualités, aide et événements · rejoindre le serveur",
    nextRun: "",
    pickMap: "Choisissez une version et commencez à jouer",
    collectionHelper: "",
    selectedBuild: "Version sélectionnée",
    unity: "UNITY",
    render: "RENDU",
    build: "VERSION",
    mapLabel: "CARTE",
    madeForRunners: "",
    profileLocal: "PROFIL LOCAL",
    profileSynced: "PROFIL SYNCHRONISÉ",
    profileLocalDetail: "Connectez-vous avec Google ou Discord.",
    profileSyncedDetail: "Votre profil est lié au compte choisi.",
    playerName: "NOM DU JOUEUR",
    games: "COURSES",
    playTime: "TEMPS DE JEU",
    favoriteTheme: "THÈME FAVORI",
    favoriteMap: "CARTE FAVORITE",
    resetStats: "RÉINITIALISER LES STATS",
    onlineHint: "Synchronisez votre profil avec un fournisseur",
    signDiscord: "Se connecter avec Discord",
    signGoogle: "Se connecter avec Google",
    syncProfile: "Synchroniser le profil",
    tokens: "JETONS",
    level: "NIVEAU",
    accountOnly: "Disponible après connexion",
    noLocalProfile: "Connectez-vous pour afficher votre profil",
    resolution: "RÉSOLUTION DU JEU",
    volume: "VOLUME DU JEU",
    browserFps: "FPS DU NAVIGATEUR",
    saturation: "SATURATION",
    gameTimer: "CHRONOMÈTRE EN JEU",
    timerType: "TYPE DE CHRONOMÈTRE",
    wasd: "WASD · PC ET MOBILE",
    pcKeys: "TOUCHES · PC UNIQUEMENT",
    autoBoost: "AUTOBOOST · 3 CLICS FUSÉE",
    autoBoostHotkey: "TOUCHE AUTOBOOST",
    note: "Les réglages sont appliqués immédiatement et sauvegardés dans ce navigateur.",
    loadingFiles: "CHARGEMENT DES FICHIERS",
    loadingUnity: "DÉMARRAGE DU MOTEUR UNITY",
    loadingTrack: "PRÉPARATION DE LA PISTE",
    localBuild: "VERSION LOCALE · SURFVT14",
    selectedMap: "Carte sélectionnée",
    homeEyebrow: "HUB COMMUNAUTAIRE · WEBGL",
    homeDescription:
      "Explorez les cartes, choisissez une version et partez sur la piste dans votre navigateur.",
    searchPlaceholder: "Rechercher par carte ou région…",
    noMapsFound:
      "Aucune carte trouvée. Essayez un autre nom ou une autre région.",
    featuredLabel: "ITINÉRAIRE SÉLECTIONNÉ",
    aboutTitle: "À propos de SurfVT",
    aboutBody:
      "SurfVT réunit 27 options jouables dans le navigateur — des cartes et un jeu indépendant — avec des profils facultatifs et des réglages enregistrés dans ce navigateur.",
    communityCta: "OUVRIR DISCORD",
  },
  zh: {
    settings: "设置",
    play: "开始游戏",
    close: "关闭",
    clearSearch: "清除搜索",
    map: "选择地图",
    mapsAvailable: "个可玩选项",
    online: "在线账户",
    soundcloud: "SOUNDCLOUD 播放器",
    fps: "FPS 计数器",
    language: "网站语言",
    brandWelcome: "",
    collection: "地图合集",
    community: "社区",
    about: "关于",
    communityTitle: "社区 DISCORD",
    communitySub: "新闻、支持和活动 · 加入服务器",
    nextRun: "",
    pickMap: "选择一个版本并开始游戏",
    collectionHelper: "",
    selectedBuild: "当前版本",
    unity: "UNITY",
    render: "渲染",
    build: "版本",
    mapLabel: "地图",
    madeForRunners: "",
    profileLocal: "本地档案",
    profileSynced: "已同步档案",
    profileLocalDetail: "使用 Google 或 Discord 登录以创建档案。",
    profileSyncedDetail: "档案已连接到所选账户。",
    playerName: "玩家名称",
    games: "场次",
    playTime: "游戏时间",
    favoriteTheme: "常用主题",
    favoriteMap: "常用地图",
    resetStats: "重置统计",
    onlineHint: "与账户同步档案",
    signDiscord: "使用 Discord 登录",
    signGoogle: "使用 Google 登录",
    syncProfile: "同步档案",
    tokens: "代币",
    level: "等级",
    accountOnly: "登录后可用",
    noLocalProfile: "登录后显示你的档案",
    resolution: "游戏分辨率",
    volume: "游戏音量",
    browserFps: "浏览器 FPS",
    saturation: "饱和度",
    gameTimer: "游戏计时器",
    timerType: "计时器类型",
    wasd: "屏幕 WASD · 电脑和手机",
    pcKeys: "屏幕按键 · 仅电脑",
    autoBoost: "自动加速 · 火箭点击 3 次",
    autoBoostHotkey: "自动加速热键",
    note: "设置会立即应用并保存在此浏览器中。",
    loadingFiles: "正在加载地图文件",
    loadingUnity: "正在启动 UNITY 引擎",
    loadingTrack: "正在准备赛道",
    localBuild: "本地版本 · SURFVT14",
    selectedMap: "当前地图",
    homeEyebrow: "社区 HUB · WEBGL",
    homeDescription: "浏览地图、选择版本并直接在浏览器中出发。",
    searchPlaceholder: "搜索地图或地区…",
    noMapsFound: "没有找到地图，请尝试其他名称或地区。",
    featuredLabel: "已选择路线",
    aboutTitle: "关于 SurfVT",
    aboutBody:
      "SurfVT 汇集了 27 个可在浏览器中游玩的选项，包括地图和一款独立游戏，并提供可选档案和保存在此浏览器中的设置。",
    communityCta: "打开 DISCORD",
  },
};

const p14BackupCopy: Record<
  Language,
  { title: string; instructions: string; warning: string; download: string }
> = {
  "pt-BR": {
    title: "SAVE DO SUBWAY CRACKERS · P14 FUNCTIONS",
    instructions:
      "Com o jogo aberto, use P14 Functions → Restaurar e selecione o arquivo baixado. Se solicitado, confirme a restauração entre sites.",
    warning: "Faça um backup do seu progresso atual antes de restaurar.",
    download: "BAIXAR BACKUP P14",
  },
  en: {
    title: "SUBWAY CRACKERS SAVE · P14 FUNCTIONS",
    instructions:
      "With the game open, use P14 Functions → Restore and select the downloaded file. If prompted, confirm the cross-site restore.",
    warning: "Back up your current progress before restoring.",
    download: "DOWNLOAD P14 BACKUP",
  },
  de: {
    title: "SUBWAY-CRACKERS-SPIELSTAND · P14 FUNCTIONS",
    instructions:
      "Öffne das Spiel, wähle in P14 Functions → Wiederherstellen die heruntergeladene Datei und bestätige bei Bedarf die Wiederherstellung zwischen Websites.",
    warning:
      "Sichere deinen aktuellen Spielfortschritt vor der Wiederherstellung.",
    download: "P14-BACKUP HERUNTERLADEN",
  },
  fr: {
    title: "SAUVEGARDE SUBWAY CRACKERS · P14 FUNCTIONS",
    instructions:
      "Jeu ouvert, choisissez P14 Functions → Restaurer puis sélectionnez le fichier téléchargé. Si demandé, confirmez la restauration entre sites.",
    warning: "Sauvegardez votre progression actuelle avant la restauration.",
    download: "TÉLÉCHARGER LA SAUVEGARDE P14",
  },
  zh: {
    title: "SUBWAY CRACKERS 存档 · P14 FUNCTIONS",
    instructions:
      "打开游戏后，在 P14 Functions 中选择“恢复”并选取下载的文件；如有提示，请确认跨站点恢复。",
    warning: "恢复前请先备份当前进度。",
    download: "下载 P14 备份",
  },
};

function saturationValue(level: HubSettings["saturation"]) {
  return level === "off"
    ? 1
    : level === "low"
      ? 1.25
      : level === "medium"
        ? 1.5
        : 1.9;
}

const externalTimerFiles = [
  ["livesplit", "/chronometers/livesplit.js"],
  ["chrono", "/chronometers/chrono.js"],
  ["native", "/chronometers/floatingclock.js"],
  ["controller", "/chronometers/timer-controller.js"],
  ["keystrokes", "/chronometers/keystrokes.js"],
  ["settings", "/chronometers/timer-settings.js"],
] as const;
const externalTimerLoads = new WeakMap<Document, Promise<void>>();

function ensureExternalTimerScripts(doc: Document): Promise<void> {
  const pending = externalTimerLoads.get(doc);
  if (pending) return pending;
  const task = (async () => {
    const head = doc.head || doc.documentElement;
    if (!head) return;
    const cover = doc.createElement("style");
    cover.id = "surfvt14-timer-preload-hide";
    cover.textContent = "#chrono,#p14-chrono,#p14-floatingclock{visibility:hidden!important}";
    head.appendChild(cover);
    for (const [name, src] of externalTimerFiles) {
      const script = doc.createElement("script");
      script.src = src;
      script.dataset.surfvt14Timer = name;
      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
        script.onerror = () => resolve();
        head.appendChild(script);
      });
    }
    cover.remove();
  })();
  externalTimerLoads.set(doc, task);
  return task;
}

function configureExternalTimers(doc: Document, enabled: boolean, settings: HubSettings, controlKeys: string[]) {
  const gameWindow = doc.defaultView;
  if (!gameWindow || doc.URL === "about:blank") return;
  const hasController = Boolean(doc.querySelector('script[data-surfvt14-timer="controller"]'));
  const send = () => gameWindow.postMessage(
    { type: "SURFVT14_TIMERS_CONFIG", enabled, mode: settings.timerStyle, startHotkey: settings.timerStartHotkey, pauseHotkey: settings.timerPauseHotkey, resetHotkey: settings.timerResetHotkey, autoMode: settings.timerAutoMode, wasdEnabled: settings.wasdEnabled, controlKeys },
    window.location.origin,
  );
  if (hasController) send();
  else if (enabled) void ensureExternalTimerScripts(doc).then(send);
}

type GamePlayerProps = {
  map: MapId;
  mapPath: string;
  mapDownloadUrl?: string;
  downloadOnly?: boolean;
  isVisible: boolean;
  onClose: () => void;
  onProgress: (progress: number) => void;
  onReady: () => void;
  onError: (message: string) => void;
  errorMessage: string | null;
  settings: HubSettings;
  onTimerSettingsChange: (changes: Partial<Pick<HubSettings, "timerStyle" | "timerStartHotkey" | "timerPauseHotkey" | "timerResetHotkey" | "timerAutoMode">>) => void;
  veniceVariant?: VeniceVariant;
};

function GamePlayer({
  map,
  mapPath,
  mapDownloadUrl,
  downloadOnly = false,
  isVisible,
  onClose,
  onProgress,
  onReady,
  onError,
  errorMessage,
  settings,
  onTimerSettingsChange,
  veniceVariant = "normal",
}: GamePlayerProps) {
  // Venice Moded continua mostrando o cronômetro, mas recebe record=off
  // e permanece fora do fluxo de recordes.
  const timerCompatible = map !== "moggers" && !downloadOnly;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const soundcloudRef = useRef<HTMLIFrameElement>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [soundcloudPosition, setSoundcloudPosition] = useState(0);
  const activeControlKey = useRef<string | null>(null);
  const lastControlPress = useRef<{ key: string; at: number }>({
    key: "",
    at: 0,
  });
  useEffect(() => {
    const onTimerSettings = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.type !== "SURFVT14_TIMER_SETTINGS_CHANGE") return;
      const changes = event.data.changes || {};
      const patch: Partial<Pick<HubSettings, "timerStyle" | "timerStartHotkey" | "timerPauseHotkey" | "timerResetHotkey" | "timerAutoMode">> = {};
      if (["native", "chrono", "livesplit"].includes(changes.timerStyle)) patch.timerStyle = changes.timerStyle;
      for (const key of ["timerStartHotkey", "timerPauseHotkey", "timerResetHotkey"] as const) if (typeof changes[key] === "string" && changes[key].length <= 1) patch[key] = changes[key].toLowerCase() || (key === "timerResetHotkey" ? "r" : "q");
      if (typeof changes.timerAutoMode === "boolean") patch.timerAutoMode = changes.timerAutoMode;
      if (Object.keys(patch).length) onTimerSettingsChange(patch);
    };
    window.addEventListener("message", onTimerSettings);
    return () => window.removeEventListener("message", onTimerSettings);
  }, [onTimerSettingsChange]);
  useEffect(() => {
    if (!downloadOnly) return;
    onProgress(1);
    onReady();
  }, [downloadOnly]);
  useEffect(() => {
    if (!timerCompatible || !isVisible || !settings.timerEnabled) {
      const doc = frameRef.current?.contentDocument;
      if (doc) configureExternalTimers(doc, false, settings, controlKeys);
      return;
    }
    const frame = frameRef.current;
    if (!frame) return;
    const sync = () => {
      const doc = frame.contentDocument;
      if (!doc || doc.URL === "about:blank") return;
      configureExternalTimers(doc, settings.timerEnabled, settings, controlKeys);
    };
    frame.addEventListener("load", sync);
    sync();
    return () => {
      frame.removeEventListener("load", sync);
      const doc = frame.contentDocument;
      if (doc) configureExternalTimers(doc, false, settings.timerStyle, settings.timerToggleHotkey, settings.timerResetHotkey);
    };
  }, [timerCompatible, isVisible, settings.timerEnabled, settings.timerStyle, settings.timerStartHotkey, settings.timerPauseHotkey, settings.timerResetHotkey, settings.timerAutoMode, settings.wasdEnabled]);

  useEffect(() => {
    if (!timerCompatible || !isVisible || !settings.timerEnabled) return;
    const sendCommand = (action: "toggle" | "start" | "pause" | "reset") => frameRef.current?.contentWindow?.postMessage({ type: "SURFVT14_TIMER_COMMAND", action }, window.location.origin);
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      const start = settings.timerStartHotkey.toLowerCase(), pause = settings.timerPauseHotkey.toLowerCase(), reset = settings.timerResetHotkey.toLowerCase();
      if (![start, pause, reset].includes(key)) return;
      event.preventDefault();
      sendCommand(start === pause && key === start ? "toggle" : key === start ? "start" : key === pause ? "pause" : "reset");
    };
    const toggleEvent = () => sendCommand("toggle");
    const resetEvent = () => sendCommand("reset");
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("SURFVT14_TIMER_TOGGLE", toggleEvent);
    window.addEventListener("SURFVT14_TIMER_RESET", resetEvent);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("SURFVT14_TIMER_TOGGLE", toggleEvent);
      window.removeEventListener("SURFVT14_TIMER_RESET", resetEvent);
    };
  }, [timerCompatible, isVisible, settings.timerEnabled, settings.timerStartHotkey, settings.timerPauseHotkey, settings.timerResetHotkey]);

  const customControlKeys = [
    settings.customControls.up,
    settings.customControls.left,
    settings.customControls.down,
    settings.customControls.right,
  ];
  const controlKeys =
    settings.controls === "IJKL"
      ? ["I", "J", "K", "L"]
      : settings.controls === "SETAS"
        ? ["↑", "←", "↓", "→"]
        : settings.controls === "PERSONALIZADO"
          ? customControlKeys
          : ["W", "A", "S", "D"];
  const resolutionSize: Record<Resolution, { width: string; height: string }> =
    {
      fullscreen: { width: "100%", height: "100%" },
      "608x1080": { width: "608px", height: "1080px" },
      "890x1080": { width: "890px", height: "1080px" },
      "640x1080": { width: "640px", height: "1080px" },
      "840x1080": { width: "840px", height: "1080px" },
    };
  const lastAutoBoostTriggerAt = useRef(0);
  const triggerAutoBoost = () => {
    const now = performance.now();
    if (now - lastAutoBoostTriggerAt.current < 350) return;
    lastAutoBoostTriggerAt.current = now;
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    const canvas = doc?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!doc || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const inset = Math.max(12, Math.min(40, rect.width / 8, rect.height / 8));
    const points: Record<string, [number, number]> = {
      topLeft: [rect.left + inset, rect.top + inset],
      topRight: [rect.right - inset, rect.top + inset],
      bottomLeft: [rect.left + inset, rect.bottom - inset],
      bottomRight: [rect.right - inset, rect.bottom - inset],
      center: [rect.left + rect.width / 2, rect.top + rect.height / 2],
    };
    const [clientX, clientY] = points[settings.autoBoostCorner] ?? points.bottomLeft;
    // Dispatch on the canvas itself. On mobile, elementFromPoint can return a
    // Unity child surface that does not have the WebGL input handlers attached.
    const target = canvas as HTMLElement;
    canvas.focus?.();
    const click = () => {
      const view = frame?.contentWindow ?? window;
      const mouse = {
        bubbles: true,
        cancelable: true,
        view,
        clientX,
        clientY,
        button: 0,
        buttons: 1,
      };
      const pointerInit = {
        ...mouse,
        pointerId: 914,
        pointerType: "mouse",
        isPrimary: true,
        width: 1,
        height: 1,
        pressure: 0.7,
      } as PointerEventInit;
      // Unity 2019 mobile builds commonly listen to touch events, while the
      // desktop builds listen to mouse/pointer events. Send both families.
      try {
        target.dispatchEvent(new PointerEvent("pointerdown", pointerInit));
      } catch (_) {}
      target.dispatchEvent(new MouseEvent("mousedown", mouse));
      try {
        target.dispatchEvent(
          new PointerEvent("pointerup", {
            ...pointerInit,
            buttons: 0,
            pressure: 0,
          }),
        );
      } catch (_) {}
      target.dispatchEvent(new MouseEvent("mouseup", { ...mouse, buttons: 0 }));
      target.dispatchEvent(new MouseEvent("click", mouse));
    };
    Array.from({ length: Math.max(1, Math.min(10, Number(settings.autoBoostCount) || 3)) }, (_, index) => index * Math.max(10, Number(settings.autoBoostDelay) || 60)).forEach((delay) => window.setTimeout(click, delay));
  };

  useEffect(() => {
    setIsDesktop(
      typeof window !== "undefined" &&
        navigator.maxTouchPoints === 0 &&
        !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
    );
  }, []);


  useEffect(() => {
    const normalizeKey = (value: string) => {
      const key = value.trim().toLowerCase();
      return (
        (
          {
            "↑": "arrowup",
            "←": "arrowleft",
            "↓": "arrowdown",
            "→": "arrowright",
          } as Record<string, string>
        )[key] ?? key
      );
    };
    const movementMap: Record<string, string> =
      settings.controls === "IJKL"
        ? { i: "ArrowUp", j: "ArrowLeft", k: "ArrowDown", l: "ArrowRight" }
        : settings.controls === "SETAS"
          ? {
              arrowup: "ArrowUp",
              arrowleft: "ArrowLeft",
              arrowdown: "ArrowDown",
              arrowright: "ArrowRight",
            }
          : settings.controls === "PERSONALIZADO"
            ? {
                [normalizeKey(settings.customControls.up)]: "ArrowUp",
                [normalizeKey(settings.customControls.left)]: "ArrowLeft",
                [normalizeKey(settings.customControls.down)]: "ArrowDown",
                [normalizeKey(settings.customControls.right)]: "ArrowRight",
              }
            : { w: "ArrowUp", a: "ArrowLeft", s: "ArrowDown", d: "ArrowRight" };
    const movementKeys = new Set(Object.keys(movementMap));
    const keyCodes: Record<string, number> = {
      ArrowUp: 38,
      ArrowLeft: 37,
      ArrowDown: 40,
      ArrowRight: 39,
    };
    const forwardKey = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key);
      if (!movementKeys.has(key)) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      const frame = frameRef.current;
      const doc = frame?.contentDocument;
      if (!frame?.contentWindow || !doc || event.target === frame) return;
      const mapped = movementMap[key];
      if (!mapped) return;
      setPressedKey(event.type === "keydown" ? event.key.toUpperCase() : null);
      const eventInit = {
        key: mapped,
        code: mapped,
        bubbles: true,
        cancelable: true,
        repeat: event.repeat,
      };
      // Unity WebGL registra o teclado no document do iframe, não apenas na window.
      const synthetic = new KeyboardEvent(event.type, eventInit);
      try {
        Object.defineProperty(synthetic, "keyCode", {
          value: keyCodes[mapped] ?? event.keyCode,
        });
        Object.defineProperty(synthetic, "which", {
          value: keyCodes[mapped] ?? event.which,
        });
      } catch {
        /* Alguns navegadores não permitem sobrescrever propriedades legadas. */
      }
      frame.contentWindow.postMessage(
        {
          type: "SURFVT14_KEY",
          eventType: event.type,
          key: mapped,
          code: mapped,
          keyCode: keyCodes[mapped] ?? event.keyCode,
          repeat: event.repeat,
        },
        "*",
      );
      event.preventDefault();
    };
    const handleGlobalTimer = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      const key = event.key.toLowerCase();
      if (timerCompatible || (key !== "q" && key !== "r")) return;
      const timerEvent =
        key === "q" ? "SURFVT14_TIMER_TOGGLE" : "SURFVT14_TIMER_RESET";
      window.dispatchEvent(new Event(timerEvent));
      event.preventDefault();
    };
    window.addEventListener("keydown", forwardKey, true);
    window.addEventListener("keyup", forwardKey, true);
    window.addEventListener("keydown", handleGlobalTimer, true);
    return () => {
      window.removeEventListener("keydown", forwardKey, true);
      window.removeEventListener("keyup", forwardKey, true);
      window.removeEventListener("keydown", handleGlobalTimer, true);
    };
  }, [settings.controls, settings.customControls, timerCompatible]);

  useEffect(() => {
    if (map === "moggers" || !settings.autoBoostEnabled) return;
    const hotkey = settings.autoBoostHotkey.trim().toLowerCase();
    if (!hotkey) return;
    const matchesHotkey = (key: string, code: string) => {
      const normalizedCode = code.toLowerCase().replace(/^key/, "");
      return key.toLowerCase() === hotkey || normalizedCode === hotkey;
    };
    const handleAutoBoost = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      if (!matchesHotkey(event.key, event.code)) return;
      event.preventDefault();
      triggerAutoBoost();
    };
    const handleGameKey = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type !== "SURFVT14_GAME_KEY" || data.repeat) return;
      if (!matchesHotkey(String(data.key || ""), String(data.code || "")))
        return;
      triggerAutoBoost();
    };
    window.addEventListener("keydown", handleAutoBoost, true);
    window.addEventListener("message", handleGameKey);
    return () => {
      window.removeEventListener("keydown", handleAutoBoost, true);
      window.removeEventListener("message", handleGameKey);
    };
  }, [map, settings.autoBoostEnabled, settings.autoBoostHotkey, settings.autoBoostCorner, settings.autoBoostCount, settings.autoBoostDelay]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const profiles: Partial<Record<GraphicsMode, Record<string, unknown>>> = {
      performance: { dpr: 0.75, aa: false, power: "high-performance", q: 0, look: null, sharp: 0, vignette: 0, auto: { target: 55, warm: 4000, every: 2500, window: 1500, steps: [1, 0.83, 0.68, 0.56, 0.47] } },
      low: { dpr: 0.5, aa: false, power: "low-power", q: 0, look: { b: 0.97, c: 0.94, s: 0.88 }, sharp: 0, vignette: 0 },
      medium: { dpr: 1, aa: true, power: "default", q: 1, look: { b: 1, c: 1.04, s: 1.06 }, sharp: 0, vignette: 0 },
      high: { dpr: 1.5, aa: true, power: "high-performance", q: 2, look: { b: 1.02, c: 1.08, s: 1.18 }, sharp: 1, vignette: 0 },
      ultra: { dpr: 2, aa: true, power: "high-performance", q: 2, look: { b: 1.03, c: 1.1, s: 1.25 }, sharp: 2, vignette: 0.22 },
    };
    const applyBridgeConfig = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.documentElement) return;
        const profile = profiles[settings.graphicsMode];
        const config = {
          here: true,
          wasd: { on: false },
          gfx: profile ? { mode: settings.graphicsMode, ...profile } : null,
        };
        const serialized = JSON.stringify(config);
        if (doc.documentElement.dataset.p14Cfg !== serialized) {
          doc.documentElement.dataset.p14Cfg = serialized;
          doc.dispatchEvent(new Event("p14:cfg"));
        }
        if (!doc.querySelector('script[data-surfvt14-p14-bridge]')) {
          const script = doc.createElement("script");
          script.src = "/chronometers/p14-bridge-main.js";
          script.async = false;
          script.dataset.surfvt14P14Bridge = "true";
          (doc.head || doc.documentElement).appendChild(script);
        }
      } catch {
        // Cross-origin maps cannot expose their document to the site hub.
      }
    };
    frame.addEventListener("load", applyBridgeConfig);
    applyBridgeConfig();
    const retry = window.setInterval(applyBridgeConfig, 300);
    return () => {
      frame.removeEventListener("load", applyBridgeConfig);
      window.clearInterval(retry);
    };
  }, [settings.graphicsMode]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    const sendSettings = () => {
      const target = frame.contentWindow;
      if (!target) return;
      target.postMessage(
        {
          type: "SURFVT14_HUB_SETTINGS",
          settings: {
            controls: settings.controls,
            graphicsMode: settings.graphicsMode,
            timerEnabled: settings.timerEnabled,
            saturation: settings.saturation,
            fpsCap: settings.fpsCap,
            volume: settings.volume,
            autoBoostEnabled: settings.autoBoostEnabled,
            autoBoostHotkey: settings.autoBoostHotkey,
            autoBoostCorner: settings.autoBoostCorner,
            autoBoostCount: settings.autoBoostCount,
            autoBoostDelay: settings.autoBoostDelay,
          },
        },
        "*",
      );
      target.postMessage(
        { type: "SURFVT14_FRAME_CAP", fpsCap: settings.fpsCap },
        "*",
      );
    };
    // Send immediately for an already-loaded iframe and again after every
    // navigation. This is what makes the FPS choice apply on desktop and
    // touch devices instead of depending on a race with the Unity loader.
    frame.addEventListener("load", sendSettings);
    sendSettings();
    return () => frame.removeEventListener("load", sendSettings);
  }, [settings]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "SURFVT14_GAME_PROGRESS")
        onProgress(Number(event.data.progress) || 0);
      if (event.data?.type === "SURFVT14_GAME_READY") onReady();
      if (event.data?.type === "SURFVT14_GAME_ERROR")
        onError(
          String(event.data.message || "A build local não pôde ser carregada."),
        );
      if (timerCompatible && event.data?.type === "SURFVT14_TIMER_TOGGLE")
        window.dispatchEvent(new Event("SURFVT14_TIMER_TOGGLE"));
      if (timerCompatible && event.data?.type === "SURFVT14_TIMER_SPLIT")
        window.dispatchEvent(new Event("SURFVT14_TIMER_SPLIT"));
      if (timerCompatible && event.data?.type === "SURFVT14_TIMER_RESET")
        window.dispatchEvent(new Event("SURFVT14_TIMER_RESET"));
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onError, onProgress, onReady, timerCompatible]);

  useEffect(() => {
    const handleSoundCloudMessage = (event: MessageEvent) => {
      if (event.source !== soundcloudRef.current?.contentWindow) return;
      const payload = event.data;
      if (
        payload?.method === "playProgress" &&
        payload?.args?.[0]?.currentPosition != null
      ) {
        setSoundcloudPosition(Number(payload.args[0].currentPosition) || 0);
      }
    };
    window.addEventListener("message", handleSoundCloudMessage);
    return () => window.removeEventListener("message", handleSoundCloudMessage);
  }, []);

  const pressControlKey = (key: string) => {
    if (activeControlKey.current === key) return;
    const now = Date.now();
    if (
      lastControlPress.current.key === key &&
      now - lastControlPress.current.at < 35
    )
      return;
    lastControlPress.current = { key, at: now };
    activeControlKey.current = key;
    const actual =
      (
        {
          "↑": "ArrowUp",
          "←": "ArrowLeft",
          "↓": "ArrowDown",
          "→": "ArrowRight",
        } as Record<string, string>
      )[key] ?? key;
    setPressedKey(key);
    const down = new KeyboardEvent("keydown", {
      key: actual,
      code: actual,
      bubbles: true,
      cancelable: true,
    });
    const frame = frameRef.current;
    frame?.contentWindow?.postMessage(
      {
        type: "SURFVT14_KEY",
        eventType: "keydown",
        key: actual,
        code: actual,
        keyCode:
          (
            {
              ArrowUp: 38,
              ArrowLeft: 37,
              ArrowDown: 40,
              ArrowRight: 39,
            } as Record<string, number>
          )[actual] ?? 0,
      },
      "*",
    );
  };
  const releaseControlKey = (key: string) => {
    if (activeControlKey.current !== key) return;
    const actual =
      (
        {
          "↑": "ArrowUp",
          "←": "ArrowLeft",
          "↓": "ArrowDown",
          "→": "ArrowRight",
        } as Record<string, string>
      )[key] ?? key;
    const frame = frameRef.current;
    frame?.contentWindow?.postMessage(
      {
        type: "SURFVT14_KEY",
        eventType: "keyup",
        key: actual,
        code: actual,
        keyCode:
          (
            {
              ArrowUp: 38,
              ArrowLeft: 37,
              ArrowDown: 40,
              ArrowRight: 39,
            } as Record<string, number>
          )[actual] ?? 0,
      },
      "*",
    );
    activeControlKey.current = null;
    setPressedKey(null);
  };
  const pressControlDown = (
    key: string,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      /* Alguns WebViews recusam captura sintética. */
    }
    pressControlKey(key);
  };
  const displayControlKeys = isDesktop ? controlKeys : ["↑", "←", "↓", "→"];
  const soundcloudCommand = (method: "prev" | "next") =>
    soundcloudRef.current?.contentWindow?.postMessage({ method }, "*");
  const skipSoundCloud = (seconds: number) => {
    const nextPosition = Math.max(0, soundcloudPosition + seconds * 1000);
    setSoundcloudPosition(nextPosition);
    soundcloudRef.current?.contentWindow?.postMessage(
      { method: "seekTo", value: nextPosition },
      "*",
    );
  };
  const frameSize = resolutionSize[settings.resolution];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-background transition-opacity duration-500 ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!isVisible}
    >
      <div className="game-toolbar">
        <div className="flex min-w-0 items-center gap-3">
          <span className="status-dot" />
          <span className="ui-font truncate text-sm">
            {map.toUpperCase()} / SURFVT14
          </span>
        </div>
        <div className="game-toolbar-actions">
          {settings.timerStyle !== "livesplit" && (
            <span className="keyboard-hint">
              WASD / SETAS · Q PAUSAR/INICIAR · R REINICIAR
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar jogo"
          >
            <X />
            <span className="hidden sm:inline">FECHAR</span>
          </Button>
        </div>
      </div>
      {errorMessage ? (
        <div className="game-fallback" role="alert">
          <div className="game-fallback-card">
            <div className="fallback-icon">
              <TriangleAlert aria-hidden="true" />
            </div>
            <p className="ui-font text-xs text-secondary">
              {map.toUpperCase()} //{" "}
              {downloadOnly ? "PACOTE ANDROID" : "BUILD LOCAL"}
            </p>
            <h2 className="display-font mt-3 text-3xl sm:text-5xl">
              ERRO AO INICIAR
            </h2>
            <p className="body-font mt-4 max-w-xl text-muted-foreground">
              {downloadOnly
                ? "Este arquivo é a versão Android original enviada para o projeto. Ele não é uma build WebGL e precisa ser instalado em um dispositivo Android compatível."
                : "A build WebGL foi localizada, mas o Unity não conseguiu inicializar este mapa. O diagnóstico abaixo identifica a etapa que falhou."}
            </p>
            <div className="fallback-status">
              <span className="status-dot" />
              {errorMessage}
            </div>
            <div className="fallback-grid">
              <div>
                <strong>MAPA</strong>
                <span>{map.toUpperCase()}</span>
              </div>
              <div>
                <strong>BUILD</strong>
                <span>{downloadOnly ? "ANDROID" : "LOCAL"}</span>
              </div>
              <div>
                <strong>CONEXÃO</strong>
                <span>{downloadOnly ? "ARQUIVO ORIGINAL" : "LOCAL"}</span>
              </div>
              <div>
                <strong>STATUS</strong>
                <span>INICIALIZAÇÃO FALHOU</span>
              </div>
            </div>
            <Button className="mt-6" onClick={onClose}>
              <X />
              <span>VOLTAR AO SELETOR</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="game-stage">
          {downloadOnly ? (
            <div className="game-fallback" role="status">
              <div className="game-fallback-card">
                <div className="fallback-icon">
                  <Play aria-hidden="true" />
                </div>
                <p className="ui-font text-xs text-secondary">
                  {map.toUpperCase()} // PACOTE ANDROID ORIGINAL
                </p>
                <h2 className="display-font mt-3 text-3xl sm:text-5xl">
                  BAIXAR {map.toUpperCase()}
                </h2>
                <p className="body-font mt-4 max-w-xl text-muted-foreground">
                  O arquivo enviado contém a versão Android original e seus
                  dados extraídos. Não há um APK instalável nem runtime WebGL
                  dentro deste arquivo; o download preserva o conteúdo sem
                  modificações.
                </p>
                <a
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground"
                  href={mapDownloadUrl}
                  download
                  onClick={() => {
                    onProgress(1);
                    onReady();
                  }}
                >
                  <Play aria-hidden="true" />
                  BAIXAR ARQUIVO ORIGINAL
                </a>
              </div>
            </div>
          ) : (
            <iframe
              ref={frameRef}
              key={map}
              src={`${mapPath}?map=${map}&variant=${map === "venice" ? veniceVariant : "default"}&record=${map === "venice" && veniceVariant === "normal" ? "on" : "off"}&hubSettings=${encodeURIComponent(JSON.stringify(settings))}`}
              title={`${map === "moggers" ? "Subway Moggers" : `${map} | Subway Surfers`}`}
              className="game-frame"
              style={{
                ...frameSize,
                filter: `saturate(${saturationValue(settings.saturation)})`,
              }}
              allow="autoplay; fullscreen; gamepad"
              allowFullScreen
              onLoad={() => {
                onProgress(1);
                onReady();
                const gameDocument = frameRef.current?.contentDocument;
                if (gameDocument && timerCompatible && isVisible && settings.timerEnabled)
                  configureExternalTimers(gameDocument, settings.timerEnabled, settings, controlKeys);
                window.setTimeout(() => {
                  frameRef.current?.contentWindow?.postMessage(
                    { type: "SURFVT14_HUB_SETTINGS", settings },
                    "*",
                  );
                }, 250);
              }}
              onError={() =>
                onError(
                  "O iframe do mapa não conseguiu carregar os arquivos locais.",
                )
              }
            />
          )}
        </div>
      )}
      {isVisible && settings.soundcloud && (
        <div className="soundcloud-in-game">
          <div className="soundcloud-controls">
            <Music2 />
            <span>SOUNDCLOUD · BETA</span>
            <button
              type="button"
              onClick={() => skipSoundCloud(-10)}
              aria-label="Voltar 10 segundos"
              title="Voltar 10 segundos"
            >
              −10
            </button>
            <button
              type="button"
              onClick={() => skipSoundCloud(10)}
              aria-label="Avançar 10 segundos"
              title="Avançar 10 segundos"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => soundcloudCommand("prev")}
              aria-label="Música anterior"
              title="Música anterior"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => soundcloudCommand("next")}
              aria-label="Próxima música"
              title="Próxima música"
            >
              <ChevronRight />
            </button>
          </div>
          <iframe
            ref={soundcloudRef}
            title="SoundCloud playlist SurfVT14"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(settings.soundcloudUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`}
            allow="autoplay"
          />
        </div>
      )}
      {isVisible && !downloadOnly && (
        <P14Overlays
          fpsEnabled={settings.fps}
          fpsCap={settings.fpsCap}
          wasdEnabled={settings.wasdEnabled && !isDesktop}
          controlKeys={displayControlKeys}
          pressedKey={pressedKey}
          isDesktop={isDesktop}
          autoBoostEnabled={settings.autoBoostEnabled && map !== "moggers"}
          onAutoBoost={triggerAutoBoost}
          onControlPress={(key, down) => down ? pressControlKey(key) : releaseControlKey(key)}
        />
      )}
    </div>
  );
}

export default function MapHub() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    readStoredProfile(),
  );
  const [theme, setTheme] = useState<Theme>(
    () => readStoredProfile().favoriteTheme,
  );
  const [selectedMap, setSelectedMap] = useState<MapId>(
    () => readStoredProfile().favoriteMap,
  );
  const [mapSearch, setMapSearch] = useState("");
  const [interfaceMode, setInterfaceMode] = useState<"alpha" | "beta">(() => {
    try {
      return localStorage.getItem("surfvt14-interface") === "beta"
        ? "beta"
        : "alpha";
    } catch {
      return "alpha";
    }
  });
  const [betaFilter, setBetaFilter] = useState<BetaFilter>("all");
  const [launchedMap, setLaunchedMap] = useState<MapId>("zurich");
  const [veniceVariant, setVeniceVariant] = useState<VeniceVariant>("normal");
  const [veniceChoiceOpen, setVeniceChoiceOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const openTimerSettings = () => setSettingsOpen(true);
    window.addEventListener("SURFVT14_OPEN_TIMER_SETTINGS", openTimerSettings);
    return () => window.removeEventListener("SURFVT14_OPEN_TIMER_SETTINGS", openTimerSettings);
  }, []);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<HubSettings>(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("surfvt14-settings") || "{}",
      );
      delete stored.hoverboard;
      const supportedResolutions = [
        "fullscreen",
        "608x1080",
        "890x1080",
        "640x1080",
        "840x1080",
      ];
      const resolution = supportedResolutions.includes(stored.resolution)
        ? stored.resolution
        : defaultSettings.resolution;
      return {
        ...defaultSettings,
        ...stored,
        resolution,
        soundcloudUrl:
          stored.soundcloudUrl === "https://soundcloud.com/stream"
            ? defaultSettings.soundcloudUrl
            : stored.soundcloudUrl || defaultSettings.soundcloudUrl,
      };
    } catch {
      return defaultSettings;
    }
  });
  const [fps, setFps] = useState(0);
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);
  const launchRequested = useRef(false);
  const sessionStartedAt = useRef<number | null>(null);
  const selected = maps.find((map) => map.id === selectedMap) ?? maps[0]!;
  const meta = themeMeta[theme];
  const selectedTitle = selected.name.toUpperCase();
  const copy = uiCopy[settings.language];
  const normalizedMapSearch = mapSearch.trim().toLowerCase();
  const filteredMaps = maps.filter((map) =>
    `${map.name} ${map.region}`.toLowerCase().includes(normalizedMapSearch),
  );
  const liveTokens =
    profile.provider === "local"
      ? 0
      : Math.floor(profile.totalPlayTimeMs / 60000);
  const liveLevel = Math.floor(liveTokens / 10);
  const pointerAction =
    (action: () => void) =>
    (event: { pointerType: string; preventDefault: () => void }) => {
      if (event.pointerType !== "mouse") {
        event.preventDefault();
        action();
      }
    };

  useEffect(() => {
    const persist = () => {
      try {
        localStorage.setItem("surfvt14-settings", JSON.stringify(settings));
      } catch {}
    };
    persist();
    window.addEventListener("beforeunload", persist);
    window.addEventListener("pagehide", persist);
    return () => {
      window.removeEventListener("beforeunload", persist);
      window.removeEventListener("pagehide", persist);
    };
  }, [settings]);
  useEffect(() => {
    try {
      localStorage.setItem("surfvt14-interface", interfaceMode);
    } catch {}
  }, [interfaceMode]);
  useEffect(() => {
    const authStatus = new URLSearchParams(window.location.search).get("auth");
    if (authStatus === "discord-connected")
      setAuthNotice("Discord conectado. Seu perfil SurfVT14 foi sincronizado.");
    if (authStatus === "google-connected")
      setAuthNotice("Google conectado. Seu perfil SurfVT14 foi sincronizado.");
    if (
      authStatus?.startsWith("discord-") &&
      authStatus !== "discord-connected"
    )
      setAuthNotice(
        "Não foi possível concluir o login do Discord. Tente novamente.",
      );
    if (authStatus?.startsWith("google-") && authStatus !== "google-connected")
      setAuthNotice(
        "Não foi possível concluir o login do Google. Tente novamente.",
      );
    fetch("/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (session?.authenticated && session.profile)
          setProfile((current) => ({
            ...current,
            ...session.profile,
            provider:
              session.profile.provider === "google" ? "google" : "discord",
          }));
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    const persistProfile = () => {
      try {
        localStorage.setItem("surfvt14-profile", JSON.stringify(profile));
      } catch {}
    };
    persistProfile();
    window.addEventListener("beforeunload", persistProfile);
    window.addEventListener("pagehide", persistProfile);
    return () => {
      window.removeEventListener("beforeunload", persistProfile);
      window.removeEventListener("pagehide", persistProfile);
    };
  }, [profile]);
  useEffect(() => {
    if (!sessionStartedAt.current || profile.provider === "local") return;
    const reward = window.setInterval(() => {
      const elapsed = Math.max(0, Date.now() - sessionStartedAt.current!);
      const total = profile.totalPlayTimeMs + elapsed;
      const tokens = Math.floor(total / 60000);
      setProfile((current) => ({
        ...current,
        totalPlayTimeMs: total,
        tokens,
        level: Math.floor(tokens / 10),
      }));
      sessionStartedAt.current = Date.now();
    }, 1000);
    return () => window.clearInterval(reward);
  }, [profile.provider, profile.totalPlayTimeMs]);
  useEffect(() => {
    setProfile((current) => ({
      ...current,
      favoriteTheme: theme,
      favoriteMap: selectedMap,
    }));
  }, [theme, selectedMap]);
  useEffect(() => {
    if (!settings.fps) {
      setFps(0);
      return;
    }
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    let timeout = 0;
    const tick = (now: number) => {
      frames++;
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      const interval =
        settings.fpsCap === "unlocked" ? 0 : 1000 / Number(settings.fpsCap);
      if (interval) {
        timeout = window.setTimeout(() => {
          raf = requestAnimationFrame(tick);
        }, interval);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [settings.fps, settings.fpsCap]);
  useEffect(() => {
    // A primeira abertura baixa a build; depois o service worker reutiliza os
    // arquivos locais de /maps, /moggers e /map-icons sem novo download.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // O jogo continua funcionando mesmo em hosts que não permitem SW.
      });
    }
    setIsDesktopDevice(
      navigator.maxTouchPoints === 0 &&
        !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
    );
    document.documentElement.lang = settings.language;
  }, [settings.language]);
  const updateSetting = <K extends keyof HubSettings>(
    key: K,
    value: HubSettings[K],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  const handlePlay = (variant: VeniceVariant = "normal") => {
    if (selectedMap === "venice" && !veniceChoiceOpen && variant === "normal") {
      setVeniceChoiceOpen(true);
      return;
    }
    if (launchRequested.current || isLoadingGame || isPlaying) return;
    setVeniceChoiceOpen(false);
    setVeniceVariant(selectedMap === "venice" ? variant : "normal");
    launchRequested.current = true;
    setLaunchedMap(selectedMap);
    setGameProgress(0);
    setGameError(null);
    setIsPlaying(true);
    setIsLoadingGame(true);
    sessionStartedAt.current = Date.now();
    if (profile.provider !== "local")
      setProfile((current) => ({
        ...current,
        gamesPlayed: current.gamesPlayed + 1,
        favoriteTheme: theme,
        favoriteMap: selectedMap,
        lastPlayedAt: new Date().toISOString(),
      }));
  };

  const handleReady = useCallback(() => {
    setGameProgress(1);
    // O loader próprio da build já confirma quando o Unity está pronto;
    // manter quase nenhum atraso aqui evita uma tela vazia desnecessária.
    window.setTimeout(() => {
      if (launchRequested.current) setIsPlaying(true);
      setIsLoadingGame(false);
    }, 120);
  }, []);

  const handleGameError = useCallback((message: string) => {
    setGameError(message);
    setIsPlaying(true);
    setIsLoadingGame(false);
  }, []);

  useEffect(() => {
    if (!isLoadingGame) return;
    const interval = window.setInterval(() => {
      setGameProgress((current) =>
        Math.min(0.96, current + Math.max(0.004, (0.96 - current) * 0.035)),
      );
    }, 180);
    const safety = window.setTimeout(() => {
      setGameProgress(1);
      setIsPlaying(true);
      setIsLoadingGame(false);
    }, 8000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(safety);
    };
  }, [isLoadingGame]);

  const handleClose = () => {
    if (sessionStartedAt.current && profile.provider !== "local") {
      const elapsed = Math.max(0, Date.now() - sessionStartedAt.current);
      setProfile((current) => {
        const total = current.totalPlayTimeMs + elapsed;
        const tokens = Math.floor(total / 60000);
        return {
          ...current,
          totalPlayTimeMs: total,
          tokens,
          level: Math.floor(tokens / 10),
        };
      });
      sessionStartedAt.current = null;
    }
    launchRequested.current = false;
    setVeniceChoiceOpen(false);
    setIsPlaying(false);
    setIsLoadingGame(false);
    setGameError(null);
    setGameProgress(0);
  };

  const progressPercent = Math.round(gameProgress * 100);
  const loadingMessage =
    gameProgress < 0.2
      ? "VERIFICANDO CACHE LOCAL E MANIFESTO"
      : gameProgress < 0.6
        ? "BAIXANDO DADOS E RUNTIME WASM"
        : gameProgress < 0.9
          ? "INICIANDO MOTOR UNITY"
          : "PREPARANDO A PISTA";

  return (
    <div
      className={`theme-shell theme-${theme} saturation-${settings.saturation} ${interfaceMode === "beta" ? "beta-mode" : ""}`}
      style={
        {
          "--hub-saturation":
            settings.saturation === "off"
              ? 1
              : settings.saturation === "low"
                ? 1.25
                : settings.saturation === "medium"
                  ? 1.5
                  : 1.9,
        } as React.CSSProperties
      }
    >
      {(isLoadingGame || isPlaying) && (
        <GamePlayer
          map={launchedMap}
          onTimerSettingsChange={(changes) => setSettings((current) => ({ ...current, ...changes }))}
          mapPath={
            launchedMap === "venice" && veniceVariant === "normal"
              ? "/maps/venice-normal/index.html"
              : (maps.find((map) => map.id === launchedMap)?.path ??
                maps[0]!.path)
          }
          mapDownloadUrl={
            maps.find((map) => map.id === launchedMap)?.downloadUrl
          }
          downloadOnly={
            maps.find((map) => map.id === launchedMap)?.downloadOnly
          }
          isVisible={isPlaying}
          onClose={handleClose}
          onProgress={(progress) =>
            setGameProgress((current) => Math.max(current, progress))
          }
          onReady={handleReady}
          onError={handleGameError}
          errorMessage={gameError}
          settings={settings}
          veniceVariant={veniceVariant}
        />
      )}

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <img
          src={themeBackdropImages[theme]}
          alt=""
          width={1536}
          height={864}
          className={`lobby-backdrop lobby-backdrop-${theme}`}
        />
        <div className="lobby-scrim" />
        <div className="hub-grid pointer-events-none fixed inset-0" />
        <div className="home-container relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-8 sm:py-8">
          <header className="lobby-header">
            <div>
              <div className="brand-line">
                <img
                  className="brand-mark brand-mark-image"
                  src="/discord-server-icon.png"
                  alt="SurfVT14"
                />
                <div>
                  <p className="ui-font mb-1 text-xs text-secondary">
                    SURFVT14
                  </p>
                  <h1 className="display-font text-3xl sm:text-5xl">
                    SUBWAY SURFERS
                  </h1>
                </div>
              </div>
            </div>
            <nav className="hub-nav" aria-label={copy.community}>
              <a href="#collection">{copy.collection}</a>
              <a href="#community">{copy.community}</a>
              <a href="#about">{copy.about}</a>
            </nav>

            <div
              className="theme-switcher interface-switcher flex flex-wrap items-center justify-end gap-2"
              role="group"
              aria-label="Versões da interface SurfVT"
            >
              <Button
                type="button"
                size="sm"
                className={`interface-mode-button interface-mode-alpha ${interfaceMode === "alpha" ? "is-active" : ""}`}
                variant={interfaceMode === "alpha" ? "default" : "outline"}
                aria-pressed={interfaceMode === "alpha"}
                onClick={() => setInterfaceMode("alpha")}
                onPointerUp={pointerAction(() => setInterfaceMode("alpha"))}
              >
                Alpha SurfVT
              </Button>
              <Button
                type="button"
                size="sm"
                className={`interface-mode-button interface-mode-beta ${interfaceMode === "beta" ? "is-active" : ""}`}
                variant={interfaceMode === "beta" ? "default" : "outline"}
                aria-pressed={interfaceMode === "beta"}
                onClick={() => setInterfaceMode("beta")}
                onPointerUp={pointerAction(() => setInterfaceMode("beta"))}
              >
                Beta SurfVT
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="settings-tab-button"
              onClick={(event) => {
                event.stopPropagation();
                setSettingsOpen(true);
              }}
            >
              <Settings /> {copy.settings}
            </Button>
            {profile.provider !== "local" && (
              <div
                className="profile-chip"
                aria-label={`${copy.profileSynced}: ${profile.name}`}
              >
                {profile.avatarUrl ? (
                  <img
                    className="profile-avatar"
                    src={profile.avatarUrl}
                    alt=""
                  />
                ) : (
                  <UserRound />
                )}
                <span>
                  <strong>{profile.name}</strong>
                  <small>
                    {profile.provider === "discord" ? "DISCORD" : "GOOGLE"} ·{" "}
                    {profile.gamesPlayed} {copy.games.toLowerCase()}
                  </small>
                </span>
              </div>
            )}
          </header>
          {interfaceMode === "alpha" && (
            <section className="site-community" id="community">
              <a
                className="discord-banner"
                href="https://discord.gg/jNVZU6pgrm"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  className="discord-server-icon"
                  src="/discord-server-icon.png"
                  alt="Discord"
                />{" "}
                <span>
                  <strong>{copy.communityTitle}</strong>
                  <small>{copy.communitySub}</small>
                  <span className="community-action">
                    {copy.communityCta} <i aria-hidden="true">↗</i>
                  </span>
                </span>
                <span className="discord-arrow">↗</span>
              </a>
            </section>
          )}
          {interfaceMode === "beta" && (
            <SurfVtBetaHub
              maps={maps}
              searchResults={filteredMaps}
              selected={selected}
              selectedMapId={selectedMap}
              mapSearch={mapSearch}
              filter={betaFilter}
              labels={betaUiLabels[settings.language]}
              copy={copy}
              p14Backup={p14BackupCopy[settings.language]}
              busy={isLoadingGame || isPlaying}
              onSearch={setMapSearch}
              onFilter={setBetaFilter}
              onSelectMap={(mapId) => setSelectedMap(mapId as MapId)}
              onPlay={() => handlePlay()}
            />
          )}

          {interfaceMode === "alpha" && (
            <section
              id="collection"
              className="home-layout grid flex-1 items-center gap-6 py-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(350px,.72fr)]"
            >
              <div className="lobby-title-block">
                <p className="home-eyebrow">{copy.homeEyebrow}</p>
                <h2 className="display-font mt-2 text-6xl leading-none sm:text-8xl">
                  {selectedTitle}
                </h2>
                <p className="body-font mt-4 max-w-xl text-xl text-muted-foreground">
                  <strong>{selected.name}</strong> · {selected.region}.
                </p>
                <p className="home-description">{copy.homeDescription}</p>
                <figure className="selected-route-card">
                  <img
                    src={selected.icon ?? "/discord-server-icon.png"}
                    alt=""
                    width={640}
                    height={480}
                    decoding="async"
                  />
                  <figcaption>
                    <span className="route-kicker">{copy.featuredLabel}</span>
                    <strong>{selected.name}</strong>
                    <small>{selected.region}</small>
                  </figcaption>
                  <span className="route-card-index">
                    {String(maps.indexOf(selected) + 1).padStart(2, "0")}
                  </span>
                </figure>
                <div
                  className="theme-hud"
                  aria-label={`${copy.level} ${liveLevel}`}
                >
                  <div className="hud-rank">
                    <span className="hud-kicker">{copy.level}</span>
                    <strong>{liveLevel}</strong>
                    <div className="hud-progress">
                      <i style={{ width: `${(liveTokens % 10) * 10}%` }} />
                    </div>
                  </div>
                  <div className="hud-token">
                    <span className="hud-kicker">{copy.tokens}</span>
                    <strong>
                      {theme === "aot" ? (
                        <Swords />
                      ) : theme === "scott" ? (
                        <Heart />
                      ) : theme === "jujutsu" ? (
                        <Zap />
                      ) : (
                        <Flame />
                      )}{" "}
                      {liveTokens}
                    </strong>
                    <small>{copy.accountOnly}</small>
                  </div>
                </div>
              </div>

              <div className="control-panel">
                <div className="collection-heading">
                  <div>
                    <h3>{copy.pickMap}</h3>
                  </div>
                  <span className="collection-count">
                    {normalizedMapSearch
                      ? `${filteredMaps.length}/${maps.length} ${copy.mapsAvailable}`
                      : `${maps.length} ${copy.mapsAvailable}`}
                  </span>
                </div>
                {selected.id === "moggers" && (
                  <p className="standalone-game-warning" role="note">
                    Este é um jogo independente, não um mapa de Subway Surfers.
                    Ele usa os controles, contador de FPS e SoundCloud do hub,
                    mas não é compatível com cronômetros.
                  </p>
                )}

                <label className="map-search">
                  <Search aria-hidden="true" />
                  <input
                    type="search"
                    value={mapSearch}
                    onChange={(event) => setMapSearch(event.target.value)}
                    placeholder={copy.searchPlaceholder}
                    aria-label={copy.searchPlaceholder}
                  />
                  {mapSearch && (
                    <button
                      type="button"
                      onClick={() => setMapSearch("")}
                      aria-label={copy.clearSearch}
                    >
                      <X aria-hidden="true" />
                    </button>
                  )}
                </label>
                <div
                  className="map-selector"
                  role="radiogroup"
                  aria-label={copy.map}
                >
                  {filteredMaps.map((map) => {
                    const active = map.id === selectedMap;
                    return (
                      <Button
                        key={map.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        className="map-button map-card"
                        role="radio"
                        aria-checked={active}
                        aria-label={`${map.name}, ${map.region}`}
                        data-map-id={map.id}
                        onClick={() => setSelectedMap(map.id)}
                      >
                        {map.icon ? (
                          <img
                            className="map-button-icon"
                            src={map.icon}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        ) : map.showMark === false ? null : (
                          <span className="map-button-mark">
                            {map.name.slice(0, 1)}
                          </span>
                        )}
                        <span className="map-card-copy">
                          <strong>{map.name}</strong>
                          <small>{map.region}</small>
                        </span>
                      </Button>
                    );
                  })}
                  {filteredMaps.length === 0 && (
                    <p className="map-empty" role="status">
                      {copy.noMapsFound}
                    </p>
                  )}
                </div>
                <p className="body-font mt-4 text-base text-muted-foreground">
                  {copy.selectedBuild}: <strong>{selected.name}</strong> ·{" "}
                  {selected.region}
                </p>
                <div className="system-grid">
                  <div>
                    <span>{copy.unity}</span>2019.4.18f1
                  </div>
                  <div>
                    <span>{copy.render}</span>WEBGL 2.0
                  </div>
                  <div>
                    <span>{copy.build}</span>LOCAL
                  </div>
                  <div>
                    <span>{copy.mapLabel}</span>
                    {selected.name.toUpperCase()}
                  </div>
                </div>
                <Button
                  size="lg"
                  className="play-button"
                  onClick={() => handlePlay()}
                  disabled={isLoadingGame || isPlaying}
                >
                  <Play className="fill-current" />
                  <span>
                    {copy.play} {selected.name.toUpperCase()}
                  </span>
                  <Maximize2 className="ml-auto" />
                </Button>
                {selected.id === "subwaycrackers" && (
                  <div
                    className="mt-4 rounded-lg border border-border/70 bg-card/40 p-4 text-left"
                    role="note"
                  >
                    <p className="ui-font text-xs font-bold text-secondary">
                      {p14BackupCopy[settings.language].title}
                    </p>
                    <p className="body-font mt-2 text-sm text-muted-foreground">
                      {p14BackupCopy[settings.language].instructions}
                    </p>
                    <p className="body-font mt-2 text-xs text-muted-foreground">
                      {p14BackupCopy[settings.language].warning}
                    </p>
                    <Button asChild variant="outline" className="mt-3 w-full">
                      <a
                        href="/downloads/subwaycrackers-p14-save.bin"
                        download="SubwayCrackers-P14-save.bin"
                      >
                        <Download aria-hidden="true" />
                        {p14BackupCopy[settings.language].download}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}
          <section
            className="site-about"
            id="about"
            aria-labelledby="about-title"
          >
            <div className="about-mark" aria-hidden="true">
              SV
            </div>
            <div>
              <p className="home-eyebrow">SURFVT14 // HUB</p>
              <h2 id="about-title">{copy.aboutTitle}</h2>
              <p>{copy.aboutBody}</p>
            </div>
            <a className="about-top-link" href="#collection">
              {copy.collection} <span aria-hidden="true">↑</span>
            </a>
          </section>
          <footer className="site-footer">
            <span>
              <strong>SURFVT14</strong> · {maps.length} {copy.mapsAvailable}
            </span>
            <a href="#collection">{copy.pickMap}</a>
          </footer>
        </div>

        {veniceChoiceOpen && !isPlaying && (
          <div
            className="venice-choice-backdrop"
            role="presentation"
            onClick={() => setVeniceChoiceOpen(false)}
          >
            <section
              className="venice-choice-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="venice-choice-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="venice-choice-header">
                <div>
                  <span className="ui-font text-xs text-secondary">
                    VENICE // VERSÕES
                  </span>
                  <h2
                    id="venice-choice-title"
                    className="display-font mt-1 text-2xl"
                  >
                    Escolha a versão
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setVeniceChoiceOpen(false)}
                  aria-label="Fechar"
                >
                  <X />
                </Button>
              </div>
              <div className="venice-choice-grid">
                <button
                  type="button"
                  className="venice-choice-card venice-choice-moded"
                  onClick={() => handlePlay("moded")}
                >
                  <span className="venice-choice-kicker">TEXTURAS ATUAIS</span>
                  <strong>Venice Moded</strong>
                  <small>
                    Usa a Venice com as texturas atuais. Esta versão não conta
                    recorde.
                  </small>
                  <span className="venice-choice-action">
                    JOGAR SEM RECORDE
                  </span>
                </button>
                <button
                  type="button"
                  className="venice-choice-card venice-choice-normal"
                  onClick={() => handlePlay("normal")}
                >
                  <span className="venice-choice-kicker">BUILD LIMPA</span>
                  <strong>Venice normal</strong>
                  <small>
                    Versão normal, sem texturas modificadas. Esta versão conta
                    recorde.
                  </small>
                  <span className="venice-choice-action">
                    JOGAR E CONTAR RECORDE
                  </span>
                </button>
              </div>
              <p className="venice-choice-note">
                A build limpa da Venice ainda precisa ser adicionada aos
                arquivos do projeto para remover as texturas modificadas.
              </p>
            </section>
          </div>
        )}
        {settingsOpen && (
          <div
            className="hub-settings-backdrop"
            role="presentation"
            onClick={() => setSettingsOpen(false)}
          >
            <section
              className="hub-settings-panel"
              role="dialog"
              aria-modal="true"
              aria-label={copy.settings}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hub-settings-header">
                <div>
                  <span className="ui-font text-xs text-secondary">
                    SURFVT14 // HUB
                  </span>
                  <h2 className="display-font mt-1 text-2xl">
                    {copy.settings}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(false)}
                  aria-label={copy.close}
                >
                  <X />
                </Button>
              </div>
              <div className="profile-settings">
                <div className="profile-settings-heading">
                  {profile.avatarUrl ? (
                    <img
                      className="profile-avatar profile-avatar-large"
                      src={profile.avatarUrl}
                      alt=""
                    />
                  ) : (
                    <UserRound />
                  )}
                  <div>
                    <span>
                      {profile.provider === "local"
                        ? copy.profileLocal
                        : copy.profileSynced}
                    </span>
                    <strong>
                      {profile.provider === "local"
                        ? copy.profileLocalDetail
                        : copy.profileSyncedDetail}
                    </strong>
                  </div>
                </div>
                {profile.provider !== "local" && (
                  <>
                    <label className="profile-name-field">
                      <span>{copy.playerName}</span>
                      <input
                        value={profile.name}
                        maxLength={24}
                        onChange={(e) =>
                          setProfile((current) => ({
                            ...current,
                            name: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <div className="profile-stats">
                      <div>
                        <Trophy />
                        <b>{liveLevel}</b>
                        <span>{copy.level}</span>
                      </div>
                      <div>
                        <Flame />
                        <b>{liveTokens}</b>
                        <span>{copy.tokens}</span>
                      </div>
                      <div>
                        <Clock3 />
                        <b>{formatProfileDuration(profile.totalPlayTimeMs)}</b>
                        <span>{copy.playTime}</span>
                      </div>
                      <div>
                        <Keyboard />
                        <b>
                          {maps.find((map) => map.id === profile.favoriteMap)
                            ?.name ?? "Zurich"}
                        </b>
                        <span>{copy.favoriteMap}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="profile-reset"
                      onClick={() =>
                        setProfile({
                          ...defaultProfile,
                          createdAt: profile.createdAt,
                        })
                      }
                    >
                      {copy.resetStats}
                    </button>
                  </>
                )}
              </div>
              <div className="profile-auth">
                <div className="profile-auth-heading">
                  <span>{copy.online}</span>
                  <small>{copy.onlineHint}</small>
                </div>
                <div className="profile-auth-actions">
                  <button
                    type="button"
                    className="auth-provider auth-discord"
                    onClick={(event) => {
                      event.stopPropagation();
                      window.location.href = "/auth/discord/start";
                    }}
                  >
                    <img
                      className="auth-provider-image"
                      src="/discord-server-icon.png"
                      alt="Discord"
                    />
                    <span>
                      <b>{copy.signDiscord}</b>
                      <small>{copy.syncProfile}</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="auth-provider auth-google"
                    onClick={(event) => {
                      event.stopPropagation();
                      window.location.href = "/auth/google/start";
                    }}
                  >
                    <span className="auth-provider-icon">G</span>
                    <span>
                      <b>{copy.signGoogle}</b>
                      <small>{copy.syncProfile}</small>
                    </span>
                  </button>
                </div>
                {authNotice && (
                  <p className="auth-notice" role="status">
                    {authNotice}
                  </p>
                )}
              </div>
              <section
                className="theme-settings"
                aria-labelledby="theme-settings-title"
              >
                <div className="theme-settings-heading">
                  <div>
                    <span id="theme-settings-title">{copy.favoriteTheme}</span>
                    <small>{themeMeta[theme].label}</small>
                  </div>
                </div>
                <div
                  className="theme-settings-options"
                  role="group"
                  aria-label={copy.favoriteTheme}
                >
                  {(Object.keys(themeMeta) as Theme[]).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      className={`theme-settings-option theme-settings-${option}`}
                      variant={theme === option ? "default" : "outline"}
                      aria-pressed={theme === option}
                      onClick={() => setTheme(option)}
                      onPointerUp={pointerAction(() => setTheme(option))}
                    >
                      {themeMeta[option].label}
                    </Button>
                  ))}
                </div>
              </section>
              <div className="hub-settings-grid">
                <label>
                  <span>{copy.language}</span>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      updateSetting("language", e.target.value as Language)
                    }
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="zh">中文</option>
                  </select>
                </label>
                <label>
                  <span>{copy.resolution}</span>
                  <select
                    value={settings.resolution}
                    onChange={(e) =>
                      updateSetting("resolution", e.target.value as Resolution)
                    }
                  >
                    <option value="fullscreen">RESOLUÇÃO PADRÃO</option>
                    <option value="608x1080">608×1080</option>
                    <option value="890x1080">890×1080</option>
                    <option value="640x1080">640×1080</option>
                    <option value="840x1080">840×1080</option>
                  </select>
                </label>
                <label>
                  <span>
                    {copy.volume} <b>{settings.volume}%</b>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) =>
                      updateSetting("volume", Number(e.target.value))
                    }
                  />
                </label>
                <label>
                  <span>MODO DE GRÁFICOS</span>
                  <select value={settings.graphicsMode} onChange={(e) => updateSetting("graphicsMode", e.target.value as GraphicsMode)}>
                    <option value="off">DESLIGADO</option><option value="performance">DESEMPENHO · AUTO</option><option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option><option value="ultra">ULTRA</option>
                  </select>
                </label>
                <label>
                  <span>{copy.browserFps}</span>
                  <select
                    value={settings.fpsCap}
                    onChange={(e) =>
                      updateSetting("fpsCap", e.target.value as FpsCap)
                    }
                  >
                    <option value="unlocked">UNLOCKED</option>
                    <option value="30">30 HZ</option>
                    <option value="60">60 HZ</option>
                    <option value="120">120 HZ</option>
                    <option value="240">240 HZ</option>
                  </select>
                </label>
                <label>
                  <span>{copy.saturation}</span>
                  <select
                    value={settings.saturation}
                    onChange={(e) =>
                      updateSetting(
                        "saturation",
                        e.target.value as HubSettings["saturation"],
                      )
                    }
                  >
                    <option value="off">OFF</option>
                    <option value="low">LOW · 25%</option>
                    <option value="medium">MEDIUM · 50%</option>
                    <option value="high">HIGH · 75–100%</option>
                  </select>
                </label>
                <label>
                  <span>{copy.gameTimer}</span>
                  <input
                    type="checkbox"
                    checked={settings.timerEnabled}
                    onChange={(e) =>
                      updateSetting("timerEnabled", e.target.checked)
                    }
                  />
                </label>
                <label>
                  <span>{copy.timerType}</span>
                  <select
                    value={settings.timerStyle}
                    onChange={(e) =>
                      updateSetting("timerStyle", e.target.value as TimerStyle)
                    }
                  >
                    <option value="native">Floating Clock</option>
                    <option value="livesplit">LiveSplit</option>
                    <option value="chrono">Chrono</option>
                  </select>
                </label>
                <label>
                  <span>HOTKEY · INICIAR</span>
                  <input type="text" maxLength={1} value={settings.timerStartHotkey.toUpperCase()} aria-label="Hotkey para iniciar" onChange={(e) => updateSetting("timerStartHotkey", e.target.value.slice(-1).toLowerCase() || "q")} />
                </label>
                <label><span>HOTKEY · PAUSAR</span><input type="text" maxLength={1} value={settings.timerPauseHotkey.toUpperCase()} aria-label="Hotkey para pausar" onChange={(e) => updateSetting("timerPauseHotkey", e.target.value.slice(-1).toLowerCase() || "q")} /></label>
                <label><span>MODO AUTOMÁTICO</span><input type="checkbox" checked={settings.timerAutoMode} onChange={(e) => updateSetting("timerAutoMode", e.target.checked)} /></label>
                <label>
                  <span>HOTKEY · REINICIAR</span>
                  <input
                    type="text"
                    maxLength={1}
                    value={settings.timerResetHotkey.toUpperCase()}
                    aria-label="Hotkey para reiniciar os cronômetros"
                    onChange={(e) => updateSetting("timerResetHotkey", e.target.value.slice(-1).toLowerCase() || "r")}
                  />
                </label>
                <label>
                  <span>{copy.wasd}</span>
                  <input
                    type="checkbox"
                    checked={settings.wasdEnabled}
                    onChange={(e) =>
                      updateSetting("wasdEnabled", e.target.checked)
                    }
                  />
                </label>
                <label
                  className={!isDesktopDevice ? "desktop-only-setting" : ""}
                >
                  <span>{copy.pcKeys}</span>
                  <select
                    disabled={!isDesktopDevice}
                    value={settings.controls}
                    onChange={(e) =>
                      updateSetting("controls", e.target.value as ControlScheme)
                    }
                  >
                    <option>WASD</option>
                    <option>IJKL</option>
                    <option>SETAS</option>
                    <option>PERSONALIZADO</option>
                  </select>
                  {settings.controls === "PERSONALIZADO" && (
                    <div className="custom-controls-grid">
                      {(
                        [
                          ["up", "CIMA"],
                          ["left", "ESQUERDA"],
                          ["down", "BAIXO"],
                          ["right", "DIREITA"],
                        ] as const
                      ).map(([key, label]) => (
                        <input
                          key={key}
                          aria-label={`Tecla ${label}`}
                          maxLength={12}
                          value={settings.customControls[key]}
                          placeholder={label}
                          onChange={(e) =>
                            updateSetting("customControls", {
                              ...settings.customControls,
                              [key]: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </label>
                <label className="autoboost-setting">
                  <span>{copy.autoBoost}</span>
                  <input
                    type="checkbox"
                    checked={settings.autoBoostEnabled}
                    onChange={(e) =>
                      updateSetting("autoBoostEnabled", e.target.checked)
                    }
                  />
                </label>
                <label
                  className={!isDesktopDevice ? "desktop-only-setting" : ""}
                >
                  <span>{copy.autoBoostHotkey}</span>
                  <input
                    type="text"
                    maxLength={12}
                    disabled={!isDesktopDevice || !settings.autoBoostEnabled}
                    value={settings.autoBoostHotkey}
                    onChange={(e) =>
                      updateSetting(
                        "autoBoostHotkey",
                        e.target.value.toUpperCase(),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                  />
                </label>
                <label>
                  <span>LOCAL DO AUTOBOOST</span>
                  <select value={settings.autoBoostCorner} onChange={(e) => updateSetting("autoBoostCorner", e.target.value as HubSettings["autoBoostCorner"])}>
                    <option value="bottomLeft">CANTO INFERIOR ESQUERDO</option><option value="bottomRight">CANTO INFERIOR DIREITO</option><option value="topLeft">CANTO SUPERIOR ESQUERDO</option><option value="topRight">CANTO SUPERIOR DIREITO</option><option value="center">CENTRO</option>
                  </select>
                </label>
                <label>
                  <span>CLIQUES AUTOBOOST <b>{settings.autoBoostCount}</b></span>
                  <select value={settings.autoBoostCount} onChange={(e) => updateSetting("autoBoostCount", Number(e.target.value))}><option value={1}>1</option><option value={3}>3</option><option value={5}>5</option><option value={10}>10</option></select>
                </label>
                <label>
                  <span>INTERVALO AUTOBOOST <b>{settings.autoBoostDelay} ms</b></span>
                  <input type="range" min="10" max="200" step="10" value={settings.autoBoostDelay} onChange={(e) => updateSetting("autoBoostDelay", Number(e.target.value))} />
                </label>
                <label>
                  <span>{copy.fps}</span>
                  <input
                    type="checkbox"
                    checked={settings.fps}
                    onChange={(e) => updateSetting("fps", e.target.checked)}
                  />
                </label>
                <label>
                  <span>{copy.soundcloud}</span>
                  <input
                    type="checkbox"
                    checked={settings.soundcloud}
                    onChange={(e) =>
                      updateSetting("soundcloud", e.target.checked)
                    }
                  />
                </label>
                {settings.soundcloud && (
                  <label className="wide-setting">
                    <span>SoundCloud URL</span>
                    <input
                      value={settings.soundcloudUrl}
                      onChange={(e) =>
                        updateSetting("soundcloudUrl", e.target.value)
                      }
                      placeholder="https://soundcloud.com/..."
                    />
                  </label>
                )}
              </div>
              <p className="hub-settings-note">{copy.note}</p>
              {settings.fps && (
                <div className="fps-badge">
                  <Gauge /> {fps} FPS
                </div>
              )}
              {settings.soundcloud && (
                <iframe
                  title="SoundCloud player"
                  className="soundcloud-player"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(settings.soundcloudUrl)}&color=%2300bfff&auto_play=false`}
                />
              )}
            </section>
          </div>
        )}
        {isLoadingGame && (
          <div className="loading-screen" role="status" aria-live="polite">
            <aside className="loading-utility-rail" aria-label="SURFVT14">
              <span className="loading-utility-brand">SURFVT14</span>
              <button
                className="loading-exit-button"
                type="button"
                onClick={handleClose}
                aria-label={copy.close}
              >
                <X size={17} aria-hidden="true" />
                <span>{copy.close}</span>
              </button>
            </aside>
            <div className="loading-panel reference-loader">
              <div className="loading-reference-body">
                <span className="loading-kicker">SUBWAY SURFERS · WEBGL 2</span>
                <h2>{launchedMap.toUpperCase()}</h2>
                <p>{loadingMessage}</p>
                <div className="reference-track">
                  <div style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="reference-percent">{progressPercent}%</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
