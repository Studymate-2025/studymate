const redis = require('../utils/redis');         // Redis 연결
const sendEmail = require('../utils/mailer');    // 이메일 전송 함수
const { v4: uuidv4 } = require('uuid');          // 랜덤 인증코드 생성용 (uuid)
const validator = require('validator');          // 이메일 유효성 검사
const bcrypt = require('bcrypt');
const db = require('../utils/db');
const jwt = require('jsonwebtoken');
const parseRRN = require('../utils/rrnParser');


/**
 * 이메일 인증번호 전송 API
 * 1. 이메일 형식 검증
 * 2. 인증번호 생성
 * 3. Redis에 저장 (5분 TTL)
 * 4. 이메일로 전송
 */
exports.sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    // 이메일 유효성 검사
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
    }

    // 인증번호 생성 (간단하게 6자리 숫자)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Redis에 인증번호 저장 (5분 동안 유지)
    await redis.set(`verify:${email}`, verificationCode, { EX: 300 });

    // 이메일 전송
    await sendEmail(
      email,
      '[StudyMate] 이메일 인증번호입니다',
      `인증번호: ${verificationCode}`
    );

    console.log(`✅ ${email} → 인증번호 전송 완료`);
    return res.status(200).json({ message: '인증번호가 이메일로 전송되었습니다.' });
  } catch (error) {
    console.error('❌ 인증번호 전송 실패:', error);
    return res.status(500).json({ message: '서버 오류로 이메일 전송에 실패했습니다.' });
  }
};

/**
 * 이메일 인증번호 확인 API
 * 1. Redis에서 인증번호 가져옴
 * 2. 입력값과 비교
 * 3. 일치하면 인증 완료, Redis에서 제거
 */
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: '이메일과 인증번호를 모두 입력해주세요.' });
    }

    const savedCode = await redis.get(`verify:${email}`);

    if (!savedCode) {
      return res.status(400).json({ message: '인증번호가 만료되었거나 존재하지 않습니다.' });
    }

    if (savedCode !== code) {
      return res.status(401).json({ message: '인증번호가 일치하지 않습니다.' });
    }

    await redis.del(`verify:${email}`); // 인증 성공 후 삭제
    return res.status(200).json({ message: '이메일 인증 성공!' });
  } catch (error) {
    console.error('❌ 인증 확인 실패:', error);
    return res.status(500).json({ message: '서버 오류로 인증에 실패했습니다.' });
  }
};

// authController.js에 아래만 추가하면 됨
exports.register = (req, res) => {
  res.status(200).json({ message: '임시 register 입니다!' });
};


/**
 * 회원가입 임시 정보 저장 (페이지별)
 * - email을 기반으로 Redis에 누적 저장
 * - 30분 TTL
 * body: { email, step, value }
 */
// controllers/authController.js
exports.tempStore = async (req, res) => {
  try {
    const { email, step, value } = req.body;

    if (!email || !step || value === null || typeof value === 'undefined') {
      return res.status(400).json({ message: 'email, step, value는 필수입니다.' });
    }

    const existing = await redis.get(`signup:${email}`);
    const parsed = existing ? JSON.parse(existing) : {};

    parsed[step] = value;
    await redis.set(`signup:${email}`, JSON.stringify(parsed), { EX: 1800 });

    return res.status(200).json({ message: '✅ 저장 완료' });
  } catch (err) {
    console.error('❌ tempStore 오류:', err);
    return res.status(500).json({ message: '서버 오류' });
  }
};


exports.register = async (req, res) => {
  try {
    const { email, profile_url } = req.body;

    const data = await redis.get(`signup:${email}`);
    if (!data) {
      return res.status(400).json({ message: '임시 회원가입 데이터가 없습니다.' });
    }

    const parsed = JSON.parse(data);
    const { password, name, birth, nickname } = parsed;

    if (!password || !name || !birth || !nickname) {
      return res.status(400).json({ message: '모든 필수 정보를 입력해야 합니다.' });
    }

    const hashedPw = await bcrypt.hash(password, 10);



    const sql = `INSERT INTO users (email, password, name, birth, nickname, profile_picture_url)
             VALUES (?, ?, ?, ?, ?, ?)`;  // ✅ 6개 컬럼
    await db.query(sql, [email, hashedPw, name, birth, nickname, profile_url]); 

    await redis.del(`signup:${email}`);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    return res.status(201).json({
      message: '회원가입 완료!',
      token,
    });

  } catch (err) {
    console.error('❌ register 실패:', err);
    return res.status(500).json({ message: '서버 오류' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({
        message: '존재하지 않는 계정입니다.',
        success: false
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: '비밀번호가 일치하지 않습니다.',
        success: false
      });
    }

    return res.status(200).json({
      message: '로그인 성공',
      success: true,
      hasNickname: !!user.nickname , // 닉네임 존재 여부
      nickname: user.nickname
    });

  } catch (err) {
    console.error('❌ 로그인 중 오류:', err);
    return res.status(500).json({
      message: '서버 오류',
      success: false
    });
  }
};

