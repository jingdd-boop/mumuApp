const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/response');
const knowledge = require('../content/knowledge');
const deliveryGuide = require('../content/deliveryGuide');
const confinement = require('../services/confinement');
const AppError = require('../utils/AppError');

const router = express.Router();

function mapArticleListItem(a) {
  return {
    id: a.id,
    category: a.category,
    categoryLabel: knowledge.getCategoryLabel(a.category),
    icon: a.icon,
    title: a.title,
    summary: a.summary,
    readMinutes: a.readMinutes,
    dayRange: a.dayRange,
  };
}

router.get(
  '/knowledge/categories',
  asyncHandler(async (req, res) => {
    success(res, { list: knowledge.CATEGORIES });
  })
);

router.get(
  '/knowledge/articles',
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    const list = knowledge.getArticles(category).map(mapArticleListItem);
    success(res, { list });
  })
);

router.get(
  '/knowledge/articles/:id',
  asyncHandler(async (req, res) => {
    const article = knowledge.getArticleById(req.params.id);
    if (!article) {
      throw new AppError('文章不存在', { status: 404, code: 40401 });
    }
    success(res, {
      ...article,
      categoryLabel: knowledge.getCategoryLabel(article.category),
    });
  })
);

router.get(
  '/knowledge/recommended',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user.mom?.deliveryDate) {
      throw new AppError('请先完成引导设置', { status: 400, code: 40001 });
    }

    const settings = user.settings || { totalDays: 42 };
    const info = confinement.getConfinementDay(user.mom.deliveryDate, settings.totalDays);
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 3));
    const recommended = knowledge.getRecommendedArticles(info.day, limit);

    success(res, {
      confinementDay: info.day,
      stageName: info.stage.name,
      list: recommended.map(mapArticleListItem),
    });
  })
);

router.get(
  '/delivery-guide',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user.mom?.deliveryDate) {
      throw new AppError('请先完成引导设置', { status: 400, code: 40001 });
    }

    const settings = user.settings || { totalDays: 42, deliveryType: 'natural' };
    const info = confinement.getConfinementDay(user.mom.deliveryDate, settings.totalDays);

    const deliveryType = req.query.deliveryType || settings.deliveryType || 'natural';
    const day = req.query.day != null ? Number(req.query.day) : info.day;
    const currentIndex = deliveryGuide.getStageIndexByDay(day);
    const stages = deliveryGuide.getStages(deliveryType);
    const guide = deliveryGuide.getStageGuide(deliveryType, currentIndex);

    success(res, {
      confinementDay: day,
      deliveryLabel: guide.deliveryLabel,
      currentIndex,
      stages,
      guide,
    });
  })
);

module.exports = router;
