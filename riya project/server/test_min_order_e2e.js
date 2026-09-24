const http = require('http');
const { pool } = require('./config/database');

async function run() {
    console.log('========================================================');
    console.log('       MINIMUM ORDER THRESHOLD (₹600) E2E TEST          ');
    console.log('========================================================');

    // 1. Authenticate test customer
    console.log('\n[1] Authenticating customer...');
    const loginPayload = JSON.stringify({ email: 'freshcustomer@freshfield.test', password: 'password123' });
    const auth = await new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(loginPayload);
        req.end();
    });

    if (!auth.success || !auth.token) {
        throw new Error('Customer login failed: ' + JSON.stringify(auth));
    }
    const token = auth.token;
    console.log('  ✔ Customer authenticated successfully.');

    // 2. Check initial stock of available product
    const [pRows] = await pool.query('SELECT id, name, price, quantity FROM products WHERE is_available = 1 LIMIT 1');
    const prod = pRows[0];
    const initialQty = prod.quantity;
    console.log(`\n[2] Testing with Product #${prod.id} (${prod.name})`);
    console.log(`    Unit Price: ₹${prod.price} | Initial Stock: ${initialQty}`);

    // 3. Test Order with total < 600 INR (1 item)
    console.log(`\n[3] Testing Order Attempt BELOW ₹600 (1 item = ₹${prod.price})...`);
    const lowOrderPayload = JSON.stringify({
        items: [{ product_id: prod.id, quantity: 1 }],
        shipping_address: '123 Farm Road, Sector 5, Ahmedabad',
        payment_method: 'cash_on_delivery'
    });

    const lowOrderRes = await new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Content-Length': Buffer.byteLength(lowOrderPayload)
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(lowOrderPayload);
        req.end();
    });

    console.log(`    Response Status: ${lowOrderRes.status}`);
    console.log(`    Response Message: "${lowOrderRes.body.message}"`);

    if (lowOrderRes.status !== 400) {
        throw new Error(`Expected HTTP 400 but got ${lowOrderRes.status}`);
    }
    if (!lowOrderRes.body.message.includes('Cart must having 600 INR to buy')) {
        throw new Error(`Expected message to include 'Cart must having 600 INR to buy' but got '${lowOrderRes.body.message}'`);
    }
    console.log('  ✔ Sub-₹600 order successfully BLOCKED with exact required message.');

    // 4. Verify stock was NOT deducted during rollback
    const [pAfter] = await pool.query('SELECT quantity FROM products WHERE id = ?', [prod.id]);
    if (pAfter[0].quantity !== initialQty) {
        throw new Error(`Stock changed from ${initialQty} to ${pAfter[0].quantity} despite rejected order!`);
    }
    console.log(`  ✔ Verified inventory untouched: stock remains ${pAfter[0].quantity}.`);

    // 5. Test Order with total >= 600 INR
    const validQty = Math.ceil(700 / parseFloat(prod.price));
    const validTotal = (validQty * parseFloat(prod.price)).toFixed(2);
    console.log(`\n[5] Testing Order Attempt AT OR ABOVE ₹600 (${validQty} items = ₹${validTotal})...`);
    const validOrderPayload = JSON.stringify({
        items: [{ product_id: prod.id, quantity: validQty }],
        shipping_address: '123 Farm Road, Sector 5, Ahmedabad',
        payment_method: 'cash_on_delivery'
    });

    const validOrderRes = await new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Content-Length': Buffer.byteLength(validOrderPayload)
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(validOrderPayload);
        req.end();
    });

    console.log(`    Response Status: ${validOrderRes.status}`);
    console.log(`    Order Number: ${validOrderRes.body.order?.order_number}`);
    console.log(`    Total Amount: ₹${validOrderRes.body.order?.total_amount}`);

    if (validOrderRes.status !== 201 || !validOrderRes.body.success) {
        throw new Error(`Expected HTTP 201 but got ${validOrderRes.status}: ${JSON.stringify(validOrderRes.body)}`);
    }
    console.log('  ✔ Order of ₹675 successfully PLACED!');

    console.log('\n========================================================');
    console.log('      ALL MINIMUM ORDER THRESHOLD TESTS PASSED 100%!     ');
    console.log('========================================================\n');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
