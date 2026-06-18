const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/response');
const { code2Session } = require('../services/wechat');
const store = require('../store');
const { sign, EXPIRES_MS } = require('../utils/token');
const AppError = require('../utils/AppError');

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { code } = req.body || {};
    const { openid } = await code2Session(code);

    let user = await store.findUserByOpenid(openid);
    if (!user) {
      user = await store.createUser(openid);
    } else {
      await store.updateLoginTime(user.id);
      user = await store.findUserById(user.id);
    }

    const token = sign(user.id);
    success(res, {
      token,
      expiresIn: Math.floor(EXPIRES_MS / 1000),
      user: store.toPublicUser(user),
    });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    success(res, store.toPublicUser(req.user));
  })
);

router.post(
  '/agreements',
  auth,
  asyncHandler(async (req, res) => {
    const { agreedDisclaimer, agreedPrivacy } = req.body || {};
    if (!agreedDisclaimer || !agreedPrivacy) {
      throw new AppError('参数错误：需同意免责声明和隐私政策');
    }
    const agreedTime = await store.updateAgreements(req.userId);
    success(res, {
      agreedDisclaimer: true,
      agreedPrivacy: true,
      agreedTime,
    });
  })
);

module.exports = router;
