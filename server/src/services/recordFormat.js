const LOCHIA_COLORS = [
  { value: 'red', label: '鲜红' },
  { value: 'pink', label: '淡红' },
  { value: 'brown', label: '褐色' },
  { value: 'yellow', label: '淡黄/白' },
];

const LOCHIA_AMOUNTS = [
  { value: 'light', label: '少量' },
  { value: 'medium', label: '中等' },
  { value: 'heavy', label: '较多' },
];

const MOOD_LEVELS = [
  { value: 1, label: '很差', emoji: '😢' },
  { value: 2, label: '一般', emoji: '😐' },
  { value: 3, label: '还行', emoji: '🙂' },
  { value: 4, label: '不错', emoji: '😊' },
  { value: 5, label: '很好', emoji: '😄' },
];

const ENGORGEMENT_LEVELS = [
  { value: 'none', label: '无涨奶' },
  { value: 'mild', label: '轻度涨奶' },
  { value: 'moderate', label: '中度涨奶' },
  { value: 'severe', label: '重度涨奶' },
];

const BREAST_SIDES = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'both', label: '双侧' },
];

const FEEDING_STATUS = [
  { value: 'good', label: '顺利' },
  { value: 'fair', label: '一般' },
  { value: 'hard', label: '困难' },
];

function labelOf(list, value) {
  const item = list.find((i) => i.value === value);
  return item ? item.label : value;
}

function formatBreastDetail(payload = {}) {
  const parts = [labelOf(ENGORGEMENT_LEVELS, payload.engorgement || 'none')];
  if (payload.blocked === 'yes') {
    let blocked = '有堵奶';
    if (payload.side) blocked += `（${labelOf(BREAST_SIDES, payload.side)}）`;
    parts.push(blocked);
  } else {
    parts.push('无堵奶');
  }
  if (payload.feeding) {
    parts.push(`哺乳${labelOf(FEEDING_STATUS, payload.feeding)}`);
  }
  if (payload.note) parts.push(payload.note);
  return parts.join(' · ');
}

function formatMomRecord(record) {
  const { type, payload = {} } = record;
  switch (type) {
    case 'lochia':
      return {
        icon: '💗',
        title: '恶露',
        detail: `${labelOf(LOCHIA_COLORS, payload.color)} · ${labelOf(LOCHIA_AMOUNTS, payload.amount)}`,
      };
    case 'pain':
      return {
        icon: '🩹',
        title: '疼痛',
        detail: `评分 ${payload.score}/10${payload.note ? ' · ' + payload.note : ''}`,
      };
    case 'mood': {
      const mood = MOOD_LEVELS.find((m) => m.value === payload.level);
      return {
        icon: mood ? mood.emoji : '💭',
        title: '情绪',
        detail: mood ? mood.label : '',
      };
    }
    case 'weight': {
      const kg = payload.kg != null ? Number(payload.kg) : null;
      let detail = kg != null && !Number.isNaN(kg) ? `${kg} kg` : '';
      if (payload.note) detail += (detail ? ' · ' : '') + payload.note;
      return { icon: '⚖️', title: '体重', detail: detail || '—' };
    }
    case 'breast':
      return { icon: '🤱', title: '乳房护理', detail: formatBreastDetail(payload) };
    default:
      return { icon: '📝', title: '记录', detail: '' };
  }
}

const ENGORGEMENT_SCORE = { none: 0, mild: 1, moderate: 2, severe: 3 };

function breastSeverityScore(payload = {}) {
  let score = ENGORGEMENT_SCORE[payload.engorgement] || 0;
  if (payload.blocked === 'yes') score += 2;
  return score;
}

function formatRecord(record) {
  const fmt = formatMomRecord(record);
  return { ...record, ...fmt, source: 'mom' };
}

module.exports = {
  formatRecord,
  formatMomRecord,
  labelOf,
  formatBreastDetail,
  breastSeverityScore,
  LOCHIA_COLORS,
  LOCHIA_AMOUNTS,
  MOOD_LEVELS,
};
