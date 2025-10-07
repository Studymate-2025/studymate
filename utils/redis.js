const redis = require('redis');

// Redis 클라이언트 생성 (socket 방식 + .env 정보 기반)
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  password: process.env.REDIS_PASSWORD || undefined
});

// Redis 연결
redisClient.connect()
  .then(() => {
    return redisClient.select(process.env.REDIS_DB || 0);
  })
  .then(() => {
    console.log('✅ Redis 연결 완료');

    // 💡 연결 유지용 ping (4분마다)
    setInterval(() => {
      redisClient.ping()
        .then(() => console.log('🔄 Redis ping'))
        .catch(err => console.error('❌ Redis ping 실패:', err));
    }, 240000); // 240000ms = 4분
  })
  .catch((err) => {
    console.error('❌ Redis 연결 실패:', err);
  });

// 모듈로 내보내기
module.exports = redisClient;
