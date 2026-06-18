-- 沐沐记 MySQL 数据库建表脚本
-- MySQL 8.0+
-- 执行: mysql -u root -p < server/sql/schema.sql

CREATE DATABASE IF NOT EXISTS tinydays
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE tinydays;

-- ------------------------------------------------------------
-- 1. 用户
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(64)   NOT NULL COMMENT '用户ID',
  openid            VARCHAR(64)   NOT NULL COMMENT '微信 openid',
  login_time        BIGINT        NOT NULL COMMENT '最近登录时间戳(ms)',
  agreed_disclaimer TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '同意免责声明',
  agreed_privacy    TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '同意隐私政策',
  agreed_time       BIGINT        NULL     COMMENT '同意协议时间戳(ms)',
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ------------------------------------------------------------
-- 2. 妈妈档案（与 users 1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mom_profiles (
  id             VARCHAR(64)  NOT NULL COMMENT '档案ID',
  user_id        VARCHAR(64)  NOT NULL COMMENT '用户ID',
  nick_name      VARCHAR(50)  NOT NULL COMMENT '称呼',
  delivery_date  DATE         NULL     COMMENT '生产日期',
  create_time    BIGINT       NOT NULL COMMENT '档案创建时间戳(ms)',
  created_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_id (user_id),
  KEY idx_delivery_date (delivery_date),
  CONSTRAINT fk_mom_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='妈妈档案表';

-- ------------------------------------------------------------
-- 3. 月子设置（与 users 1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
  user_id        VARCHAR(64)  NOT NULL COMMENT '用户ID',
  total_days     TINYINT      NOT NULL DEFAULT 42 COMMENT '月子天数 28/30/42',
  delivery_type  VARCHAR(20)  NOT NULL DEFAULT 'natural' COMMENT 'natural/cesarean',
  created_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_total_days CHECK (total_days IN (28, 30, 42)),
  CONSTRAINT chk_delivery_type CHECK (delivery_type IN ('natural', 'cesarean'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户月子设置表';

-- ------------------------------------------------------------
-- 4. 妈妈健康记录
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mom_records (
  id           VARCHAR(64)  NOT NULL COMMENT '记录ID',
  user_id      VARCHAR(64)  NOT NULL COMMENT '用户ID',
  type         VARCHAR(20)  NOT NULL COMMENT 'lochia/pain/mood/weight/breast',
  record_date  DATE         NOT NULL COMMENT '记录日期',
  record_time  VARCHAR(5)   NOT NULL COMMENT '记录时刻 HH:mm',
  payload      JSON         NOT NULL COMMENT '类型相关数据',
  deleted      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '软删除',
  create_time  BIGINT       NOT NULL COMMENT '创建时间戳(ms)',
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_user_date (user_id, record_date, deleted),
  KEY idx_user_type (user_id, type, deleted),
  KEY idx_user_create (user_id, create_time),
  CONSTRAINT fk_mom_records_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_mom_record_type CHECK (type IN ('lochia', 'pain', 'mood', 'weight', 'breast'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='妈妈健康记录表';

-- ------------------------------------------------------------
-- 5. 宝宝记录（P2 预留）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS baby_records (
  id           VARCHAR(64)  NOT NULL COMMENT '记录ID',
  user_id      VARCHAR(64)  NOT NULL COMMENT '用户ID',
  type         VARCHAR(20)  NOT NULL COMMENT 'feed/sleep/diaper',
  record_date  DATE         NOT NULL COMMENT '记录日期',
  record_time  VARCHAR(5)   NOT NULL COMMENT '记录时刻 HH:mm',
  payload      JSON         NOT NULL COMMENT '类型相关数据',
  deleted      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '软删除',
  create_time  BIGINT       NOT NULL COMMENT '创建时间戳(ms)',
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_user_date (user_id, record_date, deleted),
  KEY idx_user_type (user_id, type, deleted),
  CONSTRAINT fk_baby_records_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_baby_record_type CHECK (type IN ('feed', 'sleep', 'diaper'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='宝宝记录表';

-- ------------------------------------------------------------
-- 6. 知识库分类
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id          VARCHAR(32)  NOT NULL COMMENT '分类ID',
  label       VARCHAR(50)  NOT NULL COMMENT '显示名称',
  sort_order  INT          NOT NULL DEFAULT 0 COMMENT '排序',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库分类表';

-- ------------------------------------------------------------
-- 7. 知识库文章
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id              VARCHAR(64)   NOT NULL COMMENT '文章ID',
  category_id     VARCHAR(32)   NOT NULL COMMENT '分类ID',
  icon            VARCHAR(10)   NOT NULL COMMENT '图标 emoji',
  title           VARCHAR(100)  NOT NULL COMMENT '标题',
  summary         VARCHAR(500)  NOT NULL COMMENT '摘要',
  read_minutes    TINYINT       NOT NULL DEFAULT 3 COMMENT '阅读分钟数',
  day_range_min   TINYINT       NOT NULL COMMENT '推荐月子天数下限',
  day_range_max   TINYINT       NOT NULL COMMENT '推荐月子天数上限',
  paragraphs      JSON          NOT NULL COMMENT '正文段落数组',
  status          TINYINT       NOT NULL DEFAULT 1 COMMENT '1发布 0下架',
  sort_order      INT           NOT NULL DEFAULT 0 COMMENT '排序',
  created_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_category (category_id, status),
  KEY idx_day_range (day_range_min, day_range_max),
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES knowledge_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库文章表';

-- ------------------------------------------------------------
-- 8. 分娩方式
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_guide_types (
  id     VARCHAR(20)  NOT NULL COMMENT 'natural/cesarean',
  label  VARCHAR(20)  NOT NULL COMMENT '显示名称',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分娩方式表';

-- ------------------------------------------------------------
-- 9. 分娩阶段指南
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_guide_stages (
  id                BIGINT       NOT NULL AUTO_INCREMENT,
  delivery_type_id  VARCHAR(20)  NOT NULL COMMENT '分娩方式',
  stage_index       TINYINT      NOT NULL COMMENT '阶段序号(0起)',
  day_from          TINYINT      NOT NULL COMMENT '天数起',
  day_to            TINYINT      NOT NULL COMMENT '天数止',
  focus             VARCHAR(200) NOT NULL COMMENT '阶段重点',
  care              JSON         NOT NULL COMMENT '护理要点',
  avoid             JSON         NOT NULL COMMENT '避免事项',
  watch             JSON         NOT NULL COMMENT '警惕信号',
  created_at        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_type_stage (delivery_type_id, stage_index),
  KEY idx_day_range (delivery_type_id, day_from, day_to),
  CONSTRAINT fk_stages_type FOREIGN KEY (delivery_type_id) REFERENCES delivery_guide_types (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分娩阶段指南表';

-- ------------------------------------------------------------
-- 初始种子数据：分娩方式
-- ------------------------------------------------------------
INSERT INTO delivery_guide_types (id, label) VALUES
  ('natural', '顺产'),
  ('cesarean', '剖腹产')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- ------------------------------------------------------------
-- 初始种子数据：知识分类
-- ------------------------------------------------------------
INSERT INTO knowledge_categories (id, label, sort_order) VALUES
  ('recovery',  '身体恢复', 1),
  ('diet',      '月子饮食', 2),
  ('mood',      '情绪心理', 3),
  ('exercise',  '适度活动', 4),
  ('caution',   '注意事项', 5)
ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order);
