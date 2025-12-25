const APP_VERSION = '3.5.2.2';
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
    (async () => {

      const cache = await caches.open(CACHE_NAME);

      try {

        await cache.addAll(APP_ASSETS);

      } catch (error) {

        console.error('PD Service Worker: Caching of primary assets failed. Interrupting SW installation...', error);
        throw error;
      }

      await self.skipWaiting();

      // Lazy-load non-critical assets in the background

      try {

        await cache.addAll(APP_ASSETS_LAZY);
        
      } catch (error) {

        console.warn('PD Service Worker: Lazy-loading of assets interrupted', error);
      }
    })()
  );
});

// Activate service worker, clear outdated caches, claim all pages

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {

      const cacheKeys = await caches.keys();

      await Promise.all(
        cacheKeys
          .filter(cacheKey => cacheKey.startsWith(CACHE_PREFIX) && cacheKey !== CACHE_NAME)
          .map(async cacheKey => {
            console.log(`PD Service Worker:\n\n` +
              `Cached version: v.${cacheKey.slice(CACHE_PREFIX.length).split('').join('.')}\n\n` +
              `Current version: v.${APP_VERSION}\n\n` +
              `Clearing outdated cached files...`);
            await caches.delete(cacheKey);
          })
      );

      await self.clients.claim();
    })()
  );
});

// Handle service worker fetch requests

self.addEventListener('fetch', event => {

  const { request } = event;
  const url = new URL(request.url);

  // Handle offline behavior of analytics

  if (url.hostname.includes('gc.zgo.at') || url.hostname.includes('goatcounter.com')) {
    
    if (self.location.hostname === 'localhost' ||
        self.location.hostname.match(/127\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      
      event.respondWith(new Response(null, { status: 204, statusText: 'No Content' }));
      return;
    }

    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(null, { status: 204, statusText: 'No Content' });
      })
    );
    return;
  }

  // Filter out unrelated requests

  if (request.method !== 'GET') {
    return;
  }

  // Handle navigation: Serve cached HTML for main app sections, fall back to launch screen

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {

        const navCachedResponse =
          await caches.match('index.html');

        if (navCachedResponse) {
          return navCachedResponse;
        }

        try {
          await fetch('index.html');

        } catch (error) {

          console.warn(
            `PD Service Worker:\n\n` +
            `Failed to fetch page from network, falling back to cached response`
          );

          return navCachedResponse;
        }
      })()
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
      await appCache.put(request, networkResponse.clone());
      console.log(
        `PD Service Worker:\n\n` +
        `Tune DB successfully updated\n\n` +
        `Date: ${networkResponse.headers.get('Date')}`
      );
      return networkResponse;
    }
  } catch (error) {
    console.log(
      `PD Service Worker:\n\n` +
      `Fetch unsuccessful. Falling back to cached version of Tune DB`
    );
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
  const cachedAsset = await caches.match(request, { ignoreSearch: true });

  if (cachedAsset) {
    return cachedAsset;
  }

  // Get assets from network, fix headers if needed
  try {
  
    // Try fetching assets from network
    const networkResponse = await fetch(request);
    return networkResponse;
  
  } catch (error) {
  
    // Use fallbacks for specific cases

    if (request.destination === 'script' ||
        request.destination === 'json' ||
        request.destination === 'font') {

      const cacheKey = new Request(request.url, {
        method: 'GET',
        mode: 'same-origin',
        cache: 'only-if-cached',
        credentials: 'omit'
      });

      const fallbackResponse =
        await caches.match(cacheKey);

      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    if (request.destination === 'image') {
      return await caches.match('assets/screens/placeholder-offline-pd.webp');
    }

    // Return a generic failed response if no fallback is available

    console.warn(`PD Service Worker\n\nOffline: No cached assets available for this ${request.destination? request.destination : 'item'}`, error);

    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {
  const date = cachedResponse.headers.get('date');
  if (!date) return true;
  return (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24) >= maxAgeInDays;
}