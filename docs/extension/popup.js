// MEH Browser Extension - Toolbar Popup Logic

const SEARCH_ENGINES = {
  google: 'https://www.google.fr/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  qwant: 'https://www.qwant.com/?q=',
  bing: 'https://www.bing.com/search?q='
};

let currentEngine = 'google';

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('popupSearchForm');
  const searchInput = document.getElementById('popupSearchInput');
  const btnOpenNewTab = document.getElementById('btnOpenNewTab');
  const noteTextarea = document.getElementById('popupNote');
  const noteStatus = document.getElementById('popupNoteStatus');
  const pills = document.querySelectorAll('.engine-pill');

  // Load active engine
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['meh_search_engine', 'meh_quick_note'], (res) => {
      if (res.meh_search_engine && SEARCH_ENGINES[res.meh_search_engine]) {
        currentEngine = res.meh_search_engine;
        pills.forEach(p => p.classList.toggle('active', p.dataset.engine === currentEngine));
      }
      if (res.meh_quick_note) {
        noteTextarea.value = res.meh_quick_note;
      }
    });
  } else {
    const saved = localStorage.getItem('meh_search_engine');
    if (saved && SEARCH_ENGINES[saved]) {
      currentEngine = saved;
      pills.forEach(p => p.classList.toggle('active', p.dataset.engine === currentEngine));
    }
    const note = localStorage.getItem('meh_quick_note');
    if (note) noteTextarea.value = note;
  }

  // Switch engine
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentEngine = pill.dataset.engine;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ meh_search_engine: currentEngine });
      } else {
        localStorage.setItem('meh_search_engine', currentEngine);
      }
    });
  });

  // Search submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;

    const url = (SEARCH_ENGINES[currentEngine] || SEARCH_ENGINES.google) + encodeURIComponent(q);
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  });

  // Open New Tab
  btnOpenNewTab.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'chrome://newtab' });
    } else {
      window.open('newtab.html', '_blank');
    }
  });

  // Note auto-save
  let timer;
  noteTextarea.addEventListener('input', () => {
    clearTimeout(timer);
    noteStatus.textContent = 'Enregistrement...';
    timer = setTimeout(() => {
      const val = noteTextarea.value;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ meh_quick_note: val }, () => {
          noteStatus.textContent = 'Auto-sauvegardé';
        });
      } else {
        localStorage.setItem('meh_quick_note', val);
        noteStatus.textContent = 'Auto-sauvegardé';
      }
    }, 400);
  });
});
