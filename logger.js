const winston = require('winston');
const Transport = require('winston-transport');

// 메모리에 최근 로그를 저장할 배열
const logs = [];
const MAX_LOGS = 200; // 메모리에 보관할 최대 로그 수

let io = null;

// Socket.IO 클라이언트로 로그를 전송하는 커스텀 Winston Transport
class SocketIoTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // 메모리에 로그 저장 (최대 개수 유지)
    logs.unshift(info);
    if (logs.length > MAX_LOGS) {
      logs.pop();
    }
    
    // 연결된 클라이언트가 있으면 새 로그를 즉시 전송
    if (io) {
      io.of('/logs').emit('new_log', info);
    }

    callback();
  }
}

// Winston 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${typeof info.message === 'object' ? JSON.stringify(info.message, null, 2) : info.message}`)
  ),
  transports: [
    new winston.transports.Console(), // 기존처럼 콘솔에도 출력
    new SocketIoTransport({})
  ],
});

// 외부에서 Socket.IO 인스턴스를 주입하고, 기존 로그를 전송하는 함수
function initLogger(socketIoInstance) {
  io = socketIoInstance;
  
  // --- 진단 로그 추가 ---
  // '/logs' 네임스페이스에 클라이언트 연결 시도를 감지합니다.
  io.of('/logs').on('connection', (socket) => {
    // 이 로그가 서버 터미널에 보이면, 브라우저의 접속 시도가 서버까지 성공적으로 도달했다는 뜻입니다.
    logger.info(`[Socket.IO] 로그 뷰어 클라이언트 접속 성공: ${socket.id}`);

    // 접속한 클라이언트에게 기존 로그를 보내줍니다.
    socket.emit('init_logs', logs);

    socket.on('disconnect', () => {
      logger.warn(`[Socket.IO] 로그 뷰어 클라이언트 접속 해제: ${socket.id}`);
    });
  });
  // --------------------
}

module.exports = { logger, initLogger };
