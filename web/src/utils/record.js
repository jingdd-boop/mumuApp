export const LOCHIA_COLORS = [
  { value: 'red', label: '鲜红' },
  { value: 'pink', label: '淡红' },
  { value: 'brown', label: '褐色' },
  { value: 'yellow', label: '淡黄/白' },
];

export const LOCHIA_AMOUNTS = [
  { value: 'light', label: '少量' },
  { value: 'medium', label: '中等' },
  { value: 'heavy', label: '较多' },
];

export const MOOD_LEVELS = [
  { value: 1, label: '很差', emoji: '😢' },
  { value: 2, label: '一般', emoji: '😐' },
  { value: 3, label: '还行', emoji: '🙂' },
  { value: 4, label: '不错', emoji: '😊' },
  { value: 5, label: '很好', emoji: '😄' },
];

export const ENGORGEMENT_LEVELS = [
  { value: 'none', label: '无涨奶' },
  { value: 'mild', label: '轻度涨奶' },
  { value: 'moderate', label: '中度涨奶' },
  { value: 'severe', label: '重度涨奶' },
];

export const BLOCKED_STATUS = [
  { value: 'no', label: '无堵奶' },
  { value: 'yes', label: '有堵奶' },
];

export const FEEDING_STATUS = [
  { value: 'good', label: '顺利' },
  { value: 'fair', label: '一般' },
  { value: 'hard', label: '困难' },
];

export const BREAST_SIDES = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'both', label: '双侧' },
];

export const RECORD_TYPES = [
  { type: 'lochia', icon: '💗', label: '恶露' },
  { type: 'pain', icon: '🩹', label: '疼痛' },
  { type: 'mood', icon: '💭', label: '情绪' },
  { type: 'weight', icon: '⚖️', label: '体重' },
  { type: 'breast', icon: '🤱', label: '乳房' },
];

export const TYPE_TITLES = {
  lochia: '恶露记录',
  pain: '疼痛记录',
  mood: '情绪记录',
  weight: '体重记录',
  breast: '乳房护理记录',
};

function labelOf(list, value) {
  const item = list.find((i) => i.value === value);
  return item ? item.label : value;
}

export function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
