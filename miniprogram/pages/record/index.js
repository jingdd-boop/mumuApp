const api = require('../../utils/api');
const confinement = require('../../utils/confinement');

Page({
  data: {
    viewTab: 'record',
    pageSubtitle: '',
    today: '',
    records: [],
    chartDays: [],
    detailDays: [],
    hasTrendData: false,
    totalDays: 0,
    addTypes: [
      { type: 'lochia', icon: '💗', label: '恶露' },
      { type: 'pain', icon: '🩹', label: '疼痛' },
      { type: 'mood', icon: '💭', label: '情绪' },
      { type: 'weight', icon: '⚖️', label: '体重' },
      { type: 'breast', icon: '🤱', label: '乳房' },
    ],
  },

  onShow() {
    getApp().checkOnboarding().then((ok) => {
      if (!ok) return;
      this.loadData();
    });
  },

  loadData() {
    const today = confinement.todayStr();
    Promise.all([api.getMomRecordsToday(), api.getMomStats()])
      .then(([todayData, stats]) => {
        const pageSubtitle =
          this.data.viewTab === 'record'
            ? `今日 · ${today}`
            : `共 ${stats.totalDays} 天 · 左右滑动查看`;

        this.setData({
          today,
          records: todayData.list || [],
          chartDays: stats.chartDays || [],
          detailDays: stats.detailDays || [],
          hasTrendData: stats.hasAnyData,
          totalDays: stats.totalDays,
          pageSubtitle,
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },

  switchView(e) {
    const viewTab = e.currentTarget.dataset.tab;
    const pageSubtitle =
      viewTab === 'record'
        ? `今日 · ${this.data.today}`
        : `共 ${this.data.totalDays} 天 · 左右滑动查看`;
    this.setData({ viewTab, pageSubtitle });
  },

  onAdd(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/record-add/index?type=${type}` });
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    const that = this;
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success(res) {
        if (!res.confirm) return;
        api
          .deleteMomRecord(id)
          .then(() => {
            that.loadData();
          })
          .catch((err) => {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          });
      },
    });
  },
});
