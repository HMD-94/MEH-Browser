// ==========================================================================
// MEH BROWSER - CONTENT SCRIPT FOR SEARCH ENGINE PAGES (GOOGLE, ETC.)
// Injects Sakura 4K wallpaper, Liquid Glass styling & Interactive Widgets Dock
// ==========================================================================

(() => {
  // Avoid duplicate injection
  if (window.__MEH_BROWSER_INJECTED__) return;
  window.__MEH_BROWSER_INJECTED__ = true;

  // Configuration & Defaults
  let dockPosition = 'right'; // 'left' or 'right'
  let isDockOpen = true;
  let petalsEnabled = true;
  let activeWallpaper = 'sakura-bloom.jpg';

  // Extract query from Google / search URL
  const searchUrlParams = new URLSearchParams(window.location.search);
  const currentQuery = searchUrlParams.get('q') || '';

  // 1. INJECT WALLPAPER & OVERLAY
  function injectWallpaper() {
    const bg = document.createElement('div');
    bg.id = 'meh-wallpaper-backdrop';
    
    // Default to Sakura Bloom
    const sakuraUrl = chrome.runtime.getURL('wallpapers/sakura-bloom.jpg');
    bg.style.backgroundImage = `url("${sakuraUrl}")`;

    const overlay = document.createElement('div');
    overlay.id = 'meh-wallpaper-overlay';

    document.documentElement.appendChild(bg);
    document.documentElement.appendChild(overlay);

    // Read saved wallpaper if exists
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['meh_wallpaper'], (res) => {
        if (res && res.meh_wallpaper) {
          const wp = res.meh_wallpaper;
          if (wp === 'liquid-glass') {
            bg.style.backgroundImage = `url("${chrome.runtime.getURL('wallpapers/liquid-glass.jpg')}")`;
          } else if (wp === 'aurora-drift') {
            bg.style.backgroundImage = `url("${chrome.runtime.getURL('wallpapers/aurora-drift.jpg')}")`;
          } else if (wp === 'sunset-prism') {
            bg.style.backgroundImage = `url("${chrome.runtime.getURL('wallpapers/sunset-prism.jpg')}")`;
          } else if (wp.startsWith('http') || wp.startsWith('data:')) {
            bg.style.backgroundImage = `url("${wp}")`;
          }
        }
      });
    }
  }

  // 2. INJECT ANIMATED SAKURA PETALS
  function injectPetals() {
    const canvas = document.createElement('canvas');
    canvas.id = 'meh-petals-canvas';
    document.documentElement.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const petalCount = 22;
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 4 + Math.random() * 6,
        d: Math.random() * petalCount,
        a: Math.random() * 360,
        swaySpeed: 0.02 + Math.random() * 0.03,
        fallSpeed: 0.8 + Math.random() * 1.4,
        color: Math.random() > 0.4 ? 'rgba(255, 183, 197, 0.65)' : 'rgba(255, 218, 224, 0.55)',
      });
    }

    let animId = null;
    function draw() {
      if (!petalsEnabled) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < petalCount; i++) {
        const p = petals[i];
        p.a += p.swaySpeed;
        p.y += p.fallSpeed;
        p.x += Math.sin(p.a) * 0.8;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.a * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 1.8, (Math.PI / 4), 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
  }

  // 3. INJECT FLOATING QUICK TOOLBAR
  function injectTopBar() {
    const topBar = document.createElement('div');
    topBar.id = 'meh-floating-topbar';

    const newTabUrl = chrome.runtime.getURL('newtab.html');

    topBar.innerHTML = `
      <a href="${newTabUrl}" class="meh-top-btn primary" title="Retourner à l'accueil Liquid Glass MEH Browser">
        <span>🌸</span>
        <span>MEH Browser</span>
      </a>
      <button type="button" id="meh-btn-toggle-widgets" class="meh-top-btn" title="Afficher / Masquer les widgets Liquid Glass">
        <span>✨</span>
        <span id="meh-btn-w-label">Widgets</span>
      </button>
      <button type="button" id="meh-btn-toggle-petals" class="meh-top-btn" title="Activer / Désactiver les pétales Sakura">
        <span>🌸</span>
      </button>
      ${currentQuery ? `
        <div style="display: flex; gap: 4px; margin-left: 4px;">
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(currentQuery)}" class="meh-top-btn" title="Rechercher sur YouTube" style="padding: 6px 8px; color: #ff6b6b;">
            ▶ YT
          </a>
          <a href="https://fr.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(currentQuery)}" class="meh-top-btn" title="Rechercher sur Wikipédia" style="padding: 6px 8px;">
            W
          </a>
        </div>
      ` : ''}
    `;

    document.documentElement.appendChild(topBar);

    // Event listeners
    document.getElementById('meh-btn-toggle-widgets').addEventListener('click', toggleDock);
    document.getElementById('meh-btn-toggle-petals').addEventListener('click', () => {
      petalsEnabled = !petalsEnabled;
      const canvas = document.getElementById('meh-petals-canvas');
      if (canvas) canvas.style.display = petalsEnabled ? 'block' : 'none';
    });
  }

  // 4. INJECT LIQUID GLASS WIDGET DOCK
  function injectDock() {
    const dock = document.createElement('aside');
    dock.id = 'meh-search-dock';
    dock.className = `${dockPosition === 'left' ? 'dock-left' : 'dock-right'}`;

    dock.innerHTML = `
      <div class="meh-dock-head">
        <div class="meh-dock-title">
          <span>✨ Liquid Glass</span>
          <span style="font-size: 11px; color: #94a3b8; font-weight: normal;">MEH Widgets</span>
        </div>
        <div class="meh-dock-ctrls">
          <button type="button" id="meh-dock-switch-side" class="meh-dock-icon-btn" title="Déplacer à gauche ou à droite">
            ⇄ <span id="meh-dock-side-text">${dockPosition === 'right' ? 'Droite' : 'Gauche'}</span>
          </button>
          <button type="button" id="meh-dock-close" class="meh-dock-icon-btn" title="Fermer" style="font-size: 13px;">✕</button>
        </div>
      </div>

      <div class="meh-dock-scroll">
        <!-- Widget 1: Real-time Clock -->
        <div class="meh-w-card">
          <div class="meh-w-top">
            <span class="meh-w-name">🕒 Horloge & Date</span>
            <span class="meh-w-badge">En direct</span>
          </div>
          <div id="meh-w-time" class="meh-w-clock">--:--:--</div>
          <div id="meh-w-date" class="meh-w-date">Chargement...</div>
        </div>

        <!-- Widget 2: Live Weather -->
        <div class="meh-w-card">
          <div class="meh-w-top">
            <span class="meh-w-name">🌤️ Météo</span>
            <span class="meh-w-badge">Paris</span>
          </div>
          <div class="meh-w-weather-row">
            <div>
              <div class="meh-w-weather-temp">19°C</div>
              <div class="meh-w-weather-desc">Éclaircies agréables</div>
            </div>
            <div style="font-size: 32px;">⛅</div>
          </div>
        </div>

        <!-- Widget 3: Interactive Pomodoro Focus -->
        <div class="meh-w-card">
          <div class="meh-w-top">
            <span class="meh-w-name">⏱️ Minuteur Focus</span>
            <span id="meh-pomo-status" class="meh-w-badge">Session</span>
          </div>
          <div class="meh-pomo-box">
            <div id="meh-pomo-timer" class="meh-pomo-digits">25:00</div>
            <div style="display: flex; gap: 6px;">
              <button type="button" id="meh-pomo-btn-toggle" class="meh-pomo-btn">Démarrer</button>
              <button type="button" id="meh-pomo-btn-reset" class="meh-pomo-btn" style="background: rgba(255,255,255,0.1);">↺</button>
            </div>
          </div>
        </div>

        <!-- Widget 4: Quick Notes (synced with extension storage) -->
        <div class="meh-w-card">
          <div class="meh-w-top">
            <span class="meh-w-name">📝 Bloc-Notes Rapide</span>
            <span id="meh-note-saved" class="meh-w-badge" style="opacity: 0; transition: opacity 0.3s;">Enregistré ✓</span>
          </div>
          <textarea id="meh-quick-note" class="meh-note-area" placeholder="Notez une idée, un mémo ou une info importante..."></textarea>
        </div>

        <!-- Widget 5: Speed Dial Favorites -->
        <div class="meh-w-card">
          <div class="meh-w-top">
            <span class="meh-w-name">⚡ Raccourcis Rapides</span>
          </div>
          <div class="meh-shortcuts-strip">
            <a href="https://www.youtube.com" target="_blank" class="meh-sc-chip">
              <span style="font-size: 16px;">▶</span>
              <span>YouTube</span>
            </a>
            <a href="https://discord.com" target="_blank" class="meh-sc-chip">
              <span style="font-size: 16px;">💬</span>
              <span>Discord</span>
            </a>
            <a href="https://github.com" target="_blank" class="meh-sc-chip">
              <span style="font-size: 16px;">🐙</span>
              <span>GitHub</span>
            </a>
            <a href="https://reddit.com" target="_blank" class="meh-sc-chip">
              <span style="font-size: 16px;">🤖</span>
              <span>Reddit</span>
            </a>
          </div>
        </div>

        <!-- Widget 6: Inspiring Quote -->
        <div class="meh-w-card" style="border-left: 3px solid #f472b6;">
          <p style="font-size: 12px; font-style: italic; color: #f1f5f9; margin: 0 0 4px 0; line-height: 1.5;">
            « Le meilleur moyen de prédire l'avenir, c'est de l'inventer. »
          </p>
          <span style="font-size: 10px; color: #f472b6; font-weight: 600;">— Alan Kay</span>
        </div>
      </div>
    `;

    document.documentElement.appendChild(dock);

    // Initial positioning state
    applyDockState();

    // Event Listeners
    document.getElementById('meh-dock-close').addEventListener('click', toggleDock);
    document.getElementById('meh-dock-switch-side').addEventListener('click', toggleSide);

    // Init Clock
    initDockClock();

    // Init Pomodoro
    initDockPomodoro();

    // Init Quick Notes
    initDockNotes();
  }

  // Clock in Dock
  function initDockClock() {
    const timeEl = document.getElementById('meh-w-time');
    const dateEl = document.getElementById('meh-w-date');
    if (!timeEl || !dateEl) return;

    function update() {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('fr-FR');
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

  // Pomodoro
  let pomoSeconds = 25 * 60;
  let pomoRunning = false;
  let pomoInterval = null;

  function initDockPomodoro() {
    const timerEl = document.getElementById('meh-pomo-timer');
    const btnToggle = document.getElementById('meh-pomo-btn-toggle');
    const btnReset = document.getElementById('meh-pomo-btn-reset');
    const statusEl = document.getElementById('meh-pomo-status');

    function renderTime() {
      const m = String(Math.floor(pomoSeconds / 60)).padStart(2, '0');
      const s = String(pomoSeconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }

    btnToggle.addEventListener('click', () => {
      if (pomoRunning) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        btnToggle.textContent = 'Reprendre';
        statusEl.textContent = 'En pause';
      } else {
        pomoRunning = true;
        btnToggle.textContent = 'Pause';
        statusEl.textContent = 'Focus';
        pomoInterval = setInterval(() => {
          if (pomoSeconds > 0) {
            pomoSeconds--;
            renderTime();
          } else {
            clearInterval(pomoInterval);
            pomoRunning = false;
            btnToggle.textContent = 'Recommencer';
            statusEl.textContent = 'Terminé ! 🔔';
            pomoSeconds = 25 * 60;
            renderTime();
          }
        }, 1000);
      }
    });

    btnReset.addEventListener('click', () => {
      clearInterval(pomoInterval);
      pomoRunning = false;
      pomoSeconds = 25 * 60;
      btnToggle.textContent = 'Démarrer';
      statusEl.textContent = 'Session';
      renderTime();
    });
  }

  // Quick Notes with auto-save to chrome.storage
  function initDockNotes() {
    const noteArea = document.getElementById('meh-quick-note');
    const savedBadge = document.getElementById('meh-note-saved');
    if (!noteArea) return;

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['meh_quick_note'], (res) => {
        if (res && res.meh_quick_note) {
          noteArea.value = res.meh_quick_note;
        }
      });
    }

    let saveTimer = null;
    noteArea.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ meh_quick_note: noteArea.value }, () => {
            if (savedBadge) {
              savedBadge.style.opacity = '1';
              setTimeout(() => { savedBadge.style.opacity = '0'; }, 1500);
            }
          });
        }
      }, 500);
    });
  }

  // Toggle Dock Visibility
  function toggleDock() {
    isDockOpen = !isDockOpen;
    applyDockState();
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ meh_search_dock_open: isDockOpen });
    }
  }

  // Toggle Left / Right Side
  function toggleSide() {
    dockPosition = dockPosition === 'right' ? 'left' : 'right';
    const dock = document.getElementById('meh-search-dock');
    const sideText = document.getElementById('meh-dock-side-text');
    if (dock) {
      dock.className = dockPosition === 'left' ? 'dock-left' : 'dock-right';
      if (!isDockOpen) dock.classList.add('collapsed');
    }
    if (sideText) {
      sideText.textContent = dockPosition === 'right' ? 'Droite' : 'Gauche';
    }
    applyDockState();
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ meh_dock_position: dockPosition });
    }
  }

  // Apply layout shifts to Google search results
  function applyDockState() {
    const dock = document.getElementById('meh-search-dock');
    if (!dock) return;

    if (isDockOpen) {
      dock.classList.remove('collapsed');
      if (dockPosition === 'right') {
        document.body.classList.add('meh-dock-open-right');
        document.body.classList.remove('meh-dock-open-left');
      } else {
        document.body.classList.add('meh-dock-open-left');
        document.body.classList.remove('meh-dock-open-right');
      }
    } else {
      dock.classList.add('collapsed');
      document.body.classList.remove('meh-dock-open-right');
      document.body.classList.remove('meh-dock-open-left');
    }
  }

  // Initialize everything once DOM is ready
  function init() {
    injectWallpaper();
    injectPetals();
    injectTopBar();
    injectDock();

    // Load saved preferences
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['meh_dock_position', 'meh_search_dock_open'], (res) => {
        if (res) {
          if (res.meh_dock_position) dockPosition = res.meh_dock_position;
          if (res.meh_search_dock_open !== undefined) isDockOpen = res.meh_search_dock_open;
          applyDockState();
          const sideText = document.getElementById('meh-dock-side-text');
          if (sideText) sideText.textContent = dockPosition === 'right' ? 'Droite' : 'Gauche';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
