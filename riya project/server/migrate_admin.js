const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

async function migrateAdmin() {
    try {
        console.log('--- Starting Admin Dashboard & Moderation Migration ---');

        // 1. Expand users.role to include 'admin'
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'customer', 'admin') NOT NULL");
        console.log("1. users.role expanded to ENUM('farmer', 'customer', 'admin')");

        // Helper to check column existence before adding
        async function addColumnIfNotExists(table, colName, colDefinition) {
            const [cols] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [colName]);
            if (cols.length === 0) {
                await pool.query(`ALTER TABLE ${table} ADD COLUMN ${colName} ${colDefinition}`);
                console.log(`+ Added column ${colName} to ${table}`);
            } else {
                console.log(`- Column ${colName} already exists on ${table}`);
            }
        }

        // 2. Add moderation columns to users table
        await addColumnIfNotExists('users', 'status', "ENUM('active', 'suspended', 'banned') DEFAULT 'active' AFTER role");
        await addColumnIfNotExists('users', 'suspended_until', "DATETIME NULL AFTER status");
        await addColumnIfNotExists('users', 'suspension_reason', "TEXT NULL AFTER suspended_until");
        await addColumnIfNotExists('users', 'ban_reason', "TEXT NULL AFTER suspension_reason");
        await addColumnIfNotExists('users', 'warning_count', "INT DEFAULT 0 AFTER ban_reason");
        await addColumnIfNotExists('users', 'last_warning', "TEXT NULL AFTER warning_count");
        await addColumnIfNotExists('users', 'last_warning_at', "DATETIME NULL AFTER last_warning");

        // 3. Create farmer_reports table for customer complaints
        await pool.query(`
            CREATE TABLE IF NOT EXISTS farmer_reports (
                id INT PRIMARY KEY AUTO_INCREMENT,
                reporter_id INT NOT NULL,
                farmer_id INT NOT NULL,
                order_id INT NULL,
                reason VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                evidence_image VARCHAR(255) NULL,
                status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
                admin_action ENUM('none', 'warned', 'suspended', 'banned', 'dismissed') DEFAULT 'none',
                admin_notes TEXT NULL,
                action_taken_at DATETIME NULL,
                action_taken_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
                FOREIGN KEY (action_taken_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_reporter (reporter_id),
                INDEX idx_farmer (farmer_id),
                INDEX idx_status (status)
            )
        `);
        console.log('3. farmer_reports table created/verified');

        // 4. Create admin_action_logs table for audit trail
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_action_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                admin_id INT NOT NULL,
                target_user_id INT NOT NULL,
                report_id INT NULL,
                action_type ENUM('warn', 'suspend', 'ban', 'unsuspend', 'unban', 'dismiss_report') NOT NULL,
                days INT NULL,
                reason TEXT NOT NULL,
                details JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (report_id) REFERENCES farmer_reports(id) ON DELETE SET NULL,
                INDEX idx_target_user (target_user_id),
                INDEX idx_action_type (action_type)
            )
        `);
        console.log('4. admin_action_logs table created/verified');

        // 5. Seed or update default Admin user (admin@freshfield.com / admin123)
        const [existingAdmin] = await pool.query("SELECT id FROM users WHERE email = 'admin@freshfield.com'");
        const hashedPw = await bcrypt.hash('admin123', 10);

        if (existingAdmin.length === 0) {
            await pool.query(
                `INSERT INTO users (name, email, password, role, status, phone, address) 
                 VALUES ('System Administrator', 'admin@freshfield.com', ?, 'admin', 'active', '+91 98765 00000', 'HQ FreshField, Mumbai')`,
                [hashedPw]
            );
            console.log('5. Default Admin created: admin@freshfield.com / admin123');
        } else {
            await pool.query(
                "UPDATE users SET role = 'admin', status = 'active', password = ? WHERE email = 'admin@freshfield.com'",
                [hashedPw]
            );
            console.log('5. Default Admin updated with active role and admin123 password');
        }

        // 6. Ensure sample reports exist for demonstration if table is empty
        const [reportCount] = await pool.query('SELECT COUNT(*) as count FROM farmer_reports');
        if (reportCount[0].count === 0) {
            const [customers] = await pool.query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");
            const [farmers] = await pool.query("SELECT id FROM users WHERE role = 'farmer' LIMIT 1");
            if (customers.length > 0 && farmers.length > 0) {
                await pool.query(`
                    INSERT INTO farmer_reports (reporter_id, farmer_id, reason, description, status) 
                    VALUES 
                    (?, ?, 'Produce Quality Issue', 'The organic apples received had bruises and were significantly smaller than advertised.', 'pending'),
                    (?, ?, 'Delayed Shipment', 'Order was scheduled for next-day dispatch but delayed for 4 days without communication.', 'pending')
                `, [customers[0].id, farmers[0].id, customers[0].id, farmers[0].id]);
                console.log('6. Sample customer reports seeded for immediate dashboard viewing');
            }
        }

        console.log('\n✅ Admin migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateAdmin();
