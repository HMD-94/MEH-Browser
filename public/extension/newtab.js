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

  // Engine Dropdown toggle
  btnEngineSelect.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    engineMenu.classList.add('hidden');
    suggestionsList.classList.add('hidden');
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

  // Handle Search Submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

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
    suggestionsList.classList.add('hidden');
    searchInput.focus();
  });

  // Input events & Suggestions
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    if (val) {
      btnClear.classList.remove('hidden');
    } else {
      btnClear.classList.add('hidden');
      suggestionsList.classList.add('hidden');
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchSuggestions(val);
    }, 150);
  });

  // Live Suggestions from Google Suggest API
  async function fetchSuggestions(query) {
    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&hl=fr&gl=fr&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const suggestions = data[1] || [];
        renderSuggestions(suggestions);
      }
    } catch {
      suggestionsList.classList.add('hidden');
    }
  }

  function renderSuggestions(list) {
    if (!list || list.length === 0) {
      suggestionsList.classList.add('hidden');
      return;
    }

    suggestionsList.innerHTML = '';
    list.slice(0, 6).forEach(item => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>${escapeHtml(item)}</span>
      `;
      div.addEventListener('click', () => {
        searchInput.value = item;
        searchForm.dispatchEvent(new Event('submit'));
      });
      suggestionsList.appendChild(div);
    });

    suggestionsList.classList.remove('hidden');
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

// 5. Glass Widgets: Weather, Notes, Pomodoro
function initWidgets() {
  const btnToggleWidgets = document.getElementById('btnToggleWidgets');
  const widgetsDock = document.getElementById('widgetsDock');

  btnToggleWidgets.addEventListener('click', () => {
    widgetsDock.classList.toggle('hidden');
    storage.set({ meh_widgets_visible: !widgetsDock.classList.contains('hidden') });
  });

  // Weather (Open-Meteo)
  loadLiveWeather();

  // Quick Notes with Auto-Save
  const noteInput = document.getElementById('quickNoteInput');
  const noteBadge = document.getElementById('noteSavedBadge');

  storage.get(['meh_quick_note'], (res) => {
    if (res.meh_quick_note) {
      noteInput.value = res.meh_quick_note;
    }
  });

  let noteTimer;
  noteInput.addEventListener('input', () => {
    clearTimeout(noteTimer);
    noteBadge.classList.add('hidden');
    noteTimer = setTimeout(() => {
      storage.set({ meh_quick_note: noteInput.value }, () => {
        noteBadge.classList.remove('hidden');
        setTimeout(() => noteBadge.classList.add('hidden'), 2000);
      });
    }, 500);
  });

  // Pomodoro Timer
  const pomoTimeEl = document.getElementById('pomoTime');
  const btnStart = document.getElementById('pomoBtnStart');
  const btnReset = document.getElementById('pomoBtnReset');
  const pomoStatus = document.getElementById('pomoStatus');

  function updatePomoDisplay() {
    const m = Math.floor(pomoSeconds / 60);
    const s = pomoSeconds % 60;
    pomoTimeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  btnStart.addEventListener('click', () => {
    if (pomoIsRunning) {
      // Pause
      clearInterval(pomoInterval);
      pomoIsRunning = false;
      btnStart.textContent = 'Reprendre';
      btnStart.classList.remove('active-pill');
      pomoStatus.textContent = 'En pause';
    } else {
      // Start
      pomoIsRunning = true;
      btnStart.textContent = 'Pause';
      btnStart.classList.add('active-pill');
      pomoStatus.textContent = 'En cours...';

      pomoInterval = setInterval(() => {
        if (pomoSeconds > 0) {
          pomoSeconds--;
          updatePomoDisplay();
        } else {
          clearInterval(pomoInterval);
          pomoIsRunning = false;
          btnStart.textContent = 'Démarrer';
          pomoStatus.textContent = 'Terminé ! 🎉';
          playBeep();
        }
      }, 1000);
    }
  });

  btnReset.addEventListener('click', () => {
    clearInterval(pomoInterval);
    pomoIsRunning = false;
    pomoSeconds = 25 * 60;
    updatePomoDisplay();
    btnStart.textContent = 'Démarrer';
    btnStart.classList.add('active-pill');
    pomoStatus.textContent = 'Session 25m';
  });

  // Quote
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quoteText').textContent = randomQuote.text;
  document.getElementById('quoteAuthor').textContent = `— ${randomQuote.author}`;
}

// 6. Live Weather via Open-Meteo
function loadLiveWeather() {
  const tempEl = document.getElementById('weatherTemp');
  const cityEl = document.getElementById('weatherCity');
  const iconEl = document.getElementById('weatherIcon');

  function fetchWeather(lat, lon, cityName) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(r => r.json())
      .then(d => {
        if (d.current_weather) {
          const temp = Math.round(d.current_weather.temperature);
          tempEl.textContent = `${temp}°C`;
          cityEl.textContent = cityName;

          // Simple code to icon
          const code = d.current_weather.weathercode;
          if (code === 0) iconEl.textContent = '☀️';
          else if (code <= 3) iconEl.textContent = '⛅';
          else if (code <= 67) iconEl.textContent = '🌧️';
          else if (code <= 77) iconEl.textContent = '❄️';
          else iconEl.textContent = '⛈️';
        }
      })
      .catch(() => {
        tempEl.textContent = '20°C';
      });
  }

  // Geolocation or Paris fallback
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Local'),
      () => fetchWeather(48.8566, 2.3522, 'Paris')
    );
  } else {
    fetchWeather(48.8566, 2.3522, 'Paris');
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
  storage.get(['meh_search_engine', 'meh_wallpaper', 'meh_custom_wp_url', 'meh_glass_blur', 'meh_widgets_visible'], (res) => {
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

    if (res.meh_widgets_visible === false) {
      document.getElementById('widgetsDock').classList.add('hidden');
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

