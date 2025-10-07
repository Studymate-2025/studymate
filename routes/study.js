const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const multer = require('multer');
const upload = multer();

// 스터디 생성
router.post('/create', studyController.createStudy);
router.get('/list', studyController.getAllStudies);
router.get('/random', studyController.getRandomStudies);
router.get('/detail/by-id/:id', studyController.getStudyById);
router.get('/detail/:title', studyController.getStudyDetail);
router.post('/upload-image', upload.single('file'), studyController.uploadStudyImage);
router.post('/request', upload.single('attachment'), studyController.handleStudyRequest);
router.post('/approve', studyController.approveApplicant);
router.post('/reject', studyController.rejectApplicant);
router.get('/applicants', studyController.getApplicantsByOwner);
router.get('/partner-email', studyController.getPartnerEmail);

module.exports = router;
