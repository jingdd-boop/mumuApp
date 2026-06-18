# 沐沐记 Web 端

基于 React + Vite 的 PC Web 应用，与小程序 `miniprogram/` 页面结构对齐，对接同一套后端 API（`server/`）。

## 页面对应

| Web 路由 | 小程序页面 |
|----------|------------|
| `/` | 首页 `pages/index` |
| `/record` | 记录 `pages/record` |
| `/learn` | 知识 `pages/learn` |
| `/mine` | 我的 `pages/mine` |
| `/onboarding` | 引导 `pages/onboarding` |
| `/record-add` | 添加记录 `pages/record-add` |
| `/daily-guide` | 阶段指南 `pages/daily-guide` |
| `/learn/:id` | 文章详情 `pages/learn-detail` |
| `/settings` | 设置 `pages/settings` |
| `/legal/*` | 法律条款 `pages/legal/*` |

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

后端默认运行在 `http://localhost:3000`。开发环境未配置微信 AppId 时，会使用 `DEV_OPENID` 模拟登录。

### 2. 启动 Web

```bash
cd web
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。

Vite 已将 `/api` 代理到 `http://localhost:3000`，无需额外配置。

### 3. 生产构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/`。部署时需将 API 请求指向实际后端地址，可设置环境变量：

```bash
VITE_API_BASE=https://your-domain.com/api npm run build
```

## 登录说明

Web 端无法使用微信 `wx.login()`，因此通过开发模式登录：调用 `POST /auth/login` 并传入任意 `code`，后端在未配置微信密钥时会绑定到固定 `DEV_OPENID` 用户，与小程序开发调试行为一致。

## 技术栈

- React 19
- React Router 7
- Vite 6
- 无 UI 框架，样式复用小程序配色与布局风格
