// FreshField Farmer & Admin Dashboard Logic
const farmer = {
    currentPage: 'dashboard',
    revenueChartInstance: null,
    donutChartInstance: null,
    editingProductId: null,

    init() {
        // Authenticate check
        const user = auth.getCurrentUser();
        if (user) {
            const name = user.name || 'Farmer';
            const firstName = name.split(' ')[0];
            const role = 'Verified Farmer';

            const greetingEl = document.getElementById('user-greeting');
            if (greetingEl) greetingEl.textContent = firstName;

            const headerNameEl = document.getElementById('header-user-name');
            if (headerNameEl) headerNameEl.textContent = name;

            const headerRoleEl = document.getElementById('header-user-role');
            if (headerRoleEl) {
                if (user.farmer_id) {
                    headerRoleEl.innerHTML = `<span style="color:#059669;font-weight:600;"><i class="fa-solid fa-circle-check"></i> Verified Farmer</span> <span style="font-size:11px;opacity:0.8;margin-left:4px;">(${user.farmer_id})</span>`;
                } else {
                    headerRoleEl.textContent = role;
                }
            }

            const avatarEl = document.getElementById('header-avatar');
            if (avatarEl) {
                if (user.profile_image) {
                    avatarEl.innerHTML = `<img src="${user.profile_image}" alt="${name}">`;
                } else {
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    avatarEl.innerHTML = `<span>${initials || 'AD'}</span>`;
                }
            }

            // Display official administrative warning if active
            const warningBanner = document.getElementById('farmer-warning-banner');
            const warningBadge = document.getElementById('farmer-warning-badge');
            const warningMsg = document.getElementById('farmer-warning-message');
            if (user.warning_count && user.warning_count > 0 && warningBanner) {
                warningBanner.style.display = 'flex';
                if (warningBadge) warningBadge.textContent = `Warning #${user.warning_count}`;
                if (warningMsg) warningMsg.textContent = user.last_warning || 'You have received an official warning from FreshField Administration regarding platform policies.';
            }
        }

        // Set current date
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        // Setup navigation
        this.setupNavigation();

        // Setup upload drag and drop areas
        this.setupUploadAreas();

        // Instant cache-first dashboard restore (0ms paint)
        this.restoreCachedDashboard();

        // Show default page
        this.showPage('dashboard');

        // Warm up and prefetch all tab data in background immediately
        setTimeout(() => this.preloadAllData(), 40);
    },

    restoreCachedDashboard() {
        try {
            const cached = sessionStorage.getItem('ff_farmer_stats');
            if (cached) {
                const data = JSON.parse(cached);
                this.applyStatsToDOM(data);
            }
        } catch(e) {}
    },

    async preloadAllData() {
        try {
            await Promise.all([
                this.fetchProductsInBackground(),
                this.fetchOrdersInBackground(),
                this.fetchReviewsInBackground()
            ]);
        } catch(e) {}
    },

    setupNavigation() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.showPage(page);
                    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    },

    showPage(page) {
        this.currentPage = page;
        
        // Update active class on sidebar navigation
        document.querySelectorAll('.sidebar-nav a').forEach(a => {
            a.classList.toggle('active', a.dataset.page === page);
        });

        // Hide all page contents
        document.querySelectorAll('.page-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });

        // Show target page
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // Trigger page-specific data fetch
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'categories':
                this.loadCategories();
                break;
            case 'reviews':
                this.loadReviews();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    },

    setupUploadAreas() {
        // Product image upload
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('product-image');
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    this.handleFilePreview(fileInput, 'upload-preview');
                }
            });
            fileInput.addEventListener('change', () => this.handleFilePreview(fileInput, 'upload-preview'));
        }

        // Profile image upload
        const profileUploadArea = document.getElementById('profile-upload-area');
        const profileInput = document.getElementById('profile-image');
        if (profileUploadArea && profileInput) {
            profileUploadArea.addEventListener('click', () => profileInput.click());
            profileInput.addEventListener('change', () => this.handleFilePreview(profileInput, 'profile-preview'));
        }
    },

    handleFilePreview(input, previewId = 'upload-preview') {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        preview.innerHTML = '';
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'upload-preview-img';
                preview.appendChild(img);
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    // ============================================
    // DASHBOARD OVERVIEW & CHARTS
    // ============================================
    async loadDashboard() {
        try {
            const res = await API.orders.getFarmerStats();
            if (res && res.success && res.stats) {
                const data = res.stats;
                sessionStorage.setItem('ff_farmer_stats', JSON.stringify(data));
                this.applyStatsToDOM(data);
                return;
            }
        } catch (error) {
            console.error('Failed to load farmer stats:', error);
        }

        if (!sessionStorage.getItem('ff_farmer_stats')) {
            this.renderRevenueChart([]);
            this.renderDonutChart({}, 0);
            this.renderTopProducts([]);
            this.renderRecentOrders([]);
            this.renderActivity({});
        }
    },

    applyStatsToDOM(data) {
        if (!data) return;
        const revEl = document.getElementById('stat-revenue');
        if (revEl) revEl.textContent = `₹${parseFloat(data.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const prodEl = document.getElementById('stat-products');
        if (prodEl) prodEl.textContent = (data.totalProducts ?? 0).toLocaleString();

        const pendingEl = document.getElementById('stat-pending');
        if (pendingEl) pendingEl.textContent = (data.pendingOrders ?? 0).toLocaleString();

        const ordEl = document.getElementById('stat-orders');
        if (ordEl) ordEl.textContent = (data.totalOrders ?? 0).toLocaleString();

        const badge = document.getElementById('pending-badge');
        if (badge) {
            badge.textContent = data.pendingOrders ?? 0;
            badge.style.display = (data.pendingOrders > 0) ? 'inline' : 'none';
        }

        // Render Charts with real-time data
        this.renderRevenueChart(data.salesByDate);
        this.renderDonutChart(data.ordersByStatus, data.totalOrders);

        // Render Top Products with real-time data
        this.renderTopProducts(data.topProducts);

        // Render Recent Orders with real-time data
        this.renderRecentOrders(data.recentOrders);

        // Render Activity Overview with real-time data
        this.renderActivity(data);
    },

    renderRevenueChart(salesByDate = []) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }

        let labels = [];
        let revenueData = [];
        let ordersData = [];

        if (Array.isArray(salesByDate) && salesByDate.length > 0) {
            labels = salesByDate.map(item => {
                const dateVal = item.order_date || item.date;
                const d = new Date(dateVal);
                return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            });
            revenueData = salesByDate.map(item => parseFloat(item.revenue || 0));
            ordersData = salesByDate.map(item => parseInt(item.orders_count || item.orders || 0));
        } else {
            labels = ['No Data'];
            revenueData = [0];
            ordersData = [0];
        }

        this.revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue (₹)',
                        data: revenueData,
                        borderColor: '#355C24',
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return 'rgba(53, 92, 36, 0.08)';
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(53, 92, 36, 0.25)');
                            gradient.addColorStop(1, 'rgba(53, 92, 36, 0.01)');
                            return gradient;
                        },
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#355C24',
                        pointBorderColor: '#FFF',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Orders',
                        data: ordersData,
                        borderColor: '#F28C28',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#F28C28',
                        pointBorderColor: '#FFF',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1F211B',
                        titleFont: { family: 'Poppins', size: 12, weight: '600' },
                        bodyFont: { family: 'Poppins', size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Poppins', size: 11 }, color: '#6F7168' }
                    },
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        grid: { color: '#EEE9DA', drawBorder: false },
                        ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: '#6F7168',
                            callback: (val) => (val >= 1000 ? (val/1000) + 'K' : '₹' + val)
                        }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        grid: { display: false },
                        ticks: {
                            precision: 0,
                            font: { family: 'Poppins', size: 11 },
                            color: '#6F7168'
                        }
                    }
                }
            }
        });
    },

    renderDonutChart(statusCounts = {}, totalOrders = 0) {
        const ctx = document.getElementById('user-distribution-chart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.donutChartInstance) {
            this.donutChartInstance.destroy();
        }

        const centerValEl = document.getElementById('donut-center-val');
        if (centerValEl) centerValEl.textContent = (totalOrders ?? 0).toLocaleString();

        const centerLblEl = document.getElementById('donut-center-lbl');
        if (centerLblEl) centerLblEl.textContent = 'Total Orders';

        const statusMap = {
            'pending': { label: 'Pending', color: '#F28C28' },
            'confirmed': { label: 'Confirmed', color: '#3B82F6' },
            'processing': { label: 'Processing', color: '#6366F1' },
            'shipped': { label: 'Shipped', color: '#8B5CF6' },
            'delivered': { label: 'Delivered', color: '#355C24' },
            'cancelled': { label: 'Cancelled', color: '#EF4444' }
        };

        const counts = {};
        if (Array.isArray(statusCounts)) {
            statusCounts.forEach(item => {
                if (item && item.status) counts[item.status] = item.count;
            });
        } else if (typeof statusCounts === 'object' && statusCounts !== null) {
            Object.assign(counts, statusCounts);
        }

        const labels = [];
        const data = [];
        const colors = [];

        Object.keys(statusMap).forEach(key => {
            const count = counts[key] || 0;
            if (count > 0 || totalOrders === 0) {
                labels.push(statusMap[key].label);
                data.push(count);
                colors.push(statusMap[key].color);
            }
        });

        if (totalOrders === 0 || data.every(v => v === 0)) {
            labels.length = 0;
            data.length = 0;
            colors.length = 0;
            labels.push('No Orders Yet');
            data.push(1);
            colors.push('#E5E7EB');
        }

        this.donutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: '#FFFDF8',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '76%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1F211B',
                        bodyFont: { family: 'Poppins', size: 12 },
                        padding: 8,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                if (totalOrders === 0) return ' No orders recorded';
                                return ` ${context.label}: ${context.raw} orders`;
                            }
                        }
                    }
                }
            }
        });
    },

    renderTopProducts(products = []) {
        const container = document.getElementById('top-products-container');
        if (!container) return;

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = `
                <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px;">
                    <i class="fas fa-leaf" style="font-size: 24px; color: var(--green-primary); margin-bottom: 8px; display: block; opacity: 0.6;"></i>
                    No product sales recorded yet.
                </div>`;
            return;
        }

        const maxSales = Math.max(...products.map(p => Number(p.total_sold ?? p.sales_count ?? 0)), 1);

        container.innerHTML = products.slice(0, 4).map((p, idx) => {
            let imgUrl = p.image_url || '';
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                imgUrl = `http://localhost:5000${imgUrl}`;
            }
            const fallback = 'assets/images/tomatoes.png';
            const salesCount = Number(p.total_sold ?? p.sales_count ?? 0);
            const revenue = parseFloat(p.total_revenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const fillPercent = Math.min(Math.round((salesCount / maxSales) * 100), 100);

            return `
                <div class="top-product-item">
                    <span class="product-rank">${idx + 1}</span>
                    <img src="${imgUrl || fallback}" class="product-thumb" alt="${p.name}" onerror="this.onerror=null;this.src='${fallback}';">
                    <div class="product-meta">
                        <div class="product-name-txt">${p.name}</div>
                        <div class="product-bar-wrap">
                            <div class="product-bar-fill" style="width:${Math.max(fillPercent, 12)}%;"></div>
                        </div>
                    </div>
                    <div>
                        <div class="product-sales-txt">${salesCount} Sales</div>
                        <div class="product-rev-txt">₹${revenue}</div>
                    </div>
                </div>`;
        }).join('');
    },

    renderRecentOrders(orders = []) {
        const container = document.getElementById('recent-orders-container');
        if (!container) return;

        if (!Array.isArray(orders) || orders.length === 0) {
            container.innerHTML = `
                <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px;">
                    <i class="fas fa-receipt" style="font-size: 24px; color: var(--accent-orange); margin-bottom: 8px; display: block; opacity: 0.6;"></i>
                    No orders placed yet.
                </div>`;
            return;
        }

        container.innerHTML = orders.slice(0, 5).map(o => {
            const statusClass = (o.status || 'pending').toLowerCase();
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const total = parseFloat(o.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const customerName = o.customer_name || 'Customer';
            const prodDesc = o.items_description || o.product_description || 'Produce order';

            let imgUrl = o.product_image || '';
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                imgUrl = `http://localhost:5000${imgUrl}`;
            }
            const fallback = 'assets/images/hero-produce.png';

            return `
                <div class="order-row-item" style="cursor: pointer;" onclick="farmer.showPage('orders')">
                    <img src="${imgUrl || fallback}" class="order-img" alt="Order product" onerror="this.onerror=null;this.src='${fallback}';">
                    <div class="order-info">
                        <div class="order-id-txt">#${o.order_number || o.id}</div>
                        <div class="order-cust-name">${customerName}</div>
                        <div class="order-prod-desc">${prodDesc}</div>
                    </div>
                    <div class="order-status-wrap">
                        <span class="status-badge-pill ${statusClass}">${o.status || 'Pending'}</span>
                        <div class="order-date-txt">${dateStr}</div>
                        <div class="order-amt-txt">₹${total}</div>
                    </div>
                </div>`;
        }).join('');
    },

    renderActivity(stats = {}) {
        const actCust = document.getElementById('act-customers');
        if (actCust) actCust.textContent = (stats.totalCustomers ?? 0).toLocaleString();

        const actOrdToday = document.getElementById('act-orders-today');
        if (actOrdToday) actOrdToday.textContent = (stats.ordersToday ?? 0).toLocaleString();

        const actProd = document.getElementById('act-products');
        if (actProd) actProd.textContent = (stats.totalProducts ?? 0).toLocaleString();

        const actRev = document.getElementById('act-reviews');
        if (actRev) actRev.textContent = (stats.totalReviews ?? 0).toLocaleString();
    },

    // ============================================
    // PRODUCE IMAGE SMART FALLBACK
    // ============================================
    getProduceFallback(name) {
        const lower = (name || '').toLowerCase();
        if (lower.includes('tomato')) return 'assets/images/tomatoes.png';
        if (lower.includes('carrot')) return 'assets/images/carrots.png';
        if (lower.includes('spinach')) return 'assets/images/spinach.png';
        if (lower.includes('strawberr')) return 'assets/images/strawberries.png';
        if (lower.includes('pepper') || lower.includes('capsicum')) return 'assets/images/bell-peppers.png';
        if (lower.includes('potato')) return 'assets/images/potatoes.png';
        return 'assets/images/hero-produce.png';
    },

    // ============================================
    // PRODUCTS MANAGEMENT (PROFESSIONAL SUITE)
    // ============================================
    allProducts: [],
    productViewMode: 'grid',

    updateProductsKPIs() {
        const total = this.allProducts.length;
        const avail = this.allProducts.filter(p => p.is_available !== false && (p.quantity || 0) > 0).length;
        const low = this.allProducts.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < 25).length;
        const out = this.allProducts.filter(p => (p.quantity || 0) === 0).length;
        const val = this.allProducts.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (parseInt(p.quantity || 0))), 0);

        const elTotal = document.getElementById('prod-kpi-total');
        if (elTotal) elTotal.textContent = total;
        const elAvail = document.getElementById('prod-kpi-avail');
        if (elAvail) elAvail.textContent = avail;
        const elLow = document.getElementById('prod-kpi-low');
        if (elLow) elLow.textContent = low;
        const elOut = document.getElementById('prod-kpi-out');
        if (elOut) elOut.textContent = out;
        const elVal = document.getElementById('prod-kpi-value');
        if (elVal) elVal.textContent = '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const catFilter = document.getElementById('prod-filter-category');
        if (catFilter) {
            const currentVal = catFilter.value;
            const categories = [...new Set(this.allProducts.map(p => p.category).filter(Boolean))];
            catFilter.innerHTML = '<option value="all">All Categories</option>' + 
                categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('');
        }
    },

    async fetchProductsInBackground() {
        if (this._fetchingProducts) return;
        this._fetchingProducts = true;
        try {
            const data = await API.products.getFarmerProducts();
            if (data && data.success && Array.isArray(data.products)) {
                this.allProducts = data.products;
                sessionStorage.setItem('ff_farmer_prods', JSON.stringify(this.allProducts));
                this.updateProductsKPIs();
                if (this.currentPage === 'products') {
                    this.filterProducts();
                } else if (this.currentPage === 'categories') {
                    this.renderCategoriesGrid();
                }
            }
        } catch(e) {
        } finally {
            this._fetchingProducts = false;
        }
    },

    async loadProducts(forceRefresh = false) {
        const container = document.getElementById('farmer-products');
        if (!container) return;

        // Instant Render from memory (0ms delay)
        if (this.allProducts && this.allProducts.length > 0 && !forceRefresh) {
            this.updateProductsKPIs();
            this.filterProducts();
            this.fetchProductsInBackground();
            return;
        }

        // Instant Render from sessionStorage (0ms delay)
        const cached = sessionStorage.getItem('ff_farmer_prods');
        if (cached && !forceRefresh) {
            try {
                this.allProducts = JSON.parse(cached);
                this.updateProductsKPIs();
                this.filterProducts();
                this.fetchProductsInBackground();
                return;
            } catch(e) {}
        }

        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Loading catalog...</p>';
        await this.fetchProductsInBackground();
    },

    setProductView(mode) {
        this.productViewMode = mode;
        const btnGrid = document.getElementById('btn-view-grid');
        const btnTable = document.getElementById('btn-view-table');
        if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
        if (btnTable) btnTable.classList.toggle('active', mode === 'table');
        this.renderProducts();
    },

    filterProducts() {
        const searchInput = document.getElementById('prod-search-input');
        const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const catFilter = document.getElementById('prod-filter-category');
        const cat = catFilter ? catFilter.value : 'all';
        const stockFilter = document.getElementById('prod-filter-stock');
        const stock = stockFilter ? stockFilter.value : 'all';
        const sortFilter = document.getElementById('prod-sort');
        const sort = sortFilter ? sortFilter.value : 'newest';

        let list = [...this.allProducts];

        if (q) {
            list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
        }

        if (cat !== 'all') {
            list = list.filter(p => p.category === cat);
        }

        if (stock === 'in_stock') {
            list = list.filter(p => (p.quantity || 0) > 0);
        } else if (stock === 'low_stock') {
            list = list.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < 25);
        } else if (stock === 'out_of_stock') {
            list = list.filter(p => (p.quantity || 0) === 0);
        } else if (stock === 'available') {
            list = list.filter(p => p.is_available !== false);
        } else if (stock === 'unavailable') {
            list = list.filter(p => p.is_available === false);
        }

        if (sort === 'price_asc') {
            list.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        } else if (sort === 'price_desc') {
            list.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        } else if (sort === 'stock_desc') {
            list.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        } else if (sort === 'stock_asc') {
            list.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
        } else if (sort === 'name_asc') {
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        this.filteredProducts = list;
        this.renderProducts();
    },

    renderProducts() {
        const container = document.getElementById('farmer-products');
        if (!container) return;

        const list = this.filteredProducts || [];

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; background:var(--white); border-radius:18px; border:1px dashed var(--beige-mid);">
                    <div style="width:64px; height:64px; background:var(--green-pale); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--green-primary); font-size:26px;">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark); margin-bottom:6px;">No crops found</h3>
                    <p style="font-size:13px; color:var(--text-muted); max-width:420px; margin:0 auto 18px;">
                        Try resetting your search query or filters, or list a fresh produce harvest.
                    </p>
                    <button class="btn-add-product" onclick="farmer.showAddProductForm()">
                        <i class="fas fa-plus"></i> Add New Produce
                    </button>
                </div>`;
            return;
        }

        if (this.productViewMode === 'table') {
            container.innerHTML = `
                <div style="background:var(--white); border-radius:18px; border:1px solid var(--beige-mid); overflow:hidden; box-shadow:var(--shadow-sm);">
                    <div style="overflow-x:auto;">
                        <table class="pro-data-table">
                            <thead>
                                <tr>
                                    <th>Produce Crop</th>
                                    <th>Category</th>
                                    <th>Price / Unit</th>
                                    <th>Inventory Stock</th>
                                    <th>Quick Adjust</th>
                                    <th>Store Status</th>
                                    <th style="text-align:right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${list.map(p => {
                                    let imgUrl = p.image_url || '';
                                    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                                        imgUrl = `http://localhost:5000${imgUrl}`;
                                    }
                                    const fallback = this.getProduceFallback(p.name);
                                    const isAvail = p.is_available !== false;
                                    const qty = p.quantity || 0;
                                    const isLow = qty > 0 && qty < 25;
                                    const isOut = qty === 0;

                                    return `
                                    <tr>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:12px;">
                                                <img src="${imgUrl || fallback}" alt="${p.name}" style="width:44px; height:44px; border-radius:10px; object-fit:cover; background:var(--cream);" onerror="this.onerror=null;this.src='${fallback}';">
                                                <div>
                                                    <div style="font-weight:600; color:var(--text-dark); font-size:14px;">${p.name}</div>
                                                    <div style="font-size:11.5px; color:var(--text-muted);">${p.total_sold || 0} sold to date</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span style="font-size:11.5px; font-weight:600; color:var(--orange); background:var(--orange-pale); padding:3px 8px; border-radius:var(--radius-pill);">${p.category || 'General'}</span></td>
                                        <td><strong style="color:var(--green-primary); font-size:14px;">₹${parseFloat(p.price || 0).toFixed(2)}</strong> <span style="font-size:11.5px; color:var(--text-muted);">/ ${p.unit || 'kg'}</span></td>
                                        <td>
                                            <span class="status-badge-pill ${isOut ? 'cancelled' : (isLow ? 'processing' : 'delivered')}">
                                                ${isOut ? '0 (Out of Stock)' : (isLow ? `${qty} in stock (Low)` : `${qty} in stock`)}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="stock-stepper-btns">
                                                <button class="stock-stepper-btn" onclick="farmer.quickAdjustStock(${p.id}, -5)" title="Subtract 5">-5</button>
                                                <button class="stock-stepper-btn" onclick="farmer.quickAdjustStock(${p.id}, -1)" title="Subtract 1">-1</button>
                                                <span class="stock-stepper-val">${qty}</span>
                                                <button class="stock-stepper-btn" onclick="farmer.quickAdjustStock(${p.id}, 1)" title="Add 1">+1</button>
                                                <button class="stock-stepper-btn" onclick="farmer.quickAdjustStock(${p.id}, 5)" title="Add 5">+5</button>
                                            </div>
                                        </td>
                                        <td>
                                            <button onclick="farmer.toggleProductAvailability(${p.id})" style="border:none; cursor:pointer; padding:5px 12px; border-radius:var(--radius-pill); font-size:11px; font-weight:700; transition:all 0.2s; background:${isAvail ? '#D6E4B8' : '#FEE2E2'}; color:${isAvail ? '#355C24' : '#DC2626'};">
                                                <i class="fas ${isAvail ? 'fa-eye' : 'fa-eye-slash'}" style="margin-right:4px;"></i>${isAvail ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td style="text-align:right;">
                                            <div style="display:inline-flex; gap:6px;">
                                                <button class="btn-icon-sm" onclick="farmer.editProduct(${p.id})" title="Edit Produce"><i class="fas fa-pen"></i></button>
                                                <button class="btn-icon-sm danger" onclick="farmer.deleteProduct(${p.id})" title="Delete Produce"><i class="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
        } else {
            // Cards View
            container.innerHTML = `
                <div class="farmer-products-grid">
                    ${list.map(p => {
                        let imgUrl = p.image_url || '';
                        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                            imgUrl = `http://localhost:5000${imgUrl}`;
                        }
                        const fallback = this.getProduceFallback(p.name);
                        const isAvail = p.is_available !== false;
                        const qty = p.quantity || 0;
                        const maxCap = Math.max(100, qty);
                        const pct = Math.min(100, Math.round((qty / maxCap) * 100));
                        const isLow = qty > 0 && qty < 25;
                        const isOut = qty === 0;
                        const barClass = isOut ? 'out' : (isLow ? 'low' : '');

                        return `
                        <div class="product-card-pro">
                            <div class="product-card-pro-top">
                                <img src="${imgUrl || fallback}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}';">
                                <div class="product-card-pro-badge status-badge-pill ${isAvail ? 'delivered' : 'cancelled'}">
                                    <i class="fas ${isAvail ? 'fa-check' : 'fa-eye-slash'}"></i> ${isAvail ? 'Available' : 'Hidden'}
                                </div>
                            </div>
                            <div class="product-card-pro-body">
                                <div class="product-card-pro-cat">${p.category || 'General'}</div>
                                <h4 class="product-card-pro-title">${p.name}</h4>
                                <div class="product-card-pro-price">
                                    ₹${parseFloat(p.price || 0).toFixed(2)} <span>/ ${p.unit || 'kg'}</span>
                                </div>

                                <div class="stock-progress-wrap">
                                    <div class="stock-progress-header">
                                        <span>Stock Level</span>
                                        <strong>${qty} ${p.unit || 'units'}</strong>
                                    </div>
                                    <div class="stock-progress-track">
                                        <div class="stock-progress-bar ${barClass}" style="width: ${pct}%;"></div>
                                    </div>
                                </div>

                                <div class="product-card-pro-actions">
                                    <div class="stock-stepper-btns">
                                        <button class="stock-stepper-btn" onclick="farmer.quickAdjustStock(${p.id}, -1)" title="Minus 1">-</button>
                                        <span class="stock-stepper-val">${qty}</span>
                                        <button class="stock-stepper-btn" onclick="farmer.quickAdjustStock(${p.id}, 1)" title="Plus 1">+</button>
                                    </div>

                                    <button onclick="farmer.toggleProductAvailability(${p.id})" style="border:none; cursor:pointer; padding:6px 12px; border-radius:var(--radius-pill); font-size:11px; font-weight:700; transition:all 0.2s; background:${isAvail ? '#D6E4B8' : '#FEE2E2'}; color:${isAvail ? '#355C24' : '#DC2626'};">
                                        <i class="fas ${isAvail ? 'fa-toggle-on' : 'fa-toggle-off'}"></i> ${isAvail ? 'Live' : 'Hidden'}
                                    </button>

                                    <div style="display:flex; gap:4px;">
                                        <button class="btn-icon-sm" onclick="farmer.editProduct(${p.id})" title="Edit"><i class="fas fa-pen"></i></button>
                                        <button class="btn-icon-sm danger" onclick="farmer.deleteProduct(${p.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`;
        }
    },

    async toggleProductAvailability(id) {
        try {
            let res;
            if (typeof API !== 'undefined' && API.products && typeof API.products.toggleAvailability === 'function') {
                res = await API.products.toggleAvailability(id);
            } else if (typeof API !== 'undefined' && typeof API.patch === 'function') {
                res = await API.patch(`/products/${id}/toggle-availability`);
            } else {
                const token = (typeof auth !== 'undefined' && auth.getToken) ? auth.getToken() : localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/products/${id}/toggle-availability`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                res = await response.json();
            }

            if (res && res.success) {
                const p = this.allProducts.find(item => item.id == id);
                if (p) p.is_available = res.is_available;
                this.filterProducts();
                if (typeof toast !== 'undefined') toast.success(res.message || 'Availability updated');
            } else {
                if (typeof toast !== 'undefined') toast.error(res?.message || 'Failed to toggle availability');
            }
        } catch (e) {
            console.error('Toggle error:', e);
            if (typeof toast !== 'undefined') toast.error(e.message || 'Failed to toggle availability');
        }
    },

    async quickAdjustStock(id, delta) {
        try {
            let res;
            if (typeof API !== 'undefined' && API.products && typeof API.products.quickStock === 'function') {
                res = await API.products.quickStock(id, { delta });
            } else if (typeof API !== 'undefined' && typeof API.patch === 'function') {
                res = await API.patch(`/products/${id}/quick-stock`, { delta });
            } else {
                const token = (typeof auth !== 'undefined' && auth.getToken) ? auth.getToken() : localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/products/${id}/quick-stock`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ delta })
                });
                res = await response.json();
            }

            if (res && res.success) {
                const p = this.allProducts.find(item => item.id == id);
                if (p) p.quantity = res.quantity;
                this.filterProducts();
                if (typeof toast !== 'undefined') toast.info(`Stock updated: ${res.quantity}`);
            } else {
                if (typeof toast !== 'undefined') toast.error(res?.message || 'Failed to adjust stock');
            }
        } catch (e) {
            console.error('Stock adjust error:', e);
            if (typeof toast !== 'undefined') toast.error(e.message || 'Failed to adjust stock');
        }
    },

    showAddProductForm() {
        const title = document.getElementById('product-form-title');
        if (title) title.textContent = 'Add New Produce';
        const fields = document.getElementById('product-form-fields');
        if (fields) fields.reset();
        const idField = document.getElementById('product-id');
        if (idField) idField.value = '';
        const prev = document.getElementById('upload-preview');
        if (prev) prev.innerHTML = '';
        this.editingProductId = null;
        const formEl = document.getElementById('product-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    },

    async editProduct(id) {
        try {
            const data = await API.products.getById(id);
            if (data && data.success && data.product) {
                const p = data.product;
                const title = document.getElementById('product-form-title');
                if (title) title.textContent = 'Edit Produce';
                
                document.getElementById('product-id').value = p.id;
                document.getElementById('product-name').value = p.name || '';
                document.getElementById('product-category').value = p.category || '';
                document.getElementById('product-description').value = p.description || '';
                document.getElementById('product-price').value = p.price || '';
                document.getElementById('product-quantity').value = p.quantity || '';
                document.getElementById('product-unit').value = p.unit || 'kg';

                const preview = document.getElementById('upload-preview');
                if (preview) {
                    preview.innerHTML = '';
                    if (p.image_url) {
                        const img = document.createElement('img');
                        img.src = p.image_url.startsWith('http') ? p.image_url : `http://localhost:5000${p.image_url}`;
                        img.className = 'upload-preview-img';
                        img.style.cssText = 'max-width:120px; border-radius:10px; margin-top:8px;';
                        preview.appendChild(img);
                    }
                }

                const formEl = document.getElementById('product-form');
                if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            if (typeof toast !== 'undefined') toast.error('Failed to load product details');
        }
    },

    async saveProduct() {
        try {
            const id = document.getElementById('product-id').value;
            const name = document.getElementById('product-name').value.trim();
            const category = document.getElementById('product-category').value;
            const description = document.getElementById('product-description').value.trim();
            const price = document.getElementById('product-price').value;
            const quantity = document.getElementById('product-quantity').value;
            const unit = document.getElementById('product-unit').value;
            const imageFile = document.getElementById('product-image').files[0];

            if (!name) { if (typeof toast!=='undefined') toast.error('Please enter a product name'); return; }
            if (!category) { if (typeof toast!=='undefined') toast.error('Please select a category'); return; }
            if (!price || parseFloat(price) <= 0) { if (typeof toast!=='undefined') toast.error('Please enter a valid price'); return; }
            if (!quantity || parseInt(quantity) < 0) { if (typeof toast!=='undefined') toast.error('Please enter a valid quantity'); return; }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('description', description || '');
            formData.append('price', parseFloat(price));
            formData.append('quantity', parseInt(quantity));
            formData.append('unit', unit || 'kg');
            if (imageFile) formData.append('image', imageFile);

            let result;
            if (id) {
                result = await API.products.update(id, formData);
                if (result && result.success && typeof toast!=='undefined') toast.success('Product updated successfully!');
            } else {
                result = await API.products.create(formData);
                if (result && result.success && typeof toast!=='undefined') toast.success('Produce listed successfully!');
            }

            if (result && result.success) {
                this.resetProductForm();
                await this.loadProducts();
            }
        } catch (error) {
            console.error('Save product error:', error);
            if (typeof toast!=='undefined') toast.error(error.message || 'Failed to save product');
        }
    },

    resetProductForm() {
        const fields = document.getElementById('product-form-fields');
        if (fields) fields.reset();
        document.getElementById('product-id').value = '';
        const prev = document.getElementById('upload-preview');
        if (prev) prev.innerHTML = '';
        const title = document.getElementById('product-form-title');
        if (title) title.textContent = 'Add New Produce';
        this.editingProductId = null;
    },

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this produce from your catalog?')) return;
        try {
            const result = await API.products.delete(id);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success('Produce deleted successfully');
                this.loadProducts();
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error('Failed to delete product');
        }
    },

    // ============================================
    // ORDERS MANAGEMENT (ATTRACTIVE & INTUITIVE)
    // ============================================
    allOrders: [],
    orderStatusFilter: 'all',

    updateOrdersKPIs() {
        const total = this.allOrders.length;
        const pending = this.allOrders.filter(o => o.status === 'pending').length;
        const prep = this.allOrders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length;
        const transit = this.allOrders.filter(o => ['out_for_delivery', 'on_the_way'].includes(o.status)).length;
        const delivered = this.allOrders.filter(o => o.status === 'delivered').length;
        const rev = this.allOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        const elTot = document.getElementById('orders-kpi-total');
        if (elTot) elTot.textContent = total;
        const elPen = document.getElementById('orders-kpi-pending');
        if (elPen) elPen.textContent = pending;
        const elPrep = document.getElementById('orders-kpi-prep');
        if (elPrep) elPrep.textContent = prep;
        const elTran = document.getElementById('orders-kpi-transit');
        if (elTran) elTran.textContent = transit;
        const elDel = document.getElementById('orders-kpi-delivered');
        if (elDel) elDel.textContent = delivered;
        const elRev = document.getElementById('orders-kpi-rev');
        if (elRev) elRev.textContent = '₹' + rev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    async fetchOrdersInBackground() {
        if (this._fetchingOrders) return;
        this._fetchingOrders = true;
        try {
            const data = await API.orders.getFarmerOrders();
            if (data && data.success && Array.isArray(data.orders)) {
                this.allOrders = data.orders;
                sessionStorage.setItem('ff_farmer_orders', JSON.stringify(this.allOrders));
                this.updateOrdersKPIs();
                if (this.currentPage === 'orders') {
                    this.filterOrders();
                } else if (this.currentPage === 'reports') {
                    this.loadReports();
                }
            }
        } catch(e) {
        } finally {
            this._fetchingOrders = false;
        }
    },

    async loadOrders(forceRefresh = false) {
        const container = document.getElementById('farmer-orders');
        if (!container) return;

        // Instant Render from memory (0ms delay)
        if (this.allOrders && this.allOrders.length > 0 && !forceRefresh) {
            this.updateOrdersKPIs();
            this.filterOrders();
            this.fetchOrdersInBackground();
            return;
        }

        // Instant Render from sessionStorage (0ms delay)
        const cached = sessionStorage.getItem('ff_farmer_orders');
        if (cached && !forceRefresh) {
            try {
                this.allOrders = JSON.parse(cached);
                this.updateOrdersKPIs();
                this.filterOrders();
                this.fetchOrdersInBackground();
                return;
            } catch(e) {}
        }

        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Loading orders...</p>';
        await this.fetchOrdersInBackground();
    },

    setOrderFilter(status) {
        this.orderStatusFilter = status;
        document.querySelectorAll('#orders-status-tabs .view-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });
        this.filterOrders();
    },

    filterOrders() {
        const searchInput = document.getElementById('orders-search-input');
        const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const status = this.orderStatusFilter || 'all';

        let list = [...this.allOrders];

        if (status !== 'all') {
            list = list.filter(o => o.status === status);
        }

        if (q) {
            list = list.filter(o => 
                (o.order_number || '').toLowerCase().includes(q) ||
                (o.customer_name || '').toLowerCase().includes(q) ||
                (o.shipping_address || '').toLowerCase().includes(q)
            );
        }

        this.filteredOrders = list;
        this.renderOrders();
    },

    copyOrderId(num) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(num);
            if (typeof toast !== 'undefined') toast.info(`Copied ${num}`);
        }
    },

    renderOrders() {
        const container = document.getElementById('farmer-orders');
        if (!container) return;

        const list = this.filteredOrders || [];

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; background:var(--white); border-radius:18px; border:1px dashed var(--beige-mid);">
                    <div style="width:64px; height:64px; background:var(--green-pale); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--green-primary); font-size:26px;">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark); margin-bottom:6px;">No orders found</h3>
                    <p style="font-size:13px; color:var(--text-muted); max-width:420px; margin:0 auto;">
                        No customer orders match your selected filter criteria.
                    </p>
                </div>`;
            return;
        }

        const stages = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
        const stageLabels = {
            'pending': '1. Placed',
            'confirmed': '2. Confirmed',
            'preparing': '3. Preparing',
            'ready': '4. Packed',
            'out_for_delivery': '5. In Transit',
            'delivered': '6. Delivered'
        };

        const nextStageMap = {
            'pending': { next: 'confirmed', label: 'Confirm Order', icon: 'fa-check' },
            'confirmed': { next: 'preparing', label: 'Start Harvesting/Packing', icon: 'fa-box-open' },
            'preparing': { next: 'ready', label: 'Mark Ready for Dispatch', icon: 'fa-check-double' },
            'ready': { next: 'out_for_delivery', label: 'Hand to Delivery Driver', icon: 'fa-motorcycle' },
            'out_for_delivery': { next: 'on_the_way', label: 'Approaching Destination', icon: 'fa-route' },
            'on_the_way': { next: 'delivered', label: 'Mark Delivered Fresh', icon: 'fa-house-circle-check' }
        };

        container.innerHTML = list.map(o => {
            const nextAction = nextStageMap[o.status];
            const isReady = o.status === 'ready';
            const inTransit = ['out_for_delivery', 'on_the_way'].includes(o.status);
            const isDelivered = o.status === 'delivered';
            const dateStr = new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const orderNum = o.order_number || `#ORD-${o.id}`;
            const total = parseFloat(o.total_amount || 0).toFixed(2);
            const paymentStatus = (o.payment_status || 'pending').toUpperCase();
            const items = o.items || [];

            const currIdx = stages.indexOf(o.status);
            const pct = currIdx >= 0 ? Math.min(100, Math.round((currIdx / (stages.length - 1)) * 100)) : 0;

            return `
            <div class="order-card-pro">
                <div class="order-card-pro-head">
                    <div>
                        <div class="order-card-pro-id">
                            ${orderNum}
                            <button class="order-copy-btn" onclick="farmer.copyOrderId('${orderNum}')" title="Copy Order ID"><i class="fas fa-copy"></i> Copy</button>
                        </div>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                            Placed on ${dateStr}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="status-badge-pill ${paymentStatus === 'PAID' ? 'delivered' : 'processing'}">
                            <i class="fas ${paymentStatus === 'PAID' ? 'fa-check' : 'fa-clock'}"></i> Payment: ${paymentStatus}
                        </span>
                        <span class="status-badge-pill ${o.status || 'pending'}">
                            ${(o.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                <!-- Stepper Progress Bar -->
                <div class="order-stepper-pro">
                    <div class="order-stepper-track">
                        <div class="order-stepper-fill" style="width: ${pct}%;"></div>
                    </div>
                    ${stages.map((st, i) => {
                        const isDone = currIdx > i;
                        const isCurr = currIdx === i;
                        const nodeClass = isDone ? 'completed' : (isCurr ? 'current' : '');
                        return `
                        <div class="order-step-node ${nodeClass}">
                            <div class="order-step-circle">
                                ${isDone ? '<i class="fas fa-check"></i>' : (i + 1)}
                            </div>
                            <span class="order-step-label">${stageLabels[st]}</span>
                        </div>`;
                    }).join('')}
                </div>

                <!-- Middle Details Grid -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:18px; background:var(--cream); padding:16px; border-radius:14px; margin-bottom:16px;">
                    <div>
                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">
                            <i class="fas fa-user" style="margin-right:4px;"></i> Customer Details
                        </div>
                        <div style="font-weight:700; color:var(--text-dark); font-size:14px;">${o.customer_name || 'Customer'}</div>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                            <a href="tel:${o.customer_phone || ''}" style="color:var(--green-primary); text-decoration:none;">
                                <i class="fas fa-phone" style="margin-right:4px;"></i>${o.customer_phone || 'Contact provided on dispatch'}
                            </a>
                        </div>
                        <div style="font-size:12px; color:var(--text-dark); margin-top:6px; line-height:1.4;">
                            <i class="fas fa-location-dot" style="color:#DC2626; margin-right:4px;"></i>${o.shipping_address || 'Standard Address'}
                        </div>
                    </div>

                    <div>
                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">
                            <i class="fas fa-basket-shopping" style="margin-right:4px;"></i> Produce Ordered (${items.length} items)
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px; max-height:120px; overflow-y:auto;">
                            ${items.map(item => `
                                <div style="display:flex; justify-content:space-between; font-size:12.5px; background:var(--white); padding:6px 10px; border-radius:8px; border:1px solid var(--beige);">
                                    <span><strong>${item.product_name}</strong> × ${item.quantity}</span>
                                    <span style="font-weight:600; color:var(--green-primary);">₹${parseFloat(item.total || item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('') || `<div style="font-size:12px; color:var(--text-muted);">${o.item_count || 1} items ordered</div>`}
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:13px; font-weight:700; color:var(--text-dark);">
                            <span>Total Bill:</span>
                            <span style="color:var(--green-primary); font-size:15px;">₹${total}</span>
                        </div>
                    </div>
                </div>

                <!-- Bottom Action Controls -->
                <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11.5px; font-weight:600; color:var(--text-muted);">Change Stage:</span>
                        <select onchange="farmer.updateOrderStatus(${o.id}, this.value)" class="pro-filter-select" style="padding:6px 12px; font-size:12px;">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>1. Order Placed</option>
                            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>2. Confirmed</option>
                            <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>3. Preparing</option>
                            <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>4. Ready for Dispatch</option>
                            <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>5. Out for Delivery</option>
                            <option value="on_the_way" ${o.status === 'on_the_way' ? 'selected' : ''}>6. On the Way</option>
                            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>7. Delivered</option>
                            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>

                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        ${nextAction ? `
                            <button onclick="farmer.updateOrderStatus(${o.id}, '${nextAction.next}')" class="btn-add-product" style="padding:8px 16px; font-size:12px; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fas ${nextAction.icon}"></i> ${nextAction.label}
                            </button>
                        ` : ''}

                        ${isReady || inTransit ? `
                            <button onclick="farmer.openAssignDeliveryModal(${o.id}, '${orderNum}')" class="btn-balance-details" style="background:#F28C28; color:#fff; border:none; padding:8px 14px; font-size:12px; cursor:pointer; border-radius:var(--radius-pill); display:inline-flex; align-items:center; gap:6px;">
                                <i class="fas fa-motorcycle"></i> ${inTransit ? 'Reassign Driver' : 'Assign Delivery'}
                            </button>
                        ` : ''}

                        ${inTransit || isDelivered ? `
                            <button onclick="farmer.viewLiveTracking(${o.id})" class="btn-balance-details" style="background:#0284C7; color:#fff; border:none; padding:8px 14px; font-size:12px; cursor:pointer; border-radius:var(--radius-pill); display:inline-flex; align-items:center; gap:6px;">
                                <i class="fas fa-map-location-dot"></i> Live GPS
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // ============================================
    // CATEGORIES MANAGEMENT (WORKING & INSTANT)
    // ============================================
    async loadCategories() {
        const grid = document.getElementById('farmer-categories-grid');
        if (!grid) return;

        // Instant render if products exist in memory
        if (this.allProducts && this.allProducts.length > 0) {
            this.renderCategoriesGrid();
            return;
        }

        const cached = sessionStorage.getItem('ff_farmer_prods');
        if (cached) {
            try {
                this.allProducts = JSON.parse(cached);
                this.renderCategoriesGrid();
                return;
            } catch(e) {}
        }

        grid.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;"><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Loading categories...</p>';

        try {
            const pData = await API.products.getFarmerProducts();
            if (pData && pData.success && Array.isArray(pData.products)) {
                this.allProducts = pData.products;
                sessionStorage.setItem('ff_farmer_prods', JSON.stringify(this.allProducts));
            }
            this.renderCategoriesGrid();
        } catch (error) {
            console.error('Error loading categories:', error);
            grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:30px; grid-column:1/-1;">Failed to load categories</p>';
        }
    },

    renderCategoriesGrid() {
        const grid = document.getElementById('farmer-categories-grid');
        if (!grid) return;

        const standardCategories = [
            { name: 'Vegetables', icon: 'fa-carrot', color: '#D97706', bg: '#FEF3C7', desc: 'Root crops, vine vegetables, and organic garden picks' },
            { name: 'Fruits', icon: 'fa-apple-whole', color: '#DC2626', bg: '#FEE2E2', desc: 'Tree-ripened orchard fruits and berry harvests' },
            { name: 'Leafy Greens', icon: 'fa-leaf', color: '#16A34A', bg: '#DCFCE7', desc: 'Fresh tender spinach, kale, lettuce, and herbs' },
            { name: 'Organic', icon: 'fa-seedling', color: '#355C24', bg: '#EAF0DF', desc: 'Zero pesticide chemical-free certified produce' },
            { name: 'Dairy & Farm Fresh', icon: 'fa-cow', color: '#2563EB', bg: '#DBEAFE', desc: 'Farm bottled milk, free-range eggs, and butter' },
            { name: 'Grains & Pulses', icon: 'fa-wheat-awn', color: '#B45309', bg: '#FDE68A', desc: 'Locally grown whole grains, pulses, and seeds' },
            { name: 'Herbs & Seasoning', icon: 'fa-spa', color: '#059669', bg: '#D1FAE5', desc: 'Aromatic farm herbs, fresh mint, coriander, and spices' }
        ];

        const foundCats = [...new Set((this.allProducts || []).map(p => p.category).filter(Boolean))];
        foundCats.forEach(c => {
            if (!standardCategories.some(sc => sc.name.toLowerCase() === c.toLowerCase())) {
                standardCategories.push({
                    name: c,
                    icon: 'fa-tags',
                    color: '#6F9638',
                    bg: '#EAF0DF',
                    desc: 'Specialty harvest category'
                });
            }
        });

        // Calculate metrics per category
        let topCat = 'Vegetables';
        let maxCount = 0;
        let totalUnits = 0;

        const enriched = standardCategories.map(cat => {
            const prods = (this.allProducts || []).filter(p => (p.category || '').toLowerCase() === cat.name.toLowerCase());
            const count = prods.length;
            const stock = prods.reduce((sum, p) => sum + (p.quantity || 0), 0);
            const sold = prods.reduce((sum, p) => sum + (p.total_sold || 0), 0);
            totalUnits += stock;
            if (count > maxCount) {
                maxCount = count;
                topCat = cat.name;
            }
            return { ...cat, count, stock, sold };
        });

        // Update KPI cards
        const elCount = document.getElementById('cat-kpi-count');
        if (elCount) elCount.textContent = enriched.filter(c => c.count > 0).length || enriched.length;
        const elTop = document.getElementById('cat-kpi-top');
        if (elTop) elTop.textContent = topCat;
        const elUnits = document.getElementById('cat-kpi-units');
        if (elUnits) elUnits.textContent = totalUnits;

        grid.innerHTML = enriched.map(c => `
            <div class="category-card-pro">
                <div class="cat-card-header">
                    <div class="cat-card-icon" style="background:${c.bg}; color:${c.color};">
                        <i class="fas ${c.icon}"></i>
                    </div>
                    <div>
                        <div class="cat-card-title">${c.name}</div>
                        <div style="font-size:11.5px; color:var(--text-muted);">${c.count} listed produce</div>
                    </div>
                </div>
                <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin-bottom:14px;">
                    ${c.desc}
                </p>
                <div class="cat-card-stats">
                    <div>
                        <div class="cat-card-stat-val">${c.stock}</div>
                        <div class="cat-card-stat-lbl">In-Stock Units</div>
                    </div>
                    <div>
                        <div class="cat-card-stat-val">${c.sold}</div>
                        <div class="cat-card-stat-lbl">Total Sold</div>
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:auto;">
                    <button class="btn-balance-details" onclick="farmer.filterByCategory('${c.name}')" style="flex:1; background:var(--cream); border:1px solid var(--beige-mid); padding:7px; font-size:11.5px; cursor:pointer; border-radius:var(--radius-pill);">
                        <i class="fas fa-filter"></i> View Crops
                    </button>
                    <button class="btn-balance-details" onclick="farmer.prepareAddProductCategory('${c.name}')" style="flex:1; background:var(--green-pale); border:1px solid var(--green-soft); color:var(--green-primary); padding:7px; font-size:11.5px; font-weight:700; cursor:pointer; border-radius:var(--radius-pill);">
                        <i class="fas fa-plus"></i> Add Crop
                    </button>
                </div>
            </div>
        `).join('');
    },

    filterByCategory(catName) {
        this.showPage('products');
        setTimeout(() => {
            const select = document.getElementById('prod-filter-category');
            if (select) {
                select.value = catName;
                this.filterProducts();
            }
        }, 100);
    },

    prepareAddProductCategory(catName) {
        this.showPage('products');
        setTimeout(() => {
            this.showAddProductForm();
            const select = document.getElementById('product-category');
            if (select) {
                if (![...select.options].some(o => o.value.toLowerCase() === catName.toLowerCase())) {
                    select.add(new Option(catName, catName));
                }
                select.value = catName;
            }
        }, 100);
    },

    showAddCategoryModal() {
        const catName = prompt('Enter New Category Name (e.g. Exotic Microgreens, Berries, Honey & Jams):');
        if (catName && catName.trim()) {
            const cleanName = catName.trim();
            const select = document.getElementById('product-category');
            if (select && ![...select.options].some(o => o.value.toLowerCase() === cleanName.toLowerCase())) {
                select.add(new Option(cleanName, cleanName));
            }
            if (typeof toast !== 'undefined') toast.success(`Category "${cleanName}" ready for listings!`);
            this.loadCategories();
        }
    },

    // ============================================
    // CUSTOMER REVIEWS (WORKING & INSTANT)
    // ============================================
    allReviews: [],

    async fetchReviewsInBackground() {
        if (this._fetchingReviews) return;
        this._fetchingReviews = true;
        try {
            const data = await API.user.getFarmerReviews();
            if (data && data.success) {
                this.allReviews = Array.isArray(data.reviews) ? data.reviews : [];
                sessionStorage.setItem('ff_farmer_reviews', JSON.stringify(this.allReviews));
                sessionStorage.setItem('ff_farmer_reviews_meta', JSON.stringify({
                    averageRating: data.averageRating,
                    totalReviews: data.totalReviews,
                    ratingCounts: data.ratingCounts
                }));
                if (this.currentPage === 'reviews') {
                    this.applyReviewsData(data);
                }
            }
        } catch(e) {
        } finally {
            this._fetchingReviews = false;
        }
    },

    applyReviewsData(data) {
        this.allReviews = Array.isArray(data.reviews) ? data.reviews : [];
        const avg = parseFloat(data.averageRating || 0).toFixed(1);
        const total = data.totalReviews || 0;
        const counts = data.ratingCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        const elAvg = document.getElementById('review-hero-avg');
        if (elAvg) elAvg.textContent = total > 0 ? avg : '5.0';
        const elCnt = document.getElementById('review-hero-count');
        if (elCnt) elCnt.textContent = total;

        for (let s = 1; s <= 5; s++) {
            const c = counts[s] || 0;
            const pct = total > 0 ? Math.round((c / total) * 100) : (s === 5 ? 100 : 0);
            const bar = document.getElementById(`star-bar-${s}`);
            if (bar) bar.style.width = pct + '%';
            const num = document.getElementById(`star-count-${s}`);
            if (num) num.textContent = c;
        }

        const prodSelect = document.getElementById('review-filter-product');
        if (prodSelect) {
            const prods = [...new Map(this.allReviews.map(r => [r.product_id, r.product_name])).entries()];
            prodSelect.innerHTML = '<option value="all">All Farm Produce</option>' +
                prods.map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
        }

        this.filterReviews();
    },

    async loadReviews() {
        const feed = document.getElementById('farmer-reviews-feed');
        if (!feed) return;

        // Instant render if reviews exist in memory
        if (this.allReviews && this.allReviews.length > 0) {
            const cachedMeta = sessionStorage.getItem('ff_farmer_reviews_meta');
            if (cachedMeta) {
                try {
                    const meta = JSON.parse(cachedMeta);
                    this.applyReviewsData({ ...meta, reviews: this.allReviews });
                } catch(e) {}
            }
            this.fetchReviewsInBackground();
            return;
        }

        const cachedReviews = sessionStorage.getItem('ff_farmer_reviews');
        const cachedMeta = sessionStorage.getItem('ff_farmer_reviews_meta');
        if (cachedReviews && cachedMeta) {
            try {
                this.allReviews = JSON.parse(cachedReviews);
                const meta = JSON.parse(cachedMeta);
                this.applyReviewsData({ ...meta, reviews: this.allReviews });
                this.fetchReviewsInBackground();
                return;
            } catch(e) {}
        }

        feed.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted);"><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Loading feedback...</p>';
        await this.fetchReviewsInBackground();
    },

    filterReviews() {
        const feed = document.getElementById('farmer-reviews-feed');
        if (!feed) return;

        const starFilter = document.getElementById('review-filter-stars');
        const star = starFilter ? starFilter.value : 'all';
        const prodFilter = document.getElementById('review-filter-product');
        const prodId = prodFilter ? prodFilter.value : 'all';

        let list = [...this.allReviews];

        if (star !== 'all') {
            list = list.filter(r => r.rating == star);
        }

        if (prodId !== 'all') {
            list = list.filter(r => r.product_id == prodId);
        }

        if (list.length === 0) {
            feed.innerHTML = `
                <div style="text-align:center; padding:60px 20px; background:var(--white); border-radius:18px; border:1px dashed var(--beige-mid);">
                    <div style="width:64px; height:64px; background:#FEF3C7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:#D97706; font-size:26px;">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark); margin-bottom:6px;">No customer reviews yet</h3>
                    <p style="font-size:13px; color:var(--text-muted); max-width:420px; margin:0 auto;">
                        When customers receive their fresh farm delivery, their verified feedback and ratings will appear here.
                    </p>
                </div>`;
            return;
        }

        feed.innerHTML = list.map(r => {
            const stars = Array.from({ length: 5 }, (_, i) => 
                `<i class="fas fa-star" style="color:${i < r.rating ? '#F59E0B' : '#E5DEC8'}; font-size:13px;"></i>`
            ).join('');
            const dateStr = new Date(r.created_at || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            const initials = (r.customer_name || 'Customer').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const fallback = this.getProduceFallback(r.product_name);

            return `
            <div class="review-card-pro">
                <div class="review-card-top">
                    <div class="review-cust-info">
                        <div class="review-cust-avatar">${initials}</div>
                        <div>
                            <div style="font-weight:700; color:var(--text-dark); font-size:14px; display:flex; align-items:center; gap:6px;">
                                ${r.customer_name || 'Verified Customer'}
                                <span style="font-size:10px; font-weight:700; color:#16A34A; background:#DCFCE7; padding:2px 6px; border-radius:var(--radius-pill);"><i class="fas fa-check-circle"></i> Verified Buyer</span>
                            </div>
                            <div style="font-size:11.5px; color:var(--text-muted);">${dateStr}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        ${stars}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    <img src="${r.product_image || fallback}" alt="" style="width:24px; height:24px; border-radius:6px; object-fit:cover;" onerror="this.onerror=null;this.src='${fallback}';">
                    <span style="font-size:12px; font-weight:600; color:var(--text-dark);">${r.product_name}</span>
                </div>
                <p style="font-size:13.5px; color:var(--text-dark); line-height:1.5;">
                    "${r.comment || 'Produce arrived crisp, fresh, and cleanly packaged!'}"
                </p>
            </div>`;
        }).join('');
    },

    // ============================================
    // REPORTS & ANALYTICS (WITH TIMEFRAME FILTERS)
    // ============================================
    reportsTimeframe: '1_month',

    getOrdersForTimeframe(timeframe = '1_month') {
        const orders = this.allOrders || [];
        if (timeframe === 'all') return orders;

        const now = new Date();
        let cutoff = new Date(0);

        if (timeframe === 'today') {
            cutoff = new Date();
            cutoff.setHours(0, 0, 0, 0);
        } else if (timeframe === '1_month') {
            cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (timeframe === '3_months') {
            cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        } else if (timeframe === '6_months') {
            cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        } else if (timeframe === '1_year') {
            cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }

        return orders.filter(o => new Date(o.created_at || Date.now()) >= cutoff);
    },

    setReportsTimeframe(timeframe) {
        this.reportsTimeframe = timeframe;

        // Update active tab buttons
        document.querySelectorAll('#reports-timeframe-tabs .view-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
        });

        // Update label and badge
        const now = new Date();
        const lblEl = document.getElementById('reports-timeframe-label');
        const pillEl = document.getElementById('reports-timeframe-pill');

        const map = {
            'today': {
                label: `Showing: Today (${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`,
                pill: 'Today Detail'
            },
            '1_month': {
                label: 'Showing: Last 30 Days',
                pill: '1 Month Detail'
            },
            '3_months': {
                label: 'Showing: Last 90 Days (Quarterly)',
                pill: '3 Months Detail'
            },
            '6_months': {
                label: 'Showing: Last 180 Days (Half-Year)',
                pill: '6 Months Detail'
            },
            '1_year': {
                label: 'Showing: Last 365 Days (Annual)',
                pill: '1 Year Detail'
            },
            'all': {
                label: 'Showing: All-Time Lifetime Performance',
                pill: 'All Time'
            }
        };

        if (map[timeframe]) {
            if (lblEl) lblEl.textContent = map[timeframe].label;
            if (pillEl) pillEl.textContent = map[timeframe].pill;
        }

        // 0ms instantaneous local render from in-memory orders
        const periodOrders = this.getOrdersForTimeframe(timeframe);
        this.applyReportsData(null, periodOrders, timeframe);

        // Background server fetch to sync exact server ledger
        API.orders.getFarmerStats(timeframe).then(res => {
            if (res && res.success && res.stats) {
                this.applyReportsData(res.stats, periodOrders, timeframe);
            }
        }).catch(() => {});
    },

    async loadReports() {
        const tf = this.reportsTimeframe || '1_month';

        // Update active button state
        document.querySelectorAll('#reports-timeframe-tabs .view-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timeframe === tf);
        });

        // Cache-first instant 0ms paint
        const periodOrders = this.getOrdersForTimeframe(tf);
        const cachedStats = sessionStorage.getItem(`ff_farmer_stats_${tf}`) || sessionStorage.getItem('ff_farmer_stats');
        if (cachedStats || periodOrders.length > 0) {
            try {
                const s = cachedStats ? JSON.parse(cachedStats) : null;
                this.applyReportsData(s, periodOrders, tf);
            } catch(e) {}
        }

        try {
            const [statsRes, ordersRes] = await Promise.all([
                API.orders.getFarmerStats(tf),
                API.orders.getFarmerOrders()
            ]);

            const stats = (statsRes && statsRes.success) ? statsRes.stats : {};
            const orders = (ordersRes && ordersRes.success && Array.isArray(ordersRes.orders)) ? ordersRes.orders : [];
            this.allOrders = orders;
            sessionStorage.setItem(`ff_farmer_stats_${tf}`, JSON.stringify(stats));
            sessionStorage.setItem('ff_farmer_orders', JSON.stringify(orders));

            const freshPeriodOrders = this.getOrdersForTimeframe(tf);
            this.applyReportsData(stats, freshPeriodOrders, tf);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    },

    applyReportsData(stats = null, orders = [], timeframe = '1_month') {
        const validOrders = (orders || []).filter(o => o.status !== 'cancelled');
        const cancelledOrders = (orders || []).filter(o => o.status === 'cancelled');

        // Financial KPIs: prefer server aggregate if stats passed, or calculate from period orders
        let rev = 0;
        let completed = 0;
        if (stats && typeof stats.totalRevenue === 'number') {
            rev = stats.totalRevenue;
            completed = stats.completedOrders || 0;
        } else {
            rev = validOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
            completed = orders.filter(o => o.status === 'delivered').length;
        }

        const aov = completed > 0 ? (rev / completed) : (validOrders.length > 0 ? (rev / validOrders.length) : 0);
        
        // Total units sold in this period
        let unitsSold = 0;
        validOrders.forEach(o => {
            if (Array.isArray(o.items)) {
                o.items.forEach(i => unitsSold += (parseInt(i.quantity) || 0));
            }
        });

        // Current Inventory Asset Valuation
        let invVal = 0;
        if (this.allProducts && this.allProducts.length > 0) {
            invVal = this.allProducts.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.quantity || 0)), 0);
        }

        const elRev = document.getElementById('report-kpi-revenue');
        if (elRev) elRev.textContent = '₹' + rev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const elOrd = document.getElementById('report-kpi-orders');
        if (elOrd) elOrd.textContent = completed;
        const elAov = document.getElementById('report-kpi-aov');
        if (elAov) elAov.textContent = '₹' + aov.toFixed(2);
        const elUnits = document.getElementById('report-kpi-units');
        if (elUnits) elUnits.textContent = unitsSold;
        const elInv = document.getElementById('report-kpi-inventory');
        if (elInv) elInv.textContent = '₹' + invVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const elCan = document.getElementById('report-kpi-cancelled');
        if (elCan) elCan.textContent = cancelledOrders.length;

        // Render Leaderboard for this specific timeframe
        const tbody = document.getElementById('reports-top-products-tbody');
        if (tbody) {
            // Aggregate sales per product for this specific period
            const prodSalesMap = {};
            validOrders.forEach(o => {
                if (Array.isArray(o.items)) {
                    o.items.forEach(i => {
                        const pid = i.product_id;
                        if (!prodSalesMap[pid]) {
                            const found = (this.allProducts || []).find(p => p.id == pid);
                            prodSalesMap[pid] = {
                                id: pid,
                                name: i.product_name || found?.name || 'Produce Item',
                                category: found?.category || 'General',
                                price: parseFloat(i.unit_price || found?.price || 0),
                                image_url: found?.image_url || null,
                                quantity: found?.quantity || 0,
                                is_available: found?.is_available !== false,
                                total_sold: 0,
                                total_revenue: 0
                            };
                        }
                        const q = parseInt(i.quantity) || 0;
                        prodSalesMap[pid].total_sold += q;
                        prodSalesMap[pid].total_revenue += parseFloat(i.subtotal || (q * (parseFloat(i.unit_price) || 0)));
                    });
                }
            });

            let topList = Object.values(prodSalesMap).sort((a, b) => b.total_sold - a.total_sold || b.total_revenue - a.total_revenue);

            if (topList.length === 0) {
                if (stats && Array.isArray(stats.topProducts) && stats.topProducts.length > 0) {
                    topList = stats.topProducts;
                } else if (orders.length === 0 && this.allProducts && this.allProducts.length > 0) {
                    topList = this.allProducts.slice(0, 5);
                }
            }

            if (topList.length > 0) {
                tbody.innerHTML = topList.map((p, idx) => {
                    const fallback = this.getProduceFallback(p.name);
                    const sold = p.total_sold || 0;
                    const pRev = (p.total_revenue != null ? parseFloat(p.total_revenue) : (sold * parseFloat(p.price || 0))).toFixed(2);
                    const isAvail = p.is_available !== false;
                    return `
                    <tr>
                        <td><strong style="color:var(--text-muted);">#${idx + 1}</strong></td>
                        <td>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="${p.image_url || fallback}" style="width:36px; height:36px; border-radius:8px; object-fit:cover;" onerror="this.onerror=null;this.src='${fallback}';">
                                <strong style="color:var(--text-dark);">${p.name}</strong>
                            </div>
                        </td>
                        <td><span style="font-size:11.5px; font-weight:600; color:var(--orange);">${p.category || 'General'}</span></td>
                        <td>₹${parseFloat(p.price || 0).toFixed(2)}</td>
                        <td><strong>${sold}</strong> units</td>
                        <td><strong style="color:var(--green-primary);">₹${pRev}</strong></td>
                        <td>${p.quantity || 0}</td>
                        <td><span class="status-badge-pill ${isAvail ? 'delivered' : 'cancelled'}">${isAvail ? 'Active' : 'Hidden'}</span></td>
                    </tr>`;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);"><i class="fas fa-calendar-xmark" style="margin-right:6px;"></i>No crop sales recorded for this timeframe</td></tr>';
            }
        }

        // Render Charts
        this.renderReportsCharts(stats, orders, timeframe);
    },

    renderReportsCharts(stats, orders = [], timeframe = '1_month') {
        if (typeof Chart === 'undefined') return;

        // Sales Trend Chart
        const salesCanvas = document.getElementById('chart-reports-sales');
        if (salesCanvas) {
            const ctx = salesCanvas.getContext('2d');
            if (this.reportChartSales) this.reportChartSales.destroy();

            let labels = [];
            let dataPts = [];

            if (stats && Array.isArray(stats.salesByDate) && stats.salesByDate.length > 0) {
                labels = stats.salesByDate.map(d => {
                    const raw = d.order_date || d.date;
                    const parsed = new Date(raw);
                    return isNaN(parsed.getTime()) ? String(raw) : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                });
                dataPts = stats.salesByDate.map(d => parseFloat(d.revenue || d.sales || 0));
            } else {
                // Compute from period orders
                const validOrders = (orders || []).filter(o => o.status !== 'cancelled');
                if (timeframe === 'today') {
                    // Hourly buckets
                    const hoursMap = {};
                    validOrders.forEach(o => {
                        const d = new Date(o.created_at || Date.now());
                        const h = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                        hoursMap[h] = (hoursMap[h] || 0) + parseFloat(o.total_amount || 0);
                    });
                    labels = Object.keys(hoursMap);
                    dataPts = Object.values(hoursMap);
                    if (labels.length === 0) {
                        labels = ['Morning', 'Noon', 'Evening'];
                        dataPts = [0, 0, 0];
                    }
                } else {
                    // Daily buckets
                    const dateMap = {};
                    validOrders.forEach(o => {
                        const d = new Date(o.created_at || Date.now());
                        const dtStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                        dateMap[dtStr] = (dateMap[dtStr] || 0) + parseFloat(o.total_amount || 0);
                    });
                    labels = Object.keys(dateMap);
                    dataPts = Object.values(dateMap);
                    if (labels.length === 0) {
                        labels = [new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })];
                        dataPts = [0];
                    }
                }
            }

            this.reportChartSales = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Gross Sales (₹)',
                        data: dataPts,
                        borderColor: '#355C24',
                        backgroundColor: 'rgba(53, 92, 36, 0.08)',
                        tension: 0.35,
                        fill: true,
                        pointBackgroundColor: '#355C24',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => ` Revenue: ₹${parseFloat(context.raw || 0).toFixed(2)}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#EEE9DA' },
                            ticks: {
                                callback: (val) => '₹' + val
                            }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Order Status Mix Doughnut
        const statusCanvas = document.getElementById('chart-reports-status');
        if (statusCanvas) {
            const ctx = statusCanvas.getContext('2d');
            if (this.reportChartStatus) this.reportChartStatus.destroy();

            const deliveredCount = orders.filter(o => o.status === 'delivered').length;
            const transitCount = orders.filter(o => ['out_for_delivery', 'on_the_way'].includes(o.status)).length;
            const prepCount = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length;
            const pendingCount = orders.filter(o => o.status === 'pending').length;
            const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

            const labels = [];
            const dataPts = [];
            const bgColors = [];

            if (deliveredCount > 0) { labels.push('Delivered'); dataPts.push(deliveredCount); bgColors.push('#355C24'); }
            if (transitCount > 0) { labels.push('In Transit'); dataPts.push(transitCount); bgColors.push('#0284C7'); }
            if (prepCount > 0) { labels.push('Preparing'); dataPts.push(prepCount); bgColors.push('#F28C28'); }
            if (pendingCount > 0) { labels.push('Pending'); dataPts.push(pendingCount); bgColors.push('#F59E0B'); }
            if (cancelledCount > 0) { labels.push('Cancelled'); dataPts.push(cancelledCount); bgColors.push('#EF4444'); }

            if (labels.length === 0) {
                labels.push('No Orders in Period');
                dataPts.push(1);
                bgColors.push('#E5DEC8');
            }

            this.reportChartStatus = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data: dataPts,
                        backgroundColor: bgColors,
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                    },
                    cutout: '70%'
                }
            });
        }
    },

    exportCSV() {
        const tf = this.reportsTimeframe || 'all';
        const orders = this.getOrdersForTimeframe(tf);
        if (orders.length === 0) {
            if (typeof toast !== 'undefined') toast.info(`No order data found for ${tf.replace('_', ' ')} to export`);
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Order ID,Customer Name,Phone,Delivery Address,Items,Total Amount (INR),Payment Status,Order Status\n";

        orders.forEach(o => {
            const date = new Date(o.created_at || Date.now()).toISOString().split('T')[0];
            const orderId = (o.order_number || ('ORD-' + o.id)).replace(/,/g, '');
            const cust = (o.customer_name || 'Customer').replace(/,/g, '');
            const phone = (o.customer_phone || '').replace(/,/g, '');
            const addr = `"${(o.shipping_address || '').replace(/"/g, '""')}"`;
            const items = `"${(o.items || []).map(i => `${i.product_name} (${i.quantity})`).join('; ')}"`;
            const amt = parseFloat(o.total_amount || 0).toFixed(2);
            const pay = o.payment_status || 'pending';
            const stat = o.status || 'pending';

            csvContent += `${date},${orderId},${cust},${phone},${addr},${items},${amt},${pay},${stat}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `freshfield_report_${tf}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof toast !== 'undefined') {
            toast.success(`Exported ${orders.length} order records for ${tf.replace('_', ' ')}!`, 'CSV Downloaded');
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const statusNotes = {
                'confirmed': 'Order confirmed by farmer',
                'preparing': 'Farm items are being harvested and packed',
                'ready': 'Order packed and ready for dispatch',
                'out_for_delivery': 'Order handed over for local delivery',
                'on_the_way': 'Delivery agent is on the way to destination',
                'delivered': 'Order delivered fresh to customer',
                'cancelled': 'Order cancelled by farmer'
            };
            const note = statusNotes[status] || `Status updated to ${status}`;
            const result = await API.orders.updateStatus(orderId, status, note);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success(`Order advanced to: ${status.replace(/_/g, ' ')}`);
                await this.loadOrders();
                await this.loadDashboard();
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error(error.message || 'Failed to update order status');
        }
    },

    // ============================================
    // GPS DELIVERY ASSIGNMENT & REAL-TIME TRACKING
    // ============================================
    openAssignDeliveryModal(orderId, orderNumber) {
        const existing = document.getElementById('assign-delivery-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'assign-delivery-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:20px;padding:28px 32px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.22);max-height:92vh;overflow-y:auto;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid #EEE9DA;padding-bottom:14px;">
                    <div>
                        <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#1F211B;margin-bottom:2px;">Assign Delivery Person</h3>
                        <p style="font-size:12px;color:#6F7168;">Order ${orderNumber}</p>
                    </div>
                    <button onclick="document.getElementById('assign-delivery-modal').remove()" style="width:32px;height:32px;border-radius:50%;border:none;background:#F8F5EC;cursor:pointer;font-size:18px;color:#6F7168;">×</button>
                </div>

                <div style="display:flex;flex-direction:column;gap:14px;">
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Delivery Person Name *</label>
                        <input id="dp-name" type="text" placeholder="e.g. Ramesh Kumar"
                               style="width:100%;padding:11px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13.5px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Phone Number *</label>
                        <input id="dp-phone" type="tel" placeholder="e.g. +91 98765 43210"
                               style="width:100%;padding:11px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13.5px;outline:none;">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                            <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Vehicle Type</label>
                            <select id="dp-vehicle-type" style="width:100%;padding:11px 12px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;background:#fff;">
                                <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                                <option value="Electric Scooter">Electric Scooter</option>
                                <option value="Delivery Van">Delivery Van</option>
                                <option value="Auto Rickshaw">Auto Rickshaw</option>
                                <option value="Bicycle">Bicycle</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Vehicle Number</label>
                            <input id="dp-vehicle-number" type="text" placeholder="e.g. MH 12 AB 1234"
                                   style="width:100%;padding:11px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#6F7168;text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:5px;">Delivery Notes (Optional)</label>
                        <textarea id="dp-notes" placeholder="Special handling notes, gate code, landmarks..."
                                  style="width:100%;padding:10px 14px;border:1.5px solid #E5DEC8;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;resize:vertical;min-height:60px;"></textarea>
                    </div>
                </div>

                <!-- Result Box with Link -->
                <div id="dp-result" style="display:none;margin-top:16px;padding:16px;background:#EAF0DF;border-radius:12px;border:1px solid #C5D9A5;">
                    <div style="font-size:13px;font-weight:700;color:#355C24;margin-bottom:6px;"><i class="fas fa-check-circle" style="margin-right:4px;"></i> Delivery Assigned Successfully!</div>
                    <div style="font-size:12px;color:#6F7168;margin-bottom:8px;">Share this unique tracking link with the delivery person:</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input id="dp-tracking-url" type="text" readonly
                               style="flex:1;padding:8px 12px;border:1.5px solid #C5D9A5;border-radius:8px;font-size:11.5px;background:#fff;font-family:monospace;color:#1F211B;">
                        <button onclick="farmer.copyTrackingLink()" style="padding:8px 14px;background:#355C24;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:10px;">
                        <button onclick="farmer.openTrackingLink()" style="flex:1;padding:9px;background:#F28C28;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">
                            <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> Open Tracking Page
                        </button>
                        <button onclick="document.getElementById('assign-delivery-modal').remove();farmer.loadOrders();" style="flex:1;padding:9px;background:#355C24;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">
                            <i class="fas fa-check" style="margin-right:4px;"></i> Done
                        </button>
                    </div>
                </div>

                <div id="dp-error" style="display:none;margin-top:12px;padding:10px 14px;background:#FEE2E2;border-radius:8px;font-size:12.5px;color:#DC2626;"></div>

                <div style="display:flex;gap:12px;margin-top:20px;" id="dp-actions">
                    <button onclick="document.getElementById('assign-delivery-modal').remove()" 
                            style="flex:1;padding:11px;border:1.5px solid #E5DEC8;border-radius:10px;background:#fff;color:#6F7168;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">Cancel</button>
                    <button onclick="farmer.submitAssignDelivery(${orderId})" 
                            style="flex:1;padding:11px;border:none;border-radius:10px;background:#F28C28;color:#fff;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
                        <i class="fas fa-motorcycle"></i> Assign & Generate Link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.getElementById('dp-name').focus();
    },

    async submitAssignDelivery(orderId) {
        const name = document.getElementById('dp-name').value.trim();
        const phone = document.getElementById('dp-phone').value.trim();
        const vehicleType = document.getElementById('dp-vehicle-type').value;
        const vehicleNumber = document.getElementById('dp-vehicle-number').value.trim();
        const notes = document.getElementById('dp-notes').value.trim();
        const errorEl = document.getElementById('dp-error');
        const resultEl = document.getElementById('dp-result');
        const actionsEl = document.getElementById('dp-actions');

        if (!name) {
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Please enter delivery person name.'; }
            return;
        }
        if (!phone) {
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Please enter delivery person phone number.'; }
            return;
        }
        if (errorEl) errorEl.style.display = 'none';

        const submitBtn = document.querySelector('#dp-actions button:last-child');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...'; }

        try {
            const payload = {
                delivery_person_name: name,
                delivery_person_phone: phone,
                vehicle_type: vehicleType,
                vehicle_number: vehicleNumber,
                notes
            };

            let data;
            if (typeof API !== 'undefined' && API.delivery && typeof API.delivery.assign === 'function') {
                data = await API.delivery.assign(orderId, payload);
            } else {
                const token = (typeof auth !== 'undefined' && typeof auth.getToken === 'function') 
                    ? auth.getToken() 
                    : (localStorage.getItem('token') || '');
                const baseUrl = (typeof API !== 'undefined' && API.baseURL) ? API.baseURL : 'http://localhost:5000/api';
                const res = await fetch(`${baseUrl}/delivery/orders/${orderId}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to assign delivery.');
                }
            }

            if (data && data.success) {
                this._lastTrackingUrl = data.tracking_url || `http://localhost:5000/delivery-tracking.html?token=${data.tracking_token}`;
                const urlInput = document.getElementById('dp-tracking-url');
                if (urlInput) urlInput.value = this._lastTrackingUrl;
                if (resultEl) resultEl.style.display = 'block';
                if (actionsEl) actionsEl.style.display = 'none';
                if (typeof toast !== 'undefined') toast.success('Delivery assigned! Share the tracking link with the driver.');
            } else {
                if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = (data && data.message) || 'Failed to assign delivery.'; }
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-motorcycle"></i> Assign & Generate Link'; }
            }
        } catch (e) {
            console.error('Assign delivery error:', e);
            if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = e.message || 'Network error. Please try again.'; }
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-motorcycle"></i> Assign & Generate Link'; }
        }
    },

    copyTrackingLink() {
        const url = this._lastTrackingUrl;
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                if (typeof toast !== 'undefined') toast.success('Tracking link copied to clipboard!');
            }).catch(() => {
                const urlInput = document.getElementById('dp-tracking-url');
                if (urlInput) { urlInput.select(); document.execCommand('copy'); }
                if (typeof toast !== 'undefined') toast.success('Tracking link copied!');
            });
        }
    },

    openTrackingLink() {
        if (this._lastTrackingUrl) window.open(this._lastTrackingUrl, '_blank');
    },

    async viewLiveTracking(orderId) {
        const existing = document.getElementById('live-tracking-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'live-tracking-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:20px;width:100%;max-width:760px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.28);">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #EEE9DA;background:#F8F5EC;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;color:var(--green-primary);font-size:16px;">
                            <i class="fas fa-map-location-dot"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#1F211B;margin:0;">Live Delivery Tracking</h3>
                            <p style="font-size:12px;color:#6F7168;margin-top:2px;" id="lt-subtitle">Connecting live location feed...</p>
                        </div>
                    </div>
                    <button onclick="farmer.closeLiveTracking()" style="width:32px;height:32px;border-radius:50%;border:none;background:#fff;cursor:pointer;font-size:18px;color:#6F7168;box-shadow:0 2px 6px rgba(0,0,0,0.1);">×</button>
                </div>
                
                <div id="live-track-map" style="flex:1;min-height:360px;background:#EAE6DC;position:relative;"></div>

                <div style="padding:16px 24px;background:#F8F5EC;border-top:1px solid #EEE9DA;">
                    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:8px;">
                        <div id="lt-person" style="font-size:13px;color:#1F211B;"><i class="fas fa-motorcycle" style="color:#355C24;margin-right:6px;"></i><strong>—</strong></div>
                        <div id="lt-phone" style="font-size:12px;color:#6F7168;"></div>
                        <div id="lt-vehicle" style="font-size:12px;color:#6F7168;"></div>
                        <div id="lt-status" style="font-size:12px;"><i class="fas fa-circle" style="color:#ccc;margin-right:5px;"></i>—</div>
                        <div id="lt-updated" style="font-size:11.5px;color:#6F7168;margin-left:auto;font-weight:500;"></div>
                    </div>
                    <div style="font-size:12px;color:#6F7168;display:flex;align-items:flex-start;gap:6px;" id="lt-address"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) farmer.closeLiveTracking(); });

        setTimeout(() => this.initLiveTrackMap(orderId), 100);
    },

    async initLiveTrackMap(orderId) {
        if (typeof L === 'undefined') {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'css/vendor/leaflet.css';
            document.head.appendChild(cssLink);

            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'js/vendor/leaflet.js';
                script.onload = resolve;
                script.onerror = () => {
                    const fallback = document.createElement('script');
                    fallback.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    fallback.onload = resolve;
                    fallback.onerror = resolve;
                    document.head.appendChild(fallback);
                };
                document.head.appendChild(script);
            });
        }

        if (typeof io === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'http://localhost:5000/socket.io/socket.io.js';
                script.onload = resolve;
                script.onerror = resolve;
                document.head.appendChild(script);
            });
        }

        const mapEl = document.getElementById('live-track-map');
        if (!mapEl) return;

        this._liveMap = L.map(mapEl, { center: [20.5937, 78.9629], zoom: 5 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this._liveMap);

        this._liveOrderId = orderId;
        this._liveDeliveryMarker = null;
        this._liveDestMarker = null;
        this._liveTrailLine = null;

        // Connect Socket.io
        try {
            if (typeof io !== 'undefined') {
                this._liveSocket = io('http://localhost:5000');
                this._liveSocket.emit('join_order_room', { orderId, userToken: auth.getToken() });

                this._liveSocket.on('location_updated', (data) => {
                    if (data.orderId == this._liveOrderId) {
                        this.applyLiveGPSUpdate(data);
                    }
                });

                this._liveSocket.on('status_updated', (data) => {
                    if (data.orderId == this._liveOrderId) {
                        const statusEl = document.getElementById('lt-status');
                        if (statusEl) {
                            statusEl.innerHTML = `<i class="fas fa-circle" style="color:${data.isDelivered ? '#355C24' : '#F28C28'};margin-right:5px;"></i>${(data.status||'').replace(/_/g,' ').toUpperCase()}`;
                        }
                    }
                });
            }
        } catch(e) {
            console.warn('Socket error on live map, using polling');
        }

        // Initial fetch and polling fallback
        this.pollLiveLocation();
        this._livePollInterval = setInterval(() => this.pollLiveLocation(), 6000);
    },

    applyLiveGPSUpdate(data) {
        if (!this._liveMap) return;
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const updatedEl = document.getElementById('lt-updated');
        if (updatedEl) {
            const acc = data.accuracy ? ` (±${Math.round(data.accuracy)}m)` : '';
            updatedEl.innerHTML = `<i class="fas fa-satellite-dish" style="color:#22c55e;margin-right:4px;"></i>Live: ${new Date(data.recordedAt || Date.now()).toLocaleTimeString()}${acc}`;
        }

        const deliveryIcon = L.divIcon({
            html: `<div style="background:#355C24;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"><i class="fas fa-motorcycle" style="color:white;font-size:14px"></i></div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18]
        });

        if (!this._liveDeliveryMarker) {
            this._liveDeliveryMarker = L.marker([lat, lng], { icon: deliveryIcon })
                .bindPopup(`<b>🛵 Delivery Partner: ${data.delivery_person_name || 'Assigned'}</b>`)
                .addTo(this._liveMap);
        } else {
            this._liveDeliveryMarker.setLatLng([lat, lng]);
        }

        this._liveMap.setView([lat, lng], Math.max(this._liveMap.getZoom(), 15));
    },

    async pollLiveLocation() {
        const orderId = this._liveOrderId;
        if (!orderId || !this._liveMap) return;

        try {
            const token = auth.getToken();
            const res = await fetch(`http://localhost:5000/api/delivery/orders/${orderId}/live`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!data.success) return;

            const subtitle = document.getElementById('lt-subtitle');
            const personEl = document.getElementById('lt-person');
            const phoneEl = document.getElementById('lt-phone');
            const vehicleEl = document.getElementById('lt-vehicle');
            const statusEl = document.getElementById('lt-status');
            const updatedEl = document.getElementById('lt-updated');
            const addressEl = document.getElementById('lt-address');

            if (data.order) {
                if (subtitle) subtitle.textContent = `Order #${data.order.order_number} · Customer: ${data.order.customer_name}`;
                if (addressEl) addressEl.innerHTML = `<i class="fas fa-house" style="color:#F28C28;margin-top:2px;flex-shrink:0;"></i><span>${data.order.shipping_address || 'Delivery Address'}</span>`;
            }

            if (data.assignment) {
                const a = data.assignment;
                if (personEl) personEl.innerHTML = `<i class="fas fa-motorcycle" style="color:#355C24;margin-right:6px;"></i><strong>${a.delivery_person_name || '—'}</strong>`;
                if (phoneEl && a.delivery_person_phone) phoneEl.innerHTML = `<i class="fas fa-phone" style="margin-right:4px;"></i>${a.delivery_person_phone}`;
                if (vehicleEl && (a.vehicle_type || a.vehicle_number)) {
                    vehicleEl.innerHTML = `<i class="fas fa-truck" style="margin-right:4px;"></i>${a.vehicle_type || ''} ${a.vehicle_number ? '(' + a.vehicle_number + ')' : ''}`;
                }
                const statusColor = a.delivery_status === 'delivered' ? '#355C24' : a.delivery_status ? '#F28C28' : '#ccc';
                if (statusEl) statusEl.innerHTML = `<i class="fas fa-circle" style="color:${statusColor};margin-right:5px;"></i>${(a.delivery_status||'assigned').replace(/_/g,' ').toUpperCase()}`;
            }

            if (data.location) {
                this.applyLiveGPSUpdate(data.location);

                if (data.trail && data.trail.length > 1) {
                    const coords = data.trail.map(p => [p.latitude, p.longitude]);
                    if (this._liveTrailLine) this._liveMap.removeLayer(this._liveTrailLine);
                    this._liveTrailLine = L.polyline(coords, { color:'#355C24', weight:3, opacity:0.6, dashArray:'6, 8' }).addTo(this._liveMap);
                }
            } else {
                if (updatedEl && !updatedEl.textContent.includes('Live')) {
                    updatedEl.textContent = 'Waiting for driver GPS signal...';
                }
            }
        } catch(e) {}
    },

    closeLiveTracking() {
        if (this._livePollInterval) clearInterval(this._livePollInterval);
        if (this._liveSocket) {
            this._liveSocket.disconnect();
            this._liveSocket = null;
        }
        this._liveMap = null;
        this._liveOrderId = null;
        const modal = document.getElementById('live-tracking-modal');
        if (modal) modal.remove();
    },

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================
    async loadProfile() {
        try {
            const data = await API.user.getProfile();
            if (data && data.success && data.user) {
                const u = data.user;
                const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
                setVal('profile-name', u.name);
                setVal('profile-email', u.email);
                setVal('profile-phone', u.phone);
                setVal('profile-address', u.address);
                setVal('profile-farm-name', u.farm_name);
                setVal('profile-farm-location', u.farm_location);
                setVal('profile-bio', u.bio);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    },

    async updateProfile() {
        const name = document.getElementById('profile-name').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const address = document.getElementById('profile-address').value.trim();
        const farmName = document.getElementById('profile-farm-name').value.trim();
        const farmLocation = document.getElementById('profile-farm-location').value.trim();
        const bio = document.getElementById('profile-bio').value.trim();
        const imageFile = document.getElementById('profile-image').files[0];

        if (!name) {
            if (typeof toast!=='undefined') toast.error('Name is required');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('farm_name', farmName);
        formData.append('farm_location', farmLocation);
        formData.append('bio', bio);
        if (imageFile) formData.append('profile_image', imageFile);

        try {
            const result = await API.user.updateProfile(formData);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success('Profile updated successfully!');
                const user = auth.getCurrentUser();
                if (user) {
                    user.name = name;
                    auth.setUserData(user);
                }
                const nameEl = document.getElementById('header-user-name');
                if (nameEl) nameEl.textContent = name;
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error('Failed to update profile');
        }
    }
};

// Export to window
window.farmer = farmer;
