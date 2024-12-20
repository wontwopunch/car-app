const CACHE_VERSION = 'v1';
const CACHE_NAME = `pwa-cache-${CACHE_VERSION}`;
const CACHE_ASSETS = [
    '/',
    '/login',
    '/css/style.css',
    '/js/main.js',
    '/images/icons/icon-192x192.png',
    '/images/icons/badge-72x72.png'
];

// 설치 이벤트: 캐싱 처리
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 설치 완료');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] 자원 캐싱 중');
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

// 활성화 이벤트: 오래된 캐시 제거
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 활성화 완료');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] 오래된 캐시 삭제 중:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 요청 가로채기 및 캐시 제공
self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] 요청 가로채기:', event.request.url);
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // 네트워크 응답을 캐시에 저장
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // 네트워크 실패 시 캐시 반환
                return caches.match(event.request).then((cachedResponse) => {
                    return cachedResponse || caches.match('/offline.html');
                });
            })
    );
});

// 푸쉬 알림 수신 처리
self.addEventListener('push', (event) => {
    console.log('[Service Worker] 푸쉬 알림 수신');
    const data = event.data ? event.data.json() : {};
    const title = data.title || '푸쉬 알림';
    const options = {
        body: data.body || '내용 없음',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// 푸쉬 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] 푸쉬 알림 클릭');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // 이미 열린 창이 있으면 포커스, 없으면 새 창 열기
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow('/');
        })
    );
});
