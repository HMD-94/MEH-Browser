import React from 'react';
import { DownloadItem, ThemeConfig } from '../types/browser';
import {
  X,
  Download,
  CheckCircle2,
  Clock,
  FolderOpen,
  Trash2,
  FileCheck,
} from 'lucide-react';

interface DownloadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadItem[];
  onClearDownloads: () => void;
  theme: ThemeConfig;
}

export const DownloadsDrawer: React.FC<DownloadsDrawerProps> = ({
  isOpen,
  onClose,
  downloads,
  onClearDownloads,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] liquid-glass border-l border-white/20 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Téléchargements
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Top Bar Action */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/10 text-xs text-white/60">
        <span>{downloads.length} fichiers</span>
        {downloads.length > 0 && (
          <button
            onClick={onClearDownloads}
            className="text-xs text-white/70 hover:text-white font-medium"
          >
            Vider la liste
          </button>
        )}
      </div>

      {/* Downloads List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar text-xs">
        {downloads.length === 0 ? (
          <div className="text-center py-16 text-white/40 space-y-2">
            <Download className="w-8 h-8 mx-auto text-white/20" />
            <p>Aucun fichier téléchargé</p>
          </div>
        ) : (
          downloads.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl liquid-glass border border-white/10 flex items-center justify-between gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white/90 truncate">
                  {item.filename}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  <span>{item.size}</span>
                  <span>·</span>
                  <span className="text-emerald-400">Terminé</span>
                </div>
              </div>

              <button
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-xs shrink-0"
                title="Afficher dans le dossier"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
