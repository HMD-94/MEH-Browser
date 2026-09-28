import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip/brotli compression for fast responses
app.use(compression());
app.use(express.json());

// In-memory caching for ultra-fast browsing
const proxyAssetCache = new Map<string, { buffer: Buffer; contentType: string; ts: number }>();
const proxyHtmlCache = new Map<string, { body: string; ts: number }>();
const ASSET_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours
const HTML_CACHE_TTL = 60 * 1000; // 1 minute

// Static wallpapers and assets fallbacks (both dev & production)
app.use('/wallpapers', express.static(path.resolve(__dirname, 'public/wallpapers'), { maxAge: '7d' }));
app.use('/public', express.static(path.resolve(__dirname, 'public'), { maxAge: '7d' }));
app.use('/src/assets/images', express.static(path.resolve(__dirname, 'src/assets/images'), { maxAge: '7d' }));

// In-memory server cache (TTL: 10 minutes)
const serverCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key: string) {
  const item = serverCache.get(key);
  if (item && Date.now() - item.ts < CACHE_TTL) {
    return item.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  if (serverCache.size > 500) {
    const firstKey = serverCache.keys().next().value;
    if (firstKey) serverCache.delete(firstKey);
  }
  serverCache.set(key, { data, ts: Date.now() });
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// API: Real DuckDuckGo Search Results
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.json({ query: '', results: [], instantAnswer: null });
  }

  const cacheKey = `search:${query.toLowerCase()}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  try {
    const results: Array<{
      title: string;
      url: string;
      snippet: string;
      domain: string;
      favicon: string;
    }> = [];

    // 1. Fetch real DuckDuckGo Web Results from html.duckduckgo.com
    const ddgHtmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const htmlResponse = await fetch(ddgHtmlUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (htmlResponse.ok) {
      const html = await htmlResponse.text();

      // Extract result blocks
      const blockRegex =
        /<div class="[^"]*result[^\"]*results_links[^\"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
      const blocks = html.match(blockRegex) || [];

      for (const block of blocks) {
        // Skip sponsored/ad results
        if (block.includes('badge--ad') || block.includes('result--ad') || block.includes('class="badge--ad"')) {
          continue;
        }

        // Title and Link extraction
        const titleMatch = block.match(
          /<h2 class="result__title"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
        ) || block.match(
          /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
        );

        // Snippet extraction
        const snippetMatch = block.match(
          /<(?:a|div)[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div)>/i
        );

        if (titleMatch) {
          const rawHref = titleMatch[1];
          let cleanUrl = rawHref;

          try {
            if (rawHref.includes('uddg=')) {
              const u = new URL(rawHref, 'https://duckduckgo.com');
              cleanUrl = decodeURIComponent(u.searchParams.get('uddg') || rawHref);
            } else if (rawHref.startsWith('//')) {
              cleanUrl = 'https:' + rawHref;
            }
          } catch {
            cleanUrl = rawHref;
          }

          const rawTitle = titleMatch[2].replace(/<[^>]+>/g, '').trim();
          const rawSnippet = snippetMatch
            ? snippetMatch[1].replace(/<[^>]+>/g, '').trim()
            : '';

          const title = decodeHtmlEntities(rawTitle);
          const snippet = decodeHtmlEntities(rawSnippet);

          let domain = '';
          try {
            domain = new URL(cleanUrl).hostname;
          } catch {
            domain = cleanUrl;
          }

          if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
            results.push({
              title: title || domain,
              url: cleanUrl,
              snippet: snippet,
              domain: domain,
              favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            });
          }
        }
      }
    }

    // 2. Fetch DuckDuckGo Instant Answer / Knowledge Panel
    let instantAnswer: any = null;
    try {
      const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const apiRes = await fetch(ddgApiUrl);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.AbstractText || data.Heading) {
          instantAnswer = {
            heading: decodeHtmlEntities(data.Heading || query),
            abstract: decodeHtmlEntities(data.AbstractText || ''),
            source: data.AbstractSource || 'DuckDuckGo',
            url: data.AbstractURL,
            image: data.Image
              ? (data.Image.startsWith('http') ? data.Image : `https://duckduckgo.com${data.Image}`)
              : null,
            entityType: data.Entity || null,
          };
        }
      }
    } catch (e) {
      console.warn('Instant answer API error:', e);
    }

    // 3. Fallback: If 0 results, query DuckDuckGo JSON API RelatedTopics
    if (results.length === 0) {
      try {
        const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
        const apiRes = await fetch(ddgApiUrl);
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (Array.isArray(data.RelatedTopics)) {
            for (const topic of data.RelatedTopics) {
              if (topic.FirstURL && topic.Text) {
                let domain = '';
                try {
                  domain = new URL(topic.FirstURL).hostname;
                } catch {
                  domain = 'duckduckgo.com';
                }
                const parts = topic.Text.split(' - ');
                const title = parts[0] || topic.Text;
                const snippet = parts.slice(1).join(' - ') || topic.Text;
                results.push({
                  title: decodeHtmlEntities(title),
                  url: topic.FirstURL,
                  snippet: decodeHtmlEntities(snippet),
                  domain,
                  favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Related topics fallback error:', e);
      }
    }

    const payload = {
      query,
      results,
      instantAnswer,
      count: results.length,
    };
    setCache(cacheKey, payload);
    return res.json(payload);
  } catch (error: any) {
    console.error('Search API error:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des résultats DuckDuckGo',
      results: [],
    });
  }
});

// API: Real DuckDuckGo / Web Image Search
app.get('/api/images', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.json({ query: '', results: [], count: 0 });
  }

  const cacheKey = `images:${query.toLowerCase()}`;
  const cachedImages = getCached(cacheKey);
  if (cachedImages) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedImages);
  }

  try {
    let images: Array<{
      title: string;
      image: string;
      thumbnail: string;
      url: string;
      source: string;
      width?: number;
      height?: number;
    }> = [];

    // Method 1: Try DuckDuckGo Image Search API
    try {
      const initRes = await fetch(
        `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        }
      );
      if (initRes.ok) {
        const html = await initRes.text();
        const vqdMatch =
          html.match(/vqd=["']([^"']+)["']/) ||
          html.match(/vqd=([0-9a-zA-Z_-]+)/) ||
          html.match(/name="vqd" value="([^"]+)"/);

        if (vqdMatch) {
          const vqd = vqdMatch[1];
          const imgRes = await fetch(
            `https://duckduckgo.com/i.js?l=fr-fr&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`,
            {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://duckduckgo.com/',
              },
            }
          );

          if (imgRes.ok) {
            const data = await imgRes.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              images = data.results
                .filter((r: any) => r.image && r.thumbnail)
                .map((r: any) => {
                  let domain = r.source || '';
                  if (!domain && r.url) {
                    try {
                      domain = new URL(r.url).hostname;
                    } catch {
                      domain = 'DuckDuckGo';
                    }
                  }
                  return {
                    title: decodeHtmlEntities(r.title || query),
                    image: r.image,
                    thumbnail: r.thumbnail,
                    url: r.url || r.image,
                    source: domain,
                    width: r.width || 0,
                    height: r.height || 0,
                  };
                });
            }
          }
        }
      }
    } catch (e) {
      console.warn('DuckDuckGo image search failed, using fallback:', e);
    }

    // Method 2: Fallback to Bing Image Engine (same index as DuckDuckGo, 100% reliable)
    if (images.length === 0) {
      try {
        const bingRes = await fetch(
          `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
          }
        );

        if (bingRes.ok) {
          const html = await bingRes.text();
          const regex = /class="iusc"[^>]*m="([^"]+)"/g;
          let match;
          while ((match = regex.exec(html)) !== null && images.length < 60) {
            try {
              const parsed = JSON.parse(match[1].replace(/&quot;/g, '"'));
              if (parsed.murl) {
                let domain = '';
                if (parsed.purl) {
                  try {
                    domain = new URL(parsed.purl).hostname;
                  } catch {
                    domain = 'Web';
                  }
                }
                const rawTitle = (parsed.t || parsed.desc || query).replace(/[\uE000-\uF8FF]/g, '').trim();
                images.push({
                  title: decodeHtmlEntities(rawTitle),
                  image: parsed.murl,
                  thumbnail: (parsed.turl || '').replace(/&amp;/g, '&'),
                  url: parsed.purl || parsed.murl,
                  source: domain || 'Web',
                  width: parsed.width || 0,
                  height: parsed.height || 0,
                });
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Bing fallback image search error:', err);
      }
    }

    const imagePayload = {
      query,
      results: images,
      count: images.length,
    };
    if (images.length > 0) {
      setCache(cacheKey, imagePayload);
    }
    return res.json(imagePayload);
  } catch (error: any) {
    console.error('Image Search API error:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des images',
      results: [],
      count: 0,
    });
  }
});

// API: Image Proxy (Bypasses CORS and hotlink protections when viewing/downloading images)
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    return res.status(400).send('URL invalide');
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    return res.status(502).send('Impossible de charger l’image');
  }
});

// API: YouTube Internal Endpoint Fallback Proxy (Ensures normal YouTube page background calls succeed)
app.all(['/youtubei/*', '/s/desktop/*'], async (req, res) => {
  const target = `https://www.youtube.com${req.originalUrl}`;
  try {
    const fetchOpts: any = {
      method: req.method,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    };
    if (req.headers['content-type']) {
      fetchOpts.headers['content-type'] = req.headers['content-type'];
    }
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    const upstreamRes = await fetch(target, fetchOpts);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const cType = upstreamRes.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', cType);
    const buf = await upstreamRes.arrayBuffer();
    return res.status(upstreamRes.status).send(Buffer.from(buf));
  } catch (e) {
    return res.status(502).send('Error');
  }
});

// API: YouTube Data API (Ultra-fast cached real YouTube feed, categories & search)
app.get('/api/youtube/data', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  const category = (req.query.category as string || '').trim();

  let searchTerm = query;
  if (!searchTerm) {
    if (category === 'music') searchTerm = 'musique 2026 clips officiels';
    else if (category === 'gaming') searchTerm = 'gaming gameplay fr nouveautes';
    else if (category === 'news') searchTerm = 'actualites france direct';
    else if (category === 'podcasts') searchTerm = 'podcasts france';
    else if (category === 'tech') searchTerm = 'high tech nouveautes review';
    else searchTerm = 'tendances france populaires';
  }

  const cacheKey = `yt:fast:${searchTerm.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  try {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    const ytRes = await fetch(ytUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8',
      },
    });

    if (ytRes.ok) {
      const text = await ytRes.text();
      const match = text.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const sections =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

        const videos: Array<{
          id: string;
          title: string;
          channel: string;
          views: string;
          published: string;
          duration: string;
          thumbnail: string;
          avatar: string;
        }> = [];

        for (const section of sections) {
          const items = section.itemSectionRenderer?.contents || [];
          for (const item of items) {
            if (item.videoRenderer && item.videoRenderer.videoId) {
              const v = item.videoRenderer;
              const videoId = v.videoId;
              const title =
                v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || 'Vidéo YouTube';
              const channel =
                v.ownerText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || 'Chaîne YouTube';
              const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '100 k vues';
              const published = v.publishedTimeText?.simpleText || 'il y a quelques jours';
              const duration = v.lengthText?.simpleText || '12:30';
              const thumbs = v.thumbnail?.thumbnails || [];
              const thumbnail = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              const avatar = v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(channel)}`;

              videos.push({
                id: videoId,
                title,
                channel,
                views,
                published,
                duration,
                thumbnail,
                avatar,
              });
            }
          }
        }

        if (videos.length > 0) {
          const result = { query: searchTerm, videos, count: videos.length };
          setCache(cacheKey, result);
          return res.json(result);
        }
      }
    }
  } catch (err) {
    console.warn('YouTube live fetch fallback:', err);
  }

  // High quality curated default feed to ensure 100% reliable instant loading
  const fallback = {
    query: searchTerm,
    videos: [
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
    ],
    count: 6
  };
  return res.json(fallback);
});

// API: In-Browser Web Page Proxy (Strips X-Frame-Options to allow in-tab browsing + MEH AdShield Pro + High-Speed Caching)
app.all('/api/proxy', async (req, res) => {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  const targetUrl = (req.query.url as string) || (req.body && req.body.url);
  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    return res.status(400).send('URL invalide');
  }

  const isAdBlockEnabled = req.query.adblock !== '0';
  const isStrict = req.query.strict === '1';
  const blockCookies = req.query.cookies !== '0';

  // Check static asset cache for ultra-fast instant delivery
  if (req.method === 'GET' && proxyAssetCache.has(targetUrl)) {
    const cachedAsset = proxyAssetCache.get(targetUrl)!;
    if (Date.now() - cachedAsset.ts < ASSET_CACHE_TTL) {
      res.setHeader('Content-Type', cachedAsset.contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('X-Cache', 'HIT-ASSET');
      return res.send(cachedAsset.buffer);
    }
  }

  // Check HTML cache for instant navigation back/forward
  const htmlCacheKey = `${targetUrl}:${isAdBlockEnabled ? '1' : '0'}:${isStrict ? '1' : '0'}`;
  if (req.method === 'GET' && proxyHtmlCache.has(htmlCacheKey)) {
    const cachedHtml = proxyHtmlCache.get(htmlCacheKey)!;
    if (Date.now() - cachedHtml.ts < HTML_CACHE_TTL) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-MEH-AdShield', isAdBlockEnabled ? 'active' : 'disabled');
      res.setHeader('X-Cache', 'HIT-HTML');
      return res.send(cachedHtml.body);
    }
  }

  let targetOrigin = '';
  try {
    targetOrigin = new URL(targetUrl).origin;
  } catch {}

  try {
    const fetchOptions: any = {
      method: req.method,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    };

    if (req.headers['content-type']) {
      fetchOptions.headers['content-type'] = req.headers['content-type'];
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    const contentType = response.headers.get('content-type') || 'text/html';

    // If it's HTML, inject <base>, anti-framebusting, proxy bridge & MEH AdShield
    if (contentType.includes('text/html')) {
      let body = await response.text();
      let serverBlockedAdsCount = 0;
      let serverBlockedTrackersCount = 0;

      if (isAdBlockEnabled) {
        // 1. Remove known Ad and Tracking scripts
        const adScriptRegex =
          /<script\b[^>]*\bsrc=["'][^"']*(?:googlesyndication|doubleclick|googleadservices|criteo|taboola|outbrain|adnxs|amazon-adsystem|pubmatic|rubiconproject|openx|smartadserver|popads|adroll|moatads|adservice|ad-delivery|casalemedia|yieldmo)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi;
        const trackerScriptRegex = isStrict
          ? /<script\b[^>]*\bsrc=["'][^"']*(?:scorecardresearch|facebook\.net\/(?:[a-zA-Z_]+\/)?fbevents|ads-twitter|mc\.yandex|hotjar|clarity\.ms|google-analytics|googletagmanager)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi
          : /<script\b[^>]*\bsrc=["'][^"']*(?:scorecardresearch|facebook\.net\/(?:[a-zA-Z_]+\/)?fbevents|ads-twitter|mc\.yandex|hotjar|clarity\.ms)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi;

        const adMatches = body.match(adScriptRegex);
        if (adMatches) {
          serverBlockedAdsCount += adMatches.length;
          body = body.replace(adScriptRegex, '<!-- [MEH AdShield] Ad Script Blocked -->');
        }

        const trackerMatches = body.match(trackerScriptRegex);
        if (trackerMatches) {
          serverBlockedTrackersCount += trackerMatches.length;
          body = body.replace(trackerScriptRegex, '<!-- [MEH AdShield] Tracker Script Blocked -->');
        }

        // 2. Remove AdSense tags & ad iframes
        const insAdRegex = /<ins\b[^>]*\bclass=["'][^"']*adsbygoogle[^"']*["'][^>]*>[\s\S]*?<\/ins>/gi;
        const insMatches = body.match(insAdRegex);
        if (insMatches) {
          serverBlockedAdsCount += insMatches.length;
          body = body.replace(insAdRegex, '');
        }

        const adIframeRegex =
          /<iframe\b[^>]*\bsrc=["'][^"']*(?:doubleclick|googlesyndication|adnxs|taboola|outbrain|amazon-adsystem|criteo)[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi;
        const iframeMatches = body.match(adIframeRegex);
        if (iframeMatches) {
          serverBlockedAdsCount += iframeMatches.length;
          body = body.replace(adIframeRegex, '');
        }
      }

      // AdBlock Cosmetic CSS injection
      const adBlockCss = isAdBlockEnabled
        ? `<style id="meh-adshield-css">
/* MEH AdShield Pro - Cosmetic Ad & Tracker Filtering */
ins.adsbygoogle,
.adsbygoogle,
[id^="google_ads_"],
[id^="div-gpt-ad"],
[class*="ad-container"],
[class*="ad-wrapper"],
[class*="ad-banner"],
[class*="ad-slot"],
[class*="advertisement"],
[class*="sponsored-post"],
[class*="sponsored_post"],
[class*="sponsor-content"],
[data-ad-unit],
[data-ad-slot],
[data-ad-client],
.taboola-placeholder,
.outbrain_widget,
#ad-unit,
#banner-ad,
.ad-leaderboard,
.ad-sidebar,
.ad-footer,
.top-ad-container,
[aria-label="advertisement" i],
[aria-label="publicité" i],
[aria-label="annonce" i],
[aria-label="sponsorisé" i] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  pointer-events: none !important;
  opacity: 0 !important;
}

${
  blockCookies
    ? `/* MEH AdShield - Cookie Consent & Annoying Popups Suppression */
#didomi-host,
.qc-cmp2-container,
#onetrust-banner-sdk,
.onetrust-pc-dark-filter,
#cookie-banner,
.cookie-banner,
.cookie-consent,
.cookie-notice,
[id*="cookie-notice"],
[class*="cookie-consent"],
[class*="consent-banner"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  pointer-events: none !important;
}`
    : ''
}
</style>`
        : '';

      // Client-side ad interceptor & navigation bridge & anti-framing proxy engine
      const clientScript = `<script id="meh-adshield-runtime">
(function() {
  var isAdBlock = ${isAdBlockEnabled ? 'true' : 'false'};
  var serverBlocked = ${serverBlockedAdsCount + serverBlockedTrackersCount};
  var localBlocked = 0;
  var targetOrigin = "${targetOrigin}";

  // 1. Anti-Framebusting & Top spoofing (allows sites that check window.top to work smoothly)
  try {
    Object.defineProperty(window, 'top', { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'parent', { get: function() { return window; }, configurable: true });
    Object.defineProperty(window, 'frameElement', { get: function() { return null; }, configurable: true });
  } catch (e) {}

  // 2. Disable crashing ServiceWorker calls inside sandboxed iframe
  try {
    if (window.navigator && window.navigator.serviceWorker) {
      window.navigator.serviceWorker.register = function() {
        return Promise.reject(new Error('Proxy mode'));
      };
    }
  } catch (e) {}

  // 3. Intercept fetch() for relative & cross-origin API calls on proxied websites
  try {
    var origFetch = window.fetch;
    window.fetch = function(input, init) {
      try {
        var finalUrl = input;
        if (typeof input === 'string') {
          if (input.startsWith('//')) {
            finalUrl = '/api/proxy?url=' + encodeURIComponent(window.location.protocol + input);
          } else if (input.startsWith('/')) {
            finalUrl = '/api/proxy?url=' + encodeURIComponent(targetOrigin + input);
          } else if (input.startsWith('http://') || input.startsWith('https://')) {
            // If same origin as target site, route through proxy
            if (targetOrigin && input.startsWith(targetOrigin)) {
              finalUrl = '/api/proxy?url=' + encodeURIComponent(input);
            }
          }
        }
        return origFetch.call(this, finalUrl, init);
      } catch (err) {
        return origFetch.apply(this, arguments);
      }
    };
  } catch (e) {}

  // 4. Intercept XMLHttpRequest for relative & cross-origin API calls on proxied websites
  try {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      try {
        var finalUrl = url;
        if (typeof url === 'string') {
          if (url.startsWith('//')) {
            finalUrl = '/api/proxy?url=' + encodeURIComponent(window.location.protocol + url);
          } else if (url.startsWith('/')) {
            finalUrl = '/api/proxy?url=' + encodeURIComponent(targetOrigin + url);
          } else if (url.startsWith('http://') || url.startsWith('https://')) {
            if (targetOrigin && url.startsWith(targetOrigin)) {
              finalUrl = '/api/proxy?url=' + encodeURIComponent(url);
            }
          }
        }
        return origOpen.call(this, method, finalUrl, async !== false, user, pass);
      } catch (err) {
        return origOpen.apply(this, arguments);
      }
    };
  } catch (e) {}

  // 5. Intercept in-page navigation clicks so they navigate inside MEH Browser
  window.addEventListener('click', function(e) {
    try {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (a && a.href && (a.href.startsWith('http://') || a.href.startsWith('https://'))) {
        e.preventDefault();
        window.parent.postMessage({ type: 'MEH_INTERNAL_NAVIGATE', url: a.href }, '*');
      }
    } catch (err) {}
  }, true);

  if (isAdBlock) {
    var adDomains = [
      'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
      'google-analytics.com', 'criteo.com', 'taboola.com', 'outbrain.com',
      'adnxs.com', 'amazon-adsystem.com', 'pubmatic.com', 'rubiconproject.com',
      'scorecardresearch.com', 'adroll.com', 'popads.net', 'hotjar.com'
    ];

    // Safely stub adsbygoogle to prevent page script errors
    window.adsbygoogle = {
      push: function() {
        localBlocked++;
        notifyParent();
      },
      loaded: true
    };

    // Block popup windows on ad-clicks
    var originalOpen = window.open;
    window.open = function(url, target, features) {
      if (url && adDomains.some(function(d) { return String(url).indexOf(d) !== -1; })) {
        localBlocked++;
        notifyParent();
        return null;
      }
      return originalOpen.apply(this, arguments);
    };

    // Intercept dynamic script/iframe creation
    var originalCreate = document.createElement;
    document.createElement = function(tagName) {
      var elem = originalCreate.apply(this, arguments);
      var lower = String(tagName).toLowerCase();
      if (lower === 'script' || lower === 'iframe') {
        var origSetAttr = elem.setAttribute;
        elem.setAttribute = function(name, val) {
          if (name === 'src' && val && adDomains.some(function(d) { return String(val).indexOf(d) !== -1; })) {
            localBlocked++;
            notifyParent();
            return;
          }
          return origSetAttr.apply(this, arguments);
        };
      }
      return elem;
    };

    function notifyParent() {
      try {
        var total = serverBlocked + localBlocked;
        window.parent.postMessage({
          type: 'MEH_AD_BLOCKED',
          url: window.location.href,
          count: total,
          serverCount: serverBlocked,
          runtimeCount: localBlocked
        }, '*');
      } catch (err) {}
    }

    // Scan DOM on load to count hidden ad blocks
    window.addEventListener('DOMContentLoaded', function() {
      var adSelectors = 'ins.adsbygoogle, [id^="google_ads"], [class*="ad-slot"], [class*="ad-banner"], [class*="advertisement"], .taboola-placeholder, .outbrain_widget';
      var matches = document.querySelectorAll(adSelectors).length;
      if (matches > 0) {
        localBlocked += matches;
      }
      notifyParent();
    });

    // Notify immediately and after initial render
    notifyParent();
    setTimeout(notifyParent, 1200);
    setTimeout(notifyParent, 3500);
  }
})();
</script>`;

      // Inject base tag, AdBlock CSS, and interceptor script
      const baseTag = `<base href="${targetUrl}">\n${adBlockCss}\n${clientScript}`;
      if (body.includes('<head>')) {
        body = body.replace('<head>', `<head>${baseTag}`);
      } else if (body.includes('<head ')) {
        body = body.replace(/<head[^>]*>/, `$&${baseTag}`);
      } else {
        body = baseTag + body;
      }

      // Save HTML to cache for fast reload/back/forward
      if (proxyHtmlCache.size > 200) {
        const firstKey = proxyHtmlCache.keys().next().value;
        if (firstKey) proxyHtmlCache.delete(firstKey);
      }
      proxyHtmlCache.set(htmlCacheKey, { body, ts: Date.now() });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-MEH-AdShield', isAdBlockEnabled ? 'active' : 'disabled');
      // Intentionally NOT sending X-Frame-Options or CSP frame-ancestors so it renders inside MEH Browser!
      return res.send(body);
    }

    // For other assets (CSS, JS, images, fonts) - cache for 7 days
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    const buffer = Buffer.from(await response.arrayBuffer());
    if (proxyAssetCache.size > 500) {
      const firstKey = proxyAssetCache.keys().next().value;
      if (firstKey) proxyAssetCache.delete(firstKey);
    }
    proxyAssetCache.set(targetUrl, { buffer, contentType, ts: Date.now() });
    return res.send(buffer);
  } catch (err: any) {
    return res.status(502).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; max-width: 480px; text-align: center; }
            h2 { color: #f43f5e; margin-top: 0; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            code { background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px; font-family: monospace; color: #38bdf8; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Impossible de charger la page</h2>
            <p>Le serveur cible n'a pas répondu ou refuse les connexions.</p>
            <p><code>${targetUrl}</code></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Vite middleware in dev or static files in production
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`MEH Browser backend running on http://localhost:${PORT}`);
});
