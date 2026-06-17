const knowledge = require('../../utils/knowledge');

Page({
  data: {
    article: null,
    categoryLabel: '',
  },

  onLoad(options) {
    const article = knowledge.getArticleById(options.id);
    if (!article) {
      wx.showToast({ title: '文章不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    wx.setNavigationBarTitle({ title: article.title });
    this.setData({
      article,
      categoryLabel: knowledge.getCategoryLabel(article.category),
    });
  },
});
