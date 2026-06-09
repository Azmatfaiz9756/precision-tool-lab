-- ─────────────────────────────────────────────────────────────────────────────
-- Precision Tool Lab — MySQL Database Schema
-- Compatible with MySQL 5.7+ / MariaDB 10.3+
-- ─────────────────────────────────────────────────────────────────────────────

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `precision_tool_lab`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `precision_tool_lab`;

-- ─── Users ────────────────────────────────────────────────────────────────────
-- Firebase handles authentication; this table stores profile & role data.
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `firebase_uid`  VARCHAR(128) NOT NULL UNIQUE COMMENT 'Firebase Auth UID',
  `email`         VARCHAR(255) NOT NULL,
  `name`          VARCHAR(255),
  `photo_url`     TEXT,
  `role`          ENUM('user','admin') NOT NULL DEFAULT 'user',
  `phone`         VARCHAR(30),
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_role  (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(500) NOT NULL,
  `brand`         VARCHAR(255),
  `category`      VARCHAR(255),
  `sub_category`  VARCHAR(255),
  `description`   TEXT,
  `price`         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price`DECIMAL(10,2),
  `currency`      VARCHAR(10) NOT NULL DEFAULT 'AED',
  `stock`         INT NOT NULL DEFAULT 0,
  `sku`           VARCHAR(100),
  `image_url`     TEXT,
  `images`        JSON COMMENT 'Array of image URLs',
  `specifications`JSON COMMENT 'Key-value specifications',
  `tags`          JSON COMMENT 'Array of tag strings',
  `is_featured`   TINYINT(1) NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1) NOT NULL DEFAULT 1,
  `rating`        DECIMAL(3,2) DEFAULT NULL,
  `review_count`  INT NOT NULL DEFAULT 0,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category  (`category`),
  INDEX idx_brand     (`brand`),
  INDEX idx_is_active (`is_active`),
  INDEX idx_is_featured(`is_featured`),
  FULLTEXT idx_search (`name`, `description`, `brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number`     VARCHAR(50) NOT NULL UNIQUE,
  `user_firebase_uid`VARCHAR(128) NOT NULL,
  `status`           ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded')
                     NOT NULL DEFAULT 'pending',
  `subtotal`         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount`         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_fee`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total`            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency`         VARCHAR(10) NOT NULL DEFAULT 'AED',
  `coupon_code`      VARCHAR(100),
  `payment_method`   VARCHAR(100),
  `payment_status`   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `shipping_address` JSON,
  `items`            JSON COMMENT 'Snapshot of ordered items',
  `tracking_number`  VARCHAR(100),
  `notes`            TEXT,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user      (`user_firebase_uid`),
  INDEX idx_status    (`status`),
  INDEX idx_order_num (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Cart Items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_firebase_uid`VARCHAR(128) NOT NULL,
  `product_id`       INT UNSIGNED NOT NULL,
  `quantity`         INT NOT NULL DEFAULT 1,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (`user_firebase_uid`, `product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Wishlist ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `wishlist_items` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_firebase_uid`VARCHAR(128) NOT NULL,
  `product_id`       INT UNSIGNED NOT NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (`user_firebase_uid`, `product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id`       INT UNSIGNED NOT NULL,
  `user_firebase_uid`VARCHAR(128) NOT NULL,
  `user_name`        VARCHAR(255),
  `rating`           TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `title`            VARCHAR(500),
  `body`             TEXT,
  `is_verified`      TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Verified purchase',
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (`user_firebase_uid`, `product_id`),
  INDEX idx_product (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Addresses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `addresses` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_firebase_uid`VARCHAR(128) NOT NULL,
  `label`            VARCHAR(100) DEFAULT 'Home',
  `full_name`        VARCHAR(255) NOT NULL,
  `phone`            VARCHAR(30),
  `address_line1`    VARCHAR(500) NOT NULL,
  `address_line2`    VARCHAR(500),
  `city`             VARCHAR(255) NOT NULL,
  `emirate`          VARCHAR(255),
  `country`          VARCHAR(100) NOT NULL DEFAULT 'UAE',
  `postal_code`      VARCHAR(20),
  `is_default`       TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (`user_firebase_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Coupons ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `coupons` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code`            VARCHAR(100) NOT NULL UNIQUE,
  `type`            ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value`           DECIMAL(10,2) NOT NULL,
  `min_order`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `max_uses`        INT DEFAULT NULL COMMENT 'NULL = unlimited',
  `used_count`      INT NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `expires_at`      DATETIME DEFAULT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code    (`code`),
  INDEX idx_active  (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Newsletter Subscribers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `newsletter` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email`      VARCHAR(255) NOT NULL UNIQUE,
  `name`       VARCHAR(255),
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Contact Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `subject`    VARCHAR(500),
  `message`    TEXT NOT NULL,
  `status`     ENUM('unread','read','replied') NOT NULL DEFAULT 'unread',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Store Settings ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key`   VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` MEDIUMTEXT,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Default Settings Seed ────────────────────────────────────────────────────
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
  ('store_name',         '"Precision Tool Lab"'),
  ('store_tagline',      '"Your #1 Industrial Tools Supplier in UAE"'),
  ('whatsapp_number',    '"+971501234567"'),
  ('store_phone',        '"+971501234567"'),
  ('store_email',        '"info@precisiontoollab.ae"'),
  ('store_address',      '"Industrial Area 12, Sharjah, UAE"'),
  ('store_hours',        '"Mon–Sat: 8:00 AM – 6:00 PM | Fri: Closed"'),
  ('google_maps_url',    '"https://www.google.com/maps"'),
  ('facebook_url',       '""'),
  ('instagram_url',      '""'),
  ('linkedin_url',       '""'),
  ('youtube_url',        '""'),
  ('announcement_text',  '"Free shipping on orders over AED 200"'),
  ('currency',           '"AED"'),
  ('free_shipping_min',  '200'),
  ('shipping_fee',       '25'),
  ('return_days',        '30')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

SET FOREIGN_KEY_CHECKS = 1;
