const { pool } = require('./config/database');

async function runMigration() {
    try {
        console.log('--- Running GPS Delivery Tracking Database Migration ---');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS delivery_assignments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL UNIQUE,
                farmer_id INT NOT NULL,
                delivery_person_name VARCHAR(100) NOT NULL,
                delivery_person_phone VARCHAR(20) NOT NULL,
                vehicle_type VARCHAR(50) NULL,
                vehicle_number VARCHAR(50) NULL,
                tracking_token VARCHAR(64) NOT NULL UNIQUE,
                tracking_active TINYINT(1) DEFAULT 0,
                status ENUM('assigned','picked_up','out_for_delivery','on_the_way','delivered') DEFAULT 'assigned',
                notes TEXT NULL,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                delivery_started_at TIMESTAMP NULL,
                delivery_completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id),
                INDEX idx_tracking_token (tracking_token),
                INDEX idx_farmer_id (farmer_id)
            )
        `);
        console.log('✅ delivery_assignments table created/verified');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS delivery_locations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                delivery_assignment_id INT NOT NULL,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                accuracy FLOAT NULL,
                speed FLOAT NULL,
                heading FLOAT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (delivery_assignment_id) REFERENCES delivery_assignments(id) ON DELETE CASCADE,
                INDEX idx_assignment_id (delivery_assignment_id),
                INDEX idx_recorded_at (recorded_at)
            )
        `);
        console.log('✅ delivery_locations table created/verified');

        // Non-destructive addition of destination lat/lng to orders table
        const [orderCols] = await pool.query('DESCRIBE orders');
        const colNames = orderCols.map(c => c.Field);
        if (!colNames.includes('destination_latitude')) {
            await pool.query('ALTER TABLE orders ADD COLUMN destination_latitude DECIMAL(10,8) NULL AFTER shipping_address');
            console.log('✅ orders.destination_latitude added');
        }
        if (!colNames.includes('destination_longitude')) {
            await pool.query('ALTER TABLE orders ADD COLUMN destination_longitude DECIMAL(11,8) NULL AFTER destination_latitude');
            console.log('✅ orders.destination_longitude added');
        }

        console.log('--- Migration Finished Successfully ---');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}
runMigration();
