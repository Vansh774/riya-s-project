/**
 * Auto-Migrator: Ensures database schema is up to date automatically on server start.
 * Safe and idempotent: Checks if tables/columns exist before altering or creating.
 */
const { pool } = require('../config/database');

async function checkColumnExists(table, column) {
    try {
        const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
        return rows.length > 0;
    } catch (err) {
        return false;
    }
}

async function addColumnSafe(table, column, definition) {
    const exists = await checkColumnExists(table, column);
    if (!exists) {
        try {
            await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${definition}`);
            console.log(`[AutoMigrate] Added column ${column} to table ${table}`);
        } catch (err) {
            console.warn(`[AutoMigrate] Notice adding ${column} to ${table}:`, err.message);
        }
    }
}

async function runAutoMigration() {
    try {
        // 1. Conversations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`conversations\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`customer_id\` int(11) NOT NULL,
                \`farmer_id\` int(11) NOT NULL,
                \`product_id\` int(11) DEFAULT NULL,
                \`subject\` varchar(255) DEFAULT 'Product Inquiry',
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_customer\` (\`customer_id\`),
                KEY \`idx_farmer\` (\`farmer_id\`),
                KEY \`idx_product\` (\`product_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Check and add negotiation columns to conversations table
        await addColumnSafe('conversations', 'negotiation_status', "ENUM('none','offer_made','countered','accepted','rejected','cancelled','expired') DEFAULT 'none' AFTER subject");
        await addColumnSafe('conversations', 'agreed_price', "DECIMAL(10,2) NULL AFTER negotiation_status");
        await addColumnSafe('conversations', 'agreed_at', "DATETIME NULL AFTER agreed_price");
        await addColumnSafe('conversations', 'current_offer_price', "DECIMAL(10,2) NULL AFTER agreed_at");
        await addColumnSafe('conversations', 'current_offer_by', "ENUM('customer','farmer') NULL AFTER current_offer_price");
        await addColumnSafe('conversations', 'offer_updated_at', "DATETIME NULL AFTER current_offer_by");
        await addColumnSafe('conversations', 'expires_at', "DATETIME NULL AFTER offer_updated_at");

        // 2. Messages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`messages\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`conversation_id\` int(11) NOT NULL,
                \`sender_id\` int(11) NOT NULL,
                \`sender_role\` enum('customer','farmer') NOT NULL,
                \`message\` text NOT NULL,
                \`is_read\` tinyint(1) DEFAULT 0,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_conversation\` (\`conversation_id\`),
                KEY \`idx_sender\` (\`sender_id\`),
                KEY \`idx_created_at\` (\`created_at\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        await addColumnSafe('messages', 'message_type', "ENUM('text','offer','counter','accept','reject','system') DEFAULT 'text' AFTER message");

        // 3. Negotiation Offers table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`negotiation_offers\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`conversation_id\` int(11) NOT NULL,
                \`product_id\` int(11) NOT NULL,
                \`customer_id\` int(11) NOT NULL,
                \`farmer_id\` int(11) NOT NULL,
                \`offered_by\` enum('customer','farmer') NOT NULL,
                \`offer_price\` decimal(10,2) NOT NULL,
                \`status\` enum('pending','countered','accepted','rejected','cancelled','expired') DEFAULT 'pending',
                \`notes\` varchar(255) DEFAULT NULL,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`responded_at\` datetime DEFAULT NULL,
                \`expires_at\` datetime DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`idx_conv\` (\`conversation_id\`),
                KEY \`idx_product\` (\`product_id\`),
                KEY \`idx_customer\` (\`customer_id\`),
                KEY \`idx_farmer\` (\`farmer_id\`),
                KEY \`idx_status\` (\`status\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // 4. Order items is_negotiated flag
        await addColumnSafe('order_items', 'is_negotiated', "BOOLEAN DEFAULT FALSE AFTER total");

        // 5. Users table fields (verification & moderation & admin role)
        try {
            await pool.query("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('farmer', 'customer', 'admin') NOT NULL");
        } catch (e) {
            // Ignore if role already modified
        }
        await addColumnSafe('users', 'status', "ENUM('active', 'suspended', 'banned') DEFAULT 'active' AFTER role");
        await addColumnSafe('users', 'suspended_until', "DATETIME NULL AFTER status");
        await addColumnSafe('users', 'suspension_reason', "TEXT NULL AFTER suspended_until");
        await addColumnSafe('users', 'ban_reason', "TEXT NULL AFTER suspension_reason");
        await addColumnSafe('users', 'warning_count', "INT DEFAULT 0 AFTER ban_reason");
        await addColumnSafe('users', 'last_warning', "TEXT NULL AFTER warning_count");
        await addColumnSafe('users', 'last_warning_at', "DATETIME NULL AFTER last_warning");
        await addColumnSafe('users', 'farmer_id', "VARCHAR(50) NULL AFTER farm_location");
        await addColumnSafe('users', 'kisan_card_number', "VARCHAR(50) NULL AFTER farmer_id");
        await addColumnSafe('users', 'kisan_card_image', "VARCHAR(255) NULL AFTER kisan_card_number");
        await addColumnSafe('users', 'is_verified', "BOOLEAN DEFAULT FALSE AFTER kisan_card_image");
        await addColumnSafe('users', 'verified_at', "TIMESTAMP NULL AFTER is_verified");

        // 6. Orders destination fields
        await addColumnSafe('orders', 'destination_latitude', "DECIMAL(10,8) NULL AFTER shipping_address");
        await addColumnSafe('orders', 'destination_longitude', "DECIMAL(11,8) NULL AFTER destination_latitude");

        // 7. Delivery tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`delivery_assignments\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`order_id\` int(11) NOT NULL,
                \`farmer_id\` int(11) NOT NULL,
                \`delivery_person_name\` varchar(100) NOT NULL,
                \`delivery_person_phone\` varchar(20) NOT NULL,
                \`vehicle_type\` varchar(50) DEFAULT NULL,
                \`vehicle_number\` varchar(50) DEFAULT NULL,
                \`tracking_token\` varchar(64) NOT NULL,
                \`tracking_active\` tinyint(1) DEFAULT 0,
                \`status\` enum('assigned','picked_up','out_for_delivery','on_the_way','delivered') DEFAULT 'assigned',
                \`notes\` text DEFAULT NULL,
                \`assigned_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`delivery_started_at\` timestamp NULL DEFAULT NULL,
                \`delivery_completed_at\` timestamp NULL DEFAULT NULL,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`order_id\` (\`order_id\`),
                UNIQUE KEY \`tracking_token\` (\`tracking_token\`),
                KEY \`idx_order_id\` (\`order_id\`),
                KEY \`idx_tracking_token\` (\`tracking_token\`),
                KEY \`idx_farmer_id\` (\`farmer_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`delivery_locations\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`delivery_assignment_id\` int(11) NOT NULL,
                \`latitude\` decimal(10,8) NOT NULL,
                \`longitude\` decimal(11,8) NOT NULL,
                \`accuracy\` float DEFAULT NULL,
                \`speed\` float DEFAULT NULL,
                \`heading\` float DEFAULT NULL,
                \`recorded_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_assignment_id\` (\`delivery_assignment_id\`),
                KEY \`idx_recorded_at\` (\`recorded_at\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // 8. Price rules and catalogs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`product_price_rules\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`product_name\` varchar(100) NOT NULL,
                \`display_name\` varchar(100) NOT NULL,
                \`category\` varchar(50) NOT NULL,
                \`unit\` varchar(20) DEFAULT 'kg',
                \`min_price\` decimal(10,2) NOT NULL,
                \`max_price\` decimal(10,2) NOT NULL,
                \`is_active\` tinyint(1) DEFAULT 1,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`unique_product_name\` (\`product_name\`),
                KEY \`idx_active\` (\`is_active\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`product_requests\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`farmer_id\` int(11) NOT NULL,
                \`product_name\` varchar(100) NOT NULL,
                \`category\` varchar(50) NOT NULL,
                \`description\` text DEFAULT NULL,
                \`suggested_min_price\` decimal(10,2) DEFAULT NULL,
                \`suggested_max_price\` decimal(10,2) DEFAULT NULL,
                \`unit\` varchar(20) DEFAULT 'kg',
                \`reason\` text DEFAULT NULL,
                \`status\` enum('pending','approved','rejected') DEFAULT 'pending',
                \`admin_notes\` text DEFAULT NULL,
                \`reviewed_by\` int(11) DEFAULT NULL,
                \`reviewed_at\` datetime DEFAULT NULL,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_farmer\` (\`farmer_id\`),
                KEY \`idx_status\` (\`status\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`approved_product_catalog\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`name\` varchar(100) NOT NULL,
                \`category\` varchar(50) NOT NULL,
                \`unit\` varchar(20) DEFAULT 'kg',
                \`description\` text DEFAULT NULL,
                \`request_id\` int(11) DEFAULT NULL,
                \`approved_by\` int(11) DEFAULT NULL,
                \`approved_at\` datetime DEFAULT current_timestamp(),
                \`is_active\` tinyint(1) DEFAULT 1,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`unique_catalog_name\` (\`name\`),
                KEY \`idx_category\` (\`category\`),
                KEY \`idx_active\` (\`is_active\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`farmer_reports\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`reporter_id\` int(11) NOT NULL,
                \`farmer_id\` int(11) NOT NULL,
                \`order_id\` int(11) DEFAULT NULL,
                \`reason\` varchar(100) NOT NULL,
                \`description\` text NOT NULL,
                \`evidence_image\` varchar(255) DEFAULT NULL,
                \`status\` enum('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
                \`admin_action\` enum('none','warned','suspended','banned','dismissed') DEFAULT 'none',
                \`admin_notes\` text DEFAULT NULL,
                \`action_taken_at\` datetime DEFAULT NULL,
                \`action_taken_by\` int(11) DEFAULT NULL,
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_reporter\` (\`reporter_id\`),
                KEY \`idx_farmer\` (\`farmer_id\`),
                KEY \`idx_status\` (\`status\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`admin_action_logs\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`admin_id\` int(11) NOT NULL,
                \`target_user_id\` int(11) NOT NULL,
                \`report_id\` int(11) DEFAULT NULL,
                \`action_type\` enum('warn','suspend','ban','unsuspend','unban','dismiss_report') NOT NULL,
                \`days\` int(11) DEFAULT NULL,
                \`reason\` text NOT NULL,
                \`details\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`details\`)),
                \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_target_user\` (\`target_user_id\`),
                KEY \`idx_action_type\` (\`action_type\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    } catch (error) {
        console.error('[AutoMigrate] Warning during schema synchronization:', error.message);
    }
}

module.exports = { runAutoMigration };
