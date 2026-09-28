/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tab,
  Bookmark,
  HistoryItem,
  DownloadItem,
  SpeedDialItem,
  WallpaperConfig,
  ThemeConfig,
  SearchEngine,
  BrowserSettings,
  ThemePresetId,
} from './types/browser';
import {
  DEFAULT_SEARCH_ENGINES,
  DEFAULT_SPEED_DIAL,
  DEFAULT_BOOKMARKS,
  DEFAULT_WALLPAPER,
  DEFAULT_THEME,
  DEFAULT_SETTINGS,
  THEME_PRESETS,
} from './constants/presets';
import { WallpaperBackground } from './components/WallpaperBackground';
import { BrowserHeader } from './components/BrowserHeader';
import { BookmarksBar } from './components/BookmarksBar';
import { BrowserContent } from './components/BrowserContent';
import { CustomizeDrawer } from './components/CustomizeDrawer';
import { SettingsModal } from './components/SettingsModal';
import { BookmarksManager } from './components/BookmarksManager';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DownloadsDrawer } from './components/DownloadsDrawer';
import { MobileNavBar } from './components/MobileNavBar';

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Could not save to localStorage: ${key}`, err);
  }
}

export default function App() {
  // 1. Wallpaper State with localStorage
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(() => {
    try {
      const saved = localStorage.getItem('meh_wallpaper');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customImageUrl && parsed.customImageUrl.startsWith('/src/')) {
          delete parsed.customImageUrl;
          parsed.presetId = 'liquid-glass-flow';
          parsed.type = 'preset';
        }
        return parsed;
      }
      return DEFAULT_WALLPAPER;
    } catch {
      return DEFAULT_WALLPAPER;
    }
  });

  // 2. Theme State with localStorage
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('meh_theme');
      return saved ? JSON.parse(saved) : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  // 3. Settings State with localStorage
  const [settings, setSettings] = useState<BrowserSettings>(() => {
    try {
      const saved = localStorage.getItem('meh_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.googleSearchEngineId) {
          parsed.googleSearchEngineId = '6731f777b64524256';
        }
        if (parsed.adBlockerEnabled === undefined) {
          parsed.adBlockerEnabled = true;
        }
        if (!parsed.adBlockStrictness) {
          parsed.adBlockStrictness = 'standard';
        }
        if (parsed.adBlockCookieNotices === undefined) {
          parsed.adBlockCookieNotices = true;
        }
        if (!parsed.adBlockStats) {
          parsed.adBlockStats = { adsBlocked: 0, trackersBlocked: 0, totalBlocked: 0 };
        }
        return parsed;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 4. Tabs State
  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const saved = localStorage.getItem('meh_tabs');
      if (saved && settings.restoreTabsOnStartup) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'tab-init-1',
        title: 'Nouvel onglet',
        url: 'meh://newtab',
        history: ['meh://newtab'],
        historyIndex: 0,
        isLoading: false,
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>(
    () => tabs[0]?.id || 'tab-init-1'
  );

  const [closedTabsStack, setClosedTabsStack] = useState<Tab[]>([]);

  // 5. Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('meh_bookmarks');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  // 6. History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('meh_history');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'hist-1',
              title: 'Bienvenue sur MEH Browser',
              url: 'meh://welcome',
              timestamp: Date.now() - 3600000,
            },
          ];
    } catch {
      return [];
    }
  });

  // 7. Downloads State
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem('meh_downloads');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'dl-1',
              filename: 'meh-browser-wallpaper.png',
              size: '4.2 Mo',
              progress: 100,
              status: 'completed',
              url: 'meh://assets/wallpaper.png',
              timestamp: Date.now() - 7200000,
            },
          ];
    } catch {
      return [];
    }
  });

  // 8. Speed Dial Shortcuts
  const [speedDial, setSpeedDial] = useState<SpeedDialItem[]>(() => {
    try {
      const saved = localStorage.getItem('meh_speed_dial');
      return saved ? JSON.parse(saved) : DEFAULT_SPEED_DIAL;
    } catch {
      return DEFAULT_SPEED_DIAL;
    }
  });

  // 9. Search Engine State (Defaults to DuckDuckGo as requested)
  const [searchEngineId, setSearchEngineId] = useState<string>(
    settings.defaultSearchEngine || 'duckduckgo'
  );

  const currentSearchEngine = useMemo(() => {
    return (
      DEFAULT_SEARCH_ENGINES.find((e) => e.id === searchEngineId) ||
      DEFAULT_SEARCH_ENGINES[0]
    );
  }, [searchEngineId]);

  // 10. Drawers & Modals Visibility
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isMobileTabsOpen, setIsMobileTabsOpen] = useState(false);

  // 11. Mouse Position for Liquid Glass caustics (zero React re-renders)
  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // 12. Save changes to localStorage safely
  useEffect(() => {
    safeSetItem('meh_wallpaper', JSON.stringify(wallpaper));
  }, [wallpaper]);

  useEffect(() => {
    safeSetItem('meh_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    safeSetItem('meh_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.restoreTabsOnStartup) {
      safeSetItem('meh_tabs', JSON.stringify(tabs));
    }
  }, [tabs, settings.restoreTabsOnStartup]);

  useEffect(() => {
    safeSetItem('meh_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    safeSetItem('meh_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    safeSetItem('meh_downloads', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    safeSetItem('meh_speed_dial', JSON.stringify(speedDial));
  }, [speedDial]);

  // 13. Dynamic CSS Variables injection
  useEffect(() => {
    const root = document.documentElement;

    const bgAlpha = Math.max(0.45, theme.glassTransparency);
    const isDark = theme.mode === 'dark';

    // Rich dark glass with strong contrast or crisp white frost
    const glassBg = isDark
      ? `rgba(10, 15, 26, ${Math.min(0.92, bgAlpha + 0.12)})`
      : `rgba(255, 255, 255, ${Math.min(0.95, bgAlpha + 0.15)})`;

    const glassBorder = isDark
      ? `rgba(255, 255, 255, ${Math.max(0.18, 0.22 * theme.liquidGlassIntensity)})`
      : `rgba(0, 0, 0, ${Math.max(0.12, 0.16 * theme.liquidGlassIntensity)})`;

    root.style.setProperty('--glass-bg', glassBg);
    root.style.setProperty('--glass-border', glassBorder);
    root.style.setProperty('--glass-blur', `${Math.max(16, theme.glassBlur)}px`);
    root.style.setProperty('--accent-primary', theme.primaryColor);
    root.style.setProperty('--accent-secondary', theme.secondaryColor);
    root.style.setProperty('--btn-primary', theme.buttonColor);

    const radiusMap: Record<string, string> = {
      'rounded-lg': '0.75rem',
      'rounded-xl': '1rem',
      'rounded-2xl': '1.35rem',
      'rounded-3xl': '1.85rem',
      'rounded-full': '9999px',
    };
    root.style.setProperty(
      '--corner-radius',
      radiusMap[theme.cornerRadius] || '1.35rem'
    );
    root.style.setProperty(
      '--font-browser',
      `"${theme.font}", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
    );

    const spacingMap: Record<string, string> = {
      compact: '-0.02em',
      normal: '0em',
      relaxed: '0.025em',
    };
    root.style.setProperty(
      '--font-letter-spacing',
      spacingMap[theme.fontSpacing || 'normal'] || '0em'
    );

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Active Tab reference
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  // Tab Navigation Functions
  const handleNavigate = useCallback(
    (inputUrl: string) => {
      let targetUrl = inputUrl.trim();
      let tabTitle = targetUrl;

      // Handle internal scheme
      if (targetUrl === 'meh://newtab') {
        tabTitle = 'Nouvel onglet';
      } else if (targetUrl === 'meh://welcome') {
        tabTitle = 'Bienvenue sur MEH Browser';
      } else if (
        targetUrl.startsWith('http://') ||
        targetUrl.startsWith('https://')
      ) {
        try {
          tabTitle = new URL(targetUrl).hostname;
        } catch {
          tabTitle = targetUrl;
        }
      } else if (
        targetUrl.includes('.') &&
        !targetUrl.includes(' ') &&
        targetUrl.length > 3
      ) {
        // Likely a domain (e.g. github.com)
        targetUrl = 'https://' + targetUrl;
        tabTitle = targetUrl.replace('https://', '');
      } else {
        // Search query
        targetUrl =
          currentSearchEngine.searchUrl + encodeURIComponent(targetUrl);
        tabTitle = `${inputUrl} — Recherche ${currentSearchEngine.name}`;
      }

      // Update current active tab
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTabId) return tab;
          const newHistory = [
            ...tab.history.slice(0, tab.historyIndex + 1),
            targetUrl,
          ];
          return {
            ...tab,
            url: targetUrl,
            title: tabTitle,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isLoading: false,
          };
        })
      );

      // Record in History
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          title: tabTitle,
          url: targetUrl,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 199),
      ]);
    },
    [activeTabId, currentSearchEngine]
  );

  // Listen for navigation events from proxied internal web pages so clicking links keeps browsing in MEH Browser
  useEffect(() => {
    const handleInternalMsg = (e: MessageEvent) => {
      if (
        e.data &&
        e.data.type === 'MEH_INTERNAL_NAVIGATE' &&
        typeof e.data.url === 'string'
      ) {
        handleNavigate(e.data.url);
      }
    };
    window.addEventListener('message', handleInternalMsg);
    return () => window.removeEventListener('message', handleInternalMsg);
  }, [handleNavigate]);

  const handleNewTab = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: 'Nouvel onglet',
      url: 'meh://newtab',
      history: ['meh://newtab'],
      historyIndex: 0,
      isLoading: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  }, []);

  const handleOpenInNewTab = useCallback((urlToOpen: string) => {
    const newId = `tab-${Date.now()}`;
    let tabTitle = urlToOpen;
    try {
      if (urlToOpen.startsWith('http://') || urlToOpen.startsWith('https://')) {
        tabTitle = new URL(urlToOpen).hostname;
      }
    } catch {}
    const newTab: Tab = {
      id: newId,
      title: tabTitle,
      url: urlToOpen,
      history: [urlToOpen],
      historyIndex: 0,
      isLoading: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  }, []);

  const handleCloseTab = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (tabs.length <= 1) return;

      const tabToClose = tabs.find((t) => t.id === id);
      if (tabToClose) {
        setClosedTabsStack((prev) => [tabToClose, ...prev.slice(0, 19)]);
      }

      const newTabs = tabs.filter((t) => t.id !== id);
      setTabs(newTabs);

      if (activeTabId === id) {
        const closedIndex = tabs.findIndex((t) => t.id === id);
        const nextActive =
          newTabs[Math.max(0, closedIndex - 1)] || newTabs[0];
        setActiveTabId(nextActive.id);
      }
    },
    [tabs, activeTabId]
  );

  const handleReopenClosedTab = useCallback(() => {
    if (closedTabsStack.length === 0) return;
    const [tabToRestore, ...rest] = closedTabsStack;
    setClosedTabsStack(rest);
    setTabs((prev) => [...prev, tabToRestore]);
    setActiveTabId(tabToRestore.id);
  }, [closedTabsStack]);

  const handleGoBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const prevIndex = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[prevIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: prevUrl,
              historyIndex: prevIndex,
              title: prevUrl === 'meh://newtab' ? 'Nouvel onglet' : prevUrl,
            }
          : t
      )
    );
  }, [activeTab]);

  const handleGoForward = useCallback(() => {
    if (
      !activeTab ||
      activeTab.historyIndex >= activeTab.history.length - 1
    )
      return;
    const nextIndex = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[nextIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: nextUrl,
              historyIndex: nextIndex,
              title: nextUrl === 'meh://newtab' ? 'Nouvel onglet' : nextUrl,
            }
          : t
      )
    );
  }, [activeTab]);

  const handleReload = useCallback(() => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, isLoading: true } : t))
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id ? { ...t, isLoading: false } : t
        )
      );
    }, 400);
  }, [activeTab]);

  const handleGoHome = useCallback(() => {
    handleNavigate('meh://newtab');
  }, [handleNavigate]);

  const handleToggleBookmark = useCallback(() => {
    if (!activeTab || activeTab.url === 'meh://newtab') return;
    const exists = bookmarks.some((b) => b.url === activeTab.url);
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      setBookmarks((prev) => [
        {
          id: `bm-${Date.now()}`,
          title: activeTab.title || activeTab.url,
          url: activeTab.url,
          folder: 'Général',
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    }
  }, [activeTab, bookmarks]);

  const handleToggleReaderMode = useCallback(() => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? { ...t, isReaderMode: !t.isReaderMode }
          : t
      )
    );
  }, [activeTab]);

  // Theme Preset Switcher
  const handleApplyThemePreset = useCallback((presetId: ThemePresetId) => {
    const preset = THEME_PRESETS[presetId];
    if (preset) {
      setTheme((prev) => ({
        ...prev,
        ...preset,
      }));
    }
  }, []);

  // Export / Import JSON Configuration
  const exportConfigJson = useCallback(() => {
    const config = {
      app: 'MEH Browser',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      wallpaper,
      theme,
      settings,
      bookmarks,
      speedDial,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meh-browser-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [wallpaper, theme, settings, bookmarks, speedDial]);

  const importConfigJson = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.wallpaper) setWallpaper(data.wallpaper);
      if (data.theme) setTheme(data.theme);
      if (data.settings) setSettings(data.settings);
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.speedDial) setSpeedDial(data.speedDial);
    } catch {
      alert('Fichier de configuration invalide');
    }
  }, []);

  // Reset all to defaults
  const handleResetAll = useCallback(() => {
    setWallpaper(DEFAULT_WALLPAPER);
    setTheme(DEFAULT_THEME);
    setSettings(DEFAULT_SETTINGS);
    setBookmarks(DEFAULT_BOOKMARKS);
    setSpeedDial(DEFAULT_SPEED_DIAL);
    setHistory([]);
    setDownloads([]);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleNewTab();
      }
      // Ctrl+W: Close tab
      else if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      }
      // Ctrl+Shift+T: Reopen closed tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handleReopenClosedTab();
      }
      // Ctrl+H: History
      else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      }
      // Ctrl+B: Bookmarks
      else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsBookmarksOpen((prev) => !prev);
      }
      // Ctrl+D: Bookmark current
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleToggleBookmark();
      }
      // Ctrl+J: Downloads
      else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsDownloadsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNewTab,
    handleCloseTab,
    handleReopenClosedTab,
    activeTabId,
    handleToggleBookmark,
  ]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col select-none text-slate-100"
      style={{
        fontFamily: theme.font,
        fontSize:
          theme.textSize === 'sm'
            ? '13px'
            : theme.textSize === 'lg'
            ? '17px'
            : '15px',
      }}
    >
      {/* 1. Dynamic Wallpaper with Filters & Mouse Glow */}
      <WallpaperBackground
        wallpaper={wallpaper}
        theme={theme}
      />

      {/* 2. Top Window & Tab Bar & Omnibox */}
      <BrowserHeader
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onReopenClosedTab={handleReopenClosedTab}
        hasClosedTabs={closedTabsStack.length > 0}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        theme={theme}
        currentSearchEngine={currentSearchEngine}
        onSelectSearchEngine={(eng) => setSearchEngineId(eng.id)}
        bookmarks={bookmarks}
        onToggleBookmark={handleToggleBookmark}
        downloads={downloads}
        onToggleCustomize={() => setIsCustomizeOpen(true)}
        onToggleSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onToggleBookmarks={() => setIsBookmarksOpen(true)}
        onToggleDownloads={() => setIsDownloadsOpen(true)}
        isReaderMode={!!activeTab?.isReaderMode}
        onToggleReaderMode={handleToggleReaderMode}
        settings={settings}
        onChangeSettings={setSettings}
      />

      {/* 3. Optional Bookmarks Bar */}
      {theme.showBookmarksBar && (
        <BookmarksBar
          bookmarks={bookmarks}
          onNavigate={handleNavigate}
          onOpenBookmarksManager={() => setIsBookmarksOpen(true)}
          theme={theme}
        />
      )}

      {/* 4. Active Browser View Content */}
      <main className="relative flex-1 w-full h-full overflow-hidden z-10 flex flex-col">
        {activeTab && (
          <BrowserContent
            activeTab={activeTab}
            theme={theme}
            wallpaper={wallpaper}
            onChangeWallpaper={setWallpaper}
            currentSearchEngine={currentSearchEngine}
            onSelectSearchEngine={(eng) => setSearchEngineId(eng.id)}
            speedDial={speedDial}
            onAddSpeedDial={(item) =>
              setSpeedDial((prev) => [
                ...prev,
                { ...item, id: `sd-${Date.now()}` },
              ])
            }
            onRemoveSpeedDial={(id) =>
              setSpeedDial((prev) => prev.filter((s) => s.id !== id))
            }
            onNavigate={handleNavigate}
            onOpenNewTab={handleOpenInNewTab}
            onGoBack={handleGoBack}
            onOpenCustomize={() => setIsCustomizeOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={bookmarks.some((b) => b.url === activeTab.url)}
            settings={settings}
            onChangeSettings={setSettings}
          />
        )}
      </main>

      {/* 5. Mobile Navigation Dock */}
      <MobileNavBar
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoHome={handleGoHome}
        onNewTab={handleNewTab}
        tabCount={tabs.length}
        onOpenTabsList={() => setIsMobileTabsOpen(true)}
        onOpenCustomize={() => setIsCustomizeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        canGoBack={!!(activeTab && activeTab.historyIndex > 0)}
        canGoForward={
          !!(activeTab && activeTab.historyIndex < activeTab.history.length - 1)
        }
      />

      {/* 6. Customization Drawer */}
      <CustomizeDrawer
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        wallpaper={wallpaper}
        onChangeWallpaper={setWallpaper}
        theme={theme}
        onChangeTheme={setTheme}
        onApplyThemePreset={handleApplyThemePreset}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={setSettings}
        onOpenCustomize={(subtab) => {
          setIsCustomizeOpen(true);
        }}
        onClearHistory={() => setHistory([])}
        onClearBookmarks={() => setBookmarks([])}
        onResetAll={handleResetAll}
        theme={theme}
        exportConfigJson={exportConfigJson}
        importConfigJson={importConfigJson}
      />

      {/* 8. Bookmarks Manager Drawer */}
      <BookmarksManager
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onNavigate={handleNavigate}
        onDeleteBookmark={(id) =>
          setBookmarks((prev) => prev.filter((b) => b.id !== id))
        }
        onAddBookmark={(bm) =>
          setBookmarks((prev) => [
            { ...bm, id: `bm-${Date.now()}`, createdAt: Date.now() },
            ...prev,
          ])
        }
        theme={theme}
      />

      {/* 9. History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onNavigate={handleNavigate}
        onClearHistory={() => setHistory([])}
        onDeleteHistoryItem={(id) =>
          setHistory((prev) => prev.filter((h) => h.id !== id))
        }
        theme={theme}
      />

      {/* 10. Downloads Drawer */}
      <DownloadsDrawer
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        downloads={downloads}
        onClearDownloads={() => setDownloads([])}
        theme={theme}
      />

      {/* 11. Mobile Tabs Switcher Sheet Modal */}
      {isMobileTabsOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-xl p-4 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">
              Onglets ouverts ({tabs.length})
            </h3>
            <button
              onClick={() => setIsMobileTabsOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white"
            >
              Fermer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setIsMobileTabsOpen(false);
                }}
                className={`p-4 rounded-2xl liquid-glass border flex items-center justify-between ${
                  tab.id === activeTabId
                    ? 'border-sky-400 bg-white/15'
                    : 'border-white/10'
                }`}
              >
                <div className="truncate flex-1 mr-2">
                  <div className="font-semibold text-white text-xs truncate">
                    {tab.title}
                  </div>
                  <div className="text-[10px] text-white/50 truncate font-mono">
                    {tab.url}
                  </div>
                </div>

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id, e);
                    }}
                    className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-rose-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              handleNewTab();
              setIsMobileTabsOpen(false);
            }}
            className="w-full py-3 rounded-2xl text-xs font-bold text-white mt-4 shadow-lg active:scale-95"
            style={{ backgroundColor: theme.primaryColor }}
          >
            + Nouvel onglet
          </button>
        </div>
      )}
    </div>
  );
}
