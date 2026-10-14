// Riyadh Sky Watch service worker: network first, cached shell as a fallback when offline.
var CACHE = 'skywatch-v2';
self.addEventListener('install', function (e) { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png']).catch(function () {}); })); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) { try { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); } catch (x) {} return r; }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); }); }));
});
