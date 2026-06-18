const https = require('https');
const config = require('../config');
const AppError = require('../utils/AppError');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function code2Session(code) {
  if (!code) throw new AppError('参数错误：code 不能为空');

  const { appId, appSecret, devOpenid } = config.wechat;
  if (!appId || !appSecret) {
    return { openid: devOpenid };
  }

  const url =
    `https://api.weixin.qq.com/sns/jscode2session` +
    `?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  const result = await httpsGet(url);
  if (result.errcode) {
    throw new AppError(`微信登录失败：${result.errmsg || result.errcode}`, { status: 400, code: 40001 });
  }
  return { openid: result.openid, sessionKey: result.session_key };
}

module.exports = { code2Session };
