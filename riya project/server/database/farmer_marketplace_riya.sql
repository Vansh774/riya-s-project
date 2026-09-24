-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 24, 2026 at 10:08 AM
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
(59, 8, 'create_order', 'order', 19, '{\"orderNumber\":\"ORD-1790236425031-5683\",\"totalAmount\":765}', NULL, '2026-09-24 07:53:45');

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
(15, 15, 9, 6, 'warn', NULL, 'First warning: ensure produce freshness and cold-chain transport.', NULL, '2026-09-24 07:54:03');

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
(3, 12, 9, 'vijoy', '123456789', 'Motorcycle / Bike', 'gj 5', '5eab6c218936eafb33073fa3879df92054067ef64bfe7d0e1fe141834ebf5379', 1, 'assigned', NULL, '2026-09-22 09:02:47', '2026-09-22 09:03:01', NULL, '2026-09-22 08:57:24', '2026-09-22 09:03:01');

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
(6, 8, 9, NULL, 'Poor Quality Produce', 'Organic apples were bruised and discolored upon arrival.', NULL, 'resolved', '', 'First warning: ensure produce freshness and cold-chain transport.', '2026-09-24 13:24:03', 15, '2026-09-24 07:54:03', '2026-09-24 07:54:03');

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
(86, 8, 'Report Update', 'Your report against Fresh Farmer has been reviewed and marked as resolved. Thank you for helping keep FreshField safe.', 'info', 0, '2026-09-24 07:54:03');

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
(19, 8, 'ORD-1790236425031-5683', 765.00, 'pending', '123 Farm Road, Sector 5, Ahmedabad', NULL, NULL, 'cash_on_delivery', 'pending', NULL, '2026-09-24 07:53:45', '2026-09-24 07:53:45');

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
(20, 19, 17, 9, 9, 85.00, 765.00, '2026-09-24 07:53:45');

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
(69, 19, 'pending', 'Order placed by customer', 8, 'customer', '2026-09-24 07:53:45');

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
(22, 9, 'Organic Green Bell Peppers', 'Vegetables', 'Crisp, vibrant green bell peppers bursting with flavor.', 60.00, 100, 'kg', NULL, 1, '2026-09-22 09:13:08', '2026-09-24 07:26:29');

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
(8, 'Fresh Customer', 'freshcustomer@freshfield.test', '$2b$10$SjS7KBoLsTzB.bRmaib4fuu2XEpMHLmgtnlOsXjoYccIy5NO/Pkd2', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, '9876543210', '45 Green Garden Road, Pune, Maharashtra - 411001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-22 08:40:38', '2026-09-24 06:51:54'),
(9, 'Fresh Farmer', 'freshfarmer@freshfield.test', '$2b$10$SjS7KBoLsTzB.bRmaib4fuu2XEpMHLmgtnlOsXjoYccIy5NO/Pkd2', 'farmer', 'active', NULL, NULL, NULL, 5, 'First warning: ensure produce freshness and cold-chain transport.', '2026-09-24 13:24:03', '9812345678', NULL, NULL, NULL, 'Organic Sun Farms', 'Pune, Maharashtra', NULL, NULL, NULL, 0, NULL, '2026-09-22 08:40:38', '2026-09-24 07:54:03'),
(10, 'OM OM', 'om@gmail.com', '$2b$10$RoKpdpdd72z80Bi9EsQLYe0ZtS7ZklwbNCidwgd/eNhrNRuO6ipUe', 'customer', 'active', NULL, NULL, NULL, 0, NULL, NULL, '+919173708805', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-23 04:07:04', '2026-09-23 04:07:04'),
(11, 'Ramesh Farmer', 'verified_farmer_1790229460522@example.com', '$2b$10$d9yFbgwH5uNSew6OXHGn8ec8bVzlYmd1UzxWfcWca6mTpzK/pkdYu', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunrise Agro', 'Nashik, Maharashtra', 'FID-2024-7788', 'KCC-7788-9900', 'kisan-card-1790229460525-616113071.png', 1, '2026-09-24 05:57:40', '2026-09-24 05:57:40', '2026-09-24 05:57:40'),
(12, 'Rajesh Sharma', 'rajesh_farmer_1790229835180@farmertest.com', '$2b$10$267q2gSxRTBboaUy2xsXdOWlRlJfOtWvP15NXxt8ucnXrP774KqSu', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sharma Organic Farms', 'Nashik, Maharashtra', 'FID-2024-4455', 'KCC-4455-8899', 'kisan-card-1790229835184-95371210.png', 1, '2026-09-24 06:03:55', '2026-09-24 06:03:55', '2026-09-24 06:03:55'),
(13, 'Rajesh Sharma', 'rajesh_farmer_1790231048136@farmertest.com', '$2b$10$OV7TPxlzhYXD/YdGeTaCjuHOb95U6etzkStOA2YutoN5IQf5WV2t6', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Sharma Organic Farms', 'Nashik, Maharashtra', 'FID-2024-4455', 'KCC-4455-8899', 'kisan-card-1790231048138-841141257.png', 1, '2026-09-24 06:24:08', '2026-09-24 06:24:08', '2026-09-24 06:24:08'),
(14, 'farm farmer', 'far@gmail.com', '$2b$10$fUWwOkx5Dzw.3L..0iB7nu/Ice3pP9Ko1RQMfU.UsHJgDsbERzuuG', 'farmer', 'active', NULL, NULL, NULL, 0, NULL, NULL, '741258963', NULL, NULL, NULL, 'far far', 'Nashik, Maharashtra', 'FID-2024-7838', 'KCC-8841-5818', 'kisan-card-1790231397625-996680824.png', 1, '2026-09-24 06:29:58', '2026-09-24 06:29:58', '2026-09-24 06:51:35'),
(15, 'System Administrator', 'admin@freshfield.com', '$2b$10$i/ghK1YsKD34U3dDsr7CFugfGq8t3z.mttEY7XUx96aLT4MZ6HUv6', 'admin', 'active', NULL, NULL, NULL, 0, NULL, NULL, '+91 98765 00000', 'HQ FreshField, Mumbai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-09-24 06:40:10', '2026-09-24 06:40:10');

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
(10, 8, 18, '2026-09-24 07:26:23');

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
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `idx_order_number` (`order_number`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_farmer` (`farmer_id`);

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
  ADD KEY `idx_availability` (`is_available`);

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
  ADD KEY `idx_role` (`role`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `admin_action_logs`
--
ALTER TABLE `admin_action_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `delivery_locations`
--
ALTER TABLE `delivery_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `farmer_reports`
--
ALTER TABLE `farmer_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
