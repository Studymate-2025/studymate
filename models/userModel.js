// 📁 파일: models/userModel.js (새로 만들거나 수정)
const db = require('../utils/db');

exports.getUserInfoByEmail = async (email) => {
    const sql = `
        SELECT nickname, profile_picture_url
        FROM users
        WHERE email = ?
    `;
    const [rows] = await db.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
};