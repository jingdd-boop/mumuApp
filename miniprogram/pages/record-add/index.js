const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');
const recordUtil = require('../../utils/record');

const TYPE_MAP = {
  lochia: { title: '恶露记录' },
  pain: { title: '疼痛记录' },
  mood: { title: '情绪记录' },
};

Page({
  data: {
    type: 'lochia',
    pageTitle: '添加记录',
    time: '',
    lochiaColor: 'red',
    lochiaAmount: 'medium',
    lochiaNote: '',
    painScore: 3,
    painNote: '',
    moodLevel: 3,
    lochiaColors: recordUtil.LOCHIA_COLORS,
    lochiaAmounts: recordUtil.LOCHIA_AMOUNTS,
    moodLevels: recordUtil.MOOD_LEVELS,
  },

  onLoad(options) {
    const type = options.type || 'lochia';
    const info = TYPE_MAP[type] || TYPE_MAP.lochia;
    this.setData({
      type,
      pageTitle: info.title,
      time: recordUtil.nowTimeStr(),
    });
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },

  onTagSelect(e) {
    const { field, value } = e.currentTarget.dataset;
    this.setData({ [field]: value });
  },

  onTextInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  onPainChange(e) {
    this.setData({ painScore: e.detail.value });
  },

  onMoodSelect(e) {
    this.setData({ moodLevel: Number(e.currentTarget.dataset.value) });
  },

  onSubmit() {
    const { type, time } = this.data;
    const date = confinement.todayStr();
    const payload = this.buildPayload();
    storage.addMomRecord({ type, date, time, payload });

    wx.showToast({ title: '记录成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  },

  buildPayload() {
    const { type, lochiaColor, lochiaAmount, lochiaNote, painScore, painNote, moodLevel } = this.data;
    switch (type) {
      case 'lochia':
        return { color: lochiaColor, amount: lochiaAmount, note: lochiaNote };
      case 'pain':
        return { score: painScore, note: painNote };
      case 'mood':
        return { level: moodLevel };
      default:
        return {};
    }
  },
});
