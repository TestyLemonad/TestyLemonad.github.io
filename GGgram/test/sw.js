const CACHE_NAME = 'gggram-v2';
const ASSETS = [
    './Invaid.html',
    './icon.png',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    // REST-запросы к Firebase всегда идут в сеть (никакого кеша)
    if (req.url.includes('firebasedatabase.app')) return;

    // HTML — network-first, при оффлайне отдаём кеш
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        e.respondWith(
            fetch(req).then(r => {
                const copy = r.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(()=>{});
                return r;
            }).catch(() => caches.match(req).then(r => r || caches.match('./Invaid.html')))
        );
        return;
    }
    // Остальное — cache-first
    e.respondWith(
        caches.match(req).then(r => r || fetch(req).then(resp => {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(()=>{});
            return resp;
        }).catch(() => r))
    );
});
