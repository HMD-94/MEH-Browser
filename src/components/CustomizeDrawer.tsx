import React, { useState, useRef } from 'react';
import {
  WallpaperConfig,
  ThemeConfig,
  ThemePresetId,
  GradientStop,
} from '../types/browser';
import {
  WALLPAPER_PRESETS,
  THEME_PRESETS,
} from '../constants/presets';
import {
  X,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Sliders,
  Type,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  Check,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';

interface CustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: WallpaperConfig;
  onChangeWallpaper: (wallpaper: WallpaperConfig) => void;
  theme: ThemeConfig;
  onChangeTheme: (theme: ThemeConfig) => void;
  onApplyThemePreset: (presetId: ThemePresetId) => void;
}

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  isOpen,
  onClose,
  wallpaper,
  onChangeWallpaper,
  theme,
  onChangeTheme,
  onApplyThemePreset,
}) => {
  const [activeTab, setActiveTab] = useState<
    'wallpaper' | 'theme' | 'glass' | 'typography'
  >('wallpaper');
  const [wallpaperFilter, setWallpaperFilter] = useState<
    'all' | 'liquid-glass' | 'cyber' | 'nature' | 'dark' | 'colorful' | 'animated'
  >('all');
  const [customUrlInput, setCustomUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Custom Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChangeWallpaper({
          ...wallpaper,
          type: 'upload',
          customImageUrl: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom Gradient stop update
  const handleGradientStopChange = (index: number, newColor: string) => {
    const currentGradient = wallpaper.gradient || {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#38bdf8', offset: 0 },
        { color: '#818cf8', offset: 50 },
        { color: '#c084fc', offset: 100 },
      ],
    };

    const newStops = [...currentGradient.stops];
    newStops[index] = { ...newStops[index], color: newColor };

    onChangeWallpaper({
      ...wallpaper,
      type: 'gradient',
      gradient: {
        ...currentGradient,
        stops: newStops,
      },
    });
  };

  const handleGradientAngleChange = (angle: number) => {
    const currentGradient = wallpaper.gradient || {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#38bdf8', offset: 0 },
        { color: '#818cf8', offset: 50 },
        { color: '#c084fc', offset: 100 },
      ],
    };

    onChangeWallpaper({
      ...wallpaper,
      type: 'gradient',
      gradient: {
        ...currentGradient,
        angle,
      },
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] liquid-glass border-l border-white/20 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Personnaliser MEH Browser
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-white/10 px-4 py-2 gap-1 bg-black/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'wallpaper', label: "Fond d'écran", icon: ImageIcon },
          { id: 'theme', label: 'Thème & Couleurs', icon: Palette },
          { id: 'glass', label: 'Liquid Glass', icon: Sparkles },
          { id: 'typography', label: 'Typo & Interface', icon: Type },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'liquid-tab active text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drawer Body Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar text-xs">
        {/* ===================== TAB 1: FOND D'ECRAN ===================== */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-6">
            {/* Built-in Wallpaper Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px]">
                  Fonds d'écran intégrés
                </span>
                <span className="text-[10px] text-white/40">Haute définition</span>
              </div>

              {/* Wallpaper Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-2">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'liquid-glass', label: 'Liquid Glass' },
                  { id: 'cyber', label: 'Cyber' },
                  { id: 'nature', label: 'Nature' },
                  { id: 'dark', label: 'Sombre' },
                  { id: 'colorful', label: 'Couleurs' },
                  { id: 'animated', label: 'Animés' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setWallpaperFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all shrink-0 ${
                      wallpaperFilter === cat.id
                        ? 'bg-sky-500 text-white font-semibold shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Presets */}
              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPER_PRESETS.filter((p) => {
                  if (wallpaperFilter === 'all') return true;
                  if (wallpaperFilter === 'animated') return p.isAnimated;
                  return p.category === wallpaperFilter;
                }).map((preset) => {
                  const isSelected =
                    wallpaper.type === 'preset' &&
                    wallpaper.presetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() =>
                        onChangeWallpaper({
                          ...wallpaper,
                          type: preset.isAnimated ? 'animated' : 'preset',
                          presetId: preset.id,
                          animatedType: preset.id === 'animated-particle' ? 'particle-wave' : 'liquid-plasma',
                        })
                      }
                      className={`relative h-20 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-200 group ${
                        isSelected
                          ? 'border-sky-400 ring-2 ring-sky-400/50 scale-[1.02]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {preset.imageUrl ? (
                        <img
                          src={preset.thumbnailUrl || preset.imageUrl}
                          alt={preset.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : preset.gradientCss ? (
                        <div
                          className="w-full h-full"
                          style={{ background: preset.gradientCss }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white/80 animate-pulse" />
                        </div>
                      )}

                      {/* Title Badge */}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 backdrop-blur-sm text-[10px] text-white/90 truncate flex items-center justify-between">
                        <span className="truncate">{preset.name}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-sky-400 shrink-0 ml-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Web Image URL */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Fond d'écran depuis une URL Web
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customUrlInput.trim()) {
                    onChangeWallpaper({
                      ...wallpaper,
                      type: 'upload',
                      customImageUrl: customUrlInput.trim(),
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!customUrlInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-all shrink-0 active:scale-95"
                >
                  Appliquer
                </button>
              </form>
            </div>

            {/* Custom Image Upload */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Importer depuis votre appareil
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-sky-400/60 hover:bg-white/5 text-white/80 hover:text-white transition-all"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Sélectionner une photo sur votre ordinateur</span>
              </button>
            </div>

            {/* Custom Multi-Color Gradient Builder */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Créateur de Dégradé Personnalisé
              </span>

              <div className="flex items-center gap-3">
                <span className="text-white/60">Couleurs:</span>
                {[0, 1, 2].map((idx) => {
                  const curColor =
                    wallpaper.gradient?.stops[idx]?.color ||
                    (idx === 0 ? '#38bdf8' : idx === 1 ? '#818cf8' : '#c084fc');
                  return (
                    <label
                      key={idx}
                      className="relative w-8 h-8 rounded-full cursor-pointer border border-white/30 shadow-md overflow-hidden block"
                    >
                      <input
                        type="color"
                        value={curColor}
                        onChange={(e) =>
                          handleGradientStopChange(idx, e.target.value)
                        }
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                      />
                      <span
                        className="w-full h-full block"
                        style={{ backgroundColor: curColor }}
                      />
                    </label>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    onChangeWallpaper({
                      ...wallpaper,
                      type: 'gradient',
                      gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                          { color: '#38bdf8', offset: 0 },
                          { color: '#818cf8', offset: 50 },
                          { color: '#ec4899', offset: 100 },
                        ],
                      },
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 hover:text-white ml-auto"
                >
                  Appliquer
                </button>
              </div>

              {/* Angle Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">
                    Orientation du dégradé :
                  </span>
                  <span className="font-mono text-sky-400">
                    {wallpaper.gradient?.angle || 135}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={wallpaper.gradient?.angle || 135}
                  onChange={(e) =>
                    handleGradientAngleChange(Number(e.target.value))
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            </div>

            {/* Solid Color Mode */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Couleur Unie
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={wallpaper.solidColor || '#0b0f19'}
                  onChange={(e) =>
                    onChangeWallpaper({
                      ...wallpaper,
                      type: 'color',
                      solidColor: e.target.value,
                    })
                  }
                  className="w-9 h-9 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                />
                <span className="text-white/60 font-mono">
                  {wallpaper.solidColor || '#0b0f19'}
                </span>
                <button
                  onClick={() =>
                    onChangeWallpaper({
                      ...wallpaper,
                      type: 'color',
                      solidColor: '#090d16',
                    })
                  }
                  className="px-3 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white ml-auto"
                >
                  Sombre absolu
                </button>
              </div>
            </div>

            {/* Sliders: Blur, Opacity, Brightness, Saturation */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Ajustements du Fond (Temps Réel)
              </span>

              {/* Blur Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">Flou d'arrière-plan</span>
                  <span className="font-mono text-sky-400">{wallpaper.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={wallpaper.blur}
                  onChange={(e) =>
                    onChangeWallpaper({
                      ...wallpaper,
                      blur: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">Opacité</span>
                  <span className="font-mono text-sky-400">
                    {Math.round(wallpaper.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={wallpaper.opacity}
                  onChange={(e) =>
                    onChangeWallpaper({
                      ...wallpaper,
                      opacity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Brightness Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">Luminosité</span>
                  <span className="font-mono text-sky-400">
                    {Math.round(wallpaper.brightness * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.05"
                  value={wallpaper.brightness}
                  onChange={(e) =>
                    onChangeWallpaper({
                      ...wallpaper,
                      brightness: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Saturation Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">Saturation</span>
                  <span className="font-mono text-sky-400">
                    {Math.round(wallpaper.saturation * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={wallpaper.saturation}
                  onChange={(e) =>
                    onChangeWallpaper({
                      ...wallpaper,
                      saturation: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: THEME & COULEURS ===================== */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {/* Preset Themes List */}
            <div>
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block mb-3">
                Thèmes Prédéfinis
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark-glass', name: 'Dark Glass', color: '#38bdf8' },
                  { id: 'light-glass', name: 'Light Glass', color: '#0284c7' },
                  { id: 'cyberpunk', name: 'Cyberpunk', color: '#f43f5e' },
                  { id: 'emerald-lux', name: 'Émeraude Lux', color: '#10b981' },
                  { id: 'rose-quartz', name: 'Rose Quartz', color: '#f472b6' },
                  { id: 'ocean', name: 'Ocean', color: '#06b6d4' },
                  { id: 'purple', name: 'Purple', color: '#a855f7' },
                  { id: 'red', name: 'Red', color: '#f43f5e' },
                  { id: 'green', name: 'Green', color: '#10b981' },
                  { id: 'sunset', name: 'Sunset', color: '#f97316' },
                  { id: 'midnight', name: 'Midnight', color: '#6366f1' },
                  { id: 'aurora', name: 'Aurora', color: '#2dd4bf' },
                ].map((th) => {
                  const isCurrent = theme.preset === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => onApplyThemePreset(th.id as ThemePresetId)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl liquid-glass border transition-all ${
                        isCurrent
                          ? 'border-sky-400 ring-2 ring-sky-400/40 bg-white/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full mb-1.5 shadow-md"
                        style={{ backgroundColor: th.color }}
                      />
                      <span className="text-[11px] font-medium text-white/90">
                        {th.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Clair / Sombre */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Mode d'affichage
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeTheme({ ...theme, mode: 'dark' })}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                    theme.mode === 'dark'
                      ? 'bg-white/20 border-white/40 text-white shadow-sm'
                      : 'border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Sombre</span>
                </button>
                <button
                  onClick={() => onChangeTheme({ ...theme, mode: 'light' })}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                    theme.mode === 'light'
                      ? 'bg-white/20 border-white/40 text-white shadow-sm'
                      : 'border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Clair</span>
                </button>
              </div>
            </div>

            {/* Custom Colors Pickers */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Palette de couleurs personnalisée
              </span>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Couleur principale (Accent)</span>
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    onChangeTheme({ ...theme, primaryColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Couleur secondaire</span>
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) =>
                    onChangeTheme({ ...theme, secondaryColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Couleur des boutons d'action</span>
                <input
                  type="color"
                  value={theme.buttonColor}
                  onChange={(e) =>
                    onChangeTheme({ ...theme, buttonColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: LIQUID GLASS ===================== */}
        {activeTab === 'glass' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Paramètres de Verre Translucide
              </span>

              {/* Glass Transparency */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70">Transparence du verre</span>
                  <span className="font-mono text-sky-400">
                    {Math.round(theme.glassTransparency * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={theme.glassTransparency}
                  onChange={(e) =>
                    onChangeTheme({
                      ...theme,
                      glassTransparency: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Liquid Glass Intensity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70">Intensité Liquid Glass</span>
                  <span className="font-mono text-sky-400">
                    {Math.round(theme.liquidGlassIntensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={theme.liquidGlassIntensity}
                  onChange={(e) =>
                    onChangeTheme({
                      ...theme,
                      liquidGlassIntensity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Glass Blur Radius */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70">Flou de réfraction (Blur)</span>
                  <span className="font-mono text-sky-400">
                    {theme.glassBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={theme.glassBlur}
                  onChange={(e) =>
                    onChangeTheme({
                      ...theme,
                      glassBlur: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            </div>

            {/* Corner Radius */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Taille des coins arrondis
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rounded-lg', label: 'Modéré (8px)' },
                  { id: 'rounded-xl', label: 'Doux (12px)' },
                  { id: 'rounded-2xl', label: 'Moderne (16px)' },
                  { id: 'rounded-3xl', label: 'Large (24px)' },
                  { id: 'rounded-full', label: 'Pilule' },
                ].map((rad) => (
                  <button
                    key={rad.id}
                    onClick={() =>
                      onChangeTheme({ ...theme, cornerRadius: rad.id as any })
                    }
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                      theme.cornerRadius === rad.id
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {rad.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Ombres et reliefs
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['none', 'subtle', 'medium', 'deep', 'glow'].map((depth) => (
                  <button
                    key={depth}
                    onClick={() =>
                      onChangeTheme({ ...theme, shadowDepth: depth as any })
                    }
                    className={`py-2 px-2 rounded-xl border text-[11px] font-medium capitalize transition-all ${
                      theme.shadowDepth === depth
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {depth}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Text Toggle */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">
                  Visibilité Maximale & Ombres Textes
                </span>
                <span className="text-[11px] text-slate-300">
                  Renforce le contraste et l'opacité du verre pour une lisibilité parfaite sur n'importe quel fond
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.highContrastText ?? true}
                onChange={(e) =>
                  onChangeTheme({
                    ...theme,
                    highContrastText: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Interactive Mouse Glow Light Reflection */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">
                  Reflet de verre interactif
                </span>
                <span className="text-[11px] text-white/50">
                  Lumière fluide qui suit la souris sur les surfaces en verre
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.mouseGlowEnabled}
                onChange={(e) =>
                  onChangeTheme({
                    ...theme,
                    mouseGlowEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-sky-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ===================== TAB 4: TYPOGRAPHY & INTERFACE ===================== */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            {/* Fonts */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                  Police de caractères
                </span>
                <span className="text-[10px] text-sky-400 font-mono">10 polices</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Plus Jakarta Sans', tag: 'Moderne', desc: 'Épuré & géométrique' },
                  { id: 'Inter', tag: 'UI Clean', desc: 'Précis & ultra-lisible' },
                  { id: 'Outfit', tag: 'Tech', desc: 'Courbes technologiques' },
                  { id: 'Space Grotesk', tag: 'Cyber', desc: 'Futuriste & techno' },
                  { id: 'Syne', tag: 'Design', desc: 'Artistique & singulier' },
                  { id: 'Lexend', tag: 'Lecture', desc: 'Confort de lecture maximal' },
                  { id: 'Playfair Display', tag: 'Élégant', desc: 'Serif raffiné de luxe' },
                  { id: 'JetBrains Mono', tag: 'Code', desc: 'Monospace développeur' },
                  { id: 'Fira Code', tag: 'Terminal', desc: 'Monospace moderne' },
                  { id: 'system-ui', tag: 'Système', desc: 'Police native de l’OS' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChangeTheme({ ...theme, font: f.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      theme.font === f.id
                        ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/40 text-white font-bold'
                        : 'border-white/10 text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ fontFamily: `"${f.id}", sans-serif` }}
                      >
                        {f.id}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                        {f.tag}
                      </span>
                    </div>
                    <span
                      className="text-[10px] text-white/50 block truncate"
                      style={{ fontFamily: `"${f.id}", sans-serif` }}
                    >
                      {f.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Espacement des lettres (Letter Spacing)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'Serré (-0.02em)' },
                  { id: 'normal', label: 'Normal (0em)' },
                  { id: 'relaxed', label: 'Aéré (+0.025em)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      onChangeTheme({ ...theme, fontSpacing: s.id as any })
                    }
                    className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                      (theme.fontSpacing || 'normal') === s.id
                        ? 'bg-white/20 border-white/40 text-white font-semibold'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Taille du texte
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sm', label: 'Compact' },
                  { id: 'base', label: 'Standard' },
                  { id: 'lg', label: 'Confort' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      onChangeTheme({ ...theme, textSize: s.id as any })
                    }
                    className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                      theme.textSize === s.id
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar Look */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="font-semibold text-white/80 uppercase tracking-wider text-[11px] block">
                Apparence de la barre d'adresse
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pill', label: 'Pilule Verre' },
                  { id: 'minimal', label: 'Minimaliste' },
                  { id: 'floating', label: 'Flottante' },
                  { id: 'compact', label: 'Compacte' },
                ].map((look) => (
                  <button
                    key={look.id}
                    onClick={() =>
                      onChangeTheme({
                        ...theme,
                        searchBarLook: look.id as any,
                      })
                    }
                    className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                      theme.searchBarLook === look.id
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {look.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animations Toggle */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">
                  Animations fluides
                </span>
                <span className="text-[11px] text-white/50">
                  Transitions entre onglets et apparition des panneaux
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.animationsEnabled}
                onChange={(e) =>
                  onChangeTheme({
                    ...theme,
                    animationsEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-sky-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
        <span className="text-[11px] text-white/50">
          Sauvegardé automatiquement
        </span>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
