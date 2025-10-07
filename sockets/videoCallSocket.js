const socketModel = require('../models/socketModel');

function registerVideoHandlers(socket, io) {
  socket.on('register', ({ email }) => {
  console.log('✅ register 이벤트 수신:', email, socket.id);
  socket.email = email; // 이렇게 직접 붙여줘야 socket.email 사용 가능
  socketModel.setSocketId(email, socket.id);
});

  socket.on('disconnect', () => {
    console.log('❌ 소켓 연결 종료:', socket.id);
    socketModel.removeSocketId(socket.id);
  });
socket.on('call:offer', async ({ to, sdp, type, studyName, studyImageUrl }) => {
  console.log("✅ 수신한 studyName:", studyName);
  console.log("✅ 수신한 studyImageUrl:", studyImageUrl);
  console.log("📩 call:offer 수신: to =", to);

  try {
    const targetSocketId = await socketModel.getSocketId(to); // Redis에서 socketId 조회

    if (targetSocketId) {
      io.to(targetSocketId).emit('call:offer', {
        from: socket.id,
        fromEmail: socket.email,
        sdp,
        type,
        studyName,        // 추가
        studyImageUrl,    // 추가
        participantCount: 2,           // 👈 현재 인원 (서버에서 계산해서 넣어줘도 됨)
        maxParticipants: 4,           // 👈 최대 인원
        startedAt: Date.now()         // 👈 시작 시간
      });
      console.log(`📨 call:offer sent to socketId=${targetSocketId}`);
    } else {
      console.log(`❌ Redis에 socketId 없음: ${to}`);
    }
  } catch (err) {
    console.error("❌ call:offer 처리 중 Redis 오류:", err);
  }
});

socket.on('call:answer', async ({ to, sdp, type }) => {
    console.log("📩 call:answer 수신:", to);
    try {
      const targetSocketId = await socketModel.getSocketId(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call:answer', {
          from: socket.id,
          sdp,
          type
        });
        console.log(`📨 call:answer sent to socketId=${targetSocketId}`);
      } else {
        console.log(`❌ Redis에 socketId 없음: ${to}`);
      }
    } catch (err) {
      console.error("❌ call:answer 처리 중 Redis 오류:", err);
    }
  });

  // ✅ 추가: call:decline 처리 (거절했을 때)
  socket.on('call:decline', async ({ to }) => {
    console.log("📩 call:decline 수신:", to);
    try {
      const targetSocketId = await socketModel.getSocketId(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call:decline', { from: socket.id });
        console.log(`📨 call:decline sent to socketId=${targetSocketId}`);
      } else {
        console.log(`❌ Redis에 socketId 없음: ${to}`);
      }
    } catch (err) {
      console.error("❌ call:decline 처리 중 Redis 오류:", err);
    }
  });

  socket.on('peer:ice', async ({ to, candidate, sdpMid, sdpMLineIndex }) => {
  console.log("📩 peer:ice 수신:", to);
  try {
    const targetSocketId = await socketModel.getSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('peer:ice', {
        from: socket.id,
        candidate,
        sdpMid,
        sdpMLineIndex
      });
      console.log(`📨 peer:ice 전달 완료 → ${targetSocketId}`);
    } else {
      console.log(`❌ Redis에 socketId 없음: ${to}`);
    }
  } catch (err) {
    console.error("❌ peer:ice 처리 중 Redis 오류:", err);
  }
});

socket.on('call:end', async ({ to }) => {
  console.log("📩 call:end 수신: to =", to);

  try {
    const targetSocketId = await socketModel.getSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:end', { from: socket.id });
      console.log(`📨 call:end 전송 완료 → ${targetSocketId}`);
    } else {
      console.log(`❌ Redis에 socketId 없음: ${to}`);
    }
  } catch (err) {
    console.error("❌ call:end 처리 중 오류:", err);
  }
});


}

module.exports = { registerVideoHandlers };
