// 📁 파일: sockets/chatSocket.js (이렇게 수정하세요!)

const { insertChatMessage, saveMessage } = require("../models/chatModel"); // insertChatMessage도 가져옵니다.
const { getUserInfoByEmail } = require("../models/userModel"); // userModel에서 사용자 정보 가져오기

function registerChatHandlers(socket, io) {
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`➡️ 채팅방 참가: ${roomId}`);
    });

    socket.on("chatMessage", async (data) => {
        console.log("📩 메시지 수신됨:", data);
        const { roomId, message } = data; // message: { sender, content, message_type }
        const { sender, content, message_type } = message;

        try {
            // 1. DB에 메시지 저장
            // chatModel.saveMessage 대신 insertChatMessage를 사용하는 것이 일관적입니다.
            await insertChatMessage({
                roomId,
                sender: sender, // sender_email로 저장될 것임
                content: content,
                messageType: message_type || "text",
            });

            // 2. 발신자 정보 (닉네임, 프로필 URL) 조회
            const user = await getUserInfoByEmail(sender);
            const nickname = user ? user.nickname : sender;
            const profileUrl = user ? user.profile_picture_url : null;
            const currentTime = new Date();
            const timeFormatted = currentTime.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true }); // 안드로이드와 동일한 시간 포맷
            const type = sender === '본인 이메일' ? 1 : 0;

            // 3. 클라이언트에게 브로드캐스트할 메시지 객체 구성
            const messageToBroadcast = {
                sender: sender,
                content: content,
                message_type: message_type,
                nickname: nickname,
                profileUrl: profileUrl, // <--- 이 부분이 추가되었습니다.
                time: timeFormatted, // <--- 이 부분도 추가되었습니다.
                type: type
            };

            // 4. 해당 채팅방의 모든 클라이언트에게 메시지 브로드캐스트
            io.to(roomId).emit("chatMessage", messageToBroadcast);
            console.log(`✅ 채팅 메시지 브로드캐스트됨 (방: ${roomId}): ${JSON.stringify(messageToBroadcast)}`);

        } catch (err) {
            console.error("❌ DB 저장 및 브로드캐스트 실패:", err);
        }
    });

    // ... (필요하다면 다른 chat 관련 소켓 핸들러)
}

module.exports = { registerChatHandlers };