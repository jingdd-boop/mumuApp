const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');

Page({
  data: {
    nickName: '',
    confinementText: '',
    recordCount: 0,
  },

  onShow() {
    const mom = storage.getMom();
    if (!mom) {
      this.setData({ nickName: '未设置', confinementText: '', recordCount: 0 });
      return;
    }
    const settings = storage.getSettings();
    const info = confinement.getConfinementDay(mom.deliveryDate, settings.totalDays);
    const momCount = storage.getMomRecords().filter((r) => !r.deleted).length;

    this.setData({
      nickName: mom.nickName,
      confinementText: `月子第 ${info.day} / ${info.total} 天 · ${info.stage.name}`,
      recordCount: momCount,
    });
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/index' });
  },

  goDisclaimer() {
    wx.navigateTo({ url: '/pages/legal/disclaimer/index' });
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/legal/privacy/index' });
  },

  onClearData() {
    wx.showModal({
      title: '清除所有数据',
      content: '将删除个人档案、所有记录和设置，此操作不可恢复。确定继续吗？',
      confirmColor: '#7B5CF0',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData();
          getApp().refreshGlobalData();
          wx.showToast({ title: '已清除', icon: 'success' });
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/onboarding/index' });
          }, 800);
        }
      },
    });
  },
});
