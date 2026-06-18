const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/response');
const store = require('../store');
const { validateOnboarding, validateMomProfile, validateSettings } = require('../services/recordValidate');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get(
  '/status',
  auth,
  asyncHandler(async (req, res) => {
    success(res, store.getProfileStatus(req.user));
  })
);

router.post(
  '/onboarding',
  auth,
  asyncHandler(async (req, res) => {
    validateOnboarding(req.body);
    const data = await store.saveOnboarding(req.userId, req.body);
    success(res, data);
  })
);

router.put(
  '/mom',
  auth,
  asyncHandler(async (req, res) => {
    validateMomProfile(req.body);
    if (!req.user.mom) throw new AppError('请先完成引导设置', { status: 400, code: 40001 });
    const mom = await store.updateMomProfile(req.userId, req.body);
    success(res, mom);
  })
);

router.put(
  '/settings',
  auth,
  asyncHandler(async (req, res) => {
    validateSettings(req.body);
    const settings = await store.updateSettings(req.userId, req.body);
    success(res, settings);
  })
);

router.delete(
  '/data',
  auth,
  asyncHandler(async (req, res) => {
    await store.clearUserData(req.userId);
    success(res, { cleared: true });
  })
);

module.exports = router;
