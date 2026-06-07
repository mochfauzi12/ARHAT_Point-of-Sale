const CACHE_NAME = 'arhat-pos-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // For now, always try network first, then fallback to cache
      return fetch(event.request).catch(() => response);
    })
  );
});
