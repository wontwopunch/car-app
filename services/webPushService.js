const webpush = require('web-push');

// VAPID 키 설정
webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * 푸쉬 알림 전송
 * @param {Object} subscription - 사용자 구독 정보
 * @param {Object} payload - 알림 제목 및 내용
 * @returns {Promise}
 */
exports.sendPushNotification = (subscription, payload) => {
    const payloadString = JSON.stringify(payload);

    return webpush.sendNotification(subscription, payloadString).catch(err => {
        console.error('Push Notification Error:', err);
    });
};
