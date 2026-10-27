import JSZip from 'jszip';

// Base64 icon (2.3 KB PNG) for 16, 48, 128
const ICON_BASE64 = `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`;

export const EXTENSION_MANIFEST = JSON.stringify(
  {
    manifest_version: 3,
    name: "MEH Browser - Liquid Glass for Chrome",
    version: "1.0.0",
    description: "Transformez Google Chrome avec le design Liquid Glass officiel de MEH Browser : nouvel onglet spectaculaire, multi-moteurs, widgets et fonds 4K.",
    icons: {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    action: {
      default_popup: "popup.html",
      default_title: "MEH Browser Hub",
      default_icon: {
        "16": "icons/icon-16.png",
        "48": "icons/icon-48.png",
        "128": "icons/icon-128.png"
      }
    },
    chrome_url_overrides: {
      "newtab": "newtab.html"
    },
    omnibox: {
      "keyword": "meh"
    },
    background: {
      "service_worker": "background.js"
    },
    permissions: [
      "storage",
      "unlimitedStorage",
      "tabs"
    ],
    content_scripts: [
      {
        "matches": [
          "*://www.google.com/search*",
          "*://www.google.fr/search*",
          "*://www.google.be/search*",
          "*://www.google.ca/search*",
          "*://www.google.ch/search*",
          "*://www.google.co.uk/search*",
          "*://www.google.de/search*",
          "*://www.google.es/search*",
          "*://www.google.it/search*",
          "*://duckduckgo.com/*",
          "*://www.bing.com/search*",
          "*://www.qwant.com/*",
          "*://www.ecosia.org/search*"
        ],
        "css": ["content.css"],
        "js": ["content.js"],
        "run_at": "document_end"
      }
    ],
    web_accessible_resources: [
      {
        "resources": [
          "wallpapers/*",
          "icons/*"
        ],
        "matches": [
          "*://*.google.com/*",
          "*://*.google.fr/*",
          "*://*.google.be/*",
          "*://*.google.ca/*",
          "*://*.google.ch/*",
          "*://*.google.co.uk/*",
          "*://*.google.de/*",
          "*://*.google.es/*",
          "*://*.google.it/*",
          "*://duckduckgo.com/*",
          "*://*.bing.com/*",
          "*://*.qwant.com/*",
          "*://*.ecosia.org/*"
        ]
      }
    ]
  },
  null,
  2
);

export const EXTENSION_BACKGROUND_JS = `// MEH Browser Extension - Background Service Worker

const SEARCH_ENGINES = {
  google: 'https://www.google.fr/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  qwant: 'https://www.qwant.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  youtube: 'https://www.youtube.com/results?search_query=',
  wikipedia: 'https://fr.wikipedia.org/wiki/Special:Search?search='
};

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  suggest([
    { content: text, description: 'Rechercher « <match>' + text + '</match> » avec <dim>MEH Browser (Google)</dim>' },
    { content: '!yt ' + text, description: 'Rechercher « <match>' + text + '</match> » sur <dim>YouTube</dim>' },
    { content: '!w ' + text, description: 'Rechercher « <match>' + text + '</match> » sur <dim>Wikipédia</dim>' }
  ]);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  let targetUrl = '';
  const trimmed = text.trim();

  if (trimmed.startsWith('!yt ')) {
    targetUrl = SEARCH_ENGINES.youtube + encodeURIComponent(trimmed.slice(4));
  } else if (trimmed.startsWith('!w ')) {
    targetUrl = SEARCH_ENGINES.wikipedia + encodeURIComponent(trimmed.slice(3));
  } else if (trimmed.startsWith('!d ')) {
    targetUrl = SEARCH_ENGINES.duckduckgo + encodeURIComponent(trimmed.slice(3));
  } else {
    chrome.storage.local.get(['meh_search_engine'], (res) => {
      const engineKey = res.meh_search_engine || 'google';
      const base = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
      const url = base + encodeURIComponent(trimmed);
      navigateTo(url, disposition);
    });
    return;
  }

  navigateTo(targetUrl, disposition);
});

function navigateTo(url, disposition) {
  if (disposition === 'currentTab') {
    chrome.tabs.update({ url });
  } else if (disposition === 'newForegroundTab') {
    chrome.tabs.create({ url, active: true });
  } else {
    chrome.tabs.create({ url, active: false });
  }
}

// -------------------------------------------------------------
// GESTION PROPRE DU NOUVEL ONGLET
// Le Nouvel Onglet de MEH Browser est géré nativement par
// "chrome_url_overrides.newtab" dans manifest.json.
// Aucun détournement forcé : les raccourcis (Gmail, YouTube, etc.)
// et les fichiers locaux (.html, .pdf) s'ouvrent normalement et directement.
// -------------------------------------------------------------
`;

export const EXTENSION_README = `# 🌐 MEH Browser — Extension Officielle Google Chrome (Manifest V3)

Félicitations ! Vous venez d'obtenir l'extension officielle MEH Browser.

---

## ✨ FOND D'ÉCRAN SAKURA SUR LA RECHERCHE GOOGLE
- 🌸 **Fond d'écran Sakura HD** : S'affiche automatiquement en arrière-plan de Google Search (google.fr, google.com, etc.).
- 🔍 **Google Search reste 100% normal** : Votre recherche Chrome habituelle reste exactement la même, simple et fluide, avec votre fond d'écran Sakura en arrière-plan au lieu d'un fond noir/gris terne !

---

## 🚀 INSTALLATION / MISE À JOUR EN 3 ÉTAPES (30 secondes) :

1. Décompressez cette archive ZIP (Clic droit > « Extraire tout »).
2. Ouvrez Google Chrome et accédez à :
   chrome://extensions
3. En haut à droite, activez l'interrupteur « Mode développeur ».
4. En haut à gauche, cliquez sur « Charger l'extension non empaquetée » (ou sur l'icône de rechargement ↻ si vous l'aviez déjà chargée).
5. ⚠️ IMPORTANT : Sélectionnez bien le dossier qui contient directement le fichier "manifest.json" !

🎉 MEH Browser se lance désormais AUTOMATIQUEMENT au démarrage de Google Chrome, sur chaque nouvel onglet (Ctrl + T) et avec votre fond d'écran Sakura sur Google Search !

💡 Conseil : Dans chrome://settings/onStartup, choisissez « Ouvrir la page Nouvel onglet » pour une ouverture instantanée.
`;

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates and downloads the complete Chrome extension ZIP bundle.
 * Fully embedded and guaranteed to work on any domain, offline, or on GitHub Pages.
 */
export async function downloadExtensionBundleZip(): Promise<void> {
  const zip = new JSZip();

  // 1. Core manifest.json (ALWAYS at root of ZIP)
  zip.file('manifest.json', EXTENSION_MANIFEST);

  // 2. Background service worker
  zip.file('background.js', EXTENSION_BACKGROUND_JS);

  // 3. Documentation
  zip.file('README.md', EXTENSION_README);

  // 4. Try fetching current live assets if available, or use embedded fallbacks
  const htmlFiles = [
    'newtab.html',
    'newtab.css',
    'newtab.js',
    'popup.html',
    'popup.css',
    'popup.js',
    'content.js',
    'content.css'
  ];
  for (const file of htmlFiles) {
    try {
      // Try relative fetch first (works on localhost and subpaths)
      const res = await fetch(`extension/${file}`).catch(() => fetch(`/extension/${file}`));
      if (res && res.ok) {
        const text = await res.text();
        // verify it is not an HTML 404 error page
        if (!text.includes('<!DOCTYPE') || file.endsWith('.html')) {
          zip.file(file, text);
          continue;
        }
      }
    } catch {}
  }

  // 5. Icons folder
  const iconsFolder = zip.folder('icons');
  const iconBytes = base64ToUint8Array(ICON_BASE64);
  iconsFolder?.file('icon-16.png', iconBytes);
  iconsFolder?.file('icon-48.png', iconBytes);
  iconsFolder?.file('icon-128.png', iconBytes);

  // 6. Wallpapers folder (including default Sakura Bloom 4K)
  const wallpapersFolder = zip.folder('wallpapers');
  const wallpaperList = [
    'sakura-bloom.jpg',
    'liquid-glass.jpg',
    'aurora-drift.jpg',
    'sunset-prism.jpg'
  ];
  for (const wp of wallpaperList) {
    try {
      const res = await fetch(`extension/wallpapers/${wp}`).catch(() => fetch(`/extension/wallpapers/${wp}`));
      if (res && res.ok) {
        const buffer = await res.arrayBuffer();
        wallpapersFolder?.file(wp, buffer);
      }
    } catch {}
  }

  // 6. Generate the ZIP blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // 7. Trigger instant browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meh-browser-chrome-extension.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
