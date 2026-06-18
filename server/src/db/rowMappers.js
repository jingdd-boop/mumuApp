function formatDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === 'object') return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    openid: row.openid,
    loginTime: Number(row.login_time),
    agreedDisclaimer: !!row.agreed_disclaimer,
    agreedPrivacy: !!row.agreed_privacy,
    agreedTime: row.agreed_time != null ? Number(row.agreed_time) : null,
    mom: row.mom_id
      ? {
          id: row.mom_id,
          nickName: row.nick_name,
          deliveryDate: formatDate(row.delivery_date),
          createTime: Number(row.mom_create_time),
        }
      : null,
    settings: {
      totalDays: row.total_days != null ? Number(row.total_days) : 42,
      deliveryType: row.delivery_type || 'natural',
    },
    momRecords: [],
  };
}

function mapRecordRow(row) {
  return {
    id: row.id,
    type: row.type,
    date: formatDate(row.record_date),
    time: row.record_time,
    payload: parsePayload(row.payload),
    deleted: !!row.deleted,
    createTime: Number(row.create_time),
  };
}

const USER_SELECT = `
  SELECT
    u.id, u.openid, u.login_time, u.agreed_disclaimer, u.agreed_privacy, u.agreed_time,
    m.id AS mom_id, m.nick_name, m.delivery_date, m.create_time AS mom_create_time,
    s.total_days, s.delivery_type
  FROM users u
  LEFT JOIN mom_profiles m ON m.user_id = u.id
  LEFT JOIN user_settings s ON s.user_id = u.id
`;

module.exports = {
  formatDate,
  mapUserRow,
  mapRecordRow,
  USER_SELECT,
};
