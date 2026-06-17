const storage = require('../../utils/storage');
const confinement = require('../../utils/confinement');
const knowledge = require('../../utils/knowledge');

Page({
  data: {
    activeCategory: 'all',
    categories: knowledge.CATEGORIES,
    articles: [],
    recommended: [],
    confinementDay: 1,
    stageName: '',
  },

  onShow() {
    const app = getApp();
    if (!app.checkOnboarding()) return;
    this.loadData();
  },

  loadData() {
    const mom = storage.getMom();
    const settings = storage.getSettings();
    const info = confinement.getConfinementDay(mom.deliveryDate, settings.totalDays);
    const recommended = knowledge.getRecommendedArticles(info.day, 3);
    const articles = this.mapArticles(knowledge.getArticles(this.data.activeCategory));

    this.setData({
      recommended,
      articles,
      confinementDay: info.day,
      stageName: info.stage.name,
    });
  },

  onCategoryChange(e) {
    const activeCategory = e.currentTarget.dataset.id;
    const articles = this.mapArticles(knowledge.getArticles(activeCategory));
    this.setData({ activeCategory, articles });
  },

  mapArticles(list) {
    return list.map((a) => ({
      ...a,
      categoryLabel: knowledge.getCategoryLabel(a.category),
    }));
  },

  onOpenArticle(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/learn-detail/index?id=${id}` });
  },
});
