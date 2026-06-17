const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');
const recordUtil = require('../../utils/record');

Page({
  data: {
    nickName: '',
    confinement: { day: 1, total: 42, progress: 0, stage: { name: '' }, isEnded: false },
    deliveryLabel: '顺产',
    tips: [],
    timeline: [],
    today: '',
  },

  onShow() {
    const app = getApp();
    if (!app.checkOnboarding()) return;
    this.loadData();
  },

  loadData() {
    const mom = storage.getMom();
    const settings = storage.getSettings();
    const today = confinement.todayStr();
    const info = confinement.getConfinementDay(mom.deliveryDate, settings.totalDays);
    const tips = confinement.getTodayTips(mom.deliveryDate, settings.totalDays);
    const rawRecords = storage.getRecordsByDate(today);
    const timeline = rawRecords.map((r) => {
      const fmt = recordUtil.formatRecord(r);
      return {
        id: r.id,
        time: r.time,
        icon: fmt.icon,
        title: fmt.title,
        detail: fmt.detail,
      };
    });

    this.setData({
      nickName: mom.nickName,
      confinement: info,
      deliveryLabel: settings.deliveryType === 'cesarean' ? '剖腹产' : '顺产',
      tips,
      timeline,
      today,
    });
  },

  goDailyGuide() {
    wx.navigateTo({ url: '/pages/daily-guide/index' });
  },

  onQuickRecord(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/record-add/index?type=${type}` });
  },

  goRecord() {
    wx.switchTab({ url: '/pages/record/index' });
  },
});
