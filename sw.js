/* Offline support: after one visit with a connection, the whole app runs with no signal.
 * Serves from the cache first and refreshes it in the background, so updates arrive on the next open.
 * Bump VERSION to force a clean cache. */
const VERSION = 'lb-v1';
const SHELL = ['./', 'index.html', 'style.css', 'problems.js', 'words.js', 'content.js', 'app.js',
  'assets/logo.png', 'assets/icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => {
    const net = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
