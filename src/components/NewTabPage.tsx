import React, { useState, useEffect } from 'react';
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
  const [showNotesWidget, setShowNotesWidget] = useState(true);
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);

  // Live Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onNavigate(searchQuery.trim());
  };

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
      <div className="w-full max-w-5xl flex items-center justify-between z-10 pt-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass text-xs text-white/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Navigation sécurisée</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeatherWidget(!showWeatherWidget)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              showWeatherWidget
                ? 'liquid-glass text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5 inline mr-1.5" />
            Météo
          </button>
          <button
            onClick={() => setShowNotesWidget(!showNotesWidget)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              showNotesWidget
                ? 'liquid-glass text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
            Notes
          </button>
          <button
            onClick={onOpenCustomize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/20 text-xs font-medium text-sky-300 transition-all border border-sky-400/30"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Personnaliser</span>
          </button>
        </div>
      </div>

      {/* Main Center Section: Logo, Clock & Big Search */}
      <div className="w-full max-w-3xl flex flex-col items-center my-auto z-10 py-6">
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

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md text-crisp flex items-center gap-2">
            <span style={{ color: theme.primaryColor }}>MEH</span>
            <span className="font-light text-white">Browser</span>
          </h1>

          {/* Live Clock & Date with Crisp Readability Shadow */}
          <div className="flex flex-col items-center mt-2.5 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-widest font-mono text-crisp">
              {formattedTime}
            </div>
            <div className="text-xs sm:text-sm text-slate-200 capitalize mt-1 font-semibold text-crisp-subtle bg-black/30 px-3 py-0.5 rounded-full border border-white/10">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Big Central Search Bar with High Contrast Liquid Glass */}
        <form
          onSubmit={handleSearchSubmit}
          className={`w-full relative flex items-center h-14 sm:h-16 px-4 rounded-3xl liquid-glass shadow-2xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-300 mb-8 border-2 border-white/30`}
          style={{
            backgroundColor: 'rgba(10, 15, 26, 0.78)',
          }}
        >
          {/* Engine Selector inside search bar */}
          <div className="relative shrink-0 mr-3">
            <button
              type="button"
              onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/15 hover:bg-white/25 text-xs text-white font-bold transition-all border border-white/20 shadow-sm"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: currentSearchEngine.color }}
              />
              <span className="hidden sm:inline text-white">{currentSearchEngine.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </button>

            {isEngineDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl liquid-glass shadow-2xl border border-white/30 py-2 z-50 text-xs bg-slate-950/95">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
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
                        ? 'text-sky-300 font-bold bg-white/15'
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

          <Search className="w-5 h-5 text-white/70 shrink-0 mr-2" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Rechercher avec ${currentSearchEngine.name} ou entrer un site...`}
            className="w-full bg-transparent text-sm sm:text-base text-white font-medium placeholder-slate-300/80 focus:outline-none tracking-wide text-crisp-subtle"
            autoFocus
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-lg hover:brightness-110 active:scale-95 shrink-0 border border-white/20"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Explorer
          </button>
        </form>

        {/* Speed Dial / Raccourcis Favoris with Enhanced Legibility */}
        <div className="w-full">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white text-crisp-subtle">
              Raccourcis favoris
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200 transition-colors font-bold bg-black/30 px-2.5 py-1 rounded-full border border-sky-400/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {speedDial.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl liquid-glass hover:bg-white/20 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl border-2 border-white/20"
                style={{
                  backgroundColor: 'rgba(10, 15, 26, 0.75)',
                }}
                onClick={() => onNavigate(item.url)}
              >
                {/* Delete Shortcut button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSpeedDial(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white/60 hover:text-rose-400 hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all z-20"
                  title="Supprimer le raccourci"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-md border-2"
                  style={{
                    backgroundColor: item.color
                      ? `${item.color}44`
                      : 'rgba(255, 255, 255, 0.15)',
                    borderColor: item.color || 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Compass
                    className="w-6 h-6 text-white drop-shadow-sm"
                    style={{ color: item.color || '#38bdf8' }}
                  />
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[110px] text-center text-crisp-subtle">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-300 font-medium truncate max-w-[110px]">
                  {item.url.replace(/^https?:\/\//, '')}
                </span>
              </div>
            ))}

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl liquid-glass hover:bg-white/20 border-2 border-dashed border-white/30 hover:border-white/60 transition-all duration-200 text-white group"
              style={{
                backgroundColor: 'rgba(10, 15, 26, 0.6)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 group-hover:bg-white/20 mb-2 transition-colors border border-white/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-white text-crisp-subtle">Nouveau</span>
              <span className="text-[10px] text-slate-300">Raccourci</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Glass Widgets (Bottom Strip) */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 z-10 pb-4">
        {/* Weather Widget */}
        {showWeatherWidget && (
          <div className="p-4 rounded-2xl liquid-glass flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <CloudSun className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">19°C</span>
                  <span className="text-xs text-white/70">Éclaircies douces</span>
                </div>
                <div className="text-xs text-white/50">Paris, France · Humidité 54%</div>
              </div>
            </div>
            <div className="text-right text-xs text-white/60 font-mono">
              <div>Vent: 12 km/h</div>
              <div>Qualité: Bonne</div>
            </div>
          </div>
        )}

        {/* Quick Notes Widget */}
        {showNotesWidget && (
          <div className="p-4 rounded-2xl liquid-glass flex flex-col justify-between border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Bloc-notes instantané</span>
              </div>
              <span className="text-[10px] text-white/40">Auto-sauvegardé</span>
            </div>
            <textarea
              value={quickNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Écrivez une note rapide, une idée ou un pense-bête..."
              rows={2}
              className="w-full bg-white/5 rounded-xl p-2 text-xs text-white/90 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-400/50 resize-none"
            />
          </div>
        )}
      </div>

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
