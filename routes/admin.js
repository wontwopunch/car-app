const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

// Multer 설정: 메모리 저장소를 사용하여 파일 업로드 처리
const upload = multer({ storage: multer.memoryStorage() });

// 관리자 페이지 렌더링
router.get('/', ensureAuthenticated, ensureAdmin, adminController.renderAdminPage);

// 설계사 추가
router.post('/add-agent', ensureAuthenticated, ensureAdmin, adminController.addAgent);

// 설계사 삭제
router.post('/delete-agent/:id', ensureAuthenticated, ensureAdmin, adminController.deleteAgent);

// 설계사 비밀번호 변경
router.post('/change-password/:id', ensureAuthenticated, ensureAdmin, adminController.changePassword);

// 엑셀 파일 업로드
router.post('/upload', ensureAuthenticated, ensureAdmin, upload.single('file'), adminController.uploadExcel);

// 푸쉬 알림 설정
router.post('/set-push', ensureAuthenticated, ensureAdmin, adminController.setPushSettings);

module.exports = router;
