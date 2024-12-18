const User = require('../models/User');
const Contract = require('../models/Contract');
const xlsx = require('xlsx');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

// 관리자 페이지 렌더링
exports.renderAdminPage = [
    ensureAuthenticated,
    ensureAdmin,
    async (req, res) => {
        try {
            const agents = await User.find({ role: 'agent' });
            const pushSettings = { push30: true, push7: true, push3: true };
            res.render('admin', { agents, pushSettings, uploadMessage: null });
        } catch (error) {
            console.error('관리자 페이지 렌더링 오류:', error);
            res.status(500).send('서버 오류');
        }
    },
];

// 설계사 추가
exports.addAgent = [
    ensureAuthenticated,
    ensureAdmin,
    async (req, res) => {
        const { name, id: username, password } = req.body;

        try {
            const newAgent = new User({ name, username, password, role: 'agent' });
            await newAgent.save();
            res.redirect('/admin');
        } catch (error) {
            console.error('설계사 추가 오류:', error);
            res.status(500).send('설계사 추가 실패');
        }
    },
];

// 설계사 삭제
exports.deleteAgent = [
    ensureAuthenticated,
    ensureAdmin,
    async (req, res) => {
        const { id } = req.params;

        try {
            await User.findByIdAndDelete(id);
            res.redirect('/admin');
        } catch (error) {
            console.error('설계사 삭제 오류:', error);
            res.status(500).send('설계사 삭제 실패');
        }
    },
];

// 설계사 비밀번호 변경
exports.changePassword = [
    ensureAuthenticated,
    ensureAdmin,
    async (req, res) => {
        const { id } = req.params;
        const { newPassword } = req.body;

        try {
            const agent = await User.findById(id);
            if (!agent) return res.status(404).send('설계사를 찾을 수 없습니다.');

            agent.password = newPassword;
            await agent.save();
            res.redirect('/admin');
        } catch (error) {
            console.error('비밀번호 변경 오류:', error);
            res.status(500).send('비밀번호 변경 실패');
        }
    },
];

// 엑셀 파일 업로드
exports.uploadExcel = [
    ensureAuthenticated,
    ensureAdmin,
    async (req, res) => {
        try {
            console.log('파일 업로드 처리 시작');

            // 업로드된 파일 정보 디버깅
            console.log('업로드된 파일 정보:', req.file);

            // 엑셀 파일 읽기
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            console.log('엑셀 데이터 파싱 완료:', sheetData);

            // 중복 데이터 체크 및 저장
            for (const row of sheetData) {
                try {
                    const existingContract = await Contract.findOne({
                        name: row['고객성함'],
                        vehicleNumber: row['차량번호'],
                        insuranceCompany: row['보험회사'],
                        endDate: new Date((row['보험만기일자'] - 25569) * 86400 * 1000) // Excel 날짜 변환
                    });

                    if (existingContract) {
                        console.log('중복 데이터 발견, 저장 생략:', row);
                        continue;
                    }

                    const newContract = new Contract({
                        type: row['구분'],
                        startDate: new Date((row['보험시작일자'] - 25569) * 86400 * 1000), // Excel 날짜 변환
                        endDate: new Date((row['보험만기일자'] - 25569) * 86400 * 1000),   // Excel 날짜 변환
                        insuranceCompany: row['보험회사'],
                        name: row['고객성함'],
                        idNumber: row['주민번호'],
                        contact: row['연락처'],
                        vehicle: row['차량'],
                        vehicleNumber: row['차량번호'],
                        agent: row['설계사'],
                        premium: parseFloat(row['보험료'] || 0), // 숫자로 변환, 기본값 0
                        driverScope: row['운전자범위'] || '미지정', // 기본값 설정
                        coveragePerson1: row['대인1'],
                        coveragePerson2: row['대인2'],
                        coverageProperty: row['대물배상'],
                        coverageSelf: row['자상'],
                        coverageUninsured: row['무보'],
                        coverageCar: row['자차'],
                        emergencyService: row['긴급출동'] || '없음', // 기본값 설정
                        expiryDays: parseInt(row['만기일수'] || '0', 10), // 숫자로 변환, 기본값 0
                    });

                    console.log('저장 중 데이터:', newContract);
                    await newContract.save();
                } catch (saveError) {
                    console.error('개별 데이터 저장 실패:', row, saveError);
                }
            }

            console.log('엑셀 데이터 저장 완료');
            res.redirect('/admin');
        } catch (error) {
            console.error('엑셀 업로드 오류:', error);
            res.status(500).send('엑셀 업로드 실패');
        }
    },
];



// 푸쉬 알림 설정
exports.setPushSettings = [
    ensureAuthenticated,
    ensureAdmin,
    async (req, res) => {
        const { push30, push7, push3 } = req.body;

        try {
            console.log('푸쉬 알림 설정:', { push30, push7, push3 });
            res.redirect('/admin');
        } catch (error) {
            console.error('푸쉬 알림 설정 오류:', error);
            res.status(500).send('푸쉬 알림 설정 실패');
        }
    },
];
