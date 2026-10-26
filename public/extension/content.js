// ==========================================================================
// MEH BROWSER - CONTENT SCRIPT FOR SEARCH ENGINE PAGES
// Applique UNIQUEMENT le fond d'écran Sakura sur Google Search en gardant Google 100% normal
// ==========================================================================

(() => {
  if (window.__MEH_BROWSER_WALLPAPER_INJECTED__) return;
  window.__MEH_BROWSER_WALLPAPER_INJECTED__ = true;

  function injectWallpaper() {
    // Fond d'écran Sakura HD
    const bg = document.createElement('div');
    bg.id = 'meh-wallpaper-backdrop';

    const sakuraUrl = chrome.runtime.getURL('wallpapers/sakura-bloom.jpg');
    bg.style.backgroundImage = `url("${sakuraUrl}")`;

    // Voile léger pour garantir que le texte et les résultats de Google restent parfaitement lisibles
    const overlay = document.createElement('div');
    overlay.id = 'meh-wallpaper-overlay';

    document.documentElement.appendChild(bg);
    document.documentElement.appendChild(overlay);

    // Si l'utilisateur a choisi un autre fond dans MEH Browser, on l'applique
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWallpaper);
  } else {
    injectWallpaper();
  }
})();
