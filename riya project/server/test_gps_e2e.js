const { pool } = require('./config/database');

const API_BASE = 'http://localhost:5000/api';

async function runE2ETest() {
    console.log('====================================================');
    console.log('STARTING COMPLETE END-TO-END & SECURITY GPS TEST');
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
        // STEP 1: Login as Customer
        const custLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'farmer@gmail.com', password: 'password123' })
        });
        const custLoginData = await custLoginRes.json();
        if (custLoginData.success && custLoginData.token) {
            customerToken = custLoginData.token;
            customerId = custLoginData.user.id;
            record('STEP 1: Login as Customer (farmer@gmail.com)', true, `Customer ID: ${customerId}`);
        } else {
            record('STEP 1: Login as Customer', false, custLoginData.message);
        }

        // STEP 2: Browse Products from MySQL
        const prodRes = await fetch(`${API_BASE}/products`);
        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
            testProductId = prodData.products[0].id;
            record('STEP 2: Browse actual products from MySQL', true, `Found ${prodData.products.length} products, selected ID: ${testProductId}`);
        } else {
            record('STEP 2: Browse actual products from MySQL', false, 'No products found');
        }

        // STEP 3: Open Product Detail
        const prodDetailRes = await fetch(`${API_BASE}/products/${testProductId}`);
        const prodDetailData = await prodDetailRes.json();
        if (prodDetailData.success && prodDetailData.product) {
            record('STEP 3: Open product detail', true, `Product: ${prodDetailData.product.name} (₹${prodDetailData.product.price})`);
        } else {
            record('STEP 3: Open product detail', false, 'Failed to fetch product detail');
        }

        // STEP 4, 5, 6: Add to cart, Checkout with address & Place Order
        const orderPayload = {
            items: [{ product_id: testProductId, quantity: 2, price: prodDetailData.product.price }],
            total_amount: prodDetailData.product.price * 2,
            shipping_address: 'Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001',
            destination_latitude: 18.5204,
            destination_longitude: 73.8567,
            payment_method: 'cod',
            notes: 'Leave at front security'
        };

        const placeOrderRes = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify(orderPayload)
        });
        const placeOrderData = await placeOrderRes.json();
        if (placeOrderData.success && placeOrderData.order) {
            testOrderId = placeOrderData.order.id;
            record('STEP 4-6: Checkout & Place Order in MySQL', true, `Order ID: ${testOrderId}, Number: ${placeOrderData.order.order_number}`);
        } else {
            record('STEP 4-6: Checkout & Place Order in MySQL', false, placeOrderData.message);
        }

        // STEP 7: Customer sees the order in My Orders
        const custOrdersRes = await fetch(`${API_BASE}/orders/customer/orders`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const custOrdersData = await custOrdersRes.json();
        const foundCustOrder = (custOrdersData.orders || []).some(o => o.id === testOrderId);
        record('STEP 7: Customer sees order in My Orders', foundCustOrder, `Total customer orders: ${custOrdersData.orders?.length}`);

        // STEP 8 & 9: Login as Farmer who owns the product
        const farmerLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'farmer1@gmail.com', password: 'password123' })
        });
        const farmerLoginData = await farmerLoginRes.json();
        if (farmerLoginData.success && farmerLoginData.token) {
            farmerToken = farmerLoginData.token;
            farmerId = farmerLoginData.user.id;
            record('STEP 8-9: Login as Farmer (farmer1@gmail.com)', true, `Farmer ID: ${farmerId}`);
        } else {
            record('STEP 8-9: Login as Farmer', false, farmerLoginData.message);
        }

        // STEP 10: Farmer sees the order
        const farmerOrdersRes = await fetch(`${API_BASE}/orders/farmer/orders`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        });
        const farmerOrdersData = await farmerOrdersRes.json();
        const foundFarmerOrder = (farmerOrdersData.orders || []).some(o => o.id === testOrderId);
        record('STEP 10: Farmer sees the customer order', foundFarmerOrder, `Farmer order count: ${farmerOrdersData.orders?.length}`);

        // STEP 11: Progress order through confirmed -> preparing -> ready
        await fetch(`${API_BASE}/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({ status: 'confirmed', note: 'Order confirmed by farm' })
        });
        await fetch(`${API_BASE}/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({ status: 'preparing', note: 'Produce harvested fresh' })
        });
        const readyRes = await fetch(`${API_BASE}/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({ status: 'ready', note: 'Packed and ready for dispatch' })
        });
        const readyData = await readyRes.json();
        record('STEP 11: Progress order (pending -> confirmed -> preparing -> ready)', readyData.success, `Current status: ${readyData.newStatus}`);

        // STEP 12, 13, 14: Assign Delivery Person & Generate Secure Tracking Link
        const assignRes = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${farmerToken}` },
            body: JSON.stringify({
                delivery_person_name: 'Suresh Patil',
                delivery_person_phone: '+91 98765 12345',
                vehicle_type: 'Motorcycle / Bike',
                vehicle_number: 'MH 12 AB 5678',
                notes: 'Careful with organic berries'
            })
        });
        const assignData = await assignRes.json();
        if (assignData.success && assignData.tracking_token) {
            trackingToken = assignData.tracking_token;
            record('STEP 12-14: Farmer Assigns Delivery & Generates Link', true, `Token: ${trackingToken.substring(0, 16)}... URL: ${assignData.tracking_url}`);
        } else {
            record('STEP 12-14: Farmer Assigns Delivery & Generates Link', false, assignData.message);
        }

        // STEP 15 & 16: Open delivery tracking link
        const trackPageRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}`);
        const trackPageData = await trackPageRes.json();
        if (trackPageData.success && trackPageData.assignment) {
            assignmentId = trackPageData.assignment.id;
            record('STEP 15-16: Delivery Tracking Webpage loads assignment', true, `Driver: ${trackPageData.assignment.delivery_person_name}, Customer: ${trackPageData.assignment.customer_name}`);
        } else {
            record('STEP 15-16: Delivery Tracking Webpage loads assignment', false, trackPageData.message);
        }

        // STEP 17 & 18: Start live location sharing
        const startGPSRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/start`, {
            method: 'POST'
        });
        const startGPSData = await startGPSRes.json();
        record('STEP 17-18: Start Live GPS Sharing session', startGPSData.success, startGPSData.message);

        // STEP 19: Push GPS coordinates to backend
        const gps1Res = await fetch(`${API_BASE}/delivery/track/${trackingToken}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: 18.5150,
                longitude: 73.8500,
                accuracy: 6.5,
                speed: 25.0,
                heading: 45.0
            })
        });
        const gps1Data = await gps1Res.json();
        record('STEP 19: Push initial GPS coordinates (18.5150, 73.8500)', gps1Data.success, gps1Data.message);

        // Verify location stored in MySQL
        const [dbLocs] = await pool.query(
            'SELECT * FROM delivery_locations WHERE delivery_assignment_id = ? ORDER BY recorded_at DESC',
            [assignmentId]
        );
        record('STEP 19b: Verify GPS location recorded in MySQL table delivery_locations', dbLocs.length > 0, `Recorded lat: ${dbLocs[0]?.latitude}, lng: ${dbLocs[0]?.longitude}`);

        // STEP 20: Farmer Live Tracking API receives coordinates
        const farmerLiveRes = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        });
        const farmerLiveData = await farmerLiveRes.json();
        const farmerHasLoc = farmerLiveData.success && farmerLiveData.location && parseFloat(farmerLiveData.location.latitude) === 18.5150;
        record('STEP 20: Farmer Live Tracking API receives live location', farmerHasLoc, `Farmer seen lat: ${farmerLiveData.location?.latitude}`);

        // STEP 21: Customer Live Tracking API receives coordinates
        const custLiveRes = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const custLiveData = await custLiveRes.json();
        const custHasLoc = custLiveData.success && custLiveData.location && parseFloat(custLiveData.location.latitude) === 18.5150;
        record('STEP 21: Customer Live Tracking API receives live location', custHasLoc, `Customer seen lat: ${custLiveData.location?.latitude}`);

        // STEP 22: Update GPS location (Driver moving towards destination)
        const gps2Res = await fetch(`${API_BASE}/delivery/track/${trackingToken}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: 18.5180,
                longitude: 73.8535,
                accuracy: 5.0,
                speed: 30.0,
                heading: 50.0
            })
        });
        const gps2Data = await gps2Res.json();

        // Update status: picked_up -> on_the_way
        await fetch(`${API_BASE}/delivery/track/${trackingToken}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'on_the_way' })
        });

        const custLive2Res = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const custLive2Data = await custLive2Res.json();
        const updatedLocSeen = custLive2Data.success && parseFloat(custLive2Data.location?.latitude) === 18.5180 && custLive2Data.order?.status === 'on_the_way';
        record('STEP 22: Live GPS movement & status update to on_the_way', updatedLocSeen, `New lat: ${custLive2Data.location?.latitude}, Order status: ${custLive2Data.order?.status}`);

        // STEP 23 & 24: Security Checks - Unauthorized Access Boundaries
        // Create another test customer user
        const otherCustRes = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer INVALID_OR_OTHER_TOKEN` }
        });
        record('STEP 23-24: Unauthorized/Unauthenticated query to /live endpoint is rejected (401/403)', otherCustRes.status === 401 || otherCustRes.status === 403, `Status: ${otherCustRes.status}`);

        // STEP 25: Verify invalid tracking token is rejected
        const invalidTokenRes = await fetch(`${API_BASE}/delivery/track/INVALID_RANDOM_FAKE_TOKEN_1234567890`);
        record('STEP 25: Invalid tracking token is rejected (404)', invalidTokenRes.status === 404, `Status: ${invalidTokenRes.status}`);

        // STEP 26 & 27: Mark Delivery Completed
        const completeRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'delivered' })
        });
        const completeData = await completeRes.json();
        record('STEP 26: Complete delivery via tracking token', completeData.success, completeData.message);

        // Verify order status in DB
        const [finalOrderRows] = await pool.query('SELECT status FROM orders WHERE id = ?', [testOrderId]);
        const [finalAssignRows] = await pool.query('SELECT status, tracking_active, delivery_completed_at FROM delivery_assignments WHERE id = ?', [assignmentId]);
        const isDeliveredDb = finalOrderRows[0]?.status === 'delivered' &&
                              finalAssignRows[0]?.status === 'delivered' &&
                              finalAssignRows[0]?.tracking_active === 0 &&
                              finalAssignRows[0]?.delivery_completed_at !== null;
        record('STEP 27: Verify order status = delivered, tracking_active = 0, delivery_completed_at saved in MySQL', isDeliveredDb, `Order status: ${finalOrderRows[0]?.status}, Assignment status: ${finalAssignRows[0]?.status}`);

        // STEP 28: Refresh & Persistence check
        const postDeliverLiveRes = await fetch(`${API_BASE}/delivery/orders/${testOrderId}/live`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const postDeliverData = await postDeliverLiveRes.json();
        const postDeliverValid = postDeliverData.success && postDeliverData.order?.status === 'delivered' && postDeliverData.assignment?.tracking_active === false;
        record('STEP 28: Post-delivery live query confirms completed state persists', postDeliverValid, `Status: ${postDeliverData.order?.status}`);

        // PHASE 10: Security Test - Closed tracking rejects new GPS
        const lateGPSRes = await fetch(`${API_BASE}/delivery/track/${trackingToken}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: 18.5200, longitude: 73.8550 })
        });
        record('PHASE 10.1: Completed delivery tracking rejects new GPS location updates (400)', lateGPSRes.status === 400, `Status: ${lateGPSRes.status}`);

        // PHASE 10.2: Role constraints - Only Customer & Farmer roles exist
        const [rolesCheck] = await pool.query("SELECT DISTINCT role FROM users WHERE role NOT IN ('customer', 'farmer')");
        record('PHASE 10.2: Database contains ONLY customer and farmer roles (No admin role)', rolesCheck.length === 0, `Non-standard roles count: ${rolesCheck.length}`);

        // PHASE 10.3: Verify /api/admin is 404
        const adminRouteRes = await fetch(`${API_BASE}/admin`);
        record('PHASE 10.3: No admin API routes exist (Returns 404)', adminRouteRes.status === 404, `Status: ${adminRouteRes.status}`);

        console.log('\n====================================================');
        console.log(`TEST SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} CHECKS PASSED`);
        console.log('====================================================');

        process.exit(results.every(r => r.passed) ? 0 : 1);
    } catch (e) {
        console.error('Test execution error:', e);
        process.exit(1);
    }
}

runE2ETest();
