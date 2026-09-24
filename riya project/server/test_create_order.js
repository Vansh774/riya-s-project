const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
    { id: 5, email: 'vijay@gmail.com', role: 'customer' },
    process.env.JWT_SECRET || 'your-default-secret-key-change-this',
    { expiresIn: '7d' }
);

async function testOrder() {
    const payload = {
        items: [
            { product_id: 1, quantity: 2 }
        ],
        shipping_address: '123 Test Street, Mumbai',
        payment_method: 'cash_on_delivery',
        notes: 'Phone: 9876543210'
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const status = res.status;
        const data = await res.json();
        console.log('Status code:', status);
        console.log('Response body:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
    process.exit(0);
}

testOrder();
