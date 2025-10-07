// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const minio = require('../utils/minio');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });

// 외부에서 접근 가능한 도메인 (MinIO가 외부 노출된 도메인 또는 프록시 주소)
const PUBLIC_MINIO_DOMAIN = 'http://tetraplace.com:9000';

router.post('/profile', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const email = req.body.email;

    if (!email || !file) {
      return res.status(400).json({ message: '파일과 이메일은 필수입니다.' });
    }

    const bucket = 'studymate';
    const objectName = `profile/${email}/profile.jpg`;

    // MinIO 업로드
    await minio.putObject(bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });

    // presigned URL은 내부 IP가 포함될 수 있으므로, 직접 외부 도메인으로 구성한 경로 제공
    const publicUrl = `${PUBLIC_MINIO_DOMAIN}/${bucket}/${objectName}`;

    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error('❌ 프로필 업로드 실패:', err);
    return res.status(500).json({ message: '업로드 실패' });
  }
});

// routes/upload.js
router.post('/study', upload.single('file'), async (req, res) => {
  const email = req.body.email;
  const studyName = req.body.studyName; // 스터디 이름 받아서 폴더 경로 구성
  const file = req.file;

  if (!file || !email || !studyName) {
    return res.status(400).json({ success: false, message: '필수 항목 누락' });
  }

  const ext = path.extname(file.originalname);
  const filename = 'study' + ext;
  const key = `study/${studyName}/${filename}`;

  const fileUrl = await uploadToMinio(key, file.buffer, file.mimetype); // 유틸 함수

  return res.status(200).json({ success: true, url: fileUrl });
});


module.exports = router;
