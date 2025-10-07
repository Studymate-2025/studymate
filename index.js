const express = require('express');
const http = require("http");
const path = require('path');
const app = express();
const server = http.createServer(app);
require('dotenv').config();

const { initSocket } = require("./sockets/socketServer");
const io = initSocket(server); 

const { logger, initLogger } = require('./logger');
initLogger(io);

// 1. API 라우터를 먼저 등록합니다.
app.use(express.json()); // JSON 파싱

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const studyRouter = require('./routes/study');
const chatRoutes = require('./routes/chat');
const socketRoutes = require('./routes/socket');

// '/api'로 시작하는 경로는 API 요청으로 처리합니다.
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/study', studyRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/socket', socketRoutes); 

// 2. 개발용 로그 뷰어 라우터를 등록합니다.
app.get('/logs', (req, res) => {
  logger.info('로그 페이지 접속 확인', {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>실시간 서버 로그</title>
      <meta charset="utf-8">
      <style>
        body { font-family: monospace; background-color: #1E1E1E; color: #D4D4D4; margin: 0; padding: 1em; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; }
        h1 { color: #569CD6; margin: 0; }
        #logs { list-style: none; padding: 0; margin: 0; margin-top: 1em; }
        .log-item { white-space: pre-wrap; padding: 5px 10px; border-bottom: 1px solid #333; }
        .log-item.info { color: #D4D4D4; }
        .log-item.warn { color: #F8B447; }
        .log-item.error { color: #F44747; background-color: #401010; }
        .copy-btn { background-color: #3C3C3C; color: #CCC; border: 1px solid #666; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-family: monospace; }
        .copy-btn:hover { background-color: #555; }
      </style>
    </head>
    <body>
      <div class="header"><h1>실시간 서버 로그</h1><button id="copy-logs-btn" class="copy-btn">전체 로그 복사</button></div>
      <ul id="logs"></ul>
      <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
      <script>
        const logsContainer = document.getElementById('logs');
        const socket = io('/logs');
        const addLog = (log) => { const item = document.createElement('li'); item.className = 'log-item ' + (log.level || 'info'); item.textContent = log.message || JSON.stringify(log); logsContainer.prepend(item); };
        socket.on('init_logs', (logs) => { logsContainer.innerHTML = ''; logs.forEach(addLog); });
        socket.on('new_log', (log) => { addLog(log); });
        const copyBtn = document.getElementById('copy-logs-btn');
        copyBtn.addEventListener('click', () => {
          const logItems = document.querySelectorAll('#logs .log-item');
          const logsInOrder = Array.from(logItems).reverse();
          const allLogsText = logsInOrder.map(item => item.textContent).join('\\n');
          navigator.clipboard.writeText(allLogsText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 복사 완료!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
          }).catch(err => { console.error('클립보드 복사 실패:', err); alert('로그 복사에 실패했습니다.'); });
        });
      </script>
    </body>
    </html>
  `);
});

// 3. 마지막으로, React 프론트엔드를 제공하는 코드를 둡니다.

// ✅ 수정된 경로: __dirname과 같은 레벨에 있는 build 폴더를 찾습니다.
const buildPath = path.join(__dirname, 'build');

// 3-1. 빌드된 React 앱의 정적 파일들을 제공합니다.
app.use(express.static(buildPath));

// 3-2. 위에서 정의된 API, logs 경로를 제외한 모든 요청에 대해
// React 앱의 'index.html'을 보냅니다. 이 코드는 다른 모든 라우터보다 뒤에 위치해야 합니다.
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`✅ 통합 서버가 포트 ${PORT}에서 시작되었습니다.`);
  logger.info(`➡️ 로그 확인 URL: (서버주소)/logs`);
});

