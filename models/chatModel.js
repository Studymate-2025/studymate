// 📁 파일: models/chatModel.js (이렇게 수정하세요!)

const db = require("../utils/db");

const saveMessage = async ({ roomId, senderEmail, content, messageType }) => {
    const sql = `
        INSERT INTO chat_messages (chat_room_id, sender_email, content, message_type)
        VALUES (?, ?, ?, ?)
    `;
    await db.query(sql, [roomId, senderEmail, content, messageType || "text"]);
};

const getMessagesByRoomId = async (roomId) => {
    const sql = `
        SELECT m.id, m.sender_email AS sender, u.nickname, m.content, m.message_type, m.created_at, u.profile_picture_url AS profileUrl
        FROM chat_messages m
        JOIN users u ON m.sender_email = u.email
        WHERE m.chat_room_id = ?
        ORDER BY m.created_at ASC
    `;
    const [rows] = await db.query(sql, [roomId]);
    return rows;
};


const createChatRoom = async (studyId) => {
    const sql = `INSERT INTO chat_rooms (study_id) VALUES (?)`;
    await db.query(sql, [studyId]);
};

const getChatRoomsByUser = async (email) => {
    const sql = `
        SELECT cr.id AS room_id, s.id AS study_id, s.name AS study_name,
               s.representative_image, s.current_participants, s.max_participants,
               (SELECT content FROM chat_messages m 
                WHERE m.chat_room_id = cr.id 
                ORDER BY created_at DESC 
                LIMIT 1) AS last_message,
               (SELECT DATE_FORMAT(created_at, '%H:%i') FROM chat_messages m 
                WHERE m.chat_room_id = cr.id 
                ORDER BY created_at DESC 
                LIMIT 1) AS time
        FROM chat_rooms cr
        JOIN study s ON cr.study_id = s.id
        JOIN study_participants sp ON s.id = sp.study_id
        WHERE sp.participant_email = ?
    `;
    const [rows] = await db.query(sql, [email]);
    return rows;
};

const insertChatMessage = ({ roomId, sender, messageType, content }) => {
    const sql = `
        INSERT INTO chat_messages (chat_room_id, sender_email, message_type, content)
        VALUES (?, ?, ?, ?)
    `;
    return db.query(sql, [roomId, sender, messageType, content]);
};


module.exports = {
    saveMessage,
    getMessagesByRoomId,
    createChatRoom,
    getChatRoomsByUser,
    insertChatMessage, // 이 줄이 반드시 있어야 합니다.
};