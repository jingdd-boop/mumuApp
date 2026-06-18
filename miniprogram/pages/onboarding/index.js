const api = require('../../utils/api');
const confinement = require('../../utils/confinement');

Page({
  data: {
    nickName: '',
    deliveryDate: '',
    totalDays: 42,
    deliveryType: 'natural',
    agreedDisclaimer: false,
    agreedPrivacy: false,
    dayOptions: [
      { value: 28, label: '28 天' },
      { value: 30, label: '30 天' },
      { value: 42, label: '42 天' },
    ],
    deliveryOptions: [
      { value: 'natural', label: '顺产' },
      { value: 'cesarean', label: '剖腹产' },
    ],
    today: confinement.todayStr(),
  },

  onLoad() {
    getApp()
      .ensureLogin()
      .then(() => api.getProfileStatus())
      .then((status) => {
        if (!status.mom) return;
        const settings = status.settings || {};
        this.setData({
          nickName: status.mom.nickName || '',
          deliveryDate: status.mom.deliveryDate || '',
          totalDays: settings.totalDays || 42,
          deliveryType: settings.deliveryType || 'natural',
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },

  onNameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  onDeliveryDateChange(e) {
    this.setData({ deliveryDate: e.detail.value });
  },

  onDayChange(e) {
    this.setData({ totalDays: Number(e.currentTarget.dataset.value) });
  },

  onDeliveryChange(e) {
    this.setData({ deliveryType: e.currentTarget.dataset.value });
  },

  onDisclaimerChange(e) {
    this.setData({ agreedDisclaimer: e.detail.value.length > 0 });
  },

  onPrivacyChange(e) {
    this.setData({ agreedPrivacy: e.detail.value.length > 0 });
  },

  openDisclaimer() {
    wx.navigateTo({ url: '/pages/legal/disclaimer/index' });
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/legal/privacy/index' });
  },

  onSubmit() {
    const { nickName, deliveryDate, totalDays, deliveryType, agreedDisclaimer, agreedPrivacy } = this.data;
    if (!nickName.trim()) {
      wx.showToast({ title: '请输入你的称呼', icon: 'none' });
      return;
    }
    if (!deliveryDate) {
      wx.showToast({ title: '请选择生产日期', icon: 'none' });
      return;
    }
    if (!agreedDisclaimer || !agreedPrivacy) {
      wx.showToast({ title: '请阅读并同意相关协议', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    getApp()
      .ensureLogin()
      .then(() =>
        api.postOnboarding({
          nickName: nickName.trim(),
          deliveryDate,
          totalDays,
          deliveryType,
          agreedDisclaimer,
          agreedPrivacy,
        })
      )
      .then(() => getApp().refreshGlobalData())
      .then(() => {
        wx.showToast({ title: '设置成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 800);
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '保存失败', icon: 'none' });
      })
      .then(() => {
        wx.hideLoading();
      });
  },
});
