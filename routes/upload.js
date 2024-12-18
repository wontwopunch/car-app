const express = require('express');
const path = require('path');
const fs = require('fs');
const upload = require('../config/multer'); // Multer 설정 가져오기

const router = express.Router();

// 업로드 처리 라우트
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer; // 메모리에 저장된 파일 데이터
        const originalName = req.file.originalname; // 업로드된 파일의 원래 이름

        // 원하는 경로에 파일 저장
        const savePath = path.resolve(__dirname, '../uploads', originalName);
        fs.writeFileSync(savePath, fileBuffer);

        res.status(200).json({
            message: '파일 업로드 성공',
            filePath: savePath, // 저장된 파일 경로
        });
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
