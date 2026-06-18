const api = require('../../utils/api');
const confinement = require('../../utils/confinement');

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
    this.setData({ today: confinement.todayStr() });
    getApp()
      .ensureLogin()
      .then(() => api.getProfileStatus())
      .then((status) => {
        const mom = status.mom || {};
        const settings = status.settings || {};
        this.setData({
          nickName: mom.nickName || '',
          deliveryDate: mom.deliveryDate || '',
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

    wx.showLoading({ title: '保存中' });
    Promise.all([
      api.putMom({ nickName: nickName.trim(), deliveryDate }),
      api.putSettings({ totalDays, deliveryType }),
    ])
      .then(() => getApp().refreshGlobalData())
      .then(() => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 600);
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '保存失败', icon: 'none' });
      })
      .then(() => {
        wx.hideLoading();
      });
  },
});
