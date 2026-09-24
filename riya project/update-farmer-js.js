const fs = require('fs');

const farmerJs = `// FreshField Farmer & Admin Dashboard Logic
const farmer = {
    currentPage: 'dashboard',
    revenueChartInstance: null,
    donutChartInstance: null,
    editingProductId: null,

    init() {
        // Authenticate check
        const user = auth.getCurrentUser();
        if (user) {
            const name = user.name || 'Admin User';
            const firstName = name.split(' ')[0];
            const role = user.role === 'farmer' ? 'Verified Farmer' : (user.role === 'admin' ? 'Super Admin' : 'Admin User');

            const greetingEl = document.getElementById('user-greeting');
            if (greetingEl) greetingEl.textContent = firstName;

            const headerNameEl = document.getElementById('header-user-name');
            if (headerNameEl) headerNameEl.textContent = name;

            const headerRoleEl = document.getElementById('header-user-role');
            if (headerRoleEl) headerRoleEl.textContent = role;

            const avatarEl = document.getElementById('header-avatar');
            if (avatarEl) {
                if (user.profile_image) {
                    avatarEl.innerHTML = \`<img src="\${user.profile_image}" alt="\${name}">\`;
                } else {
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    avatarEl.innerHTML = \`<span>\${initials || 'AD'}</span>\`;
                }
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

        // Load dashboard data
        this.loadDashboard();

        // Show default page
        this.showPage('dashboard');
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
        
        // Hide all page contents
        document.querySelectorAll('.page-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });

        // Show target page
        const target = document.getElementById(\`page-\${page}\`);
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
                const revEl = document.getElementById('stat-revenue');
                if (revEl) revEl.textContent = \`₹\${parseFloat(data.totalRevenue||0).toLocaleString('en-IN')}\`;

                const prodEl = document.getElementById('stat-products');
                if (prodEl) prodEl.textContent = (data.totalProducts || 1248).toLocaleString();

                const ordEl = document.getElementById('stat-orders');
                if (ordEl) ordEl.textContent = (data.totalOrders || 2589).toLocaleString();

                const badge = document.getElementById('pending-badge');
                if (badge) {
                    badge.textContent = data.pendingOrders || 0;
                    badge.style.display = (data.pendingOrders > 0) ? 'inline' : 'none';
                }
            }
        } catch (error) {
            console.log('Using FreshField demo dashboard metrics');
        }

        // Render Charts & Animations
        this.renderRevenueChart();
        this.renderDonutChart();
    },

    renderRevenueChart() {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        if (this.revenueChartInstance) {
            this.revenueChartInstance.destroy();
        }

        const labels = ['1 May', '5 May', '10 May', '15 May', '20 May', '25 May', '31 May'];
        const revenueData = [25000, 45000, 85000, 155000, 90000, 140000, 200000];
        const ordersData  = [30, 65, 90, 120, 75, 95, 135];

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
                        grid: { color: '#EEE9DA', drawBorder: false },
                        ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: '#6F7168',
                            callback: (val) => (val >= 1000 ? (val/1000) + 'K' : val)
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: { display: false },
                        ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: '#6F7168'
                        }
                    }
                }
            }
        });
    },

    renderDonutChart() {
        const ctx = document.getElementById('user-distribution-chart');
        if (!ctx) return;

        if (this.donutChartInstance) {
            this.donutChartInstance.destroy();
        }

        this.donutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Farmers', 'Customers', 'Admins'],
                datasets: [{
                    data: [356, 842, 50],
                    backgroundColor: ['#355C24', '#F28C28', '#D97706'],
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
                        cornerRadius: 8
                    }
                }
            }
        });
    },

    // ============================================
    // PRODUCTS MANAGEMENT
    // ============================================
    async loadProducts() {
        const container = document.getElementById('farmer-products');
        if (!container) return;
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 30px;">Loading catalog...</p>';

        try {
            const data = await API.products.getFarmerProducts();
            if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
                container.innerHTML = data.products.map(p => {
                    let imgUrl = p.image_url || '';
                    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                        imgUrl = \`http://localhost:5000\${imgUrl}\`;
                    }
                    const fallback = 'assets/images/tomatoes.png';
                    const price = parseFloat(p.price).toFixed(2);
                    const unit = p.unit || 'kg';
                    const isAvail = p.is_available !== false;

                    return \`<div class="product-item">
                        <img src="\${imgUrl || fallback}" alt="\${p.name}" onerror="this.onerror=null;this.src='\${fallback}';">
                        <div class="info">
                            <h4>\${p.name}</h4>
                            <p>₹\${price} / \${unit} &bull; \${p.quantity||0} in stock &bull; \${p.total_sold||0} sold</p>
                            <span class="status-badge-pill \${isAvail?'delivered':'cancelled'}" style="margin-top:4px;">
                                \${isAvail ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                        <div class="actions">
                            <button class="btn-icon-sm" onclick="farmer.editProduct(\${p.id})" title="Edit"><i class="fas fa-pen"></i></button>
                            <button class="btn-icon-sm danger" onclick="farmer.deleteProduct(\${p.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>\`;
                }).join('');
            } else {
                container.innerHTML = \`<div style="text-align:center; padding:40px; color:var(--text-muted);">
                    <i class="fas fa-seedling" style="font-size:36px; color:var(--green-primary); margin-bottom:12px;"></i>
                    <p style="font-size:15px; font-weight:600; color:var(--text-dark);">No products added yet</p>
                    <p style="font-size:13px; margin-top:4px;">Click "Add New Product" above to list fresh produce!</p>
                </div>\`;
            }
        } catch (error) {
            console.error('Error loading products:', error);
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Failed to load products</p>';
        }
    },

    showAddProductForm() {
        const title = document.getElementById('product-form-title');
        if (title) title.textContent = 'Add New Product';
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
                if (title) title.textContent = 'Edit Product';
                
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
                        img.src = p.image_url.startsWith('http') ? p.image_url : \`http://localhost:5000\${p.image_url}\`;
                        img.className = 'upload-preview-img';
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
                if (result && result.success && typeof toast!=='undefined') toast.success('Product added successfully!');
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
        if (title) title.textContent = 'Add New Product';
        this.editingProductId = null;
    },

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const result = await API.products.delete(id);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success('Product deleted successfully');
                this.loadProducts();
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error('Failed to delete product');
        }
    },

    // ============================================
    // ORDERS MANAGEMENT
    // ============================================
    async loadOrders() {
        const container = document.getElementById('farmer-orders');
        if (!container) return;
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Loading orders...</p>';

        try {
            const filterEl = document.getElementById('order-filter');
            const filter = filterEl ? filterEl.value : 'all';
            const data = await API.orders.getFarmerOrders();

            if (data && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
                let orders = data.orders;
                if (filter !== 'all') {
                    orders = orders.filter(o => o.status === filter);
                }

                if (orders.length === 0) {
                    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No orders found for selected filter</p>';
                    return;
                }

                container.innerHTML = \`<table class="orders-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${orders.map(o => \`<tr>
                            <td><strong>\${o.order_number||'#ORD-'+o.id}</strong></td>
                            <td>\${o.customer_name||'Customer'}</td>
                            <td>\${o.item_count || 1} items</td>
                            <td>₹\${parseFloat(o.total_amount||0).toFixed(2)}</td>
                            <td><span class="status-badge-pill \${o.status||'pending'}">\${o.status||'pending'}</span></td>
                            <td>\${new Date(o.created_at||Date.now()).toLocaleDateString()}</td>
                            <td>
                                <select onchange="farmer.updateOrderStatus(\${o.id}, this.value)" class="sales-period-select">
                                    <option value="pending" \${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="processing" \${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                                    <option value="shipped" \${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="delivered" \${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="cancelled" \${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                        </tr>\`).join('')}
                    </tbody>
                </table>\`;
            } else {
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No customer orders yet</p>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Failed to load orders</p>';
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const result = await API.orders.updateStatus(orderId, status);
            if (result && result.success) {
                if (typeof toast!=='undefined') toast.success(\`Order status updated to \${status}\`);
                this.loadOrders();
            }
        } catch (error) {
            if (typeof toast!=='undefined') toast.error('Failed to update order status');
        }
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
`;

fs.writeFileSync('C:/farmer-marketplace/client/js/farmer.js', farmerJs, 'utf8');
console.log('Successfully updated farmer.js!');
