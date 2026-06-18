# 沐沐记（tinyDaysMinApp）后端 API 文档

**文档版本**：v1.0  
**基础路径**：`/api`  
**服务框架**：Express（`server/`）  
**对齐前端**：`miniprogram/` 本地存储结构与页面能力  
**文档日期**：2026-06-18

---

## 1. 概述

### 1.1 设计原则

本 API 文档依据小程序当前前端架构推导，目标是将以下本地存储（`miniprogram/utils/storage.js`）迁移为服务端持久化：

| 本地 Key | 业务含义 | 对应 API 资源 |
|----------|----------|---------------|
| `td_user` | 用户登录态 | `/auth/*` |
| `td_mom` | 妈妈档案 | `/profile/mom` |
| `td_settings` | 月子设置 | `/profile/settings` |
| `td_mom_records` | 妈妈健康记录 | `/records/mom` |
| `td_baby_records` | 宝宝记录（代码预留，PRD 规划） | `/records/baby` |
| `td_onboarded` | 是否完成引导 | 由 `profile/mom` 是否存在推导 |

### 1.2 基础信息

```
开发环境：http://localhost:3000/api
生产环境：https://your-domain.com/api   （上线前配置微信小程序 request 合法域名）
```

### 1.3 通用请求头

| Header | 必填 | 说明 |
|--------|------|------|
| `Content-Type` | 是（POST/PUT/PATCH） | `application/json` |
| `Authorization` | 除登录外均必填 | `Bearer <token>`，由微信登录接口换取 |

### 1.4 通用响应格式

**成功**

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

**失败**

```json
{
  "code": 40001,
  "message": "参数错误：deliveryDate 不能为空",
  "data": null
}
```

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 token 失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.5 通用字段约定

- 时间戳：`createTime`、`updateTime` 使用毫秒 Unix 时间戳（与前端 `Date.now()` 一致）
- 日期：`date` 字段格式 `YYYY-MM-DD`（与 `confinement.todayStr()` 一致）
- 时刻：`time` 字段格式 `HH:mm`（与 `record.nowTimeStr()` 一致）
- 软删除：记录类资源使用 `deleted: true`，不物理删除
- ID：字符串，格式 `{timestamp}_{random}`（与 `storage.genId()` 一致）

---

## 2. 认证模块

对应页面：`app.js` 登录逻辑、`pages/onboarding/index`

### 2.1 微信登录

用小程序 `wx.login()` 获取的 `code` 换取服务端 token 和 openid。

```
POST /auth/login
```

**请求体**

```json
{
  "code": "081xYz000xxxxx"
}
```

**响应 `data`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 7200,
  "user": {
    "id": "user_abc123",
    "openid": "oXXXX",
    "loginTime": 1718697600000,
    "agreedDisclaimer": false,
    "agreedPrivacy": false,
    "agreedTime": null
  }
}
```

### 2.2 获取当前用户

```
GET /auth/me
```

**响应 `data`**

```json
{
  "id": "user_abc123",
  "openid": "oXXXX",
  "loginTime": 1718697600000,
  "agreedDisclaimer": true,
  "agreedPrivacy": true,
  "agreedTime": 1718697600000
}
```

### 2.3 同意协议

对应引导页 `onSubmit` 中写入 `agreedDisclaimer`、`agreedPrivacy`。

```
POST /auth/agreements
```

**请求体**

```json
{
  "agreedDisclaimer": true,
  "agreedPrivacy": true
}
```

**响应 `data`**

```json
{
  "agreedDisclaimer": true,
  "agreedPrivacy": true,
  "agreedTime": 1718697600000
}
```

---

## 3. 档案与设置

对应页面：`pages/onboarding/index`、`pages/settings/index`、`pages/mine/index`

### 3.1 获取引导/档案状态

用于替代 `storage.isOnboarded()` + `storage.getMom()` 判断。

```
GET /profile/status
```

**响应 `data`**

```json
{
  "onboarded": true,
  "mom": {
    "id": "1718697600000_abc1234",
    "nickName": "沐沐妈",
    "deliveryDate": "2026-06-01",
    "createTime": 1718697600000
  },
  "settings": {
    "totalDays": 42,
    "deliveryType": "natural"
  }
}
```

`onboarded` 为 `false` 时，`mom` 可为 `null`，前端跳转引导页。

### 3.2 完成引导 / 创建档案

对应 `pages/onboarding/index.js` → `onSubmit`。

```
POST /profile/onboarding
```

**请求体**

```json
{
  "nickName": "沐沐妈",
  "deliveryDate": "2026-06-01",
  "totalDays": 42,
  "deliveryType": "natural",
  "agreedDisclaimer": true,
  "agreedPrivacy": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickName | string | 是 | 用户称呼，不可为空 |
| deliveryDate | string | 是 | 生产日期 `YYYY-MM-DD` |
| totalDays | number | 是 | 月子天数，枚举：`28` / `30` / `42` |
| deliveryType | string | 是 | 分娩方式：`natural`（顺产）/ `cesarean`（剖腹产） |
| agreedDisclaimer | boolean | 是 | 同意免责声明 |
| agreedPrivacy | boolean | 是 | 同意隐私政策 |

**响应 `data`**

```json
{
  "mom": {
    "id": "1718697600000_abc1234",
    "nickName": "沐沐妈",
    "deliveryDate": "2026-06-01",
    "createTime": 1718697600000
  },
  "settings": {
    "totalDays": 42,
    "deliveryType": "natural"
  },
  "onboarded": true
}
```

### 3.3 更新妈妈档案

对应 `pages/settings/index.js` → `onSave`（称呼、生产日期部分）。

```
PUT /profile/mom
```

**请求体**

```json
{
  "nickName": "沐沐妈",
  "deliveryDate": "2026-06-01"
}
```

**响应 `data`**：更新后的 Mom 对象（结构同 3.1）。

### 3.4 更新月子设置

对应 `pages/settings/index.js` → `onSave`（月子天数、分娩方式部分）。

```
PUT /profile/settings
```

**请求体**

```json
{
  "totalDays": 42,
  "deliveryType": "natural"
}
```

**响应 `data`**

```json
{
  "totalDays": 42,
  "deliveryType": "natural"
}
```

### 3.5 清除所有数据

对应 `pages/mine/index.js` → `onClearData`。

```
DELETE /profile/data
```

**响应 `data`**

```json
{
  "cleared": true
}
```

删除当前用户下所有档案、设置、记录，并重置引导状态。

---

## 4. 首页与月子日历

对应页面：`pages/index/index`、`utils/confinement.js`

### 4.1 获取首页概览

聚合月子进度、今日建议、今日时间线，减少前端多次请求。

```
GET /home/overview
```

**响应 `data`**

```json
{
  "nickName": "沐沐妈",
  "today": "2026-06-18",
  "deliveryLabel": "顺产",
  "confinement": {
    "day": 18,
    "total": 42,
    "progress": 43,
    "rawDay": 18,
    "isEnded": false,
    "stage": {
      "name": "调养期",
      "maxDay": 28
    }
  },
  "tips": [
    "均衡营养，避免油腻",
    "注意腰腹部保暖",
    "保持心情愉快"
  ],
  "timeline": [
    {
      "id": "1718697600000_xyz",
      "time": "09:30",
      "icon": "💗",
      "title": "恶露",
      "detail": "鲜红 · 中等"
    }
  ]
}
```

**计算规则**（与 `confinement.getConfinementDay` 一致）：

- `day` = 生产日期至今天数 + 1，上限为 `totalDays`
- `progress` = `round(day / total * 100)`，最大 100
- `stage` 按天数映射：1-7 排恶露期 / 8-14 恢复期 / 15-28 调养期 / 29+ 进补期
- `tips` 取自当前阶段 `STAGES[].tips`
- `timeline` 为今日妈妈记录，按 `time` 降序，展示字段由服务端格式化（对齐 `record.formatRecord`）

### 4.2 获取月子天数信息

```
GET /confinement/day
```

**响应 `data`**：`confinement` 对象（结构同 4.1）。

---

## 5. 妈妈健康记录

对应页面：`pages/record/index`、`pages/record-add/index`  
对应工具：`utils/storage.js`、`utils/record.js`

### 5.1 记录类型与 Payload 结构

| type | 说明 | payload 字段 |
|------|------|--------------|
| `lochia` | 恶露 | `color`, `amount`, `note?` |
| `pain` | 疼痛 | `score` (1-10), `note?` |
| `mood` | 情绪 | `level` (1-5) |
| `weight` | 体重 | `kg` (30-200), `note?` |
| `breast` | 乳房护理 | `engorgement`, `blocked`, `side?`, `feeding`, `note?` |

**枚举值**（与 `utils/record.js` 一致）

```
lochia.color:     red | pink | brown | yellow
lochia.amount:    light | medium | heavy
mood.level:       1 | 2 | 3 | 4 | 5
breast.engorgement: none | mild | moderate | severe
breast.blocked:   no | yes
breast.side:      left | right | both  （blocked=yes 时必填）
breast.feeding:   good | fair | hard
```

### 5.2 记录对象结构

```json
{
  "id": "1718697600000_xyz789",
  "type": "lochia",
  "date": "2026-06-18",
  "time": "09:30",
  "payload": {
    "color": "red",
    "amount": "medium",
    "note": ""
  },
  "deleted": false,
  "createTime": 1718697600000,
  "source": "mom"
}
```

列表接口可附加展示字段（前端 `loadData` 所用）：

```json
{
  "icon": "💗",
  "title": "恶露",
  "detail": "鲜红 · 中等"
}
```

### 5.3 获取记录列表

```
GET /records/mom
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 否 | 按日期筛选 `YYYY-MM-DD`，不传返回全部未删除记录 |
| type | string | 否 | 按类型筛选 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 50 |

**响应 `data`**

```json
{
  "list": [
    {
      "id": "1718697600000_xyz789",
      "type": "lochia",
      "date": "2026-06-18",
      "time": "09:30",
      "payload": { "color": "red", "amount": "medium", "note": "" },
      "deleted": false,
      "createTime": 1718697600000,
      "source": "mom",
      "icon": "💗",
      "title": "恶露",
      "detail": "鲜红 · 中等"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 50
}
```

排序：同日期按 `time` 降序（对齐 `getRecordsByDate`）。

### 5.4 获取今日记录

快捷接口，等价于 `GET /records/mom?date={today}`。

```
GET /records/mom/today
```

### 5.5 新增记录

对应 `pages/record-add/index.js` → `onSubmit`。

```
POST /records/mom
```

**请求体示例 — 恶露**

```json
{
  "type": "lochia",
  "date": "2026-06-18",
  "time": "09:30",
  "payload": {
    "color": "red",
    "amount": "medium",
    "note": ""
  }
}
```

**请求体示例 — 疼痛**

```json
{
  "type": "pain",
  "date": "2026-06-18",
  "time": "14:00",
  "payload": {
    "score": 3,
    "note": "伤口轻微疼痛"
  }
}
```

**请求体示例 — 情绪**

```json
{
  "type": "mood",
  "date": "2026-06-18",
  "time": "20:00",
  "payload": {
    "level": 3
  }
}
```

**请求体示例 — 体重**

```json
{
  "type": "weight",
  "date": "2026-06-18",
  "time": "08:00",
  "payload": {
    "kg": 58.5,
    "note": "晨起空腹"
  }
}
```

**请求体示例 — 乳房护理**

```json
{
  "type": "breast",
  "date": "2026-06-18",
  "time": "11:00",
  "payload": {
    "engorgement": "mild",
    "blocked": "no",
    "side": "",
    "feeding": "good",
    "note": ""
  }
}
```

**校验规则**

| type | 规则 |
|------|------|
| weight | `kg` 必填，范围 30～200 |
| breast | `blocked=yes` 时 `side` 必填 |
| 通用 | `type`、`date`、`time`、`payload` 必填 |

**响应 `data`**：完整记录对象（含 `id`、`createTime`）。

### 5.6 更新记录

```
PUT /records/mom/:id
```

**请求体**（部分更新）

```json
{
  "time": "10:00",
  "payload": {
    "color": "pink",
    "amount": "light"
  }
}
```

### 5.7 删除记录（软删）

对应 `pages/record/index.js` → `onDelete`。

```
DELETE /records/mom/:id
```

**响应 `data`**

```json
{
  "id": "1718697600000_xyz789",
  "deleted": true
}
```

---

## 6. 宝宝记录（预留）

`storage.js` 中已定义 `td_baby_records`，`utils/record.js` 与 `utils/stats.js` 已实现宝宝记录格式化与统计，PRD 规划为 P0。当前小程序页面未接入，API 先行定义。

### 6.1 记录类型与 Payload

| type | 说明 | payload 字段 |
|------|------|--------------|
| `feed` | 喂养 | `feedType`, `side?`, `duration?`, `amount?` |
| `sleep` | 睡眠 | `duration?`, `status?` (`start` / `end`) |
| `diaper` | 排泄 | `diaperType` |

**枚举值**

```
feed.feedType:  breast | formula | mixed
feed.side:      left | right | both
diaper.diaperType: pee | poop | both
```

### 6.2 接口列表

与妈妈记录对称：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/records/baby` | 列表（支持 `date`、`type` 筛选） |
| GET | `/records/baby/today` | 今日记录 |
| POST | `/records/baby` | 新增 |
| PUT | `/records/baby/:id` | 更新 |
| DELETE | `/records/baby/:id` | 软删除 |

**POST 请求体示例 — 喂养**

```json
{
  "type": "feed",
  "date": "2026-06-18",
  "time": "08:30",
  "payload": {
    "feedType": "breast",
    "side": "left",
    "duration": 15,
    "amount": null
  }
}
```

---

## 7. 数据统计

对应页面：`pages/record/index` 趋势 Tab  
对应工具：`utils/stats.js`

### 7.1 妈妈健康趋势

```
GET /stats/mom
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| from | string | 否 | 起始日期，默认生产日期 |
| to | string | 否 | 结束日期，默认今天 |

**响应 `data`**

```json
{
  "hasAnyData": true,
  "totalDays": 18,
  "chartDays": [
    {
      "date": "2026-06-01",
      "dayIndex": 1,
      "dayLabel": "月子第1天",
      "dateShort": "06-01",
      "lochiaCount": 1,
      "lochiaDetail": "鲜红 · 中等",
      "painAvg": 4.0,
      "painDetail": "4分（1次）",
      "moodEmoji": "🙂",
      "moodLabel": "还行",
      "weightValue": null,
      "weightDetail": "未记录",
      "breastDetail": "未记录",
      "breastSeverity": null,
      "hasData": true,
      "painBar": 40,
      "lochiaBar": 100,
      "weightBar": 0,
      "breastBar": 0,
      "metrics": [
        {
          "icon": "💗",
          "label": "恶露",
          "value": "鲜红 · 中等",
          "barPercent": 100,
          "color": "#7b5cf0"
        }
      ]
    }
  ],
  "detailDays": []
}
```

- `chartDays`：按日期正序，供横向图表滑动（对齐 `buildMomStats.chartDays`）
- `detailDays`：`chartDays` 倒序，供详情列表展示
- 聚合逻辑与 `aggregateMomDay` 一致

### 7.2 宝宝数据趋势（预留）

```
GET /stats/baby
```

响应结构与 `buildBabyStats` 对齐，包含 `feedCount`、`sleepMinutes`、`diaperCount` 等日维度指标。

### 7.3 我的页统计摘要

```
GET /stats/summary
```

**响应 `data`**

```json
{
  "recordCount": 42,
  "momRecordCount": 42,
  "babyRecordCount": 0,
  "confinementText": "月子第 18 / 42 天 · 调养期"
}
```

---

## 8. 内容服务

对应页面：`pages/learn/index`、`pages/learn-detail/index`、`pages/daily-guide/index`  
当前为前端静态数据（`utils/knowledge.js`、`utils/delivery-guide.js`），建议后端 CMS 化。

### 8.1 知识库分类

```
GET /content/knowledge/categories
```

**响应 `data`**

```json
{
  "list": [
    { "id": "all", "label": "全部" },
    { "id": "recovery", "label": "身体恢复" },
    { "id": "diet", "label": "月子饮食" },
    { "id": "mood", "label": "情绪心理" },
    { "id": "exercise", "label": "适度活动" },
    { "id": "caution", "label": "注意事项" }
  ]
}
```

### 8.2 知识文章列表

```
GET /content/knowledge/articles
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 分类 id，`all` 或不传返回全部 |

**响应 `data`**

```json
{
  "list": [
    {
      "id": "lochia-guide",
      "category": "recovery",
      "categoryLabel": "身体恢复",
      "icon": "💗",
      "title": "恶露变化怎么看？",
      "summary": "了解产后恶露的正常颜色与量，知道什么时候该警惕。",
      "readMinutes": 4,
      "dayRange": [1, 14]
    }
  ]
}
```

### 8.3 知识文章详情

```
GET /content/knowledge/articles/:id
```

**响应 `data`**

```json
{
  "id": "lochia-guide",
  "category": "recovery",
  "categoryLabel": "身体恢复",
  "icon": "💗",
  "title": "恶露变化怎么看？",
  "summary": "了解产后恶露的正常颜色与量，知道什么时候该警惕。",
  "readMinutes": 4,
  "dayRange": [1, 14],
  "paragraphs": [
    "产后恶露是子宫蜕膜、血液等排出体外的正常现象，通常会持续 4～6 周。",
    "第 1～3 天：颜色偏鲜红，量较多，类似月经量或略多，属于常见情况。"
  ]
}
```

### 8.4 推荐阅读

根据当前月子天数推荐文章（对齐 `knowledge.getRecommendedArticles`）。

```
GET /content/knowledge/recommended
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 条数，默认 3 |

**响应 `data`**

```json
{
  "confinementDay": 18,
  "stageName": "调养期",
  "list": []
}
```

推荐规则：文章 `dayRange` 包含当前月子天数则入选。

### 8.5 分娩方式每日指南

```
GET /content/delivery-guide
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| deliveryType | string | 否 | `natural` / `cesarean`，默认取用户设置 |
| day | number | 否 | 月子第几天，默认按用户档案计算 |

**响应 `data`**

```json
{
  "confinementDay": 18,
  "deliveryLabel": "顺产",
  "currentIndex": 3,
  "stages": [
  ],
  "guide": {
    "from": 15,
    "to": 21,
    "focus": "体力回升 · 营养均衡 · 盆底康复",
    "care": ["多数妈妈体力明显好转，可逐步恢复日常轻度家务。"],
    "avoid": ["腹部剧烈运动"],
    "watch": ["漏尿加重"]
  }
}
```

---

## 9. 健康检查

已实现（`server/src/routes/health.js`）。

```
GET /health
```

**响应**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "service": "tinydays-server",
    "timestamp": 1718697600000
  }
}
```

---

## 10. 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 40001 | 参数校验失败 |
| 40101 | 未登录 |
| 40102 | token 过期 |
| 40301 | 无权限访问该资源 |
| 40401 | 资源不存在 |
| 50001 | 服务器内部错误 |

---

## 11. 前端页面对接映射

| 页面 | 主要 API |
|------|----------|
| `pages/onboarding/index` | `POST /auth/login` → `POST /profile/onboarding` |
| `pages/index/index` | `GET /home/overview` |
| `pages/record/index`（记录 Tab） | `GET /records/mom/today`、`DELETE /records/mom/:id` |
| `pages/record/index`（趋势 Tab） | `GET /stats/mom` |
| `pages/record-add/index` | `POST /records/mom` |
| `pages/settings/index` | `PUT /profile/mom`、`PUT /profile/settings` |
| `pages/mine/index` | `GET /stats/summary`、`DELETE /profile/data` |
| `pages/learn/index` | `GET /content/knowledge/recommended`、`GET /content/knowledge/articles` |
| `pages/learn-detail/index` | `GET /content/knowledge/articles/:id` |
| `pages/daily-guide/index` | `GET /content/delivery-guide` |

---

## 12. 实现优先级建议

| 阶段 | 接口 | 说明 |
|------|------|------|
| P0 | 认证、档案、妈妈记录 CRUD、首页概览 | 替换核心本地存储，实现多端同步基础 |
| P1 | 妈妈统计、内容服务 | 对齐记录页趋势 Tab、知识 Tab |
| P2 | 宝宝记录、宝宝统计 | 对齐 PRD，复用已有工具函数逻辑 |
| P3 | 家庭共享、提醒推送 | PRD 规划，需额外数据模型 |

---

## 附录 A：Mom 档案模型

```typescript
interface Mom {
  id: string;
  nickName: string;
  deliveryDate: string;   // YYYY-MM-DD
  createTime: number;
}

interface Settings {
  totalDays: 28 | 30 | 42;
  deliveryType: 'natural' | 'cesarean';
}

interface User {
  id: string;
  openid: string;
  loginTime: number;
  agreedDisclaimer: boolean;
  agreedPrivacy: boolean;
  agreedTime: number | null;
}
```

## 附录 B：Record 模型

```typescript
interface MomRecord {
  id: string;
  type: 'lochia' | 'pain' | 'mood' | 'weight' | 'breast';
  date: string;
  time: string;
  payload: LochiaPayload | PainPayload | MoodPayload | WeightPayload | BreastPayload;
  deleted: boolean;
  createTime: number;
}

interface LochiaPayload {
  color: 'red' | 'pink' | 'brown' | 'yellow';
  amount: 'light' | 'medium' | 'heavy';
  note?: string;
}

interface PainPayload {
  score: number;   // 1-10
  note?: string;
}

interface MoodPayload {
  level: 1 | 2 | 3 | 4 | 5;
}

interface WeightPayload {
  kg: number;      // 30-200
  note?: string;
}

interface BreastPayload {
  engorgement: 'none' | 'mild' | 'moderate' | 'severe';
  blocked: 'no' | 'yes';
  side?: 'left' | 'right' | 'both';
  feeding: 'good' | 'fair' | 'hard';
  note?: string;
}
```
