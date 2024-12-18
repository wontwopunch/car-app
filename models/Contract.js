const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 구분 (예: 다이렉트, 일반 등)
    startDate: { type: Date, required: true }, // 보험 시작일자
    endDate: { type: Date, required: true }, // 보험 만기일자
    insuranceCompany: { type: String, required: true }, // 보험회사
    name: { type: String, required: true }, // 고객성함
    idNumber: { type: String, required: true }, // 주민번호
    contact: { type: String, required: true }, // 연락처
    vehicle: { type: String, required: true }, // 차량
    vehicleNumber: { type: String, required: true }, // 차량번호
    agent: { type: String, required: true }, // 설계사 이름
    premium: { type: Number, required: true }, // 보험료
    driverScope: { type: String, required: true }, // 운전자범위
    coveragePerson1: { type: String, required: true }, // 대인1
    coveragePerson2: { type: String, required: true }, // 대인2
    coverageProperty: { type: String, required: true }, // 대물배상
    coverageSelf: { type: String, required: true }, // 자상
    coverageUninsured: { type: String, required: true }, // 무보
    coverageCar: { type: String, required: true }, // 자차
    emergencyService: { type: String, required: true }, // 긴급출동
    expiryDays: { type: Number, required: true }, // 만기일수
    subscription: { // 푸쉬 알림 구독 정보
        endpoint: { type: String },
        keys: {
            p256dh: { type: String },
            auth: { type: String },
        },
    },
}, { timestamps: true }); // 생성일 및 수정일 자동 추가

module.exports = mongoose.model('Contract', ContractSchema);
