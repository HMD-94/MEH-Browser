// MEH Browser Chrome Extension - New Tab Controller

// Search Engines Configuration
const SEARCH_ENGINES = {
  google: {
    name: 'Google',
    badge: 'G',
    color: '#4285F4',
    url: 'https://www.google.fr/search?q='
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    badge: '🦆',
    color: '#DE5833',
    url: 'https://duckduckgo.com/?q='
  },
  qwant: {
    name: 'Qwant',
    badge: 'Q',
    color: '#5C6BC0',
    url: 'https://www.qwant.com/?q='
  },
  bing: {
    name: 'Bing',
    badge: 'b',
    color: '#00809D',
    url: 'https://www.bing.com/search?q='
  },
  ecosia: {
    name: 'Ecosia',
    badge: '🌱',
    color: '#4caf50',
    url: 'https://www.ecosia.org/search?q='
  },
  youtube: {
    name: 'YouTube',
    badge: '▶',
    color: '#ff0000',
    url: 'https://www.youtube.com/results?search_query='
  },
  wikipedia: {
    name: 'Wikipédia',
    badge: 'W',
    color: '#6b7280',
    url: 'https://fr.wikipedia.org/wiki/Special:Search?search='
  }
};

// Default French Speed Dial Shortcuts
const DEFAULT_SHORTCUTS = [
  { id: '1', title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
  { id: '2', title: 'Gmail', url: 'https://mail.google.com', icon: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=64' },
  { id: '3', title: 'Discord', url: 'https://discord.com', icon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=64' },
  { id: '4', title: 'GitHub', url: 'https://github.com', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64' },
  { id: '5', title: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64' },
  { id: '6', title: 'Twitch', url: 'https://www.twitch.tv', icon: 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=64' },
  { id: '7', title: 'Leboncoin', url: 'https://www.leboncoin.fr', icon: 'https://www.google.com/s2/favicons?domain=leboncoin.fr&sz=64' },
  { id: '8', title: 'Wikipédia', url: 'https://fr.wikipedia.org', icon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64' },
  { id: '9', title: 'Le Monde', url: 'https://www.lemonde.fr', icon: 'https://www.google.com/s2/favicons?domain=lemonde.fr&sz=64' },
  { id: '10', title: 'Amazon', url: 'https://www.amazon.fr', icon: 'https://www.google.com/s2/favicons?domain=amazon.fr&sz=64' }
];

// Motivational Quotes
const QUOTES = [
  { text: "« La simplicité est la sophistication suprême. »", author: "Léonard de Vinci" },
  { text: "« Le meilleur moyen de prédire l'avenir, c'est de l'inventer. »", author: "Alan Kay" },
  { text: "« Tout ce que l'esprit peut concevoir et croire, il peut l'accomplir. »", author: "Napoleon Hill" },
  { text: "« L'innovation distingue un leader d'un suiveur. »", author: "Steve Jobs" },
  { text: "« Agissez comme s'il était impossible d'échouer. »", author: "Winston Churchill" }
];

// State
let currentEngine = 'google';
let shortcuts = [];
let currentWallpaper = 'sakura-bloom';
let pomoInterval = null;
let pomoSeconds = 25 * 60;
let pomoIsRunning = false;

// Storage Helper (supports chrome.storage.local or localStorage)
const storage = {
  get: (keys, cb) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, cb);
    } else {
      const res = {};
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
          try { res[k] = JSON.parse(val); } catch { res[k] = val; }
        }
      });
      cb(res);
    }
  },
  set: (data, cb) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(data, cb);
    } else {
      Object.keys(data).forEach(k => {
        localStorage.setItem(k, typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]);
      });
      if (cb) cb();
    }
  }
};

// 1. Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSearch();
  initSpeedDial();
  initWidgets();
  initCustomizer();
  initCaustics();
  initPetals();
  loadSavedPreferences();
});

// 2. Real-Time Clock & Dynamic Greeting
function initClock() {
  const clockEl = document.getElementById('clockDisplay');
  const greetingEl = document.getElementById('greetingText');
  const dateEl = document.getElementById('dateDisplay');

  function update() {
    const now = new Date();
    
    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Greeting
    const h = now.getHours();
    if (h >= 5 && h < 12) {
      greetingEl.textContent = 'Bonjour';
    } else if (h >= 12 && h < 18) {
      greetingEl.textContent = 'Bon après-midi';
    } else {
      greetingEl.textContent = 'Bonsoir';
    }

    // Date in French
    const dateStr = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  update();
  setInterval(update, 1000);
}

// 3. Search Engine & Suggestions
function initSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const btnClear = document.getElementById('btnClearSearch');
  const btnVoice = document.getElementById('btnVoiceSearch');
  const suggestionsList = document.getElementById('suggestionsList');
  const btnEngineSelect = document.getElementById('btnEngineSelect');
  const engineMenu = document.getElementById('engineMenu');
  const engineBadge = document.getElementById('engineBadge');
  const engineLabel = document.getElementById('engineLabel');

  const SEARCH_HISTORY_KEY = 'meh_search_history';
  let activeSuggestionIndex = -1;

  // Engine Dropdown toggle
  btnEngineSelect.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
    suggestionsList.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
      engineMenu.classList.add('hidden');
      suggestionsList.classList.add('hidden');
      activeSuggestionIndex = -1;
    }
  });

  // Select Engine
  engineMenu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const eng = item.dataset.engine;
      setEngine(eng);
      engineMenu.classList.add('hidden');
    });
  });

  function setEngine(engKey) {
    if (!SEARCH_ENGINES[engKey]) engKey = 'google';
    currentEngine = engKey;
    const config = SEARCH_ENGINES[engKey];

    engineBadge.textContent = config.badge;
    engineBadge.className = `engine-badge ${engKey}`;
    engineBadge.style.backgroundColor = config.color;
    engineLabel.textContent = config.name;
    searchInput.placeholder = `Rechercher avec ${config.name} ou entrer un site...`;

    storage.set({ meh_search_engine: engKey });
  }

  // Search History Management
  function getSearchHistory(cb) {
    storage.get([SEARCH_HISTORY_KEY], (res) => {
      let history = res[SEARCH_HISTORY_KEY];
      if (!Array.isArray(history) || history.length === 0) {
        history = ['minecraft', 'youtube', 'discord', 'github'];
      }
      cb(history);
    });
  }

  function saveSearchQuery(rawQuery) {
    if (!rawQuery) return;
    const clean = rawQuery.trim();
    if (!clean || clean.length < 2) return;

    getSearchHistory((history) => {
      const filtered = history.filter(h => h.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 15);
      storage.set({ [SEARCH_HISTORY_KEY]: updated });
    });
  }

  function removeSearchHistoryItem(itemToRemove, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    getSearchHistory((history) => {
      const updated = history.filter(h => h.toLowerCase() !== itemToRemove.toLowerCase());
      storage.set({ [SEARCH_HISTORY_KEY]: updated }, () => {
        renderSearchDropdown(searchInput.value.trim());
      });
    });
  }

  function clearAllSearchHistory(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    storage.set({ [SEARCH_HISTORY_KEY]: [] }, () => {
      suggestionsList.classList.add('hidden');
    });
  }

  // Handle Search Submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    // Save search query into history for future suggestions
    saveSearchQuery(query);

    // Check if it is a valid direct URL
    if (query.match(/^(https?:\/\/|[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$)/i)) {
      const url = query.startsWith('http') ? query : `https://${query}`;
      window.location.href = url;
      return;
    }

    const engineUrl = SEARCH_ENGINES[currentEngine].url + encodeURIComponent(query);
    window.location.href = engineUrl;
  });

  // Clear search
  btnClear.addEventListener('click', () => {
    searchInput.value = '';
    btnClear.classList.add('hidden');
    searchInput.focus();
    renderSearchDropdown('');
  });

  // Input events & Suggestions
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    if (val) {
      btnClear.classList.remove('hidden');
    } else {
      btnClear.classList.add('hidden');
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderSearchDropdown(val.trim());
    }, 120);
  });

  // Show recent searches on click / focus even before typing!
  searchInput.addEventListener('focus', () => {
    renderSearchDropdown(searchInput.value.trim());
  });

  searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    renderSearchDropdown(searchInput.value.trim());
  });

  // Keyboard navigation through suggestions (ArrowDown, ArrowUp, Enter, Escape)
  searchInput.addEventListener('keydown', (e) => {
    const items = suggestionsList.querySelectorAll('.suggestion-item');
    if (items.length === 0 || suggestionsList.classList.contains('hidden')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      highlightActiveSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
      highlightActiveSuggestion(items);
    } else if (e.key === 'Escape') {
      suggestionsList.classList.add('hidden');
      activeSuggestionIndex = -1;
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0 && items[activeSuggestionIndex]) {
      e.preventDefault();
      items[activeSuggestionIndex].click();
    }
  });

  function highlightActiveSuggestion(items) {
    items.forEach((item, idx) => {
      if (idx === activeSuggestionIndex) {
        item.classList.add('active');
        const text = item.dataset.query;
        if (text) searchInput.value = text;
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Combined History & Live Suggestions Engine
  function renderSearchDropdown(query) {
    activeSuggestionIndex = -1;

    // CASE 1: Query is empty -> Display recent search history
    if (!query) {
      getSearchHistory((history) => {
        if (!history || history.length === 0) {
          suggestionsList.classList.add('hidden');
          return;
        }

        suggestionsList.innerHTML = '';

        // Header with "Effacer"
        const header = document.createElement('div');
        header.className = 'suggestions-header';
        header.innerHTML = `
          <span>🕒 Vos recherches récentes</span>
          <button type="button" class="suggestions-clear-btn" title="Effacer l'historique">Effacer tout</button>
        `;
        header.querySelector('.suggestions-clear-btn').addEventListener('click', clearAllSearchHistory);
        suggestionsList.appendChild(header);

        // History items
        history.slice(0, 8).forEach(item => {
          const div = document.createElement('div');
          div.className = 'suggestion-item history-item';
          div.dataset.query = item;
          div.innerHTML = `
            <div class="suggestion-left">
              <svg class="suggestion-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="suggestion-text">${escapeHtml(item)}</span>
            </div>
            <button type="button" class="btn-remove-history" title="Supprimer de l'historique">✕</button>
          `;

          div.addEventListener('click', () => {
            searchInput.value = item;
            searchForm.dispatchEvent(new Event('submit'));
          });

          div.querySelector('.btn-remove-history').addEventListener('click', (e) => {
            removeSearchHistoryItem(item, e);
          });

          suggestionsList.appendChild(div);
        });

        suggestionsList.classList.remove('hidden');
      });
      return;
    }

    // CASE 2: User started typing (e.g. "min") -> Match history first, then fetch Google suggestions
    const qLower = query.toLowerCase();

    getSearchHistory(async (history) => {
      // 1. Find matching history items (startsWith first, then includes)
      const matchingHistory = history.filter(h => h.toLowerCase().includes(qLower)).sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(qLower);
        const bStarts = b.toLowerCase().startsWith(qLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.length - b.length;
      });

      // 2. Fetch live Google suggestions
      let liveWebSuggestions = [];
      try {
        const res = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&hl=fr&gl=fr&q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          liveWebSuggestions = data[1] || [];
        }
      } catch {}

      // Deduplicate web suggestions against matching history
      const historySet = new Set(matchingHistory.map(h => h.toLowerCase()));
      const filteredWeb = liveWebSuggestions.filter(s => !historySet.has(s.toLowerCase()));

      const totalItems = [...matchingHistory, ...filteredWeb];
      if (totalItems.length === 0) {
        suggestionsList.classList.add('hidden');
        return;
      }

      suggestionsList.innerHTML = '';

      // Render matching history items (e.g. "minecraft" when typing "min")
      matchingHistory.slice(0, 4).forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item history-item';
        div.dataset.query = item;

        // Highlight matching characters
        const idx = item.toLowerCase().indexOf(qLower);
        let highlighted = escapeHtml(item);
        if (idx >= 0) {
          const before = escapeHtml(item.slice(0, idx));
          const match = escapeHtml(item.slice(idx, idx + query.length));
          const after = escapeHtml(item.slice(idx + query.length));
          highlighted = `${before}<span class="suggestion-match">${match}</span>${after}`;
        }

        div.innerHTML = `
          <div class="suggestion-left">
            <svg class="suggestion-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span class="suggestion-text">${highlighted}</span>
          </div>
          <span class="suggestion-badge">Historique</span>
          <button type="button" class="btn-remove-history" title="Supprimer de l'historique">✕</button>
        `;

        div.addEventListener('click', () => {
          searchInput.value = item;
          searchForm.dispatchEvent(new Event('submit'));
        });

        div.querySelector('.btn-remove-history').addEventListener('click', (e) => {
          removeSearchHistoryItem(item, e);
        });

        suggestionsList.appendChild(div);
      });

      // Render live web suggestions
      const remainingSlots = Math.max(2, 7 - matchingHistory.length);
      filteredWeb.slice(0, remainingSlots).forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.dataset.query = item;

        const idx = item.toLowerCase().indexOf(qLower);
        let highlighted = escapeHtml(item);
        if (idx >= 0) {
          const before = escapeHtml(item.slice(0, idx));
          const match = escapeHtml(item.slice(idx, idx + query.length));
          const after = escapeHtml(item.slice(idx + query.length));
          highlighted = `${before}<span class="suggestion-match">${match}</span>${after}`;
        }

        div.innerHTML = `
          <div class="suggestion-left">
            <svg class="suggestion-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span class="suggestion-text">${highlighted}</span>
          </div>
        `;

        div.addEventListener('click', () => {
          searchInput.value = item;
          searchForm.dispatchEvent(new Event('submit'));
        });

        suggestionsList.appendChild(div);
      });

      suggestionsList.classList.remove('hidden');
    });
  }

  // Voice Search (Speech Recognition)
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'fr-FR';

    btnVoice.addEventListener('click', () => {
      btnVoice.style.color = '#ef4444';
      recognition.start();
    });

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      searchInput.value = transcript;
      btnVoice.style.color = '';
      searchForm.dispatchEvent(new Event('submit'));
    };

    recognition.onerror = () => {
      btnVoice.style.color = '';
    };

    recognition.onend = () => {
      btnVoice.style.color = '';
    };
  } else {
    btnVoice.style.display = 'none';
  }
}

// 4. Speed Dial Shortcuts
function initSpeedDial() {
  const grid = document.getElementById('speedDialGrid');
  const formAdd = document.getElementById('formAddShortcut');
  const modalAdd = document.getElementById('modalAddShortcut');

  function render() {
    grid.innerHTML = '';

    shortcuts.forEach((sc, idx) => {
      const card = document.createElement('a');
      card.href = sc.url;
      card.className = 'speed-dial-card';
      card.title = sc.title;

      card.innerHTML = `
        <div class="speed-dial-icon-box">
          <img src="${sc.icon || `https://www.google.com/s2/favicons?domain=${new URL(sc.url).hostname}&sz=64`}" 
               alt="${sc.title}" 
               class="speed-dial-img"
               onerror="this.src='icons/icon-48.png'">
        </div>
        <span class="speed-dial-title">${escapeHtml(sc.title)}</span>
        <button type="button" class="speed-dial-delete" data-index="${idx}" title="Supprimer">✕</button>
      `;

      // Delete shortcut button
      card.querySelector('.speed-dial-delete').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        shortcuts.splice(idx, 1);
        storage.set({ meh_shortcuts: shortcuts }, render);
      });

      grid.appendChild(card);
    });

    // Add Shortcut Button
    const addCard = document.createElement('div');
    addCard.className = 'speed-dial-card add-shortcut-card';
    addCard.title = 'Ajouter un raccourci';
    addCard.innerHTML = `
      <div class="speed-dial-icon-box">+</div>
      <span class="speed-dial-title">Ajouter</span>
    `;
    addCard.addEventListener('click', () => {
      modalAdd.classList.remove('hidden');
    });
    grid.appendChild(addCard);
  }

  // Handle Add Form
  formAdd.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('shortcutTitle').value.trim();
    let url = document.getElementById('shortcutUrl').value.trim();

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const parsed = new URL(url);
      const icon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
      shortcuts.push({ id: String(Date.now()), title, url, icon });
      storage.set({ meh_shortcuts: shortcuts }, () => {
        modalAdd.classList.add('hidden');
        formAdd.reset();
        render();
      });
    } catch {
      alert('Veuillez entrer une adresse URL valide.');
    }
  });

  // Load shortcuts
  storage.get(['meh_shortcuts'], (res) => {
    shortcuts = res.meh_shortcuts || DEFAULT_SHORTCUTS;
    render();
  });
}

// 5. Glass Widgets: Dock Position, Weather, To-Do, Notes, Pomodoro & Zen Audio
let currentDockPosition = 'right';
let isDockVisible = true;
let zenAudioCtx = null;
let zenSourceNode = null;
let zenGainNode = null;
let currentZenSound = 'sakura';
let isZenPlaying = false;
let todoTasks = [];

function initWidgets() {
  const appLayout = document.querySelector('.app-layout');
  const btnDockLeft = document.getElementById('btnDockLeft');
  const btnDockRight = document.getElementById('btnDockRight');
  const btnToggleWidgets = document.getElementById('btnToggleWidgets');
  const btnSwitchSide = document.getElementById('btnSwitchSide');
  const btnCloseDock = document.getElementById('btnCloseDock');
  const lblDockSide = document.getElementById('lblDockSide');

  // --- Dock Positioning & Visibility ---
  function updateDockClasses() {
    if (!appLayout) return;
    appLayout.classList.remove('dock-left', 'dock-right', 'dock-hidden');
    document.body.classList.remove('dock-left', 'dock-right', 'dock-hidden');

    if (!isDockVisible) {
      appLayout.classList.add('dock-hidden');
      document.body.classList.add('dock-hidden');
    } else {
      appLayout.classList.add(currentDockPosition === 'left' ? 'dock-left' : 'dock-right');
      document.body.classList.add(currentDockPosition === 'left' ? 'dock-left' : 'dock-right');
    }

    if (btnDockLeft) btnDockLeft.classList.toggle('active', isDockVisible && currentDockPosition === 'left');
    if (btnDockRight) btnDockRight.classList.toggle('active', isDockVisible && currentDockPosition === 'right');
    if (lblDockSide) lblDockSide.textContent = currentDockPosition === 'right' ? 'Droite' : 'Gauche';
  }

  function setDockPosition(pos) {
    currentDockPosition = pos;
    isDockVisible = true;
    updateDockClasses();
    storage.set({ meh_widget_position: pos, meh_widgets_visible: true });
  }

  function setDockVisible(visible) {
    isDockVisible = visible;
    updateDockClasses();
    storage.set({ meh_widgets_visible: visible });
  }

  if (btnDockLeft) btnDockLeft.addEventListener('click', () => setDockPosition('left'));
  if (btnDockRight) btnDockRight.addEventListener('click', () => setDockPosition('right'));
  if (btnSwitchSide) btnSwitchSide.addEventListener('click', () => setDockPosition(currentDockPosition === 'right' ? 'left' : 'right'));
  if (btnToggleWidgets) btnToggleWidgets.addEventListener('click', () => setDockVisible(!isDockVisible));
  if (btnCloseDock) btnCloseDock.addEventListener('click', () => setDockVisible(false));

  // Initialize dock with default Right
  updateDockClasses();

  // --- Live Weather Widget ---
  initWeatherWidget();

  // --- Interactive To-Do List ---
  initTodoList();

  // --- Quick Notes with Auto-Save ---
  initQuickNotes();

  // --- Pomodoro Timer ---
  initPomodoroTimer();

  // --- Zen Lo-Fi Nature Audio ---
  initZenAudio();

  // --- Inspirational Quotes ---
  initQuotes();
}

// 5.1 Weather Controller
function initWeatherWidget() {
  const cities = {
    'Paris': { lat: 48.8566, lon: 2.3522 },
    'Marseille': { lat: 43.2965, lon: 5.3698 },
    'Lyon': { lat: 45.7640, lon: 4.8357 },
    'Tokyo': { lat: 35.6762, lon: 139.6503 },
    'New York': { lat: 40.7128, lon: -74.0060 },
    'Montréal': { lat: 45.5017, lon: -73.5673 }
  };

  const weatherPill = document.getElementById('weatherPill');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherCity = document.getElementById('weatherCity');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherMainTemp = document.getElementById('weatherMainTemp');
  const weatherMainCity = document.getElementById('weatherMainCity');
  const weatherMainIcon = document.getElementById('weatherMainIcon');
  const weatherConditionText = document.getElementById('weatherConditionText');
  const weatherFeel = document.getElementById('weatherFeel');
  const weatherHumidity = document.getElementById('weatherHumidity');
  const weatherWind = document.getElementById('weatherWind');

  function getWeatherDesc(code) {
    if (code === 0) return { text: 'Ciel dégagé', icon: '☀️' };
    if (code <= 3) return { text: 'Éclaircies douces', icon: '⛅' };
    if (code <= 48) return { text: 'Brumes légères', icon: '🌫️' };
    if (code <= 55) return { text: 'Bruine fine', icon: '🌦️' };
    if (code <= 67) return { text: 'Pluie douce', icon: '🌧️' };
    if (code <= 77) return { text: 'Chute de neige', icon: '❄️' };
    if (code <= 82) return { text: 'Averses', icon: '🌧️' };
    return { text: 'Orage passager', icon: '⛈️' };
  }

  function fetchCityWeather(cityName) {
    const coords = cities[cityName] || cities['Paris'];
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature&timezone=auto`)
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const wind = Math.round(data.current_weather.windspeed);
          const code = data.current_weather.weathercode;
          const { text, icon } = getWeatherDesc(code);

          let humidity = 55;
          let feel = temp;
          if (data.hourly) {
            humidity = data.hourly.relativehumidity_2m?.[0] || 55;
            feel = Math.round(data.hourly.apparent_temperature?.[0] ?? temp);
          }

          if (weatherTemp) weatherTemp.textContent = `${temp}°C`;
          if (weatherCity) weatherCity.textContent = cityName;
          if (weatherIcon) weatherIcon.textContent = icon;
          if (weatherMainTemp) weatherMainTemp.textContent = `${temp}°C`;
          if (weatherMainCity) weatherMainCity.textContent = cityName;
          if (weatherMainIcon) weatherMainIcon.textContent = icon;
          if (weatherConditionText) weatherConditionText.textContent = text;
          if (weatherFeel) weatherFeel.textContent = `Ressenti ${feel}°C`;
          if (weatherHumidity) weatherHumidity.textContent = `${humidity}%`;
          if (weatherWind) weatherWind.textContent = `${wind} km/h`;

          document.querySelectorAll('.city-chip').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.city === cityName);
          });
          storage.set({ meh_weather_city: cityName });
        }
      })
      .catch(() => {
        if (weatherMainTemp) weatherMainTemp.textContent = '20°C';
      });
  }

  // Bind city chips
  document.querySelectorAll('.city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      fetchCityWeather(chip.dataset.city);
    });
  });

  if (weatherPill) {
    weatherPill.addEventListener('click', () => {
      setDockVisible(true);
    });
  }

  // Load saved city or default Paris
  storage.get(['meh_weather_city'], (res) => {
    const saved = res.meh_weather_city || 'Paris';
    fetchCityWeather(saved);
  });
}

// 5.2 Interactive To-Do List Controller
function initTodoList() {
  const todoForm = document.getElementById('todoForm');
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  const todoCountBadge = document.getElementById('todoCountBadge');
  const btnClearCompleted = document.getElementById('btnClearCompleted');

  function renderTodos() {
    if (!todoList) return;
    todoList.innerHTML = '';
    const pending = todoTasks.filter(t => !t.done).length;
    if (todoCountBadge) {
      todoCountBadge.textContent = `${pending} à faire`;
    }

    if (todoTasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'text-xs text-white/50 text-center py-2';
      empty.textContent = 'Aucune tâche. Ajoutez-en une !';
      todoList.appendChild(empty);
      return;
    }

    todoTasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = `todo-item ${t.done ? 'completed' : ''}`;
      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${t.done ? 'checked' : ''} data-index="${i}">
        <span class="flex-1 truncate">${escapeHtml(t.text)}</span>
        <button type="button" class="todo-del-btn" data-index="${i}" title="Supprimer">✕</button>
      `;

      li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
        todoTasks[i].done = e.target.checked;
        saveTodos();
      });

      li.querySelector('.todo-del-btn').addEventListener('click', () => {
        todoTasks.splice(i, 1);
        saveTodos();
      });

      todoList.appendChild(li);
    });
  }

  function saveTodos() {
    storage.set({ meh_todo_tasks: todoTasks }, renderTodos);
  }

  if (todoForm && todoInput) {
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = todoInput.value.trim();
      if (!val) return;
      todoTasks.unshift({ id: String(Date.now()), text: val, done: false });
      todoInput.value = '';
      saveTodos();
    });
  }

  if (btnClearCompleted) {
    btnClearCompleted.addEventListener('click', () => {
      todoTasks = todoTasks.filter(t => !t.done);
      saveTodos();
    });
  }

  // Load saved tasks
  storage.get(['meh_todo_tasks'], (res) => {
    todoTasks = res.meh_todo_tasks || [
      { id: '1', text: 'Profiter du design Liquid Glass 🌸', done: true },
      { id: '2', text: 'Découvrir les widgets personnalisables', done: false }
    ];
    renderTodos();
  });
}

// 5.3 Quick Notes Controller
function initQuickNotes() {
  const noteInput = document.getElementById('quickNoteInput');
  const noteBadge = document.getElementById('noteSavedBadge');
  const noteCharCount = document.getElementById('noteCharCount');

  if (!noteInput) return;

  function updateCharCount() {
    if (noteCharCount) {
      noteCharCount.textContent = `${noteInput.value.length} caractères`;
    }
  }

  storage.get(['meh_quick_note'], (res) => {
    if (res.meh_quick_note) {
      noteInput.value = res.meh_quick_note;
    } else {
      noteInput.value = '🌸 Bienvenue sur MEH Browser Liquid Glass ! Notez ici vos idées, inspirations et liens essentiels.';
    }
    updateCharCount();
  });

  let timer;
  noteInput.addEventListener('input', () => {
    updateCharCount();
    clearTimeout(timer);
    if (noteBadge) noteBadge.classList.add('hidden');
    timer = setTimeout(() => {
      storage.set({ meh_quick_note: noteInput.value }, () => {
        if (noteBadge) {
          noteBadge.classList.remove('hidden');
          setTimeout(() => noteBadge.classList.add('hidden'), 2000);
        }
      });
    }, 400);
  });
}

// 5.4 Pomodoro Timer Controller
function initPomodoroTimer() {
  const pomoTimeEl = document.getElementById('pomoTime');
  const btnStart = document.getElementById('pomoBtnStart');
  const btnReset = document.getElementById('pomoBtnReset');
  const pomoStatus = document.getElementById('pomoStatus');
  const pomoMode25 = document.getElementById('pomoMode25');
  const pomoMode5 = document.getElementById('pomoMode5');

  if (!pomoTimeEl || !btnStart) return;

  let maxSeconds = 25 * 60;
  pomoSeconds = maxSeconds;

  function updateDisplay() {
    const m = Math.floor(pomoSeconds / 60);
    const s = pomoSeconds % 60;
    pomoTimeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function setMode(seconds, label) {
    clearInterval(pomoInterval);
    pomoIsRunning = false;
    maxSeconds = seconds;
    pomoSeconds = seconds;
    updateDisplay();
    btnStart.textContent = 'Démarrer';
    btnStart.classList.add('active-pill');
    if (pomoStatus) pomoStatus.textContent = label;
  }

  if (pomoMode25) {
    pomoMode25.addEventListener('click', () => {
      pomoMode25.classList.add('active');
      if (pomoMode5) pomoMode5.classList.remove('active');
      setMode(25 * 60, 'Session 25m');
    });
  }

  if (pomoMode5) {
    pomoMode5.addEventListener('click', () => {
      pomoMode5.classList.add('active');
      if (pomoMode25) pomoMode25.classList.remove('active');
      setMode(5 * 60, 'Pause 5m');
    });
  }

  btnStart.addEventListener('click', () => {
    if (pomoIsRunning) {
      clearInterval(pomoInterval);
      pomoIsRunning = false;
      btnStart.textContent = 'Reprendre';
      btnStart.classList.remove('active-pill');
      if (pomoStatus) pomoStatus.textContent = 'En pause';
    } else {
      pomoIsRunning = true;
      btnStart.textContent = 'Pause';
      btnStart.classList.add('active-pill');
      if (pomoStatus) pomoStatus.textContent = 'En cours...';

      pomoInterval = setInterval(() => {
        if (pomoSeconds > 0) {
          pomoSeconds--;
          updateDisplay();
        } else {
          clearInterval(pomoInterval);
          pomoIsRunning = false;
          btnStart.textContent = 'Démarrer';
          if (pomoStatus) pomoStatus.textContent = 'Terminé ! 🎉';
          playBeep();
        }
      }, 1000);
    }
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      clearInterval(pomoInterval);
      pomoIsRunning = false;
      pomoSeconds = maxSeconds;
      updateDisplay();
      btnStart.textContent = 'Démarrer';
      btnStart.classList.add('active-pill');
      if (pomoStatus) pomoStatus.textContent = maxSeconds === 25 * 60 ? 'Session 25m' : 'Pause 5m';
    });
  }
}

// 5.5 Zen Lo-Fi & Ambient Sound Synthesis (Pure Web Audio)
function initZenAudio() {
  const btnToggle = document.getElementById('btnToggleZenAudio');
  const zenStatus = document.getElementById('zenAudioStatus');
  const volumeSlider = document.getElementById('zenVolumeSlider');
  const soundButtons = document.querySelectorAll('.zen-btn');

  function startZenAudio() {
    try {
      if (!zenAudioCtx) {
        zenAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (zenAudioCtx.state === 'suspended') {
        zenAudioCtx.resume();
      }

      // Generate a buffer of calming colored noise
      const bufferSize = zenAudioCtx.sampleRate * 2;
      const noiseBuffer = zenAudioCtx.createBuffer(1, bufferSize, zenAudioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      zenSourceNode = zenAudioCtx.createBufferSource();
      zenSourceNode.buffer = noiseBuffer;
      zenSourceNode.loop = true;

      // Filter to simulate sound type
      const filter = zenAudioCtx.createBiquadFilter();
      if (currentZenSound === 'sakura') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, zenAudioCtx.currentTime);
      } else if (currentZenSound === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, zenAudioCtx.currentTime);
        filter.Q.setValueAtTime(1.2, zenAudioCtx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, zenAudioCtx.currentTime);
      }

      zenGainNode = zenAudioCtx.createGain();
      const vol = volumeSlider ? volumeSlider.value / 100 : 0.4;
      zenGainNode.gain.setValueAtTime(vol * 0.15, zenAudioCtx.currentTime);

      zenSourceNode.connect(filter);
      filter.connect(zenGainNode);
      zenGainNode.connect(zenAudioCtx.destination);
      zenSourceNode.start();

      isZenPlaying = true;
      if (btnToggle) btnToggle.textContent = '⏸ Pause';
      if (zenStatus) zenStatus.textContent = 'En lecture';
    } catch {}
  }

  function stopZenAudio() {
    if (zenSourceNode) {
      try { zenSourceNode.stop(); } catch {}
      zenSourceNode.disconnect();
      zenSourceNode = null;
    }
    isZenPlaying = false;
    if (btnToggle) btnToggle.textContent = '▶ Écouter';
    if (zenStatus) zenStatus.textContent = 'Arrêté';
  }

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      if (isZenPlaying) stopZenAudio();
      else startZenAudio();
    });
  }

  soundButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      soundButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentZenSound = btn.dataset.sound;
      if (isZenPlaying) {
        stopZenAudio();
        startZenAudio();
      }
    });
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      if (zenGainNode && zenAudioCtx) {
        zenGainNode.gain.setValueAtTime((volumeSlider.value / 100) * 0.15, zenAudioCtx.currentTime);
      }
    });
  }
}

// 5.6 Quotes Controller
function initQuotes() {
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const btnNewQuote = document.getElementById('btnNewQuote');

  function nextQuote() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    if (quoteText) quoteText.textContent = q.text;
    if (quoteAuthor) quoteAuthor.textContent = `— ${q.author}`;
  }

  if (btnNewQuote) {
    btnNewQuote.addEventListener('click', nextQuote);
  }
}

// 7. Customizer & Wallpapers
function initCustomizer() {
  const modal = document.getElementById('modalCustomize');
  const btnCustomize = document.getElementById('btnCustomize');
  const bgContainer = document.getElementById('bgContainer');
  const blurSlider = document.getElementById('blurSlider');
  const blurVal = document.getElementById('blurVal');
  const btnApplyCustomWp = document.getElementById('btnApplyCustomWp');
  const customWpUrl = document.getElementById('customWpUrl');
  const btnQuickWp = document.getElementById('btnQuickWallpaper');

  btnCustomize.addEventListener('click', () => modal.classList.remove('hidden'));

  // Close modals
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.close;
      document.getElementById(targetId).classList.add('hidden');
    });
  });

  // Wallpaper Cards
  const wpPresets = {
    'sakura-bloom': 'url("wallpapers/sakura-bloom.jpg") center/cover no-repeat',
    'liquid-glass': 'linear-gradient(135deg, #091236 0%, #1e215d 50%, #20002c 100%)',
    'aurora-drift': 'linear-gradient(135deg, #051923 0%, #003554 40%, #006466 80%, #0b525b 100%)',
    'sunset-prism': 'linear-gradient(135deg, #2b0938 0%, #681a53 45%, #b83c50 85%, #f16853 100%)',
    'deep-cosmos': 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
    'cyberpunk': 'linear-gradient(135deg, #130026 0%, #30004a 50%, #00385c 100%)',
    'obsidian': '#0c0f17'
  };

  function applyWallpaper(wpKey, customUrl = null) {
    currentWallpaper = wpKey;
    document.querySelectorAll('.wp-card').forEach(c => {
      c.classList.toggle('active', c.dataset.wp === wpKey);
    });

    if (customUrl) {
      bgContainer.style.backgroundImage = `url('${customUrl}')`;
      bgContainer.style.background = `url('${customUrl}') center/cover no-repeat`;
      storage.set({ meh_wallpaper: 'custom', meh_custom_wp_url: customUrl });
    } else {
      bgContainer.style.background = wpPresets[wpKey] || wpPresets['sakura-bloom'];
      storage.set({ meh_wallpaper: wpKey });
    }
  }

  document.querySelectorAll('.wp-card').forEach(card => {
    card.addEventListener('click', () => {
      applyWallpaper(card.dataset.wp);
    });
  });

  btnApplyCustomWp.addEventListener('click', () => {
    const url = customWpUrl.value.trim();
    if (url) {
      applyWallpaper('custom', url);
      modal.classList.add('hidden');
    }
  });

  // Random wallpaper button
  const presetKeys = Object.keys(wpPresets);
  btnQuickWp.addEventListener('click', () => {
    const next = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    applyWallpaper(next);
  });

  // Blur Slider
  blurSlider.addEventListener('input', () => {
    const val = `${blurSlider.value}px`;
    blurVal.textContent = val;
    document.documentElement.style.setProperty('--glass-blur', val);
    storage.set({ meh_glass_blur: blurSlider.value });
  });
}

// 8. Mouse Caustics Effect
function initCaustics() {
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }, { passive: true });
}

// 9. Load Saved Preferences
function loadSavedPreferences() {
  storage.get(['meh_search_engine', 'meh_wallpaper', 'meh_custom_wp_url', 'meh_glass_blur', 'meh_widgets_visible', 'meh_widget_position'], (res) => {
    if (res.meh_search_engine) {
      const event = new CustomEvent('changeEngine', { detail: res.meh_search_engine });
      const item = document.querySelector(`.menu-item[data-engine="${res.meh_search_engine}"]`);
      if (item) item.click();
    }

    if (res.meh_wallpaper === 'custom' && res.meh_custom_wp_url) {
      document.getElementById('bgContainer').style.background = `url('${res.meh_custom_wp_url}') center/cover no-repeat`;
    } else if (res.meh_wallpaper) {
      const card = document.querySelector(`.wp-card[data-wp="${res.meh_wallpaper}"]`);
      if (card) card.click();
    }

    if (res.meh_glass_blur) {
      document.getElementById('blurSlider').value = res.meh_glass_blur;
      document.getElementById('blurVal').textContent = `${res.meh_glass_blur}px`;
      document.documentElement.style.setProperty('--glass-blur', `${res.meh_glass_blur}px`);
    }

    if (res.meh_widget_position) {
      currentDockPosition = res.meh_widget_position;
    }
    if (res.meh_widgets_visible !== undefined) {
      isDockVisible = res.meh_widgets_visible;
    }

    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
      appLayout.classList.remove('dock-left', 'dock-right', 'dock-hidden');
      document.body.classList.remove('dock-left', 'dock-right', 'dock-hidden');
      if (!isDockVisible) {
        appLayout.classList.add('dock-hidden');
        document.body.classList.add('dock-hidden');
      } else {
        appLayout.classList.add(currentDockPosition === 'left' ? 'dock-left' : 'dock-right');
        document.body.classList.add(currentDockPosition === 'left' ? 'dock-left' : 'dock-right');
      }
      const btnDockLeft = document.getElementById('btnDockLeft');
      const btnDockRight = document.getElementById('btnDockRight');
      const lblDockSide = document.getElementById('lblDockSide');
      if (btnDockLeft) btnDockLeft.classList.toggle('active', isDockVisible && currentDockPosition === 'left');
      if (btnDockRight) btnDockRight.classList.toggle('active', isDockVisible && currentDockPosition === 'right');
      if (lblDockSide) lblDockSide.textContent = currentDockPosition === 'right' ? 'Droite' : 'Gauche';
    }
  });
}

// Utility: Beep on Pomodoro completion
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Falling Sakura Petals Animation
function initPetals() {
  const canvas = document.getElementById('petalsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = [
    'rgba(255, 183, 197, 0.85)',
    'rgba(255, 192, 203, 0.8)',
    'rgba(255, 218, 224, 0.75)',
    'rgba(244, 114, 182, 0.7)',
  ];

  const petals = [];
  for (let i = 0; i < 20; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1.2 + 0.4,
      speedY: Math.random() * 1.5 + 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.4 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.6;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
      if (p.x > width + 20) { p.x = -20; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size / 2, p.size / 2, 0, p.size);
      ctx.bezierCurveTo(p.size / 2, p.size / 2, p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(render);
  }
  render();
}

