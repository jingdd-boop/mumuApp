const TOKEN_KEY = 'td_token';

const baseUrl = import.meta.env.VITE_API_BASE || '/api';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function request({ url, method = 'GET', data, auth = true }) {
  const header = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) header.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers: header };
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${baseUrl}${url}`, options);
  const body = await res.json().catch(() => ({}));

  if (res.status >= 200 && res.status < 300 && body.code === 0) {
    return body.data;
  }

  const err = new Error(body.message || `请求失败(${res.status})`);
  err.code = body.code;
  err.status = res.status;
  throw err;
}
