const studyModel = require('../models/studyModel');
const minioClient = require('../utils/minio');
const chatModel = require('../models/chatModel'); 

exports.createStudy = async (req, res) => {
  try {
    const {
      name,
      goal,
      duration,
      rules,
      requirement,
      representative_image,
      category_id,
      max_participants,
      is_private,
      owner_email
    } = req.body;

    if (!name || !goal || !duration || !category_id || !max_participants || !owner_email) {
      return res.status(400).json({ success: false, message: '필수 항목 누락' });
    }

    const insertId = await studyModel.insertStudy({
      name,
      goal,
      duration,
      rules: rules || null,
      requirement: requirement || null,
      representative_image: representative_image || null,
      category_id,
      max_participants,
      is_private: is_private || 0,
      owner_email
    });

    // ✅ 채팅방 생성
    await chatModel.createChatRoom(insertId);

    // ✅ 방장 참여자 등록 (인원 증가 제외)
    await studyModel.insertParticipant(insertId, owner_email);

    res.status(201).json({ success: true, study_id: insertId });
  } catch (error) {
    console.error('스터디 생성 오류:', error);
    res.status(500).json({ success: false, message: '스터디 생성 실패' });
  }
};

exports.getAllStudies = async (req, res) => {
  const email = req.query.email;

  try {
    const studies = email
      ? await studyModel.getAllStudiesWithStatus(email)
      : await studyModel.getAllStudies();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json(studies);
  } catch (error) {
    console.error('스터디 리스트 조회 오류:', error);
    res.status(500).json({ success: false, message: '스터디 리스트 조회 실패' });
  }
};


exports.getRandomStudies = async (req, res) => {
  try {
    const studies = await studyModel.getRandomStudies();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json(studies);
  } catch (error) {
    console.error('랜덤 스터디 조회 오류:', error);
    res.status(500).json({ success: false, message: '랜덤 조회 실패' });
  }
};

exports.getStudyById = async (req, res) => {
  try {
    const studyId = req.params.id;
    const study = await studyModel.getStudyById(studyId);

    if (!study) {
      return res.status(404).json({ success: false, message: '스터디를 찾을 수 없습니다.' });
    }

    res.status(200).json(study);
  } catch (error) {
    console.error('스터디 상세 조회 오류:', error);
    res.status(500).json({ success: false, message: '스터디 상세 조회 실패' });
  }
};

exports.uploadStudyImage = async (req, res) => {
  try {
    const { email, studyName } = req.body;
    const file = req.file;

    if (!file || !email || !studyName) {
      return res.status(400).json({ success: false, message: '필수 정보 누락' });
    }

    const objectName = `study/${studyName}/study.jpg`;
    await minioClient.putObject('studymate', objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    return res.status(200).json({
      success: true,
      url: `http://tetraplace.com:9000/studymate/${objectName}`
    });
  } catch (err) {
    console.error('❌ 이미지 업로드 실패:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
};

exports.getStudyDetail = async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const requester_email = req.query.email || null;

    console.log('📌 title 파라미터:', title);
    console.log('📧 요청자 이메일:', requester_email);

    if (!title || !requester_email) {
      return res.status(400).json({ error: 'title and email are required' });
    }

    const study = await studyModel.getStudyByTitle(title, requester_email);

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    res.status(200).json(study);
  } catch (error) {
    console.error('스터디 상세 조회 실패:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// controllers/studyController.js
exports.handleStudyRequest = async (req, res) => {
  try {
    const { study_id, requester_email, reason } = req.body;
    let attachmentUrl = null;

    const study = await studyModel.getStudyById(study_id);
    if (!study) {
      return res.status(404).json({ message: '스터디를 찾을 수 없습니다.' });
    }

    if (study.owner_email === requester_email) {
      return res.status(403).json({ message: '방장은 자신의 스터디에 신청할 수 없습니다.' });
    }

    // 파일 업로드
    if (req.file) {
      const objectName = `request/${Date.now()}-${req.file.originalname}`;
      await minioClient.putObject(
        'studymate',
        objectName,
        req.file.buffer,
        req.file.size,
        { 'Content-Type': req.file.mimetype }
      );
      attachmentUrl = `http://tetraplace.com:9000/studymate/${objectName}`;
    }

    const studyId = parseInt(study_id, 10);
    if (isNaN(studyId)) {
      return res.status(400).json({ message: '유효한 study_id가 필요합니다.' });
    }

    const existing = await studyModel.findExistingRequest(studyId, requester_email);
    if (existing.length > 0) {
      return res.status(409).json({ message: '이미 신청한 사용자입니다.' });
    }

    // 💡 공개 여부에 따라 status 분기
    const status = study.is_private ? 'pending' : 'approved';

    await studyModel.insertRequestWithStatus(studyId, requester_email, reason, attachmentUrl, status);

    // ✅ 공개방이면 바로 참여 처리
    if (status === 'approved') {
      await studyModel.insertParticipant(studyId, requester_email);
      await studyModel.incrementCurrentParticipants(studyId);
    }

    return res.status(200).json({ message: study.is_private ? '신청 완료 (대기 중)' : '참여 완료', status });

  } catch (err) {
    console.error('스터디 신청 오류:', err);
    return res.status(500).json({ message: '신청 처리 중 오류 발생' });
  }
};



// controllers/studyController.js
exports.approveApplicant = async (req, res) => {
  const { studyId, applicantEmail } = req.body;

  if (!studyId || !applicantEmail) {
    return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
  }

  try {
    const result = await studyModel.updateApplicantStatus(studyId, applicantEmail, 'approved');

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '대상 데이터를 찾을 수 없습니다.' });
    }

    // ✅ 이 부분을 if 아래로 이동
    await studyModel.insertParticipant(studyId, applicantEmail);
    await studyModel.incrementCurrentParticipants(studyId);

    res.status(200).json({ message: '승인 완료' });
  } catch (error) {
    console.error('승인 오류:', error);
    res.status(500).json({ error: '승인 중 오류 발생' });
  }
};



// studyController.js
exports.rejectApplicant = async (req, res) => {
  const { studyId, applicantEmail } = req.body;

  if (!studyId || !applicantEmail) {
    return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
  }

  try {
    const result = await studyModel.updateApplicantStatus(studyId, applicantEmail, 'rejected');

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '대상 데이터를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '신청 거절 완료' });
  } catch (error) {
    console.error('거절 오류:', error);
    res.status(500).json({ error: '거절 처리 실패' });
  }
};

// controllers/studyController.js
exports.getApplicantsByOwner = async (req, res) => {
  const ownerEmail = req.query.email;
  if (!ownerEmail) {
    return res.status(400).json({ error: 'owner email is required' });
  }

  try {
    const applicants = await studyModel.getApplicantsByOwner(ownerEmail);
    res.status(200).json(applicants);
  } catch (err) {
    console.error('신청자 조회 오류:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
};


exports.getPartnerEmail = async (req, res) => {
  const { studyId, email } = req.query;

  if (!studyId || !email) {
    return res.status(400).json({ message: "필수 파라미터 누락" });
  }

  try {
    const partnerEmail = await studyModel.findPartnerEmail(studyId, email);

    if (!partnerEmail) {
      return res.status(404).json({ message: "상대 참가자가 없습니다." });
    }

    return res.json({ partnerEmail });
  } catch (err) {
    console.error("파트너 이메일 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};