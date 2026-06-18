const { createApp, config } = require('./app');
const { testConnection } = require('./db/pool');

async function start() {
  try {
    await testConnection();
    console.log(`[tinydays-server] MySQL connected: ${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (err) {
    console.error('[tinydays-server] MySQL 连接失败，请检查数据库配置并执行 server/sql/schema.sql');
    console.error(err.message);
    process.exit(1);
  }

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[tinydays-server] running on http://localhost:${config.port}`);
    console.log(`[tinydays-server] env: ${config.nodeEnv}`);
  });
}

start();
