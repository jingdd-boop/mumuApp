const confinement = require('./confinement');
const recordUtil = require('./record');

function addDays(dateStr, n) {
  const d = confinement.parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return confinement.formatDate(d);
}

function formatDuration(minutes) {
  if (!minutes) return '0分钟';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
  return `${m}分钟`;
}

function formatDateShort(dateStr) {
  const parts = dateStr.split('-');
  return `${parts[1]}-${parts[2]}`;
}

function getDayList(birthDate) {
  if (!birthDate) return [];
  const today = confinement.todayStr();
  const list = [];
  let date = birthDate;
  let dayIndex = 1;
  while (date <= today) {
    list.push({
      date,
      dayIndex,
      dayLabel: `月子第${dayIndex}天`,
      dateShort: formatDateShort(date),
    });
    date = addDays(date, 1);
    dayIndex += 1;
  }
  return list;
}

function aggregateBabyDay(records, dateStr) {
  const dayRecords = records.filter((r) => !r.deleted && r.date === dateStr);
  let feedCount = 0;
  let feedDuration = 0;
  let feedAmount = 0;
  let sleepMinutes = 0;
  let sleepCount = 0;
  let diaperCount = 0;
  let peeCount = 0;
  let poopCount = 0;

  dayRecords.forEach((r) => {
    const p = r.payload || {};
    if (r.type === 'feed') {
      feedCount += 1;
      feedDuration += p.duration || 0;
      feedAmount += p.amount || 0;
    } else if (r.type === 'sleep') {
      sleepCount += 1;
      sleepMinutes += p.duration || 0;
    } else if (r.type === 'diaper') {
      diaperCount += 1;
      if (p.diaperType === 'pee' || p.diaperType === 'both') peeCount += 1;
      if (p.diaperType === 'poop' || p.diaperType === 'both') poopCount += 1;
    }
  });

  const feedDetail =
    feedCount > 0
      ? `${feedCount}次${feedDuration ? ' · ' + feedDuration + '分钟' : ''}${feedAmount ? ' · ' + feedAmount + 'ml' : ''}`
      : '未记录';

  const sleepDetail = sleepCount > 0 ? `${sleepCount}次 · ${formatDuration(sleepMinutes)}` : '未记录';

  const diaperDetail =
    diaperCount > 0
      ? `${diaperCount}次${peeCount || poopCount ? `（尿${peeCount} 便${poopCount}）` : ''}`
      : '未记录';

  return {
    feedCount,
    feedDuration,
    feedAmount,
    sleepMinutes,
    sleepCount,
    diaperCount,
    peeCount,
    poopCount,
    feedDetail,
    sleepDetail,
    diaperDetail,
    hasData: feedCount + sleepCount + diaperCount > 0,
  };
}

function aggregateMomDay(records, dateStr) {
  const dayRecords = records.filter((r) => !r.deleted && r.date === dateStr);
  let lochiaCount = 0;
  let lochiaLatest = null;
  const painScores = [];
  let moodLatest = null;

  dayRecords.forEach((r) => {
    const p = r.payload || {};
    if (r.type === 'lochia') {
      lochiaCount += 1;
      lochiaLatest = p;
    } else if (r.type === 'pain' && p.score != null) {
      painScores.push(Number(p.score));
    } else if (r.type === 'mood' && p.level != null) {
      moodLatest = p.level;
    }
  });

  let lochiaDetail = '未记录';
  if (lochiaLatest) {
    lochiaDetail = `${recordUtil.labelOf(recordUtil.LOCHIA_COLORS, lochiaLatest.color)} · ${recordUtil.labelOf(recordUtil.LOCHIA_AMOUNTS, lochiaLatest.amount)}`;
  }

  const painAvg = painScores.length
    ? Math.round((painScores.reduce((a, b) => a + b, 0) / painScores.length) * 10) / 10
    : null;
  const painDetail = painAvg != null ? `${painAvg}分（${painScores.length}次）` : '未记录';

  let moodEmoji = '—';
  let moodLabel = '未记录';
  if (moodLatest != null) {
    const mood = recordUtil.MOOD_LEVELS.find((m) => m.value === moodLatest);
    if (mood) {
      moodEmoji = mood.emoji;
      moodLabel = mood.label;
    }
  }

  return {
    lochiaCount,
    lochiaDetail,
    painAvg,
    painDetail,
    moodEmoji,
    moodLabel,
    hasData: lochiaCount > 0 || painScores.length > 0 || moodLatest != null,
  };
}

function withBarPercent(items, keys) {
  const maxMap = {};
  keys.forEach((key) => {
    maxMap[key] = Math.max(...items.map((i) => i[key] || 0), 1);
  });
  return items.map((item) => {
    const bars = {};
    keys.forEach((key) => {
      const val = item[key] || 0;
      bars[`${key}Bar`] = val > 0 ? Math.max(12, Math.round((val / maxMap[key]) * 100)) : 0;
    });
    return { ...item, ...bars };
  });
}

function buildBabyStats(babyRecords, birthDate) {
  const dayList = getDayList(birthDate);
  const days = dayList.map((d) => {
    const stats = aggregateBabyDay(babyRecords, d.date);
    return {
      ...d,
      ...stats,
    };
  });

  const withBars = withBarPercent(days, ['feedCount', 'sleepMinutes', 'diaperCount']);
  const enriched = withBars.map((d) => ({
    ...d,
    metrics: [
      {
        icon: '🍼',
        label: '喂奶',
        value: d.feedDetail,
        barPercent: d.feedCount > 0 ? d.feedCountBar : 0,
        color: '#7b5cf0',
      },
      {
        icon: '😴',
        label: '睡眠',
        value: d.sleepDetail,
        barPercent: d.sleepMinutes > 0 ? d.sleepMinutesBar : 0,
        color: '#8e9aaf',
      },
      {
        icon: '👶',
        label: '排泄',
        value: d.diaperDetail,
        barPercent: d.diaperCount > 0 ? d.diaperCountBar : 0,
        color: '#6b8f71',
      },
    ],
  }));
  const chartDays = enriched.map((d) => ({
    ...d,
    feedBar: d.feedCountBar,
    sleepBar: d.sleepMinutesBar,
    diaperBar: d.diaperCountBar,
  }));

  const detailDays = [...enriched].reverse();
  const hasAnyData = enriched.some((d) => d.hasData);

  return { chartDays, detailDays, hasAnyData, totalDays: enriched.length };
}

function buildMomStats(momRecords, birthDate) {
  const dayList = getDayList(birthDate);
  const days = dayList.map((d) => {
    const stats = aggregateMomDay(momRecords, d.date);
    return { ...d, ...stats };
  });

  const withBars = withBarPercent(
    days.map((d) => ({ ...d, painScore: d.painAvg || 0, lochiaNum: d.lochiaCount })),
    ['painScore', 'lochiaNum']
  );
  const enriched = withBars.map((d) => ({
    ...d,
    metrics: [
      {
        icon: '💗',
        label: '恶露',
        value: d.lochiaDetail,
        barPercent: d.lochiaCount > 0 ? d.lochiaNumBar : 0,
        color: '#7b5cf0',
      },
      {
        icon: '🩹',
        label: '疼痛',
        value: d.painDetail,
        barPercent: d.painAvg != null ? d.painScoreBar : 0,
        color: '#ff9f5a',
      },
      {
        icon: '💭',
        label: '情绪',
        value: d.moodLabel,
        emoji: d.moodEmoji,
        isMood: true,
      },
    ],
  }));
  const chartDays = enriched.map((d) => ({
    ...d,
    painBar: d.painScoreBar,
    lochiaBar: d.lochiaNumBar,
  }));

  const detailDays = [...enriched].reverse();
  const hasAnyData = enriched.some((d) => d.hasData);

  return { chartDays, detailDays, hasAnyData, totalDays: enriched.length };
}

module.exports = {
  getDayList,
  buildBabyStats,
  buildMomStats,
  formatDuration,
};
