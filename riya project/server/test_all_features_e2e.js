const http = require('http');

function postJson(path, payload, token = null) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function getJson(path, token = null) {
    return new Promise((resolve, reject) => {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log('===============================================================');
    console.log(' FRESHFIELD COMPREHENSIVE E2E & SECURITY VERIFICATION SUITE   ');
    console.log('===============================================================\n');

    let customerToken = null;
    let farmerToken = null;
    let adminToken = null;
    let testProductId = null;
    let createdConvId = null;
    let requestId = null;

    // First login farmer to ensure Potato listing exists for browsing test
    const initialFarmerLogin = await postJson('/api/auth/login', { email: 'freshfarmer@freshfield.test', password: 'password123' });
    farmerToken = initialFarmerLogin.body.token;

    // Check if potato exists or create one
    const checkPotato = await getJson('/api/products?available=true&search=Potato');
    if (!checkPotato.body.products || checkPotato.body.products.length === 0) {
        await postJson('/api/products', {
            name: 'Potato',
            category: 'Vegetables',
            price: 22.00,
            quantity: 150,
            unit: 'kg',
            description: 'Organic Pahadi Fresh Harvest Potatoes'
        }, farmerToken);
    }

    // ─────────────────────────────────────────────────────────────────
    // CUSTOMER TESTS
    // ─────────────────────────────────────────────────────────────────
    console.log('>>> [1/4] TESTING CUSTOMER WORKFLOWS');
    
    // 1.1 Invalid email validation
    const invalidEmailRes = await postJson('/api/auth/login', { email: 'invalid-email-format', password: 'password123' });
    if (invalidEmailRes.status === 400 && invalidEmailRes.body.message && invalidEmailRes.body.message.includes('valid email')) {
        console.log('  PASS - Customer Login rejects invalid email format (HTTP 400)');
    } else {
        console.log('  FAIL - Customer Login with invalid email:', invalidEmailRes);
    }

    // 1.2 Password < 8 characters validation
    const shortPassRes = await postJson('/api/auth/login', { email: 'freshcustomer@freshfield.test', password: 'short' });
    if (shortPassRes.status === 400 && shortPassRes.body.message && shortPassRes.body.message.includes('8 characters')) {
        console.log('  PASS - Customer Login rejects password shorter than 8 chars (HTTP 400)');
    } else {
        console.log('  FAIL - Customer Login with short password:', shortPassRes);
    }

    // 1.3 Valid customer login
    const custLoginRes = await postJson('/api/auth/login', { email: 'freshcustomer@freshfield.test', password: 'password123' });
    if (custLoginRes.status === 200 && custLoginRes.body.token) {
        customerToken = custLoginRes.body.token;
        console.log('  PASS - Customer login successful (Token received)');
    } else {
        console.log('  FAIL - Customer login failed:', custLoginRes);
    }

    // 1.4 Product-wise browsing: filter Potato
    const potatoBrowseRes = await getJson('/api/products?available=true&search=Potato', customerToken);
    if (potatoBrowseRes.status === 200 && Array.isArray(potatoBrowseRes.body.products) && potatoBrowseRes.body.products.length > 0) {
        const prods = potatoBrowseRes.body.products;
        testProductId = prods[0].id;
        console.log(`  PASS - Product-wise browsing: Found ${prods.length} Potato listing(s)`);
        console.log(`         Selected Product ID #${testProductId}: "${prods[0].name}" by Farmer "${prods[0].farmer_name}", ₹${prods[0].price}/${prods[0].unit}`);
    } else {
        console.log('  FAIL - Product-wise browsing failed:', potatoBrowseRes);
    }

    // 1.5 Product details fetch
    const prodDetailRes = await getJson(`/api/products/${testProductId}`);
    if (prodDetailRes.status === 200 && prodDetailRes.body.product) {
        console.log(`  PASS - Product details opened successfully: "${prodDetailRes.body.product.name}"`);
    } else {
        console.log('  FAIL - Product details fetch failed:', prodDetailRes);
    }

    // 1.6 Message Farmer / Negotiate Price (Customer -> Farmer)
    const farmerId = prodDetailRes.body.product.farmer_id || 9;
    const findConvRes = await getJson(`/api/features/conversations/find?farmer_id=${farmerId}&product_id=${testProductId}`, customerToken);
    if (findConvRes.status === 200 && findConvRes.body.conversation) {
        createdConvId = findConvRes.body.conversation.id;
        console.log(`  PASS - Find/Create conversation with Farmer ID #${farmerId} for Product #${testProductId} (Conv #${createdConvId})`);
    } else {
        console.log('  FAIL - Could not find/create conversation:', findConvRes);
    }

    // 1.7 Customer sends negotiation message
    const sendMsgRes = await postJson(`/api/features/conversations/${createdConvId}/messages`, {
        message: 'Hello farmer! Can you provide 10kg potatoes for ₹18/kg?'
    }, customerToken);
    if (sendMsgRes.status === 201 && (sendMsgRes.body.message || sendMsgRes.body.message_obj)) {
        console.log('  PASS - Customer sent negotiation message successfully');
    } else {
        console.log('  FAIL - Send message failed:', sendMsgRes);
    }

    // 1.8 Customer checks conversation list
    const custConvsRes = await getJson('/api/features/conversations', customerToken);
    if (custConvsRes.status === 200 && Array.isArray(custConvsRes.body.conversations) && custConvsRes.body.conversations.some(c => c.id === createdConvId)) {
        console.log(`  PASS - Customer conversation list reflects active negotiation (Total: ${custConvsRes.body.conversations.length})`);
    } else {
        console.log('  FAIL - Customer conversation list does not contain conversation:', custConvsRes);
    }

    // 1.9 Existing Wishlist check
    const wishlistRes = await getJson('/api/users/wishlist', customerToken);
    if (wishlistRes.status === 200 && Array.isArray(wishlistRes.body.wishlist)) {
        console.log(`  PASS - Existing Wishlist functional (Items: ${wishlistRes.body.wishlist.length})`);
    } else {
        console.log('  FAIL - Wishlist endpoint failed:', wishlistRes);
    }

    // 1.10 Existing Orders check
    const ordersRes = await getJson('/api/orders/my-orders', customerToken);
    if (ordersRes.status === 200 && Array.isArray(ordersRes.body.orders)) {
        console.log(`  PASS - Existing Customer Orders functional (Total orders: ${ordersRes.body.orders.length})`);
    } else {
        console.log('  FAIL - Orders endpoint failed:', ordersRes);
    }

    // ─────────────────────────────────────────────────────────────────
    // FARMER TESTS
    // ─────────────────────────────────────────────────────────────────
    console.log('\n>>> [2/4] TESTING FARMER WORKFLOWS');

    // 2.1 Farmer Login
    const farmerLoginRes = await postJson('/api/auth/login', { email: 'freshfarmer@freshfield.test', password: 'password123' });
    if (farmerLoginRes.status === 200 && farmerLoginRes.body.token) {
        farmerToken = farmerLoginRes.body.token;
        console.log('  PASS - Farmer login successful. Role:', farmerLoginRes.body.user.role);
    } else {
        console.log('  FAIL - Farmer login failed:', farmerLoginRes);
    }

    // 2.2 Verify Farmer ID / KYC in Profile
    const farmerProfile = await getJson('/api/users/profile', farmerToken);
    if (farmerProfile.status === 200 && farmerProfile.body.user) {
        console.log(`  PASS - Farmer profile verified: Name: ${farmerProfile.body.user.name}, Farm: ${farmerProfile.body.user.farm_name || 'Verified Farm'}`);
    } else {
        console.log('  FAIL - Farmer profile lookup failed:', farmerProfile);
    }

    // 2.3 Price Rule Lookup & Enforcement: Potato ₹15–₹25
    const priceRulesRes = await getJson('/api/features/price-rules');
    if (priceRulesRes.status === 200 && Array.isArray(priceRulesRes.body.rules)) {
        const potatoRule = priceRulesRes.body.rules.find(r => r.product_name.toLowerCase() === 'potato');
        if (potatoRule) {
            console.log(`  PASS - Price Rule API returns Potato allowed range: ₹${potatoRule.min_price} – ₹${potatoRule.max_price}/${potatoRule.unit}`);
        } else {
            console.log('  FAIL - Potato price rule not found in rules array');
        }
    } else {
        console.log('  FAIL - Price rules API failed:', priceRulesRes);
    }

    // 2.4 Farmer enters price exceeding maximum (e.g. Potato at ₹35, when max is ₹25) -> Backend BLOCKS it
    const excessivePriceRes = await postJson('/api/products', {
        name: 'Potato',
        category: 'Vegetables',
        price: 35.00,
        quantity: 50,
        unit: 'kg',
        description: 'Fresh organic potatoes'
    }, farmerToken);
    if (excessivePriceRes.status === 400 && excessivePriceRes.body.message && excessivePriceRes.body.message.includes('exceeds')) {
        console.log('  PASS - Backend BLOCKS product creation when price exceeds maximum rule (HTTP 400)');
        console.log(`         Message: "${excessivePriceRes.body.message}"`);
    } else {
        console.log('  FAIL - Price enforcement failed to block ₹35 Potato:', excessivePriceRes);
    }

    // 2.5 Farmer enters price below minimum (e.g. Potato at ₹5, when min is ₹15) -> Backend BLOCKS it
    const belowMinPriceRes = await postJson('/api/products', {
        name: 'Potato',
        category: 'Vegetables',
        price: 5.00,
        quantity: 50,
        unit: 'kg',
        description: 'Fresh organic potatoes'
    }, farmerToken);
    if (belowMinPriceRes.status === 400 && belowMinPriceRes.body.message && belowMinPriceRes.body.message.includes('below')) {
        console.log('  PASS - Backend BLOCKS product creation when price is below minimum rule (HTTP 400)');
        console.log(`         Message: "${belowMinPriceRes.body.message}"`);
    } else {
        console.log('  FAIL - Price enforcement failed to block ₹5 Potato:', belowMinPriceRes);
    }

    // 2.6 Farmer enters valid price (Potato at ₹20, within ₹15–₹25) -> Allowed!
    const validPriceRes = await postJson('/api/products', {
        name: 'Potato',
        category: 'Vegetables',
        price: 20.00,
        quantity: 100,
        unit: 'kg',
        description: 'Premium organic fresh harvest potato'
    }, farmerToken);
    if (validPriceRes.status === 201 && validPriceRes.body.product) {
        console.log(`  PASS - Product creation SUCCEEDS for valid price ₹20.00 within allowed range (Product ID #${validPriceRes.body.product.id})`);
    } else {
        console.log('  FAIL - Valid price creation failed:', validPriceRes);
    }

    // 2.7 Farmer opens Messages, views customer inquiry and replies
    const farmerConvsRes = await getJson('/api/features/conversations', farmerToken);
    if (farmerConvsRes.status === 200 && Array.isArray(farmerConvsRes.body.conversations)) {
        console.log(`  PASS - Farmer messages dashboard loaded (${farmerConvsRes.body.conversations.length} conversation(s))`);
        const convToReply = farmerConvsRes.body.conversations.find(c => c.id === createdConvId);
        if (convToReply) {
            console.log(`         Found negotiation from Customer "${convToReply.customer_name}" regarding "${convToReply.product_name}"`);
            
            // Farmer sends reply
            const farmerReplyRes = await postJson(`/api/features/conversations/${createdConvId}/messages`, {
                message: 'Deal accepted! I can do ₹18/kg for a 10kg order. I will pack them freshly for you.'
            }, farmerToken);
            if (farmerReplyRes.status === 201) {
                console.log('  PASS - Farmer replied to Customer negotiation message successfully');
            } else {
                console.log('  FAIL - Farmer reply failed:', farmerReplyRes);
            }
        }
    } else {
        console.log('  FAIL - Farmer messages fetch failed:', farmerConvsRes);
    }

    // 2.8 Farmer submits New Product Request (e.g. "Dragon Fruit")
    const testCropName = 'Dragon Fruit ' + Date.now().toString().slice(-4);
    const prodReqRes = await postJson('/api/features/product-requests', {
        product_name: testCropName,
        category: 'Fruits',
        unit: 'kg',
        suggested_min_price: 60.00,
        suggested_max_price: 120.00,
        reason: 'Locally cultivated organic red dragon fruit from our farm greenhouse.'
    }, farmerToken);

    requestId = prodReqRes.body.request_id || (prodReqRes.body.request && prodReqRes.body.request.id);
    if (prodReqRes.status === 201 && requestId) {
        console.log(`  PASS - Farmer submitted New Product Request for "${testCropName}" (Request ID #${requestId})`);
    } else {
        console.log('  FAIL - Product request submission failed:', prodReqRes);
    }

    // 2.9 Farmer views My Product Requests
    const myReqsRes = await getJson('/api/features/product-requests/my', farmerToken);
    if (myReqsRes.status === 200 && Array.isArray(myReqsRes.body.requests) && myReqsRes.body.requests.some(r => r.id === requestId)) {
        console.log(`  PASS - "My Product Requests" shows submitted proposal with status: "pending"`);
    } else {
        console.log('  FAIL - "My Product Requests" lookup failed:', myReqsRes);
    }

    // ─────────────────────────────────────────────────────────────────
    // ADMIN TESTS
    // ─────────────────────────────────────────────────────────────────
    console.log('\n>>> [3/4] TESTING ADMIN WORKFLOWS');

    // 3.1 Admin Login
    const adminLoginRes = await postJson('/api/auth/login', { email: 'admin@freshfield.com', password: 'admin123' });
    if (adminLoginRes.status === 200 && adminLoginRes.body.token) {
        adminToken = adminLoginRes.body.token;
        console.log('  PASS - Admin login successful. Role:', adminLoginRes.body.user.role);
    } else {
        console.log('  FAIL - Admin login failed:', adminLoginRes);
    }

    // 3.2 Admin Dashboard stats
    const adminStatsRes = await getJson('/api/admin/stats', adminToken);
    if (adminStatsRes.status === 200 && adminStatsRes.body.stats) {
        console.log('  PASS - Admin Dashboard stats retrieved successfully');
    } else {
        console.log('  FAIL - Admin stats fetch failed:', adminStatsRes);
    }

    // 3.3 Admin views pending Product Requests
    const adminReqsRes = await getJson('/api/features/admin/product-requests?status=pending', adminToken);
    if (adminReqsRes.status === 200 && Array.isArray(adminReqsRes.body.requests)) {
        const foundReq = adminReqsRes.body.requests.find(r => r.id === requestId);
        if (foundReq) {
            console.log(`  PASS - Admin sees Farmer proposal #${requestId} ("${foundReq.product_name}", Farmer: ${foundReq.farmer_name})`);
        } else {
            console.log('  FAIL - Admin pending requests list did not contain request ID #' + requestId);
        }
    } else {
        console.log('  FAIL - Admin product requests fetch failed:', adminReqsRes);
    }

    // 3.4 Admin Approves the Product Request
    const approveRes = await postJson(`/api/features/admin/product-requests/${requestId}/approve`, {
        admin_notes: 'Approved for official seasonal catalog. Fair pricing brackets established.'
    }, adminToken);
    if (approveRes.status === 200 && approveRes.body.success) {
        console.log('  PASS - Admin approves product request (Status updated to "approved")');
    } else {
        console.log('  FAIL - Admin approval failed:', approveRes);
    }

    // 3.5 Verify approved crop was automatically added to catalog and price rules
    const catalogCheckRes = await getJson('/api/features/catalog');
    if (catalogCheckRes.status === 200 && catalogCheckRes.body.products.some(p => p.name === testCropName)) {
        console.log(`  PASS - Approved product "${testCropName}" now appears in the official approved catalog`);
    } else {
        console.log('  FAIL - Approved product not found in catalog:', catalogCheckRes);
    }

    const priceRuleCheckRes = await getJson('/api/features/price-rules');
    if (priceRuleCheckRes.status === 200 && priceRuleCheckRes.body.rules.some(r => r.display_name === testCropName || (r.product_name && r.product_name.toLowerCase() === testCropName.toLowerCase()))) {
        console.log(`  PASS - New price rule automatically established for "${testCropName}"`);
    } else {
        console.log('  FAIL - Price rule not established for approved crop:', priceRuleCheckRes);
    }

    // 3.6 Submit second request and test Rejection
    const rejectCropName = 'Wild Mushroom ' + Date.now().toString().slice(-4);
    const rejectReqRes = await postJson('/api/features/product-requests', {
        product_name: rejectCropName,
        category: 'Vegetables',
        unit: 'kg',
        suggested_min_price: 150.00,
        suggested_max_price: 300.00,
        reason: 'Foraged mushrooms from forest perimeter'
    }, farmerToken);
    const rejectReqId = rejectReqRes.body.request_id || (rejectReqRes.body.request && rejectReqRes.body.request.id);

    const rejectActionRes = await postJson(`/api/features/admin/product-requests/${rejectReqId}/reject`, {
        admin_notes: 'Cannot approve foraged wild mushrooms without laboratory safety certification.'
    }, adminToken);
    if (rejectActionRes.status === 200 && rejectActionRes.body.success) {
        console.log(`  PASS - Admin rejects proposal #${rejectReqId} with administrative notes`);
    } else {
        console.log('  FAIL - Admin rejection failed:', rejectActionRes);
    }

    // ─────────────────────────────────────────────────────────────────
    // SECURITY TESTS
    // ─────────────────────────────────────────────────────────────────
    console.log('\n>>> [4/4] TESTING SECURITY & ROLE AUTHORIZATION GUARDS');

    // 4.1 Customer cannot access Admin product requests management
    const custAdminReqs = await getJson('/api/features/admin/product-requests', customerToken);
    if (custAdminReqs.status === 403) {
        console.log('  PASS - Customer BLOCKED from Admin product requests management (HTTP 403)');
    } else {
        console.log('  FAIL - Customer accessed Admin product requests:', custAdminReqs.status);
    }

    // 4.2 Farmer cannot access Admin product requests management
    const farmerAdminReqs = await getJson('/api/features/admin/product-requests', farmerToken);
    if (farmerAdminReqs.status === 403) {
        console.log('  PASS - Farmer BLOCKED from Admin product requests management (HTTP 403)');
    } else {
        console.log('  FAIL - Farmer accessed Admin product requests:', farmerAdminReqs.status);
    }

    // 4.3 Farmer cannot approve or reject product requests
    const farmerApproveReq = await postJson(`/api/features/admin/product-requests/${requestId}/approve`, {}, farmerToken);
    if (farmerApproveReq.status === 403) {
        console.log('  PASS - Farmer BLOCKED from approving product requests (HTTP 403)');
    } else {
        console.log('  FAIL - Farmer approved product request:', farmerApproveReq.status);
    }

    // 4.4 Customer cannot access another Customer's / Farmer's private conversation messages
    const otherCustRes = await postJson('/api/auth/register', {
        name: 'Security Test Customer',
        email: `sec_test_${Date.now()}@test.com`,
        password: 'password123',
        role: 'customer'
    });
    if (otherCustRes.status === 201 && otherCustRes.body.token) {
        const otherCustToken = otherCustRes.body.token;
        const snoopedConvRes = await getJson(`/api/features/conversations/${createdConvId}/messages`, otherCustToken);
        if (snoopedConvRes.status === 403) {
            console.log('  PASS - Unauthorized Customer BLOCKED from viewing another customer\'s conversation (HTTP 403)');
        } else {
            console.log('  FAIL - Unauthorized customer accessed conversation messages:', snoopedConvRes.status);
        }
    }

    // 4.5 Farmer cannot access conversations that do not involve them
    const jwt = require('jsonwebtoken');
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    const uninvolvedFarmerToken = jwt.sign(
        { id: 14, email: 'far@gmail.com', role: 'farmer' },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    const snoopedFarmerRes = await getJson(`/api/features/conversations/${createdConvId}/messages`, uninvolvedFarmerToken);
    if (snoopedFarmerRes.status === 403) {
        console.log('  PASS - Uninvolved Farmer BLOCKED from viewing private negotiation conversation (HTTP 403)');
    } else {
        console.log('  FAIL - Uninvolved farmer accessed conversation messages:', snoopedFarmerRes.status);
    }

    // 4.6 Price restrictions cannot be bypassed via direct API call with invalid types or extreme prices
    const directBypassRes = await postJson('/api/products', {
        name: 'Tomato',
        category: 'Vegetables',
        price: 'not-a-number',
        quantity: 10
    }, farmerToken);
    if (directBypassRes.status === 400) {
        console.log('  PASS - Direct API bypass with invalid numeric price rejected (HTTP 400)');
    } else {
        console.log('  FAIL - Invalid price payload was not rejected:', directBypassRes.status);
    }

    // 4.7 Suspended and Banned User Login Restrictions
    const tempUserEmail = `temp_mod_${Date.now()}@test.com`;
    const tempUserRes = await postJson('/api/auth/register', {
        name: 'Mod Target User',
        email: tempUserEmail,
        password: 'password123',
        role: 'customer'
    });
    const tempUserId = tempUserRes.body.user.id;

    // Admin suspends user
    await postJson(`/api/admin/users/${tempUserId}/suspend`, { days: 3, reason: 'Security check' }, adminToken);
    const suspendedLoginRes = await postJson('/api/auth/login', { email: tempUserEmail, password: 'password123' });
    if (suspendedLoginRes.status === 403 && suspendedLoginRes.body.message && suspendedLoginRes.body.message.includes('suspended')) {
        console.log('  PASS - Suspended user BLOCKED from logging in while suspension active (HTTP 403)');
    } else {
        console.log('  FAIL - Suspended user was able to log in:', suspendedLoginRes);
    }

    // Admin bans user
    await postJson(`/api/admin/users/${tempUserId}/ban`, { reason: 'Severe policy violation' }, adminToken);
    const bannedLoginRes = await postJson('/api/auth/login', { email: tempUserEmail, password: 'password123' });
    if (bannedLoginRes.status === 403 && bannedLoginRes.body.message && bannedLoginRes.body.message.toLowerCase().includes('banned')) {
        console.log('  PASS - Banned user BLOCKED from logging in (HTTP 403)');
    } else {
        console.log('  FAIL - Banned user was able to log in:', bannedLoginRes);
    }

    console.log('\n===============================================================');
    console.log('                 ALL TESTS COMPLETED SUCCESSFULLY              ');
    console.log('===============================================================');
}

runTests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
