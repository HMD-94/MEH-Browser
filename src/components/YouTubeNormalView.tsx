import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  Video,
  Bell,
  Menu,
  Home,
  Flame,
  Music2,
  Gamepad2,
  Newspaper,
  Radio,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Check,
  MoreVertical,
  PlaySquare,
  History,
  Tv,
  Film,
  Download,
  FolderHeart,
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowLeft,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { BrowserSettings } from '../types/browser';

interface YouTubeNormalViewProps {
  url: string;
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  settings?: BrowserSettings;
  onChangeSettings?: (settings: BrowserSettings) => void;
  onSwitchToProxy?: () => void;
}

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  views: string;
  published: string;
  duration: string;
  thumbnail: string;
  avatar: string;
}

const CATEGORIES = [
  'Tous',
  'Musique',
  'Jeux vidéo',
  'En direct',
  'Actualités',
  'Podcasts',
  'Mix',
  'Rap français',
  'Récemment mis en ligne',
  'Nouveautés pour vous',
];

const DEFAULT_POPULAR_VIDEOS: VideoItem[] = [
  {
    id: 'RHb5LKnnxLg',
    title: 'Top Hits 2026 - Les meilleures chansons du moment',
    channel: 'Hit Music France',
    views: '1,4 M de vues',
    published: 'il y a 2 jours',
    duration: '34:20',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to relax/study to',
    channel: 'Lofi Girl',
    views: '68 M de vues',
    published: 'En direct',
    duration: 'EN DIRECT',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video 4K)',
    channel: 'Rick Astley',
    views: '1,5 Md de vues',
    published: 'il y a 14 ans',
    duration: '3:33',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    views: '1,7 Md de vues',
    published: 'il y a 15 ans',
    duration: '5:59',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    views: '8,4 Md de vues',
    published: 'il y a 7 ans',
    duration: '4:42',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'Ed Sheeran',
    views: '6,2 Md de vues',
    published: 'il y a 7 ans',
    duration: '4:23',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
  }
];

export const YouTubeNormalView: React.FC<YouTubeNormalViewProps> = ({
  url,
  onNavigate,
  onOpenNewTab,
  onToggleBookmark,
  isBookmarked,
  settings,
  onChangeSettings,
  onSwitchToProxy,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_POPULAR_VIDEOS);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(48200);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Extract video ID from URL
  const extractVideoId = (targetUrl: string): string | null => {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname === '/watch') {
          return parsed.searchParams.get('v');
        }
        if (parsed.pathname.startsWith('/shorts/')) {
          return parsed.pathname.replace('/shorts/', '').split('/')[0];
        }
        if (parsed.pathname.startsWith('/embed/')) {
          return parsed.pathname.replace('/embed/', '').split('/')[0];
        }
      }
      if (parsed.hostname === 'youtu.be') {
        return parsed.pathname.replace('/', '').split('?')[0];
      }
    } catch {}
    return null;
  };

  // Extract search query from URL
  const extractSearchQuery = (targetUrl: string): string => {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.pathname === '/results') {
        return parsed.searchParams.get('search_query') || '';
      }
    } catch {}
    return '';
  };

  const activeVideoId = extractVideoId(url);
  const urlSearchQuery = extractSearchQuery(url);

  // Load videos from backend data API
  const loadVideos = async (q: string, category: string) => {
    setLoading(true);
    try {
      let endpoint = '/api/youtube/data';
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      else if (category && category !== 'Tous') {
        if (category === 'Musique') params.set('category', 'music');
        else if (category === 'Jeux vidéo') params.set('category', 'gaming');
        else if (category === 'Actualités') params.set('category', 'news');
        else if (category === 'Podcasts') params.set('category', 'podcasts');
        else params.set('q', category);
      }
      const qs = params.toString();
      if (qs) endpoint += `?${qs}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      }
    } catch (err) {
      console.warn('Failed to load YouTube feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
      loadVideos(urlSearchQuery, '');
    } else {
      loadVideos('', activeCategory);
    }
  }, [url, activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectVideo = (videoId: string) => {
    onNavigate(`https://www.youtube.com/watch?v=${videoId}`);
  };

  const handleGoHome = () => {
    setSearchQuery('');
    setActiveCategory('Tous');
    onNavigate('https://www.youtube.com');
  };

  const currentVideo = videos.find((v) => v.id === activeVideoId) || (activeVideoId ? {
    id: activeVideoId,
    title: 'Vidéo YouTube en cours de lecture',
    channel: 'Créateur YouTube Officiel',
    views: '1,2 M de vues',
    published: 'il y a 3 jours',
    duration: '',
    thumbnail: `https://i.ytimg.com/vi/${activeVideoId}/hqdefault.jpg`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  } : null);

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0f0f0f] text-[#f1f1f1] select-none font-sans overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. EXACT OFFICIAL YOUTUBE HEADER */}
      {/* ========================================================================= */}
      <header className="h-14 px-4 bg-[#0f0f0f] flex items-center justify-between shrink-0 z-30 border-b border-[#272727]">
        {/* Left: Hamburger menu + YouTube Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-[#272727] text-white transition-colors"
            title="Guide"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={handleGoHome}
            className="flex items-center gap-1 cursor-pointer select-none group"
            title="Accueil YouTube"
          >
            {/* Official YouTube Logo SVG */}
            <div className="flex items-center">
              <svg className="w-7 h-5" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M27.4 3.1C27.1 1.9 26.1 0.9 24.9 0.6C22.7 0 14 0 14 0C14 0 5.3 0 3.1 0.6C1.9 0.9 0.9 1.9 0.6 3.1C0 5.3 0 10 0 10C0 10 0 14.7 0.6 16.9C0.9 18.1 1.9 19.1 3.1 19.4C5.3 20 14 20 14 20C14 20 22.7 20 24.9 19.4C26.1 19.1 27.1 18.1 27.4 16.9C28 14.7 28 10 28 10C28 10 28 5.3 27.4 3.1Z"
                  fill="#FF0000"
                />
                <polygon points="11,14.5 18.5,10 11,5.5" fill="#FFFFFF" />
              </svg>
              <span className="ml-1.5 font-bold text-lg tracking-tighter text-white font-sans">
                YouTube
              </span>
              <span className="text-[10px] text-[#aaaaaa] font-medium ml-1 mb-2.5">
                FR
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Box + Mic Button */}
        <div className="flex-1 max-w-2xl mx-4 flex items-center justify-center">
          <form onSubmit={handleSearch} className="flex items-center w-full max-w-xl">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                className="w-full h-10 pl-4 pr-10 bg-[#121212] border border-[#303030] focus:border-[#1c62b9] rounded-l-full text-sm text-white placeholder-[#888888] outline-none shadow-inner transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#aaaaaa] hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 px-6 bg-[#222222] hover:bg-[#272727] border border-l-0 border-[#303030] rounded-r-full text-[#f1f1f1] flex items-center justify-center transition-colors"
              title="Rechercher"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          </form>

          <button
            onClick={() => {}}
            className="ml-3 p-2.5 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-white transition-colors shrink-0"
            title="Rechercher avec la voix"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions, Create, Notifications, Profile & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* AdShield Badge */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
            title="MEH AdShield actif : les publicités vidéo sont bloquées"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AdShield Actif</span>
          </div>

          {/* Switch to Raw Iframe if user explicitly desires */}
          {onSwitchToProxy && (
            <button
              onClick={onSwitchToProxy}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-[#aaaaaa] hover:text-white text-xs border border-[#303030] transition-colors"
              title="Basculer vers la vue proxy brute"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vue brute</span>
            </button>
          )}

          <button
            className="p-2 rounded-full hover:bg-[#272727] text-white transition-colors hidden sm:block"
            title="Créer"
          >
            <Video className="w-5 h-5" />
          </button>

          <button
            className="p-2 rounded-full hover:bg-[#272727] text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600" />
          </button>

          {/* User Avatar Circle */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer ml-1 shadow-sm">
            M
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`shrink-0 bg-[#0f0f0f] border-r border-[#272727] overflow-y-auto custom-scrollbar transition-all duration-200 z-20 ${
            sidebarOpen ? 'w-60 px-3 py-3' : 'w-[72px] px-1 py-3 hidden sm:flex flex-col items-center'
          }`}
        >
          {sidebarOpen ? (
            /* Full Expanded Sidebar */
            <div className="space-y-4 text-sm text-[#f1f1f1]">
              <div className="space-y-1">
                <button
                  onClick={handleGoHome}
                  className={`w-full flex items-center gap-6 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    !activeVideoId && activeCategory === 'Tous' && !urlSearchQuery
                      ? 'bg-[#272727] font-semibold text-white'
                      : 'hover:bg-[#272727]'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Accueil</span>
                </button>
                <button className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors">
                  <Flame className="w-5 h-5" />
                  <span>Shorts</span>
                </button>
                <button className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors">
                  <PlaySquare className="w-5 h-5" />
                  <span>Abonnements</span>
                </button>
              </div>

              <div className="h-[1px] bg-[#272727] my-2" />

              <div className="space-y-1">
                <div className="px-3 py-1 text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <span>Vous</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <button className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors">
                  <History className="w-5 h-5" />
                  <span>Historique</span>
                </button>
                <button className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors">
                  <Tv className="w-5 h-5" />
                  <span>Vos vidéos</span>
                </button>
                <button className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors">
                  <Clock className="w-5 h-5" />
                  <span>À regarder plus tard</span>
                </button>
                <button className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                  <span>Vidéos « J'aime »</span>
                </button>
              </div>

              <div className="h-[1px] bg-[#272727] my-2" />

              <div className="space-y-1">
                <span className="px-3 py-1 text-xs font-bold text-[#aaaaaa] uppercase tracking-wider block">
                  Explorer
                </span>
                <button
                  onClick={() => {
                    setActiveCategory('Tendances');
                    onNavigate('https://www.youtube.com/feed/trending');
                  }}
                  className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors"
                >
                  <Flame className="w-5 h-5" />
                  <span>Tendances</span>
                </button>
                <button
                  onClick={() => setActiveCategory('Musique')}
                  className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors"
                >
                  <Music2 className="w-5 h-5" />
                  <span>Musique</span>
                </button>
                <button
                  onClick={() => setActiveCategory('Jeux vidéo')}
                  className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>Jeux vidéo</span>
                </button>
                <button
                  onClick={() => setActiveCategory('Actualités')}
                  className="w-full flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#272727] transition-colors"
                >
                  <Newspaper className="w-5 h-5" />
                  <span>Actualités</span>
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed Mini Sidebar */
            <div className="space-y-4 text-center">
              <button
                onClick={handleGoHome}
                className="w-16 py-3 flex flex-col items-center gap-1 rounded-xl hover:bg-[#272727] text-white"
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px]">Accueil</span>
              </button>
              <button className="w-16 py-3 flex flex-col items-center gap-1 rounded-xl hover:bg-[#272727] text-white">
                <Flame className="w-5 h-5" />
                <span className="text-[10px]">Shorts</span>
              </button>
              <button className="w-16 py-3 flex flex-col items-center gap-1 rounded-xl hover:bg-[#272727] text-white">
                <PlaySquare className="w-5 h-5" />
                <span className="text-[10px]">Abonnements</span>
              </button>
              <button className="w-16 py-3 flex flex-col items-center gap-1 rounded-xl hover:bg-[#272727] text-white">
                <Tv className="w-5 h-5" />
                <span className="text-[10px]">Vous</span>
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f0f]">
          {activeVideoId ? (
            /* ========================================================================= */
            /* 3. OFFICIAL YOUTUBE WATCH PAGE (/watch?v=...) */
            /* ========================================================================= */
            <div className="max-w-[1750px] mx-auto p-4 lg:p-6 flex flex-col xl:flex-row gap-6">
              {/* Left Column: Player & Info */}
              <div className="flex-1 min-w-0">
                {/* 16:9 Video Player */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#272727]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1&rel=0`}
                    title={currentVideo?.title || 'YouTube Player'}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Video Title */}
                <h1 className="text-xl font-bold text-white mt-3 leading-snug">
                  {currentVideo?.title || 'Lecture de la vidéo YouTube'}
                </h1>

                {/* Channel Bar & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[#272727]">
                  {/* Channel info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={currentVideo?.avatar}
                      alt={currentVideo?.channel}
                      className="w-10 h-10 rounded-full object-cover bg-[#272727]"
                    />
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1">
                        <span>{currentVideo?.channel}</span>
                        <Check className="w-3.5 h-3.5 bg-white/20 text-white rounded-full p-0.5" />
                      </div>
                      <span className="text-xs text-[#aaaaaa]">1,42 M d'abonnés</span>
                    </div>

                    <button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className={`ml-3 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        isSubscribed
                          ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                          : 'bg-white text-black hover:bg-[#e5e5e5]'
                      }`}
                    >
                      {isSubscribed ? 'Abonné' : "S'abonner"}
                    </button>
                  </div>

                  {/* Actions: Likes, Share, Save */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-[#272727] rounded-full overflow-hidden text-xs">
                      <button
                        onClick={() => {
                          setLiked(!liked);
                          if (disliked) setDisliked(false);
                          setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
                        }}
                        className={`flex items-center gap-2 px-4 py-2 hover:bg-[#3f3f3f] transition-colors ${
                          liked ? 'text-white font-bold' : 'text-[#f1f1f1]'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
                        <span>{likesCount.toLocaleString()}</span>
                      </button>
                      <div className="w-[1px] h-5 bg-[#3f3f3f]" />
                      <button
                        onClick={() => {
                          setDisliked(!disliked);
                          if (liked) setLiked(false);
                        }}
                        className={`px-3 py-2 hover:bg-[#3f3f3f] transition-colors ${
                          disliked ? 'text-white' : 'text-[#f1f1f1]'
                        }`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${disliked ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    <button
                      onClick={copyUrl}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-xs font-medium transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{copied ? 'Lien copié !' : 'Partager'}</span>
                    </button>

                    <button
                      onClick={onToggleBookmark}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-xs font-medium transition-colors"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>

                {/* Description Box */}
                <div
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="mt-3 p-3.5 rounded-xl bg-[#272727] hover:bg-[#333333] transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span>{currentVideo?.views || '120 k vues'}</span>
                    <span>•</span>
                    <span>{currentVideo?.published || 'il y a 3 jours'}</span>
                  </div>
                  <p className={`text-[#e0e0e0] leading-relaxed ${descriptionExpanded ? '' : 'line-clamp-2'}`}>
                    Découvrez cette vidéo sur la plateforme officielle YouTube. Profitez d'une diffusion haute
                    définition fluide et sans interruption publicitaire grâce au bouclier MEH AdShield.
                  </p>
                  <span className="text-[11px] font-bold text-white pt-1 block">
                    {descriptionExpanded ? 'Afficher moins' : 'Plus'}
                  </span>
                </div>
              </div>

              {/* Right Column: Up Next / Suggestions */}
              <div className="w-full xl:w-96 shrink-0 space-y-3">
                <h3 className="font-bold text-sm text-white px-1">Vidéos à suivre</h3>
                <div className="space-y-3">
                  {videos
                    .filter((v) => v.id !== activeVideoId)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectVideo(item.id)}
                        className="flex gap-2 p-1.5 rounded-xl hover:bg-[#272727] transition-colors cursor-pointer group"
                      >
                        <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          {item.duration && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                              {item.duration}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white group-hover:text-[#3ea6ff] line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#aaaaaa] mt-1 truncate">{item.channel}</p>
                          <div className="text-[10px] text-[#aaaaaa]">
                            <span>{item.views}</span> • <span>{item.published}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 4. OFFICIAL YOUTUBE FEED / SEARCH RESULTS GRID */
            /* ========================================================================= */
            <div className="p-4 sm:p-6 space-y-6">
              {/* Category Filter Chips (if not search) */}
              {!urlSearchQuery && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-white text-black font-semibold'
                            : 'bg-[#272727] hover:bg-[#3f3f3f] text-[#f1f1f1]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* If Searching */}
              {urlSearchQuery && (
                <div className="flex items-center justify-between pb-2 border-b border-[#272727]">
                  <span className="text-sm text-[#aaaaaa]">
                    Résultats pour : <strong className="text-white font-semibold">« {urlSearchQuery} »</strong>
                  </span>
                  <button
                    onClick={handleGoHome}
                    className="text-xs text-[#3ea6ff] hover:underline font-semibold"
                  >
                    Effacer la recherche
                  </button>
                </div>
              )}

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(video.id)}
                    className="flex flex-col cursor-pointer group"
                  >
                    {/* Thumbnail Box */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-bold text-white">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="flex gap-3 pt-3">
                      <img
                        src={video.avatar}
                        alt={video.channel}
                        className="w-9 h-9 rounded-full object-cover bg-[#272727] shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#3ea6ff] transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-[#aaaaaa] mt-1 truncate hover:text-white flex items-center gap-1">
                          <span>{video.channel}</span>
                          <Check className="w-3 h-3 bg-white/20 text-white rounded-full p-0.5" />
                        </p>
                        <p className="text-xs text-[#aaaaaa]">
                          <span>{video.views}</span> • <span>{video.published}</span>
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#aaaaaa] hover:text-white transition-opacity h-fit"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
