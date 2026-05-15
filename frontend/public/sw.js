// Self-unregistering service worker.
//
// The site previously shipped a Workbox-generated PWA service worker that
// precached index.html and intercepted every navigation — which made
// /sitemap.xml, /robots.txt, etc. return the SPA shell for logged-in users.
// This file replaces that SW. The browser auto-fetches /sw.js to check for
// updates; when it sees this body, it installs this as the new SW and then
// the activate handler tears it down so future loads are served straight by
// the network.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (e) {
      // ignore
    }
    try {
      await self.registration.unregister();
    } catch (e) {
      // ignore
    }
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    } catch (e) {
      // ignore
    }
  })());
});
