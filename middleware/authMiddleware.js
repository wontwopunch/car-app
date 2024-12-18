// 인증 확인
exports.ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); // 인증되지 않은 경우 로그인 페이지로 리다이렉트
};

// 관리자 권한 확인
exports.ensureAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('403', { error: '관리자만 접근 가능합니다.' });
};

// 설계사 권한 확인
exports.ensureAgent = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'agent') {
        return next();
    }
    res.status(403).render('403', { error: '설계사만 접근 가능합니다.' });
};
