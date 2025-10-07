const db = require('../utils/db');

exports.insertStudy = async (data) => {
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
  } = data;

  const sql = `
    INSERT INTO study
      (name, goal, duration, rules, requirement, representative_image, category_id,
       current_participants, max_participants, is_private, owner_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, NOW())
  `;

  const [result] = await db.execute(sql, [
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
  ]);

  return result.insertId;
};
exports.getRandomStudies = async () => {
  const sql = `
    SELECT 
      s.id,
      s.name,
      s.goal,
      s.max_participants,
      s.current_participants,
      s.representative_image,
      s.is_private,
      c.name AS category_name,
      g.name AS group_name
    FROM study s
    JOIN categories c ON s.category_id = c.id
    JOIN category_groups g ON c.group_id = g.id
    ORDER BY RAND() LIMIT 2;
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

exports.getAllStudies = async () => {
  const sql = `
    SELECT 
      s.id,
      s.name,
      s.goal,
      s.max_participants,
      s.current_participants,
      s.representative_image,
      s.is_private,
      s.created_at,  -- ✅ created_at 반드시 포함
      c.name AS category_name,
      g.name AS group_name
    FROM study s
    JOIN categories c ON s.category_id = c.id
    JOIN category_groups g ON c.group_id = g.id
    ORDER BY s.created_at DESC;
  `;
  const [rows] = await db.execute(sql);
  return rows;
};


exports.getStudyById = async (studyId) => {
  const sql = `
    SELECT 
      s.id,
      s.name,
      s.goal,
      s.duration,
      s.rules,
      s.requirement,
      s.representative_image,
      s.max_participants,
      s.current_participants,
      s.is_private,
      s.owner_email,
      s.created_at,
      c.name AS category_name,
      g.name AS group_name
    FROM study s
    JOIN categories c ON s.category_id = c.id
    JOIN category_groups g ON c.group_id = g.id
    WHERE s.id = ?
  `;

  const [rows] = await db.execute(sql, [studyId]);
  return rows[0]; // 단일 결과
};

exports.getStudyByTitle = async (title, requester_email) => {
  const sql = `
    SELECT 
      s.id AS study_id,
      s.goal, 
      s.rules AS rule, 
      s.requirement AS target, 
      s.duration,
      s.owner_email,
      (
        SELECT status 
        FROM study_management 
        WHERE study_id = s.id AND requester_email = ?
        LIMIT 1
      ) AS status
    FROM study s
    WHERE s.name = ?
  `;

  const [rows] = await db.execute(sql, [requester_email, title]);
  return rows[0];
};



exports.findExistingRequest = async (study_id, requester_email) => {
  const [rows] = await db.execute(
    'SELECT * FROM study_management WHERE study_id = ? AND requester_email = ?',
    [study_id, requester_email]
  );
  return rows;
};

exports.insertRequest = async (study_id, requester_email, reason, attachmentUrl) => {
  await db.execute(
    'INSERT INTO study_management (study_id, requester_email, reason, attachment_url) VALUES (?, ?, ?, ?)',
    [study_id, requester_email, reason, attachmentUrl]
  );
};

// studyModel.js
exports.updateApplicantStatus = async (studyId, applicantEmail, status) => {
  const query = `
    UPDATE study_management
    SET status = ?
    WHERE study_id = ? AND requester_email = ?
  `;
  const [rows] = await db.execute(query, [status, studyId, applicantEmail]);
  return rows;
};

exports.insertRequestWithStatus = async (studyId, requester_email, reason, attachmentUrl, status) => {
  await db.execute(
    `INSERT INTO study_management (study_id, requester_email, reason, attachment_url, status)
     VALUES (?, ?, ?, ?, ?)`,
    [studyId, requester_email, reason, attachmentUrl, status]
  );
};

exports.getAllStudiesWithStatus = async (userEmail) => {
  const sql = `
    SELECT 
      s.id,
      s.name,
      s.goal,
      s.max_participants,
      s.current_participants,
      s.representative_image,
      s.is_private,
      s.created_at,
      c.name AS category_name,
      g.name AS group_name,
      (
        SELECT status 
        FROM study_management 
        WHERE study_id = s.id AND requester_email = ?
        LIMIT 1
      ) AS status
    FROM study s
    JOIN categories c ON s.category_id = c.id
    JOIN category_groups g ON c.group_id = g.id
    ORDER BY s.created_at DESC;
  `;
  const [rows] = await db.execute(sql, [userEmail]);
  return rows;
};

// models/studyModel.js
exports.getApplicantsByOwner = async (ownerEmail) => {
  const sql = `
    SELECT 
      s.id AS study_id,
      s.name AS study_title,
      u.nickname,
      u.email,
      u.profile_picture_url AS profileUrl,
      sm.reason,
      sm.attachment_url,
      sm.status
    FROM study_management sm
    JOIN study s ON sm.study_id = s.id
    JOIN users u ON sm.requester_email = u.email
    WHERE s.owner_email = ?
      AND sm.status = 'pending'
    ORDER BY s.created_at DESC
  `;
  const [rows] = await db.execute(sql, [ownerEmail]);
  return rows;
};

// study_participants에 참여자 추가
exports.insertParticipant = async (studyId, email) => {
  const sql = `
    INSERT INTO study_participants (study_id, participant_email)
    VALUES (?, ?)
  `;
  try {
    await db.execute(sql, [studyId, email]);
    console.log("✅ 참가자 DB 삽입 완료:", studyId, email);
  } catch (err) {
    console.error("❌ 참가자 삽입 오류:", err);
  }
};

// current_participants 증가
exports.incrementCurrentParticipants = async (studyId) => {
  const sql = 'UPDATE study SET current_participants = current_participants + 1 WHERE id = ?';
  return db.execute(sql, [studyId]);
};

exports.findPartnerEmail = async (studyId, myEmail) => {
  const [rows] = await db.query(
    `
    (
      SELECT requester_email AS email
      FROM study_management
      WHERE study_id = ? AND status = 'approved' AND requester_email != ?
    )
    UNION
    (
      SELECT owner_email AS email
      FROM study
      WHERE id = ? AND owner_email != ?
    )
    LIMIT 1
    `,
    [studyId, myEmail, studyId, myEmail]
  );

  return rows.length > 0 ? rows[0].email : null;
};
