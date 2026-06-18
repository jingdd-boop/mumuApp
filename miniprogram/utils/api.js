const config = require('./config');

const TOKEN_KEY = 'td_token';

function getToken() {
  try {
    return wx.getStorageSync(TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

function request({ url, method = 'GET', data, auth = true }) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) header.Authorization = `Bearer ${token}`;
    }

    wx.request({
      url: `${config.baseUrl}${url}`,
      method,
      data,
      header,
      success(res) {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data);
          return;
        }
        const err = new Error(body.message || `请求失败(${res.statusCode})`);
        err.code = body.code;
        err.status = res.statusCode;
        reject(err);
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

function login(code) {
  return request({ url: '/auth/login', method: 'POST', data: { code }, auth: false });
}

function getMe() {
  return request({ url: '/auth/me' });
}

function getProfileStatus() {
  return request({ url: '/profile/status' });
}

function postOnboarding(data) {
  return request({ url: '/profile/onboarding', method: 'POST', data });
}

function putMom(data) {
  return request({ url: '/profile/mom', method: 'PUT', data });
}

function putSettings(data) {
  return request({ url: '/profile/settings', method: 'PUT', data });
}

function deleteAllData() {
  return request({ url: '/profile/data', method: 'DELETE' });
}

function getHomeOverview() {
  return request({ url: '/home/overview' });
}

function getMomRecordsToday() {
  return request({ url: '/records/mom/today' });
}

function createMomRecord(data) {
  return request({ url: '/records/mom', method: 'POST', data });
}

function deleteMomRecord(id) {
  return request({ url: `/records/mom/${id}`, method: 'DELETE' });
}

function getMomStats(params = {}) {
  const qs = Object.keys(params)
    .filter((k) => params[k])
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request({ url: `/stats/mom${qs ? `?${qs}` : ''}` });
}

function getStatsSummary() {
  return request({ url: '/stats/summary' });
}

function getKnowledgeCategories() {
  return request({ url: '/content/knowledge/categories', auth: false });
}

function getKnowledgeArticles(category) {
  const qs = category && category !== 'all' ? `?category=${category}` : '';
  return request({ url: `/content/knowledge/articles${qs}`, auth: false });
}

function getKnowledgeArticle(id) {
  return request({ url: `/content/knowledge/articles/${id}`, auth: false });
}

function getKnowledgeRecommended(limit = 3) {
  return request({ url: `/content/knowledge/recommended?limit=${limit}` });
}

function getDeliveryGuide(params = {}) {
  const qs = Object.keys(params)
    .filter((k) => params[k] != null && params[k] !== '')
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request({ url: `/content/delivery-guide${qs ? `?${qs}` : ''}` });
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  login,
  getMe,
  getProfileStatus,
  postOnboarding,
  putMom,
  putSettings,
  deleteAllData,
  getHomeOverview,
  getMomRecordsToday,
  createMomRecord,
  deleteMomRecord,
  getMomStats,
  getStatsSummary,
  getKnowledgeCategories,
  getKnowledgeArticles,
  getKnowledgeArticle,
  getKnowledgeRecommended,
  getDeliveryGuide,
};
