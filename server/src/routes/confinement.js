const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/response');
const confinement = require('../services/confinement');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get(
  '/day',
  auth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user.mom?.deliveryDate) {
      throw new AppError('请先完成引导设置', { status: 400, code: 40001 });
    }
    const settings = user.settings || { totalDays: 42, deliveryType: 'natural' };
    success(res, confinement.getConfinementDay(user.mom.deliveryDate, settings.totalDays));
  })
);

module.exports = router;
