const KEYS = {
  USER: 'td_user',
  MOM: 'td_mom',
  BABY: 'td_baby',
  SETTINGS: 'td_settings',
  BABY_RECORDS: 'td_baby_records',
  MOM_RECORDS: 'td_mom_records',
  ONBOARDED: 'td_onboarded',
};

function get(key, defaultValue) {
  try {
    const val = wx.getStorageSync(key);
    return val !== '' && val !== undefined ? val : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function set(key, value) {
  wx.setStorageSync(key, value);
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getUser() {
  return get(KEYS.USER, null);
}

function saveUser(user) {
  set(KEYS.USER, user);
}

function migrateBabyToMom() {
  const baby = get(KEYS.BABY, null);
  if (!baby) return null;
  const mom = {
    id: baby.id || genId(),
    nickName: baby.name || '妈妈',
    deliveryDate: baby.birthDate,
    createTime: baby.createTime || Date.now(),
  };
  set(KEYS.MOM, mom);
  return mom;
}

function getMom() {
  const mom = get(KEYS.MOM, null);
  if (mom) return mom;
  return migrateBabyToMom();
}

function saveMom(mom) {
  set(KEYS.MOM, mom);
}

function getSettings() {
  return get(KEYS.SETTINGS, { totalDays: 42, deliveryType: 'natural' });
}

function saveSettings(settings) {
  set(KEYS.SETTINGS, settings);
}

function isOnboarded() {
  return get(KEYS.ONBOARDED, false);
}

function setOnboarded(value) {
  set(KEYS.ONBOARDED, value);
}

function getMomRecords() {
  return get(KEYS.MOM_RECORDS, []);
}

function saveMomRecords(records) {
  set(KEYS.MOM_RECORDS, records);
}

function addMomRecord(record) {
  const records = getMomRecords();
  const item = {
    id: genId(),
    deleted: false,
    createTime: Date.now(),
    ...record,
  };
  records.unshift(item);
  saveMomRecords(records);
  return item;
}

function updateMomRecord(id, patch) {
  const records = getMomRecords().map((r) =>
    r.id === id ? { ...r, ...patch } : r
  );
  saveMomRecords(records);
}

function getRecordsByDate(dateStr) {
  return getMomRecords()
    .filter((r) => !r.deleted && r.date === dateStr)
    .map((r) => ({ ...r, source: 'mom' }))
    .sort((a, b) => (b.time || '00:00').localeCompare(a.time || '00:00'));
}

function clearAllData() {
  Object.values(KEYS).forEach((k) => wx.removeStorageSync(k));
}

module.exports = {
  KEYS,
  getUser,
  saveUser,
  getMom,
  saveMom,
  getSettings,
  saveSettings,
  isOnboarded,
  setOnboarded,
  getMomRecords,
  addMomRecord,
  updateMomRecord,
  getRecordsByDate,
  clearAllData,
  genId,
};
