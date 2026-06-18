const { query, getPool } = require('../db/pool');
const { genId } = require('../utils/id');
const { USER_SELECT, mapUserRow, mapRecordRow } = require('../db/rowMappers');

async function findUserById(userId) {
  const rows = await query(`${USER_SELECT} WHERE u.id = ?`, [userId]);
  return mapUserRow(rows[0]);
}

async function findUserByOpenid(openid) {
  const rows = await query(`${USER_SELECT} WHERE u.openid = ?`, [openid]);
  return mapUserRow(rows[0]);
}

async function createUser(openid) {
  const id = `user_${genId()}`;
  const now = Date.now();
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO users (id, openid, login_time, agreed_disclaimer, agreed_privacy)
       VALUES (?, ?, ?, 0, 0)`,
      [id, openid, now]
    );
    await conn.query(
      `INSERT INTO user_settings (user_id, total_days, delivery_type) VALUES (?, 42, 'natural')`,
      [id]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return findUserById(id);
}

async function updateLoginTime(userId) {
  await query(`UPDATE users SET login_time = ? WHERE id = ?`, [Date.now(), userId]);
}

async function updateAgreements(userId) {
  const now = Date.now();
  await query(
    `UPDATE users SET agreed_disclaimer = 1, agreed_privacy = 1, agreed_time = ? WHERE id = ?`,
    [now, userId]
  );
  return now;
}

function toPublicUser(user) {
  return {
    id: user.id,
    openid: user.openid,
    loginTime: user.loginTime,
    agreedDisclaimer: user.agreedDisclaimer,
    agreedPrivacy: user.agreedPrivacy,
    agreedTime: user.agreedTime,
  };
}

function getProfileStatus(user) {
  return {
    onboarded: !!(user.mom && user.mom.deliveryDate),
    mom: user.mom,
    settings: user.settings,
  };
}

async function saveOnboarding(userId, data) {
  const { nickName, deliveryDate, totalDays, deliveryType } = data;
  const now = Date.now();
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    const [profiles] = await conn.query(`SELECT id, create_time FROM mom_profiles WHERE user_id = ?`, [userId]);
    if (profiles.length) {
      await conn.query(
        `UPDATE mom_profiles SET nick_name = ?, delivery_date = ? WHERE user_id = ?`,
        [String(nickName).trim(), deliveryDate, userId]
      );
    } else {
      await conn.query(
        `INSERT INTO mom_profiles (id, user_id, nick_name, delivery_date, create_time)
         VALUES (?, ?, ?, ?, ?)`,
        [genId(), userId, String(nickName).trim(), deliveryDate, now]
      );
    }

    await conn.query(
      `INSERT INTO user_settings (user_id, total_days, delivery_type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE total_days = VALUES(total_days), delivery_type = VALUES(delivery_type)`,
      [userId, Number(totalDays), deliveryType]
    );

    await conn.query(
      `UPDATE users SET agreed_disclaimer = 1, agreed_privacy = 1, agreed_time = ? WHERE id = ?`,
      [now, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const user = await findUserById(userId);
  return {
    mom: user.mom,
    settings: user.settings,
    onboarded: true,
  };
}

async function updateMomProfile(userId, { nickName, deliveryDate }) {
  await query(`UPDATE mom_profiles SET nick_name = ?, delivery_date = ? WHERE user_id = ?`, [
    String(nickName).trim(),
    deliveryDate,
    userId,
  ]);
  const user = await findUserById(userId);
  return user.mom;
}

async function updateSettings(userId, { totalDays, deliveryType }) {
  await query(
    `INSERT INTO user_settings (user_id, total_days, delivery_type)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE total_days = VALUES(total_days), delivery_type = VALUES(delivery_type)`,
    [userId, Number(totalDays), deliveryType]
  );
  const user = await findUserById(userId);
  return user.settings;
}

async function clearUserData(userId) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM mom_records WHERE user_id = ?`, [userId]);
    await conn.query(`DELETE FROM baby_records WHERE user_id = ?`, [userId]);
    await conn.query(`DELETE FROM mom_profiles WHERE user_id = ?`, [userId]);
    await conn.query(
      `UPDATE user_settings SET total_days = 42, delivery_type = 'natural' WHERE user_id = ?`,
      [userId]
    );
    await conn.query(
      `UPDATE users SET agreed_disclaimer = 0, agreed_privacy = 0, agreed_time = NULL WHERE id = ?`,
      [userId]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function listMomRecords(userId, { date, type, page = 1, pageSize = 50 } = {}) {
  const conditions = ['user_id = ?', 'deleted = 0'];
  const params = [userId];
  if (date) {
    conditions.push('record_date = ?');
    params.push(date);
  }
  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  const where = conditions.join(' AND ');

  const countRows = await query(`SELECT COUNT(*) AS total FROM mom_records WHERE ${where}`, params);
  const total = Number(countRows[0].total);

  const offset = (page - 1) * pageSize;
  const rows = await query(
    `SELECT id, type, record_date, record_time, payload, deleted, create_time
     FROM mom_records WHERE ${where}
     ORDER BY record_time DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return { list: rows.map(mapRecordRow), total, page, pageSize };
}

async function getAllMomRecords(userId) {
  const rows = await query(
    `SELECT id, type, record_date, record_time, payload, deleted, create_time
     FROM mom_records WHERE user_id = ? AND deleted = 0
     ORDER BY record_date ASC, record_time ASC`,
    [userId]
  );
  return rows.map(mapRecordRow);
}

async function findMomRecord(userId, recordId) {
  const rows = await query(
    `SELECT id, type, record_date, record_time, payload, deleted, create_time
     FROM mom_records WHERE user_id = ? AND id = ? AND deleted = 0`,
    [userId, recordId]
  );
  return rows[0] ? mapRecordRow(rows[0]) : null;
}

async function createMomRecord(userId, record) {
  const { id, type, date, time, payload, createTime } = record;
  await query(
    `INSERT INTO mom_records (id, user_id, type, record_date, record_time, payload, deleted, create_time)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, userId, type, date, time, JSON.stringify(payload), createTime]
  );
  return record;
}

async function updateMomRecord(userId, recordId, { date, time, payload }) {
  const fields = [];
  const params = [];
  if (date !== undefined) {
    fields.push('record_date = ?');
    params.push(date);
  }
  if (time !== undefined) {
    fields.push('record_time = ?');
    params.push(time);
  }
  if (payload !== undefined) {
    fields.push('payload = ?');
    params.push(JSON.stringify(payload));
  }
  if (!fields.length) return findMomRecord(userId, recordId);

  params.push(userId, recordId);
  await query(`UPDATE mom_records SET ${fields.join(', ')} WHERE user_id = ? AND id = ? AND deleted = 0`, params);
  return findMomRecord(userId, recordId);
}

async function softDeleteMomRecord(userId, recordId) {
  const result = await query(
    `UPDATE mom_records SET deleted = 1 WHERE user_id = ? AND id = ? AND deleted = 0`,
    [userId, recordId]
  );
  return result.affectedRows > 0;
}

async function countMomRecords(userId) {
  const rows = await query(`SELECT COUNT(*) AS total FROM mom_records WHERE user_id = ? AND deleted = 0`, [userId]);
  return Number(rows[0].total);
}

async function countBabyRecords(userId) {
  const rows = await query(`SELECT COUNT(*) AS total FROM baby_records WHERE user_id = ? AND deleted = 0`, [userId]);
  return Number(rows[0].total);
}

module.exports = {
  findUserById,
  findUserByOpenid,
  createUser,
  updateLoginTime,
  updateAgreements,
  toPublicUser,
  getProfileStatus,
  saveOnboarding,
  updateMomProfile,
  updateSettings,
  clearUserData,
  listMomRecords,
  getAllMomRecords,
  findMomRecord,
  createMomRecord,
  updateMomRecord,
  softDeleteMomRecord,
  countMomRecords,
  countBabyRecords,
};
