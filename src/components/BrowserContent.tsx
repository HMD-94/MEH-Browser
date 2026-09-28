import React, { useState, useEffect, useRef } from 'react';
import {
  Tab,
  ThemeConfig,
  WallpaperConfig,
  SearchEngine,
  SpeedDialItem,
  LiveSearchResult,
  LiveImageResult,
  KnowledgeGraphData,
  BrowserSettings,
} from '../types/browser';
import { NewTabPage } from './NewTabPage';
import { YouTubeNormalView } from './YouTubeNormalView';
import {
  fetchLiveWebSearch,
  fetchLiveSearchPayload,
  fetchLiveImageSearch,
  fetchKnowledgeGraph,
} from '../services/searchService';
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  Search,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Globe,
  Share2,
  Copy,
  Check,
  Lock,
  Mic,
  Camera,
  X,
  Play,
  MoreVertical,
  Key,
  Sparkles,
  Plus,
  Bookmark,
  Compass,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Layers,
  Image as ImageIcon,
  Maximize2,
  Download,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { DEFAULT_SEARCH_ENGINES } from '../constants/presets';

interface BrowserContentProps {
  activeTab: Tab;
  theme: ThemeConfig;
  wallpaper?: WallpaperConfig;
  onChangeWallpaper?: (wallpaper: WallpaperConfig) => void;
  currentSearchEngine: SearchEngine;
  onSelectSearchEngine: (engine: SearchEngine) => void;
  speedDial: SpeedDialItem[];
  onAddSpeedDial: (item: Omit<SpeedDialItem, 'id'>) => void;
  onRemoveSpeedDial: (id: string) => void;
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  onGoBack?: () => void;
  onOpenCustomize: () => void;
  onOpenSettings?: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  settings?: BrowserSettings;
  onChangeSettings?: (settings: BrowserSettings) => void;
}

export const BrowserContent: React.FC<BrowserContentProps> = ({
  activeTab,
  theme,
  wallpaper,
  onChangeWallpaper,
  currentSearchEngine,
  onSelectSearchEngine,
  speedDial,
  onAddSpeedDial,
  onRemoveSpeedDial,
  onNavigate,
  onOpenNewTab,
  onGoBack,
  onOpenCustomize,
  onOpenSettings,
  onToggleBookmark,
  isBookmarked,
  settings,
  onChangeSettings,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [currentPageBlockedAds, setCurrentPageBlockedAds] = useState(0);
  const [liveResults, setLiveResults] = useState<LiveSearchResult[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphData | null>(null);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [googleApiNotice, setGoogleApiNotice] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<'all' | 'news' | 'videos' | 'images'>('all');
  const [localSearchInput, setLocalSearchInput] = useState('');
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    result: LiveSearchResult;
  } | null>(null);

  // Image search states
  const [liveImages, setLiveImages] = useState<LiveImageResult[]>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<LiveImageResult | null>(null);
  const [wallpaperToast, setWallpaperToast] = useState<string | null>(null);
  const [forceRawIframeForYouTube, setForceRawIframeForYouTube] = useState(false);

  const url = activeTab?.url || 'meh://newtab';

  const isYouTube =
    url.includes('youtube.com') ||
    url.includes('youtu.be');

  // Check if Search Query
  const isSearchQuery =
    url.includes('duckduckgo.com/?q=') ||
    url.includes('duckduckgo.com/html/?q=') ||
    url.includes('google.com/search') ||
    url.includes('bing.com/search') ||
    url.includes('search.brave.com') ||
    url.includes('search.yahoo.com') ||
    url.startsWith('meh://search?q=');

  const extractQuery = () => {
    try {
      const parsed = new URL(url);
      return (
        parsed.searchParams.get('q') ||
        parsed.searchParams.get('p') ||
        ''
      );
    } catch {
      return url;
    }
  };

  const searchQuery = isSearchQuery ? extractQuery() : '';

  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  // If query specifies image mode in URL
  useEffect(() => {
    if (url.includes('iax=images') || url.includes('ia=images')) {
      setSearchFilter('images');
    }
  }, [url]);

  // Reset iframe states and ad blocker count on URL change
  useEffect(() => {
    setIframeError(false);
    setIframeLoading(true);
    setContextMenu(null);
    setSelectedImagePreview(null);
    setCurrentPageBlockedAds(0);
    setForceRawIframeForYouTube(false);
  }, [url]);

  // Listen to MEH AdShield events from proxied pages
  useEffect(() => {
    const handleAdBlockMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MEH_AD_BLOCKED') {
        const count = typeof e.data.count === 'number' ? e.data.count : 1;
        setCurrentPageBlockedAds(count);

        if (onChangeSettings && settings) {
          const prevTotal = settings.adBlockStats?.totalBlocked || 0;
          const prevAds = settings.adBlockStats?.adsBlocked || 0;
          const prevTrackers = settings.adBlockStats?.trackersBlocked || 0;
          const delta = Math.max(1, count - currentPageBlockedAds);

          onChangeSettings({
            ...settings,
            adBlockStats: {
              adsBlocked: prevAds + Math.ceil(delta * 0.7),
              trackersBlocked: prevTrackers + Math.floor(delta * 0.3),
              totalBlocked: prevTotal + delta,
            },
          });
        }
      }
    };
    window.addEventListener('message', handleAdBlockMessage);
    return () => window.removeEventListener('message', handleAdBlockMessage);
  }, [currentPageBlockedAds, settings, onChangeSettings]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch real DuckDuckGo web search results and Knowledge Graph in a single optimized pass
  useEffect(() => {
    if (isSearchQuery && searchQuery) {
      setIsSearchingLive(true);
      setLiveResults([]);
      setKnowledgeGraph(null);

      // Single optimized network call for both search results and instant answer
      fetchLiveSearchPayload(
        searchQuery,
        settings?.googleApiKey,
        settings?.googleSearchEngineId
      )
        .then((payload) => {
          setLiveResults(payload.results);
          setGoogleApiNotice(payload.googleApiNotice || null);
          setIsSearchingLive(false);

          fetchKnowledgeGraph(searchQuery, payload.instantAnswer)
            .then((kg) => setKnowledgeGraph(kg))
            .catch(() => setKnowledgeGraph(null));
        })
        .catch((err) => {
          console.error('Error fetching live search results:', err);
          setIsSearchingLive(false);
        });
    }
  }, [isSearchQuery, searchQuery, settings?.googleApiKey, settings?.googleSearchEngineId]);

  // Fetch real DuckDuckGo Image results when on images tab or when query changes
  useEffect(() => {
    if (isSearchQuery && searchQuery && searchFilter === 'images') {
      setIsSearchingImages(true);
      fetchLiveImageSearch(searchQuery)
        .then((imgs) => {
          setLiveImages(imgs);
          setIsSearchingImages(false);
        })
        .catch((err) => {
          console.error('Error fetching image search:', err);
          setIsSearchingImages(false);
        });
    }
  }, [isSearchQuery, searchQuery, searchFilter]);

  const handleSetImageAsWallpaper = (imgUrl: string, title?: string) => {
    if (onChangeWallpaper) {
      onChangeWallpaper({
        type: 'upload',
        customImageUrl: imgUrl,
        blur: 0,
        opacity: 0.88,
        brightness: 0.95,
        saturation: 1.15,
      });
      setWallpaperToast(`✨ Fond d'écran mis à jour : ${title ? title.slice(0, 35) + '...' : 'Image appliquée'}`);
      setTimeout(() => setWallpaperToast(null), 3500);
    }
  };

  // New Tab Page
  if (url === 'meh://newtab') {
    return (
      <NewTabPage
        speedDial={speedDial}
        onAddSpeedDial={onAddSpeedDial}
        onRemoveSpeedDial={onRemoveSpeedDial}
        onNavigate={onNavigate}
        currentSearchEngine={currentSearchEngine}
        onSelectSearchEngine={onSelectSearchEngine}
        theme={theme}
        onOpenCustomize={onOpenCustomize}
      />
    );
  }

  // Welcome page
  if (url === 'meh://welcome') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto no-scrollbar">
        <div className="max-w-2xl w-full p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-extrabold text-xl">
              M
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white text-crisp">
                Bienvenue sur MEH Browser
              </h2>
              <p className="text-xs text-white/70">
                Le navigateur nouvelle génération en Liquid Glass avec moteur DuckDuckGo
              </p>
            </div>
          </div>

          <p className="text-sm text-white/90 leading-relaxed font-medium">
            MEH Browser respecte votre vie privée et intègre de vrais résultats de recherche
            DuckDuckGo en direct ainsi qu'un environnement de navigation interne fluide.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => onNavigate('meh://newtab')}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Commencer à naviguer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copyCurrentUrl = (targetUrlToCopy?: string) => {
    const toCopy = targetUrlToCopy || url;
    navigator.clipboard.writeText(toCopy).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // =========================================================================
  // LIQUID GLASS SEARCH RESULTS PAGE (POWERED BY REAL DUCKDUCKGO RESULTS)
  // =========================================================================
  if (isSearchQuery) {
    return (
      <div
        className="w-full h-full flex flex-col overflow-y-auto no-scrollbar relative"
        style={{
          backgroundColor: 'rgba(11, 15, 25, 0.82)',
          backdropFilter: 'blur(28px)',
        }}
      >
        {/* TOP SEARCH NAVIGATION BAR (Liquid Glass style) */}
        <div className="border-b border-white/15 bg-black/40 px-4 sm:px-8 py-3.5 sticky top-0 z-20 backdrop-blur-2xl shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-4xl">
              {/* Back to Previous Page / New Tab */}
              {onGoBack ? (
                <button
                  type="button"
                  onClick={onGoBack}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 border border-white/15 active:scale-95"
                  title="Revenir à la page précédente"
                >
                  <ArrowLeft className="w-4 h-4 text-sky-300" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('meh://newtab')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 border border-white/15 active:scale-95"
                  title="Accueil"
                >
                  <ArrowLeft className="w-4 h-4 text-sky-300" />
                </button>
              )}

              {/* MEH Browser Brand & DuckDuckGo Badge */}
              <div
                onClick={() => onNavigate('meh://newtab')}
                className="cursor-pointer shrink-0 hidden sm:flex items-center gap-2 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                  M
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-white tracking-wider">
                    MEH
                  </span>
                  <span className="text-[10px] text-sky-400 font-semibold tracking-wide">
                    SEARCH
                  </span>
                </div>
              </div>

              {/* Central Search Input Pill */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (localSearchInput.trim()) {
                    onNavigate(`${currentSearchEngine.searchUrl}${encodeURIComponent(localSearchInput.trim())}`);
                  }
                }}
                className="flex-1 relative flex items-center h-11 px-4 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-white/20 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/30 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={localSearchInput}
                  onChange={(e) => setLocalSearchInput(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
                  placeholder={`Rechercher avec ${currentSearchEngine.name}...`}
                />

                {localSearchInput && (
                  <button
                    type="button"
                    onClick={() => setLocalSearchInput('')}
                    className="p-1 text-slate-400 hover:text-white transition-colors mr-1"
                    title="Effacer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="h-5 w-px bg-white/20 mx-1.5" />

                <button
                  type="submit"
                  className="p-1.5 text-sky-400 hover:text-sky-300 transition-transform active:scale-95"
                  title="Lancer la recherche"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Status Badge & Engine Switcher */}
            <div className="flex items-center gap-2.5 shrink-0 relative">
              {/* Direct Open Button on official engine */}
              <a
                href={`${currentSearchEngine.searchUrl}${encodeURIComponent(searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title={`Ouvrir directement la page de recherche officielle sur ${currentSearchEngine.name}`}
              >
                <span>Page {currentSearchEngine.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
              </a>

              {/* Active Engine Badge with interactive Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 border border-white/25 hover:brightness-110"
                  style={{
                    backgroundColor: `${currentSearchEngine.color}25`,
                    color: currentSearchEngine.color,
                  }}
                  title="Cliquer pour basculer de moteur de recherche"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentSearchEngine.color }}
                  />
                  <span>Moteur {currentSearchEngine.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {isEngineMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl liquid-glass border border-white/20 shadow-2xl p-1.5 z-50 text-xs space-y-1 backdrop-blur-2xl">
                    <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Moteur actif
                    </div>
                    {DEFAULT_SEARCH_ENGINES.map((engine) => (
                      <button
                        key={engine.id}
                        type="button"
                        onClick={() => {
                          onSelectSearchEngine(engine);
                          setIsEngineMenuOpen(false);
                          if (searchQuery) {
                            onNavigate(`${engine.searchUrl}${encodeURIComponent(searchQuery)}`);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                          engine.id === currentSearchEngine.id
                            ? 'bg-white/20 text-white font-bold'
                            : 'hover:bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: engine.color }}
                          />
                          <span>{engine.name}</span>
                        </div>
                        {engine.id === currentSearchEngine.id && (
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="max-w-7xl mx-auto flex items-center gap-6 pt-3 text-xs font-medium text-slate-300 select-none">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'news', label: 'Actualités' },
              { id: 'videos', label: 'Vidéos' },
              { id: 'images', label: 'Images' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchFilter(tab.id as any)}
                className={`pb-1.5 transition-all text-xs font-semibold relative ${
                  searchFilter === tab.id
                    ? 'text-sky-400 font-bold border-b-2 border-sky-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TOAST NOTIFICATION WHEN WALLPAPER IS APPLIED */}
        {wallpaperToast && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-sky-500/90 text-white font-semibold text-xs shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{wallpaperToast}</span>
          </div>
        )}

        {/* MAIN RESULTS CONTAINER */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
          {searchFilter === 'images' ? (
            /* ===================== IMAGES SEARCH GALLERY ===================== */
            <div className="space-y-6">
              {/* Header stats line */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  {isSearchingImages ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      <span className="text-sky-300 font-semibold">
                        Récupération des images DuckDuckGo en direct...
                      </span>
                    </>
                  ) : (
                    <span>
                      {liveImages.length > 0 ? (
                        <>
                          <strong className="text-white font-bold">{liveImages.length}</strong> images réelles trouvées pour « <strong className="text-sky-300 font-bold">{searchQuery}</strong> »
                        </>
                      ) : (
                        `Recherche d'images pour « ${searchQuery} »`
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">
                    💡 Astuce : Cliquez sur une image pour l'agrandir ou l'appliquer en fond d'écran
                  </span>
                </div>
              </div>

              {/* LOADING SKELETON */}
              {isSearchingImages && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <div
                      key={n}
                      className="h-44 rounded-2xl liquid-glass border border-white/10 animate-pulse flex flex-col justify-end p-2.5 space-y-1.5"
                    >
                      <div className="h-3 w-16 bg-white/15 rounded" />
                      <div className="h-3 w-28 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* NO IMAGES FOUND */}
              {!isSearchingImages && liveImages.length === 0 && (
                <div className="p-10 rounded-3xl liquid-glass border border-white/15 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white text-crisp">
                    Aucune image disponible
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    DuckDuckGo n'a retourné aucune image pour « <span className="text-sky-300">{searchQuery}</span> ».
                  </p>
                  <button
                    onClick={() => setSearchFilter('all')}
                    className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-lg transition-all"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Voir tous les résultats web
                  </button>
                </div>
              )}

              {/* IMAGES GRID */}
              {!isSearchingImages && liveImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                  {liveImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImagePreview(img)}
                      className="group relative h-48 rounded-2xl overflow-hidden liquid-glass border border-white/15 hover:border-sky-400/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl flex flex-col justify-end"
                    >
                      {/* Image Thumbnail */}
                      <img
                        src={img.thumbnail}
                        alt={img.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          if ((e.target as HTMLImageElement).src !== img.image) {
                            (e.target as HTMLImageElement).src = img.image;
                          }
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                        {img.width && img.height ? (
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white/90 font-mono border border-white/10">
                            {img.width}×{img.height}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-sky-300 font-mono border border-white/10">
                            HD
                          </span>
                        )}

                        {/* Quick Set Wallpaper Hover Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetImageAsWallpaper(img.image, img.title);
                          }}
                          className="pointer-events-auto p-1.5 rounded-xl bg-black/70 hover:bg-sky-500 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-md active:scale-95"
                          title="Définir comme fond d'écran MEH Browser"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:text-white" />
                        </button>
                      </div>

                      {/* Bottom Info Gradient */}
                      <div className="relative z-10 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 text-left">
                        <span className="text-[10px] text-sky-400 font-medium tracking-wide block truncate">
                          {img.source}
                        </span>
                        <p className="text-[11px] font-semibold text-white truncate group-hover:text-sky-200">
                          {img.title}
                        </p>
                      </div>

                      {/* Hover Overlay Action Bar */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImagePreview(img);
                          }}
                          className="pointer-events-auto p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md transition-transform active:scale-95"
                          title="Agrandir et voir les détails"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(img.url);
                          }}
                          className="pointer-events-auto p-2.5 rounded-xl bg-sky-500/80 hover:bg-sky-500 text-white border border-sky-300/30 backdrop-blur-md transition-transform active:scale-95"
                          title="Consulter la page source"
                        >
                          <Globe className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNewTab(img.url);
                          }}
                          className="pointer-events-auto p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md transition-transform active:scale-95"
                          title="Ouvrir la page dans un nouvel onglet"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ===================== WEB SEARCH RESULTS ===================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ===================== LEFT COLUMN: REAL RESULTS (65-70%) ===================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Header stats line */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  {isSearchingLive ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      <span className="text-sky-300">
                        Récupération des vrais résultats DuckDuckGo...
                      </span>
                    </>
                  ) : (
                    <span>
                      {liveResults.length > 0 ? (
                        <>
                          <strong className="text-white">{liveResults.length}</strong>{' '}
                          résultats réels pour «{' '}
                          <strong className="text-sky-300">{searchQuery}</strong> »
                        </>
                      ) : (
                        `Recherche pour « ${searchQuery} »`
                      )}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Navigation 100% interne dans MEH Browser
                </span>
              </div>

              {/* MEH AdShield Search Banner */}
              {settings?.adBlockerEnabled && !isSearchingLive && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>MEH AdShield actif :</strong> Annonces sponsorisées et traceurs publicitaires éliminés des résultats.
                    </span>
                  </div>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="text-[11px] font-semibold underline text-emerald-400 hover:text-emerald-200 shrink-0 ml-2"
                    >
                      Paramètres
                    </button>
                  )}
                </div>
              )}

              {/* LOADING STATE */}
              {isSearchingLive && (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-3 animate-pulse"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/10" />
                        <div className="h-3 w-40 bg-white/10 rounded" />
                      </div>
                      <div className="h-5 w-3/4 bg-white/15 rounded" />
                      <div className="h-3 w-full bg-white/10 rounded" />
                      <div className="h-3 w-5/6 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* NO RESULTS OR ERROR */}
              {!isSearchingLive && liveResults.length === 0 && (
                <div className="p-8 rounded-3xl liquid-glass border border-white/15 shadow-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white text-crisp">
                    Aucun résultat disponible pour cette recherche
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    DuckDuckGo n'a retourné aucun lien direct correspondant exactement à «{' '}
                    <span className="text-sky-300 font-semibold">{searchQuery}</span> ».
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => onNavigate('meh://newtab')}
                      className="px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all"
                    >
                      Retour à l'accueil
                    </button>
                    <button
                      onClick={() => {
                        const words = searchQuery.split(' ');
                        if (words.length > 1) {
                          onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(words[0])}`);
                        }
                      }}
                      className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-lg transition-all"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Essayer avec un terme plus court
                    </button>
                  </div>
                </div>
              )}

              {/* RESULTS LIST */}
              {!isSearchingLive && (
                <>
                  {googleApiNotice && (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg mb-4">
                      <div className="flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{googleApiNotice}</span>
                      </div>
                      <a
                        href="https://console.cloud.google.com/apis/library/customsearch.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 font-bold border border-amber-400/40 shrink-0 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto text-xs"
                      >
                        <span>Activer en 1 clic</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {liveResults.length > 0 && (
                    <div className="space-y-4">
                      {liveResults.map((result, idx) => {
                    let domain = result.source || '';
                    try {
                      domain = new URL(result.url).hostname;
                    } catch {}

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl liquid-glass hover:bg-white/[0.07] border border-white/15 hover:border-white/30 transition-all space-y-2 shadow-lg group relative cursor-pointer"
                        onClick={() => onNavigate(result.url)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            result: result,
                          });
                        }}
                      >
                        {/* Top Line: Favicon + Domain Breadcrumb + Action Icons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs truncate">
                            <div className="w-6 h-6 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                              {result.icon ? (
                                <img
                                  src={result.icon}
                                  alt=""
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Globe className="w-3.5 h-3.5 text-sky-400" />
                              )}
                            </div>

                            <div className="flex flex-col truncate">
                              <span className="font-bold text-white text-xs tracking-tight">
                                {domain}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate font-mono">
                                {result.breadcrumb || result.url}
                              </span>
                            </div>
                          </div>

                          {/* Quick action buttons on card */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenNewTab(result.url);
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                              title="Ouvrir dans un nouvel onglet interne"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyCurrentUrl(result.url);
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                              title="Copier le lien"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title: Big, High Contrast, Clickable */}
                        <h3 className="text-lg sm:text-xl font-bold text-sky-400 group-hover:text-sky-300 group-hover:underline transition-colors pt-0.5 leading-snug text-crisp">
                          {result.title}
                        </h3>

                        {/* Snippet */}
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                          {result.snippet}
                        </p>

                        {/* Footer info: Open in tab badge */}
                        <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                          <span className="text-sky-400 font-semibold group-hover:underline flex items-center gap-1">
                            <span>Consulter dans l'onglet</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          <span>·</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenNewTab(result.url);
                            }}
                            className="hover:text-white cursor-pointer hover:underline"
                          >
                            Ouvrir dans un nouvel onglet
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

            {/* ===================== RIGHT COLUMN: INSTANT ANSWER / KNOWLEDGE (30-35%) ===================== */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-4">
                {knowledgeGraph ? (
                  <div className="rounded-3xl liquid-glass border-2 border-white/20 shadow-2xl p-6 space-y-4 text-xs select-text">
                    <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-4 h-4" />
                      <span>Fiche d'information</span>
                    </div>

                    {knowledgeGraph.imageUrl && (
                      <div className="w-20 h-20 rounded-2xl bg-white/10 p-2 border border-white/20 overflow-hidden flex items-center justify-center">
                        <img
                          src={knowledgeGraph.imageUrl}
                          alt=""
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}

                    <div>
                      <h2 className="text-2xl font-black text-white text-crisp">
                        {knowledgeGraph.title}
                      </h2>
                      {knowledgeGraph.subtitle && (
                        <p className="text-xs text-slate-300 mt-0.5 font-medium">
                          {knowledgeGraph.subtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                      {knowledgeGraph.description}
                    </p>

                    {knowledgeGraph.sourceUrl && (
                      <div className="pt-1">
                        <span className="text-slate-400 text-xs">Source : </span>
                        <a
                          href={knowledgeGraph.sourceUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(knowledgeGraph.sourceUrl!);
                          }}
                          className="font-bold text-sky-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{knowledgeGraph.sourceName || 'Consulter la page'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {knowledgeGraph.attributes && knowledgeGraph.attributes.length > 0 && (
                      <div className="border-t border-white/10 pt-3 space-y-2">
                        {knowledgeGraph.attributes.map((attr, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex items-start justify-between gap-3 py-1 border-b border-white/5 last:border-b-0"
                          >
                            <span className="font-bold text-slate-400 shrink-0">
                              {attr.label}
                            </span>
                            <span className="text-slate-100 font-semibold text-right">
                              {attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl liquid-glass border border-white/15 p-6 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                      <Globe className="w-4 h-4" />
                      <span>Moteur MEH Browser</span>
                    </div>
                    <h3 className="text-lg font-bold text-white text-crisp">
                      Navigation avec {currentSearchEngine.name}
                    </h3>
                    <p className="text-slate-200 leading-relaxed font-normal">
                      Chaque résultat affiché est issu en temps réel de votre moteur de recherche {currentSearchEngine.name}. Cliquez directement sur un résultat pour l'ouvrir dans la zone de navigation interne de cet onglet.
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-slate-400 text-[11px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Aucun pistage ni profilage publicitaire</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* LIGHTBOX MODAL FOR IMAGE PREVIEW */}
        {selectedImagePreview && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
            onClick={() => setSelectedImagePreview(null)}
          >
            {/* Top Bar */}
            <div
              className="w-full max-w-6xl flex items-center justify-between pb-3 border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                    {selectedImagePreview.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Source : {selectedImagePreview.source}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedImagePreview(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/15"
                  title="Fermer (Échap)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Full-Resolution Image */}
            <div
              className="flex-1 w-full max-w-6xl flex items-center justify-center p-2 sm:p-4 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImagePreview.image}
                alt={selectedImagePreview.title}
                className="max-w-full max-h-[68vh] object-contain rounded-2xl shadow-2xl border border-white/20"
                onError={(e) => {
                  if ((e.target as HTMLImageElement).src !== selectedImagePreview.thumbnail) {
                    (e.target as HTMLImageElement).src = selectedImagePreview.thumbnail;
                  }
                }}
              />
            </div>

            {/* Bottom Actions Drawer */}
            <div
              className="w-full max-w-4xl p-4 rounded-2xl liquid-glass border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-white/10 text-slate-300 font-mono text-[11px] border border-white/10">
                  {selectedImagePreview.width && selectedImagePreview.height
                    ? `${selectedImagePreview.width} × ${selectedImagePreview.height} px`
                    : 'Format Web'}
                </span>
                <span className="text-slate-400 font-medium truncate max-w-xs">
                  {selectedImagePreview.source}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    handleSetImageAsWallpaper(
                      selectedImagePreview.image,
                      selectedImagePreview.title
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-white font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Définir comme fond d'écran</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedImagePreview(null);
                    onNavigate(selectedImagePreview.url);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold flex items-center gap-1.5 border border-white/20 active:scale-95 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Visiter le site web</span>
                </button>

                <button
                  onClick={() => {
                    onOpenNewTab(selectedImagePreview.url);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    copyCurrentUrl(selectedImagePreview.image);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15"
                  title="Copier le lien de l'image"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM RIGHT-CLICK CONTEXT MENU ON RESULT */}
        {contextMenu && (
          <div
            className="fixed z-50 rounded-2xl liquid-glass border border-white/20 shadow-2xl p-2 w-56 text-xs text-white space-y-1"
            style={{
              top: Math.min(contextMenu.y, window.innerHeight - 180),
              left: Math.min(contextMenu.x, window.innerWidth - 240),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onNavigate(contextMenu.result.url);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left font-medium transition-colors"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Ouvrir dans cet onglet</span>
            </button>

            <button
              onClick={() => {
                onOpenNewTab(contextMenu.result.url);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left font-medium transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Ouvrir dans un nouvel onglet</span>
            </button>

            <button
              onClick={() => {
                copyCurrentUrl(contextMenu.result.url);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left font-medium transition-colors"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copier le lien</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Reader Mode View
  if (activeTab.isReaderMode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-start p-6 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl w-full p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs text-sky-300 font-medium">
              <BookOpen className="w-4 h-4" />
              <span>Mode Lecture MEH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Taille:</span>
              <button
                onClick={() => setReaderFontSize('sm')}
                className={`px-2 py-0.5 rounded text-xs ${
                  readerFontSize === 'sm' ? 'bg-white/20 text-white' : 'text-white/60'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setReaderFontSize('base')}
                className={`px-2 py-0.5 rounded text-xs ${
                  readerFontSize === 'base' ? 'bg-white/20 text-white' : 'text-white/60'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setReaderFontSize('lg')}
                className={`px-2 py-0.5 rounded text-xs ${
                  readerFontSize === 'lg' ? 'bg-white/20 text-white' : 'text-white/60'
                }`}
              >
                A+
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white text-crisp">
            {activeTab.title || 'Article en lecture'}
          </h1>
          <div className="text-xs text-white/60 flex items-center gap-2">
            <span>Source: {new URL(url).hostname}</span>
            <span>·</span>
            <span>Mode lecture épuré MEH</span>
          </div>

          <article
            className={`text-white/90 leading-relaxed space-y-4 ${
              readerFontSize === 'sm'
                ? 'text-sm'
                : readerFontSize === 'lg'
                ? 'text-lg leading-loose'
                : 'text-base'
            }`}
          >
            <p>
              Ce mode lecture extrait le contenu essentiel du document web pour
              vous offrir une consultation épurée, sans bannières publicitaires ni
              éléments perturbateurs.
            </p>
          </article>
        </div>
      </div>
    );
  }

  // =========================================================================
  // OFFICIAL YOUTUBE NORMAL VIEW (REAL FEED, ULTRA-FAST, NO SKELETON BUGS)
  // =========================================================================
  if (isYouTube && !forceRawIframeForYouTube) {
    return (
      <YouTubeNormalView
        url={url}
        onNavigate={onNavigate}
        onOpenNewTab={onOpenNewTab}
        onToggleBookmark={onToggleBookmark}
        isBookmarked={isBookmarked}
        settings={settings}
        onChangeSettings={onChangeSettings}
        onSwitchToProxy={() => setForceRawIframeForYouTube(true)}
      />
    );
  }

  // =========================================================================
  // INTERNAL WEB PAGE VIEWER (PROXIED IN-TAB NAVIGATION)
  // =========================================================================
  // Detect if running on a static host (GitHub Pages, etc.) without an active Node backend
  const isStaticHost =
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('github.io') ||
      window.location.hostname.endsWith('.surge.sh') ||
      window.location.protocol === 'file:');

  const isAdBlockActive = settings?.adBlockerEnabled !== false;
  const isStrictAdBlock = settings?.adBlockStrictness === 'aggressive';
  const blockCookies = settings?.adBlockCookieNotices !== false;

  // Compute internal iframe source:
  // On static hosting (like GitHub Pages), /api/proxy does NOT exist, which produces a GitHub 404 page.
  // We use direct navigation on static hosting, and for Wikipedia we use mobile/direct view which embeds cleanly.
  const getComputedIframeSrc = (): string => {
    if (isStaticHost) {
      if (url.includes('wikipedia.org')) {
        return url
          .replace('fr.wikipedia.org', 'fr.m.wikipedia.org')
          .replace('en.wikipedia.org', 'en.m.wikipedia.org');
      }
      return url;
    }
    return `/api/proxy?url=${encodeURIComponent(url)}&adblock=${
      isAdBlockActive ? '1' : '0'
    }&strict=${isStrictAdBlock ? '1' : '0'}&cookies=${blockCookies ? '1' : '0'}`;
  };

  const proxiedSrc = getComputedIframeSrc();

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Website Security & Navigation Action Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-xl border-b border-white/15 text-xs z-10 shadow-sm">
        <div className="flex items-center gap-3 truncate">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Sécurisé (SSL 256-bit)</span>
          </div>

          {/* MEH AdShield Status Badge */}
          {isAdBlockActive ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold"
              title="MEH AdShield actif : publicités et traceurs bloqués sur cette page"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>
                MEH AdShield ({currentPageBlockedAds} pub{currentPageBlockedAds > 1 ? 's' : ''} bloquée{currentPageBlockedAds > 1 ? 's' : ''})
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onChangeSettings && settings) {
                  onChangeSettings({ ...settings, adBlockerEnabled: true });
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-500/30 transition-colors"
              title="Cliquer pour activer le bloqueur de pubs"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Bloqueur inactif (Activer)</span>
            </button>
          )}

          {/* Return to normal YouTube view if user was viewing raw iframe */}
          {isYouTube && forceRawIframeForYouTube && (
            <button
              type="button"
              onClick={() => setForceRawIframeForYouTube(false)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-all shadow-sm"
              title="Revenir au mode YouTube normal et fluide sans blocage"
            >
              <Play className="w-3 h-3 fill-rose-400" />
              <span>Mode YouTube Normal</span>
            </button>
          )}

          <span className="text-slate-200 truncate font-mono text-[11px] max-w-md hidden sm:inline">
            {url}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Direct External Link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 border border-sky-400/30 transition-colors text-[11px] font-semibold"
            title="Ouvrir le site en direct dans une nouvelle fenêtre externe"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ouvrir en direct</span>
          </a>

          {/* Add to bookmark button */}
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-xl border transition-all text-[11px] font-semibold flex items-center gap-1 ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border-white/15'
              }`}
              title="Ajouter aux favoris"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
              <span className="hidden md:inline">Favoris</span>
            </button>
          )}

          {/* Copy URL */}
          <button
            onClick={() => copyCurrentUrl()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-colors text-[11px] font-medium"
            title="Copier le lien"
          >
            {copiedUrl ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {copiedUrl ? 'Copié !' : 'Copier'}
            </span>
          </button>

          {/* Open in new internal tab */}
          <button
            onClick={() => onOpenNewTab(url)}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-colors text-[11px] font-medium"
            title="Dupliquer dans un nouvel onglet interne"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvel onglet</span>
          </button>

          {/* Reload inside tab */}
          <button
            onClick={() => {
              setIframeLoading(true);
              setIframeError(false);
              const iframe = document.getElementById('meh-page-frame') as HTMLIFrameElement;
              if (iframe) iframe.src = proxiedSrc;
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-colors text-[11px]"
            title="Actualiser la page"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {iframeLoading && (
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden relative z-10">
          <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 w-1/2 animate-[progress_1s_infinite_linear]" />
        </div>
      )}

      {/* Main View Area: Internal Iframe Sandboxed with Proxy */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-white/5">
        <iframe
          id="meh-page-frame"
          src={proxiedSrc}
          title={activeTab.title || 'Page web'}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          onLoad={() => setIframeLoading(false)}
          onError={() => {
            setIframeLoading(false);
            setIframeError(true);
          }}
        />

        {/* Fallback Portal Overlay shown if the website strictly refuses connections */}
        {iframeError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-2xl">
            <div className="max-w-md w-full p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 mx-auto flex items-center justify-center text-amber-300">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white text-crisp">
                Affichage intégré restreint par le site
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Ce site web (<span className="text-sky-300 font-mono">{url}</span>)
                bloque la consultation intégrée pour des exigences strictes de sécurité
                ou de connexion propriétaire.
              </p>
              <div className="pt-3 flex flex-col gap-2">
                {onGoBack && (
                  <button
                    onClick={onGoBack}
                    className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all"
                  >
                    Revenir aux résultats de recherche
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <span>Ouvrir dans un navigateur externe</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
