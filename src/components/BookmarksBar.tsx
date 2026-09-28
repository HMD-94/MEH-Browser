import React from 'react';
import { Bookmark, ThemeConfig } from '../types/browser';
import { Globe, Plus, Folder, ExternalLink } from 'lucide-react';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenBookmarksManager: () => void;
  theme: ThemeConfig;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onOpenBookmarksManager,
  theme,
}) => {
  return (
    <div className="flex items-center h-8 px-3 gap-1.5 bg-black/15 backdrop-blur-md border-b border-white/5 overflow-x-auto no-scrollbar z-20 select-none text-xs">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {bookmarks.slice(0, 10).map((bm) => (
          <button
            key={bm.id}
            onClick={() => onNavigate(bm.url)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all text-left truncate max-w-[160px] border border-transparent hover:border-white/10"
            title={`${bm.title} (${bm.url})`}
          >
            {bm.favicon ? (
              <img
                src={bm.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm shrink-0"
              />
            ) : bm.folder ? (
              <Folder className="w-3 h-3 text-sky-400 shrink-0" />
            ) : (
              <Globe className="w-3 h-3 text-white/60 shrink-0" />
            )}
            <span className="truncate">{bm.title}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenBookmarksManager}
        className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white text-[11px] shrink-0 transition-colors"
        title="Gérer les favoris"
      >
        <Plus className="w-3 h-3" />
        <span className="hidden sm:inline">Gérer</span>
      </button>
    </div>
  );
};
