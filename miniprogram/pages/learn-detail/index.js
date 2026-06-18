const api = require('../../utils/api');

Page({
  data: {
    article: null,
    categoryLabel: '',
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '文章不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }

    api
      .getKnowledgeArticle(options.id)
      .then((article) => {
        wx.setNavigationBarTitle({ title: article.title });
        this.setData({
          article,
          categoryLabel: article.categoryLabel || '',
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '文章不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 800);
      });
  },
});
