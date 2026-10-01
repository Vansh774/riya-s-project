/**
 * Migration: Add bargaining / price negotiation support to FreshField
 * Safe, idempotent migration script.
 * Run: node server/migrate_negotiation.js
 */
const { pool } = require('./config/database');

async function addColumnIfNotExists(table, colName, colDefinition) {
    const [cols] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [colName]);
    if (cols.length === 0) {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${colName} ${colDefinition}`);
        console.log(`  + Added column ${colName} to ${table}`);
    } else {
        console.log(`  - Column ${colName} already exists on ${table}`);
    }
}

async function migrateNegotiation() {
    try {
        console.log('\n=== FreshField Price Negotiation Migration ===\n');

        // 1. Add negotiation fields to conversations table
        console.log('1. Updating conversations table...');
        await addColumnIfNotExists('conversations', 'negotiation_status', "ENUM('none', 'offer_made', 'countered', 'accepted', 'rejected', 'cancelled', 'expired') DEFAULT 'none' AFTER subject");
        await addColumnIfNotExists('conversations', 'agreed_price', "DECIMAL(10,2) NULL AFTER negotiation_status");
        await addColumnIfNotExists('conversations', 'agreed_at', "DATETIME NULL AFTER agreed_price");
        await addColumnIfNotExists('conversations', 'current_offer_price', "DECIMAL(10,2) NULL AFTER agreed_at");
        await addColumnIfNotExists('conversations', 'current_offer_by', "ENUM('customer', 'farmer') NULL AFTER current_offer_price");
        await addColumnIfNotExists('conversations', 'offer_updated_at', "DATETIME NULL AFTER current_offer_by");
        await addColumnIfNotExists('conversations', 'expires_at', "DATETIME NULL AFTER offer_updated_at");
        console.log('  ✓ conversations table updated');

        // 2. Add message_type to messages table
        console.log('2. Updating messages table...');
        await addColumnIfNotExists('messages', 'message_type', "ENUM('text', 'offer', 'counter', 'accept', 'reject', 'system') DEFAULT 'text' AFTER message");
        console.log('  ✓ messages table updated');

        // 3. Create negotiation_offers history table
        console.log('3. Creating negotiation_offers table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS negotiation_offers (
                id INT PRIMARY KEY AUTO_INCREMENT,
                conversation_id INT NOT NULL,
                product_id INT NOT NULL,
                customer_id INT NOT NULL,
                farmer_id INT NOT NULL,
                offered_by ENUM('customer', 'farmer') NOT NULL,
                offer_price DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'countered', 'accepted', 'rejected', 'cancelled', 'expired') DEFAULT 'pending',
                notes VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                responded_at DATETIME NULL,
                expires_at DATETIME NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_conv (conversation_id),
                INDEX idx_product (product_id),
                INDEX idx_customer (customer_id),
                INDEX idx_farmer (farmer_id),
                INDEX idx_status (status)
            )
        `);
        console.log('  ✓ negotiation_offers table ready');

        // 4. Add is_negotiated to order_items table for clear record keeping
        console.log('4. Updating order_items table...');
        await addColumnIfNotExists('order_items', 'is_negotiated', "BOOLEAN DEFAULT FALSE AFTER total");
        console.log('  ✓ order_items table updated');

        console.log('\n✅ Negotiation migration completed successfully!\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Negotiation migration failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

migrateNegotiation();
