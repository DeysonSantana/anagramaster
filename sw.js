// ==========================================================================
// SW.JS - Service Worker PWA (Offline-First Resiliente)
// Estratégia: Cache-First com Network Fallback e Limpeza Atômica de Cache
// ==========================================================================

const CACHE_NAME = 'anagram-master-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/themes.css',
  './js/app.js',
  './js/audio.js',
  './js/themeManager.js',
  './js/anagramEngine.js',
  './js/dictionary.js',
  './js/lzString.js',
  './js/qrcodeEngine.js',
  './js/shareManager.js',
  './js/offlineManager.js',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png'
];

// Instalação: Cacheia todos os assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando assets da aplicação...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação: Limpa caches obsoletos de versões anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Removendo cache obsoleto:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições: Cache-First
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET e esquemas como chrome-extension://
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Se for resposta válida, salva uma cópia no cache dinamicamente
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback para página raiz caso ocorra falha de rede na navegação
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
