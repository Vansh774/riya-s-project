const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

async function ensureCredentials() {
  const hashPass = await bcrypt.hash('password123', 10);
  const hashAdmin = await bcrypt.hash('admin123', 10);

  // 1. Ensure Customer
  await pool.query(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (8, 'Fresh Customer', 'freshcustomer@freshfield.test', ?, 'customer', 'active')
    ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      status = 'active',
      role = 'customer'
  `, [hashPass]);

  // 2. Ensure Farmer
  await pool.query(`
    INSERT INTO users (id, name, email, password, role, status, is_verified, farmer_id, kisan_card_number, farm_name, farm_location)
    VALUES (9, 'Fresh Farmer', 'freshfarmer@freshfield.test', ?, 'farmer', 'active', 1, 'FID-2024-8841', 'KCC-8841-3920', 'Organic Sun Farms', 'Nashik, Maharashtra')
    ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      status = 'active',
      role = 'farmer',
      is_verified = 1,
      farmer_id = 'FID-2024-8841',
      kisan_card_number = 'KCC-8841-3920',
      farm_name = 'Organic Sun Farms',
      farm_location = 'Nashik, Maharashtra'
  `, [hashPass]);

  // 3. Ensure Admin
  await pool.query(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (15, 'System Administrator', 'admin@freshfield.com', ?, 'admin', 'active')
    ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      status = 'active',
      role = 'admin'
  `, [hashAdmin]);

  console.log('Test accounts verified and up to date.');
  process.exit(0);
}

ensureCredentials().catch(err => {
  console.error(err);
  process.exit(1);
});
