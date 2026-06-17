const FEED_TYPES = [
  { value: 'breast', label: '母乳' },
  { value: 'formula', label: '配方奶' },
  { value: 'mixed', label: '混合' },
];

const BREAST_SIDES = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'both', label: '双侧' },
];

const DIAPER_TYPES = [
  { value: 'pee', label: '小便' },
  { value: 'poop', label: '大便' },
  { value: 'both', label: '大小便' },
];

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

const BLOCKED_STATUS = [
  { value: 'no', label: '无堵奶' },
  { value: 'yes', label: '有堵奶' },
];

const FEEDING_STATUS = [
  { value: 'good', label: '顺利' },
  { value: 'fair', label: '一般' },
  { value: 'hard', label: '困难' },
];

const ENGORGEMENT_SCORE = { none: 0, mild: 1, moderate: 2, severe: 3 };

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

function breastSeverityScore(payload = {}) {
  let score = ENGORGEMENT_SCORE[payload.engorgement] || 0;
  if (payload.blocked === 'yes') score += 2;
  return score;
}

function formatBabyRecord(record) {
  const { type, payload = {} } = record;
  switch (type) {
    case 'feed': {
      const typeLabel = labelOf(FEED_TYPES, payload.feedType);
      let detail = typeLabel;
      if (payload.feedType === 'breast' && payload.side) {
        detail += ` · ${labelOf(BREAST_SIDES, payload.side)}`;
      }
      if (payload.duration) detail += ` · ${payload.duration}分钟`;
      if (payload.amount) detail += ` · ${payload.amount}ml`;
      return { icon: '🍼', title: '喂养', detail };
    }
    case 'sleep': {
      let detail = '';
      if (payload.duration) {
        const h = Math.floor(payload.duration / 60);
        const m = payload.duration % 60;
        detail = h > 0 ? `${h}小时${m > 0 ? m + '分' : ''}` : `${m}分钟`;
      } else if (payload.status === 'start') {
        detail = '开始睡觉';
      } else {
        detail = '醒来';
      }
      return { icon: '😴', title: '睡眠', detail };
    }
    case 'diaper': {
      return {
        icon: '👶',
        title: '排泄',
        detail: labelOf(DIAPER_TYPES, payload.diaperType),
      };
    }
    default:
      return { icon: '📝', title: '记录', detail: '' };
  }
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
      return {
        icon: '⚖️',
        title: '体重',
        detail: detail || '—',
      };
    }
    case 'breast':
      return {
        icon: '🤱',
        title: '乳房护理',
        detail: formatBreastDetail(payload),
      };
    default:
      return { icon: '📝', title: '记录', detail: '' };
  }
}

function formatRecord(record) {
  if (record.source === 'mom' || ['lochia', 'pain', 'mood', 'weight', 'breast'].includes(record.type)) {
    return formatMomRecord(record);
  }
  return formatBabyRecord(record);
}

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

module.exports = {
  FEED_TYPES,
  BREAST_SIDES,
  DIAPER_TYPES,
  LOCHIA_COLORS,
  LOCHIA_AMOUNTS,
  MOOD_LEVELS,
  ENGORGEMENT_LEVELS,
  BLOCKED_STATUS,
  FEEDING_STATUS,
  formatBreastDetail,
  breastSeverityScore,
  formatRecord,
  nowTimeStr,
  labelOf,
};
