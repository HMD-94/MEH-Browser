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
      chrome.storage.local.get(['meh_wallpaper', 'meh_custom_media_type', 'meh_custom_media_data', 'meh_custom_wp_url'], (res) => {
        if (!res) return;

        // 1. Fond Vidéo personnalisé (boucle stricte 10 secondes)
        if (res.meh_wallpaper === 'custom_file' && res.meh_custom_media_type === 'video' && res.meh_custom_media_data) {
          let vid = document.getElementById('meh-wallpaper-video');
          if (!vid) {
            vid = document.createElement('video');
            vid.id = 'meh-wallpaper-video';
            vid.autoplay = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.setAttribute('muted', '');
            vid.setAttribute('playsinline', '');
            document.documentElement.insertBefore(vid, overlay);
          }
          vid.ontimeupdate = () => {
            if (vid.currentTime >= 10) {
              vid.currentTime = 0;
              vid.play().catch(() => {});
            }
          };
          vid.onended = () => {
            vid.currentTime = 0;
            vid.play().catch(() => {});
          };
          vid.src = res.meh_custom_media_data;
          vid.play().catch(() => {});
          bg.style.display = 'none';
          return;
        }

        // Si ce n'est pas une vidéo, supprimer tout élément vidéo existant
        const existingVid = document.getElementById('meh-wallpaper-video');
        if (existingVid) existingVid.remove();
        bg.style.display = '';

        // 2. Fond GIF animé ou Image locale
        if (res.meh_wallpaper === 'custom_file' && res.meh_custom_media_data) {
          bg.style.backgroundImage = `url("${res.meh_custom_media_data}")`;
          return;
        }

        // 3. Fond URL personnalisée
        if (res.meh_wallpaper === 'custom' && res.meh_custom_wp_url) {
          bg.style.backgroundImage = `url("${res.meh_custom_wp_url}")`;
          return;
        }

        // 4. Fonds officiels MEH
        if (res.meh_wallpaper) {
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
