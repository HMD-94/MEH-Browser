import { LiveSearchResult, LiveImageResult, KnowledgeGraphData } from '../types/browser';

// Curated French Web Index of verified websites and services
interface FrenchWebEntry {
  keywords: string[];
  title: string;
  url: string;
  snippet: string;
  source: string;
  icon?: string;
  knowledge?: Partial<KnowledgeGraphData>;
}

const FRENCH_WEB_DIRECTORY: FrenchWebEntry[] = [
  // MOTEURS & TECH GIANTS
  {
    keywords: ['google', 'moteur', 'recherche', 'google france', 'recherche google'],
    title: 'Google France - Moteur de recherche mondial',
    url: 'https://www.google.fr',
    source: 'google.fr',
    snippet: 'Accédez au moteur de recherche le plus utilisé au monde. Trouvez des pages web, des images, des vidéos et des informations d’actualité instantanément.',
    icon: 'https://www.google.com/s2/favicons?domain=google.fr&sz=64',
    knowledge: {
      title: 'Google',
      subtitle: 'Entreprise technologique & Moteur de recherche',
      description: 'Google est une entreprise technologique multinationale américaine de renommée mondiale, spécialisée dans les services et produits liés à Internet dont son moteur de recherche phare, Android, Chrome et YouTube.',
      sourceName: 'Wikipédia',
      sourceUrl: 'https://fr.wikipedia.org/wiki/Google',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      attributes: [
        { label: 'Site officiel', value: 'https://www.google.fr' },
        { label: 'Maison mère', value: 'Alphabet Inc.' },
        { label: 'Fondateurs', value: 'Larry Page & Sergey Brin' },
        { label: 'PDG', value: 'Sundar Pichai' },
        { label: 'Création', value: '4 septembre 1998' },
      ],
    },
  },
  {
    keywords: ['google maps', 'maps', 'carte', 'itineraire', 'gps'],
    title: 'Google Maps - Cartes, itinéraires et trafic en direct',
    url: 'https://maps.google.fr',
    source: 'maps.google.fr',
    snippet: 'Trouvez des commerces à proximité, visualisez des plans et calculez des itinéraires routiers, en transports en commun ou à pied partout en France et dans le monde.',
    icon: 'https://www.google.com/s2/favicons?domain=maps.google.fr&sz=64',
  },
  {
    keywords: ['google traduction', 'traduction', 'translate', 'traducteur', 'anglais francais'],
    title: 'Google Traduction - Service gratuit multilingue',
    url: 'https://translate.google.fr',
    source: 'translate.google.fr',
    snippet: 'Service gratuit de Google permettant de traduire instantanément des mots, des phrases et des pages web dans plus de 100 langues.',
    icon: 'https://www.google.com/s2/favicons?domain=translate.google.fr&sz=64',
  },
  {
    keywords: ['youtube', 'video', 'chaine', 'musique', 'tuto', 'clip', 'stream'],
    title: 'YouTube France - Regardez des vidéos et écoutez de la musique',
    url: 'https://www.youtube.com',
    source: 'youtube.com',
    snippet: 'Profitez des vidéos et de la musique que vous aimez, mettez en ligne des contenus originaux et partagez-les avec vos amis, vos proches et le monde entier.',
    icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    knowledge: {
      title: 'YouTube',
      subtitle: 'Plateforme mondiale d’hébergement vidéo',
      description: 'YouTube est le premier site web mondial d’hébergement et de partage de vidéos en ligne. Il héberge des millions de créateurs, chaînes musicales, documentaires et tutoriels.',
      sourceName: 'Wikipédia',
      sourceUrl: 'https://fr.wikipedia.org/wiki/YouTube',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
      attributes: [
        { label: 'Site officiel', value: 'https://www.youtube.com' },
        { label: 'Propriétaire', value: 'Google / Alphabet Inc.' },
        { label: 'PDG', value: 'Neal Mohan' },
        { label: 'Lancement', value: '14 février 2005' },
      ],
    },
  },
  {
    keywords: ['duckduckgo', 'moteur prive', 'protection vie privee', 'ddg'],
    title: 'DuckDuckGo - Navigation privée et respect de vos données',
    url: 'https://duckduckgo.com/?kl=fr-fr',
    source: 'duckduckgo.com',
    snippet: 'Le moteur de recherche respectueux de la vie privée. Ne stocke pas votre historique personnel et bloque les traceurs publicitaires intrusifs.',
    icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=64',
  },
  {
    keywords: ['qwant', 'moteur francais', 'recherche europeenne', 'moteur souverain'],
    title: 'Qwant - Le moteur de recherche européen qui respecte votre vie privée',
    url: 'https://www.qwant.com/?l=fr_fr',
    source: 'qwant.com',
    snippet: 'Moteur de recherche français et européen garantissant la confidentialité de vos requêtes sans pistage publicitaire.',
    icon: 'https://www.google.com/s2/favicons?domain=qwant.com&sz=64',
  },

  // METEO & QUOTIDIEN
  {
    keywords: ['meteo', 'previsions meteo', 'pluie', 'soleil', 'meteo france', 'temperature'],
    title: 'Météo-France - Prévisions météo officielles à 15 jours',
    url: 'https://meteofrance.com',
    source: 'meteofrance.com',
    snippet: 'Consultez les prévisions météo officielles pour la France et l’international, les cartes de vigilance météo, la météo des plages et de la montagne.',
    icon: 'https://www.google.com/s2/favicons?domain=meteofrance.com&sz=64',
    knowledge: {
      title: 'Météo-France',
      subtitle: 'Service officiel de météorologie et de climatologie en France',
      description: 'Météo-France est l’organisme public français chargé de la prévision et de l’alerte météorologique sur le territoire national.',
      sourceName: 'Wikipédia',
      sourceUrl: 'https://fr.wikipedia.org/wiki/M%C3%A9t%C3%A9o-France',
      attributes: [
        { label: 'Site web', value: 'https://meteofrance.com' },
        { label: 'Type', value: 'Établissement public' },
        { label: 'Siège', value: 'Saint-Mandé, Val-de-Marne' },
      ],
    },
  },
  {
    keywords: ['tameteo', 'tameteo.com', 'meteo heure par heure'],
    title: 'Tameteo - Météo heure par heure et radar de précipitations',
    url: 'https://www.tameteo.com',
    source: 'tameteo.com',
    snippet: 'Prévisions météorologiques détaillées heure par heure pour toutes les villes de France et cartes satellites en direct.',
    icon: 'https://www.google.com/s2/favicons?domain=tameteo.com&sz=64',
  },

  // ACTUALITES & PRESSE FRANCAISE
  {
    keywords: ['lemonde', 'le monde', 'journal le monde', 'actualites', 'journal', 'news', 'presse'],
    title: 'Le Monde.fr - Actualités et Infos en direct au quotidien',
    url: 'https://www.lemonde.fr',
    source: 'lemonde.fr',
    snippet: 'Le Monde, quotidien d’information international de référence. Suivez toute l’actualité politique, économique, internationale, culturelle et sociétale en continu.',
    icon: 'https://www.google.com/s2/favicons?domain=lemonde.fr&sz=64',
    knowledge: {
      title: 'Le Monde',
      subtitle: 'Quotidien français de référence',
      description: 'Le Monde est un quotidien français fondé par Hubert Beuve-Méry en 1944. C’est l’un des titres majeurs de la presse quotidienne nationale.',
      sourceName: 'Wikipédia',
      sourceUrl: 'https://fr.wikipedia.org/wiki/Le_Monde',
      attributes: [
        { label: 'Site officiel', value: 'https://www.lemonde.fr' },
        { label: 'Fondation', value: '19 décembre 1944' },
        { label: 'Siège', value: 'Paris, France' },
      ],
    },
  },
  {
    keywords: ['lefigaro', 'le figaro', 'figaro actualite'],
    title: 'Le Figaro - Actualité en direct, Économie, Politique, Culture',
    url: 'https://www.lefigaro.fr',
    source: 'lefigaro.fr',
    snippet: 'Le Figaro, le plus ancien quotidien français encore publié. Retrouvez l’information en continu, les grands débats, analyses et reportages exclusifs.',
    icon: 'https://www.google.com/s2/favicons?domain=lefigaro.fr&sz=64',
  },
  {
    keywords: ['francetvinfo', 'france info', 'franceinfo', 'infos en direct', 'radio france info'],
    title: 'Franceinfo - Les actualités et infos en direct de la rédaction',
    url: 'https://www.francetvinfo.fr',
    source: 'francetvinfo.fr',
    snippet: 'Suivez en direct toute l’actualité politique, internationale, faits divers, météo, santé et sport avec la rédaction de France Télévisions et Radio France.',
    icon: 'https://www.google.com/s2/favicons?domain=francetvinfo.fr&sz=64',
  },
  {
    keywords: ['20minutes', '20 minutes', '20min', 'journal gratuit'],
    title: '20 Minutes - L’information rapide et gratuite en continu',
    url: 'https://www.20minutes.fr',
    source: '20minutes.fr',
    snippet: 'Retrouvez l’actualité en temps réel sur 20 Minutes : news insolites, société, culture, sport, high-tech et opinions.',
    icon: 'https://www.google.com/s2/favicons?domain=20minutes.fr&sz=64',
  },
  {
    keywords: ['bfmtv', 'bfm', 'bfm actu', 'bfm tv direct'],
    title: 'BFMTV - Première chaîne d’info en continu de France',
    url: 'https://www.bfmtv.com',
    source: 'bfmtv.com',
    snippet: 'Toute l’actualité en direct vidéo, reportages et analyses sur les grands événements en France et dans le monde entier.',
    icon: 'https://www.google.com/s2/favicons?domain=bfmtv.com&sz=64',
  },
  {
    keywords: ['lequipe', 'l equipe', 'football', 'ligue 1', 'sport', 'resultat foot'],
    title: 'L’Équipe - L’actualité du sport en direct',
    url: 'https://www.lequipe.fr',
    source: 'lequipe.fr',
    snippet: 'Le sport en direct et en continu sur L’Équipe : football, tennis, rugby, cyclisme, Formule 1, basket, résultats et classements en direct.',
    icon: 'https://www.google.com/s2/favicons?domain=lequipe.fr&sz=64',
  },

  // JEUX VIDEO & GAMING
  {
    keywords: ['minecraft', 'minecraft java', 'minecraft bedrock', 'mojang', 'jeu cube'],
    title: 'Minecraft - Site officiel du jeu de construction et d’aventure',
    url: 'https://www.minecraft.net/fr-fr',
    source: 'minecraft.net',
    snippet: 'Explorez votre propre monde unique, survivez à la nuit et créez tout ce que vous pouvez imaginer dans l’univers incontournable de Minecraft.',
    icon: 'https://www.google.com/s2/favicons?domain=minecraft.net&sz=64',
    knowledge: {
      title: 'Minecraft',
      subtitle: 'Jeu vidéo de type bac à sable créé par Markus Persson',
      description: 'Minecraft est le jeu vidéo le plus vendu de tous les temps, permettant aux joueurs de construire des mondes infinis à l’aide de blocs texturés.',
      sourceName: 'Wikipédia',
      sourceUrl: 'https://fr.wikipedia.org/wiki/Minecraft',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
      attributes: [
        { label: 'Développeur', value: 'Mojang Studios' },
        { label: 'Éditeur', value: 'Xbox Game Studios' },
        { label: 'Date de sortie', value: '18 novembre 2011' },
      ],
    },
  },
  {
    keywords: ['fr-minecraft', 'fr minecraft', 'minecraft wiki fr', 'crafting minecraft'],
    title: 'FR-Minecraft - La communauté française et guide complet Minecraft',
    url: 'https://fr-minecraft.net',
    source: 'fr-minecraft.net',
    snippet: 'Guides d’artisanat (crafts), actualités des snapshots, serveurs Minecraft français, skins, maps et textures en téléchargement gratuit.',
    icon: 'https://www.google.com/s2/favicons?domain=fr-minecraft.net&sz=64',
  },
  {
    keywords: ['roblox', 'roblox francais', 'jeux roblox', 'avatar roblox'],
    title: 'Roblox - Plateforme d’expériences immersives et créatives',
    url: 'https://www.roblox.com',
    source: 'roblox.com',
    snippet: 'Roblox est l’univers virtuel suprême qui vous permet de créer, de partager des expériences avec des amis et d’incarner tout ce que vous pouvez imaginer.',
    icon: 'https://www.google.com/s2/favicons?domain=roblox.com&sz=64',
  },
  {
    keywords: ['jeuxvideo', 'jeuxvideo.com', 'jvc', 'test jeux', 'actus gaming'],
    title: 'Jeuxvideo.com - Premier site d’actualité des jeux vidéo en France',
    url: 'https://www.jeuxvideo.com',
    source: 'jeuxvideo.com',
    snippet: 'Tests, astuces, soluces, guides complets et forums d’actualité pour PC, PS5, Xbox Series X, Nintendo Switch et mobiles.',
    icon: 'https://www.google.com/s2/favicons?domain=jeuxvideo.com&sz=64',
  },
  {
    keywords: ['steam', 'magasin steam', 'telecharger steam', 'jeux pc'],
    title: 'Bienvenue sur Steam - La plateforme de jeux PC numéro 1',
    url: 'https://store.steampowered.com/?l=french',
    source: 'steampowered.com',
    snippet: 'Steam est la plateforme de jeu en ligne ultime. Jouez, connectez-vous, créez et achetez des milliers de jeux vidéo à prix réduits.',
    icon: 'https://www.google.com/s2/favicons?domain=steampowered.com&sz=64',
  },

  // STREAMING & MUSIQUE
  {
    keywords: ['spotify', 'musique streaming', 'spotify web', 'playlist'],
    title: 'Spotify France - Écoutez de la musique et des podcasts gratuits',
    url: 'https://open.spotify.com',
    source: 'spotify.com',
    snippet: 'Spotify donne accès à des millions de titres musicaux et de podcasts en streaming haute fidélité sur tous vos appareils.',
    icon: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64',
  },
  {
    keywords: ['deezer', 'deezer france', 'musique francais', 'flow'],
    title: 'Deezer France - Musique en streaming illimité et haute définition',
    url: 'https://www.deezer.com/fr/',
    source: 'deezer.com',
    snippet: 'Plateforme française de streaming musical avec Flow personnalisé, paroles de chansons intégrées et plus de 90 millions de titres.',
    icon: 'https://www.google.com/s2/favicons?domain=deezer.com&sz=64',
  },
  {
    keywords: ['twitch', 'twitch tv', 'streamer', 'live gaming'],
    title: 'Twitch - Plateforme de streaming vidéo et direct gaming',
    url: 'https://www.twitch.tv',
    source: 'twitch.tv',
    snippet: 'Twitch est le lieu où des millions de personnes se réunissent en direct chaque jour pour discuter, échanger et interagir avec leurs créateurs favoris.',
    icon: 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=64',
  },
  {
    keywords: ['netflix', 'series', 'films streaming', 'cinema'],
    title: 'Netflix France - Regardez des séries et des films en ligne',
    url: 'https://www.netflix.com/fr/',
    source: 'netflix.com',
    snippet: 'Regardez des films et séries Netflix en streaming sur votre téléviseur, ordinateur, tablette ou smartphone à la demande.',
    icon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64',
  },
  {
    keywords: ['allocine', 'cinema', 'horaires cinema', 'bande annonce', 'seances'],
    title: 'AlloCiné - Horaires des séances cinéma, bandes-annonces et avis',
    url: 'https://www.allocine.fr',
    source: 'allocine.fr',
    snippet: 'Retrouvez toutes les bandes-annonces, les avis des spectateurs et de la presse, ainsi que les horaires des films dans les cinémas partout en France.',
    icon: 'https://www.google.com/s2/favicons?domain=allocine.fr&sz=64',
  },

  // E-COMMERCE & ANNONCES
  {
    keywords: ['leboncoin', 'le bon coin', 'petites annonces', 'occasion'],
    title: 'Leboncoin - Petites annonces gratuites en France',
    url: 'https://www.leboncoin.fr',
    source: 'leboncoin.fr',
    snippet: 'Premier site de petites annonces en France : immobilier, voitures d’occasion, électroménager, emploi, mode et services de proximité.',
    icon: 'https://www.google.com/s2/favicons?domain=leboncoin.fr&sz=64',
  },
  {
    keywords: ['amazon', 'amazon france', 'achat en ligne', 'livraison prime'],
    title: 'Amazon.fr - Achat en ligne avec livraison rapide Prime',
    url: 'https://www.amazon.fr',
    source: 'amazon.fr',
    snippet: 'Achetez des millions de produits : high-tech, livres, mode, maison, jeux vidéo avec livraison rapide et retours simples.',
    icon: 'https://www.google.com/s2/favicons?domain=amazon.fr&sz=64',
  },
  {
    keywords: ['fnac', 'livres fnac', 'billetterie concert', 'spectacles'],
    title: 'Fnac - Produits culturels, high-tech, livres et billetterie',
    url: 'https://www.fnac.com',
    source: 'fnac.com',
    snippet: 'Commandez vos livres, ordinateurs, smartphones, vinyles et billets de concerts et spectacles en retrait magasin ou livraison.',
    icon: 'https://www.google.com/s2/favicons?domain=fnac.com&sz=64',
  },

  // SERVICES PUBLICS & SANTE
  {
    keywords: ['doctolib', 'rendez vous medecin', 'medecin', 'dentiste', 'docteur'],
    title: 'Doctolib - Trouvez un médecin et prenez rendez-vous en ligne',
    url: 'https://www.doctolib.fr',
    source: 'doctolib.fr',
    snippet: 'Prenez rendez-vous en ligne chez un médecin généraliste, spécialiste, dentiste ou kinésithérapeute en cabinet ou téléconsultation.',
    icon: 'https://www.google.com/s2/favicons?domain=doctolib.fr&sz=64',
  },
  {
    keywords: ['service public', 'demarches administratives', 'carte identite', 'passeport'],
    title: 'Service-Public.fr - Le site officiel de l’administration française',
    url: 'https://www.service-public.fr',
    source: 'service-public.fr',
    snippet: 'Vos droits et démarches administratives expliqués clairement : papiers, citoyenneté, logement, travail, justice et impôts.',
    icon: 'https://www.google.com/s2/favicons?domain=service-public.fr&sz=64',
  },
  {
    keywords: ['ameli', 'securite sociale', 'assurance maladie', 'remboursement soins'],
    title: 'Ameli.fr - Le portail de l’Assurance Maladie',
    url: 'https://www.ameli.fr',
    source: 'ameli.fr',
    snippet: 'Consultez vos remboursements de soins, attestations de droits, carte Vitale et démarches de santé pour les particuliers.',
    icon: 'https://www.google.com/s2/favicons?domain=ameli.fr&sz=64',
  },
  {
    keywords: ['sncf', 'sncf connect', 'billet train', 'tgv', 'ter', 'voyage train'],
    title: 'SNCF Connect - Réservez vos billets de train TGV et TER',
    url: 'https://www.sncf-connect.com',
    source: 'sncf-connect.com',
    snippet: 'Achetez vos billets de train TGV INOUI, OUIGO, TER et visualisez les horaires de trains et perturbations en direct.',
    icon: 'https://www.google.com/s2/favicons?domain=sncf-connect.com&sz=64',
  },

  // CUISINE & RECETTES
  {
    keywords: ['marmiton', 'recette', 'cuisine', 'recettes cuisine', 'recette crepe', 'gateau'],
    title: 'Marmiton - 70 000 recettes de cuisine testées et approuvées',
    url: 'https://www.marmiton.org',
    source: 'marmiton.org',
    snippet: 'Trouvez facilement des recettes gourmandes du quotidien : desserts, entrées, plats avec vidéos, astuces et avis des cuisiniers.',
    icon: 'https://www.google.com/s2/favicons?domain=marmiton.org&sz=64',
  },

  // DEVELOPPEMENT & TECH
  {
    keywords: ['github', 'code', 'git', 'depot', 'programmation', 'open source'],
    title: 'GitHub - La plateforme collaborative pour développeurs',
    url: 'https://github.com',
    source: 'github.com',
    snippet: 'GitHub est la plateforme de développement logiciel la plus populaire au monde pour héberger du code, collaborer et déployer des projets.',
    icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
  },
  {
    keywords: ['chatgpt', 'openai', 'ia', 'intelligence artificielle', 'assistant'],
    title: 'ChatGPT - Modèle d’intelligence artificielle conversationnelle',
    url: 'https://chatgpt.com',
    source: 'chatgpt.com',
    snippet: 'Discutez avec l’IA d’OpenAI pour obtenir des réponses, rédiger des textes, programmer et explorer de nouvelles idées en français.',
    icon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64',
  },
  {
    keywords: ['discord', 'serveur discord', 'vocal', 'chat gaming'],
    title: 'Discord - Discutez et partagez avec vos communautés et amis',
    url: 'https://discord.com',
    source: 'discord.com',
    snippet: 'Discord est l’application idéale pour échanger par message, appel vocal ou vidéo dans des serveurs organisés par thème.',
    icon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=64',
  },
];

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

// Helper to sanitize Wikipedia HTML snippets
function cleanSnippet(htmlSnippet: string): string {
  return htmlSnippet
    .replace(/<span class="searchmatch">/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch search results client-side when no Node.js backend is active (e.g. GitHub Pages)
async function generateClientFrenchSearchResults(query: string): Promise<{
  results: LiveSearchResult[];
  instantAnswer?: any;
}> {
  const cleanQ = query.trim().toLowerCase();
  const tokens = cleanQ.split(/\s+/).filter(Boolean);
  const results: LiveSearchResult[] = [];
  const addedUrls = new Set<string>();

  let instantAnswer: any = null;

  // 1. Check curated French Web Index
  for (const entry of FRENCH_WEB_DIRECTORY) {
    const matchesKeyword = entry.keywords.some(
      (k) => cleanQ === k || cleanQ.includes(k) || k.includes(cleanQ) || tokens.some((t) => t.length >= 3 && k.includes(t))
    );

    if (matchesKeyword && !addedUrls.has(entry.url)) {
      addedUrls.add(entry.url);
      results.push({
        title: entry.title,
        url: entry.url,
        snippet: entry.snippet,
        source: entry.source,
        breadcrumb: entry.url,
        icon: entry.icon || `https://www.google.com/s2/favicons?domain=${entry.source}&sz=64`,
      });

      if (!instantAnswer && entry.knowledge) {
        instantAnswer = {
          heading: entry.knowledge.title,
          abstract: entry.knowledge.description,
          source: entry.knowledge.sourceName || 'Référence Vérifiée',
          url: entry.knowledge.sourceUrl || entry.url,
          image: entry.knowledge.imageUrl || null,
          entityType: entry.knowledge.subtitle || 'Site Officiel',
        };
      }
    }
  }

  // 2. Fetch live French Wikipedia Search API (articles with rich snippets)
  try {
    const wikiUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&origin=*&srlimit=6`;
    const wRes = await fetch(wikiUrl);
    if (wRes.ok) {
      const wData = await wRes.json();
      if (wData.query && Array.isArray(wData.query.search)) {
        for (const item of wData.query.search) {
          const articleUrl = `https://fr.wikipedia.org/wiki/${encodeURIComponent(
            item.title.replace(/ /g, '_')
          )}`;
          if (!addedUrls.has(articleUrl)) {
            addedUrls.add(articleUrl);
            const cleanedText = cleanSnippet(item.snippet);
            results.push({
              title: `${item.title} — Encyclopédie Wikipédia`,
              url: articleUrl,
              snippet:
                cleanedText.length > 20
                  ? cleanedText
                  : `Consultez l’article encyclopédique complet consacré à ${item.title} sur Wikipédia France.`,
              source: 'fr.wikipedia.org',
              breadcrumb: `https://fr.wikipedia.org/wiki/${item.title}`,
              icon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64',
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Wikipedia search fallback warning:', err);
  }

  // 3. Add direct Web Search actions so the user can easily reach any full search engine
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  if (!addedUrls.has(googleSearchUrl)) {
    addedUrls.add(googleSearchUrl);
    results.push({
      title: `Résultats Google pour « ${query} »`,
      url: googleSearchUrl,
      snippet: `Afficher l’ensemble des résultats de recherche web sur Google France pour votre requête « ${query} ».`,
      source: 'google.fr',
      breadcrumb: googleSearchUrl,
      icon: 'https://www.google.com/s2/favicons?domain=google.fr&sz=64',
    });
  }

  const ddgSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&kl=fr-fr`;
  if (!addedUrls.has(ddgSearchUrl)) {
    addedUrls.add(ddgSearchUrl);
    results.push({
      title: `Recherche web sécurisée DuckDuckGo pour « ${query} »`,
      url: ddgSearchUrl,
      snippet: `Consulter les résultats complets du web mondial avec protection intégrale de la vie privée sur DuckDuckGo.`,
      source: 'duckduckgo.com',
      breadcrumb: ddgSearchUrl,
      icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=64',
    });
  }

  const qwantSearchUrl = `https://www.qwant.com/?q=${encodeURIComponent(query)}&l=fr_fr`;
  if (!addedUrls.has(qwantSearchUrl)) {
    addedUrls.add(qwantSearchUrl);
    results.push({
      title: `Rechercher « ${query} » sur Qwant (Moteur Européen)`,
      url: qwantSearchUrl,
      snippet: `Explorez le web sans pistage grâce au moteur de recherche français et européen Qwant.`,
      source: 'qwant.com',
      breadcrumb: qwantSearchUrl,
      icon: 'https://www.google.com/s2/favicons?domain=qwant.com&sz=64',
    });
  }

  return { results, instantAnswer };
}

// Fetch real search results and instant answer
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
      )}&cx=${encodeURIComponent(googleSearchEngineId)}&q=${encodeURIComponent(cleanQuery)}&lr=lang_fr`;

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
      console.warn('Google Custom Search API error:', err);
    }
  }

  // 2. Real French Search via local backend proxy (active on Node.js / dev server)
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data: SearchApiResponse = await res.json();
        if (data.results && data.results.length > 0) {
          const mappedResults = data.results.map((r: any) => ({
            title: r.title,
            url: r.url,
            snippet: r.snippet,
            source: r.domain || 'Web',
            breadcrumb: r.url,
            icon: r.favicon || `https://www.google.com/s2/favicons?domain=${r.domain || 'web'}&sz=64`,
          }));
          webSearchCache.set(cacheKey, {
            results: mappedResults,
            instantAnswer: data.instantAnswer,
            ts: Date.now(),
          });
          return { results: mappedResults, instantAnswer: data.instantAnswer };
        }
      }
    }
  } catch (err) {
    // Expected on static hosting like GitHub Pages where /api/search returns 404
  }

  // 3. Robust French Client Fallback (Active on GitHub Pages / Static Hosting)
  const clientData = await generateClientFrenchSearchResults(cleanQuery);
  webSearchCache.set(cacheKey, {
    results: clientData.results,
    instantAnswer: clientData.instantAnswer,
    ts: Date.now(),
  });
  return clientData;
}

// Fetch real search results
export async function fetchLiveWebSearch(
  query: string,
  googleApiKey?: string,
  googleSearchEngineId?: string
): Promise<LiveSearchResult[]> {
  const payload = await fetchLiveSearchPayload(query, googleApiKey, googleSearchEngineId);
  return payload.results;
}

// Fetch real Image Search results
export async function fetchLiveImageSearch(query: string): Promise<LiveImageResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = cleanQuery.toLowerCase();
  const cached = imageSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.results;
  }

  // Try backend proxy if available
  try {
    const res = await fetch(`/api/images?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          imageSearchCache.set(cacheKey, { results: data.results, ts: Date.now() });
          return data.results;
        }
      }
    }
  } catch (err) {}

  // Fallback: Wikipedia French Image media API for the query
  try {
    const wikiUrl = `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      cleanQuery
    )}&prop=pageimages|images&pithumbsize=600&format=json&origin=*`;
    const wRes = await fetch(wikiUrl);
    if (wRes.ok) {
      const wData = await wRes.json();
      const pages = wData.query?.pages;
      if (pages) {
        const pageKey = Object.keys(pages)[0];
        const page = pages[pageKey];
        if (page?.thumbnail?.source) {
          const results: LiveImageResult[] = [
            {
              title: page.title || query,
              image: page.thumbnail.source,
              thumbnail: page.thumbnail.source,
              url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
              source: 'fr.wikipedia.org',
              width: page.thumbnail.width,
              height: page.thumbnail.height,
            },
          ];
          imageSearchCache.set(cacheKey, { results, ts: Date.now() });
          return results;
        }
      }
    }
  } catch (err) {}

  return [];
}

// Fetch Knowledge Graph dynamically from curated base, Wikipedia REST API or Instant Answer
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

  // 1. Check curated exact matches in French Directory
  for (const entry of FRENCH_WEB_DIRECTORY) {
    if (entry.knowledge && (clean === entry.knowledge.title?.toLowerCase() || entry.keywords.includes(clean))) {
      const k = entry.knowledge;
      const result: KnowledgeGraphData = {
        title: k.title || query,
        subtitle: k.subtitle || 'Entité vérifiée',
        description: k.description || entry.snippet,
        sourceName: k.sourceName || 'Référence Vérifiée',
        sourceUrl: k.sourceUrl || entry.url,
        imageUrl: k.imageUrl,
        attributes: k.attributes || [],
      };
      kgCache.set(clean, { data: result, ts: Date.now() });
      return result;
    }
  }

  // 2. Use prefetched instant answer if provided
  if (preFetchedInstantAnswer && preFetchedInstantAnswer.abstract) {
    const result: KnowledgeGraphData = {
      title: preFetchedInstantAnswer.heading || query,
      subtitle: preFetchedInstantAnswer.entityType || 'Synthèse Documentaire',
      description: preFetchedInstantAnswer.abstract,
      sourceName: preFetchedInstantAnswer.source || 'Référence',
      sourceUrl: preFetchedInstantAnswer.url || `https://fr.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      imageUrl: preFetchedInstantAnswer.image || undefined,
      attributes: [
        { label: 'Source', value: preFetchedInstantAnswer.source || 'Documentation vérifiée' },
        { label: 'Type', value: preFetchedInstantAnswer.entityType || 'Information vérifiée' },
      ],
    };
    kgCache.set(clean, { data: result, ts: Date.now() });
    return result;
  }

  // 3. Fetch live Wikipedia French REST Summary API
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.extract && data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
        const result: KnowledgeGraphData = {
          title: data.title || query,
          subtitle: data.description || 'Article encyclopédique',
          description: data.extract,
          sourceName: 'Wikipédia France',
          sourceUrl: data.content_urls?.desktop?.page || `https://fr.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          imageUrl: data.thumbnail?.source,
          attributes: [
            { label: 'Source', value: 'Encyclopédie Wikipédia France' },
            { label: 'Langue', value: 'Français' },
          ],
        };
        kgCache.set(clean, { data: result, ts: Date.now() });
        return result;
      }
    }
  } catch (e) {
    console.warn('Wikipedia summary error:', e);
  }

  return null;
}
