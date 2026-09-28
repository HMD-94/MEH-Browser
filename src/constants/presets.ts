import {
  ThemeConfig,
  WallpaperConfig,
  SearchEngine,
  SpeedDialItem,
  Bookmark,
  BrowserSettings,
} from '../types/browser';

import liquidGlassImg from '../assets/images/wallpaper_liquid_glass_1790369675962.jpg';
import auroraDriftImg from '../assets/images/wallpaper_aurora_drift_1790369689882.jpg';
import sunsetPrismImg from '../assets/images/wallpaper_sunset_prism_1790369703033.jpg';

export interface WallpaperPreset {
  id: string;
  name: string;
  category: 'liquid-glass' | 'abstract' | 'gradient' | 'dark' | 'colorful' | 'nature' | 'cyber';
  thumbnailUrl?: string;
  imageUrl?: string;
  gradientCss?: string;
  isAnimated?: boolean;
}

export function resolveWallpaperUrl(url?: string): string {
  if (!url) return liquidGlassImg;
  if (url.includes('wallpaper_liquid_glass') || url.includes('liquid-glass')) {
    return liquidGlassImg;
  }
  if (url.includes('wallpaper_aurora_drift') || url.includes('aurora-drift')) {
    return auroraDriftImg;
  }
  if (url.includes('wallpaper_sunset_prism') || url.includes('sunset-prism')) {
    return sunsetPrismImg;
  }
  return url;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'liquid-glass-flow',
    name: 'Liquid Glass Ribbon',
    category: 'liquid-glass',
    imageUrl: liquidGlassImg,
    thumbnailUrl: liquidGlassImg,
  },
  {
    id: 'aurora-drift',
    name: 'Aurora Borealis',
    category: 'abstract',
    imageUrl: auroraDriftImg,
    thumbnailUrl: auroraDriftImg,
  },
  {
    id: 'sunset-prism',
    name: 'Sunset Prisme',
    category: 'colorful',
    imageUrl: sunsetPrismImg,
    thumbnailUrl: sunsetPrismImg,
  },
  {
    id: 'tokyo-cyber',
    name: 'Tokyo Cyberpunk Neon',
    category: 'cyber',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'cosmic-nebula',
    name: 'Nébuleuse Cosmique 4K',
    category: 'dark',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'alpine-mist',
    name: 'Montagnes & Brume Alpine',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'holographic-flow',
    name: 'Holographic Liquid Mesh',
    category: 'liquid-glass',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'deep-ocean',
    name: 'Abysses Océan Profond',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'emerald-rainforest',
    name: 'Émeraude Forêt Sauvage',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'golden-dune',
    name: 'Dunes Crépuscule Doré',
    category: 'colorful',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'dark-minimal-mesh',
    name: 'Obsidienne Minimaliste OLED',
    category: 'dark',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=480&q=70',
  },
  {
    id: 'animated-fluid',
    name: 'Plasma Fluide Animé',
    category: 'liquid-glass',
    isAnimated: true,
  },
  {
    id: 'animated-particle',
    name: 'Vague d’Ondes Particules',
    category: 'abstract',
    isAnimated: true,
  },
  {
    id: 'midnight-obsidian',
    name: 'Obsidienne Minuit',
    category: 'dark',
    gradientCss: 'radial-gradient(ellipse at 80% 20%, #1e1b4b 0%, #090a0f 60%, #030407 100%)',
  },
  {
    id: 'ocean-depths',
    name: 'Abysses Océan',
    category: 'gradient',
    gradientCss: 'linear-gradient(135deg, #022c43 0%, #053f5c 30%, #115173 60%, #021727 100%)',
  },
  {
    id: 'neon-cyber-velvet',
    name: 'Velours Cyber',
    category: 'colorful',
    gradientCss: 'radial-gradient(circle at 20% 30%, #581c87 0%, #172554 50%, #030712 90%)',
  },
  {
    id: 'emerald-glass',
    name: 'Émeraude Givrée',
    category: 'abstract',
    gradientCss: 'linear-gradient(145deg, #064e3b 0%, #022c22 45%, #051d19 100%)',
  },
  {
    id: 'solar-flare',
    name: 'Éruption Solaire & Ambre',
    category: 'colorful',
    gradientCss: 'linear-gradient(135deg, #451a03 0%, #9a3412 40%, #ea580c 70%, #fbbf24 100%)',
  },
  {
    id: 'royal-amethyst',
    name: 'Améthyste Royale',
    category: 'gradient',
    gradientCss: 'linear-gradient(150deg, #1e1b4b 0%, #3b0764 40%, #701a75 75%, #a21caf 100%)',
  },
  {
    id: 'pastel-frost',
    name: 'Pastel Rosé Clair',
    category: 'colorful',
    gradientCss: 'linear-gradient(120deg, #fbcfe8 0%, #e0e7ff 50%, #ccfbf1 100%)',
  },
];

export const THEME_PRESETS: Record<string, Partial<ThemeConfig>> = {
  'dark-glass': {
    preset: 'dark-glass',
    mode: 'dark',
    primaryColor: '#38bdf8',
    secondaryColor: '#818cf8',
    buttonColor: '#38bdf8',
    glassTransparency: 0.72,
    liquidGlassIntensity: 0.8,
    glassBlur: 20,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'medium',
  },
  'light-glass': {
    preset: 'light-glass',
    mode: 'light',
    primaryColor: '#0284c7',
    secondaryColor: '#6366f1',
    buttonColor: '#0284c7',
    glassTransparency: 0.65,
    liquidGlassIntensity: 0.75,
    glassBlur: 24,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'subtle',
  },
  'cyberpunk': {
    preset: 'cyberpunk',
    mode: 'dark',
    primaryColor: '#06b6d4',
    secondaryColor: '#f43f5e',
    buttonColor: '#f43f5e',
    glassTransparency: 0.75,
    liquidGlassIntensity: 0.95,
    glassBlur: 22,
    cornerRadius: 'rounded-xl',
    shadowDepth: 'glow',
  },
  'emerald-lux': {
    preset: 'emerald-lux',
    mode: 'dark',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    buttonColor: '#10b981',
    glassTransparency: 0.72,
    liquidGlassIntensity: 0.85,
    glassBlur: 22,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'glow',
  },
  'rose-quartz': {
    preset: 'rose-quartz',
    mode: 'dark',
    primaryColor: '#f472b6',
    secondaryColor: '#fb7185',
    buttonColor: '#f472b6',
    glassTransparency: 0.7,
    liquidGlassIntensity: 0.85,
    glassBlur: 24,
    cornerRadius: 'rounded-3xl',
    shadowDepth: 'glow',
  },
  'ocean': {
    preset: 'ocean',
    mode: 'dark',
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    buttonColor: '#06b6d4',
    glassTransparency: 0.75,
    liquidGlassIntensity: 0.85,
    glassBlur: 22,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'medium',
  },
  'purple': {
    preset: 'purple',
    mode: 'dark',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    buttonColor: '#a855f7',
    glassTransparency: 0.7,
    liquidGlassIntensity: 0.8,
    glassBlur: 20,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'glow',
  },
  'red': {
    preset: 'red',
    mode: 'dark',
    primaryColor: '#f43f5e',
    secondaryColor: '#fb923c',
    buttonColor: '#f43f5e',
    glassTransparency: 0.74,
    liquidGlassIntensity: 0.8,
    glassBlur: 20,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'glow',
  },
  'green': {
    preset: 'green',
    mode: 'dark',
    primaryColor: '#10b981',
    secondaryColor: '#14b8a6',
    buttonColor: '#10b981',
    glassTransparency: 0.72,
    liquidGlassIntensity: 0.8,
    glassBlur: 20,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'medium',
  },
  'sunset': {
    preset: 'sunset',
    mode: 'dark',
    primaryColor: '#f97316',
    secondaryColor: '#f43f5e',
    buttonColor: '#f97316',
    glassTransparency: 0.7,
    liquidGlassIntensity: 0.85,
    glassBlur: 22,
    cornerRadius: 'rounded-2xl',
    shadowDepth: 'glow',
  },
  'midnight': {
    preset: 'midnight',
    mode: 'dark',
    primaryColor: '#6366f1',
    secondaryColor: '#38bdf8',
    buttonColor: '#6366f1',
    glassTransparency: 0.82,
    liquidGlassIntensity: 0.7,
    glassBlur: 24,
    cornerRadius: 'rounded-xl',
    shadowDepth: 'deep',
  },
  'aurora': {
    preset: 'aurora',
    mode: 'dark',
    primaryColor: '#2dd4bf',
    secondaryColor: '#a855f7',
    buttonColor: '#2dd4bf',
    glassTransparency: 0.68,
    liquidGlassIntensity: 0.9,
    glassBlur: 24,
    cornerRadius: 'rounded-3xl',
    shadowDepth: 'glow',
  },
};

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q=',
    icon: 'search',
    color: '#4285F4',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    searchUrl: 'https://duckduckgo.com/?q=',
    icon: 'shield',
    color: '#DE5833',
  },
  {
    id: 'bing',
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q=',
    icon: 'compass',
    color: '#008373',
  },
  {
    id: 'brave',
    name: 'Brave Search',
    searchUrl: 'https://search.brave.com/search?q=',
    icon: 'zap',
    color: '#FB542B',
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    searchUrl: 'https://search.yahoo.com/search?p=',
    icon: 'globe',
    color: '#6001D2',
  },
];

export const DEFAULT_SPEED_DIAL: SpeedDialItem[] = [
  {
    id: 'sd-1',
    title: 'Wikipedia',
    url: 'https://fr.wikipedia.org',
    icon: 'book-open',
    color: '#4f46e5',
  },
  {
    id: 'sd-2',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'git-branch',
    color: '#181717',
  },
  {
    id: 'sd-3',
    title: 'YouTube',
    url: 'https://youtube.com',
    icon: 'play',
    color: '#ef4444',
  },
  {
    id: 'sd-4',
    title: 'Reddit',
    url: 'https://reddit.com',
    icon: 'message-circle',
    color: '#ff4500',
  },
  {
    id: 'sd-5',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    icon: 'hash',
    color: '#ff6600',
  },
  {
    id: 'sd-6',
    title: 'Dribbble',
    url: 'https://dribbble.com',
    icon: 'pen-tool',
    color: '#ea4c89',
  },
  {
    id: 'sd-7',
    title: 'Météo France',
    url: 'https://meteofrance.com',
    icon: 'cloud-sun',
    color: '#0284c7',
  },
  {
    id: 'sd-8',
    title: 'Le Monde',
    url: 'https://lemonde.fr',
    icon: 'newspaper',
    color: '#0f172a',
  },
];

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-1',
    title: 'Documentation MEH',
    url: 'meh://welcome',
    folder: 'Général',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'bm-2',
    title: 'Wikipedia Francophone',
    url: 'https://fr.wikipedia.org',
    folder: 'Références',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'bm-3',
    title: 'GitHub Code Repositories',
    url: 'https://github.com',
    folder: 'Développement',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'bm-4',
    title: 'DuckDuckGo Recherche Privée',
    url: 'https://duckduckgo.com',
    folder: 'Général',
    createdAt: Date.now() - 40000,
  },
];

export const DEFAULT_WALLPAPER: WallpaperConfig = {
  type: 'preset',
  presetId: 'liquid-glass-flow',
  blur: 0,
  opacity: 0.95,
  brightness: 1.0,
  saturation: 1.1,
};

export const DEFAULT_THEME: ThemeConfig = {
  preset: 'dark-glass',
  mode: 'dark',
  primaryColor: '#38bdf8',
  secondaryColor: '#818cf8',
  buttonColor: '#38bdf8',
  glassTransparency: 0.72,
  liquidGlassIntensity: 0.8,
  glassBlur: 20,
  cornerRadius: 'rounded-2xl',
  shadowDepth: 'medium',
  animationsEnabled: true,
  animationSpeed: 'normal',
  font: 'Plus Jakarta Sans',
  textSize: 'base',
  searchBarLook: 'pill',
  mouseGlowEnabled: true,
  showBookmarksBar: true,
};

export const DEFAULT_SETTINGS: BrowserSettings = {
  defaultSearchEngine: 'duckduckgo',
  newTabHomepage: 'meh-home',
  customHomepageUrl: '',
  restoreTabsOnStartup: true,
  closeTabOnMiddleClick: true,
  privacyDoNotTrack: true,
  privacyClearOnExit: false,
  adBlockerEnabled: true,
  adBlockStrictness: 'standard',
  adBlockCookieNotices: true,
  adBlockStats: {
    adsBlocked: 0,
    trackersBlocked: 0,
    totalBlocked: 0,
  },
  downloadFolder: 'Téléchargements/MEH',
  askDownloadPath: false,
  hardwareAcceleration: true,
  googleSearchEngineId: '6731f777b64524256',
};
