import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Plus,
  Layers,
  Palette,
  Search,
  Settings,
} from 'lucide-react';
import { ThemeConfig } from '../types/browser';

interface MobileNavBarProps {
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  onNewTab: () => void;
  tabCount: number;
  onOpenTabsList: () => void;
  onOpenCustomize: () => void;
  onOpenSettings: () => void;
  theme: ThemeConfig;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  onGoBack,
  onGoForward,
  onGoHome,
  onNewTab,
  tabCount,
  onOpenTabsList,
  onOpenCustomize,
  onOpenSettings,
  theme,
  canGoBack,
  canGoForward,
}) => {
  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 flex items-center justify-around h-14 rounded-3xl liquid-glass border border-white/20 shadow-2xl px-2">
      <button
        onClick={onGoBack}
        disabled={!canGoBack}
        className={`p-2.5 rounded-2xl transition-colors ${
          canGoBack ? 'text-white' : 'text-white/30'
        }`}
        title="Retour"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <button
        onClick={onGoForward}
        disabled={!canGoForward}
        className={`p-2.5 rounded-2xl transition-colors ${
          canGoForward ? 'text-white' : 'text-white/30'
        }`}
        title="Avancer"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      <button
        onClick={onGoHome}
        className="p-2.5 rounded-2xl text-white hover:bg-white/10 transition-colors"
        title="Accueil"
      >
        <Home className="w-5 h-5" />
      </button>

      <button
        onClick={onNewTab}
        className="p-2 rounded-2xl text-white transition-all shadow-md active:scale-95"
        style={{ backgroundColor: theme.primaryColor }}
        title="Nouvel onglet"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Tabs Count Indicator */}
      <button
        onClick={onOpenTabsList}
        className="relative p-2.5 rounded-2xl text-white hover:bg-white/10 transition-colors flex items-center justify-center font-bold text-xs"
        title="Onglets ouverts"
      >
        <div className="w-6 h-6 rounded-lg border-2 border-white/80 flex items-center justify-center text-[10px]">
          {tabCount}
        </div>
      </button>

      <button
        onClick={onOpenCustomize}
        className="p-2.5 rounded-2xl text-sky-300 hover:bg-white/10 transition-colors"
        title="Personnaliser"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );
};
