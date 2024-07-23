const CACHE_NAME = 'pd-cache-v.3.1.3';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'assets/icons/icons.svg',
        
        'components/dm-modals/dm-modals.css',
        'components/dm-modals/dm-modals.js',
        'components/dm-popovers/dm-popovers.css',
        'components/dm-popovers/dm-popovers.js',
        'components/dm-search/dm-search.css',
        'components/dm-search/dm-search.js',
        'components/dm-tracklist/dm-tracklist.css',
        'components/dm-tracklist/dm-tracklist.js',
        'modules/aria-tools.js',
        'modules/dm-app.js',
        'modules/dm-toolkit.js',
        'styles/dm-themes-override.css',
        'styles/dm-toolkit.css',
        'styles/tools-common-styles.css',
        'index.html'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => { 
                console.log(`PD Service Worker:\n` +
                `Clearing outdated cached files\n` +
                `Cached version: ${cacheName.slice(16)}\n` +
                `Current version: ${CACHE_NAME.slice(16)}`);
                caches.delete(cacheName);
            })
        );
      })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Activate new service worker on page reload
        self.clients.claim().then(() => {
            // Stop the old service worker, notify about version change in console 
            console.log(`PD Service Worker: Cache version updated to ${CACHE_NAME.slice(9)}`);
            self.registration.unregister().then(() => {
                self.skipWaiting();
            });
        })
    );
});

self.addEventListener('fetch', (event) => {

  // Cache and retrieve JSON files

  if (event.request.url.endsWith('tunes.json') || 
      event.request.url.endsWith('tracks.json') || 
      event.request.url.endsWith('collections.json') ||
      event.request.url.endsWith('references.json') ||
      event.request.url.endsWith('helper.json')) {
      event.respondWith(
        // Check if the file is already cached
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            // If found in cache and not older than 7 days, retrieve it from cache
            if (cachedResponse && !isCacheExpired(cachedResponse, 7)) {
              console.log(`PD Service Worker:\n\n` + `Retrieving saved Tune database from cache`);
              return cachedResponse;
            }
            // If not found in cache or outdated, try to retrieve a fresh copy
            console.warn(`PD Service Worker: Tune database missing or outdated.\n\n` + `Trying to fetch a fresh version`);
            return fetchWithTimeout(event.request, 60000)
              .then((networkResponse) => {
                if (navigator.onLine && networkResponse && networkResponse.ok) {
                  // Clone the network response without accessing its body
                  const responseHeaders = new Headers(networkResponse.headers);
                  responseHeaders.set('Date', new Date().toUTCString());
                  // Create a new Response object with the cloned headers and the body stream
                  const responseWithDateHeader = new Response(networkResponse.body, {
                    status: networkResponse.status,
                    statusText: networkResponse.statusText,
                    headers: responseHeaders,
                  });
                  // Update cache with the fresh response
                  cache.put(event.request, responseWithDateHeader.clone());
                  console.log(`PD Service Worker:\n\n` + `Tune database successfully updated`);
                  return responseWithDateHeader;
                }
  
                // If fetch fails or navigator is offline, fall back to cached version
                console.warn(`PD Service Worker: Fetch error caught.\n\n` + `Retrieving saved Tune database from cache`);
                return cachedResponse;
              })
              .catch((error) => {
                console.error(`PD Service Worker: Fetch error caught.\n\n` + error);
                // Fall back to cached version if fetch throws an error
                if (cachedResponse) {
                  console.warn(`PD Service Worker: Falling back to cached Tune database due to fetch error`);
                  return cachedResponse;
                }
                // If no cached response, return an error response
                return new Response('Fetch error: No cached Tune database available', {
                  status: 400,
                  statusText: 'Fetch error and no cached Tune database available',
                });
              });
          });
        })
      );

  } else {
      event.respondWith(
          caches.match(event.request).then((response) => {
              // console.log("PD Service Worker: Loading cached version of the file");
              return response || fetch(event.request);
          })
      );
  }
});

// Helper function to check if a cached response is expired

function isCacheExpired(cachedResponse, maxAgeInDays) {

    const cacheDateHeader = cachedResponse.headers.get('date');

    if (cacheDateHeader) {
      const cacheDate = new Date(cacheDateHeader);
      const currentDate = new Date();
      const differenceInDays = (currentDate - cacheDate) / (1000 * 60 * 60 * 24);
      console.log(`Date of cached Tune database:\n\n` + cacheDate);
      return differenceInDays >= maxAgeInDays;
    }

    return false;
  }

  // Helper function preventing infinite loading if connection is lost during fetch request

  function fetchWithTimeout(request, timeout) {
    return Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out`)), timeout)
      ),
    ]);
  }