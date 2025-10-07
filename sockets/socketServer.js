const { Server } = require("socket.io");
const { registerChatHandlers } = require("./chatSocket");
const { registerVideoHandlers } = require("./videoCallSocket");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("✅ 연결됨:", socket.id);

    registerChatHandlers(socket, io);
    registerVideoHandlers(socket, io);
  });
  
  return io; // <<-- 1. 이 줄을 추가해주세요.
}

function getIo() {
  if (!io) { // <<-- 2. io가 없을 경우를 대비한 방어 코드 추가 (선택사항이지만 권장)
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

// ✅ 여기가 핵심!!
module.exports = { initSocket, getIo };