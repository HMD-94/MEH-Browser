import React, { useState } from 'react';
import { HistoryItem, ThemeConfig } from '../types/browser';
import {
  X,
  History,
  Search,
  Trash2,
  Clock,
  Globe,
  RotateCcw,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  theme: ThemeConfig;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onNavigate,
  onClearHistory,
  onDeleteHistoryItem,
  theme,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = history.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] liquid-glass border-l border-white/20 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Historique de navigation
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Clear Bar */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-black/10">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans l'historique..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{filtered.length} pages visitées</span>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Effacer tout
            </button>
          )}
        </div>
      </div>

      {/* History Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar text-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            Aucun historique enregistré
          </div>
        ) : (
          filtered.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString(
              'fr-FR',
              { hour: '2-digit', minute: '2-digit' }
            );
            return (
              <div
                key={item.id}
                className="group p-3 rounded-2xl liquid-glass hover:bg-white/15 border border-white/10 flex items-center justify-between gap-3 transition-all cursor-pointer"
                onClick={() => {
                  onNavigate(item.url);
                  onClose();
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white/90 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-white/50 truncate font-mono">
                    {item.url}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 font-mono">
                    {timeStr}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
