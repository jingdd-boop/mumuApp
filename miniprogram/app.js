const storage = require('./utils/storage');

App({
  globalData: {
    env: '',
    user: null,
    mom: null,
    settings: null,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    this.loadLocalData();
    this.login();
  },

  loadLocalData() {
    this.globalData.user = storage.getUser();
    this.globalData.mom = storage.getMom();
    this.globalData.settings = storage.getSettings();
  },

  login() {
    wx.login({
      success: () => {
        const user = storage.getUser() || {};
        if (!user.loginTime) {
          storage.saveUser({ ...user, loginTime: Date.now() });
          this.globalData.user = storage.getUser();
        }
        if (this.globalData.env) {
          wx.cloud
            .callFunction({ name: 'quickstartFunctions', data: { type: 'getOpenId' } })
            .then((res) => {
              if (res.result && res.result.openid) {
                const u = { ...storage.getUser(), openid: res.result.openid };
                storage.saveUser(u);
                this.globalData.user = u;
              }
            })
            .catch(() => {});
        }
      },
    });
  },

  refreshGlobalData() {
    this.loadLocalData();
  },

  checkOnboarding() {
    const mom = storage.getMom();
    if (!storage.isOnboarded() || !mom || !mom.deliveryDate) {
      wx.reLaunch({ url: '/pages/onboarding/index' });
      return false;
    }
    return true;
  },
});
