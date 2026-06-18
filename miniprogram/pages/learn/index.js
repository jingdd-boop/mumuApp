const api = require('../../utils/api');

Page({
  data: {
    activeCategory: 'all',
    categories: [],
    articles: [],
    recommended: [],
    confinementDay: 1,
    stageName: '',
  },

  onShow() {
    getApp().checkOnboarding().then((ok) => {
      if (!ok) return;
      this.loadData();
    });
  },

  loadData() {
    Promise.all([api.getKnowledgeCategories(), api.getKnowledgeRecommended(3)])
      .then(([catData, recommendedData]) => {
        const categories = catData.list || [];
        return api.getKnowledgeArticles(this.data.activeCategory).then((articlesData) => {
          this.setData({
            categories,
            recommended: recommendedData.list || [],
            articles: articlesData.list || [],
            confinementDay: recommendedData.confinementDay || 1,
            stageName: recommendedData.stageName || '',
          });
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },

  onCategoryChange(e) {
    const activeCategory = e.currentTarget.dataset.id;
    api
      .getKnowledgeArticles(activeCategory)
      .then((articlesData) => {
        this.setData({
          activeCategory,
          articles: articlesData.list || [],
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },

  onOpenArticle(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/learn-detail/index?id=${id}` });
  },
});
