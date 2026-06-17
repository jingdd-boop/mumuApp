const storage = require('../../utils/storage');
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
    const mom = storage.getMom();
    if (mom) {
      const settings = storage.getSettings();
      this.setData({
        nickName: mom.nickName || '',
        deliveryDate: mom.deliveryDate || '',
        totalDays: settings.totalDays || 42,
        deliveryType: settings.deliveryType || 'natural',
      });
    }
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

    storage.saveMom({
      id: storage.getMom()?.id || storage.genId(),
      nickName: nickName.trim(),
      deliveryDate,
      createTime: Date.now(),
    });
    storage.saveSettings({ totalDays, deliveryType });
    storage.setOnboarded(true);

    const user = storage.getUser() || {};
    storage.saveUser({
      ...user,
      agreedDisclaimer: true,
      agreedPrivacy: true,
      agreedTime: Date.now(),
    });

    getApp().refreshGlobalData();
    wx.showToast({ title: '设置成功', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 800);
  },
});
