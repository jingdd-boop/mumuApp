const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');
const recordUtil = require('../../utils/record');
const statsUtil = require('../../utils/stats');

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
    const app = getApp();
    if (!app.checkOnboarding()) return;
    this.loadData();
  },

  loadData() {
    const today = confinement.todayStr();
    const records = storage.getRecordsByDate(today).map((r) => {
      const fmt = recordUtil.formatRecord(r);
      return { ...r, icon: fmt.icon, title: fmt.title, detail: fmt.detail };
    });

    const mom = storage.getMom();
    const momRecords = storage.getMomRecords();
    const momStats = statsUtil.buildMomStats(momRecords, mom.deliveryDate);

    const pageSubtitle =
      this.data.viewTab === 'record'
        ? `今日 · ${today}`
        : `共 ${momStats.totalDays} 天 · 左右滑动查看`;

    this.setData({
      today,
      records,
      chartDays: momStats.chartDays,
      detailDays: momStats.detailDays,
      hasTrendData: momStats.hasAnyData,
      totalDays: momStats.totalDays,
      pageSubtitle,
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
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.updateMomRecord(id, { deleted: true });
          this.loadData();
        }
      },
    });
  },
});
