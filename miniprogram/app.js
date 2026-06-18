const api = require('./utils/api');

App({
  globalData: {
    user: null,
    mom: null,
    settings: null,
    onboarded: false,
  },

  onLaunch() {
    this._loginPromise = null;
    this.ensureLogin().catch((err) => {
      console.error('登录失败', err);
    });
  },

  ensureLogin() {
    if (this._loginPromise) return this._loginPromise;
    this._loginPromise = this._doEnsureLogin();
    this._loginPromise.catch(() => {
      this._loginPromise = null;
    });
    return this._loginPromise;
  },

  _doEnsureLogin() {
    const token = api.getToken();
    if (token) {
      return api
        .getMe()
        .then((user) => {
          this.globalData.user = user;
          return { token, user };
        })
        .catch(() => {
          api.clearToken();
          return this._wxLogin();
        });
    }
    return this._wxLogin();
  },

  _wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (!res.code) {
            reject(new Error('获取登录凭证失败'));
            return;
          }
          api
            .login(res.code)
            .then((data) => {
              api.setToken(data.token);
              this.globalData.user = data.user;
              resolve(data);
            })
            .catch(reject);
        },
        fail: reject,
      });
    });
  },

  refreshGlobalData() {
    return this.ensureLogin()
      .then(() => api.getProfileStatus())
      .then((status) => {
        this.globalData.mom = status.mom;
        this.globalData.settings = status.settings;
        this.globalData.onboarded = status.onboarded;
        return status;
      });
  },

  checkOnboarding() {
    return this.ensureLogin()
      .then(() => api.getProfileStatus())
      .then((status) => {
        this.globalData.mom = status.mom;
        this.globalData.settings = status.settings;
        this.globalData.onboarded = status.onboarded;
        if (!status.onboarded || !status.mom || !status.mom.deliveryDate) {
          wx.reLaunch({ url: '/pages/onboarding/index' });
          return false;
        }
        return true;
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
        return false;
      });
  },
});
