const { verify } = require('../utils/token');
const store = require('../store');
const AppError = require('../utils/AppError');

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return next(new AppError('未登录', { status: 401, code: 40101 }));
  }
  try {
    const userId = verify(token);
    const user = await store.findUserById(userId);
    if (!user) {
      return next(new AppError('未登录', { status: 401, code: 40101 }));
    }
    req.user = user;
    req.userId = userId;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;
