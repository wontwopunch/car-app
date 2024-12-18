require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs'); // 파일 시스템 모듈 추가
const User = require('./models/User');
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const agentRoutes = require('./routes/agent');
const uploadRoutes = require('./routes/upload');

const app = express();
const logDirectory = path.join(__dirname, 'logs');

// 로그 디렉토리 생성
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// 로그 파일 스트림 생성
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

// 환경 변수 검증
if (!process.env.MONGO_URI || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    console.error('필수 환경 변수가 누락되었습니다. .env 파일 또는 환경 변수를 확인하세요.');
    process.exit(1);
}

// 데이터베이스 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB 연결 성공');
        createDefaultAdmin(); // 초기 관리자 생성
    })
    .catch((err) => console.error('MongoDB 연결 실패:', err));

// 초기 관리자 계정 생성 함수
async function createDefaultAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const admin = new User({
                name: '관리자',
                username: process.env.ADMIN_USERNAME,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin',
            });
            await admin.save();
            console.log(`초기 관리자 계정이 생성되었습니다. (아이디: ${process.env.ADMIN_USERNAME}, 비밀번호: ${process.env.ADMIN_PASSWORD})`);
        } else {
            console.log('관리자 계정이 이미 존재합니다.');
        }
    } catch (error) {
        console.error('초기 관리자 생성 중 오류:', error);
    }
}

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); // CORS 지원

// 로그 설정
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: accessLogStream })); // 로그 파일로 기록
} else {
    app.use(morgan('dev')); // 콘솔에 로그 출력
}

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));


// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }, // HTTPS 환경에서는 true로 설정 필요
}));

// 기본 경로를 로그인 페이지로 리다이렉트
app.get('/', (req, res) => {
    res.redirect('/login');
});

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // 정적 파일 캐싱 기간
}));


// 저장 경로 확인 및 생성
const savePath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
}

// 업로드 라우트 연결
app.use('/upload', uploadRoutes);

// 라우트 연결
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/agent', agentRoutes);

// 404 에러 핸들링
app.use((req, res, next) => {
    res.status(404).render('404', { error: '페이지를 찾을 수 없습니다. 요청한 경로를 확인해주세요.' });
});

// 전역 에러 핸들링
app.use((err, req, res, next) => {
    console.error('서버 오류:', err.stack); // 서버 로그에 에러 출력
    res.status(500).render('500', { error: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' });
});


// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
