import { request } from './client';

export function login(code) {
  return request({ url: '/auth/login', method: 'POST', data: { code }, auth: false });
}

export function getMe() {
  return request({ url: '/auth/me' });
}

export function getProfileStatus() {
  return request({ url: '/profile/status' });
}

export function postOnboarding(data) {
  return request({ url: '/profile/onboarding', method: 'POST', data });
}

export function putMom(data) {
  return request({ url: '/profile/mom', method: 'PUT', data });
}

export function putSettings(data) {
  return request({ url: '/profile/settings', method: 'PUT', data });
}

export function deleteAllData() {
  return request({ url: '/profile/data', method: 'DELETE' });
}

export function getHomeOverview() {
  return request({ url: '/home/overview' });
}

export function getMomRecordsToday() {
  return request({ url: '/records/mom/today' });
}

export function createMomRecord(data) {
  return request({ url: '/records/mom', method: 'POST', data });
}

export function deleteMomRecord(id) {
  return request({ url: `/records/mom/${id}`, method: 'DELETE' });
}

export function getMomStats(params = {}) {
  const qs = Object.keys(params)
    .filter((k) => params[k])
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request({ url: `/stats/mom${qs ? `?${qs}` : ''}` });
}

export function getStatsSummary() {
  return request({ url: '/stats/summary' });
}

export function getKnowledgeCategories() {
  return request({ url: '/content/knowledge/categories', auth: false });
}

export function getKnowledgeArticles(category) {
  const qs = category && category !== 'all' ? `?category=${category}` : '';
  return request({ url: `/content/knowledge/articles${qs}`, auth: false });
}

export function getKnowledgeArticle(id) {
  return request({ url: `/content/knowledge/articles/${id}`, auth: false });
}

export function getKnowledgeRecommended(limit = 3) {
  return request({ url: `/content/knowledge/recommended?limit=${limit}` });
}

export function getDeliveryGuide(params = {}) {
  const qs = Object.keys(params)
    .filter((k) => params[k] != null && params[k] !== '')
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  return request({ url: `/content/delivery-guide${qs ? `?${qs}` : ''}` });
}
