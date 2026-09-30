const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000/api';

async function timeRequest(name, url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const duration = (performance.now() - start).toFixed(2);
    const size = JSON.stringify(data).length;
    return { name, duration: parseFloat(duration), size, status: res.status };
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    return { name, duration: parseFloat(duration), error: err.message, status: 'ERR' };
  }
}

async function runOptimizedBenchmark() {
  console.log('=== FRESHFIELD POST-OPTIMIZATION PERFORMANCE BENCHMARK ===');

  // 1. Customer Login & Optimized Initial APIs
  const custLoginStart = performance.now();
  const custAuthRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'freshcustomer@freshfield.test', password: 'password123' })
  });
  const custAuthData = await custAuthRes.json();
  const custLoginTime = (performance.now() - custLoginStart).toFixed(2);
  const custToken = custAuthData.token;
  const custHeaders = { Authorization: `Bearer ${custToken}` };

  console.log(`\n[Customer] Auth Request: ${custLoginTime} ms`);

  const custResults = [];
  // Progressive, non-blocking calls now performed by customer dashboard:
  custResults.push(await timeRequest('GET /users/wishlist', `${BASE_URL}/users/wishlist`, { headers: custHeaders }));
  custResults.push(await timeRequest('GET /features/unread-count', `${BASE_URL}/features/unread-count`, { headers: custHeaders }));
  custResults.push(await timeRequest('GET /products?available=true&limit=4', `${BASE_URL}/products?available=true&limit=4`, { headers: custHeaders }));

  console.table(custResults);
  const custTotalData = custResults.reduce((acc, r) => acc + (r.size || 0), 0);
  const custTotalTime = custResults.reduce((acc, r) => acc + r.duration, 0);
  console.log(`Customer total initial API data: ${(custTotalData / 1024).toFixed(2)} KB, total sequential API time: ${custTotalTime.toFixed(2)} ms`);

  // 2. Farmer Login & Optimized Initial APIs
  const farmerLoginStart = performance.now();
  const farmerAuthRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'freshfarmer@freshfield.test', password: 'password123' })
  });
  const farmerAuthData = await farmerAuthRes.json();
  const farmerLoginTime = (performance.now() - farmerLoginStart).toFixed(2);
  const farmerToken = farmerAuthData.token;
  const farmerHeaders = { Authorization: `Bearer ${farmerToken}` };

  console.log(`\n[Farmer] Auth Request: ${farmerLoginTime} ms`);

  const farmerResults = [];
  // Farmer dashboard only loads stats and unread-count on initial paint:
  farmerResults.push(await timeRequest('GET /orders/farmer/stats', `${BASE_URL}/orders/farmer/stats`, { headers: farmerHeaders }));
  farmerResults.push(await timeRequest('GET /features/unread-count', `${BASE_URL}/features/unread-count`, { headers: farmerHeaders }));

  console.table(farmerResults);
  const farmerTotalData = farmerResults.reduce((acc, r) => acc + (r.size || 0), 0);
  const farmerTotalTime = farmerResults.reduce((acc, r) => acc + r.duration, 0);
  console.log(`Farmer total initial API data: ${(farmerTotalData / 1024).toFixed(2)} KB, total sequential API time: ${farmerTotalTime.toFixed(2)} ms`);

  // 3. Admin Login & Optimized Initial APIs
  const adminLoginStart = performance.now();
  const adminAuthRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@freshfield.com', password: 'admin123' })
  });
  const adminAuthData = await adminAuthRes.json();
  const adminLoginTime = (performance.now() - adminLoginStart).toFixed(2);
  const adminToken = adminAuthData.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  console.log(`\n[Admin] Auth Request: ${adminLoginTime} ms`);

  const adminResults = [];
  // Admin dashboard now only loads stats & overview feed on initial paint:
  adminResults.push(await timeRequest('GET /admin/stats', `${BASE_URL}/admin/stats`, { headers: adminHeaders }));
  adminResults.push(await timeRequest('GET /admin/reports?status=pending&limit=3', `${BASE_URL}/admin/reports?status=pending&limit=3`, { headers: adminHeaders }));
  adminResults.push(await timeRequest('GET /features/admin/product-requests?status=pending', `${BASE_URL}/features/admin/product-requests?status=pending`, { headers: adminHeaders }));

  console.table(adminResults);
  const adminTotalData = adminResults.reduce((acc, r) => acc + (r.size || 0), 0);
  const adminTotalTime = adminResults.reduce((acc, r) => acc + r.duration, 0);
  console.log(`Admin total initial API data: ${(adminTotalData / 1024).toFixed(2)} KB, total sequential API time: ${adminTotalTime.toFixed(2)} ms`);
}

runOptimizedBenchmark().catch(console.error);
