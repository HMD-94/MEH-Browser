import React, { useState } from 'react';
import { Bookmark, ThemeConfig } from '../types/browser';
import {
  X,
  BookmarkCheck,
  Search,
  Trash2,
  ExternalLink,
  Edit2,
  Folder,
  Globe,
  Plus,
} from 'lucide-react';

interface BookmarksManagerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onDeleteBookmark: (id: string) => void;
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  theme: ThemeConfig;
}

export const BookmarksManager: React.FC<BookmarksManagerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onNavigate,
  onDeleteBookmark,
  onAddBookmark,
  theme,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('Général');

  if (!isOpen) return null;

  const folders = Array.from(
    new Set(bookmarks.map((b) => b.folder || 'Général'))
  );

  const filtered = bookmarks.filter((b) => {
    const matchesQuery =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase());
    const matchesFolder =
      selectedFolder === 'all' ||
      (b.folder || 'Général') === selectedFolder;
    return matchesQuery && matchesFolder;
  });

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

    onAddBookmark({
      title: newTitle.trim(),
      url: formattedUrl,
      folder: newFolder.trim() || 'Général',
    });

    setNewTitle('');
    setNewUrl('');
    setIsAddOpen(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] liquid-glass border-l border-white/20 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Gestionnaire des Favoris
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-black/10">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans les favoris..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Folder filter chips & Add button */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                selectedFolder === 'all'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Tous ({bookmarks.length})
            </button>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                  selectedFolder === f
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar text-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            Aucun favori trouvé
          </div>
        ) : (
          filtered.map((bm) => (
            <div
              key={bm.id}
              className="group p-3 rounded-2xl liquid-glass hover:bg-white/15 border border-white/10 flex items-center justify-between gap-3 transition-all cursor-pointer"
              onClick={() => {
                onNavigate(bm.url);
                onClose();
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white/90 truncate">
                  {bm.title}
                </div>
                <div className="text-[11px] text-white/50 truncate font-mono">
                  {bm.url}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBookmark(bm.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="p-4 border-t border-white/10 bg-black/40">
          <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
            <div className="font-semibold text-white">Nouveau favori</div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre de la page..."
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none"
              required
            />
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 text-white/60 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl font-semibold text-white shadow-md"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
