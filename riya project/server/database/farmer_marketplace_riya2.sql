-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 01, 2026 at 03:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `farmer_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'create_order', 'order', 1, '{\"orderNumber\":\"ORD-1788689618474-692\",\"totalAmount\":98}', NULL, '2026-09-06 10:13:38'),
(2, 2, 'update_order_status', 'order', 1, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-06 10:13:38'),
(3, 2, 'update_order_status', 'order', 1, '{\"status\":\"preparing\",\"note\":\"Produce freshly harvested and packaged\"}', NULL, '2026-09-06 10:13:38'),
(4, 2, 'update_order_status', 'order', 1, '{\"status\":\"ready\",\"note\":\"Packed and waiting for delivery dispatch\"}', NULL, '2026-09-06 10:13:38'),
(5, 2, 'update_order_status', 'order', 1, '{\"status\":\"out_for_delivery\",\"note\":\"Package handed over to local delivery agent\"}', NULL, '2026-09-06 10:13:38'),
(6, 2, 'update_order_status', 'order', 1, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent on the way to destination\"}', NULL, '2026-09-06 10:13:38'),
(7, 2, 'update_order_status', 'order', 1, '{\"status\":\"delivered\",\"note\":\"Delivered fresh directly to customer doorstep\"}', NULL, '2026-09-06 10:13:38'),
(8, 1, 'create_order', 'order', 2, '{\"orderNumber\":\"ORD-1788693357239-299\",\"totalAmount\":98}', NULL, '2026-09-06 11:15:57'),
(9, 2, 'update_order_status', 'order', 2, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farm\"}', NULL, '2026-09-06 11:15:57'),
(10, 2, 'update_order_status', 'order', 2, '{\"status\":\"preparing\",\"note\":\"Produce harvested fresh\"}', NULL, '2026-09-06 11:15:57'),
(11, 2, 'update_order_status', 'order', 2, '{\"status\":\"ready\",\"note\":\"Packed and ready for dispatch\"}', NULL, '2026-09-06 11:15:57'),
(12, 1, 'create_order', 'order', 3, '{\"orderNumber\":\"ORD-1788693763635-478\",\"totalAmount\":49}', NULL, '2026-09-06 11:22:43'),
(13, 2, 'update_order_status', 'order', 3, '{\"status\":\"confirmed\"}', NULL, '2026-09-06 11:22:43'),
(14, 2, 'update_order_status', 'order', 3, '{\"status\":\"preparing\"}', NULL, '2026-09-06 11:22:43'),
(15, 2, 'update_order_status', 'order', 3, '{\"status\":\"ready\"}', NULL, '2026-09-06 11:22:43'),
(16, 5, 'create_order', 'order', 4, '{\"orderNumber\":\"ORD-1788694518499-386\",\"totalAmount\":138}', NULL, '2026-09-06 11:35:18'),
(17, 5, 'create_order', 'order', 5, '{\"orderNumber\":\"ORD-1788697118436-552\",\"totalAmount\":98}', NULL, '2026-09-06 12:18:38'),
(18, 5, 'create_order', 'order', 6, '{\"orderNumber\":\"ORD-1790064983462-674\",\"totalAmount\":98}', NULL, '2026-09-22 08:16:23'),
(19, 6, 'create_order', 'order', 8, '{\"orderNumber\":\"ORD-1790065393878-936\",\"totalAmount\":120}', NULL, '2026-09-22 08:23:13'),
(20, 6, 'create_order', 'order', 9, '{\"orderNumber\":\"ORD-1790066025299-663\",\"totalAmount\":120}', NULL, '2026-09-22 08:33:45'),
(21, 8, 'create_order', 'order', 10, '{\"orderNumber\":\"ORD-1790066743043-6735\",\"totalAmount\":85}', NULL, '2026-09-22 08:45:43'),
(22, 8, 'create_order', 'order', 11, '{\"orderNumber\":\"ORD-1790066828048-6411\",\"totalAmount\":85}', NULL, '2026-09-22 08:47:08'),
(23, 9, 'update_order_status', 'order', 11, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-22 08:47:23'),
(24, 8, 'create_order', 'order', 12, '{\"orderNumber\":\"ORD-1790067067957-8378\",\"totalAmount\":205}', NULL, '2026-09-22 08:51:07'),
(25, 9, 'update_order_status', 'order', 12, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-22 08:52:31'),
(26, 9, 'update_order_status', 'order', 12, '{\"status\":\"preparing\",\"note\":\"Farm items are being harvested and packed\"}', NULL, '2026-09-22 08:53:15'),
(27, 9, 'update_order_status', 'order', 12, '{\"status\":\"ready\",\"note\":\"Order packed and ready for dispatch\"}', NULL, '2026-09-22 08:53:35'),
(28, 9, 'update_order_status', 'order', 12, '{\"status\":\"out_for_delivery\",\"note\":\"Order handed over for local delivery\"}', NULL, '2026-09-22 09:04:29'),
(29, 9, 'update_order_status', 'order', 12, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent is on the way to destination\"}', NULL, '2026-09-22 09:04:44'),
(30, 9, 'update_order_status', 'order', 12, '{\"status\":\"delivered\",\"note\":\"Order delivered fresh to customer\"}', NULL, '2026-09-22 09:05:03'),
(31, 9, 'update_order_status', 'order', 11, '{\"status\":\"cancelled\",\"note\":\"Order cancelled by farmer\"}', NULL, '2026-09-22 15:06:04'),
(32, 9, 'update_order_status', 'order', 10, '{\"status\":\"cancelled\",\"note\":\"Order cancelled by farmer\"}', NULL, '2026-09-22 15:06:08'),
(33, 8, 'create_order', 'order', 13, '{\"orderNumber\":\"ORD-1790092203434-4685\",\"totalAmount\":100}', NULL, '2026-09-22 15:50:03'),
(34, 9, 'update_order_status', 'order', 13, '{\"status\":\"confirmed\",\"note\":\"Advancing to confirmed\"}', NULL, '2026-09-22 15:50:03'),
(35, 9, 'update_order_status', 'order', 13, '{\"status\":\"preparing\",\"note\":\"Advancing to preparing\"}', NULL, '2026-09-22 15:50:03'),
(36, 9, 'update_order_status', 'order', 13, '{\"status\":\"ready\",\"note\":\"Advancing to ready\"}', NULL, '2026-09-22 15:50:03'),
(37, 9, 'update_order_status', 'order', 13, '{\"status\":\"cancelled\",\"note\":\"Customer requested cancellation\"}', NULL, '2026-09-22 15:50:03'),
(38, 8, 'create_order', 'order', 14, '{\"orderNumber\":\"ORD-1790098011480-1405\",\"totalAmount\":100}', NULL, '2026-09-22 17:26:51'),
(39, 9, 'update_order_status', 'order', 14, '{\"status\":\"confirmed\",\"note\":\"Advancing to confirmed\"}', NULL, '2026-09-22 17:26:51'),
(40, 9, 'update_order_status', 'order', 14, '{\"status\":\"preparing\",\"note\":\"Advancing to preparing\"}', NULL, '2026-09-22 17:26:51'),
(41, 9, 'update_order_status', 'order', 14, '{\"status\":\"ready\",\"note\":\"Advancing to ready\"}', NULL, '2026-09-22 17:26:51'),
(42, 9, 'update_order_status', 'order', 14, '{\"status\":\"cancelled\",\"note\":\"Customer requested cancellation\"}', NULL, '2026-09-22 17:26:51'),
(43, 8, 'create_order', 'order', 15, '{\"orderNumber\":\"ORD-1790234603138-2351\",\"totalAmount\":750}', NULL, '2026-09-24 07:23:23'),
(44, 8, 'create_order', 'order', 16, '{\"orderNumber\":\"ORD-1790234802023-1421\",\"totalAmount\":650}', NULL, '2026-09-24 07:26:42'),
(45, 9, 'update_order_status', 'order', 16, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-24 07:26:42'),
(46, 9, 'update_order_status', 'order', 16, '{\"status\":\"preparing\",\"note\":\"Produce freshly harvested and packaged\"}', NULL, '2026-09-24 07:26:42'),
(47, 9, 'update_order_status', 'order', 16, '{\"status\":\"ready\",\"note\":\"Packed and waiting for delivery dispatch\"}', NULL, '2026-09-24 07:26:42'),
(48, 9, 'update_order_status', 'order', 16, '{\"status\":\"out_for_delivery\",\"note\":\"Package handed over to local delivery agent\"}', NULL, '2026-09-24 07:26:42'),
(49, 9, 'update_order_status', 'order', 16, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent on the way to destination\"}', NULL, '2026-09-24 07:26:42'),
(50, 9, 'update_order_status', 'order', 16, '{\"status\":\"delivered\",\"note\":\"Delivered fresh directly to customer doorstep\"}', NULL, '2026-09-24 07:26:42'),
(51, 8, 'create_order', 'order', 17, '{\"orderNumber\":\"ORD-1790234837565-1996\",\"totalAmount\":650}', NULL, '2026-09-24 07:27:17'),
(52, 9, 'update_order_status', 'order', 17, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-24 07:27:17'),
(53, 9, 'update_order_status', 'order', 17, '{\"status\":\"preparing\",\"note\":\"Produce freshly harvested and packaged\"}', NULL, '2026-09-24 07:27:17'),
(54, 9, 'update_order_status', 'order', 17, '{\"status\":\"ready\",\"note\":\"Packed and waiting for delivery dispatch\"}', NULL, '2026-09-24 07:27:17'),
(55, 9, 'update_order_status', 'order', 17, '{\"status\":\"out_for_delivery\",\"note\":\"Package handed over to local delivery agent\"}', NULL, '2026-09-24 07:27:17'),
(56, 9, 'update_order_status', 'order', 17, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent on the way to destination\"}', NULL, '2026-09-24 07:27:17'),
(57, 9, 'update_order_status', 'order', 17, '{\"status\":\"delivered\",\"note\":\"Delivered fresh directly to customer doorstep\"}', NULL, '2026-09-24 07:27:17'),
(58, 8, 'create_order', 'order', 18, '{\"orderNumber\":\"ORD-1790234902894-8249\",\"totalAmount\":765}', NULL, '2026-09-24 07:28:22'),
(59, 8, 'create_order', 'order', 19, '{\"orderNumber\":\"ORD-1790236425031-5683\",\"totalAmount\":765}', NULL, '2026-09-24 07:53:45'),
(60, 8, 'create_order', 'order', 20, '{\"orderNumber\":\"ORD-1790798345415-4602\",\"totalAmount\":660}', NULL, '2026-09-30 19:59:05'),
(61, 9, 'update_order_status', 'order', 20, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-30 19:59:05'),
(62, 9, 'update_order_status', 'order', 20, '{\"status\":\"preparing\",\"note\":\"Produce freshly harvested and packaged\"}', NULL, '2026-09-30 19:59:05'),
(63, 9, 'update_order_status', 'order', 20, '{\"status\":\"ready\",\"note\":\"Packed and waiting for delivery dispatch\"}', NULL, '2026-09-30 19:59:05'),
(64, 9, 'update_order_status', 'order', 20, '{\"status\":\"out_for_delivery\",\"note\":\"Package handed over to local delivery agent\"}', NULL, '2026-09-30 19:59:05'),
(65, 9, 'update_order_status', 'order', 20, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent on the way to destination\"}', NULL, '2026-09-30 19:59:05'),
(66, 9, 'update_order_status', 'order', 20, '{\"status\":\"delivered\",\"note\":\"Delivered fresh directly to customer doorstep\"}', NULL, '2026-09-30 19:59:05'),
(67, 8, 'create_order', 'order', 21, '{\"orderNumber\":\"ORD-1790799526081-1444\",\"totalAmount\":660}', NULL, '2026-09-30 20:18:46'),
(68, 9, 'update_order_status', 'order', 21, '{\"status\":\"confirmed\",\"note\":\"Order confirmed by farmer\"}', NULL, '2026-09-30 20:18:46'),
(69, 9, 'update_order_status', 'order', 21, '{\"status\":\"preparing\",\"note\":\"Produce freshly harvested and packaged\"}', NULL, '2026-09-30 20:18:46'),
(70, 9, 'update_order_status', 'order', 21, '{\"status\":\"ready\",\"note\":\"Packed and waiting for delivery dispatch\"}', NULL, '2026-09-30 20:18:46'),
(71, 9, 'update_order_status', 'order', 21, '{\"status\":\"out_for_delivery\",\"note\":\"Package handed over to local delivery agent\"}', NULL, '2026-09-30 20:18:46'),
(72, 9, 'update_order_status', 'order', 21, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent on the way to destination\"}', NULL, '2026-09-30 20:18:46'),
(73, 9, 'update_order_status', 'order', 21, '{\"status\":\"delivered\",\"note\":\"Delivered fresh directly to customer doorstep\"}', NULL, '2026-09-30 20:18:46'),
(74, 9, 'update_order_status', 'order', 21, '{\"status\":\"ready\",\"note\":\"Order packed and ready for dispatch\"}', NULL, '2026-09-30 20:53:45'),
(75, 9, 'update_order_status', 'order', 21, '{\"status\":\"out_for_delivery\",\"note\":\"Order handed over for local delivery\"}', NULL, '2026-09-30 20:53:49'),
(76, 9, 'update_order_status', 'order', 21, '{\"status\":\"on_the_way\",\"note\":\"Delivery agent is on the way to destination\"}', NULL, '2026-09-30 20:54:54');

-- --------------------------------------------------------

--
-- Table structure for table `admin_action_logs`
--

CREATE TABLE `admin_action_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `target_user_id` int(11) NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `action_type` enum('warn','suspend','ban','unsuspend','unban','dismiss_report') NOT NULL,
  `days` int(11) DEFAULT NULL,
  `reason` text NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_action_logs`
--

INSERT INTO `admin_action_logs` (`id`, `admin_id`, `target_user_id`, `report_id`, `action_type`, `days`, `reason`, `details`, `created_at`) VALUES
(1, 15, 14, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-24 06:51:35'),
(2, 15, 14, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-24 06:51:35'),
(3, 15, 9, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-24 06:52:18'),
(4, 15, 9, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-24 06:52:18'),
(5, 15, 9, 3, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-24 06:52:18'),
(6, 15, 9, 1, 'warn', NULL, 'bad behaviour', NULL, '2026-09-24 07:02:56'),
(7, 15, 9, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-24 07:10:53'),
(8, 15, 9, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-24 07:10:53'),
(9, 15, 9, 4, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-24 07:10:53'),
(10, 15, 9, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-24 07:28:31'),
(11, 15, 9, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-24 07:28:31'),
(12, 15, 9, 5, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-24 07:28:31'),
(13, 15, 9, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-24 07:54:03'),
(14, 15, 9, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-24 07:54:03'),
(15, 15, 9, 6, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-24 07:54:03'),
(16, 15, 18, NULL, 'suspend', 3, 'Security check', NULL, '2026-09-30 19:58:29'),
(17, 15, 18, NULL, 'ban', NULL, 'Severe policy violation', NULL, '2026-09-30 19:58:29'),
(18, 15, 20, NULL, 'suspend', 3, 'Security check', NULL, '2026-09-30 19:58:45'),
(19, 15, 20, NULL, 'ban', NULL, 'Severe policy violation', NULL, '2026-09-30 19:58:45'),
(20, 15, 9, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-30 19:58:51'),
(21, 15, 9, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-30 19:58:51'),
(22, 15, 9, 7, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-30 19:58:51'),
(23, 15, 23, NULL, 'suspend', 3, 'Security check', NULL, '2026-09-30 20:18:31'),
(24, 15, 23, NULL, 'ban', NULL, 'Severe policy violation', NULL, '2026-09-30 20:18:31'),
(25, 15, 9, NULL, 'suspend', 5, 'Quality standards violation - test suspension', NULL, '2026-09-30 20:18:38'),
(26, 15, 9, NULL, 'unsuspend', NULL, 'Manual reinstatement by administrator', NULL, '2026-09-30 20:18:38'),
(27, 15, 9, 8, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-30 20:18:38');

-- --------------------------------------------------------

--
-- Table structure for table `approved_product_catalog`
--

CREATE TABLE `approved_product_catalog` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `unit` varchar(20) DEFAULT 'kg',
  `description` text DEFAULT NULL,
  `request_id` int(11) DEFAULT NULL COMMENT 'Source product_request if approved from request',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approved_product_catalog`
--

INSERT INTO `approved_product_catalog` (`id`, `name`, `category`, `unit`, `description`, `request_id`, `approved_by`, `approved_at`, `is_active`, `created_at`) VALUES
(1, 'Potato', 'Vegetables', 'kg', 'Fresh potatoes', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(2, 'Tomato', 'Vegetables', 'kg', 'Fresh vine tomatoes', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(3, 'Onion', 'Vegetables', 'kg', 'Fresh onions', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(4, 'Cauliflower', 'Vegetables', 'piece', 'Fresh cauliflower head', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(5, 'Spinach', 'Leafy Greens', 'bunch', 'Fresh spinach leaves', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(6, 'Carrot', 'Vegetables', 'kg', 'Fresh carrots', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(7, 'Bhindi (Okra)', 'Vegetables', 'kg', 'Fresh okra/bhindi', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(8, 'Lauki (Bottle Gourd)', 'Vegetables', 'kg', 'Fresh bottle gourd', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(9, 'Karela (Bitter Gourd)', 'Vegetables', 'kg', 'Fresh bitter gourd', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(10, 'Methi (Fenugreek)', 'Leafy Greens', 'bunch', 'Fresh fenugreek leaves', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(11, 'Apple', 'Fruits', 'kg', 'Fresh apples', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(12, 'Mango', 'Fruits', 'dozen', 'Fresh mangoes', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(13, 'Banana', 'Fruits', 'dozen', 'Fresh bananas', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(14, 'Strawberry', 'Fruits', 'kg', 'Fresh strawberries', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(15, 'Coconut', 'Fruits', 'piece', 'Fresh coconut', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(16, 'Organic Basmati Rice', 'Grains', 'kg', 'Premium basmati rice', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(17, 'Wheat', 'Grains', 'kg', 'Whole wheat grain', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(18, 'Organic Moong Dal', 'Pulses', 'kg', 'Split moong lentils', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(19, 'Organic Groundnuts', 'Nuts & Seeds', 'kg', 'Raw groundnuts', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(20, 'Raw Sugarcane Jaggery', 'Natural Sweeteners', 'kg', 'Natural jaggery/gur', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(21, 'Desi Cow Ghee', 'Dairy', 'litre', 'Pure A2 desi ghee', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(22, 'Cold-Pressed Groundnut Oil', 'Oils', 'litre', 'Kachi ghani groundnut oil', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(23, 'Farm Fresh Turmeric', 'Spices', 'kg', 'Fresh turmeric rhizomes', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(24, 'Fresh Green Coriander', 'Herbs', 'bunch', 'Fresh coriander/dhania', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(25, 'Fresh Drumstick', 'Vegetables', 'kg', 'Moringa/drumstick pods', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(26, 'Bell Pepper', 'Vegetables', 'kg', 'Fresh bell peppers', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(27, 'Brinjal (Eggplant)', 'Vegetables', 'kg', 'Fresh brinjal/eggplant', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(28, 'Cabbage', 'Vegetables', 'piece', 'Fresh cabbage head', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(29, 'Peas', 'Vegetables', 'kg', 'Fresh green peas', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(30, 'Garlic', 'Spices', 'kg', 'Fresh garlic bulbs', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(31, 'Ginger', 'Spices', 'kg', 'Fresh ginger root', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(32, 'Lemon', 'Fruits', 'dozen', 'Fresh lemons', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(33, 'Papaya', 'Fruits', 'kg', 'Fresh papaya', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(34, 'Guava', 'Fruits', 'kg', 'Fresh guava', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(35, 'Pomegranate', 'Fruits', 'kg', 'Fresh pomegranate', NULL, NULL, '2026-10-01 00:47:44', 1, '2026-09-30 19:17:44'),
(36, 'Dragon Fruit', 'Fruits', 'kg', NULL, 3, 15, '2026-10-01 01:27:40', 1, '2026-09-30 19:57:40'),
(40, 'mashroom', 'Vegetables', 'kg', NULL, 12, 15, '2026-10-01 04:25:19', 1, '2026-09-30 22:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL COMMENT 'Product being discussed/bargained',
  `subject` varchar(255) DEFAULT 'Product Inquiry',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `customer_id`, `farmer_id`, `product_id`, `subject`, `created_at`, `updated_at`) VALUES
(1, 8, 9, 37, 'Inquiry about Cold-Pressed Groundnut Oil', '2026-09-30 19:55:02', '2026-09-30 19:55:02'),
(2, 8, 9, 38, 'Inquiry about Potato', '2026-09-30 19:57:40', '2026-09-30 19:57:40'),
(3, 8, 9, 39, 'Inquiry about Potato', '2026-09-30 19:58:29', '2026-09-30 19:58:29'),
(4, 8, 9, 40, 'Inquiry about Potato', '2026-09-30 19:58:44', '2026-09-30 19:58:45'),
(5, 8, 9, 41, 'Inquiry about Potato', '2026-09-30 20:18:30', '2026-09-30 20:18:30'),
(6, 8, 9, 42, 'Inquiry about Potato', '2026-09-30 20:33:33', '2026-09-30 20:33:55');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_assignments`
--

CREATE TABLE `delivery_assignments` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_assignments`
--

INSERT INTO `delivery_assignments` (`id`, `order_id`, `farmer_id`, `delivery_person_name`, `delivery_person_phone`, `vehicle_type`, `vehicle_number`, `tracking_token`, `tracking_active`, `status`, `notes`, `assigned_at`, `delivery_started_at`, `delivery_completed_at`, `created_at`, `updated_at`) VALUES
(3, 12, 9, 'vijoy', '123456789', 'Motorcycle / Bike', 'gj 5', '5eab6c218936eafb33073fa3879df92054067ef64bfe7d0e1fe141834ebf5379', 1, 'assigned', NULL, '2026-09-22 09:02:47', '2026-09-22 09:03:01', NULL, '2026-09-22 08:57:24', '2026-09-22 09:03:01'),
(6, 21, 9, 'vansh', '1234567887', 'Motorcycle / Bike', 'GJ05 MB8899', 'eede434167f0ac28972d395d3dae26f60c008d6f771e697731bc8ef834b60619', 1, 'on_the_way', NULL, '2026-09-30 23:23:19', '2026-09-30 20:54:31', NULL, '2026-09-30 20:54:16', '2026-09-30 23:23:31');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_locations`
--

CREATE TABLE `delivery_locations` (
  `id` int(11) NOT NULL,
  `delivery_assignment_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` float DEFAULT NULL,
  `speed` float DEFAULT NULL,
  `heading` float DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_locations`
--

INSERT INTO `delivery_locations` (`id`, `delivery_assignment_id`, `latitude`, `longitude`, `accuracy`, `speed`, `heading`, `recorded_at`) VALUES
(4, 6, 22.30390000, 70.80220000, 18.5, 5.2, 180, '2026-09-30 23:21:49'),
(5, 6, 22.30390000, 70.80220000, 18.5, 5.2, 180, '2026-09-30 23:22:15');

-- --------------------------------------------------------

--
-- Table structure for table `farmer_reports`
--

CREATE TABLE `farmer_reports` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `farmer_reports`
--

INSERT INTO `farmer_reports` (`id`, `reporter_id`, `farmer_id`, `order_id`, `reason`, `description`, `evidence_image`, `status`, `admin_action`, `admin_notes`, `action_taken_at`, `action_taken_by`, `created_at`, `updated_at`) VALUES
(1, 8, 9, NULL, 'Produce Quality Issue', 'The organic apples received had bruises and were significantly smaller than advertised.', NULL, 'resolved', '', 'bad behaviour', '2026-09-24 12:32:56', 15, '2026-09-24 06:40:10', '2026-09-24 07:02:56'),
(2, 8, 9, NULL, 'Delayed Shipment', 'Order was scheduled for next-day dispatch but delayed for 4 days without communication.', NULL, 'pending', 'none', NULL, NULL, NULL, '2026-09-24 06:40:10', '2026-09-24 06:40:10'),
(3, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-09-24 12:22:18', 15, '2026-09-24 06:52:18', '2026-09-24 06:52:18'),
(4, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-09-24 12:40:53', 15, '2026-09-24 07:10:53', '2026-09-24 07:10:53'),
(5, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-09-24 12:58:31', 15, '2026-09-24 07:28:31', '2026-09-24 07:28:31'),
(6, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-09-24 13:24:03', 15, '2026-09-24 07:54:03', '2026-09-24 07:54:03'),
(7, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-10-01 01:28:51', 15, '2026-09-30 19:58:51', '2026-09-30 19:58:51'),
(8, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-10-01 01:48:38', 15, '2026-09-30 20:18:38', '2026-09-30 20:18:38'),
(9, 8, 9, NULL, 'Fraud or Overcharging', 'bad service', NULL, 'pending', 'none', NULL, NULL, NULL, '2026-09-30 22:58:31', '2026-09-30 22:58:31');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_role` enum('customer','farmer') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `sender_role`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 8, 'customer', 'Hello farmer! Can you provide 10kg potatoes for ₹18/kg?', 0, '2026-09-30 19:55:02'),
(2, 1, 9, 'farmer', 'Deal accepted! I can do ₹18/kg for a 10kg order. I will pack them freshly for you.', 0, '2026-09-30 19:55:02'),
(3, 2, 8, 'customer', 'Hello farmer! Can you provide 10kg potatoes for ₹18/kg?', 0, '2026-09-30 19:57:40'),
(4, 2, 9, 'farmer', 'Deal accepted! I can do ₹18/kg for a 10kg order. I will pack them freshly for you.', 0, '2026-09-30 19:57:40'),
(5, 3, 8, 'customer', 'Hello farmer! Can you provide 10kg potatoes for ₹18/kg?', 0, '2026-09-30 19:58:29'),
(6, 3, 9, 'farmer', 'Deal accepted! I can do ₹18/kg for a 10kg order. I will pack them freshly for you.', 0, '2026-09-30 19:58:29'),
(7, 4, 8, 'customer', 'Hello farmer! Can you provide 10kg potatoes for ₹18/kg?', 0, '2026-09-30 19:58:44'),
(8, 4, 9, 'farmer', 'Deal accepted! I can do ₹18/kg for a 10kg order. I will pack them freshly for you.', 0, '2026-09-30 19:58:45'),
(9, 5, 8, 'customer', 'Hello farmer! Can you provide 10kg potatoes for ₹18/kg?', 0, '2026-09-30 20:18:30'),
(10, 5, 9, 'farmer', 'Deal accepted! I can do ₹18/kg for a 10kg order. I will pack them freshly for you.', 0, '2026-09-30 20:18:30'),
(11, 6, 8, 'customer', 'can i get at 15 rupees please?', 1, '2026-09-30 20:33:55');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(27, 9, 'New Order Received', 'You have a new order #ORD-1790066743043-6735', 'order', 0, '2026-09-22 08:45:43'),
(28, 9, 'New Order Received', 'You have a new order #ORD-1790066828048-6411', 'order', 0, '2026-09-22 08:47:08'),
(29, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 08:47:23'),
(30, 9, 'New Order Received', 'You have a new order #ORD-1790067067957-8378', 'order', 0, '2026-09-22 08:51:07'),
(32, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 08:52:31'),
(33, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-22 08:53:15'),
(34, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-22 08:53:35'),
(35, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-22 09:04:29'),
(36, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-22 09:04:44'),
(37, 8, 'Order Update', 'Your order has been delivered successfully', 'order', 0, '2026-09-22 09:05:03'),
(38, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 15:06:04'),
(39, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 15:06:08'),
(40, 9, 'New Order Received', 'You have a new order #ORD-1790092203434-4685', 'order', 0, '2026-09-22 15:50:03'),
(41, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 15:50:03'),
(42, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-22 15:50:03'),
(43, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-22 15:50:03'),
(44, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 15:50:03'),
(45, 9, 'New Order Received', 'You have a new order #ORD-1790098011480-1405', 'order', 0, '2026-09-22 17:26:51'),
(46, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-22 17:26:51'),
(47, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-22 17:26:51'),
(48, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-22 17:26:51'),
(49, 8, 'Order Update', 'Your order has been cancelled', 'order', 0, '2026-09-22 17:26:51'),
(50, 14, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 29 Sept 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-24 06:51:35'),
(51, 14, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-24 06:51:35'),
(52, 9, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 29 Sept 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-24 06:52:18'),
(53, 9, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-24 06:52:18'),
(54, 9, 'Customer Grievance Warning', 'Customer report #3 was substantiated. Warning: First warning: ensure produce freshness and cold-chain transport.. Please maintain high product quality.', 'warning', 0, '2026-09-24 06:52:18'),
(55, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-24 06:52:18'),
(56, 9, 'Customer Grievance Warning', 'Customer report #1 was substantiated. Warning: bad behaviour. Please maintain high product quality.', 'warning', 0, '2026-09-24 07:02:56'),
(57, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-24 07:02:56'),
(58, 9, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 29 Sept 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-24 07:10:53'),
(59, 9, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-24 07:10:53'),
(60, 9, 'Customer Grievance Warning', 'Customer report #4 was substantiated. Warning: First warning: ensure produce freshness and cold-chain transport.. Please maintain high product quality.', 'warning', 0, '2026-09-24 07:10:53'),
(61, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-24 07:10:53'),
(62, 9, 'New Order Received', 'You have a new order #ORD-1790234603138-2351', 'order', 0, '2026-09-24 07:23:23'),
(63, 9, 'New Order Received', 'You have a new order #ORD-1790234802023-1421', 'order', 0, '2026-09-24 07:26:42'),
(64, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-24 07:26:42'),
(65, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-24 07:26:42'),
(66, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-24 07:26:42'),
(67, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-24 07:26:42'),
(68, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-24 07:26:42'),
(69, 8, 'Order Update', 'Your order has been delivered successfully', 'order', 0, '2026-09-24 07:26:42'),
(70, 9, 'New Order Received', 'You have a new order #ORD-1790234837565-1996', 'order', 0, '2026-09-24 07:27:17'),
(71, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-24 07:27:17'),
(72, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-24 07:27:17'),
(73, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-24 07:27:17'),
(74, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-24 07:27:17'),
(75, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-24 07:27:17'),
(76, 8, 'Order Update', 'Your order has been delivered successfully', 'order', 0, '2026-09-24 07:27:17'),
(77, 9, 'New Order Received', 'You have a new order #ORD-1790234902894-8249', 'order', 0, '2026-09-24 07:28:22'),
(78, 9, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 29 Sept 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-24 07:28:31'),
(79, 9, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-24 07:28:31'),
(80, 9, 'Customer Grievance Warning', 'Customer report #5 was substantiated. Warning: First warning: ensure produce freshness and cold-chain transport.. Please maintain high product quality.', 'warning', 0, '2026-09-24 07:28:31'),
(81, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-24 07:28:31'),
(82, 9, 'New Order Received', 'You have a new order #ORD-1790236425031-5683', 'order', 0, '2026-09-24 07:53:45'),
(83, 9, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 29 Sept 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-24 07:54:03'),
(84, 9, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-24 07:54:03'),
(85, 9, 'Customer Grievance Warning', 'Customer report #6 was substantiated. Warning: First warning: ensure produce freshness and cold-chain transport.. Please maintain high product quality.', 'warning', 0, '2026-09-24 07:54:03'),
(86, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-24 07:54:03'),
(87, 9, 'New Message', 'New message from Fresh Customer: \"Hello farmer! Can you provide 10kg potatoes for ₹18/kg?\"', 'info', 0, '2026-09-30 19:55:02'),
(88, 8, 'New Message', 'New message from Fresh Farmer: \"Deal accepted! I can do ₹18/kg for a 10kg order. I will pack...\"', 'info', 0, '2026-09-30 19:55:02'),
(89, 9, 'New Message', 'New message from Fresh Customer: \"Hello farmer! Can you provide 10kg potatoes for ₹18/kg?\"', 'info', 0, '2026-09-30 19:57:40'),
(90, 8, 'New Message', 'New message from Fresh Farmer: \"Deal accepted! I can do ₹18/kg for a 10kg order. I will pack...\"', 'info', 0, '2026-09-30 19:57:40'),
(91, 9, 'Product Request Approved ✓', 'Your product request for \"Dragon Fruit 0293\" has been approved! You can now list it in your farm store.', 'success', 0, '2026-09-30 19:57:40'),
(92, 9, 'Product Request Rejected', 'Your product request for \"Wild Mushroom 0438\" was not approved. Reason: Cannot approve foraged wild mushrooms without laboratory safety certification.', 'warning', 0, '2026-09-30 19:57:40'),
(93, 9, 'New Message', 'New message from Fresh Customer: \"Hello farmer! Can you provide 10kg potatoes for ₹18/kg?\"', 'info', 0, '2026-09-30 19:58:29'),
(94, 8, 'New Message', 'New message from Fresh Farmer: \"Deal accepted! I can do ₹18/kg for a 10kg order. I will pack...\"', 'info', 0, '2026-09-30 19:58:29'),
(95, 9, 'Product Request Approved ✓', 'Your product request for \"Dragon Fruit 9410\" has been approved! You can now list it in your farm store.', 'success', 0, '2026-09-30 19:58:29'),
(96, 9, 'Product Request Rejected', 'Your product request for \"Wild Mushroom 9524\" was not approved. Reason: Cannot approve foraged wild mushrooms without laboratory safety certification.', 'warning', 0, '2026-09-30 19:58:29'),
(97, 18, 'Account Suspended', 'Your account has been temporarily suspended for 3 days until 4 Oct 2026. Reason: Security check', 'warning', 0, '2026-09-30 19:58:29'),
(98, 18, 'Account Banned', 'Your account has been banned from FreshField. Reason: Severe policy violation', 'error', 0, '2026-09-30 19:58:29'),
(99, 9, 'New Message', 'New message from Fresh Customer: \"Hello farmer! Can you provide 10kg potatoes for ₹18/kg?\"', 'info', 0, '2026-09-30 19:58:44'),
(100, 8, 'New Message', 'New message from Fresh Farmer: \"Deal accepted! I can do ₹18/kg for a 10kg order. I will pack...\"', 'info', 0, '2026-09-30 19:58:45'),
(101, 9, 'Product Request Approved ✓', 'Your product request for \"Dragon Fruit 5107\" has been approved! You can now list it in your farm store.', 'success', 0, '2026-09-30 19:58:45'),
(102, 9, 'Product Request Rejected', 'Your product request for \"Wild Mushroom 5223\" was not approved. Reason: Cannot approve foraged wild mushrooms without laboratory safety certification.', 'warning', 0, '2026-09-30 19:58:45'),
(103, 20, 'Account Suspended', 'Your account has been temporarily suspended for 3 days until 4 Oct 2026. Reason: Security check', 'warning', 0, '2026-09-30 19:58:45'),
(104, 20, 'Account Banned', 'Your account has been banned from FreshField. Reason: Severe policy violation', 'error', 0, '2026-09-30 19:58:45'),
(105, 9, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 6 Oct 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-30 19:58:51'),
(106, 9, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-30 19:58:51'),
(107, 9, 'Customer Grievance Warning', 'Customer report #7 was substantiated. Warning: First warning: ensure produce freshness and cold-chain transport.. Please maintain high product quality.', 'warning', 0, '2026-09-30 19:58:51'),
(108, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-30 19:58:51'),
(109, 9, 'New Order Received', 'You have a new order #ORD-1790798345415-4602', 'order', 0, '2026-09-30 19:59:05'),
(110, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-30 19:59:05'),
(111, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-30 19:59:05'),
(112, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-30 19:59:05'),
(113, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-30 19:59:05'),
(114, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-30 19:59:05'),
(115, 8, 'Order Update', 'Your order has been delivered successfully', 'order', 0, '2026-09-30 19:59:05'),
(116, 9, 'New Message', 'New message from Fresh Customer: \"Hello farmer! Can you provide 10kg potatoes for ₹18/kg?\"', 'info', 0, '2026-09-30 20:18:30'),
(117, 8, 'New Message', 'New message from Fresh Farmer: \"Deal accepted! I can do ₹18/kg for a 10kg order. I will pack...\"', 'info', 0, '2026-09-30 20:18:30'),
(118, 9, 'Product Request Approved ✓', 'Your product request for \"Dragon Fruit 0695\" has been approved! You can now list it in your farm store.', 'success', 0, '2026-09-30 20:18:30'),
(119, 9, 'Product Request Rejected', 'Your product request for \"Wild Mushroom 0851\" was not approved. Reason: Cannot approve foraged wild mushrooms without laboratory safety certification.', 'warning', 0, '2026-09-30 20:18:30'),
(120, 23, 'Account Suspended', 'Your account has been temporarily suspended for 3 days until 4 Oct 2026. Reason: Security check', 'warning', 0, '2026-09-30 20:18:31'),
(121, 23, 'Account Banned', 'Your account has been banned from FreshField. Reason: Severe policy violation', 'error', 0, '2026-09-30 20:18:31'),
(122, 9, 'Account Suspended', 'Your account has been temporarily suspended for 5 days until 6 Oct 2026. Reason: Quality standards violation - test suspension', 'warning', 0, '2026-09-30 20:18:38'),
(123, 9, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success', 0, '2026-09-30 20:18:38'),
(124, 9, 'Customer Grievance Warning', 'Customer report #8 was substantiated. Warning: First warning: ensure produce freshness and cold-chain transport.. Please maintain high product quality.', 'warning', 0, '2026-09-30 20:18:38'),
(125, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-30 20:18:38'),
(126, 9, 'New Order Received', 'You have a new order #ORD-1790799526081-1444', 'order', 0, '2026-09-30 20:18:46'),
(127, 8, 'Order Update', 'Your order has been confirmed by the farmer', 'order', 0, '2026-09-30 20:18:46'),
(128, 8, 'Order Update', 'Your order is being prepared', 'order', 0, '2026-09-30 20:18:46'),
(129, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-30 20:18:46'),
(130, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-30 20:18:46'),
(131, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-30 20:18:46'),
(132, 8, 'Order Update', 'Your order has been delivered successfully', 'order', 0, '2026-09-30 20:18:46'),
(133, 9, 'New Message', 'New message from Fresh Customer: \"can i get at 15 rupees please?\"', 'info', 0, '2026-09-30 20:33:55'),
(134, 8, 'Order Update', 'Your order is ready for pickup/delivery', 'order', 0, '2026-09-30 20:53:45'),
(135, 8, 'Order Update', 'Your order is out for delivery', 'order', 0, '2026-09-30 20:53:49'),
(136, 8, 'Order Update', 'Your order is on the way to you', 'order', 0, '2026-09-30 20:54:54'),
(137, 9, 'Product Request Approved ✓', 'Your product request for \"mashroom\" has been approved! You can now list it in your farm store.', 'success', 0, '2026-09-30 22:55:19'),
(138, 8, 'Delivery Update', 'Your order #ORD-1790799526081-1444 is on the way to your door!', 'order', 0, '2026-09-30 23:12:59'),
(139, 8, 'Delivery Update', 'Your order #ORD-1790799526081-1444 is on the way to your door!', 'order', 0, '2026-09-30 23:23:31');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `order_number`, `total_amount`, `status`, `shipping_address`, `destination_latitude`, `destination_longitude`, `payment_method`, `payment_status`, `notes`, `created_at`, `updated_at`) VALUES
(10, 8, 'ORD-1790066743043-6735', 85.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Phone: 9876543210', '2026-09-22 08:45:43', '2026-09-22 15:06:08'),
(11, 8, 'ORD-1790066828048-6411', 85.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Phone: 9876543210', '2026-09-22 08:47:08', '2026-09-22 15:06:04'),
(12, 8, 'ORD-1790067067957-8378', 85.00, 'delivered', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'paid', 'Phone: 9876543210', '2026-09-22 08:51:07', '2026-09-22 14:35:37'),
(13, 8, 'ORD-1790092203434-4685', 100.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Please pack in fresh paper bag', '2026-09-22 15:50:03', '2026-09-22 15:50:03'),
(14, 8, 'ORD-1790098011480-1405', 100.00, 'cancelled', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, 'cash_on_delivery', 'pending', 'Please pack in fresh paper bag', '2026-09-22 17:26:51', '2026-09-22 17:26:51'),
(15, 8, 'ORD-1790234603138-2351', 750.00, 'pending', 'Test Address 123', NULL, NULL, 'cash_on_delivery', 'pending', NULL, '2026-09-24 07:23:23', '2026-09-24 07:23:23'),
(16, 8, 'ORD-1790234802023-1421', 650.00, 'delivered', 'Flat 402, Green Valley Apartments, Airport Road, Rajkot, Gujarat', NULL, NULL, 'cash_on_delivery', 'paid', 'Phone: 9876543210', '2026-09-24 07:26:42', '2026-09-24 07:26:42'),
(17, 8, 'ORD-1790234837565-1996', 650.00, 'delivered', 'Flat 402, Green Valley Apartments, Airport Road, Rajkot, Gujarat', NULL, NULL, 'cash_on_delivery', 'paid', 'Phone: 9876543210', '2026-09-24 07:27:17', '2026-09-24 07:27:17'),
(18, 8, 'ORD-1790234902894-8249', 765.00, 'pending', '123 Farm Road, Sector 5, Ahmedabad', NULL, NULL, 'cash_on_delivery', 'pending', NULL, '2026-09-24 07:28:22', '2026-09-24 07:28:22'),
(19, 8, 'ORD-1790236425031-5683', 765.00, 'pending', '123 Farm Road, Sector 5, Ahmedabad', NULL, NULL, 'cash_on_delivery', 'pending', NULL, '2026-09-24 07:53:45', '2026-09-24 07:53:45'),
(20, 8, 'ORD-1790798345415-4602', 660.00, 'delivered', 'Flat 402, Green Valley Apartments, Airport Road, Rajkot, Gujarat', NULL, NULL, 'cash_on_delivery', 'paid', 'Phone: 9876543210', '2026-09-30 19:59:05', '2026-09-30 19:59:05'),
(21, 8, 'ORD-1790799526081-1444', 660.00, 'on_the_way', 'Flat 402, Green Valley Apartments, Airport Road, Rajkot, Gujarat', NULL, NULL, 'cash_on_delivery', 'paid', 'Phone: 9876543210', '2026-09-30 20:18:46', '2026-09-30 23:23:31');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `farmer_id`, `quantity`, `price`, `total`, `created_at`) VALUES
(10, 10, 17, 9, 1, 85.00, 85.00, '2026-09-22 08:45:43'),
(11, 11, 17, 9, 1, 85.00, 85.00, '2026-09-22 08:47:08'),
(12, 12, 17, 9, 1, 85.00, 85.00, '2026-09-22 08:51:07'),
(14, 13, 18, 9, 2, 50.00, 100.00, '2026-09-22 15:50:03'),
(15, 14, 18, 9, 2, 50.00, 100.00, '2026-09-22 17:26:51'),
(16, 15, 18, 9, 15, 50.00, 750.00, '2026-09-24 07:23:23'),
(17, 16, 18, 9, 13, 50.00, 650.00, '2026-09-24 07:26:42'),
(18, 17, 18, 9, 13, 50.00, 650.00, '2026-09-24 07:27:17'),
(19, 18, 17, 9, 9, 85.00, 765.00, '2026-09-24 07:28:22'),
(20, 19, 17, 9, 9, 85.00, 765.00, '2026-09-24 07:53:45'),
(21, 20, 41, 9, 33, 20.00, 660.00, '2026-09-30 19:59:05'),
(22, 21, 42, 9, 33, 20.00, 660.00, '2026-09-30 20:18:46');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_by_role` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `note`, `updated_by`, `updated_by_role`, `created_at`) VALUES
(28, 10, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 08:45:43'),
(29, 11, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 08:47:08'),
(30, 11, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-22 08:47:23'),
(31, 12, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 08:51:07'),
(32, 12, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-22 08:52:31'),
(33, 12, 'preparing', 'Farm items are being harvested and packed', 9, 'farmer', '2026-09-22 08:53:15'),
(34, 12, 'ready', 'Order packed and ready for dispatch', 9, 'farmer', '2026-09-22 08:53:35'),
(35, 12, 'ready', 'Delivery assigned to vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-22 08:57:24'),
(36, 12, 'ready', 'Delivery assigned to vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-22 09:00:35'),
(37, 12, 'ready', 'Delivery assigned to vijoy (Motorcycle / Bike)', 9, 'farmer', '2026-09-22 09:02:47'),
(38, 12, 'out_for_delivery', 'Order handed over for local delivery', 9, 'farmer', '2026-09-22 09:04:29'),
(39, 12, 'on_the_way', 'Delivery agent is on the way to destination', 9, 'farmer', '2026-09-22 09:04:44'),
(40, 12, 'delivered', 'Order delivered fresh to customer', 9, 'farmer', '2026-09-22 09:05:03'),
(41, 11, 'cancelled', 'Order cancelled by farmer', 9, 'farmer', '2026-09-22 15:06:04'),
(42, 10, 'cancelled', 'Order cancelled by farmer', 9, 'farmer', '2026-09-22 15:06:08'),
(43, 13, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 15:50:03'),
(44, 13, 'confirmed', 'Advancing to confirmed', 9, 'farmer', '2026-09-22 15:50:03'),
(45, 13, 'preparing', 'Advancing to preparing', 9, 'farmer', '2026-09-22 15:50:03'),
(46, 13, 'ready', 'Advancing to ready', 9, 'farmer', '2026-09-22 15:50:03'),
(47, 13, 'cancelled', 'Customer requested cancellation', 9, 'farmer', '2026-09-22 15:50:03'),
(48, 14, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-22 17:26:51'),
(49, 14, 'confirmed', 'Advancing to confirmed', 9, 'farmer', '2026-09-22 17:26:51'),
(50, 14, 'preparing', 'Advancing to preparing', 9, 'farmer', '2026-09-22 17:26:51'),
(51, 14, 'ready', 'Advancing to ready', 9, 'farmer', '2026-09-22 17:26:51'),
(52, 14, 'cancelled', 'Customer requested cancellation', 9, 'farmer', '2026-09-22 17:26:51'),
(53, 15, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-24 07:23:23'),
(54, 16, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-24 07:26:42'),
(55, 16, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-24 07:26:42'),
(56, 16, 'preparing', 'Produce freshly harvested and packaged', 9, 'farmer', '2026-09-24 07:26:42'),
(57, 16, 'ready', 'Packed and waiting for delivery dispatch', 9, 'farmer', '2026-09-24 07:26:42'),
(58, 16, 'out_for_delivery', 'Package handed over to local delivery agent', 9, 'farmer', '2026-09-24 07:26:42'),
(59, 16, 'on_the_way', 'Delivery agent on the way to destination', 9, 'farmer', '2026-09-24 07:26:42'),
(60, 16, 'delivered', 'Delivered fresh directly to customer doorstep', 9, 'farmer', '2026-09-24 07:26:42'),
(61, 17, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-24 07:27:17'),
(62, 17, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-24 07:27:17'),
(63, 17, 'preparing', 'Produce freshly harvested and packaged', 9, 'farmer', '2026-09-24 07:27:17'),
(64, 17, 'ready', 'Packed and waiting for delivery dispatch', 9, 'farmer', '2026-09-24 07:27:17'),
(65, 17, 'out_for_delivery', 'Package handed over to local delivery agent', 9, 'farmer', '2026-09-24 07:27:17'),
(66, 17, 'on_the_way', 'Delivery agent on the way to destination', 9, 'farmer', '2026-09-24 07:27:17'),
(67, 17, 'delivered', 'Delivered fresh directly to customer doorstep', 9, 'farmer', '2026-09-24 07:27:17'),
(68, 18, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-24 07:28:22'),
(69, 19, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-24 07:53:45'),
(70, 20, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-30 19:59:05'),
(71, 20, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-30 19:59:05'),
(72, 20, 'preparing', 'Produce freshly harvested and packaged', 9, 'farmer', '2026-09-30 19:59:05'),
(73, 20, 'ready', 'Packed and waiting for delivery dispatch', 9, 'farmer', '2026-09-30 19:59:05'),
(74, 20, 'out_for_delivery', 'Package handed over to local delivery agent', 9, 'farmer', '2026-09-30 19:59:05'),
(75, 20, 'on_the_way', 'Delivery agent on the way to destination', 9, 'farmer', '2026-09-30 19:59:05'),
(76, 20, 'delivered', 'Delivered fresh directly to customer doorstep', 9, 'farmer', '2026-09-30 19:59:05'),
(77, 21, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-30 20:18:46'),
(78, 21, 'confirmed', 'Order confirmed by farmer', 9, 'farmer', '2026-09-30 20:18:46'),
(79, 21, 'preparing', 'Produce freshly harvested and packaged', 9, 'farmer', '2026-09-30 20:18:46'),
(80, 21, 'ready', 'Packed and waiting for delivery dispatch', 9, 'farmer', '2026-09-30 20:18:46'),
(81, 21, 'out_for_delivery', 'Package handed over to local delivery agent', 9, 'farmer', '2026-09-30 20:18:46'),
(82, 21, 'on_the_way', 'Delivery agent on the way to destination', 9, 'farmer', '2026-09-30 20:18:46'),
(83, 21, 'delivered', 'Delivered fresh directly to customer doorstep', 9, 'farmer', '2026-09-30 20:18:46'),
(84, 21, 'ready', 'Order packed and ready for dispatch', 9, 'farmer', '2026-09-30 20:53:45'),
(85, 21, 'out_for_delivery', 'Order handed over for local delivery', 9, 'farmer', '2026-09-30 20:53:49'),
(86, 21, 'out_for_delivery', 'Delivery assigned to vijoy (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 20:54:16'),
(87, 21, 'on_the_way', 'Delivery agent is on the way to destination', 9, 'farmer', '2026-09-30 20:54:54'),
(88, 21, 'on_the_way', 'Delivery assigned to vansh (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 23:11:38'),
(89, 21, 'on_the_way', 'Delivery agent vansh is on the way to destination', NULL, 'delivery', '2026-09-30 23:12:59'),
(90, 21, 'ready', 'Delivery assigned to Vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 23:21:49'),
(91, 21, 'ready', 'Delivery assigned to Vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 23:21:49'),
(92, 21, 'ready', 'Delivery assigned to Vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 23:21:49'),
(93, 21, 'ready', 'Delivery assigned to Vijay (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 23:22:15'),
(94, 21, 'ready', 'Delivery assigned to vansh (Motorcycle / Bike)', 9, 'farmer', '2026-09-30 23:23:19'),
(95, 21, 'on_the_way', 'Delivery agent vansh is on the way to destination', NULL, 'delivery', '2026-09-30 23:23:31');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `farmer_id`, `name`, `category`, `description`, `price`, `quantity`, `unit`, `image_url`, `is_available`, `created_at`, `updated_at`) VALUES
(17, 9, 'Fresh Organic Golden Honeycrisp Apples', 'Fruits', 'Crisp, sweet, organically cultivated apples directly from Organic Sun Farms.', 85.00, 79, 'kg', NULL, 1, '2026-09-22 08:40:38', '2026-09-24 07:53:45'),
(18, 9, 'Farm Fresh Organic Vine Tomatoes', 'Vegetables', 'Vine-ripened, organic, juicy tomatoes harvested fresh every morning.', 50.00, 74, 'kg', NULL, 1, '2026-09-22 09:13:08', '2026-09-24 07:27:17'),
(19, 9, 'Crisp Organic Garden Carrots', 'Vegetables', 'Sweet and crunchy organic carrots rich in beta-carotene.', 45.00, 60, 'kg', NULL, 0, '2026-09-22 09:13:08', '2026-09-22 18:45:21'),
(20, 9, 'Fresh Tender Baby Spinach', 'Leafy Greens', 'Nutrient-rich, pesticide-free baby spinach leaves.', 40.00, 50, 'bunch', NULL, 1, '2026-09-22 09:13:08', '2026-09-22 09:13:08'),
(21, 9, 'Farm Sweet Organic Strawberries', 'Fruits', 'Naturally sweet organic strawberries freshly picked from our polyhouse.', 110.00, 100, 'box', NULL, 1, '2026-09-22 09:13:08', '2026-09-24 07:26:29'),
(22, 9, 'Organic Green Bell Peppers', 'Vegetables', 'Crisp, vibrant green bell peppers bursting with flavor.', 60.00, 100, 'kg', NULL, 1, '2026-09-22 09:13:08', '2026-09-24 07:26:29'),
(23, 9, 'Organic Basmati Rice', 'Grains', 'Premium long-grain basmati rice grown without pesticides. Aromatic and fluffy when cooked. Harvested from our fertile fields in Gujarat.', 85.00, 500, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(24, 9, 'Fresh Bitter Gourd (Karela)', 'Vegetables', 'Freshly harvested bitter gourd, rich in antioxidants and vitamins. Ideal for traditional Indian recipes and health juices.', 35.00, 80, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(25, 9, 'Farm Fresh Turmeric (Haldi)', 'Spices', 'Sun-dried raw turmeric fingers from our organic farm. High curcumin content, deep golden color, intensely aromatic.', 120.00, 150, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(26, 9, 'Fresh Green Coriander (Dhania)', 'Herbs', 'Lush, vibrant coriander bunches freshly cut from the garden. Excellent fragrance, perfect for garnishing curries and chutneys.', 20.00, 60, 'bunch', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(27, 9, 'Desi Cow Ghee', 'Dairy', 'Pure A2 ghee hand-churned from our Gir cows. Golden, aromatic, with a rich buttery taste. No additives or preservatives.', 650.00, 40, 'litre', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(28, 9, 'Sweet Coconuts (Nariyal)', 'Fruits', 'Tender green coconuts with sweet water and soft malai. Handpicked at the peak of ripeness from our coastal farm.', 45.00, 200, 'piece', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(29, 9, 'Organic Moong Dal (Split)', 'Pulses', 'Organically grown split moong lentils. Protein-rich, quick-cooking, and perfect for dal, khichdi, or soups.', 110.00, 300, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(30, 9, 'Fresh Bottle Gourd (Lauki)', 'Vegetables', 'Tender bottle gourd freshly picked from the vine. Light, nutritious, and easy to digest. Perfect for sabzi, juice, and koftas.', 25.00, 100, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(31, 9, 'Alphonso Mangoes (Hapus)', 'Fruits', 'The King of Mangoes! Naturally ripened Alphonso mangoes with rich pulp, sweet flavor, and no fiber. Seasonal delight from our orchard.', 320.00, 50, 'dozen', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(32, 9, 'Fresh Fenugreek Leaves (Methi)', 'Leafy Greens', 'Freshly harvested methi (fenugreek) leaves packed with iron and vitamins. Perfect for methi paratha, thepla, or sabzi.', 18.00, 75, 'bunch', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(33, 9, 'Organic Groundnuts (Mungfali)', 'Nuts & Seeds', 'Sun-dried raw groundnuts from our fields. No chemicals, perfect for roasting, chutney, or making homemade peanut butter.', 90.00, 200, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(34, 9, 'Farm Fresh Okra (Bhindi)', 'Vegetables', 'Tender, crisp bhindi freshly harvested in the morning. Vibrant green color, no blemishes, ideal for dry sabzi or curry.', 40.00, 90, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(35, 9, 'Raw Sugarcane Jaggery (Gur)', 'Natural Sweeteners', 'Handcrafted jaggery made from freshly pressed sugarcane. No chemical processing — natural minerals and molasses retained.', 75.00, 100, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(36, 9, 'Fresh Drumstick (Moringa / Saragva)', 'Vegetables', 'Tender moringa pods packed with vitamins and minerals. Freshly harvested, great for sambar, curry, or stir-fry.', 50.00, 70, 'kg', NULL, 1, '2026-09-24 08:46:31', '2026-09-24 08:46:31'),
(37, 9, 'Cold-Pressed Groundnut Oil', 'Oils', 'Traditional wooden-pressed (kacchi ghani) groundnut oil. Unrefined, chemical-free, rich flavor ideal for Indian cooking.', 220.00, 80, 'litre', NULL, 1, '2026-09-24 08:46:32', '2026-09-24 08:46:32'),
(38, 9, 'Potato', 'Vegetables', 'Premium organic fresh harvest potato', 20.00, 100, 'kg', NULL, 1, '2026-09-30 19:55:02', '2026-09-30 19:55:02'),
(39, 9, 'Potato', 'Vegetables', 'Premium organic fresh harvest potato', 20.00, 100, 'kg', NULL, 1, '2026-09-30 19:57:40', '2026-09-30 19:57:40'),
(40, 9, 'Potato', 'Vegetables', 'Premium organic fresh harvest potato', 20.00, 100, 'kg', NULL, 1, '2026-09-30 19:58:29', '2026-09-30 19:58:29'),
(41, 9, 'Potato', 'Vegetables', 'Premium organic fresh harvest potato', 20.00, 67, 'kg', NULL, 1, '2026-09-30 19:58:45', '2026-09-30 19:59:05'),
(42, 9, 'Potato', 'Vegetables', 'Premium organic fresh harvest potato', 20.00, 67, 'kg', NULL, 1, '2026-09-30 20:18:30', '2026-09-30 20:18:46');

-- --------------------------------------------------------

--
-- Table structure for table `product_price_rules`
--

CREATE TABLE `product_price_rules` (
  `id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL COMMENT 'Lowercase normalized product name',
  `display_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `unit` varchar(20) DEFAULT 'kg',
  `min_price` decimal(10,2) NOT NULL,
  `max_price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_price_rules`
--

INSERT INTO `product_price_rules` (`id`, `product_name`, `display_name`, `category`, `unit`, `min_price`, `max_price`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'potato', 'Potato', 'Vegetables', 'kg', 15.00, 25.00, 1, '2026-09-30 19:17:43', '2026-09-30 19:17:43'),
(2, 'tomato', 'Tomato', 'Vegetables', 'kg', 20.00, 60.00, 1, '2026-09-30 19:17:43', '2026-09-30 19:17:43'),
(3, 'onion', 'Onion', 'Vegetables', 'kg', 15.00, 40.00, 1, '2026-09-30 19:17:43', '2026-09-30 19:17:43'),
(4, 'cauliflower', 'Cauliflower', 'Vegetables', 'piece', 20.00, 60.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(5, 'spinach', 'Spinach', 'Leafy Greens', 'bunch', 10.00, 30.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(6, 'carrot', 'Carrot', 'Vegetables', 'kg', 25.00, 60.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(7, 'bhindi', 'Bhindi (Okra)', 'Vegetables', 'kg', 30.00, 60.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(8, 'lauki', 'Lauki (Bottle Gourd)', 'Vegetables', 'kg', 15.00, 35.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(9, 'karela', 'Karela (Bitter Gourd)', 'Vegetables', 'kg', 25.00, 55.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(10, 'methi', 'Methi (Fenugreek)', 'Leafy Greens', 'bunch', 10.00, 30.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(11, 'apple', 'Apple', 'Fruits', 'kg', 80.00, 250.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(12, 'mango', 'Mango', 'Fruits', 'dozen', 150.00, 600.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(13, 'banana', 'Banana', 'Fruits', 'dozen', 25.00, 80.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(14, 'strawberry', 'Strawberry', 'Fruits', 'kg', 80.00, 300.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(15, 'coconut', 'Coconut', 'Fruits', 'piece', 25.00, 70.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(16, 'rice', 'Rice', 'Grains', 'kg', 40.00, 120.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(17, 'wheat', 'Wheat', 'Grains', 'kg', 25.00, 60.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(18, 'moong dal', 'Moong Dal', 'Pulses', 'kg', 80.00, 150.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(19, 'groundnut', 'Groundnut', 'Nuts & Seeds', 'kg', 60.00, 130.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(20, 'jaggery', 'Jaggery (Gur)', 'Natural Sweeteners', 'kg', 50.00, 120.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(21, 'ghee', 'Ghee', 'Dairy', 'litre', 400.00, 900.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(22, 'groundnut oil', 'Groundnut Oil', 'Oils', 'litre', 150.00, 350.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(23, 'turmeric', 'Turmeric', 'Spices', 'kg', 80.00, 200.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(24, 'coriander', 'Coriander', 'Herbs', 'bunch', 8.00, 30.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(25, 'drumstick', 'Drumstick (Moringa)', 'Vegetables', 'kg', 30.00, 80.00, 1, '2026-09-30 19:17:44', '2026-09-30 19:17:44'),
(26, 'dragon fruit', 'Dragon Fruit', 'Fruits', 'kg', 60.00, 120.00, 1, '2026-09-30 19:57:40', '2026-09-30 21:23:58'),
(30, 'mashroom', 'mashroom', 'Vegetables', 'kg', 50.00, 100.00, 1, '2026-09-30 22:55:19', '2026-09-30 22:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `product_requests`
--

CREATE TABLE `product_requests` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_requests`
--

INSERT INTO `product_requests` (`id`, `farmer_id`, `product_name`, `category`, `description`, `suggested_min_price`, `suggested_max_price`, `unit`, `reason`, `status`, `admin_notes`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 9, 'Dragon Fruit 2554', 'Fruits', NULL, 60.00, 120.00, 'kg', 'Locally cultivated organic red dragon fruit from our farm greenhouse.', 'pending', NULL, NULL, NULL, '2026-09-30 19:55:02', '2026-09-30 19:55:02'),
(2, 9, 'Wild Mushroom 2685', 'Vegetables', NULL, 150.00, 300.00, 'kg', 'Foraged mushrooms', 'pending', NULL, NULL, NULL, '2026-09-30 19:55:02', '2026-09-30 19:55:02'),
(3, 9, 'Dragon Fruit 0293', 'Fruits', NULL, 60.00, 120.00, 'kg', 'Locally cultivated organic red dragon fruit from our farm greenhouse.', 'approved', 'Approved for official seasonal catalog. Fair pricing brackets established.', 15, '2026-10-01 01:27:40', '2026-09-30 19:57:40', '2026-09-30 19:57:40'),
(4, 9, 'Wild Mushroom 0438', 'Vegetables', NULL, 150.00, 300.00, 'kg', 'Foraged mushrooms from forest perimeter', 'rejected', 'Cannot approve foraged wild mushrooms without laboratory safety certification.', 15, '2026-10-01 01:27:40', '2026-09-30 19:57:40', '2026-09-30 19:57:40'),
(5, 9, 'Dragon Fruit 9410', 'Fruits', NULL, 60.00, 120.00, 'kg', 'Locally cultivated organic red dragon fruit from our farm greenhouse.', 'approved', 'Approved for official seasonal catalog. Fair pricing brackets established.', 15, '2026-10-01 01:28:29', '2026-09-30 19:58:29', '2026-09-30 19:58:29'),
(6, 9, 'Wild Mushroom 9524', 'Vegetables', NULL, 150.00, 300.00, 'kg', 'Foraged mushrooms from forest perimeter', 'rejected', 'Cannot approve foraged wild mushrooms without laboratory safety certification.', 15, '2026-10-01 01:28:29', '2026-09-30 19:58:29', '2026-09-30 19:58:29'),
(7, 9, 'Dragon Fruit 5107', 'Fruits', NULL, 60.00, 120.00, 'kg', 'Locally cultivated organic red dragon fruit from our farm greenhouse.', 'approved', 'Approved for official seasonal catalog. Fair pricing brackets established.', 15, '2026-10-01 01:28:45', '2026-09-30 19:58:45', '2026-09-30 19:58:45'),
(8, 9, 'Wild Mushroom 5223', 'Vegetables', NULL, 150.00, 300.00, 'kg', 'Foraged mushrooms from forest perimeter', 'rejected', 'Cannot approve foraged wild mushrooms without laboratory safety certification.', 15, '2026-10-01 01:28:45', '2026-09-30 19:58:45', '2026-09-30 19:58:45'),
(9, 9, 'Dragon Fruit 0695', 'Fruits', NULL, 60.00, 120.00, 'kg', 'Locally cultivated organic red dragon fruit from our farm greenhouse.', 'approved', 'Approved for official seasonal catalog. Fair pricing brackets established.', 15, '2026-10-01 01:48:30', '2026-09-30 20:18:30', '2026-09-30 20:18:30'),
(10, 9, 'Wild Mushroom 0851', 'Vegetables', NULL, 150.00, 300.00, 'kg', 'Foraged mushrooms from forest perimeter', 'rejected', 'Cannot approve foraged wild mushrooms without laboratory safety certification.', 15, '2026-10-01 01:48:30', '2026-09-30 20:18:30', '2026-09-30 20:18:30'),
(12, 9, 'mashroom', 'Vegetables', NULL, 50.00, 100.00, 'kg', 'great and high in demand', 'approved', 'Approved by administrator.', 15, '2026-10-01 04:25:19', '2026-09-30 22:52:52', '2026-09-30 22:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `suspended_until`, `suspension_reason`, `ban_reason`, `warning_count`, `last_warning`, `last_warning_at`, `phone`, `address`, `profile_image`, `bio`, `farm_name`, `farm_location`, `farmer_id`, `kisan_card_number`, `kisan_card_image`, `is_verified`, `verified_at`, `created_at`, `updated_at`) VALUES
(8, 'Fresh Customer', 'freshcustomer@freshfield.test', '$2b$10$ZEmnGjG0YtWffBEeY1yIuO259j0nu5G48KWkiKRfxnwkqvPHWNOaC', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, '9876543210', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-22 08:40:38', '2026-09-30 20:20:38'),
(9, 'Fresh Farmer', 'freshfarmer@freshfield.test', '$2b$10$ZEmnGjG0YtWffBEeY1yIuO259j0nu5G48KWkiKRfxnwkqvPHWNOaC', 'farmer', 'active', NULL, NULL, NULL, 7, 'First warning: ensure produce freshness and cold-chain transport.', '2026-10-01 01:48:38', '9812345678', NULL, NULL, NULL, 'Organic Sun Farms', 'Nashik, Maharashtra', 'FID-2024-8841', 'KCC-8841-3920', NULL, 1, NULL, '2026-09-22 08:40:38', '2026-09-30 20:20:38'),
(10, 'OM OM', 'om@gmail.com', '$2b$10$RoKpdpdd72z80Bi9EsQLYe0ZtS7ZklwbNCidwgd/eNhrNRuO6ipUe', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, '+919173708805', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-23 04:07:04', '2026-09-23 04:07:04'),
(11, 'Ramesh Farmer', 'verified_farmer_1790229460522@example.com', '$2b$10$d9yFbgwH5uNSew6OXHGn8ec8bVzlYmd1UzxWfcWca6mTpzK/pkdYu', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunrise Agro', 'Nashik, Maharashtra', 'FID-2024-7788', 'KCC-7788-9900', 'kisan-card-1790229460525-616113071.png', 1, '2026-09-24 05:57:40', '2026-09-24 05:57:40', '2026-09-24 05:57:40'),
(12, 'Rajesh Sharma', 'rajesh_farmer_1790229835180@farmertest.com', '$2b$10$267q2gSxRTBboaUy2xsXdOWlRlJfOtWvP15NXxt8ucnXrP774KqSu', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sharma Organic Farms', 'Nashik, Maharashtra', 'FID-2024-4455', 'KCC-4455-8899', 'kisan-card-1790229835184-95371210.png', 1, '2026-09-24 06:03:55', '2026-09-24 06:03:55', '2026-09-24 06:03:55'),
(13, 'Rajesh Sharma', 'rajesh_farmer_1790231048136@farmertest.com', '$2b$10$OV7TPxlzhYXD/YdGeTaCjuHOb95U6etzkStOA2YutoN5IQf5WV2t6', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sharma Organic Farms', 'Nashik, Maharashtra', 'FID-2024-4455', 'KCC-4455-8899', 'kisan-card-1790231048138-841141257.png', 1, '2026-09-24 06:24:08', '2026-09-24 06:24:08', '2026-09-24 06:24:08'),
(14, 'farm farmer', 'far@gmail.com', '$2b$10$fUWwOkx5Dzw.3L..0iB7nu/Ice3pP9Ko1RQMfU.UsHJgDsbERzuuG', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, '741258963', NULL, NULL, NULL, 'far far', 'Nashik, Maharashtra', 'FID-2024-7838', 'KCC-8841-5818', 'kisan-card-1790231397625-996680824.png', 1, '2026-09-24 06:29:58', '2026-09-24 06:29:58', '2026-09-24 06:51:35'),
(15, 'System Administrator', 'admin@freshfield.com', '$2b$10$rpZHA0UBwHE8TSvUR.tmCeRphyv8jsEUjIR9WrjTUIB9zmh8DRaGi', 'admin', 'active', NULL, NULL, NULL, 0, NULL, NULL, '+91 98765 00000', 'HQ FreshField, Mumbai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-24 06:40:10', '2026-09-30 20:20:38'),
(16, 'Security Test Customer', 'sec_test_1790798260465@test.com', '$2b$10$9J9IIT1wKNpldoZqQzolvunzB6kgTxqA0shxTVx4HJg3XKOZyEF.a', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 19:57:40', '2026-09-30 19:57:40'),
(17, 'Security Test Customer', 'sec_test_1790798309548@test.com', '$2b$10$aPJ8PZ5TdKz6msAn8bfhROmXUfzt9YUqd.kioCFtd3/utuNTluoHS', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 19:58:29', '2026-09-30 19:58:29'),
(18, 'Mod Target User', 'temp_mod_1790798309730@test.com', '$2b$10$KsAJ.cc2k4qqunSqp3rNj.Bny0KXrc4chIScj/Tk1ct08U0zzKQAy', 'customer', 'banned', NULL, NULL, 'Severe policy violation', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 19:58:29', '2026-09-30 19:58:29'),
(19, 'Security Test Customer', 'sec_test_1790798325246@test.com', '$2b$10$HL1EjCF6TBxbhw4/ZHRdMuCWHkrU8RnjcK9xQ/xIOTSKig/4p7fe.', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 19:58:45', '2026-09-30 19:58:45'),
(20, 'Mod Target User', 'temp_mod_1790798325399@test.com', '$2b$10$Sq0qhrULHfsD9iWMjEKCXe4cAstAWxnEBuuMh2qFzdw4RWSqFgxxq', 'customer', 'banned', NULL, NULL, 'Severe policy violation', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 19:58:45', '2026-09-30 19:58:45'),
(21, 'Rajesh Sharma', 'rajesh_farmer_1790798336705@farmertest.com', '$2b$10$a9zcL5PqgVZhD7aqnfLS5.cZa9wM.Q..48vNjEItJOjrYUlZSFmoS', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sharma Organic Farms', 'Nashik, Maharashtra', 'FID-2024-4455', 'KCC-4455-8899', 'kisan-card-1790798336707-636072149.png', 1, '2026-09-30 19:58:56', '2026-09-30 19:58:56', '2026-09-30 19:58:56'),
(22, 'Security Test Customer', 'sec_test_1790799510879@test.com', '$2b$10$C.XKd5V394D0lWLfnAo0wukzg5eu5ONZ0LjfN8ZUEawku..1wcNN.', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 20:18:30', '2026-09-30 20:18:30'),
(23, 'Mod Target User', 'temp_mod_1790799511052@test.com', '$2b$10$1ZDpRFC1Aa7867cZUdPvzuYR/DOcKMXtDFRdYkRo8jUai.2Z55SSa', 'customer', 'banned', NULL, NULL, 'Severe policy violation', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-30 20:18:31', '2026-09-30 20:18:31');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `customer_id`, `product_id`, `created_at`) VALUES
(10, 8, 18, '2026-09-24 07:26:23'),
(11, 8, 41, '2026-09-30 19:59:05'),
(12, 8, 42, '2026-09-30 20:18:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `admin_action_logs`
--
ALTER TABLE `admin_action_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `idx_target_user` (`target_user_id`),
  ADD KEY `idx_action_type` (`action_type`);

--
-- Indexes for table `approved_product_catalog`
--
ALTER TABLE `approved_product_catalog`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_catalog_name` (`name`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conv` (`customer_id`,`farmer_id`,`product_id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_farmer` (`farmer_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD UNIQUE KEY `tracking_token` (`tracking_token`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_tracking_token` (`tracking_token`),
  ADD KEY `idx_farmer_id` (`farmer_id`);

--
-- Indexes for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assignment_id` (`delivery_assignment_id`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexes for table `farmer_reports`
--
ALTER TABLE `farmer_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `action_taken_by` (`action_taken_by`),
  ADD KEY `idx_reporter` (`reporter_id`),
  ADD KEY `idx_farmer` (`farmer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation` (`conversation_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_messages_conv_read_sender` (`conversation_id`,`is_read`,`sender_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_orders_customer_created` (`customer_id`,`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_farmer` (`farmer_id`),
  ADD KEY `idx_order_items_farmer_order` (`farmer_id`,`order_id`),
  ADD KEY `idx_order_items_farmer_product` (`farmer_id`,`product_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_farmer` (`farmer_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_availability` (`is_available`),
  ADD KEY `idx_products_avail_qty_created` (`is_available`,`quantity`,`created_at`);

--
-- Indexes for table `product_price_rules`
--
ALTER TABLE `product_price_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_product_name` (`product_name`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `product_requests`
--
ALTER TABLE `product_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_farmer` (`farmer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`product_id`,`customer_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_customer` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_users_role_status` (`role`,`status`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`customer_id`,`product_id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `admin_action_logs`
--
ALTER TABLE `admin_action_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `approved_product_catalog`
--
ALTER TABLE `approved_product_catalog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `farmer_reports`
--
ALTER TABLE `farmer_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `product_price_rules`
--
ALTER TABLE `product_price_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `product_requests`
--
ALTER TABLE `product_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_action_logs`
--
ALTER TABLE `admin_action_logs`
  ADD CONSTRAINT `admin_action_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_action_logs_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_action_logs_ibfk_3` FOREIGN KEY (`report_id`) REFERENCES `farmer_reports` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `approved_product_catalog`
--
ALTER TABLE `approved_product_catalog`
  ADD CONSTRAINT `approved_product_catalog_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `product_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `approved_product_catalog_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  ADD CONSTRAINT `delivery_assignments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_assignments_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  ADD CONSTRAINT `delivery_locations_ibfk_1` FOREIGN KEY (`delivery_assignment_id`) REFERENCES `delivery_assignments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `farmer_reports`
--
ALTER TABLE `farmer_reports`
  ADD CONSTRAINT `farmer_reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `farmer_reports_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `farmer_reports_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `farmer_reports_ibfk_4` FOREIGN KEY (`action_taken_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_requests`
--
ALTER TABLE `product_requests`
  ADD CONSTRAINT `product_requests_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_requests_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
