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
// DÉMARRAGE AUTOMATIQUE AU LANCEMENT DE GOOGLE CHROME
// -------------------------------------------------------------

// 1. Quand l'utilisateur ouvre Google Chrome
chrome.runtime.onStartup.addListener(async () => {
  try {
    const newTabUrl = chrome.runtime.getURL('newtab.html');
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    // Vérifie si MEH Browser est déjà ouvert
    const hasMeh = tabs.some(t => t.url && (t.url.includes('newtab.html') || t.url.includes(newTabUrl)));
    if (!hasMeh) {
      if (tabs.length === 1 && (tabs[0].url === 'chrome://newtab/' || tabs[0].url === 'about:blank' || !tabs[0].url)) {
        chrome.tabs.update(tabs[0].id, { url: newTabUrl });
      } else {
        chrome.tabs.create({ url: newTabUrl, active: true });
      }
    }
  } catch (e) {
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html'), active: true });
  }
});

// 2. Dès le chargement/installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html'), active: true });
});

// 3. Quand une nouvelle fenêtre Chrome est ouverte
if (chrome.windows && chrome.windows.onCreated) {
  chrome.windows.onCreated.addListener(async (win) => {
    try {
      const newTabUrl = chrome.runtime.getURL('newtab.html');
      const tabs = await chrome.tabs.query({ windowId: win.id });
      if (tabs.length === 1 && (tabs[0].url === 'chrome://newtab/' || tabs[0].url === 'about:blank' || !tabs[0].url)) {
        chrome.tabs.update(tabs[0].id, { url: newTabUrl });
      }
    } catch (e) {}
  });
}

