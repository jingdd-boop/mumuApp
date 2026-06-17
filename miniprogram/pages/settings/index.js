const storage = require('../../utils/storage');

Page({
  data: {
    nickName: '',
    deliveryDate: '',
    totalDays: 42,
    deliveryType: 'natural',
    dayOptions: [
      { value: 28, label: '28 天' },
      { value: 30, label: '30 天' },
      { value: 42, label: '42 天' },
    ],
    deliveryOptions: [
      { value: 'natural', label: '顺产' },
      { value: 'cesarean', label: '剖腹产' },
    ],
    today: '',
  },

  onLoad() {
    const confinement = require('../../utils/confinement');
    const mom = storage.getMom() || {};
    const settings = storage.getSettings();
    this.setData({
      nickName: mom.nickName || '',
      deliveryDate: mom.deliveryDate || '',
      totalDays: settings.totalDays || 42,
      deliveryType: settings.deliveryType || 'natural',
      today: confinement.todayStr(),
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

  onSave() {
    const { nickName, deliveryDate, totalDays, deliveryType } = this.data;
    if (!nickName.trim()) {
      wx.showToast({ title: '请输入你的称呼', icon: 'none' });
      return;
    }
    if (!deliveryDate) {
      wx.showToast({ title: '请选择生产日期', icon: 'none' });
      return;
    }

    const existing = storage.getMom() || {};
    storage.saveMom({
      ...existing,
      nickName: nickName.trim(),
      deliveryDate,
    });
    storage.saveSettings({ totalDays, deliveryType });
    getApp().refreshGlobalData();

    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  },
});
