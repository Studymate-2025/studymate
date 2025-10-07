const nodemailer = require('nodemailer');

/**
 * Nodemailer를 사용해 Gmail SMTP로 이메일 전송 설정
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,   // .env에 저장된 Gmail 주소
    pass: process.env.SMTP_PASS    // 앱 비밀번호 (Gmail에서 생성한 비밀번호)
  }
});

/**
 * 이메일 전송 함수
 * @param {string} to - 수신자 이메일 주소
 * @param {string} subject - 이메일 제목
 * @param {string} text - 이메일 본문 내용
 */
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: `"StudyMate" <${process.env.SMTP_USER}>`, // 보낸 사람 이름 + 주소
      to,               // 받을 사람 주소
      subject,          // 제목
      text              // 본문
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ 이메일 전송 완료 → ${to}`);
  } catch (error) {
    console.error(`❌ 이메일 전송 실패:`, error);
    throw error; // 나중에 에러 핸들링에 활용
  }
};

module.exports = sendEmail;
