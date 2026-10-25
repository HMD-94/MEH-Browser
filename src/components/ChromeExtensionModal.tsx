import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Check,
  Copy,
  Puzzle,
  Sparkles,
  Layers,
  Search,
  Clock,
  Palette,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import JSZip from 'jszip';
import { ThemeConfig } from '../types/browser';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zip = new JSZip();

      // List of files to fetch and include in the zip
      const filesToFetch = [
        'manifest.json',
        'background.js',
        'newtab.html',
        'newtab.css',
        'newtab.js',
        'popup.html',
        'popup.css',
        'popup.js',
        'README.md',
      ];

      // Fetch textual assets from /extension/
      for (const file of filesToFetch) {
        try {
          const res = await fetch(`/extension/${file}`);
          if (res.ok) {
            const text = await res.text();
            zip.file(file, text);
          }
        } catch (e) {
          console.warn(`Could not fetch /extension/${file}, continuing...`, e);
        }
      }

      // Fetch icons
      const iconsFolder = zip.folder('icons');
      const iconSizes = ['16', '48', '128'];
      for (const size of iconSizes) {
        try {
          const iconRes = await fetch(`/extension/icons/icon-${size}.png`);
          if (iconRes.ok) {
            const blob = await iconRes.blob();
            iconsFolder?.file(`icon-${size}.png`, blob);
          }
        } catch (e) {
          console.warn(`Could not fetch icon-${size}.png`, e);
        }
      }

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);

      // Trigger browser download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'meh-browser-chrome-extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setIsDownloading(false);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Error creating extension zip:', err);
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-3xl liquid-glass border border-white/20 shadow-2xl p-6 sm:p-8 text-white">
        {/* Background glow */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.primaryColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 relative">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 text-white"
              style={{ backgroundColor: `${theme.primaryColor}35` }}
            >
              <Puzzle className="w-6 h-6" style={{ color: theme.primaryColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Extension Chrome MEH Browser
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Manifest V3
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Transformez Google Chrome pour avoir exactement l'interface, la fluidité et les fonctionnalités de MEH Browser.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Hero Visual Mockup Banner */}
        <div className="mt-6 relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-r from-sky-950/60 via-slate-900/80 to-purple-950/60 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Sparkles className="w-4 h-4" />
                <span>Expérience Liquid Glass dans Google Chrome</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                Votre Chrome classique devient un navigateur d'exception
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Remplace le nouvel onglet terne de Chrome par le design MEH Browser : horloge géante, multi-moteurs (Google, DDG, Qwant), Speed Dial personnalisé, météo en direct et widgets de productivité.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-950 shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading
                    ? 'Génération du pack...'
                    : downloadSuccess
                    ? 'Téléchargé ! Re-télécharger (.zip)'
                    : "Télécharger l'Extension (.zip)"}
                </span>
              </button>

              <a
                href="/extension/newtab.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-2xl font-semibold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center flex items-center justify-center gap-2"
              >
                <Eye className="w-3.5 h-3.5 text-sky-300" />
                <span>Tester le Nouvel Onglet en direct</span>
                <ExternalLink className="w-3 h-3 text-white/60" />
              </a>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>Nouvel Onglet 4K</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Horloge temps réel, date en français, salutation personnalisée et 6 fonds d'écran 4K officiels.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <Search className="w-4 h-4" />
              <span>Multi-Moteurs & Voix</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Google, DuckDuckGo, Qwant, Bing, Ecosia, autocomplétion instantanée et recherche vocale intégrée.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Widgets & Speed Dial</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Bloc-notes rapide auto-sauvegardé, minuteur Focus Pomodoro, météo locale et raccourcis configurables.
            </p>
          </div>
        </div>

        {/* Step-by-Step Installation Tutorial */}
        <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 text-xs flex items-center justify-center font-black">
                i
              </span>
              <span>Installation facile dans Google Chrome (moins d'1 minute) :</span>
            </h4>
            <span className="text-[11px] text-slate-400">Compatible Chrome, Brave, Edge & Opera</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-300">
                <span className="w-5 h-5 rounded-full bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-[11px]">
                  1
                </span>
                <span>Décompresser le ZIP</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Cliquez sur le bouton bleu ci-dessus pour télécharger le fichier <b>meh-browser-chrome-extension.zip</b>, puis faites clic droit &gt; <i>« Extraire tout »</i>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <span className="w-5 h-5 rounded-full bg-indigo-400/20 border border-indigo-400/30 flex items-center justify-center text-[11px]">
                  2
                </span>
                <span>Ouvrir les Extensions</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Dans Google Chrome, collez cette adresse dans la barre d'URL :
              </p>
              <button
                onClick={copyChromeUrl}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/20 text-sky-300 font-mono text-[10px] flex items-center justify-between hover:border-sky-400 transition-colors"
                title="Cliquer pour copier l'adresse"
              >
                <span>chrome://extensions</span>
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <span className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-[11px]">
                  3
                </span>
                <span>Charger l'extension</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Activez l'interrupteur <b>« Mode développeur »</b> en haut à droite, puis cliquez sur <b>« Charger l'extension non empaquetée »</b> et sélectionnez le dossier extrait.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Terminé ! Appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[10px]">Ctrl + T</kbd> dans Chrome pour admirer votre nouvel onglet MEH Browser.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            <span>Tous vos raccourcis et widgets sont automatiquement sauvegardés localement.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 transition-all flex items-center gap-2 shadow-lg"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
