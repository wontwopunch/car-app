const Contract = require('../models/Contract');
const webPushService = require('../services/webPushService');

exports.sendNotification = async (req, res) => {
    const { daysBeforeExpiry } = req.body;

    try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + parseInt(daysBeforeExpiry, 10));
        const targetDateString = targetDate.toISOString().split('T')[0];

        // 만기일이 targetDate와 일치하는 계약 조회
        const customers = await Contract.find({ endDate: targetDateString });
        if (customers.length === 0) {
            return res.status(404).json({ message: '알림 대상이 없습니다.' });
        }

        // 알림 내용 설정
        const title = `보험 만기 알림 (${daysBeforeExpiry}일 전)`;
        const body = `만기 고객: ${customers.map((c) => c.name).join(', ')}`;
        const payload = { title, body };

        // 구독 정보 가져오기
        const subscriptions = customers
            .filter((customer) => customer.subscription) // 구독 정보가 있는 고객만 필터링
            .map((customer) => customer.subscription);

        // 푸쉬 알림 전송
        const notificationPromises = subscriptions.map((subscription) =>
            webPushService.sendPushNotification(subscription, payload)
        );

        await Promise.all(notificationPromises);

        res.status(200).json({ message: '푸쉬 알림이 성공적으로 전송되었습니다.' });
    } catch (error) {
        console.error('푸쉬 알림 전송 오류:', error);
        res.status(500).json({ error: '푸쉬 알림 전송 중 오류가 발생했습니다.' });
    }
};
