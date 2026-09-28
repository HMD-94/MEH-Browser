import { LiveSearchResult, LiveImageResult, KnowledgeGraphData } from '../types/browser';

// Curated Knowledge Database for instant, rich Knowledge Panels
const CURATED_KNOWLEDGE: Record<string, Partial<KnowledgeGraphData>> = {
  youtube: {
    title: 'YouTube',
    subtitle: 'Plateforme mondiale d’hébergement et de diffusion vidéo',
    description:
      'YouTube est un site web d’hébergement de vidéos et un média social sur lequel les utilisateurs peuvent envoyer, regarder, commenter, évaluer et partager des vidéos en streaming. Basé à San Bruno en Californie, c’est le deuxième site web le plus visité au monde après Google.',
    sourceName: 'Wikipedia',
    sourceUrl: 'https://fr.wikipedia.org/wiki/YouTube',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
    attributes: [
      { label: 'PDG (CEO)', value: 'Neal Mohan (depuis fév. 2023)' },
      { label: 'Propriétaires', value: 'Google, Alphabet Inc.' },
      { label: 'Fondateurs', value: 'Jawed Karim, Steve Chen, Chad Hurley' },
      { label: 'Date de création', value: '14 février 2005, San Mateo, Californie' },
      { label: 'Siège social', value: 'San Bruno, Californie, États-Unis' },
      { label: 'Filiale de', value: 'Google LLC (acheté en 2006 pour 1,65 Md$)' },
    ],
  },
  duckduckgo: {
    title: 'DuckDuckGo',
    subtitle: 'Moteur de recherche axé sur la protection de la vie privée',
    description:
      'DuckDuckGo est un moteur de recherche américain qui met l’accent sur la protection de la vie privée de ses utilisateurs et s’abstient de profiler les recherches ou de stocker des informations personnelles.',
    sourceName: 'Wikipedia',
    sourceUrl: 'https://fr.wikipedia.org/wiki/DuckDuckGo',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/90/DuckDuckGo_logo.svg',
    attributes: [
      { label: 'Fondateur & PDG', value: 'Gabriel Weinberg' },
      { label: 'Date de création', value: '29 février 2008' },
      { label: 'Siège social', value: 'Paoli, Pennsylvanie, États-Unis' },
      { label: 'Modèle économique', value: 'Publicités syndiquées respectueuses de la vie privée' },
    ],
  },
  google: {
    title: 'Google',
    subtitle: 'Entreprise technologique multinationale américaine',
    description:
      'Google est une entreprise technologique multinationale américaine spécialisée dans les services et produits liés à Internet, qui comprennent les technologies de publicité en ligne, un moteur de recherche, le cloud computing, des logiciels et du matériel.',
    sourceName: 'Wikipedia',
    sourceUrl: 'https://fr.wikipedia.org/wiki/Google',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    attributes: [
      { label: 'PDG (CEO)', value: 'Sundar Pichai (depuis 2015)' },
      { label: 'Fondateurs', value: 'Larry Page, Sergey Brin' },
      { label: 'Date de création', value: '4 septembre 1998, Menlo Park, Californie' },
      { label: 'Maison mère', value: 'Alphabet Inc.' },
      { label: 'Siège social', value: 'Mountain View, Californie, États-Unis' },
    ],
  },
  apple: {
    title: 'Apple',
    subtitle: 'Société multinationale de technologie',
    description:
      'Apple Inc. conçoit, fabrique et commercialise des smartphones, des ordinateurs personnels, des tablettes, des accessoires et vend une variété de services associés.',
    sourceName: 'Wikipedia',
    sourceUrl: 'https://fr.wikipedia.org/wiki/Apple',
    attributes: [
      { label: 'PDG (CEO)', value: 'Tim Cook' },
      { label: 'Fondateurs', value: 'Steve Jobs, Steve Wozniak, Ronald Wayne' },
      { label: 'Date de création', value: '1 avril 1976, Los Altos, Californie' },
      { label: 'Siège social', value: 'Apple Park, Cupertino, Californie' },
    ],
  },
};

export interface SearchApiResponse {
  query: string;
  results: LiveSearchResult[];
  instantAnswer?: {
    heading: string;
    abstract: string;
    source: string;
    url?: string;
    image?: string | null;
    entityType?: string | null;
  } | null;
  count: number;
}

// In-memory client caches (TTL: 10 minutes)
const CACHE_TTL_MS = 10 * 60 * 1000;
const webSearchCache = new Map<string, { results: LiveSearchResult[]; instantAnswer?: any; ts: number }>();
const imageSearchCache = new Map<string, { results: LiveImageResult[]; ts: number }>();
const kgCache = new Map<string, { data: KnowledgeGraphData | null; ts: number }>();

// Fetch real search results and instant answer from DuckDuckGo backend API
export async function fetchLiveSearchPayload(
  query: string,
  googleApiKey?: string,
  googleSearchEngineId?: string
): Promise<{ results: LiveSearchResult[]; instantAnswer?: any }> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { results: [] };

  const cacheKey = `${cleanQuery.toLowerCase()}_${googleApiKey || ''}`;
  const cached = webSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { results: cached.results, instantAnswer: cached.instantAnswer };
  }

  // 1. If user explicitly provided Google Custom Search API key & CX
  if (googleApiKey && googleSearchEngineId) {
    try {
      const googleApiUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(
        googleApiKey
      )}&cx=${encodeURIComponent(googleSearchEngineId)}&q=${encodeURIComponent(cleanQuery)}`;

      const gResponse = await fetch(googleApiUrl);
      if (gResponse.ok) {
        const gData = await gResponse.json();
        if (gData.items && Array.isArray(gData.items)) {
          const results = gData.items.map((item: any) => ({
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            source: item.displayLink || 'Google',
            breadcrumb: item.formattedUrl || item.link,
            icon: item.pagemap?.cse_image?.[0]?.src,
          }));
          webSearchCache.set(cacheKey, { results, ts: Date.now() });
          return { results };
        }
      }
    } catch (err) {
      console.warn('Google Custom Search API error, falling back to DuckDuckGo:', err);
    }
  }

  // 2. Real DuckDuckGo Search API via local backend proxy
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data: SearchApiResponse = await res.json();
      if (data.results && data.results.length > 0) {
        const mappedResults = data.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
          source: r.domain || 'DuckDuckGo',
          breadcrumb: r.url,
          icon: r.favicon,
        }));
        webSearchCache.set(cacheKey, {
          results: mappedResults,
          instantAnswer: data.instantAnswer,
          ts: Date.now(),
        });
        return { results: mappedResults, instantAnswer: data.instantAnswer };
      }
    }
  } catch (err) {
    console.error('Failed to fetch from /api/search:', err);
  }

  // 3. Fallback: DuckDuckGo public JSON API client-side directly
  try {
    const directRes = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1`
    );
    if (directRes.ok) {
      const d = await directRes.json();
      const results: LiveSearchResult[] = [];
      if (d.AbstractURL && d.AbstractText) {
        results.push({
          title: d.Heading || cleanQuery,
          url: d.AbstractURL,
          snippet: d.AbstractText,
          source: d.AbstractSource || 'DuckDuckGo',
          breadcrumb: d.AbstractURL,
        });
      }
      if (Array.isArray(d.RelatedTopics)) {
        for (const topic of d.RelatedTopics) {
          if (topic.FirstURL && topic.Text) {
            let domain = 'duckduckgo.com';
            try {
              domain = new URL(topic.FirstURL).hostname;
            } catch {}
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text,
              url: topic.FirstURL,
              snippet: topic.Text,
              source: domain,
              breadcrumb: topic.FirstURL,
              icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            });
          }
        }
      }
      if (results.length > 0) {
        webSearchCache.set(cacheKey, { results, ts: Date.now() });
        return { results };
      }
    }
  } catch (e) {
    console.warn('DuckDuckGo client fallback failed:', e);
  }

  return { results: [] };
}

// Fetch real search results from DuckDuckGo backend API
export async function fetchLiveWebSearch(
  query: string,
  googleApiKey?: string,
  googleSearchEngineId?: string
): Promise<LiveSearchResult[]> {
  const payload = await fetchLiveSearchPayload(query, googleApiKey, googleSearchEngineId);
  return payload.results;
}

// Fetch real Image Search results from DuckDuckGo / Web images API with cache
export async function fetchLiveImageSearch(query: string): Promise<LiveImageResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = cleanQuery.toLowerCase();
  const cached = imageSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.results;
  }

  try {
    const res = await fetch(`/api/images?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        imageSearchCache.set(cacheKey, { results: data.results, ts: Date.now() });
        return data.results;
      }
    }
  } catch (err) {
    console.error('Failed to fetch from /api/images:', err);
  }

  return [];
}

// Fetch Knowledge Graph dynamically or from curated base / DuckDuckGo instant answer
export async function fetchKnowledgeGraph(
  query: string,
  preFetchedInstantAnswer?: any
): Promise<KnowledgeGraphData | null> {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  const cached = kgCache.get(clean);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Check curated exact matches
  for (const key of Object.keys(CURATED_KNOWLEDGE)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      const item = CURATED_KNOWLEDGE[key];
      const result: KnowledgeGraphData = {
        title: item.title || query,
        subtitle: item.subtitle || 'Entité vérifiée',
        description: item.description || '',
        sourceName: item.sourceName || 'Wikipedia',
        sourceUrl: item.sourceUrl || `https://fr.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        imageUrl: item.imageUrl,
        attributes: item.attributes || [],
      };
      kgCache.set(clean, { data: result, ts: Date.now() });
      return result;
    }
  }

  // 2. Use prefetched instant answer if provided (saves a duplicate HTTP request!)
  if (preFetchedInstantAnswer && preFetchedInstantAnswer.abstract) {
    const result: KnowledgeGraphData = {
      title: preFetchedInstantAnswer.heading || query,
      subtitle: preFetchedInstantAnswer.entityType || 'Synthèse DuckDuckGo',
      description: preFetchedInstantAnswer.abstract,
      sourceName: preFetchedInstantAnswer.source || 'DuckDuckGo',
      sourceUrl: preFetchedInstantAnswer.url || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      imageUrl: preFetchedInstantAnswer.image || undefined,
      attributes: [
        { label: 'Source', value: preFetchedInstantAnswer.source || 'DuckDuckGo Instant Answers' },
        { label: 'Type', value: preFetchedInstantAnswer.entityType || 'Information vérifiée' },
      ],
    };
    kgCache.set(clean, { data: result, ts: Date.now() });
    return result;
  }

  // 3. Fetch live Wikipedia REST Summary API
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.extract && data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
        const result: KnowledgeGraphData = {
          title: data.title || query,
          subtitle: data.description || 'Encyclopédie Wikipédia',
          description: data.extract,
          sourceName: 'Wikipedia',
          sourceUrl: data.content_urls?.desktop?.page || `https://fr.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          imageUrl: data.thumbnail?.source,
          attributes: [
            { label: 'Sujet', value: data.description || 'Information générale' },
            { label: 'Langue', value: 'Français' },
            { label: 'Licence', value: 'Creative Commons CC-BY-SA' },
          ],
        };
        kgCache.set(clean, { data: result, ts: Date.now() });
        return result;
      }
    }
  } catch (e) {
    console.warn('Wikipedia summary fetch failed:', e);
  }

  return null;
}
