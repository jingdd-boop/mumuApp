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

function labelOf(list, value) {
  const item = list.find((i) => i.value === value);
  return item ? item.label : value;
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
    default:
      return { icon: '📝', title: '记录', detail: '' };
  }
}

function formatRecord(record) {
  if (record.source === 'mom' || ['lochia', 'pain', 'mood'].includes(record.type)) {
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
  formatRecord,
  nowTimeStr,
  labelOf,
};
