-- 创建应用专用数据库用户（需用 root 执行）
-- 用法: mysql -u root -p < server/sql/grant-user.sql
-- 执行前请把下方密码改成你想要的密码，并同步到 server/.env 的 DB_PASSWORD

CREATE DATABASE IF NOT EXISTS tinydays
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'tinydays'@'localhost' IDENTIFIED BY 'tinydays123';
GRANT ALL PRIVILEGES ON tinydays.* TO 'tinydays'@'localhost';
FLUSH PRIVILEGES;
