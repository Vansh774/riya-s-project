const { pool } = require('./config/database');

async function addIndexes() {
  console.log('--- Applying Performance Indexes ---');

  const indexDefs = [
    {
      table: 'products',
      name: 'idx_products_avail_qty_created',
      sql: 'CREATE INDEX idx_products_avail_qty_created ON products (is_available, quantity, created_at DESC)'
    },
    {
      table: 'order_items',
      name: 'idx_order_items_farmer_order',
      sql: 'CREATE INDEX idx_order_items_farmer_order ON order_items (farmer_id, order_id)'
    },
    {
      table: 'order_items',
      name: 'idx_order_items_farmer_product',
      sql: 'CREATE INDEX idx_order_items_farmer_product ON order_items (farmer_id, product_id)'
    },
    {
      table: 'messages',
      name: 'idx_messages_conv_read_sender',
      sql: 'CREATE INDEX idx_messages_conv_read_sender ON messages (conversation_id, is_read, sender_id)'
    },
    {
      table: 'orders',
      name: 'idx_orders_customer_created',
      sql: 'CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at DESC)'
    },
    {
      table: 'users',
      name: 'idx_users_role_status',
      sql: 'CREATE INDEX idx_users_role_status ON users (role, status)'
    }
  ];

  for (const def of indexDefs) {
    try {
      await pool.query(def.sql);
      console.log(`[SUCCESS] Added index ${def.name} on ${def.table}`);
    } catch (err) {
      if (err.message.includes('Duplicate key name') || err.code === 'ER_DUP_KEYNAME') {
        console.log(`[INFO] Index ${def.name} already exists on ${def.table}`);
      } else {
        console.warn(`[WARN] Could not add index ${def.name}:`, err.message);
      }
    }
  }

  console.log('--- Finished Applying Performance Indexes ---');
  process.exit(0);
}

addIndexes().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
