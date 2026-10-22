import { useCallback, useEffect, useRef, useState } from "react";
import {
  Flag,
  GripHorizontal,
  Maximize2,
  Palette,
  Pause,
  Play,
  RotateCcw,
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
} from "lucide-react";

import nightCity from "@/assets/night-city-lobby.jpg";
import newYork from "@/assets/new-york-lobby.jpg";
import { Button } from "@/components/ui/button";

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

const timerColors = ["cyan", "magenta", "red", "lime", "white"] as const;
type TimerColor = (typeof timerColors)[number];
type ControlScheme = "WASD" | "IJKL" | "SETAS" | "PERSONALIZADO";
type Language = "pt-BR" | "en" | "de" | "fr" | "zh";
type Resolution =
  "fullscreen" | "608x1080" | "890x1080" | "640x1080" | "840x1080";
type FpsCap = "unlocked" | "30" | "60" | "120" | "240";
type TimerStyle = "native" | "livesplit" | "chrono";
type HubSettings = {
  saturation: "off" | "low" | "medium" | "high";
  timerEnabled: boolean;
  timerStyle: TimerStyle;
  timerScale: number;
  timerFont: string;
  hoverboard: boolean;
  autoBoostEnabled: boolean;
  autoBoostHotkey: string;
  wasdEnabled: boolean;
  controls: ControlScheme;
  customControls: { up: string; left: string; down: string; right: string };
  controlSize: number;
  controlX: number;
  controlY: number;
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
  timerEnabled: true,
  timerStyle: "chrono",
  timerScale: 100,
  timerFont: "Rajdhani",
  hoverboard: false,
  autoBoostEnabled: false,
  autoBoostHotkey: "B",
  wasdEnabled: true,
  controls: "WASD",
  customControls: { up: "T", left: "F", down: "G", right: "H" },
  controlSize: 100,
  controlX: 76,
  controlY: 68,
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
    timerSize: string;
    timerFont: string;
    wasd: string;
    pcKeys: string;
    wasdSize: string;
    horizontal: string;
    vertical: string;
    hoverboard: string;
    autoBoost: string;
    autoBoostHotkey: string;
    note: string;
    loadingFiles: string;
    loadingUnity: string;
    loadingTrack: string;
    localBuild: string;
    selectedMap: string;
  }
> = {
  "pt-BR": {
    settings: "CONFIGURAÇÕES",
    play: "JOGAR",
    close: "FECHAR",
    map: "SELECIONE O MAPA",
    mapsAvailable: "mapas disponíveis",
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
    timerSize: "TAMANHO DO CRONÔMETRO",
    timerFont: "FONTE DO CRONÔMETRO",
    wasd: "WASD NA TELA · PC E CELULAR",
    pcKeys: "TECLAS NA TELA · APENAS PC",
    wasdSize: "TAMANHO DO WASD",
    horizontal: "POSIÇÃO HORIZONTAL",
    vertical: "POSIÇÃO VERTICAL",
    hoverboard: "THREE TOUCH HOVERBOARD",
    autoBoost: "AUTOBOOST · 3 CLIQUES NO FOGUETE",
    autoBoostHotkey: "HOTKEY DO AUTOBOOST",
    note: "As configurações são aplicadas imediatamente e ficam salvas neste navegador.",
    loadingFiles: "CARREGANDO ARQUIVOS DO MAPA",
    loadingUnity: "INICIANDO MOTOR UNITY",
    loadingTrack: "PREPARANDO A PISTA",
    localBuild: "BUILD LOCAL · SURFVT14",
    selectedMap: "Mapa selecionado",
  },
  en: {
    settings: "SETTINGS",
    play: "PLAY",
    close: "CLOSE",
    map: "SELECT MAP",
    mapsAvailable: "maps available",
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
    timerSize: "TIMER SIZE",
    timerFont: "TIMER FONT",
    wasd: "WASD ON SCREEN · PC AND MOBILE",
    pcKeys: "ON-SCREEN KEYS · PC ONLY",
    wasdSize: "WASD SIZE",
    horizontal: "HORIZONTAL POSITION",
    vertical: "VERTICAL POSITION",
    hoverboard: "THREE TOUCH HOVERBOARD",
    autoBoost: "AUTOBOOST · 3 ROCKET CLICKS",
    autoBoostHotkey: "AUTOBOOST HOTKEY",
    note: "Settings apply immediately and are saved in this browser.",
    loadingFiles: "LOADING MAP FILES",
    loadingUnity: "STARTING UNITY ENGINE",
    loadingTrack: "PREPARING THE TRACK",
    localBuild: "LOCAL BUILD · SURFVT14",
    selectedMap: "Selected map",
  },
  de: {
    settings: "EINSTELLUNGEN",
    play: "SPIELEN",
    close: "SCHLIESSEN",
    map: "KARTE WÄHLEN",
    mapsAvailable: "Karten verfügbar",
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
    timerSize: "TIMERGRÖSSE",
    timerFont: "TIMER-SCHRIFT",
    wasd: "WASD · PC UND MOBIL",
    pcKeys: "TASTEN · NUR PC",
    wasdSize: "WASD-GRÖSSE",
    horizontal: "HORIZONTALE POSITION",
    vertical: "VERTIKALE POSITION",
    hoverboard: "THREE TOUCH HOVERBOARD",
    autoBoost: "AUTOBOOST · 3 ROCKET-KLICKS",
    autoBoostHotkey: "AUTOBOOST-HOTKEY",
    note: "Einstellungen werden sofort angewendet und im Browser gespeichert.",
    loadingFiles: "KARTENDATEIEN WERDEN GELADEN",
    loadingUnity: "UNITY-ENGINE WIRD GESTARTET",
    loadingTrack: "STRECKE WIRD VORBEREITET",
    localBuild: "LOKALER BUILD · SURFVT14",
    selectedMap: "Ausgewählte Karte",
  },
  fr: {
    settings: "PARAMÈTRES",
    play: "JOUER",
    close: "FERMER",
    map: "CHOISIR LA CARTE",
    mapsAvailable: "cartes disponibles",
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
    timerSize: "TAILLE DU CHRONOMÈTRE",
    timerFont: "POLICE DU CHRONOMÈTRE",
    wasd: "WASD · PC ET MOBILE",
    pcKeys: "TOUCHES · PC UNIQUEMENT",
    wasdSize: "TAILLE WASD",
    horizontal: "POSITION HORIZONTALE",
    vertical: "POSITION VERTICALE",
    hoverboard: "THREE TOUCH HOVERBOARD",
    autoBoost: "AUTOBOOST · 3 CLICS FUSÉE",
    autoBoostHotkey: "TOUCHE AUTOBOOST",
    note: "Les réglages sont appliqués immédiatement et sauvegardés dans ce navigateur.",
    loadingFiles: "CHARGEMENT DES FICHIERS",
    loadingUnity: "DÉMARRAGE DU MOTEUR UNITY",
    loadingTrack: "PRÉPARATION DE LA PISTE",
    localBuild: "VERSION LOCALE · SURFVT14",
    selectedMap: "Carte sélectionnée",
  },
  zh: {
    settings: "设置",
    play: "开始游戏",
    close: "关闭",
    map: "选择地图",
    mapsAvailable: "张可用地图",
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
    timerSize: "计时器大小",
    timerFont: "计时器字体",
    wasd: "屏幕 WASD · 电脑和手机",
    pcKeys: "屏幕按键 · 仅电脑",
    wasdSize: "WASD 大小",
    horizontal: "水平位置",
    vertical: "垂直位置",
    hoverboard: "THREE TOUCH HOVERBOARD",
    autoBoost: "自动加速 · 火箭点击 3 次",
    autoBoostHotkey: "自动加速热键",
    note: "设置会立即应用并保存在此浏览器中。",
    loadingFiles: "正在加载地图文件",
    loadingUnity: "正在启动 UNITY 引擎",
    loadingTrack: "正在准备赛道",
    localBuild: "本地版本 · SURFVT14",
    selectedMap: "当前地图",
  },
};

function FloatingTimer({ settings }: { settings: HubSettings }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [splits, setSplits] = useState<Array<{ total: number; lap: number }>>(
    [],
  );
  const [color, setColor] = useState<TimerColor>("cyan");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [position, setPosition] = useState({ x: 18, y: 76 });
  const startAt = useRef(0);
  const elapsedAtStart = useRef(0);
  const lastSplitAt = useRef(0);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const tapTimer = useRef<number | null>(null);

  const toggle = useCallback(() => {
    setRunning((current) => {
      if (current) {
        setElapsed(Date.now() - startAt.current + elapsedAtStart.current);
      } else {
        elapsedAtStart.current = elapsed;
        startAt.current = Date.now();
      }
      return !current;
    });
  }, [elapsed]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setSplits([]);
    elapsedAtStart.current = 0;
    lastSplitAt.current = 0;
  }, []);

  const split = useCallback(() => {
    const current = running
      ? Date.now() - startAt.current + elapsedAtStart.current
      : elapsed;
    setElapsed(current);
    setSplits((items) =>
      [{ total: current, lap: current - lastSplitAt.current }, ...items].slice(
        0,
        8,
      ),
    );
    lastSplitAt.current = current;
  }, [elapsed, running]);

  useEffect(() => {
    if (!running) return;
    const update = () =>
      setElapsed(Date.now() - startAt.current + elapsedAtStart.current);
    const interval = window.setInterval(update, 31);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const onTimerToggle = () => toggle();
    const onTimerReset = () => reset();
    const onTimerSplit = () => split();
    window.addEventListener("SURFVT14_TIMER_TOGGLE", onTimerToggle);
    window.addEventListener("SURFVT14_TIMER_RESET", onTimerReset);
    window.addEventListener("SURFVT14_TIMER_SPLIT", onTimerSplit);
    return () => {
      window.removeEventListener("SURFVT14_TIMER_TOGGLE", onTimerToggle);
      window.removeEventListener("SURFVT14_TIMER_RESET", onTimerReset);
      window.removeEventListener("SURFVT14_TIMER_SPLIT", onTimerSplit);
    };
  }, [reset, split, toggle]);

  useEffect(
    () => () => {
      if (tapTimer.current) window.clearTimeout(tapTimer.current);
    },
    [],
  );

  const handleTap = () => {
    if (tapTimer.current) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
      reset();
      return;
    }
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null;
      toggle();
    }, 260);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: position.x,
      top: position.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const width = 238;
    const height = 88;
    setPosition({
      x: Math.max(
        8,
        Math.min(
          window.innerWidth - width - 8,
          drag.current.left + event.clientX - drag.current.x,
        ),
      ),
      y: Math.max(
        56,
        Math.min(
          window.innerHeight - height - 8,
          drag.current.top + event.clientY - drag.current.y,
        ),
      ),
    });
  };

  return (
    <div
      className={`floating-timer timer-${color} ${settings.timerEnabled ? "" : "timer-disabled"}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${settings.timerScale / 100})`,
        transformOrigin: "top left",
        fontFamily: settings.timerFont,
      }}
      aria-label="Cronômetro flutuante"
    >
      <div
        className="timer-drag"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          drag.current = null;
        }}
        title="Arraste para mover"
      >
        <GripHorizontal aria-hidden="true" />
        <span>FLOATING TIMER</span>
        <span className={`timer-status ${running ? "is-running" : ""}`} />
      </div>
      <button
        className="timer-face"
        type="button"
        onClick={handleTap}
        aria-label={running ? "Pausar cronômetro" : "Iniciar cronômetro"}
      >
        {formatTime(elapsed)}
      </button>
      <div className="timer-actions">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={running ? "Pausar" : "Iniciar"}
          title="Q · iniciar ou pausar"
        >
          {running ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          aria-label="Reiniciar"
          title="R · reiniciar"
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={split}
          aria-label="Criar split"
          title="E · split"
        >
          <Flag />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPaletteOpen((open) => !open)}
          aria-label="Mudar cor"
        >
          <Palette />
        </Button>
      </div>
      {splits.length > 0 && (
        <div className="timer-splits" aria-label="Lista de splits">
          {splits.map((item, index) => (
            <div className="timer-split-row" key={`${item.total}-${index}`}>
              <span>#{splits.length - index}</span>
              <strong>{formatTime(item.lap)}</strong>
              <small>{formatTime(item.total)}</small>
            </div>
          ))}
        </div>
      )}
      {paletteOpen && (
        <div className="timer-palette" aria-label="Cores do cronômetro">
          {timerColors.map((option) => (
            <button
              key={option}
              type="button"
              className={`timer-swatch swatch-${option} ${option === color ? "is-selected" : ""}`}
              onClick={() => {
                setColor(option);
                setPaletteOpen(false);
              }}
              aria-label={`Cor ${option}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function saturationValue(level: HubSettings["saturation"]) {
  return level === "off"
    ? 1
    : level === "low"
      ? 1.25
      : level === "medium"
        ? 1.5
        : 1.9;
}

function ChronoTimer({ settings }: { settings: HubSettings }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const baseElapsed = useRef(0);
  const elapsedRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => {
      if (startedAt.current != null) {
        const next = baseElapsed.current + Date.now() - startedAt.current;
        elapsedRef.current = next;
        setElapsed(next);
      }
    }, 47);
    return () => window.clearInterval(tick);
  }, [running]);
  useEffect(() => {
    const toggleFromHub = () =>
      setRunning((current) => {
        if (current) {
          baseElapsed.current = elapsedRef.current;
          startedAt.current = null;
        } else {
          baseElapsed.current = elapsedRef.current;
          startedAt.current = Date.now();
        }
        return !current;
      });
    const resetFromHub = () => {
      startedAt.current = null;
      baseElapsed.current = 0;
      elapsedRef.current = 0;
      setElapsed(0);
      setRunning(false);
    };
    const onGameEvent = (event: Event) => {
      const type = String(
        (event as CustomEvent<{ type?: string }>).detail?.type || "",
      );
      if (
        type === "poki:gameplayStart" ||
        type === "poki:roundStart" ||
        type === "reborn:runStarted"
      ) {
        startedAt.current = Date.now();
        setRunning(true);
      } else if (
        type === "poki:roundEnd" ||
        type === "reborn:playerDied" ||
        type === "reborn:gameEnded"
      ) {
        setRunning(false);
        baseElapsed.current = elapsedRef.current;
      }
    };
    window.addEventListener("SURFVT14_TIMER_TOGGLE", toggleFromHub);
    window.addEventListener("SURFVT14_TIMER_RESET", resetFromHub);
    window.addEventListener("tro:unity-runtime-event", onGameEvent);
    return () => {
      window.removeEventListener("SURFVT14_TIMER_TOGGLE", toggleFromHub);
      window.removeEventListener("SURFVT14_TIMER_RESET", resetFromHub);
      window.removeEventListener("tro:unity-runtime-event", onGameEvent);
    };
  }, []);
  const toggle = () => {
    if (running) {
      baseElapsed.current = elapsedRef.current;
      startedAt.current = null;
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  };
  const reset = () => {
    startedAt.current = null;
    baseElapsed.current = 0;
    elapsedRef.current = 0;
    setElapsed(0);
    setRunning(false);
  };
  const text = formatTime(elapsed).replace(/^00:/, "");
  return (
    <div
      className={`chrono-port ${running ? "is-running" : elapsed > 0 ? "is-paused" : ""}`}
      style={{
        transform: `scale(${settings.timerScale / 100})`,
        transformOrigin: "top left",
        fontFamily: settings.timerFont,
      }}
      aria-label="Chrono v4.0 portado do APK para navegador"
    >
      <div className="chrono-port-topline">
        <span className="chrono-port-led" />
        <span>CHRONO V4.0</span>
        <small>ANDROID PORT · WEB</small>
      </div>
      <div className="chrono-port-display">
        <span className="chrono-port-prefix">TIME</span>
        {formatTime(elapsed)}
      </div>
      <div className="chrono-port-status">
        {running ? "RUNNING" : elapsed > 0 ? "PAUSED" : "READY"}
      </div>
      <div className="chrono-port-actions">
        <button type="button" onClick={toggle}>
          {running ? "PAUSE" : "START"}
        </button>
        <button type="button" onClick={reset}>
          RESET
        </button>
      </div>
    </div>
  );
}

function LiveSplitTimer({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const frame = document.querySelector<HTMLIFrameElement>(".game-frame");
    if (!frame) return;
    let injectedScript: HTMLScriptElement | null = null;
    const injectIntoGameFrame = () => {
      const gameDocument = frame.contentDocument;
      if (
        !gameDocument ||
        gameDocument.querySelector("script[data-surfvt14-livesplit]")
      )
        return;
      injectedScript = gameDocument.createElement("script");
      injectedScript.src = "/chronometers/livesplit-timer.js";
      injectedScript.async = true;
      injectedScript.dataset.surfvt14Livesplit = "true";
      (gameDocument.head || gameDocument.documentElement).appendChild(
        injectedScript,
      );
    };
    frame.addEventListener("load", injectIntoGameFrame);
    injectIntoGameFrame();
    return () => {
      frame.removeEventListener("load", injectIntoGameFrame);
      injectedScript?.remove();
      frame.contentDocument?.getElementById("chrono")?.remove();
      frame.contentDocument?.getElementById("chronoSettingsPopup")?.remove();
      frame.contentDocument
        ?.getElementById("surfvt14-livesplit-style")
        ?.remove();
    };
  }, [enabled]);
  return null;
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
  veniceVariant = "normal",
}: GamePlayerProps) {
  // Venice Moded continua mostrando o cronômetro, mas recebe record=off
  // e permanece fora do fluxo de recordes.
  const timerCompatible = map !== "moggers" && !downloadOnly;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const soundcloudRef = useRef<HTMLIFrameElement>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [frameFps, setFrameFps] = useState(0);
  const [soundcloudPosition, setSoundcloudPosition] = useState(0);
  const activeControlKey = useRef<string | null>(null);
  const lastControlPress = useRef<{ key: string; at: number }>({
    key: "",
    at: 0,
  });
  useEffect(() => {
    if (!downloadOnly) return;
    onProgress(1);
    onReady();
  }, [downloadOnly]);
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
    // O foguete configurado para o AutoBoost fica no canto inferior esquerdo.
    // Centro da área visual do foguete: abaixo da estrela azul e dentro do
    // quadrado inferior esquerdo, sem mover nem substituir o botão do Unity.
    const clientX = rect.left + rect.width * 0.12;
    const clientY = rect.top + rect.height * 0.86;
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
        pointerType: "touch",
        isPrimary: true,
        width: 1,
        height: 1,
        pressure: 0.7,
      } as PointerEventInit;
      // Unity 2019 mobile builds commonly listen to touch events, while the
      // desktop builds listen to mouse/pointer events. Send both families.
      try { target.dispatchEvent(new PointerEvent("pointerdown", pointerInit)); } catch (_) {}
      try {
        const TouchCtor = (view as Window & typeof globalThis).Touch;
        const touch = TouchCtor
          ? new TouchCtor({ identifier: 914, target, clientX, clientY, pageX: clientX, pageY: clientY })
          : ({ identifier: 914, target, clientX, clientY, pageX: clientX, pageY: clientY } as unknown as Touch);
        target.dispatchEvent(new TouchEvent("touchstart", {
          bubbles: true, cancelable: true, touches: [touch], targetTouches: [touch], changedTouches: [touch],
        }));
      } catch (_) {}
      target.dispatchEvent(new MouseEvent("mousedown", mouse));
      try { target.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0, pressure: 0 })); } catch (_) {}
      try {
        const TouchCtor = (view as Window & typeof globalThis).Touch;
        const touch = TouchCtor
          ? new TouchCtor({ identifier: 914, target, clientX, clientY, pageX: clientX, pageY: clientY })
          : ({ identifier: 914, target, clientX, clientY, pageX: clientY, pageY: clientY } as unknown as Touch);
        target.dispatchEvent(new TouchEvent("touchend", {
          bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [touch],
        }));
      } catch (_) {}
      target.dispatchEvent(new MouseEvent("mouseup", { ...mouse, buttons: 0 }));
      target.dispatchEvent(new MouseEvent("click", mouse));
    };
    [0, 90, 180].forEach((delay) => window.setTimeout(click, delay));
  };

  useEffect(() => {
    setIsDesktop(
      typeof window !== "undefined" &&
        navigator.maxTouchPoints === 0 &&
        !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
    );
  }, []);
  useEffect(() => {
    if (!settings.fps) {
      setFrameFps(0);
      return;
    }
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    let timeout = 0;
    const step = (now: number) => {
      frames += 1;
      if (now - last >= 1000) {
        setFrameFps(frames);
        frames = 0;
        last = now;
      }
      const cap =
        settings.fpsCap === "unlocked" ? 0 : 1000 / Number(settings.fpsCap);
      if (cap)
        timeout = window.setTimeout(() => {
          raf = requestAnimationFrame(step);
        }, cap);
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [settings.fps, settings.fpsCap]);

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
      ) return;
      if (!matchesHotkey(event.key, event.code)) return;
      event.preventDefault();
      triggerAutoBoost();
    };
    const handleGameKey = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type !== "SURFVT14_GAME_KEY" || data.repeat) return;
      if (!matchesHotkey(String(data.key || ""), String(data.code || ""))) return;
      triggerAutoBoost();
    };
    window.addEventListener("keydown", handleAutoBoost, true);
    window.addEventListener("message", handleGameKey);
    return () => {
      window.removeEventListener("keydown", handleAutoBoost, true);
      window.removeEventListener("message", handleGameKey);
    };
  }, [map, settings.autoBoostEnabled, settings.autoBoostHotkey]);

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
            hoverboard: settings.hoverboard,
            controls: settings.controls,
            timerEnabled: settings.timerEnabled,
            saturation: settings.saturation,
            fpsCap: settings.fpsCap,
            volume: settings.volume,
            autoBoostEnabled: settings.autoBoostEnabled,
            autoBoostHotkey: settings.autoBoostHotkey,
            hoverboard: settings.hoverboard,
            extensionCompat: true,
          },
        },
        "*",
      );
      target.postMessage(
        { type: "SURFVT14_FRAME_CAP", fpsCap: settings.fpsCap },
        "*",
      );
      target.postMessage(
        { type: "VOLT_EXTENSION_COMPAT", enabled: true },
        "*",
      );
      target.postMessage(
        { type: "SRC_PLUS_PLUS_COMPAT", enabled: true },
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
              {map.toUpperCase()} // {downloadOnly ? "PACOTE ANDROID" : "BUILD LOCAL"}
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
                if (
                  gameDocument &&
                  !gameDocument.querySelector("script[data-surfvt14-enhanced]")
                ) {
                  const enhancedScript = gameDocument.createElement("script");
                  enhancedScript.src = "/chronometers/enhanced-controls.js";
                  enhancedScript.dataset.surfvt14Enhanced = "true";
                  (gameDocument.head || gameDocument.documentElement).appendChild(
                    enhancedScript,
                  );
                }
                window.setTimeout(() => {
                  frameRef.current?.contentWindow?.postMessage(
                    { type: "SURFVT14_HUB_SETTINGS", settings },
                    "*",
                  );
                }, 250);
              }}
              onError={() =>
                onError("O iframe do mapa não conseguiu carregar os arquivos locais.")
              }
            />
          )}
        </div>
      )}
      {isVisible && settings.wasdEnabled && !downloadOnly && (
        <div
          className={`on-screen-controls ${isDesktop ? "on-screen-controls-desktop" : "on-screen-controls-mobile"}`}
          style={
            {
              "--controls-scale": settings.controlSize / 100,
              "--controls-x": `${settings.controlX}%`,
              "--controls-y": `${settings.controlY}%`,
            } as React.CSSProperties
          }
          aria-label={`Controles ${settings.controls}`}
        >
          <span className="on-screen-controls-label">
            {isDesktop ? `${settings.controls} · PC` : "SETAS · TOQUE"}
          </span>
          <div className="control-keyboard">
            <span className="control-spacer" aria-hidden="true" />
            {displayControlKeys.map((key, index) => {
              const slot =
                index === 0
                  ? "control-up"
                  : index === 1
                    ? "control-left"
                    : index === 2
                      ? "control-down"
                      : "control-right";
              return (
                <button
                  key={key}
                  type="button"
                  className={`${slot} ${pressedKey === key || pressedKey === key.toLowerCase() ? "is-pressed" : ""}`}
                  onPointerDown={(event) => pressControlDown(key, event)}
                  onPointerUp={() => releaseControlKey(key)}
                  onPointerCancel={() => releaseControlKey(key)}
                  onPointerLeave={() => releaseControlKey(key)}
                  onTouchStart={(event) => {
                    if (typeof PointerEvent !== "undefined") return;
                    event.preventDefault();
                    pressControlKey(key);
                  }}
                  onTouchEnd={(event) => {
                    if (typeof PointerEvent !== "undefined") return;
                    event.preventDefault();
                    releaseControlKey(key);
                  }}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {isVisible && settings.fps && (
        <div
          className="minimal-fps"
          title={`Limite: ${settings.fpsCap === "unlocked" ? "desbloqueado" : `${settings.fpsCap} FPS`}`}
        >
          {frameFps} FPS
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
      {isVisible &&
        timerCompatible &&
        settings.timerEnabled &&
        (settings.timerStyle === "livesplit" ? (
          <LiveSplitTimer enabled />
        ) : settings.timerStyle === "chrono" ? (
          <ChronoTimer settings={settings} />
        ) : (
          <FloatingTimer settings={settings} />
        ))}
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
  const [launchedMap, setLaunchedMap] = useState<MapId>("zurich");
  const [veniceVariant, setVeniceVariant] = useState<VeniceVariant>("normal");
  const [veniceChoiceOpen, setVeniceChoiceOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<HubSettings>(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("surfvt14-settings") || "{}",
      );
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
        localStorage.setItem(
          "surfvt14BoardTripleTap",
          settings.hoverboard ? "true" : "false",
        );
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
      const interval = settings.fpsCap === "unlocked"
        ? 0
        : 1000 / Number(settings.fpsCap);
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
      className={`theme-shell theme-${theme} saturation-${settings.saturation}`}
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
          mapPath={
            launchedMap === "venice" && veniceVariant === "normal"
              ? "/maps/venice-normal/index.html"
              : (maps.find((map) => map.id === launchedMap)?.path ??
                maps[0]!.path)
          }
          mapDownloadUrl={maps.find((map) => map.id === launchedMap)?.downloadUrl}
          downloadOnly={maps.find((map) => map.id === launchedMap)?.downloadOnly}
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
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-8 sm:py-8">
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
              <a href="#community">{copy.community}</a>
              <a href="#about">{copy.about}</a>
            </nav>

            <div
              className="theme-switcher flex flex-wrap items-center justify-end gap-2"
              aria-label="Temas da interface"
            >
              {(Object.keys(themeMeta) as Theme[]).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  className={`theme-choice theme-choice-${option}`}
                  variant={theme === option ? "default" : "outline"}
                  onClick={() => setTheme(option)}
                  onPointerUp={pointerAction(() => setTheme(option))}
                >
                  {themeMeta[option].label}
                </Button>
              ))}
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
          <a
            id="community"
            className="discord-banner"
            href="https://discord.gg/7UQXW4rT4b"
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
            </span>
            <span className="discord-arrow">↗</span>
          </a>

          <section
            id="collection"
            className="grid flex-1 items-center gap-6 py-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(350px,.72fr)]"
          >
            <div className="lobby-title-block">
              <h2 className="display-font mt-2 text-6xl leading-none sm:text-8xl">
                {selectedTitle}
              </h2>
              <p className="body-font mt-4 max-w-xl text-xl text-muted-foreground">
                <strong>{selected.name}</strong> · {selected.region}.
              </p>
              <div className="street-cred mt-8 max-w-lg">
                <div className="ui-font flex justify-between text-xs">
                  <span>
                    {copy.level} {liveLevel}
                  </span>
                  <span>
                    {liveTokens} {copy.tokens.toLowerCase()}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-muted">
                  <div className="h-full w-3/4 bg-secondary" />
                </div>
              </div>
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
                  {maps.length} {copy.mapsAvailable}
                </span>
              </div>
              {selected.id === "moggers" && (
                <p className="standalone-game-warning" role="note">
                  Este é um jogo independente, não um mapa de Subway Surfers.
                  Ele usa os controles, contador de FPS e SoundCloud do hub, mas
                  não é compatível com cronômetros.
                </p>
              )}

              <div
                className="map-selector"
                role="radiogroup"
                aria-label={copy.map}
              >
                {maps.map((map) => {
                  const active = map.id === selectedMap;
                  return (
                    <Button
                      key={map.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className="map-button"
                      role="radio"
                      aria-checked={active}
                      data-map-id={map.id}
                      onClick={() => setSelectedMap(map.id)}
                    >
                      {map.icon ? (
                        <img
                          className="map-button-icon"
                          src={map.icon}
                          alt=""
                        />
                      ) : map.showMark === false ? null : (
                        <span className="map-button-mark">
                          {map.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="ui-font text-sm">{map.name}</span>
                      <span className="text-[10px] opacity-70">
                        {map.region}
                      </span>
                    </Button>
                  );
                })}
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
            </div>
          </section>
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
                    <option value="native">SURFVT14</option>
                    <option value="livesplit">LIVESPLIT WEB</option>
                    <option value="chrono">CHRONO 4.0</option>
                  </select>
                </label>
                {settings.timerStyle !== "livesplit" && (
                  <>
                    <label>
                      <span>
                        {copy.timerSize} <b>{settings.timerScale}%</b>
                      </span>
                      <input
                        type="range"
                        min="70"
                        max="140"
                        value={settings.timerScale}
                        onChange={(e) =>
                          updateSetting("timerScale", Number(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      <span>{copy.timerFont}</span>
                      <select
                        value={settings.timerFont}
                        onChange={(e) => updateSetting("timerFont", e.target.value)}
                      >
                        <option>Rajdhani</option>
                        <option>Orbitron</option>
                        <option>Montserrat</option>
                        <option>monospace</option>
                      </select>
                    </label>
                  </>
                )}
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
                <label>
                  <span>
                    {copy.wasdSize} <b>{settings.controlSize}%</b>
                  </span>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={settings.controlSize}
                    onChange={(e) =>
                      updateSetting("controlSize", Number(e.target.value))
                    }
                  />
                </label>
                {settings.timerStyle !== "livesplit" && (
                  <>
                <label>
                  <span>
                    {copy.horizontal} <b>{settings.controlX}%</b>
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={settings.controlX}
                    onChange={(e) =>
                      updateSetting("controlX", Number(e.target.value))
                    }
                  />
                </label>
                <label>
                  <span>
                    {copy.vertical} <b>{settings.controlY}%</b>
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={settings.controlY}
                    onChange={(e) =>
                      updateSetting("controlY", Number(e.target.value))
                    }
                  />
                </label>
                  </>
                )}
                <label>
                  <span>{copy.hoverboard}</span>
                  <input
                    type="checkbox"
                    checked={settings.hoverboard}
                    onChange={(e) =>
                      updateSetting("hoverboard", e.target.checked)
                    }
                  />
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
            <div className="loading-panel reference-loader">
              <div className="loading-topbar">
                <span className="loading-dot" />
                <span>{launchedMap.toUpperCase()} / SURFVT14</span>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={copy.close}
                >
                  ×
                </button>
              </div>
              <div className="loading-yellow-rule" />
              <div className="loading-reference-body">
                <span className="loading-kicker">SUBWAY SURFERS · WEBGL 2</span>
                <h2>{launchedMap.toUpperCase()}</h2>
                <p>{loadingMessage}</p>
                <div className="reference-track">
                  <div style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="reference-percent">{progressPercent}%</div>
                <small>
                  BUILD LOCAL · SURFVT14 · arquivos ficam no cache após o
                  primeiro download
                </small>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
