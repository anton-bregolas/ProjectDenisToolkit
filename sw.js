const APP_VERSION = '3.5.1.0';
const CACHE_VERSION = APP_VERSION.replaceAll(".", '');
const CACHE_PREFIX = "pdt-cache-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CACHE_EXPIRES_DAYS = 30;

const APP_ASSETS = [
  'index.html',
  'assets/icons/icons.svg',
  'modules/dm-app.js',
  'modules/dm-toolkit.js',
  'styles/dm-toolkit.css',
  'styles/tools-common-styles.css',
  'styles/dm-themes-override.css',
  'components/dm-helper/dm-helper.css',
  'components/dm-helper/dm-helper.js',
  'components/dm-modals/dm-modals.css',
  'components/dm-modals/dm-modals.js',
  'components/dm-popovers/dm-popovers.css',
  'components/dm-popovers/dm-popovers.js',
  'components/dm-search/dm-search.css',
  'components/dm-search/dm-search.js',
  'components/dm-tracklist/dm-tracklist.css',
  'components/dm-tracklist/dm-tracklist.js',
  'modules/aria-tools.js',
  'version.json'
];

const APP_ASSETS_LAZY = [
  'assets/fonts/Lato-Regular.ttf',
  'assets/fonts/Lato-Bold.ttf',
  'assets/images/dm-helper-mango.webp',
  'assets/images/dm-helper-purple.webp',
  'assets/images/dm-helper-green.webp',
  'assets/images/dm-helper-blue.webp',
  'assets/images/dm-helper-pink.webp',
  'assets/screens/placeholder-offline-pd.webp',
  'assets/icons/android-chrome-192x192-maskable.png',
  'assets/icons/android-chrome-192x192.png',
  'assets/icons/android-chrome-512x512-maskable.png',
  'assets/icons/android-chrome-512x512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/safari-pinned-tab.svg',
  'favicon.ico',
  'favicon.svg',
  'app.webmanifest'
];

// Install service worker with critical assets
// Skip waiting to activate service worker immediately
// Keep loading low-priority assets after activation

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .then(() => {
        caches.open(CACHE_NAME).then(cache => {
          cache.addAll(APP_ASSETS_LAZY).catch(error => {
            console.warn(`PD Service Worker: Lazy-loading of assets interrupted`, error);
          });
        });
      })
  );
});

// Activate service worker, clear outdated caches, claim all pages

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
    .then(cacheKeys => Promise.all(
      cacheKeys
        .filter(cacheKey => cacheKey.startsWith(CACHE_PREFIX) && cacheKey !== CACHE_NAME)
        .map(cacheKey => {
          console.log(`PD Service Worker:\n\n` +
          `Cached version: v.${cacheKey.slice(CACHE_PREFIX.length).split('').join('.')}\n\n` +
          `Current version: v.${APP_VERSION}\n\n` +
          `Clearing outdated cached files...`);
          return caches.delete(cacheKey);
        }))
    ).then(() => self.clients.claim())
  );
});

// Handle service worker fetch requests

self.addEventListener('fetch', (event) => {

  const { request } = event;
  const url = new URL(request.url);

  // Handle offline behavior of analytics

  if (request.method === 'POST' && url.pathname.includes('goatcounter.com')) {
    event.respondWith(
      navigator.onLine
        ? fetch(request).catch(() => new Response(''))
        : new Response('', { status: 200 })
    );
    return;
  }

  // Handle navigation: Serve cached HTML for main app sections, fall back to launch screen

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html')
        .then(navResponse => navResponse || caches.match('index.html'))
    );
    return;
  }

  // Handle Tune DB files

  if (/(tunes|tracks|collections|references|helper)\.json$/.test(url.pathname)) {
    event.respondWith(handleDBCaching(request));
    return;
  }

  // Handle all other assets

  event.respondWith(handleAssetCaching(request));
});

// Cache and retrieve up-to-date Tune DB files

async function handleDBCaching(request) {

  const appCache = await caches.open(CACHE_NAME);

  // Serve DB from cache if not outdated, use offline-safe lookup

  const cachedDB = await caches.match(request, { ignoreSearch: true });

  if (cachedDB && !isCacheExpired(cachedDB, CACHE_EXPIRES_DAYS)) {
    console.log(
      `PD Service Worker:\n\n` +
      `Retrieving cached version of Tune DB`
    );
    return cachedDB;
  }

  // Fetch up-to-date DB from network, fall back to cached DB
  
  try {
    console.log(
      `PD Service Worker:\n\n` +
      `Tune DB missing or outdated\n\n` +
      `Fetching a fresh version...`
    );
    const networkResponse = await fetch(request);
    if (networkResponse?.ok) {
      appCache.put(request, networkResponse.clone());
      console.log(
        `PD Service Worker:\n\n` +
        `Tune DB successfully updated`
      );
      return networkResponse;
    }
  } catch (error) {
    console.log(
      `PD Service Worker:\n\n` +
      `Fetch unsuccessful. Falling back to cached version of Tune DB`);
  }

  if (cachedDB) {
    return cachedDB;
  }

  return new Response(
    JSON.stringify({ error: 'Offline: No cached Tune DB available' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

// Fetch app assets from network or cache with offline-safe request

async function handleAssetCaching(request) {

  // Get assets from cache, ignoring search parameters

  const cachedAsset =
    await caches.match(request, { ignoreSearch: true });

  if (cachedAsset) {
    return cachedAsset;
  }

  // Get assets from network, fix headers if needed

  try {

    // Try fetching assets from network

    const networkResponse = await fetch(request);
    return networkResponse;

  } catch(error) {

    // Use fallbacks for specific cases

    if (request.destination === 'script' || request.destination === 'font') {

      const cacheKey = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        mode: 'same-origin',
        credentials: request.credentials,
        cache: 'only-if-cached',
        redirect: request.redirect
      });

      const fallbackResponse =
        await caches.match(cacheKey);

      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    if (request.destination === 'image') {
      return caches.match('assets/screens/placeholder-offline-pd.webp');
    }

    console.warn(`PD Service Worker\n\nOffline: No cached assets available for this <${request.destination}>`, error);
  }
}

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {
  const date = cachedResponse.headers.get('date');
  if (!date) return true;
  return (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24) >= maxAgeInDays;
}