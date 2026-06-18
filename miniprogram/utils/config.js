// API 地址配置
// - 模拟器调试：可用 http://localhost:3000/api
// - 真机预览：必须改为电脑局域网 IP（手机和电脑需同一 WiFi）
//   查 IP：Mac 终端执行 ipconfig getifaddr en0
const DEV_HOST = '192.168.1.17';

module.exports = {
  baseUrl: `http://${DEV_HOST}:3000/api`,
};
