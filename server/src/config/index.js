require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'tinydays-dev-secret-change-in-production',
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
    devOpenid: process.env.DEV_OPENID || 'dev_local_user',
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'tinydays',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tinydays',
  },
};
