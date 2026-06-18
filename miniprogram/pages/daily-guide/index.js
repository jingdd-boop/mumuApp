const api = require('../../utils/api');

Page({
  data: {
    guide: null,
    stages: [],
    currentIndex: 0,
    deliveryLabel: '',
    confinementDay: 1,
    deliveryType: 'natural',
  },

  onLoad() {
    getApp()
      .ensureLogin()
      .then(() => api.getDeliveryGuide())
      .then((data) => {
        const guide = data.guide || {};
        this.setData({
          guide: data.guide,
          stages: data.stages || [],
          currentIndex: data.currentIndex || 0,
          confinementDay: data.confinementDay || 1,
          deliveryLabel: data.deliveryLabel || '',
          deliveryType: guide.deliveryType || 'natural',
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },

  onStageChange(e) {
    const index = Number(e.currentTarget.dataset.index);
    const stage = this.data.stages[index];
    if (!stage) return;
    const guide = Object.assign({}, stage, {
      deliveryLabel: this.data.deliveryLabel,
      deliveryType: this.data.deliveryType,
    });
    this.setData({ guide, currentIndex: index });
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },
});
