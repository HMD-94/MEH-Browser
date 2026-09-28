import React, { useState } from 'react';
import {
  BrowserSettings,
  ThemeConfig,
  WallpaperConfig,
  SearchEngine,
} from '../types/browser';
import { DEFAULT_SEARCH_ENGINES } from '../constants/presets';
import {
  X,
  Settings,
  Palette,
  Image as ImageIcon,
  Search,
  Layout,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Download,
  Keyboard,
  Sliders,
  RotateCcw,
  Check,
  HardDrive,
  FileDown,
  FileUp,
  Key,
  ExternalLink,
  Zap,
  EyeOff,
  Filter,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BrowserSettings;
  onChangeSettings: (settings: BrowserSettings) => void;
  onOpenCustomize: (tab?: string) => void;
  onClearHistory: () => void;
  onClearBookmarks: () => void;
  onResetAll: () => void;
  theme: ThemeConfig;
  exportConfigJson: () => void;
  importConfigJson: (json: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onOpenCustomize,
  onClearHistory,
  onClearBookmarks,
  onResetAll,
  theme,
  exportConfigJson,
  importConfigJson,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    | 'appearance'
    | 'wallpaper'
    | 'search'
    | 'tabs'
    | 'privacy'
    | 'downloads'
    | 'shortcuts'
    | 'advanced'
  >('appearance');

  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setClearedNotice(msg);
    setTimeout(() => setClearedNotice(null), 3000);
  };

  const keyboardShortcutsList = [
    { key: 'Ctrl + T', desc: 'Ouvrir un nouvel onglet' },
    { key: 'Ctrl + W', desc: "Fermer l'onglet actif" },
    { key: 'Ctrl + Shift + T', desc: 'Rouvrir le dernier onglet fermé' },
    { key: 'Ctrl + R / F5', desc: 'Actualiser la page' },
    { key: 'Ctrl + H', desc: "Afficher l'historique de navigation" },
    { key: 'Ctrl + B', desc: 'Afficher les favoris' },
    { key: 'Ctrl + D', desc: 'Ajouter la page aux favoris' },
    { key: 'Ctrl + J', desc: 'Afficher les téléchargements' },
    { key: 'F11', desc: 'Activer / désactiver le plein écran' },
    { key: 'Ctrl + + / -', desc: 'Agrandir ou rétrécir le zoom' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[620px] rounded-3xl liquid-glass border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Paramètres de MEH Browser
              </h2>
              <span className="text-[11px] text-white/50">
                Configuration et préférences du système
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Sidebar + Right Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 sm:w-56 border-r border-white/10 p-3 space-y-1 bg-black/15 overflow-y-auto no-scrollbar text-xs">
            {[
              { id: 'appearance', label: 'Apparence', icon: Palette },
              { id: 'wallpaper', label: "Fond d'écran", icon: ImageIcon },
              { id: 'search', label: 'Recherche', icon: Search },
              { id: 'tabs', label: 'Onglets', icon: Layout },
              { id: 'privacy', label: 'Confidentialité', icon: Shield },
              { id: 'downloads', label: 'Téléchargements', icon: Download },
              { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
              { id: 'advanced', label: 'Avancé', icon: Sliders },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                    isSelected
                      ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-sky-400" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar text-xs text-white/80">
            {/* Notification alert */}
            {clearedNotice && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{clearedNotice}</span>
              </div>
            )}

            {/* CATEGORY 1: APPARENCE */}
            {activeCategory === 'appearance' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Personnalisation visuelle
                </h3>
                <p className="text-white/60">
                  MEH Browser intègre le moteur esthétique Liquid Glass avec
                  contrôle précis des reflets et de la transparence.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      Panneau de personnalisation rapide
                    </h4>
                    <span className="text-white/50 text-[11px]">
                      Ajustez les couleurs, le flou, les arrondis et le style de la barre d'adresse
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCustomize('theme');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                  >
                    Ouvrir
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="font-semibold text-white">Barre de favoris</h4>
                  <div className="flex items-center justify-between">
                    <span>Afficher la barre de favoris sous la barre d'adresse</span>
                    <input
                      type="checkbox"
                      checked={theme.showBookmarksBar}
                      onChange={(e) =>
                        onOpenCustomize() // toggles via theme
                      }
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 2: FOND D'ECRAN */}
            {activeCategory === 'wallpaper' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Fond d'écran et Ambiance
                </h3>
                <p className="text-white/60">
                  Personnalisez l’arrière-plan avec vos propres images, des
                  dégradés ou des fonds Liquid Glass générés.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      Gestionnaire complet de fond d'écran
                    </h4>
                    <span className="text-white/50 text-[11px]">
                      Importation photo, créateur de dégradé, sliders de flou & luminosité
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCustomize('wallpaper');
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 font-medium transition-all"
                  >
                    Configurer le fond
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY 3: RECHERCHE */}
            {activeCategory === 'search' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Moteur de recherche
                </h3>
                <p className="text-white/60">
                  Choisissez le moteur utilisé par défaut lorsque vous écrivez dans
                  la barre d'adresse ou sur la page d'accueil.
                </p>

                <div className="space-y-2">
                  {DEFAULT_SEARCH_ENGINES.map((engine) => {
                    const isDefault =
                      settings.defaultSearchEngine === engine.id;
                    return (
                      <div
                        key={engine.id}
                        onClick={() =>
                          onChangeSettings({
                            ...settings,
                            defaultSearchEngine: engine.id as any,
                          })
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isDefault
                            ? 'bg-white/15 border-sky-400 text-white'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: engine.color }}
                          />
                          <span className="font-semibold text-white">
                            {engine.name}
                          </span>
                        </div>
                        {isDefault && (
                          <span className="text-xs text-sky-400 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Par défaut
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Google Custom Search API Section (for 100% real Google Results) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-sky-400/30 space-y-3.5 mt-4">
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <Key className="w-4 h-4" />
                    <span>Google Custom Search API (Optionnel — Résultats 1:1 comme Chrome)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Par défaut, MEH Browser interroge le web en direct avec Knowledge Graph intégré. Si vous souhaitez connecter l'API officielle de Google :
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Clé d'API Google (Google Cloud API Key) :
                      </label>
                      <input
                        type="text"
                        value={settings.googleApiKey ?? 'AIzaSyBdtD8Mv6Q0HI_QSRT1rpmVUg4DZeZ2V44'}
                        onChange={(e) =>
                          onChangeSettings({
                            ...settings,
                            googleApiKey: e.target.value.trim(),
                          })
                        }
                        placeholder="AIzaSyBdtD8Mv6Q0HI_QSRT1rpmVUg4DZeZ2V44"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        ID du moteur de recherche (Search Engine ID / CX) :
                      </label>
                      <input
                        type="text"
                        value={settings.googleSearchEngineId ?? '6731f777b64524256'}
                        onChange={(e) =>
                          onChangeSettings({
                            ...settings,
                            googleSearchEngineId: e.target.value.trim(),
                          })
                        }
                        placeholder="6731f777b64524256"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[11px] text-slate-300 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Comment obtenir votre clé gratuite (100 requêtes/jour offertes) :</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Rendez-vous sur <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">Google Cloud Console</a> &gt; activez l'API <strong>Custom Search API</strong>.</li>
                      <li>Dans <em>Identifiants</em>, créez une <strong>Clé d'API (API Key)</strong> et collez-la ci-dessus.</li>
                      <li>Allez sur <a href="https://programmablesearchengine.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">Programmable Search Engine</a>, créez un moteur en cochant <em>"Rechercher sur tout le Web"</em> et copiez votre <strong>ID Moteur (cx)</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 4: ONGLETS */}
            {activeCategory === 'tabs' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Comportement des onglets
                </h3>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        Restaurer la session au démarrage
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Rouvrir automatiquement les onglets de la session précédente
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.restoreTabsOnStartup}
                      onChange={(e) =>
                        onChangeSettings({
                          ...settings,
                          restoreTabsOnStartup: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <h4 className="font-semibold text-white">
                        Fermeture par clic molette (milieu)
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Ferme directement un onglet en cliquant dessus avec la molette
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.closeTabOnMiddleClick}
                      onChange={(e) =>
                        onChangeSettings({
                          ...settings,
                          closeTabOnMiddleClick: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 5: CONFIDENTIALITE & BLOQUEUR DE PUB */}
            {activeCategory === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Confidentialité & Sécurité</span>
                  </h3>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    MEH Browser protège votre navigation : aucune télémétrie, blocage des publicités invasives et des traceurs.
                  </p>
                </div>

                {/* MAIN AD BLOCKER CARD */}
                <div className={`p-5 rounded-3xl border transition-all duration-300 ${
                  settings.adBlockerEnabled
                    ? 'bg-gradient-to-br from-emerald-950/40 via-sky-950/20 to-black/40 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                        settings.adBlockerEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/20'
                          : 'bg-white/10 text-white/50 border border-white/10'
                      }`}>
                        {settings.adBlockerEnabled ? (
                          <ShieldCheck className="w-6 h-6 animate-pulse" />
                        ) : (
                          <ShieldAlert className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            Bloqueur de publicités & traqueurs (MEH AdShield)
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            settings.adBlockerEnabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 text-white/50'
                          }`}>
                            {settings.adBlockerEnabled ? 'Activé' : 'Désactivé'}
                          </span>
                        </div>
                        <p className="text-white/60 text-[11px] mt-0.5">
                          {settings.adBlockerEnabled
                            ? 'Bloque en temps réel les bannières, popups, scripts espions et annonces intrusives.'
                            : 'Les publicités, bannières et traceurs de navigation ne sont pas filtrés.'}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.adBlockerEnabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          onChangeSettings({
                            ...settings,
                            adBlockerEnabled: enabled,
                          });
                          showNotice(
                            enabled
                              ? '🛡️ Bloqueur de publicités activé avec succès.'
                              : '⚠️ Bloqueur de publicités désactivé.'
                          );
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-13 h-7 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                    </label>
                  </div>

                  {/* AdBlock Stats Live Counter */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                        Publicités bloquées
                      </span>
                      <span className="text-xl font-black text-emerald-400 mt-1 font-mono">
                        {settings.adBlockStats?.adsBlocked || 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                        Traceurs stoppés
                      </span>
                      <span className="text-xl font-black text-sky-400 mt-1 font-mono">
                        {settings.adBlockStats?.trackersBlocked || 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                        Total indésirables
                      </span>
                      <span className="text-xl font-black text-amber-400 mt-1 font-mono">
                        {settings.adBlockStats?.totalBlocked || 0}
                      </span>
                    </div>
                  </div>

                  {/* Options when enabled */}
                  {settings.adBlockerEnabled && (
                    <div className="pt-4 space-y-3.5 border-t border-white/10 mt-4">
                      {/* Strictness selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-white/90 mb-1.5 flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-sky-400" />
                          <span>Niveau de filtrage du bloqueur :</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onChangeSettings({
                                ...settings,
                                adBlockStrictness: 'standard',
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              settings.adBlockStrictness !== 'aggressive'
                                ? 'bg-sky-500/20 border-sky-400/50 text-white font-semibold'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs">Standard (Recommandé)</span>
                              {settings.adBlockStrictness !== 'aggressive' && (
                                <Check className="w-3 h-3 text-sky-400" />
                              )}
                            </div>
                            <span className="text-[10px] text-white/50 font-normal">
                              Bloque bannières, popups, AdSense et traceurs sans casser l'affichage.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onChangeSettings({
                                ...settings,
                                adBlockStrictness: 'aggressive',
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              settings.adBlockStrictness === 'aggressive'
                                ? 'bg-rose-500/20 border-rose-400/50 text-white font-semibold'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs">Agressif (Strict)</span>
                              {settings.adBlockStrictness === 'aggressive' && (
                                <Check className="w-3 h-3 text-rose-400" />
                              )}
                            </div>
                            <span className="text-[10px] text-white/50 font-normal">
                              Bloque également toute télémétrie tierce, iframes et scripts d'affiliation.
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Cookie / GDPR consent banners suppression */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/10">
                        <div>
                          <h5 className="font-semibold text-white text-xs flex items-center gap-1.5">
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            <span>Bloquer les bandeaux de cookies & popups de consentement</span>
                          </h5>
                          <span className="text-white/50 text-[10px]">
                            Masque automatiquement les popups Didomi, OneTrust, CookieBot et RGPD envahissants
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.adBlockCookieNotices !== false}
                          onChange={(e) =>
                            onChangeSettings({
                              ...settings,
                              adBlockCookieNotices: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Networks blocked badges */}
                      <div className="pt-1">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold block mb-1.5">
                          Réseaux publicitaires & traceurs filtrés activement :
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Google AdSense',
                            'DoubleClick',
                            'Criteo',
                            'Taboola',
                            'Outbrain',
                            'Amazon Ads',
                            'Facebook Pixel',
                            'PubMatic',
                            'PopAds',
                            'Popups intempestifs',
                          ].map((network) => (
                            <span
                              key={network}
                              className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/70 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{network}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Reset stats button */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onChangeSettings({
                              ...settings,
                              adBlockStats: { adsBlocked: 0, trackersBlocked: 0, totalBlocked: 0 },
                            });
                            showNotice('Compteurs du bloqueur de pub réinitialisés à 0.');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[11px] flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Réinitialiser les compteurs</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* DO NOT TRACK & DATA PRIVACY */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        Directive Do Not Track (Ne pas me suivre)
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Envoie l'en-tête officiel DNT aux sites pour interdire le profilage publicitaire
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacyDoNotTrack}
                      onChange={(e) =>
                        onChangeSettings({
                          ...settings,
                          privacyDoNotTrack: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <h4 className="font-semibold text-white">
                        Nettoyer l'historique de navigation
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Effacer la liste locale des pages et sites consultés
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onClearHistory();
                        showNotice('Historique de navigation effacé avec succès.');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all font-medium flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Effacer l'historique</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 6: TELECHARGEMENTS */}
            {activeCategory === 'downloads' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Gestion des Téléchargements
                </h3>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        Emplacement de sauvegarde par défaut
                      </h4>
                      <span className="text-white/50 font-mono text-[11px]">
                        {settings.downloadFolder}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onChangeSettings({
                          ...settings,
                          downloadFolder: 'Bureau/MEH_Downloads',
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <h4 className="font-semibold text-white">
                        Demander où enregistrer chaque fichier
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Affiche une invite avant de lancer le téléchargement
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.askDownloadPath}
                      onChange={(e) =>
                        onChangeSettings({
                          ...settings,
                          askDownloadPath: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 7: RACCOURCIS CLAVIER */}
            {activeCategory === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Raccourcis Clavier
                </h3>
                <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10 bg-white/5">
                  {keyboardShortcutsList.map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 text-xs"
                    >
                      <span className="text-white/80">{sc.desc}</span>
                      <kbd className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/20 font-mono text-sky-300 font-semibold shadow-inner">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORY 8: AVANCE */}
            {activeCategory === 'advanced' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Options avancées & Sauvegarde
                </h3>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        Accélération matérielle
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Utilise le processeur graphique pour le rendu du Liquid Glass
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.hardwareAcceleration}
                      onChange={(e) =>
                        onChangeSettings({
                          ...settings,
                          hardwareAcceleration: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <h4 className="font-semibold text-white">
                        Sauvegarde & Restauration
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Exportez votre thème, fond d'écran et réglages au format JSON
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportConfigJson}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Exporter</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <h4 className="font-semibold text-rose-400">
                        Réinitialiser MEH Browser
                      </h4>
                      <span className="text-white/50 text-[11px]">
                        Restaure tous les paramètres, thèmes et fonds d'écran par défaut
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Voulez-vous vraiment réinitialiser MEH Browser aux paramètres d’usine ?'
                          )
                        ) {
                          onResetAll();
                          showNotice('MEH Browser a été réinitialisé avec succès.');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/25 flex items-center justify-between">
          <span className="text-[11px] text-white/50">
            MEH Browser v1.0 · Moteur Liquid Glass
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
