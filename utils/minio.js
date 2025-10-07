// utils/minio.js
const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: '192.168.219.130',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

module.exports = minioClient;
