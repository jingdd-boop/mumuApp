const api = require('../../utils/api');

Page({
  data: {
    nickName: '',
    confinementText: '',
    recordCount: 0,
  },

  onShow() {
    getApp()
      .ensureLogin()
      .then(() => Promise.all([api.getProfileStatus(), api.getStatsSummary()]))
      .then(([status, summary]) => {
        if (!status.mom) {
          this.setData({ nickName: '未设置', confinementText: '', recordCount: 0 });
          return;
        }
        this.setData({
          nickName: status.mom.nickName,
          confinementText: summary.confinementText || '',
          recordCount: summary.momRecordCount || 0,
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
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
        if (!res.confirm) return;
        wx.showLoading({ title: '清除中' });
        api
          .deleteAllData()
          .then(() => getApp().refreshGlobalData())
          .then(() => {
            wx.showToast({ title: '已清除', icon: 'success' });
            setTimeout(() => {
              wx.redirectTo({ url: '/pages/onboarding/index' });
            }, 800);
          })
          .catch((err) => {
            wx.showToast({ title: err.message || '清除失败', icon: 'none' });
          })
          .then(() => {
            wx.hideLoading();
          });
      },
    });
  },
});
