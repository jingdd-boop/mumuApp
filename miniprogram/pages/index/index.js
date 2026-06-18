const api = require('../../utils/api');

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
    getApp().checkOnboarding().then((ok) => {
      if (!ok) return;
      this.loadData();
    });
  },

  loadData() {
    api
      .getHomeOverview()
      .then((data) => {
        this.setData({
          nickName: data.nickName,
          confinement: data.confinement,
          deliveryLabel: data.deliveryLabel,
          tips: data.tips,
          timeline: data.timeline,
          today: data.today,
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
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
