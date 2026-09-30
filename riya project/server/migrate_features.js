/**
 * Migration: Add messaging, product requests, price rules, and product browsing support
 * Run: node server/migrate_features.js
 */
const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

async function addColumnIfNotExists(table, colName, colDefinition) {
    const [cols] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [colName]);
    if (cols.length === 0) {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${colName} ${colDefinition}`);
        console.log(`  + Added column ${colName} to ${table}`);
    } else {
        console.log(`  - Column ${colName} already exists on ${table}`);
    }
}

async function migrate() {
    try {
        console.log('\n=== FreshField Feature Migration ===\n');

        // ─────────────────────────────────────────────────────────────────
        // 1. MESSAGES / CONVERSATIONS
        // ─────────────────────────────────────────────────────────────────
        console.log('1. Creating conversations table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                customer_id INT NOT NULL,
                farmer_id INT NOT NULL,
                product_id INT NULL COMMENT 'Product being discussed/bargained',
                subject VARCHAR(255) DEFAULT 'Product Inquiry',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
                UNIQUE KEY unique_conv (customer_id, farmer_id, product_id),
                INDEX idx_customer (customer_id),
                INDEX idx_farmer (farmer_id),
                INDEX idx_product (product_id)
            )
        `);
        console.log('  ✓ conversations table ready');

        console.log('2. Creating messages table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                conversation_id INT NOT NULL,
                sender_id INT NOT NULL,
                sender_role ENUM('customer', 'farmer') NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_conversation (conversation_id),
                INDEX idx_sender (sender_id),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('  ✓ messages table ready');

        // ─────────────────────────────────────────────────────────────────
        // 2. PRODUCT PRICE RULES
        // ─────────────────────────────────────────────────────────────────
        console.log('3. Creating product_price_rules table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_price_rules (
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_name VARCHAR(100) NOT NULL COMMENT 'Lowercase normalized product name',
                display_name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                unit VARCHAR(20) DEFAULT 'kg',
                min_price DECIMAL(10,2) NOT NULL,
                max_price DECIMAL(10,2) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_product_name (product_name),
                INDEX idx_active (is_active)
            )
        `);
        console.log('  ✓ product_price_rules table ready');

        // Seed price rules for common products
        const priceRules = [
            ['potato',        'Potato',           'Vegetables',          'kg',    15.00,  25.00],
            ['tomato',        'Tomato',            'Vegetables',          'kg',    20.00,  60.00],
            ['onion',         'Onion',             'Vegetables',          'kg',    15.00,  40.00],
            ['cauliflower',   'Cauliflower',       'Vegetables',          'piece', 20.00,  60.00],
            ['spinach',       'Spinach',           'Leafy Greens',        'bunch', 10.00,  30.00],
            ['carrot',        'Carrot',            'Vegetables',          'kg',    25.00,  60.00],
            ['bhindi',        'Bhindi (Okra)',     'Vegetables',          'kg',    30.00,  60.00],
            ['lauki',         'Lauki (Bottle Gourd)','Vegetables',        'kg',    15.00,  35.00],
            ['karela',        'Karela (Bitter Gourd)','Vegetables',       'kg',    25.00,  55.00],
            ['methi',         'Methi (Fenugreek)', 'Leafy Greens',        'bunch', 10.00,  30.00],
            ['apple',         'Apple',             'Fruits',              'kg',    80.00, 250.00],
            ['mango',         'Mango',             'Fruits',              'dozen', 150.00, 600.00],
            ['banana',        'Banana',            'Fruits',              'dozen', 25.00,  80.00],
            ['strawberry',    'Strawberry',        'Fruits',              'kg',    80.00, 300.00],
            ['coconut',       'Coconut',           'Fruits',              'piece', 25.00,  70.00],
            ['rice',          'Rice',              'Grains',              'kg',    40.00, 120.00],
            ['wheat',         'Wheat',             'Grains',              'kg',    25.00,  60.00],
            ['moong dal',     'Moong Dal',         'Pulses',              'kg',    80.00, 150.00],
            ['groundnut',     'Groundnut',         'Nuts & Seeds',        'kg',    60.00, 130.00],
            ['jaggery',       'Jaggery (Gur)',     'Natural Sweeteners',  'kg',    50.00, 120.00],
            ['ghee',          'Ghee',              'Dairy',               'litre', 400.00, 900.00],
            ['groundnut oil', 'Groundnut Oil',     'Oils',                'litre', 150.00, 350.00],
            ['turmeric',      'Turmeric',          'Spices',              'kg',    80.00, 200.00],
            ['coriander',     'Coriander',         'Herbs',               'bunch',  8.00,  30.00],
            ['drumstick',     'Drumstick (Moringa)','Vegetables',         'kg',    30.00,  80.00]
        ];

        for (const rule of priceRules) {
            const [existing] = await pool.query('SELECT id FROM product_price_rules WHERE product_name = ?', [rule[0]]);
            if (existing.length === 0) {
                await pool.query(
                    'INSERT INTO product_price_rules (product_name, display_name, category, unit, min_price, max_price) VALUES (?, ?, ?, ?, ?, ?)',
                    rule
                );
                console.log(`  + Price rule: ${rule[1]} ₹${rule[4]}-₹${rule[5]}/${rule[3]}`);
            }
        }
        console.log('  ✓ Product price rules seeded');

        // ─────────────────────────────────────────────────────────────────
        // 3. PRODUCT REQUESTS (Farmer → Admin approval)
        // ─────────────────────────────────────────────────────────────────
        console.log('4. Creating product_requests table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                farmer_id INT NOT NULL,
                product_name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                suggested_min_price DECIMAL(10,2) NULL,
                suggested_max_price DECIMAL(10,2) NULL,
                unit VARCHAR(20) DEFAULT 'kg',
                reason TEXT COMMENT 'Why farmer wants to add this product',
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                admin_notes TEXT NULL,
                reviewed_by INT NULL,
                reviewed_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_farmer (farmer_id),
                INDEX idx_status (status)
            )
        `);
        console.log('  ✓ product_requests table ready');

        // ─────────────────────────────────────────────────────────────────
        // 4. APPROVED PRODUCT CATALOG (list of allowed products for Farmers)
        // ─────────────────────────────────────────────────────────────────
        console.log('5. Creating approved_product_catalog table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS approved_product_catalog (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                unit VARCHAR(20) DEFAULT 'kg',
                description TEXT,
                request_id INT NULL COMMENT 'Source product_request if approved from request',
                approved_by INT NULL,
                approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES product_requests(id) ON DELETE SET NULL,
                FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
                UNIQUE KEY unique_catalog_name (name),
                INDEX idx_category (category),
                INDEX idx_active (is_active)
            )
        `);
        console.log('  ✓ approved_product_catalog table ready');

        // Seed approved catalog with common Indian farm products
        const catalogProducts = [
            ['Potato',              'Vegetables',          'kg',    'Fresh potatoes'],
            ['Tomato',              'Vegetables',          'kg',    'Fresh vine tomatoes'],
            ['Onion',               'Vegetables',          'kg',    'Fresh onions'],
            ['Cauliflower',         'Vegetables',          'piece', 'Fresh cauliflower head'],
            ['Spinach',             'Leafy Greens',        'bunch', 'Fresh spinach leaves'],
            ['Carrot',              'Vegetables',          'kg',    'Fresh carrots'],
            ['Bhindi (Okra)',       'Vegetables',          'kg',    'Fresh okra/bhindi'],
            ['Lauki (Bottle Gourd)','Vegetables',          'kg',    'Fresh bottle gourd'],
            ['Karela (Bitter Gourd)','Vegetables',         'kg',    'Fresh bitter gourd'],
            ['Methi (Fenugreek)',   'Leafy Greens',        'bunch', 'Fresh fenugreek leaves'],
            ['Apple',               'Fruits',              'kg',    'Fresh apples'],
            ['Mango',               'Fruits',              'dozen', 'Fresh mangoes'],
            ['Banana',              'Fruits',              'dozen', 'Fresh bananas'],
            ['Strawberry',          'Fruits',              'kg',    'Fresh strawberries'],
            ['Coconut',             'Fruits',              'piece', 'Fresh coconut'],
            ['Organic Basmati Rice','Grains',              'kg',    'Premium basmati rice'],
            ['Wheat',               'Grains',              'kg',    'Whole wheat grain'],
            ['Organic Moong Dal',   'Pulses',              'kg',    'Split moong lentils'],
            ['Organic Groundnuts',  'Nuts & Seeds',        'kg',    'Raw groundnuts'],
            ['Raw Sugarcane Jaggery','Natural Sweeteners', 'kg',    'Natural jaggery/gur'],
            ['Desi Cow Ghee',       'Dairy',               'litre', 'Pure A2 desi ghee'],
            ['Cold-Pressed Groundnut Oil','Oils',          'litre', 'Kachi ghani groundnut oil'],
            ['Farm Fresh Turmeric', 'Spices',              'kg',    'Fresh turmeric rhizomes'],
            ['Fresh Green Coriander','Herbs',              'bunch', 'Fresh coriander/dhania'],
            ['Fresh Drumstick',     'Vegetables',          'kg',    'Moringa/drumstick pods'],
            ['Bell Pepper',         'Vegetables',          'kg',    'Fresh bell peppers'],
            ['Brinjal (Eggplant)',  'Vegetables',          'kg',    'Fresh brinjal/eggplant'],
            ['Cabbage',             'Vegetables',          'piece', 'Fresh cabbage head'],
            ['Peas',                'Vegetables',          'kg',    'Fresh green peas'],
            ['Garlic',              'Spices',              'kg',    'Fresh garlic bulbs'],
            ['Ginger',              'Spices',              'kg',    'Fresh ginger root'],
            ['Lemon',               'Fruits',              'dozen', 'Fresh lemons'],
            ['Papaya',              'Fruits',              'kg',    'Fresh papaya'],
            ['Guava',               'Fruits',              'kg',    'Fresh guava'],
            ['Pomegranate',         'Fruits',              'kg',    'Fresh pomegranate'],
        ];

        for (const [name, category, unit, description] of catalogProducts) {
            const [existing] = await pool.query('SELECT id FROM approved_product_catalog WHERE name = ?', [name]);
            if (existing.length === 0) {
                await pool.query(
                    'INSERT INTO approved_product_catalog (name, category, unit, description, approved_by) VALUES (?, ?, ?, ?, ?)',
                    [name, category, unit, description, null]
                );
            }
        }
        console.log('  ✓ Approved product catalog seeded with', catalogProducts.length, 'products');

        console.log('\n✅ All migrations completed successfully!\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

migrate();
