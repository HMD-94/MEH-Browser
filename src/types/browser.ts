export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isPinned?: boolean;
  history: string[];
  historyIndex: number;
  isLoading?: boolean;
  isReaderMode?: boolean;
  zoom?: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  folder?: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  timestamp: number;
}

export interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  progress: number; // 0 - 100
  status: 'completed' | 'downloading' | 'paused' | 'failed';
  url: string;
  timestamp: number;
}

export interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  color?: string;
}

export interface GradientStop {
  color: string;
  offset: number; // 0 - 100
}

export interface WallpaperConfig {
  type: 'preset' | 'upload' | 'color' | 'gradient' | 'animated';
  presetId?: string;
  customImageUrl?: string;
  customOnlineUrl?: string;
  solidColor?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle: number;
    stops: GradientStop[];
  };
  animatedType?: 'liquid-plasma' | 'aurora-drift' | 'particle-wave';
  blur: number; // 0 - 40px
  opacity: number; // 0.1 - 1.0
  brightness: number; // 0.2 - 1.5
  saturation: number; // 0.5 - 2.0
  vignette?: boolean;
  filterPreset?: 'none' | 'vibrant' | 'cyberpunk' | 'cinematic' | 'noir' | 'soft';
}

export type ThemePresetId =
  | 'dark-glass'
  | 'light-glass'
  | 'ocean'
  | 'purple'
  | 'red'
  | 'green'
  | 'sunset'
  | 'midnight'
  | 'aurora'
  | 'cyberpunk'
  | 'emerald-lux'
  | 'rose-quartz'
  | 'custom';

export type BrowserFont =
  | 'Plus Jakarta Sans'
  | 'Inter'
  | 'Outfit'
  | 'Space Grotesk'
  | 'Syne'
  | 'Lexend'
  | 'Playfair Display'
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'system-ui';

export interface ThemeConfig {
  preset: ThemePresetId;
  mode: 'dark' | 'light' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  glassTransparency: number; // 0.1 - 0.95
  liquidGlassIntensity: number; // 0.1 - 1.0
  glassBlur: number; // 0 - 40
  cornerRadius: 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
  shadowDepth: 'none' | 'subtle' | 'medium' | 'deep' | 'glow';
  animationsEnabled: boolean;
  animationSpeed: 'normal' | 'snappy' | 'relaxed';
  font: BrowserFont;
  textSize: 'sm' | 'base' | 'lg';
  fontSpacing?: 'compact' | 'normal' | 'relaxed';
  glassStyle?: 'crystal' | 'frosted' | 'neon' | 'smoke';
  searchBarLook: 'pill' | 'minimal' | 'floating' | 'compact';
  mouseGlowEnabled: boolean;
  showBookmarksBar: boolean;
  highContrastText?: boolean;
}

export interface SearchEngine {
  id: 'google' | 'bing' | 'duckduckgo' | 'yahoo' | 'brave';
  name: string;
  searchUrl: string;
  suggestUrl?: string;
  icon: string;
  color: string;
}

export interface KnowledgeGraphData {
  title: string;
  subtitle?: string;
  description: string;
  sourceUrl?: string;
  sourceName?: string;
  imageUrl?: string;
  attributes: Array<{ label: string; value: string }>;
}

export interface LiveSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  icon?: string;
  breadcrumb?: string;
}

export interface LiveImageResult {
  title: string;
  image: string;
  thumbnail: string;
  url: string;
  source: string;
  width?: number;
  height?: number;
}

export interface BrowserSettings {
  defaultSearchEngine: 'google' | 'bing' | 'duckduckgo' | 'yahoo' | 'brave';
  newTabHomepage: 'meh-home' | 'blank' | 'custom';
  customHomepageUrl: string;
  restoreTabsOnStartup: boolean;
  closeTabOnMiddleClick: boolean;
  privacyDoNotTrack: boolean;
  privacyClearOnExit: boolean;
  adBlockerEnabled: boolean;
  adBlockStrictness?: 'standard' | 'aggressive';
  adBlockCookieNotices?: boolean;
  adBlockStats?: {
    adsBlocked: number;
    trackersBlocked: number;
    totalBlocked: number;
  };
  downloadFolder: string;
  askDownloadPath: boolean;
  hardwareAcceleration: boolean;
  googleApiKey?: string;
  googleSearchEngineId?: string; // CX
}
