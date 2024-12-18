const Contract = require('../models/Contract');

// 설계사 메인 페이지 렌더링
exports.renderAgentPage = (req, res) => {
    try {
        res.render('agent'); // views/agent.ejs 렌더링
    } catch (error) {
        console.error('설계사 페이지 렌더링 오류:', error);
        res.status(500).send('서버 오류');
    }
};

// 고객 검색
exports.searchCustomer = async (req, res) => {
    const { query } = req.query;

    try {
        if (!query) {
            return res.status(400).json({ error: '검색어를 입력하세요.' });
        }

        const customers = await Contract.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { vehicleNumber: { $regex: query, $options: 'i' } },
            ],
        });

        if (customers.length === 0) {
            return res.status(404).json({ error: '검색 결과가 없습니다.' });
        }

        res.json(customers);
    } catch (error) {
        console.error('고객 검색 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};

// 특정 날짜의 고객 리스트
exports.getDateCustomers = async (req, res) => {
    const { date } = req.query;

    try {
        if (!date) {
            return res.status(400).json({ error: '날짜를 입력하세요.' });
        }

        const customers = await Contract.find({ endDate: date });

        if (customers.length === 0) {
            return res.status(404).json({ error: '해당 날짜에 만기 고객이 없습니다.' });
        }

        res.json(customers);
    } catch (error) {
        console.error('날짜별 고객 검색 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};


// 설계사 별 달력 데이터 제공
exports.getCalendarData = async (req, res) => {
    const agentName = req.session.agentName; // 로그인된 설계사 이름
    if (!agentName) {
        return res.status(401).send('로그인되지 않았습니다.');
    }

    try {
        const contracts = await Contract.find({ agent: agentName });
        res.json(
            contracts.map(contract => ({
                date: contract.endDate.toISOString().split('T')[0], // YYYY-MM-DD
                customerName: contract.name,
            }))
        );
    } catch (err) {
        console.error('달력 데이터 조회 오류:', err);
        res.status(500).send('서버 오류');
    }
};


// 특정 고객 상세 정보
exports.getCustomerDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await Contract.findById(id);

        if (!customer) {
            return res.status(404).json({ error: '고객 정보를 찾을 수 없습니다.' });
        }

        res.json(customer);
    } catch (error) {
        console.error('고객 상세 정보 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};

// 오늘 만기 고객 리스트
exports.getTodayExpiries = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD)
        const customers = await Contract.find({ endDate: today });

        if (customers.length === 0) {
            return res.status(404).json({ error: '오늘 만기인 고객이 없습니다.' });
        }

        res.json(customers);
    } catch (error) {
        console.error('오늘 만기 고객 검색 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};

// 달력 이벤트 데이터 제공
exports.getCalendarEvents = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: '연도와 월이 필요합니다.' });
        }

        // 요청한 연도와 월의 시작 및 끝 날짜 계산
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // 해당 기간의 만기 고객 데이터 검색
        const events = await Contract.aggregate([
            {
                $match: {
                    endDate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$endDate' } },
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json(events);
    } catch (error) {
        console.error('달력 이벤트 데이터 제공 오류:', error);
        res.status(500).json({ error: '달력 이벤트 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
};
