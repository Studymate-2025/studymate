const chatModel = require("../models/chatModel");
const minioClient = require('../utils/minio');
const path = require('path');
const { getIo } = require("../sockets/socketServer"); // <--- getIo 함수 임포트
const userModel = require("../models/userModel"); // <--- userModel 임포트



exports.getMessagesByRoom = async (req, res) => {
    const { roomId } = req.params;

    try {
        const messages = await chatModel.getMessagesByRoomId(roomId);
        res.status(200).json(messages);
    } catch (err) {
        console.error("❌ 메시지 조회 실패:", err);
        res.status(500).json({ message: "서버 오류" });
    }
};

exports.getUserChatRooms = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "이메일이 필요합니다." });
  }

  try {
    const rooms = await chatModel.getChatRoomsByUser(email);
    res.status(200).json(rooms);
  } catch (err) {
    console.error("채팅방 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 📁 파일: controllers/chatController.js

exports.uploadChatFile = async (req, res) => {
    try {
        const { roomId, sender, message_type } = req.body; // sender는 이메일

        if (!req.file || !roomId || !sender || !message_type) {
            return res.status(400).json({ message: '필수 데이터 누락' });
        }

        const originalName = path.basename(req.file.originalname);
        const objectName = `chat/${Date.now()}-${originalName}`;

        await minioClient.putObject(
            'studymate',
            objectName,
            req.file.buffer,
            req.file.size,
            { 'Content-Type': req.file.mimetype }
        );

        const fileUrl = `http://tetraplace.com:9000/studymate/${objectName}`;

        // 1. DB에 메시지 저장
        await chatModel.insertChatMessage({
            roomId,
            sender: sender,
            messageType: message_type,
            content: fileUrl, // fileUrl을 content에 저장
        });

        // 2. 소켓을 통해 모든 클라이언트에게 메시지 브로드캐스트
        const io = getIo(); // io 인스턴스 가져오기
        if (io) {
            const user = await userModel.getUserInfoByEmail(sender); // 사용자 정보 조회
            const nickname = user ? user.nickname : sender;
            const profileUrl = user ? user.profile_picture_url : null;
            const currentTime = new Date();
            const timeFormatted = currentTime.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true }); // 안드로이드와 동일한 시간 포맷

            const fullMessage = {
                sender: sender,
                content: fileUrl,
                message_type: message_type,
                nickname: nickname,
                profileUrl: profileUrl, // <--- 이 부분이 추가되었습니다.
                time: timeFormatted // <--- 이 부분도 추가되었습니다.
            };

            io.to(roomId).emit('chatMessage', fullMessage);
            console.log(`✅ 파일 메시지 브로드캐스트됨 (방: ${roomId}): ${JSON.stringify(fullMessage)}`);
        } else {
            console.error("❌ Socket.io 인스턴스를 찾을 수 없습니다. 파일 메시지 브로드캐스트 실패.");
        }

        res.status(200).json({ message: '업로드 성공', url: fileUrl });

    } catch (err) {
        console.error('🔥 파일 업로드 실패:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};