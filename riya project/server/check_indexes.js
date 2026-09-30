const { pool } = require('./config/database');

async function checkIndexes() {
  const tables = ['users', 'products', 'orders', 'order_items', 'conversations', 'messages', 'wishlist', 'product_requests', 'farmer_reports'];
  for (const t of tables) {
    try {
      const [rows] = await pool.query(`SHOW INDEX FROM ${t}`);
      console.log(`\nIndexes on ${t}:`);
      rows.forEach(r => console.log(`  - ${r.Key_name} on (${r.Column_name}) seq: ${r.Seq_in_index}`));
    } catch (err) {
      console.log(`Error checking ${t}: ${err.message}`);
    }
  }
  process.exit(0);
}

checkIndexes();
