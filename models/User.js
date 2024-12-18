const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true }, // 사용자 이름 (설계사 이름)
    username: { type: String, unique: true, required: true }, // 사용자 아이디
    password: { type: String, required: true }, // 비밀번호
    role: { type: String, enum: ['admin', 'agent'], default: 'agent' }, // 사용자 역할 (관리자/admin 또는 설계사/agent)
    isActive: { type: Boolean, default: true }, // 사용자 활성화 여부
}, { timestamps: true }); // 생성일 및 수정일 자동 추가

// 비밀번호 암호화
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// 비밀번호 검증
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
