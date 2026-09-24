const { pool } = require('./config/database');

const API_BASE = 'http://localhost:5000/api';

async function runWorkflowVerification() {
    console.log('====================================================');
    console.log('FINAL GPS WORKFLOW VERIFICATION TEST');
    console.log('====================================================\n');

    let customerToken = '';
    let customerId = null;
    let farmerToken = '';
    let farmerId = null;
    let testProductId = null;
    let testOrderId = null;
    let trackingToken = '';
    let assignmentId = null;

    const results = [];
    function record(stepName, passed, details = '') {
        results.push({ stepName, passed, details });
        const icon = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${icon}: ${stepName} ${details ? '(' + details + ')' : ''}`);
    }

    try {
        // 1. Login as Customer
        const custLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'farmer@gmail.com', password: 'password123' })
        });
        const custLoginData = await custLoginRes.json();
        customerToken = custLoginData.token;
        customerId = custLoginData.user.id;
        record('Customer Login', custLoginData.success, `Customer ID: ${customerId}`);

        // 2. Select product
        const prodRes = await fetch(`${API_BASE}/products`);
        const prodData = await prodRes.json();
        testProductId = prodData.products[0].id;
        const productPrice = prodData.products[0].price;

        // 3. Customer places order
        const placeOrderRes = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
            body: JSON.stringify({
                items: [{ product_id: testProductId, quantity: 1, price: productPrice }],
                total_amount: productPrice,
                shipping_address: '101 Farm Fresh Lane, Pune',
                destination_latitude: 18.5204,
                destination_longitude: 73.8567,
                payment_method: 'cod'
            })
        });
        const placeOrderData = await placeOrderRes.json();
        testOrderId = placeOrderData.order.id;
        record('Customer Places Order (Status: pending)', placeOrderData.order.status === 'pending', `Order ID: ${testOrderId}`);

        // 4. Farmer Login
        const farmerLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'farmer1@gmail.com', password: 'password123' })
        });
        const farmerLoginData = await farmerLoginRes.json();
        farmerToken = farmerLoginData.token;
        farmerId = farmerLoginData.user.id;
        record('Farmer Login', farmerLoginData.success, `Farmer ID: ${farmerId}`);

        // 5. Progress pending -> confirmed -> preparing -> ready
        await fetch(`${API_BASE}/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({ status: 'confirmed' })
        });
        await fetch(`${API_BASE}/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({ status: 'preparing' })
        });
        await fetch(`${API_BASE}/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({ status: 'ready' })
        });

        const [readyCheck] = await pool.query('SELECT status FROM orders WHERE id = ?', [testOrderId]);
        record('Farmer progresses order to READY', readyCheck[0]?.status === 'ready', `Order Status: ${readyCheck[0]?.status}`);

        // 6. Farmer assigns delivery person
        const assignRes = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({
                delivery_person_name: 'Rahul Sharma',
                delivery_person_phone: '+91 91234 56789',
                vehicle_type: 'Motorcycle / Bike',
                vehicle_number: 'MH 14 XY 9999',
                notes: 'Deliver fresh veggies'
            })
        });
        const assignData = await assignRes.json();
        trackingToken = assignData.tracking_token;

        // CRITICAL CHECK: Verify order status REMAINS ready after assignment
        const [postAssignCheck] = await pool.query('SELECT status FROM orders WHERE id = ?', [testOrderId]);
        const orderRemainsReady = postAssignCheck[0]?.status === 'ready';
        record('Assigning Delivery keeps order status as READY (No premature jump)', orderRemainsReady, `Current Status: ${postAssignCheck[0]?.status}`);

        // 7. Delivery driver opens tracking link
        const driverPageRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}`);
        const driverPageData = await driverPageRes.json();
        assignmentId = driverPageData.assignment.id;
        record('Delivery Driver opens secure tracking link via Token', driverPageData.success, `Driver: ${driverPageData.assignment.delivery_person_name}`);

        // 8. Driver starts GPS sharing
        const startGPS = await fetch(`${API_BASE}/delivery/track/${trackingToken}/start`, { method: 'POST' });
        const startGPSData = await startGPS.json();
        record('Driver starts live GPS sharing', startGPSData.success, startGPSData.message);

        // 9. Driver pushes GPS coordinates
        const locRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: 18.5160, longitude: 73.8510, accuracy: 5.0, speed: 20 })
        });
        const locData = await locRes.json();
        record('Driver sends live GPS coordinates', locData.success, locData.message);

        // 10. Driver clicks "Picked Up" -> order becomes out_for_delivery
        const pickupRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'picked_up' })
        });
        const pickupData = await pickupRes.json();
        const [pickupCheck] = await pool.query('SELECT status FROM orders WHERE id = ?', [testOrderId]);
        const isOutForDelivery = pickupCheck[0]?.status === 'out_for_delivery';
        record('Driver clicks Picked Up -> Order status becomes OUT_FOR_DELIVERY', isOutForDelivery, `Status: ${pickupCheck[0]?.status}`);

        // 11. Driver clicks "En Route" -> order becomes on_the_way
        const enrouteRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'on_the_way' })
        });
        const enrouteData = await enrouteRes.json();
        const [enrouteCheck] = await pool.query('SELECT status FROM orders WHERE id = ?', [testOrderId]);
        const isOnTheWay = enrouteCheck[0]?.status === 'on_the_way';
        record('Driver clicks En Route -> Order status becomes ON_THE_WAY', isOnTheWay, `Status: ${enrouteCheck[0]?.status}`);

        // 12. Both Farmer and Customer Live Map verify current coordinates and status
        const farmerLive = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        }).then(r => r.json());

        const custLive = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        }).then(r => r.json());

        const liveSynced = farmerLive.success && custLive.success &&
                           farmerLive.order.status === 'on_the_way' &&
                           custLive.order.status === 'on_the_way' &&
                           parseFloat(farmerLive.location.latitude) === 18.5160;
        record('Farmer and Customer live tracking maps synchronized with live GPS and status', liveSynced, `Status: ${custLive.order?.status}`);

        // 13. Driver clicks "Mark as Delivered" -> order becomes delivered
        const deliverRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'delivered' })
        });
        const deliverData = await deliverRes.json();
        const [deliverCheck] = await pool.query('SELECT status FROM orders WHERE id = ?', [testOrderId]);
        const [assignDeliverCheck] = await pool.query('SELECT status, tracking_active, delivery_completed_at FROM delivery_assignments WHERE id = ?', [assignmentId]);

        const isDelivered = deliverCheck[0]?.status === 'delivered' &&
                            assignDeliverCheck[0]?.status === 'delivered' &&
                            assignDeliverCheck[0]?.tracking_active === 0 &&
                            assignDeliverCheck[0]?.delivery_completed_at !== null;
        record('Driver clicks Mark as Delivered -> Order DELIVERED, tracking_active = 0, timestamp saved', isDelivered, `Order Status: ${deliverCheck[0]?.status}`);

        // 14. Post-delivery security check: GPS updates are rejected
        const postDeliverGPS = await fetch(`${API_BASE}/delivery/track/${trackingToken}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: 18.5200, longitude: 73.8550 })
        });
        record('Post-delivery GPS updates rejected (400)', postDeliverGPS.status === 400, `HTTP Code: ${postDeliverGPS.status}`);

        console.log('\n====================================================');
        console.log(`ALL VERIFICATION CHECKS: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
        console.log('====================================================');

        process.exit(results.every(r => r.passed) ? 0 : 1);
    } catch(e) {
        console.error('Verification error:', e);
        process.exit(1);
    }
}

runWorkflowVerification();
