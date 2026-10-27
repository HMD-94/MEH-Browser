// MEH Browser Extension - Background Service Worker

const SEARCH_ENGINES = {
  google: 'https://www.google.fr/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  qwant: 'https://www.qwant.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  youtube: 'https://www.youtube.com/results?search_query=',
  wikipedia: 'https://fr.wikipedia.org/wiki/Special:Search?search='
};

// Omnibox "meh" handler: type "meh <query>" in Chrome's URL bar
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  suggest([
    { content: text, description: `Rechercher « <match>${text}</match> » avec <dim>MEH Browser (Google)</dim>` },
    { content: `!yt ${text}`, description: `Rechercher « <match>${text}</match> » sur <dim>YouTube</dim>` },
    { content: `!w ${text}`, description: `Rechercher « <match>${text}</match> » sur <dim>Wikipédia</dim>` }
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

