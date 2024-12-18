const multer = require('multer');

// Multer 메모리 스토리지 설정
const storage = multer.memoryStorage();

// Multer 설정
const upload = multer({
    storage, // 메모리 스토리지 사용
    limits: { fileSize: 10 * 1024 * 1024 }, // 파일 크기 제한 (10MB)
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // 허용 MIME 타입
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('지원하지 않는 파일 형식입니다.'));
        }
        cb(null, true); // 파일 허용
    },
});

module.exports = upload;
