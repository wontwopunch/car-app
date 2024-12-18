const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { ensureAuthenticated, ensureAgent } = require('../middleware/authMiddleware');

// 설계사 메인 페이지 렌더링
router.get('/', ensureAuthenticated, ensureAgent, agentController.renderAgentPage);

// 고객 검색
router.get('/search', ensureAuthenticated, ensureAgent, agentController.searchCustomer);

// 특정 날짜의 고객 리스트
router.get('/date-customers', ensureAuthenticated, ensureAgent, agentController.getDateCustomers);

// 특정 고객 상세 정보
router.get('/customer/:id', ensureAuthenticated, ensureAgent, agentController.getCustomerDetails);

// 오늘 만기 고객 리스트
router.get('/today-expiries', ensureAuthenticated, ensureAgent, agentController.getTodayExpiries);

// 달력 이벤트 데이터 제공
router.get('/calendar-events', ensureAuthenticated, ensureAgent, agentController.getCalendarEvents);

// 달력 데이터 제공
router.get('/calendar-data', ensureAuthenticated, ensureAgent, agentController.getCalendarData);

module.exports = router;
