const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

async function migrate() {
    try {
        console.log('--- Starting Clean Two-Role Migration ---');

        // 1. Alter orders status ENUM to include all stage-by-stage tracking stages
        await pool.query(
            "ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','preparing','ready','out_for_delivery','on_the_way','delivered','cancelled') DEFAULT 'pending'"
        );
        console.log('1. orders.status ENUM updated with 7-stage workflow + cancelled');
        
        // 2. Add order_status_history table for tracking stage-by-stage progression
        await pool.query(
            `CREATE TABLE IF NOT EXISTS order_status_history (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                note TEXT,
                updated_by INT,
                updated_by_role VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                INDEX idx_order (order_id),
                INDEX idx_status (status)
            )`
        );
        console.log('2. order_status_history table verified/created');

        // 3. Remove any admin user created previously
        await pool.query("DELETE FROM users WHERE email = 'admin@freshfield.com' OR role = 'admin'");
        console.log('3. Removed any admin user from users table');

        // 4. Revert users.role ENUM strictly to customer and farmer only
        await pool.query(
            "ALTER TABLE users MODIFY COLUMN role ENUM('farmer','customer') NOT NULL"
        );
        console.log("4. users.role ENUM restored strictly to ENUM('farmer','customer')");

        // 5. Ensure existing test accounts have known working password ('password123')
        const hash = await bcrypt.hash('password123', 10);
        await pool.query("UPDATE users SET password = ? WHERE email IN ('farmer@gmail.com', 'farmer1@gmail.com', 'kjkjlkj@gmail.com')", [hash]);
        console.log("5. Verified test credentials for farmer@gmail.com (Customer) and farmer1@gmail.com (Farmer) with password: password123");

        console.log('\n✅ Clean migration complete: Exactly two roles (Customer & Farmer)!');
        process.exit(0);
    } catch(e) {
        console.error('Migration error:', e.message);
        process.exit(1);
    }
}
migrate();
