Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    subtitle: {
      type: String,
      value: '',
    },
    showBack: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    headerHeight: 64,
  },

  lifetimes: {
    attached() {
      const sys = wx.getSystemInfoSync();
      const menu = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = sys.statusBarHeight || 20;
      const navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height;
      this.setData({
        statusBarHeight,
        navBarHeight,
        headerHeight: statusBarHeight + navBarHeight,
      });
    },
  },

  methods: {
    onBack() {
      wx.navigateBack({ delta: 1 });
    },
  },
});
