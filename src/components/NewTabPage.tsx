import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SpeedDialItem,
  SearchEngine,
  ThemeConfig,
} from '../types/browser';
import { DEFAULT_SEARCH_ENGINES } from '../constants/presets';
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  CloudSun,
  FileText,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Palette,
  Check,
  X,
  Compass,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface NewTabPageProps {
  speedDial: SpeedDialItem[];
  onAddSpeedDial: (item: Omit<SpeedDialItem, 'id'>) => void;
  onRemoveSpeedDial: (id: string) => void;
  onNavigate: (url: string) => void;
  currentSearchEngine: SearchEngine;
  onSelectSearchEngine: (engine: SearchEngine) => void;
  theme: ThemeConfig;
  onOpenCustomize: () => void;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({
  speedDial,
  onAddSpeedDial,
  onRemoveSpeedDial,
  onNavigate,
  currentSearchEngine,
  onSelectSearchEngine,
  theme,
  onOpenCustomize,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('meh_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['minecraft', 'youtube', 'discord', 'github'];
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [quickNote, setQuickNote] = useState(() => {
    return (
      localStorage.getItem('meh_quick_note') ||
      '✨ Bienvenue sur MEH Browser.\nProfitez d’une navigation fluide, respectueuse de vos données et 100% personnalisable.'
    );
  });
  const [dockPosition, setDockPosition] = useState<'right' | 'left'>(() => {
    return (localStorage.getItem('meh_widget_position') as 'right' | 'left') || 'right';
  });
  const [showWidgets, setShowWidgets] = useState<boolean>(() => {
    return localStorage.getItem('meh_widgets_visible') !== 'false';
  });
  const [selectedCity, setSelectedCity] = useState('Paris');
  const [cityTemp, setCityTemp] = useState('19°C');
  const [cityCondition, setCityCondition] = useState('Éclaircies douces');
  const [todoTasks, setTodoTasks] = useState<Array<{ id: string; text: string; done: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('meh_todo_tasks');
      return saved ? JSON.parse(saved) : [
        { id: '1', text: 'Profiter du design Liquid Glass 🌸', done: true },
        { id: '2', text: 'Découvrir les widgets personnalisables', done: false },
      ];
    } catch {
      return [];
    }
  });
  const [newTodoInput, setNewTodoInput] = useState('');
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  // Live Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro countdown timer
  useEffect(() => {
    let timer: any;
    if (pomoRunning && pomoSeconds > 0) {
      timer = setInterval(() => setPomoSeconds(s => s - 1), 1000);
    } else if (pomoSeconds === 0) {
      setPomoRunning(false);
    }
    return () => clearInterval(timer);
  }, [pomoRunning, pomoSeconds]);

  const handleDockPositionChange = (pos: 'right' | 'left') => {
    setDockPosition(pos);
    setShowWidgets(true);
    localStorage.setItem('meh_widget_position', pos);
    localStorage.setItem('meh_widgets_visible', 'true');
  };

  const handleToggleWidgets = () => {
    setShowWidgets(prev => {
      const next = !prev;
      localStorage.setItem('meh_widgets_visible', String(next));
      return next;
    });
  };

  const handleCitySelect = (city: string, temp: string, cond: string) => {
    setSelectedCity(city);
    setCityTemp(temp);
    setCityCondition(cond);
  };

  const handleToggleTodo = (id: string) => {
    const updated = todoTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTodoTasks(updated);
    localStorage.setItem('meh_todo_tasks', JSON.stringify(updated));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    const updated = [{ id: String(Date.now()), text: newTodoInput.trim(), done: false }, ...todoTasks];
    setTodoTasks(updated);
    setNewTodoInput('');
    localStorage.setItem('meh_todo_tasks', JSON.stringify(updated));
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todoTasks.filter(t => t.id !== id);
    setTodoTasks(updated);
    localStorage.setItem('meh_todo_tasks', JSON.stringify(updated));
  };

  const handleClearDoneTodos = () => {
    const updated = todoTasks.filter(t => !t.done);
    setTodoTasks(updated);
    localStorage.setItem('meh_todo_tasks', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const q = (directQuery !== undefined ? directQuery : searchQuery).trim();
    if (!q) return;

    const filtered = searchHistory.filter(h => h.toLowerCase() !== q.toLowerCase());
    const updated = [q, ...filtered].slice(0, 15);
    setSearchHistory(updated);
    try {
      localStorage.setItem('meh_search_history', JSON.stringify(updated));
    } catch {}

    setIsSuggestionsOpen(false);
    onNavigate(q);
  };

  const handleRemoveHistoryItem = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = searchHistory.filter(h => h.toLowerCase() !== itemToRemove.toLowerCase());
    setSearchHistory(updated);
    try {
      localStorage.setItem('meh_search_history', JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.setItem('meh_search_history', JSON.stringify([]));
    } catch {}
    setIsSuggestionsOpen(false);
  };

  const matchingHistory = useMemo(() => {
    if (!searchQuery.trim()) return searchHistory.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return searchHistory
      .filter(h => h.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q);
        const bStarts = b.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.length - b.length;
      })
      .slice(0, 6);
  }, [searchHistory, searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://') &&
      !formattedUrl.startsWith('meh://')
    ) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onAddSpeedDial({
      title: newTitle.trim(),
      url: formattedUrl,
      color: theme.primaryColor,
    });

    setNewTitle('');
    setNewUrl('');
    setIsAddModalOpen(false);
  };

  const handleNoteChange = (text: string) => {
    setQuickNote(text);
    localStorage.setItem('meh_quick_note', text);
  };

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-full w-full flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-y-auto no-scrollbar">
      {/* Top Bar Floating Greeting / Widgets Toggle */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10 pt-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass text-xs text-white/90">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="font-medium">MEH Liquid Glass Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dock Position & Visibility Segmented Control */}
          <div className="flex items-center p-1 rounded-full liquid-glass gap-1">
            <button
              type="button"
              onClick={() => handleDockPositionChange('left')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                dockPosition === 'left' && showWidgets ? 'bg-white/30 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
              title="Placer les widgets à gauche"
            >
              ◧ Gauche
            </button>
            <button
              type="button"
              onClick={() => handleDockPositionChange('right')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                dockPosition === 'right' && showWidgets ? 'bg-white/30 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
              title="Placer les widgets à droite"
            >
              Droite ◨
            </button>
            <button
              type="button"
              onClick={handleToggleWidgets}
              className={`p-1 rounded-full text-xs transition-colors ${showWidgets ? 'text-white bg-white/20' : 'text-white/60 hover:text-white'}`}
              title="Afficher/masquer les widgets"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenCustomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/20 text-xs font-medium text-pink-300 transition-all border border-pink-400/30"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Apparence</span>
          </button>
        </div>
      </div>

      {/* Main Center Section: Logo, Clock & Big Search (Smoothly shifts when dock is on left or right!) */}
      <div
        className={`w-full max-w-3xl flex flex-col items-center my-auto z-10 py-4 transition-transform duration-500 ease-out ${
          showWidgets
            ? (dockPosition === 'right' ? 'lg:-translate-x-36' : 'lg:translate-x-36')
            : 'translate-x-0'
        }`}
      >
        {/* MEH Browser Brand & Liquid Insignia */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3 group">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl liquid-glass flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105 shadow-2xl border-2"
              style={{
                borderColor: `${theme.primaryColor}`,
                boxShadow: `0 20px 40px -10px ${theme.primaryColor}66`,
              }}
            >
              {/* Minimalist Futuristic Liquid 'MEH' Monogram */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full fill-none drop-shadow-lg"
              >
                <defs>
                  <linearGradient id="mehGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.primaryColor} />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor={theme.secondaryColor} />
                  </linearGradient>
                </defs>
                <path
                  d="M20 75 V28 L40 54 L50 42 L60 54 L80 28 V75"
                  stroke="url(#mehGrad)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="50" cy="20" r="5.5" fill={theme.primaryColor} />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg text-crisp flex items-center gap-2">
            <span style={{ color: theme.primaryColor }}>MEH</span>
            <span className="font-light text-white">Browser</span>
          </h1>

          {/* Live Clock & Date with Crisp Readability Shadow */}
          <div className="flex flex-col items-center mt-3 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest font-mono drop-shadow-md">
              {formattedTime}
            </div>
            <div className="text-xs sm:text-sm text-white/90 capitalize mt-1.5 font-medium px-4 py-1 rounded-full liquid-glass border border-white/30 shadow-md">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Big Central Search Bar with Pure Crystal Liquid Glass */}
        <form
          ref={searchContainerRef}
          onSubmit={handleSearchSubmit}
          className="w-full relative flex items-center h-14 sm:h-16 px-4 rounded-3xl liquid-glass shadow-2xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-pink-300 focus-within:border-white mb-8 border border-white/40"
        >
          {/* Engine Selector inside search bar */}
          <div className="relative shrink-0 mr-3">
            <button
              type="button"
              onClick={() => {
                setIsEngineDropdownOpen(!isEngineDropdownOpen);
                setIsSuggestionsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/20 hover:bg-white/30 text-xs text-white font-bold transition-all border border-white/30 shadow-sm"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/50"
                style={{ backgroundColor: currentSearchEngine.color }}
              />
              <span className="hidden sm:inline text-white">{currentSearchEngine.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </button>

            {isEngineDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl liquid-glass shadow-2xl border border-white/30 py-2 z-50 text-xs backdrop-blur-2xl">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-white/70 tracking-wider">
                  Moteur de recherche
                </div>
                {DEFAULT_SEARCH_ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      onSelectSearchEngine(engine);
                      setIsEngineDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/20 transition-colors ${
                      engine.id === currentSearchEngine.id
                        ? 'text-pink-300 font-bold bg-white/20'
                        : 'text-white font-medium'
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

          <Search className="w-5 h-5 text-white/80 shrink-0 mr-2" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSuggestionsOpen(true);
            }}
            onFocus={() => setIsSuggestionsOpen(true)}
            placeholder={`Rechercher avec ${currentSearchEngine.name} ou entrer un site...`}
            className="w-full bg-transparent text-sm sm:text-base text-white font-medium placeholder-white/60 focus:outline-none tracking-wide text-crisp"
            autoFocus
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSuggestionsOpen(true);
              }}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-950 transition-all shadow-xl hover:brightness-110 active:scale-95 shrink-0 border border-white/40"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Explorer
          </button>

          {/* Search History & Matching Suggestions Dropdown */}
          {isSuggestionsOpen && matchingHistory.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] inset-x-0 rounded-2xl liquid-glass border border-white/30 shadow-2xl p-2 z-50 text-xs backdrop-blur-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase font-bold text-white/50 border-b border-white/10 mb-1">
                <span>🕒 Recherches récentes</span>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-pink-300 hover:text-pink-200 transition-colors font-semibold"
                >
                  Effacer tout
                </button>
              </div>

              <div className="space-y-0.5">
                {matchingHistory.map((item) => {
                  const qLower = searchQuery.toLowerCase().trim();
                  const idx = item.toLowerCase().indexOf(qLower);
                  return (
                    <div
                      key={item}
                      onClick={() => handleSearchSubmit(undefined, item)}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/20 text-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                        <span className="truncate text-xs font-medium">
                          {qLower && idx >= 0 ? (
                            <>
                              {item.slice(0, idx)}
                              <span className="text-pink-300 font-bold">
                                {item.slice(idx, idx + qLower.length)}
                              </span>
                              {item.slice(idx + qLower.length)}
                            </>
                          ) : (
                            item
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-400/30">
                          Historique
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(item, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-300 rounded text-white/50 transition-opacity"
                          title="Supprimer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>

        {/* Speed Dial / Raccourcis Favoris with Enhanced Legibility */}
        <div className="w-full">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white text-crisp">
              Raccourcis favoris
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 text-xs text-white hover:text-pink-200 transition-colors font-bold liquid-glass px-3 py-1 rounded-full border border-white/30 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {speedDial.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl liquid-glass hover:bg-white/25 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl border border-white/30"
                onClick={() => onNavigate(item.url)}
              >
                {/* Delete Shortcut button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSpeedDial(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white/70 hover:text-rose-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all z-20"
                  title="Supprimer le raccourci"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-md border border-white/40"
                  style={{
                    backgroundColor: item.color
                      ? `${item.color}35`
                      : 'rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <Compass
                    className="w-6 h-6 text-white drop-shadow-sm"
                    style={{ color: item.color || '#38bdf8' }}
                  />
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[110px] text-center text-crisp">
                  {item.title}
                </span>
                <span className="text-[10px] text-white/80 font-medium truncate max-w-[110px]">
                  {item.url.replace(/^https?:\/\//, '')}
                </span>
              </div>
            ))}

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl liquid-glass hover:bg-white/25 border border-dashed border-white/40 hover:border-white transition-all duration-200 text-white group"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15 group-hover:bg-white/25 mb-2 transition-colors border border-white/30">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-white text-crisp">Nouveau</span>
              <span className="text-[10px] text-white/80">Raccourci</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Liquid Glass Widgets Dock (Dockable Left or Right) */}
      <aside
        className={`fixed top-20 bottom-8 w-80 z-20 transition-all duration-500 ease-out flex flex-col liquid-glass-card rounded-3xl p-4 overflow-hidden border border-white/40 shadow-2xl ${
          dockPosition === 'right' ? 'right-6' : 'left-6'
        } ${
          showWidgets
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Dock Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-white">Liquid Glass Widgets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDockPositionChange(dockPosition === 'right' ? 'left' : 'right')}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white/90 border border-white/20 transition-all"
              title="Basculer gauche/droite"
            >
              ⇄ {dockPosition === 'right' ? 'Droite' : 'Gauche'}
            </button>
            <button
              type="button"
              onClick={handleToggleWidgets}
              className="text-xs w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              title="Masquer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {/* Widget 1: Live Weather */}
          <div className="p-3.5 rounded-2xl liquid-glass border border-white/25">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-pink-300" />
                <span>Météo Live</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-medium">
                {selectedCity}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{cityTemp}</span>
                <span className="text-xs text-white/80">{cityCondition}</span>
              </div>
              <span className="text-xs text-white/60 font-mono">Vent 12 km/h</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {[
                { name: 'Paris', temp: '19°C', cond: 'Éclaircies' },
                { name: 'Marseille', temp: '22°C', cond: 'Ensoleillé' },
                { name: 'Lyon', temp: '20°C', cond: 'Doux' },
                { name: 'Tokyo', temp: '21°C', cond: 'Sakura' },
                { name: 'Montréal', temp: '16°C', cond: 'Nuageux' },
              ].map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCitySelect(c.name, c.temp, c.cond)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-all ${
                    selectedCity === c.name
                      ? 'bg-white/30 text-white border border-white/40'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Widget 2: Interactive To-Do List */}
          <div className="p-3.5 rounded-2xl liquid-glass border border-white/25">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">✅ Tâches du Jour</span>
              <span className="text-[10px] text-white/70 font-mono">
                {todoTasks.filter(t => !t.done).length} restante(s)
              </span>
            </div>
            <form onSubmit={handleAddTodo} className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={newTodoInput}
                onChange={e => setNewTodoInput(e.target.value)}
                placeholder="Ajouter une tâche... (Entrée)"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-900 bg-pink-300 hover:brightness-110 active:scale-95 transition-all"
              >
                +
              </button>
            </form>
            <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {todoTasks.map(t => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white"
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => handleToggleTodo(t.id)}
                    className="accent-pink-400 cursor-pointer"
                  />
                  <span className={`flex-1 truncate ${t.done ? 'line-through opacity-50' : ''}`}>
                    {t.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(t.id)}
                    className="text-white/40 hover:text-red-400 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {todoTasks.some(t => t.done) && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={handleClearDoneTodos}
                  className="text-[10px] text-white/50 hover:text-white underline"
                >
                  Effacer terminées
                </button>
              </div>
            )}
          </div>

          {/* Widget 3: Quick Scratchpad Note */}
          <div className="p-3.5 rounded-2xl liquid-glass border border-white/25">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <FileText className="w-3.5 h-3.5 text-pink-300" />
                <span>Bloc-Notes</span>
              </div>
              <span className="text-[10px] text-white/40">Auto-sauvegardé</span>
            </div>
            <textarea
              value={quickNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Écrivez une note rapide, une idée ou un pense-bête..."
              rows={2}
              className="w-full bg-white/10 rounded-xl p-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-pink-400/50 resize-none border border-white/15"
            />
          </div>

          {/* Widget 4: Pomodoro Focus */}
          <div className="p-3.5 rounded-2xl liquid-glass border border-white/25">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-300" />
                <span>Minuteur Focus</span>
              </span>
              <span className="text-[10px] text-pink-300 font-semibold">
                {pomoRunning ? 'En cours...' : 'Prêt'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-xl font-black font-mono text-white tracking-wider">
                {String(Math.floor(pomoSeconds / 60)).padStart(2, '0')}:
                {String(pomoSeconds % 60).padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPomoRunning(!pomoRunning)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-pink-400 text-slate-900 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                >
                  {pomoRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{pomoRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPomoRunning(false);
                    setPomoSeconds(25 * 60);
                  }}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Add Shortcut Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl liquid-glass p-6 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Ajouter un raccourci
            </h3>
            <p className="text-xs text-white/60 mb-5">
              Accédez en un clic à vos sites favoris depuis la page d'accueil de MEH Browser.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Le Monde, Wikipédia, Twitch..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder-white/40 focus:outline-none focus:border-sky-400"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Adresse URL
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="ex: lemonde.fr ou https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder-white/40 focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Ajouter le raccourci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
