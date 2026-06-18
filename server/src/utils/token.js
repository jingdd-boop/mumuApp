const crypto = require('crypto');
const config = require('../config');
const AppError = require('./AppError');

const EXPIRES_MS = 7200 * 1000;

function sign(userId) {
  const exp = Date.now() + EXPIRES_MS;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac('sha256', config.jwtSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

function verify(token) {
  try {
    const raw = Buffer.from(token, 'base64url').toString();
    const [userId, expStr, sig] = raw.split('.');
    if (!userId || !expStr || !sig) throw new Error('invalid');
    const payload = `${userId}.${expStr}`;
    const expected = crypto.createHmac('sha256', config.jwtSecret).update(payload).digest('hex');
    if (sig !== expected) throw new Error('invalid');
    if (Date.now() > Number(expStr)) {
      throw new AppError('token 已过期', { status: 401, code: 40102 });
    }
    return userId;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('未登录或 token 无效', { status: 401, code: 40101 });
  }
}

module.exports = { sign, verify, EXPIRES_MS };
