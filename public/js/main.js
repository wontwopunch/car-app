if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/service-worker.js').then(swReg => {
        console.log('Service Worker Registered', swReg);

        return swReg.pushManager.getSubscription().then(subscription => {
            if (subscription === null) {
                // VAPID 공개 키를 사용하여 새로운 구독 생성
                const vapidPublicKey = 'YOUR_PUBLIC_VAPID_KEY'; // .env 파일에서 가져옴
                const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

                return swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedKey
                });
            } else {
                return subscription; // 기존 구독 반환
            }
        }).then(subscription => {
            // 서버로 구독 정보 저장
            return fetch('/save-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription })
            });
        }).then(() => {
            console.log('Subscription saved on server.');
        }).catch(error => {
            console.error('Subscription Error:', error);
        });
    }).catch(error => {
        console.error('Service Worker Registration Error:', error);
    });
}

// VAPID 키 변환 도우미 함수
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
