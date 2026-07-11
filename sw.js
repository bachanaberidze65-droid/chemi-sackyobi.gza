// მინიმალური Service Worker — მხოლოდ იმისთვის, რომ:
// 1) ბრაუზერმა შესთავაზოს "დაყენება" (Install / Add to Home Screen)
// 2) ინტერნეტის დროებითი გაწყვეტისას მაინც გაიხსნას აპის გარსი (index.html)
// ცოცხალი მონაცემები (Firebase) ყოველთვის ქსელიდან იტვირთება — არაფერს ვქეშავთ საიდან,
// რომ მომხმარებელმა ძველი მონაცემები არასდროს დაინახოს.

const SHELL_CACHE = 'sackyobi-shell-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) => cache.addAll(['./', './index.html']))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // მხოლოდ გვერდის ჩატვირთვას (navigation) ვამუშავებთ ოფლაინ fallback-ით.
    // ყველა დანარჩენი მოთხოვნა (Firebase, xlsx.js და ა.შ.) პირდაპირ ქსელზე გადის.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
    }
});
