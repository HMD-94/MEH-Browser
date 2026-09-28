import React, { useState, useRef, useEffect } from 'react';
import {
  Tab,
  ThemeConfig,
  SearchEngine,
  Bookmark,
  DownloadItem,
  BrowserSettings,
} from '../types/browser';
import { DEFAULT_SEARCH_ENGINES } from '../constants/presets';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  X,
  Lock,
  Search,
  Star,
  BookOpen,
  Palette,
  Settings,
  History,
  Download,
  Maximize2,
  Minimize2,
  BookmarkCheck,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  RotateCcw,
  AppWindow,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface BrowserHeaderProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onReopenClosedTab: () => void;
  hasClosedTabs: boolean;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  theme: ThemeConfig;
  currentSearchEngine: SearchEngine;
  onSelectSearchEngine: (engine: SearchEngine) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: () => void;
  downloads: DownloadItem[];
  onToggleCustomize: () => void;
  onToggleSettings: () => void;
  onToggleHistory: () => void;
  onToggleBookmarks: () => void;
  onToggleDownloads: () => void;
  isReaderMode: boolean;
  onToggleReaderMode: () => void;
  settings?: BrowserSettings;
  onChangeSettings?: (settings: BrowserSettings) => void;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onReopenClosedTab,
  hasClosedTabs,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  theme,
  currentSearchEngine,
  onSelectSearchEngine,
  bookmarks,
  onToggleBookmark,
  downloads,
  onToggleCustomize,
  onToggleSettings,
  onToggleHistory,
  onToggleBookmarks,
  onToggleDownloads,
  isReaderMode,
  onToggleReaderMode,
  settings,
  onChangeSettings,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const { isInstalled, install } = usePWAInstall();
  const [urlInput, setUrlInput] = useState(activeTab?.url || 'meh://newtab');
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [isShieldMenuOpen, setIsShieldMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const engineMenuRef = useRef<HTMLDivElement>(null);
  const shieldMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync address input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url === 'meh://newtab' ? '' : activeTab.url);
    }
  }, [activeTab?.id, activeTab?.url]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        engineMenuRef.current &&
        !engineMenuRef.current.contains(e.target as Node)
      ) {
        setIsEngineMenuOpen(false);
      }
      if (
        shieldMenuRef.current &&
        !shieldMenuRef.current.contains(e.target as Node)
      ) {
        setIsShieldMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      onNavigate('meh://newtab');
      return;
    }
    onNavigate(urlInput.trim());
    inputRef.current?.blur();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isCurrentBookmarked = bookmarks.some((b) => b.url === activeTab?.url);
  const canGoBack = activeTab && activeTab.historyIndex > 0;
  const canGoForward =
    activeTab && activeTab.historyIndex < activeTab.history.length - 1;

  const activeDownloadsCount = downloads.filter(
    (d) => d.status === 'downloading'
  ).length;

  return (
    <header className="relative z-30 select-none flex flex-col w-full border-b border-white/10 transition-colors duration-200">
      {/* Top Window Strip & Tabs Bar */}
      <div className="flex items-center h-11 px-3 gap-2 bg-black/25 backdrop-blur-md border-b border-white/5">
        {/* Minimalist MEH Identity Window Controls */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition-colors shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition-colors shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition-colors shadow-sm" />
          </div>
          <span className="font-extrabold text-xs tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/90">
            MEH
          </span>
        </div>

        {/* Liquid Glass Tabs Scroll Container */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3 h-8 min-w-[120px] max-w-[220px] cursor-pointer text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'liquid-tab active text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5 rounded-xl border border-transparent'
                } ${theme.cornerRadius}`}
              >
                {/* Tab Favicon / Indicator */}
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                  {tab.isLoading ? (
                    <RotateCw className="w-3 h-3 animate-spin text-sky-400" />
                  ) : tab.url === 'meh://newtab' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm" />
                  ) : (
                    <span className="text-[10px]">🌐</span>
                  )}
                </div>

                {/* Tab Title */}
                <span className="truncate flex-1 text-left">
                  {tab.title || 'Nouvel onglet'}
                </span>

                {/* Close Button */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => onCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-white/20 transition-all text-white/60 hover:text-white"
                    title="Fermer l'onglet"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Ouvrir un nouvel onglet"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Reopen Closed Tab Button */}
          {hasClosedTabs && (
            <button
              onClick={onReopenClosedTab}
              className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Rouvrir l'onglet fermé récemment"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Controls & Omnibox Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-xl">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0 text-white/70">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-xl transition-colors ${
              canGoBack
                ? 'hover:bg-white/10 text-white cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title="Précédent"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-xl transition-colors ${
              canGoForward
                ? 'hover:bg-white/10 text-white cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title="Suivant"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Actualiser"
          >
            <RotateCw
              className={`w-4 h-4 ${activeTab?.isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={onGoHome}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Page d'accueil"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Central Liquid Glass Omnibox (Address & Search Bar) */}
        <form
          onSubmit={handleUrlSubmit}
          className={`flex-1 flex items-center gap-2 h-9 px-3 liquid-glass transition-all duration-200 ${
            theme.cornerRadius
          } focus-within:ring-2 focus-within:ring-sky-400/50 focus-within:border-sky-400/40`}
        >
          {/* Security / Scheme & AdShield Badge */}
          <div className="relative flex items-center shrink-0" ref={shieldMenuRef}>
            <button
              type="button"
              onClick={() => setIsShieldMenuOpen(!isShieldMenuOpen)}
              className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg transition-colors text-xs font-medium ${
                settings?.adBlockerEnabled
                  ? 'hover:bg-emerald-500/15 text-emerald-400'
                  : 'hover:bg-amber-500/15 text-amber-400'
              }`}
              title={
                settings?.adBlockerEnabled
                  ? 'MEH AdShield actif : Pubs & traqueurs bloqués'
                  : 'MEH AdShield désactivé'
              }
            >
              {settings?.adBlockerEnabled ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : activeTab?.url.startsWith('https://') ? (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              ) : activeTab?.url.startsWith('meh://') ? (
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-white/40" />
              )}
            </button>

            {/* AdShield Quick Controller Popover */}
            {isShieldMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl liquid-glass border border-white/20 shadow-2xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      settings?.adBlockerEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {settings?.adBlockerEnabled ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">MEH AdShield Pro</h4>
                      <span className={`text-[10px] font-semibold ${
                        settings?.adBlockerEnabled ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {settings?.adBlockerEnabled ? 'Protection active' : 'Protection désactivée'}
                      </span>
                    </div>
                  </div>

                  {/* Switch */}
                  {onChangeSettings && settings && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.adBlockerEnabled}
                        onChange={(e) => {
                          onChangeSettings({
                            ...settings,
                            adBlockerEnabled: e.target.checked,
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  )}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2 py-2.5">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/10 text-center">
                    <span className="text-[10px] text-white/50 block">Pubs bloquées</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {settings?.adBlockStats?.adsBlocked || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/10 text-center">
                    <span className="text-[10px] text-white/50 block">Traceurs filtrés</span>
                    <span className="text-sm font-bold text-sky-400 font-mono">
                      {settings?.adBlockStats?.trackersBlocked || 0}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-white/50 text-[10px]">Filtrage temps réel</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsShieldMenuOpen(false);
                      onToggleSettings();
                    }}
                    className="text-sky-400 hover:text-sky-300 font-medium text-[11px] underline"
                  >
                    Ouvrir les paramètres
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Engine Selector Dropdown */}
          <div className="relative shrink-0" ref={engineMenuRef}>
            <button
              type="button"
              onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-white/10 text-xs text-white/80 transition-colors"
              title={`Moteur de recherche: ${currentSearchEngine.name}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSearchEngine.color }}
              />
              <span className="hidden sm:inline text-[11px] font-medium">
                {currentSearchEngine.name}
              </span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {isEngineMenuOpen && (
              <div className="absolute left-0 mt-2 w-44 rounded-xl liquid-glass border border-white/15 shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                  Moteurs de recherche
                </div>
                {DEFAULT_SEARCH_ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      onSelectSearchEngine(engine);
                      setIsEngineMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 text-left transition-colors ${
                      engine.id === currentSearchEngine.id
                        ? 'text-sky-300 font-semibold bg-white/5'
                        : 'text-white/80'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: engine.color }}
                    />
                    <span>{engine.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Address & Search Input */}
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Rechercher avec Google, DuckDuckGo ou saisir une adresse web..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none tracking-wide"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reader Mode Toggle */}
          <button
            type="button"
            onClick={onToggleReaderMode}
            className={`p-1 rounded-md transition-colors ${
              isReaderMode
                ? 'text-sky-400 bg-white/15'
                : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
            title="Mode lecture épuré"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark Star Button */}
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`p-1 rounded-md transition-colors ${
              isCurrentBookmarked
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
            title={
              isCurrentBookmarked
                ? 'Retirer des favoris'
                : 'Ajouter cette page aux favoris'
            }
          >
            {isCurrentBookmarked ? (
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            ) : (
              <Star className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        {/* Action Controls & Menus */}
        <div className="flex items-center gap-1 shrink-0 text-white/80">
          {/* Downloads */}
          <button
            onClick={onToggleDownloads}
            className="relative p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title="Téléchargements"
          >
            <Download className="w-4 h-4" />
            {activeDownloadsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>

          {/* Bookmarks Manager */}
          <button
            onClick={onToggleBookmarks}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title="Favoris"
          >
            <BookmarkCheck className="w-4 h-4" />
          </button>

          {/* History */}
          <button
            onClick={onToggleHistory}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title="Historique de navigation"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Quick Customize Paintbrush */}
          <button
            onClick={onToggleCustomize}
            className="p-1.5 rounded-xl hover:bg-white/15 text-sky-300 bg-sky-500/10 border border-sky-400/20 transition-all shadow-sm"
            title="Personnaliser l'apparence & le fond"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Install as App button */}
          {!isInstalled && (
            <button
              onClick={install}
              className="p-1.5 rounded-xl hover:bg-white/15 text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold hover:border-cyan-400/60"
              title="Installer MEH Browser en tant qu'application autonome sur votre PC ou mobile"
            >
              <AppWindow className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline text-[11px] text-cyan-200">Installer</span>
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Full Settings */}
          <button
            onClick={onToggleSettings}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title="Paramètres de MEH Browser"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
