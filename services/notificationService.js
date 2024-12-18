const webPush = require('web-push');

// VAPID 키 설정
webPush.setVapidDetails(
    'mailto:your-email@example.com', // 관리자의 이메일
    process.env.VAPID_PUBLIC_KEY,   // 환경 변수로 관리되는 VAPID 공개 키
    process.env.VAPID_PRIVATE_KEY  // 환경 변수로 관리되는 VAPID 개인 키
);

/**
 * 푸쉬 알림 전송
 * @param {Array<Object>} subscriptions - 알림 대상 고객의 구독 정보 리스트
 * @param {Object} payload - 알림의 제목과 본문
 * @returns {Promise<void>}
 */
exports.sendPushNotifications = async (subscriptions, payload) => {
    try {
        if (!subscriptions || subscriptions.length === 0) {
            console.log('푸쉬 알림 대상 없음.');
            return;
        }

        // 각 구독 정보에 대해 푸쉬 알림 전송
        const sendPromises = subscriptions.map((subscription) => {
            return webPush.sendNotification(subscription, JSON.stringify(payload))
                .then(() => console.log('푸쉬 알림 전송 성공:', subscription.endpoint))
                .catch((error) => console.error('푸쉬 알림 전송 실패:', subscription.endpoint, error));
        });

        await Promise.all(sendPromises); // 모든 푸쉬 알림 전송이 완료될 때까지 대기
    } catch (error) {
        console.error('푸쉬 알림 전송 오류:', error);
        throw new Error('푸쉬 알림 전송 중 오류가 발생했습니다.');
    }
};
