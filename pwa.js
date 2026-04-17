if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE_NAME = 'recetario-v1';
    const FILES = ['/Recetario-chamba/', '/Recetario-chamba/index.html'];
    self.addEventListener('install', e => {
      e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)));
      self.skipWaiting();
    });
    self.addEventListener('activate', e => {
      e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ));
      self.clients.claim();
    });
    self.addEventListener('fetch', e => {
      e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
    });
  `;
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl).catch(() => {});
}
