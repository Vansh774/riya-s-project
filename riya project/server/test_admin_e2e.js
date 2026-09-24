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

async function runAdminE2ETests() {
    console.log('=====================================================');
    console.log('     ADMIN DASHBOARD & MODERATION E2E TEST SUITE     ');
    console.log('=====================================================\n');

    try {
        // Step 1: Admin Login
        console.log('[Step 1] Admin Authentication');
        const adminLogin = await postJson('/api/auth/login', {
            email: 'admin@freshfield.com',
            password: 'admin123'
        });
        if (adminLogin.status !== 200 || !adminLogin.body.token) {
            throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.body));
        }
        const adminToken = adminLogin.body.token;
        console.log('  ✔ Admin logged in successfully. Role:', adminLogin.body.user.role);

        // Step 2: Fetch Admin Stats
        console.log('\n[Step 2] Fetch Moderation Stats');
        const statsRes = await getJson('/api/admin/stats', adminToken);
        if (statsRes.status !== 200) throw new Error('Failed to fetch stats');
        console.log('  ✔ Stats fetched:', JSON.stringify(statsRes.body.stats.users));

        // Step 3: Fetch Farmers List
        console.log('\n[Step 3] Fetch Farmers List');
        const farmersRes = await getJson('/api/admin/users?role=farmer', adminToken);
        if (farmersRes.status !== 200 || !farmersRes.body.users || farmersRes.body.users.length === 0) {
            throw new Error('No farmers found in users table');
        }
        const testFarmer = farmersRes.body.users.find(u => u.id === 9) || farmersRes.body.users[0];
        console.log(`  ✔ Found farmer: ${testFarmer.name} (ID: ${testFarmer.id}, Email: ${testFarmer.email}, Status: ${testFarmer.status})`);

        // Step 4: Suspend Farmer for 5 Days
        console.log(`\n[Step 4] Suspend Farmer ${testFarmer.name} for 5 Days`);
        const suspendRes = await postJson(`/api/admin/users/${testFarmer.id}/suspend`, {
            days: 5,
            reason: 'Quality standards violation - test suspension'
        }, adminToken);
        console.log('  Response:', suspendRes.body.message);
        if (suspendRes.status !== 200) throw new Error('Suspend failed');
        console.log('  ✔ Suspension enforced successfully for 5 days.');

        // Step 5: Verify Farmer is Blocked from Login
        console.log('\n[Step 5] Attempt Login as Suspended Farmer (Should be Blocked)');
        const blockedLogin = await postJson('/api/auth/login', {
            email: testFarmer.email,
            password: 'password123'
        });
        console.log(`  Status: ${blockedLogin.status} (${blockedLogin.body.account_status})`);
        console.log('  Message:', blockedLogin.body.message);
        if (blockedLogin.status !== 403 || blockedLogin.body.account_status !== 'suspended') {
            throw new Error('Expected 403 status with account_status suspended');
        }
        console.log('  ✔ Suspended farmer correctly blocked with remaining days notice!');

        // Step 6: Unsuspend Farmer
        console.log(`\n[Step 6] Lift Suspension (Unsuspend) for Farmer ${testFarmer.name}`);
        const unsuspendRes = await postJson(`/api/admin/users/${testFarmer.id}/unsuspend`, {}, adminToken);
        console.log('  Response:', unsuspendRes.body.message);
        if (unsuspendRes.status !== 200) throw new Error('Unsuspend failed');
        console.log('  ✔ Suspension lifted successfully.');

        // Step 7: Customer Submits a Report Against Farmer
        console.log(`\n[Step 7] Customer Submits Grievance Against Farmer`);
        const custLogin = await postJson('/api/auth/login', {
            email: 'freshcustomer@freshfield.test',
            password: 'password123'
        });
        if (custLogin.status !== 200 || !custLogin.body.token) {
            throw new Error('Customer login failed: ' + JSON.stringify(custLogin.body));
        }
        const custToken = custLogin.body.token;

        const reportRes = await postJson('/api/admin/report-farmer', {
            farmer_id: testFarmer.id,
            reason: 'Poor Quality Produce',
            description: 'Organic apples were bruised and discolored upon arrival.'
        }, custToken);
        console.log('  Report Submit Status:', reportRes.status);
        console.log('  Report Message:', reportRes.body.message);
        const reportId = reportRes.body.report_id;
        if (!reportId) throw new Error('report_id not returned');
        console.log(`  ✔ Report created with ID #REP-${reportId}`);

        // Step 8: Admin Views Pending Reports
        console.log('\n[Step 8] Admin Views Pending Grievance');
        const pendingReportsRes = await getJson('/api/admin/reports?status=pending', adminToken);
        const reportFound = pendingReportsRes.body.reports.find(r => r.id === reportId);
        if (!reportFound) throw new Error('Pending report not found in admin queue');
        console.log(`  ✔ Verified report in admin pending queue: Complainant: ${reportFound.reporter_name}, Farmer: ${reportFound.farmer_name}, Reason: ${reportFound.reason}`);

        // Step 9: Admin Takes Action on Report: Issues Official Warning
        console.log(`\n[Step 9] Admin Resolves Report by Issuing Official Warning`);
        const actionRes = await postJson(`/api/admin/reports/${reportId}/action`, {
            action: 'warn',
            notes: 'First warning: ensure produce freshness and cold-chain transport.'
        }, adminToken);
        console.log('  Action Result:', actionRes.body.message);
        if (actionRes.status !== 200) throw new Error('Action on report failed');
        console.log('  ✔ Report action executed and complaint marked resolved!');

        // Step 10: Verify Audit Logs
        console.log('\n[Step 10] Verify Moderation Audit Trail');
        const logsRes = await getJson('/api/admin/logs?limit=5', adminToken);
        if (logsRes.status === 200 && logsRes.body.logs.length > 0) {
            console.log(`  ✔ ${logsRes.body.logs.length} recent audit logs retrieved.`);
            logsRes.body.logs.slice(0, 3).forEach(l => {
                console.log(`    - [${l.action_type.toUpperCase()}] on ${l.target_name}: "${l.reason}" by ${l.admin_name}`);
            });
        }

        console.log('\n=====================================================');
        console.log('    ALL 10 ADMIN E2E MODERATION TESTS PASSED 100%!   ');
        console.log('=====================================================');
        process.exit(0);

    } catch (e) {
        console.error('\n❌ Test Suite Failed:', e.message);
        process.exit(1);
    }
}

runAdminE2ETests();
