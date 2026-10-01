-- =========================================
-- FreshField Full Database Schema
-- Auto-synchronized
-- =========================================

CREATE DATABASE IF NOT EXISTS farmer_marketplace;
USE farmer_marketplace;

SET FOREIGN_KEY_CHECKS=0;

-- Table structure for activity_logs
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for admin_action_logs
CREATE TABLE `admin_action_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `target_user_id` int(11) NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `action_type` enum('warn','suspend','ban','unsuspend','unban','dismiss_report') NOT NULL,
  `days` int(11) DEFAULT NULL,
  `reason` text NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `report_id` (`report_id`),
  KEY `idx_target_user` (`target_user_id`),
  KEY `idx_action_type` (`action_type`),
  CONSTRAINT `admin_action_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_action_logs_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_action_logs_ibfk_3` FOREIGN KEY (`report_id`) REFERENCES `farmer_reports` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for approved_product_catalog
CREATE TABLE `approved_product_catalog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `unit` varchar(20) DEFAULT 'kg',
  `description` text DEFAULT NULL,
  `request_id` int(11) DEFAULT NULL COMMENT 'Source product_request if approved from request',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_catalog_name` (`name`),
  KEY `request_id` (`request_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `approved_product_catalog_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `product_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `approved_product_catalog_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for banners
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for conversations
CREATE TABLE `conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL COMMENT 'Product being discussed/bargained',
  `subject` varchar(255) DEFAULT 'Product Inquiry',
  `negotiation_status` enum('none','offer_made','countered','accepted','rejected','cancelled','expired') DEFAULT 'none',
  `agreed_price` decimal(10,2) DEFAULT NULL,
  `agreed_at` datetime DEFAULT NULL,
  `current_offer_price` decimal(10,2) DEFAULT NULL,
  `current_offer_by` enum('customer','farmer') DEFAULT NULL,
  `offer_updated_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conv` (`customer_id`,`farmer_id`,`product_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for delivery_assignments
CREATE TABLE `delivery_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `delivery_person_name` varchar(100) NOT NULL,
  `delivery_person_phone` varchar(20) NOT NULL,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `tracking_token` varchar(64) NOT NULL,
  `tracking_active` tinyint(1) DEFAULT 0,
  `status` enum('assigned','picked_up','out_for_delivery','on_the_way','delivered') DEFAULT 'assigned',
  `notes` text DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_started_at` timestamp NULL DEFAULT NULL,
  `delivery_completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  UNIQUE KEY `tracking_token` (`tracking_token`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_tracking_token` (`tracking_token`),
  KEY `idx_farmer_id` (`farmer_id`),
  CONSTRAINT `delivery_assignments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_assignments_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for delivery_locations
CREATE TABLE `delivery_locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `delivery_assignment_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` float DEFAULT NULL,
  `speed` float DEFAULT NULL,
  `heading` float DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_assignment_id` (`delivery_assignment_id`),
  KEY `idx_recorded_at` (`recorded_at`),
  CONSTRAINT `delivery_locations_ibfk_1` FOREIGN KEY (`delivery_assignment_id`) REFERENCES `delivery_assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for farmer_reports
CREATE TABLE `farmer_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reporter_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `reason` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `evidence_image` varchar(255) DEFAULT NULL,
  `status` enum('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
  `admin_action` enum('none','warned','suspended','banned','dismissed') DEFAULT 'none',
  `admin_notes` text DEFAULT NULL,
  `action_taken_at` datetime DEFAULT NULL,
  `action_taken_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `action_taken_by` (`action_taken_by`),
  KEY `idx_reporter` (`reporter_id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `farmer_reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `farmer_reports_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `farmer_reports_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `farmer_reports_ibfk_4` FOREIGN KEY (`action_taken_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for messages
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_role` enum('customer','farmer') NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','offer','counter','accept','reject','system') DEFAULT 'text',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_messages_conv_read_sender` (`conversation_id`,`is_read`,`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for negotiation_offers
CREATE TABLE `negotiation_offers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `offered_by` enum('customer','farmer') NOT NULL,
  `offer_price` decimal(10,2) NOT NULL,
  `status` enum('pending','countered','accepted','rejected','cancelled','expired') DEFAULT 'pending',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `responded_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_conv` (`conversation_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `negotiation_offers_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `negotiation_offers_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `negotiation_offers_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `negotiation_offers_ibfk_4` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for notifications
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for order_items
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `is_negotiated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_order_items_farmer_order` (`farmer_id`,`order_id`),
  KEY `idx_order_items_farmer_product` (`farmer_id`,`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for order_status_history
CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_by_role` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for orders
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready','out_for_delivery','on_the_way','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `destination_latitude` decimal(10,8) DEFAULT NULL,
  `destination_longitude` decimal(11,8) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','completed','failed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_orders_customer_created` (`customer_id`,`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for product_price_rules
CREATE TABLE `product_price_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) NOT NULL COMMENT 'Lowercase normalized product name',
  `display_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `unit` varchar(20) DEFAULT 'kg',
  `min_price` decimal(10,2) NOT NULL,
  `max_price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_name` (`product_name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for product_requests
CREATE TABLE `product_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `farmer_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `suggested_min_price` decimal(10,2) DEFAULT NULL,
  `suggested_max_price` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'kg',
  `reason` text DEFAULT NULL COMMENT 'Why farmer wants to add this product',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `product_requests_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_requests_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for products
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `farmer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT 'kg',
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_category` (`category`),
  KEY `idx_availability` (`is_available`),
  KEY `idx_products_avail_qty_created` (`is_available`,`quantity`,`created_at`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for reviews
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`product_id`,`customer_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_customer` (`customer_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('farmer','customer','admin') NOT NULL,
  `status` enum('active','suspended','banned') DEFAULT 'active',
  `suspended_until` datetime DEFAULT NULL,
  `suspension_reason` text DEFAULT NULL,
  `ban_reason` text DEFAULT NULL,
  `warning_count` int(11) DEFAULT 0,
  `last_warning` text DEFAULT NULL,
  `last_warning_at` datetime DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `farm_name` varchar(100) DEFAULT NULL,
  `farm_location` varchar(255) DEFAULT NULL,
  `farmer_id` varchar(50) DEFAULT NULL,
  `kisan_card_number` varchar(50) DEFAULT NULL,
  `kisan_card_image` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_users_role_status` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for wishlist
CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`customer_id`,`product_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS=1;
