const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/response');
const store = require('../store');
const confinement = require('../services/confinement');
const { buildMomStats } = require('../services/stats');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get(
  '/mom',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user.mom?.deliveryDate) {
      throw new AppError('请先完成引导设置', { status: 400, code: 40001 });
    }

    const { from, to } = req.query;
    const birthDate = user.mom.deliveryDate;
    const momRecords = await store.getAllMomRecords(req.userId);
    const stats = buildMomStats(momRecords, birthDate, {
      from: from || birthDate,
      to: to || confinement.todayStr(),
    });

    success(res, stats);
  })
);

router.get(
  '/summary',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const [momRecordCount, babyRecordCount] = await Promise.all([
      store.countMomRecords(req.userId),
      store.countBabyRecords(req.userId),
    ]);

    let confinementText = '';
    if (user.mom?.deliveryDate) {
      const settings = user.settings || { totalDays: 42, deliveryType: 'natural' };
      const info = confinement.getConfinementDay(user.mom.deliveryDate, settings.totalDays);
      confinementText = `月子第 ${info.day} / ${info.total} 天 · ${info.stage.name}`;
    }

    success(res, {
      recordCount: momRecordCount + babyRecordCount,
      momRecordCount,
      babyRecordCount,
      confinementText,
    });
  })
);

module.exports = router;
