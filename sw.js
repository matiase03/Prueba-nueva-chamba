const CACHE_NAME = 'recetario-v2';
const BASE = '/Recetario-chamba';

const FILES = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/styles.css',
  BASE + '/utils.js',
  BASE + '/recetas-data.js',
  BASE + '/locales-data.js',
  BASE + '/render.js',
  BASE + '/calculadora.js',
  BASE + '/pedidos.js',
  BASE + '/mensaje.js',
  BASE + '/admin.js',
  BASE + '/pwa.js',
  BASE + '/main.js',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
