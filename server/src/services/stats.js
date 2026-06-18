const confinement = require('./confinement');
const recordUtil = require('./recordFormat');

function addDays(dateStr, n) {
  const d = confinement.parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return confinement.formatDate(d);
}

function formatDateShort(dateStr) {
  const parts = dateStr.split('-');
  return `${parts[1]}-${parts[2]}`;
}

function getDayList(birthDate, toDate) {
  if (!birthDate) return [];
  const end = toDate || confinement.todayStr();
  const list = [];
  let date = birthDate;
  let dayIndex = 1;
  while (date <= end) {
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

function aggregateMomDay(records, dateStr) {
  const dayRecords = records.filter((r) => !r.deleted && r.date === dateStr);
  let lochiaCount = 0;
  let lochiaLatest = null;
  const painScores = [];
  let moodLatest = null;
  let weightLatest = null;
  let weightLatestTime = '';
  let breastLatest = null;
  let breastLatestTime = '';

  dayRecords.forEach((r) => {
    const p = r.payload || {};
    if (r.type === 'lochia') {
      lochiaCount += 1;
      lochiaLatest = p;
    } else if (r.type === 'pain' && p.score != null) {
      painScores.push(Number(p.score));
    } else if (r.type === 'mood' && p.level != null) {
      moodLatest = p.level;
    } else if (r.type === 'weight' && p.kg != null) {
      const time = r.time || '00:00';
      if (!weightLatest || time.localeCompare(weightLatestTime) > 0) {
        weightLatest = Number(p.kg);
        weightLatestTime = time;
      }
    } else if (r.type === 'breast') {
      const time = r.time || '00:00';
      if (!breastLatest || time.localeCompare(breastLatestTime) > 0) {
        breastLatest = p;
        breastLatestTime = time;
      }
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

  const weightDetail = weightLatest != null && !Number.isNaN(weightLatest) ? `${weightLatest} kg` : '未记录';
  const breastDetail = breastLatest ? recordUtil.formatBreastDetail(breastLatest) : '未记录';
  const breastSeverity = breastLatest ? recordUtil.breastSeverityScore(breastLatest) : null;

  return {
    lochiaCount,
    lochiaDetail,
    painAvg,
    painDetail,
    moodEmoji,
    moodLabel,
    weightValue: weightLatest,
    weightDetail,
    breastDetail,
    breastSeverity,
    hasData:
      lochiaCount > 0 ||
      painScores.length > 0 ||
      moodLatest != null ||
      weightLatest != null ||
      breastLatest != null,
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

function buildMomStats(momRecords, birthDate, options = {}) {
  const { from, to } = options;
  let dayList = getDayList(birthDate, to);
  if (from) {
    dayList = dayList.filter((d) => d.date >= from);
  }

  const days = dayList.map((d) => {
    const stats = aggregateMomDay(momRecords, d.date);
    return { ...d, ...stats };
  });

  const withBars = withBarPercent(
    days.map((d) => ({
      ...d,
      painScore: d.painAvg || 0,
      lochiaNum: d.lochiaCount,
      weightNum: d.weightValue || 0,
      breastNum: d.breastSeverity || 0,
    })),
    ['painScore', 'lochiaNum', 'weightNum', 'breastNum']
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
      {
        icon: '⚖️',
        label: '体重',
        value: d.weightDetail,
        barPercent: d.weightValue != null ? d.weightNumBar : 0,
        color: '#6b9fd4',
      },
      {
        icon: '🤱',
        label: '乳房护理',
        value: d.breastDetail,
        barPercent: d.breastSeverity != null ? d.breastNumBar : 0,
        color: '#e8a0c0',
      },
    ],
  }));

  const chartDays = enriched.map((d) => ({
    ...d,
    painBar: d.painScoreBar,
    lochiaBar: d.lochiaNumBar,
    weightBar: d.weightValue != null ? d.weightNumBar : 0,
    breastBar: d.breastSeverity != null && d.breastSeverity > 0 ? d.breastNumBar : 0,
  }));

  const detailDays = [...enriched].reverse();
  const hasAnyData = enriched.some((d) => d.hasData);

  return { chartDays, detailDays, hasAnyData, totalDays: enriched.length };
}

module.exports = { buildMomStats, getDayList };
