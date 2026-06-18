const STAGES = [
  { maxDay: 7, name: '排恶露期', tips: ['饮食宜清淡易消化', '注意会阴/伤口清洁', '保证充足休息，少走动'] },
  { maxDay: 14, name: '恢复期', tips: ['可逐步增加优质蛋白', '适当活动促进恢复', '关注恶露颜色变化'] },
  { maxDay: 28, name: '调养期', tips: ['均衡营养，避免油腻', '注意腰腹部保暖', '保持心情愉快'] },
  { maxDay: Infinity, name: '进补期', tips: ['可适当温补气血', '继续观察身体恢复', '如有异常及时就医'] },
];

export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayStr() {
  return formatDate(new Date());
}

export function getConfinementDay(birthDateStr, totalDays) {
  if (!birthDateStr) return { day: 0, total: totalDays || 42, progress: 0, stage: STAGES[0], isEnded: false };
  const birth = parseDate(birthDateStr);
  const today = new Date();
  birth.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - birth) / 86400000) + 1;
  const total = totalDays || 42;
  const day = Math.max(1, diff);
  const isEnded = day > total;
  const currentDay = isEnded ? total : day;
  const progress = Math.min(100, Math.round((currentDay / total) * 100));
  const stage = STAGES.find((s) => currentDay <= s.maxDay) || STAGES[STAGES.length - 1];
  return { day: currentDay, total, progress, stage, isEnded, rawDay: diff };
}

export { STAGES };
