# tinydays-server

坐月子小程序 Express 后端服务（MySQL 持久化）。

## 目录结构

```
server/
├── sql/schema.sql        # MySQL 建表脚本
├── src/
│   ├── db/               # 连接池、行映射
│   ├── store/            # 数据访问层（MySQL）
│   ├── routes/           # API 路由
│   ├── services/         # 业务逻辑
│   └── middleware/       # 中间件
├── .env.example
└── package.json
```

## 快速开始

### 1. 初始化数据库

```bash
mysql -u root -p < sql/schema.sql
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填写 DB_HOST / DB_USER / DB_PASSWORD 等
```

### 3. 安装依赖并启动

```bash
npm install
npm run dev
```

服务默认运行在 `http://localhost:3000`，启动时会检测 MySQL 连接。

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 服务端口，默认 3000 |
| `JWT_SECRET` | Token 签名密钥 |
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信登录（开发可留空） |
| `DEV_OPENID` | 开发环境固定 mock 用户 openid，默认 `dev_local_user` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL 连接 |

## 数据存储

用户、档案、记录等数据存入 MySQL，表结构见 `docs/数据库设计.md`。

> 旧的 `data/db.json` 不再使用，如需迁移请手动导入。

## 响应格式

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

## 小程序对接

1. 开发阶段在微信开发者工具勾选「不校验合法域名」
2. `miniprogram/utils/config.js` 中配置 API 地址
3. 真机调试时使用电脑局域网 IP
