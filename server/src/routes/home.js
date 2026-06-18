const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/response');
const store = require('../store');
const confinement = require('../services/confinement');
const { formatRecord } = require('../services/recordFormat');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get(
  '/overview',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user.mom?.deliveryDate) {
      throw new AppError('请先完成引导设置', { status: 400, code: 40001 });
    }

    const settings = user.settings || { totalDays: 42, deliveryType: 'natural' };
    const today = confinement.todayStr();
    const info = confinement.getConfinementDay(user.mom.deliveryDate, settings.totalDays);
    const tips = confinement.getTodayTips(user.mom.deliveryDate, settings.totalDays);

    const { list } = await store.listMomRecords(req.userId, { date: today, page: 1, pageSize: 200 });
    const timeline = list
      .sort((a, b) => (b.time || '00:00').localeCompare(a.time || '00:00'))
      .map((r) => {
        const fmt = formatRecord(r);
        return { id: r.id, time: r.time, icon: fmt.icon, title: fmt.title, detail: fmt.detail };
      });

    success(res, {
      nickName: user.mom.nickName,
      today,
      deliveryLabel: settings.deliveryType === 'cesarean' ? '剖腹产' : '顺产',
      confinement: info,
      tips,
      timeline,
    });
  })
);

module.exports = router;
