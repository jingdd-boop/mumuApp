const AppError = require('../utils/AppError');

const MOM_TYPES = ['lochia', 'pain', 'mood', 'weight', 'breast'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const ENUMS = {
  lochia: {
    color: ['red', 'pink', 'brown', 'yellow'],
    amount: ['light', 'medium', 'heavy'],
  },
  mood: { level: [1, 2, 3, 4, 5] },
  breast: {
    engorgement: ['none', 'mild', 'moderate', 'severe'],
    blocked: ['no', 'yes'],
    side: ['left', 'right', 'both'],
    feeding: ['good', 'fair', 'hard'],
  },
};

function assertEnum(field, value, allowed) {
  if (!allowed.includes(value)) {
    throw new AppError(`参数错误：${field} 值无效`);
  }
}

function validateMomRecordBody(body, { partial = false } = {}) {
  const { type, date, time, payload } = body;

  if (!partial && !type) throw new AppError('参数错误：type 不能为空');
  if (type && !MOM_TYPES.includes(type)) throw new AppError('参数错误：type 无效');
  if (date !== undefined && !DATE_RE.test(date)) throw new AppError('参数错误：date 格式应为 YYYY-MM-DD');
  if (time !== undefined && !TIME_RE.test(time)) throw new AppError('参数错误：time 格式应为 HH:mm');

  const recordType = type || body._type;
  const p = payload || {};

  if (!partial && !payload) throw new AppError('参数错误：payload 不能为空');

  if (recordType === 'lochia' && payload) {
    assertEnum('color', p.color, ENUMS.lochia.color);
    assertEnum('amount', p.amount, ENUMS.lochia.amount);
  }
  if (recordType === 'pain' && payload) {
    const score = Number(p.score);
    if (Number.isNaN(score) || score < 1 || score > 10) {
      throw new AppError('参数错误：疼痛评分应为 1～10');
    }
  }
  if (recordType === 'mood' && payload) {
    assertEnum('level', Number(p.level), ENUMS.mood.level);
  }
  if (recordType === 'weight' && payload) {
    const kg = Number(p.kg);
    if (Number.isNaN(kg) || kg < 30 || kg > 200) {
      throw new AppError('参数错误：体重应为 30～200 kg');
    }
  }
  if (recordType === 'breast' && payload) {
    assertEnum('engorgement', p.engorgement, ENUMS.breast.engorgement);
    assertEnum('blocked', p.blocked, ENUMS.breast.blocked);
    assertEnum('feeding', p.feeding, ENUMS.breast.feeding);
    if (p.blocked === 'yes') {
      if (!p.side) throw new AppError('参数错误：有堵奶时需指定 side');
      assertEnum('side', p.side, ENUMS.breast.side);
    }
  }

  return true;
}

function validateOnboarding(body) {
  const { nickName, deliveryDate, totalDays, deliveryType, agreedDisclaimer, agreedPrivacy } = body;
  if (!nickName || !String(nickName).trim()) throw new AppError('参数错误：nickName 不能为空');
  if (!deliveryDate || !DATE_RE.test(deliveryDate)) throw new AppError('参数错误：deliveryDate 格式应为 YYYY-MM-DD');
  if (![28, 30, 42].includes(Number(totalDays))) throw new AppError('参数错误：totalDays 应为 28、30 或 42');
  if (!['natural', 'cesarean'].includes(deliveryType)) throw new AppError('参数错误：deliveryType 无效');
  if (!agreedDisclaimer || !agreedPrivacy) throw new AppError('参数错误：需同意免责声明和隐私政策');
}

function validateMomProfile(body) {
  const { nickName, deliveryDate } = body;
  if (!nickName || !String(nickName).trim()) throw new AppError('参数错误：nickName 不能为空');
  if (!deliveryDate || !DATE_RE.test(deliveryDate)) throw new AppError('参数错误：deliveryDate 格式应为 YYYY-MM-DD');
}

function validateSettings(body) {
  const { totalDays, deliveryType } = body;
  if (![28, 30, 42].includes(Number(totalDays))) throw new AppError('参数错误：totalDays 应为 28、30 或 42');
  if (!['natural', 'cesarean'].includes(deliveryType)) throw new AppError('参数错误：deliveryType 无效');
}

module.exports = {
  MOM_TYPES,
  validateMomRecordBody,
  validateOnboarding,
  validateMomProfile,
  validateSettings,
};
