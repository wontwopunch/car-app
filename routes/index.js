const express = require('express');
const router = express.Router();
const User = require('../models/User'); // User 모델 추가
const notificationController = require('../controllers/notificationController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// 로그인 페이지 렌더링
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/agent');
    }
    res.render('login', { error: null });
});

// 로그인 요청 처리
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }); // User 모델 사용
        if (!user || !(await user.comparePassword(password))) {
            return res.render('login', { error: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        req.session.user = { id: user._id, role: user.role };
        res.redirect(user.role === 'admin' ? '/admin' : '/agent');
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).render('login', { error: '서버 오류가 발생했습니다.' });
    }
});

// 로그아웃
router.get('/logout', ensureAuthenticated, (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// 푸쉬 알림 처리
router.post('/send-notification', ensureAuthenticated, notificationController.sendNotification);

module.exports = router;
