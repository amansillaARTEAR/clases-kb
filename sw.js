// Service worker mínimo: permite instalar la app y pide siempre la última versión de la página (sin usar copias guardadas).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { if (e.request.mode === 'navigate') e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => fetch(e.request))); });
