const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');
const deliveryGuide = require('../../utils/delivery-guide');

Page({
  data: {
    guide: null,
    stages: [],
    currentIndex: 0,
    deliveryLabel: '',
    confinementDay: 1,
  },

  onLoad() {
    const mom = storage.getMom();
    const settings = storage.getSettings();
    const info = confinement.getConfinementDay(mom.deliveryDate, settings.totalDays);
    const deliveryType = settings.deliveryType || 'natural';
    const currentIndex = deliveryGuide.getStageIndexByDay(info.day);
    const stages = deliveryGuide.getStages(deliveryType);
    const guide = deliveryGuide.getStageGuide(deliveryType, currentIndex);

    this.setData({
      guide,
      stages,
      currentIndex,
      confinementDay: info.day,
      deliveryLabel: guide.deliveryLabel,
    });
  },

  onStageChange(e) {
    const index = Number(e.currentTarget.dataset.index);
    const settings = storage.getSettings();
    const guide = deliveryGuide.getStageGuide(settings.deliveryType, index);
    this.setData({ guide, currentIndex: index });
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },
});
