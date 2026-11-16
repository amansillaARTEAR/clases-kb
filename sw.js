// Service worker mínimo: permite instalar la app. No guarda copias, así siempre se ve la última versión.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
