const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');
const recordUtil = require('../../utils/record');

const TYPE_MAP = {
  lochia: { title: '恶露记录' },
  pain: { title: '疼痛记录' },
  mood: { title: '情绪记录' },
  weight: { title: '体重记录' },
  breast: { title: '乳房护理记录' },
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
    weightKg: '',
    weightNote: '',
    breastEngorgement: 'none',
    breastBlocked: 'no',
    breastSide: 'left',
    breastFeeding: 'good',
    breastNote: '',
    lochiaColors: recordUtil.LOCHIA_COLORS,
    lochiaAmounts: recordUtil.LOCHIA_AMOUNTS,
    moodLevels: recordUtil.MOOD_LEVELS,
    engorgementLevels: recordUtil.ENGORGEMENT_LEVELS,
    blockedStatus: recordUtil.BLOCKED_STATUS,
    feedingStatus: recordUtil.FEEDING_STATUS,
    breastSides: recordUtil.BREAST_SIDES,
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
    const patch = { [field]: value };
    if (field === 'breastBlocked' && value === 'no') {
      patch.breastSide = '';
    }
    if (field === 'breastBlocked' && value === 'yes' && !this.data.breastSide) {
      patch.breastSide = 'left';
    }
    this.setData(patch);
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
    if (type === 'weight') {
      const kg = Number(this.data.weightKg);
      if (!this.data.weightKg || Number.isNaN(kg) || kg < 30 || kg > 200) {
        wx.showToast({ title: '请输入 30～200 kg 的体重', icon: 'none' });
        return;
      }
    }
    const date = confinement.todayStr();
    const payload = this.buildPayload();
    storage.addMomRecord({ type, date, time, payload });

    wx.showToast({ title: '记录成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  },

  buildPayload() {
    const {
      type,
      lochiaColor,
      lochiaAmount,
      lochiaNote,
      painScore,
      painNote,
      moodLevel,
      weightKg,
      weightNote,
      breastEngorgement,
      breastBlocked,
      breastSide,
      breastFeeding,
      breastNote,
    } = this.data;
    switch (type) {
      case 'lochia':
        return { color: lochiaColor, amount: lochiaAmount, note: lochiaNote };
      case 'pain':
        return { score: painScore, note: painNote };
      case 'mood':
        return { level: moodLevel };
      case 'weight':
        return { kg: Math.round(Number(weightKg) * 10) / 10, note: weightNote };
      case 'breast':
        return {
          engorgement: breastEngorgement,
          blocked: breastBlocked,
          side: breastBlocked === 'yes' ? breastSide : '',
          feeding: breastFeeding,
          note: breastNote,
        };
      default:
        return {};
    }
  },
});
