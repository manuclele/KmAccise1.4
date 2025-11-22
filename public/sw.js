
const CACHE_NAME = 'camion-km-v9';
const URLS_TO_CACHE = [
  '.',
  './index.html'
];

// Installazione: Mette in cache le risorse statiche vitali
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza l'attivazione immediata del nuovo SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .catch((err) => console.log('Errore cache install:', err))
  );
});

// Attivazione: Pulisce le vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Rimozione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prende il controllo immediato delle pagine aperte
  );
});

// Fetch: Strategia Network First (cerca online, se fallisce usa cache)
self.addEventListener('fetch', (event) => {
  // Gestiamo solo richieste GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se la rete funziona, aggiorniamo la cache per la prossima volta
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se siamo offline, usiamo la cache
        return caches.match(event.request)
          .then((cachedResponse) => {
             if (cachedResponse) return cachedResponse;
             
             // Se è una navigazione (apertura pagina) e non c'è rete, mostra la home (SPA)
             if (event.request.mode === 'navigate') {
                 return caches.match('./index.html');
             }
          });
      })
  );
});