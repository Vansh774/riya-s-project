// FreshField Customer Dashboard Logic
const customer = {
    currentPage: 'dashboard',
    currentProducts: [],
    currentPageNum: 1,
    pageSize: 8,
    totalProducts: 0,
    activeCategory: '',
    allOrders: [],
    ordersFilter: 'all',
    ordersSearchQuery: '',
    ordersViewMode: 'cards',
    wishlistProductIds: new Set(),

    fallbackProducts: [],

    init() {
        // Ensure default state on initial load / refresh: all modals strictly closed
        this.closeAllCustomerModals();

        const user = auth.getCurrentUser();
        if (user) {
            const name = user.name || 'Fresh Customer';
            const firstName = name.split(' ')[0];
            
            const greetEl = document.getElementById('user-greeting');
            if (greetEl) greetEl.textContent = firstName;

            const headerNameEl = document.getElementById('header-user-name');
            if (headerNameEl) headerNameEl.textContent = name;

            const avatarEl = document.getElementById('header-avatar');
            if (avatarEl) {
                if (user.profile_image) {
                    avatarEl.innerHTML = `<img src="${user.profile_image}" alt="${name}">`;
                } else {
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    avatarEl.innerHTML = `<span>${initials || 'FC'}</span>`;
                }
            }
        }

        this.setupNavigation();
        this.setupUploadAreas();
        this.patchCartBadge();
        this.setupRealtimeOrderSync();
        this.fetchWishlistIds();

        // Handle URL parameters (e.g. ?page=orders, ?search=..., ?category=...)
        const urlParams = new URLSearchParams(window.location.search);
        const reqPage = urlParams.get('page') || 'dashboard';
        const reqSearch = urlParams.get('search');
        const reqCat = urlParams.get('category');

        if (reqSearch) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = reqSearch;
        }

        if (reqCat) {
            this.activeCategory = reqCat;
            const select = document.getElementById('category-filter');
            if (select) select.value = reqCat;
        }

        const reqFarmer = urlParams.get('farmer');
        if (reqFarmer) {
            this.activeFarmerId = reqFarmer;
            this.showPage('browse');
        } else {
            this.showPage(reqPage);
        }

        const reqAction = urlParams.get('action');
        if (reqAction === 'checkout') {
            setTimeout(() => {
                this.openCheckoutModal();
            }, 300);
        }

        const reqOrderId = urlParams.get('order');
        if (reqOrderId) {
            setTimeout(() => {
                this.openOrderTrackingModal(reqOrderId);
            }, 400);
        }

    },

    setupNavigation() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.dataset.page;
                if (page) {
                    e.preventDefault();
                    this.showPage(page);
                }
            });
        });
    },

    setupUploadAreas() {
        const uploadArea = document.getElementById('profile-upload-area');
        const fileInput = document.getElementById('profile-image');
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', () => {
                const preview = document.getElementById('profile-preview');
                if (!preview) return;
                preview.innerHTML = '';
                if (fileInput.files && fileInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.maxHeight = '100px';
                        img.style.marginTop = '10px';
                        img.style.borderRadius = '8px';
                        preview.appendChild(img);
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                }
            });
        }
    },

    patchCartBadge() {
        const updateBadge = () => {
            const count = cart.getTotalItems ? cart.getTotalItems() : 0;
            const b1 = document.getElementById('cart-count-badge');
            const b2 = document.getElementById('header-cart-badge');
            [b1, b2].forEach(b => {
                if (b) {
                    b.textContent = count;
                    b.style.display = count > 0 ? 'inline-flex' : 'none';
                }
            });
        };

        const origSave = cart.save.bind(cart);
        cart.save = function() {
            origSave();
            updateBadge();
        };
        updateBadge();
    },

    showPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.page-content').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });

        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // Update active class in sidebar nav
        document.querySelectorAll('.sidebar-nav a').forEach(a => {
            a.classList.toggle('active', a.dataset.page === page);
        });

        switch(page) {
            case 'dashboard':
                this.loadDashboardProducts();
                break;
            case 'browse':
                this.loadBrowseProducts();
                break;
            case 'categories':
                // Categories page loaded
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'wishlist':
                this.loadWishlist();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    openCategory(catName) {
        this.activeCategory = catName;
        const select = document.getElementById('category-filter');
        if (select) select.value = catName;

        // Update active pill in browse view
        document.querySelectorAll('#browse-cat-pills button').forEach(btn => {
            const txt = btn.textContent;
            btn.classList.toggle('active', txt.includes(catName));
            if (txt.includes(catName)) {
                btn.style.background = 'var(--green-primary)';
                btn.style.color = 'white';
                btn.style.borderColor = 'var(--green-primary)';
            } else {
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        });

        this.showPage('browse');
    },

    filterCategoryPill(catName, btn) {
        this.activeCategory = catName;
        const select = document.getElementById('category-filter');
        if (select) select.value = catName;

        document.querySelectorAll('#browse-cat-pills button').forEach(b => {
            b.classList.remove('active');
            b.style.background = '';
            b.style.color = '';
            b.style.borderColor = '';
        });

        if (btn) {
            btn.classList.add('active');
            btn.style.background = 'var(--green-primary)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--green-primary)';
        }

        this.currentPageNum = 1;
        this.loadBrowseProducts();
    },

    handleSearch() {
        this.currentPageNum = 1;
        this.showPage('browse');
    },

    // ============================================
    // DASHBOARD FEATURED PICKS
    // ============================================
    async loadDashboardProducts() {
        const grid = document.getElementById('dashboard-product-grid');
        if (!grid) return;

        grid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            grid.innerHTML += `<div style="height:260px; background:var(--beige); border-radius:var(--radius-lg);" class="skeleton"></div>`;
        }

        try {
            const data = await API.products.getAll({ available: 'true' });
            let prods = (data && data.success && Array.isArray(data.products))
                ? data.products.slice(0, 4)
                : [];

            grid.innerHTML = '';
            if (prods.length > 0) {
                prods.forEach(p => {
                    grid.appendChild(this.createProductCard(p));
                });
            } else {
                grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:36px; color:var(--text-muted);">
                    <i class="fas fa-leaf" style="font-size:28px; color:var(--green-primary); margin-bottom:10px; display:block;"></i>
                    <h3 style="font-family:var(--font-serif); font-size:18px; color:var(--text-dark);">No fresh produce listed yet</h3>
                    <p style="font-size:13px; margin-top:4px;">Check back soon as local farmers add their harvest!</p>
                </div>`;
            }
        } catch (e) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:36px; color:var(--text-muted);">
                <p style="font-size:13px;">Unable to load fresh produce right now. Please refresh.</p>
            </div>`;
        }
    },

    // ============================================
    // BROWSE PRODUCTS FULL GRID
    // ============================================
    async loadBrowseProducts() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        grid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            grid.innerHTML += `<div style="height:260px; background:var(--beige); border-radius:var(--radius-lg);" class="skeleton"></div>`;
        }

        try {
            const searchInput = document.getElementById('search-input');
            const search = searchInput ? searchInput.value.trim() : '';
            const categorySelect = document.getElementById('category-filter');
            const category = categorySelect ? categorySelect.value : this.activeCategory;
            const sortSelect = document.getElementById('sort-filter');
            const sort = sortSelect ? sortSelect.value : 'newest';

            const params = { available: 'true' };
            if (search) params.search = search;
            if (category) params.category = category;
            if (this.activeFarmerId) {
                params.farmer = this.activeFarmerId;
                this.renderFarmerFilterBanner(this.activeFarmerId);
            } else {
                const banner = document.getElementById('active-farm-filter-banner');
                if (banner) banner.remove();
            }

            let products = [];
            const data = await API.products.getAll(params);
            
            if (data && data.success && Array.isArray(data.products)) {
                products = data.products;
            }

            // Sort
            if (sort === 'price-low') products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            else if (sort === 'price-high') products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

            this.currentProducts = products;
            this.totalProducts = products.length;

            grid.innerHTML = '';
            if (products.length > 0) {
                const start = (this.currentPageNum - 1) * this.pageSize;
                const end = start + this.pageSize;
                const pageProducts = products.slice(start, end);

                pageProducts.forEach(p => {
                    grid.appendChild(this.createProductCard(p));
                });
                this.setupPagination();
            } else {
                grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted);">
                    <i class="fas fa-leaf" style="font-size:36px; color:var(--green-primary); margin-bottom:12px; display:block;"></i>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark);">No products found</h3>
                    <p style="font-size:13px; margin-top:4px;">Try selecting another category or clear your search.</p>
                </div>`;
                this.setupPagination();
            }
        } catch (error) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted);">
                <i class="fas fa-triangle-exclamation" style="font-size:36px; color:#EF4444; margin-bottom:12px; display:block;"></i>
                <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark);">Could not load products</h3>
                <p style="font-size:13px; margin-top:4px;">Please check your connection and try again.</p>
            </div>`;
        }
    },

    async renderFarmerFilterBanner(farmerId) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        let banner = document.getElementById('active-farm-filter-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'active-farm-filter-banner';
            banner.style.cssText = 'background:linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%); border:1px solid #A7F3D0; border-radius:14px; padding:16px 20px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:16px; box-shadow:0 4px 12px rgba(16, 185, 129, 0.08);';
            grid.parentNode.insertBefore(banner, grid);
        }

        try {
            const res = await API.products.getFarmerProfile(farmerId);
            if (res && res.success && res.farmer) {
                const f = res.farmer;
                banner.innerHTML = `
                    <div style="display:flex; align-items:center; gap:14px;">
                        <div style="width:46px; height:46px; border-radius:12px; background:#059669; color:white; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">
                            🌾
                        </div>
                        <div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <h3 style="margin:0; font-size:17px; font-weight:700; color:#064E3B;">${f.farm_name || f.name}</h3>
                                <span style="background:#10B981; color:white; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">✓ Verified Farm</span>
                            </div>
                            <p style="margin:3px 0 0 0; font-size:12.5px; color:#047857;">
                                <i class="fas fa-map-marker-alt"></i> ${f.farm_location || 'Local Farm'} • Farmer: <strong>${f.name}</strong> • ${f.total_products || 0} Harvests Available
                            </p>
                        </div>
                    </div>
                    <button onclick="customer.clearFarmerFilter()" style="background:#FFFFFF; border:1px solid #D1D5DB; color:#374151; font-weight:600; font-size:12.5px; padding:7px 14px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:6px; flex-shrink:0;">
                        <i class="fas fa-times"></i> Show All Farms
                    </button>
                `;
            }
        } catch (e) {
            console.error('Failed to load farm profile banner:', e);
        }
    },

    clearFarmerFilter() {
        this.activeFarmerId = null;
        const banner = document.getElementById('active-farm-filter-banner');
        if (banner) banner.remove();
        const url = new URL(window.location);
        url.searchParams.delete('farmer');
        window.history.replaceState({}, '', url);
        this.loadBrowseProducts();
    },

    filterByFarmer(farmerId) {
        this.activeFarmerId = farmerId;
        const url = new URL(window.location);
        url.searchParams.set('farmer', farmerId);
        window.history.replaceState({}, '', url);
        this.showPage('browse');
    },

    createProductCard(product, options = {}) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';

        let imgUrl = product.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
            imgUrl = `http://localhost:5000${imgUrl}`;
        }
        const fallback = 'assets/images/tomatoes.png';
        const price = parseFloat(product.price).toFixed(2);
        const unit = product.unit || 'kg';
        const farmer = product.farmer_name || product.farm_name || 'Local Farmer';

        const pData = JSON.stringify({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image_url: imgUrl || fallback,
            farmer_name: farmer,
            quantity: product.quantity || 999
        }).replace(/'/g, "&#39;");

        const isWishlisted = this.wishlistProductIds ? this.wishlistProductIds.has(Number(product.id)) : false;
        const isWishlistPage = !!options.isWishlistPage;

        // Navigate to product-detail on click unless button was clicked
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-cart-card') || e.target.closest('.wishlist-btn-top') || e.target.closest('.btn-remove-wishlist')) {
                return;
            }
            window.location.href = `product-detail.html?id=${product.id}`;
        });

        card.innerHTML = `
            <div class="product-card-top">
                <img src="${imgUrl || fallback}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}';">
                <button class="wishlist-btn-top ${isWishlisted ? 'active' : ''}" data-product-id="${product.id}" onclick="event.stopPropagation(); customer.toggleWishlist(${product.id})" title="${isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}">
                    <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="product-card-body">
                <h4 class="product-card-name">${product.name}</h4>
                <div class="product-card-farm" onclick="event.stopPropagation(); customer.filterByFarmer(${product.farmer_id})" style="cursor:pointer; color:var(--green-primary); font-weight:600;" title="Click to view all produce from this farm">
                    <i class="fas fa-seedling" style="margin-right:3px;"></i> ${farmer}
                </div>
                <div class="product-card-price">₹${price} <span class="product-card-unit">/ ${unit}</span></div>
                <button class="btn-add-cart-card" onclick='event.stopPropagation(); customer.addToCart(this, ${pData})'>
                    <i class="fas fa-shopping-basket"></i> Add to Cart
                </button>
                ${isWishlistPage ? `
                <button class="btn-remove-wishlist" onclick="event.stopPropagation(); customer.removeFromWishlist(${product.id})" title="Remove from wishlist">
                    <i class="fas fa-trash-alt"></i> Remove from Wishlist
                </button>` : ''}
            </div>
        `;
        return card;
    },

    setupPagination() {
        const container = document.getElementById('product-pagination');
        if (!container) return;
        const totalPages = Math.ceil(this.totalProducts / this.pageSize);
        if (totalPages <= 1) { container.innerHTML = ''; return; }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="select-filter" style="${i === this.currentPageNum ? 'background:var(--green-primary); color:white; border-color:var(--green-primary);' : ''}" onclick="customer.goToPage(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    },

    goToPage(p) {
        this.currentPageNum = p;
        this.loadBrowseProducts();
        window.scrollTo({ top: 300, behavior: 'smooth' });
    },

    // ============================================
    // CART & ADD-TO-CART FEEDBACK
    // ============================================
    addToCart(btnOrP, p) {
        let button = null;
        let productData = btnOrP;
        if (btnOrP && (btnOrP.nodeType || btnOrP instanceof HTMLElement)) {
            button = btnOrP;
            productData = p;
        } else if (p && (p.nodeType || p instanceof HTMLElement)) {
            button = p;
        }

        if (!productData) return;

        cart.addItem({
            id: productData.id,
            name: productData.name,
            price: parseFloat(productData.price),
            image: productData.image_url || productData.image || 'assets/images/tomatoes.png',
            farmer: productData.farmer_name || productData.farmer || 'Local Farmer',
            maxQuantity: productData.quantity || 999
        }, button);
    },

    // ============================================
    // WISHLIST
    // ============================================
    async fetchWishlistIds() {
        try {
            const data = await API.user.getWishlist();
            if (data && data.success && Array.isArray(data.wishlist)) {
                this.wishlistProductIds = new Set(data.wishlist.map(w => Number(w.product_id || w.id)));
                this.updateWishlistBadge();
                this.syncAllWishlistButtons();
            }
        } catch (e) {
            console.warn('Error fetching wishlist IDs:', e);
        }
    },

    updateWishlistBadge() {
        const badge = document.getElementById('wishlist-count-badge');
        if (badge) {
            const count = this.wishlistProductIds ? this.wishlistProductIds.size : 0;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    },

    syncAllWishlistButtons() {
        document.querySelectorAll('.wishlist-btn-top[data-product-id]').forEach(btn => {
            const pid = Number(btn.dataset.productId);
            const isWishlisted = this.wishlistProductIds ? this.wishlistProductIds.has(pid) : false;
            btn.classList.toggle('active', isWishlisted);
            btn.title = isWishlisted ? 'Remove from wishlist' : 'Save to wishlist';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isWishlisted ? 'fas fa-heart' : 'far fa-heart';
            }
        });
        this.updateWishlistBadge();
    },

    updateWishlistButtons(productId, isWishlisted) {
        const numId = Number(productId);
        document.querySelectorAll(`.wishlist-btn-top[data-product-id="${numId}"]`).forEach(btn => {
            btn.classList.toggle('active', isWishlisted);
            btn.title = isWishlisted ? 'Remove from wishlist' : 'Save to wishlist';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isWishlisted ? 'fas fa-heart' : 'far fa-heart';
            }
        });
        this.updateWishlistBadge();
    },

    async loadWishlist(silent = false) {
        const grid = document.getElementById('wishlist-grid');
        if (!grid) return;
        
        if (!silent) {
            grid.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;"><i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Loading wishlist...</p>';
        }

        try {
            const data = await API.user.getWishlist();
            if (data && data.success && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
                this.wishlistProductIds = new Set(data.wishlist.map(w => Number(w.product_id || w.id)));
                this.updateWishlistBadge();
                this.syncAllWishlistButtons();
                
                grid.innerHTML = '';
                data.wishlist.forEach(item => {
                    grid.appendChild(this.createProductCard({
                        id: item.product_id || item.id,
                        name: item.product_name || item.name,
                        price: item.price,
                        image_url: item.image_url,
                        farmer_name: item.farmer_name
                    }, { isWishlistPage: true }));
                });
            } else {
                this.wishlistProductIds = new Set();
                this.updateWishlistBadge();
                this.syncAllWishlistButtons();
                grid.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:60px 20px; background:white; border-radius:18px; border:1px dashed var(--beige-mid);">
                        <div style="width:70px; height:70px; background:#FFF1F2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:#E11D48; font-size:28px;">
                            <i class="far fa-heart"></i>
                        </div>
                        <h3 style="font-family:var(--font-serif); font-size:22px; color:var(--text-dark); margin-bottom:8px;">Your wishlist is empty</h3>
                        <p style="font-size:13.5px; color:var(--text-muted); max-width:420px; margin:0 auto 20px;">
                            Click the heart icon on any fresh produce card to save it to your wishlist for later.
                        </p>
                        <button class="btn-order-action primary" onclick="customer.showPage('browse')">
                            <i class="fas fa-store"></i> Browse Fresh Produce
                        </button>
                    </div>`;
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            grid.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;">No wishlist items saved yet</p>';
        }
    },

    async removeFromWishlist(productId) {
        const numId = Number(productId);
        try {
            await API.user.removeFromWishlist(numId);
        } catch (err) {
            console.warn('Remove wishlist error:', err);
        }
        if (this.wishlistProductIds) this.wishlistProductIds.delete(numId);
        this.updateWishlistButtons(numId, false);
        this.loadWishlist(true);
    },

    async toggleWishlist(productId) {
        const numId = Number(productId);
        const isWishlisted = this.wishlistProductIds ? this.wishlistProductIds.has(numId) : false;

        if (isWishlisted) {
            await this.removeFromWishlist(numId);
        } else {
            try {
                await API.user.addToWishlist(numId);
            } catch (err) {
                console.warn('Add wishlist error:', err);
            }
            if (this.wishlistProductIds) this.wishlistProductIds.add(numId);
            this.updateWishlistButtons(numId, true);
            if (this.currentPage === 'wishlist') {
                this.loadWishlist(true);
            }
        }
    },

    // ============================================
    // ORDERS & TRACKING
    // ============================================
    currentTrackedOrderId: null,
    _trackingPollTimer: null,
    _orderSyncInterval: null,
    _globalSocket: null,

    setupRealtimeOrderSync() {
        try {
            if (typeof io !== 'undefined' && !this._globalSocket) {
                this._globalSocket = io('http://localhost:5000');
                
                this._globalSocket.on('order_status_changed', (data) => {
                    const user = auth.getCurrentUser();
                    if (user && data && (data.customerId == user.id || !data.customerId)) {
                        if (this.currentPage === 'orders') {
                            this.loadOrders(true);
                        }
                        if (this.currentTrackedOrderId && this.currentTrackedOrderId == data.orderId) {
                            this.openOrderTrackingModal(this.currentTrackedOrderId, true);
                        }
                        if (typeof toast !== 'undefined' && data.status) {
                            toast.info(`Order #${data.order_number || data.orderId} status: ${data.status.replace(/_/g, ' ').toUpperCase()} 🌾`);
                        }
                    }
                });

                this._globalSocket.on('status_updated', (data) => {
                    if (this.currentTrackedOrderId && this.currentTrackedOrderId == data.orderId) {
                        this.openOrderTrackingModal(this.currentTrackedOrderId, true);
                    }
                    if (this.currentPage === 'orders') {
                        this.loadOrders(true);
                    }
                });
            }
        } catch (err) {
            console.warn('Socket.io client sync init:', err.message);
        }

        if (!this._orderSyncInterval) {
            this._orderSyncInterval = setInterval(() => {
                if (this.currentPage === 'orders') {
                    this.loadOrders(true);
                }
            }, 8000);
        }
    },

    async loadOrders(silent = false) {
        const container = document.getElementById('customer-orders');
        if (!container) return;
        
        if (!silent && (!this.allOrders || this.allOrders.length === 0)) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
                    <i class="fas fa-spinner fa-spin" style="font-size:28px; margin-bottom:14px; color:var(--green-primary); display:block;"></i>
                    <div style="font-family:var(--font-serif); font-size:18px; color:var(--text-dark); margin-bottom:6px;">Loading your farm orders...</div>
                    <p style="font-size:13px;">Fetching the freshest status from our local growers.</p>
                </div>`;
        }

        try {
            const data = await API.orders.getCustomerOrders();
            this.allOrders = (data && data.success && Array.isArray(data.orders)) ? data.orders : [];
            this.updateOrdersKPIs();
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
            if (!silent) {
                container.innerHTML = `
                    <div style="text-align:center; padding:50px 20px; background:white; border-radius:16px; border:1px solid var(--beige-mid);">
                        <i class="fas fa-exclamation-triangle" style="font-size:36px; color:#DC2626; margin-bottom:12px;"></i>
                        <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark); margin-bottom:6px;">Failed to load orders</h3>
                        <p style="font-size:13px; color:var(--text-muted); margin-bottom:18px;">We couldn't connect to retrieve your order history right now.</p>
                        <button class="btn-order-action primary" onclick="customer.loadOrders()">
                            <i class="fas fa-rotate-right"></i> Try Again
                        </button>
                    </div>`;
            }
        }
    },

    updateOrdersKPIs() {
        const total = this.allOrders.length;
        const active = this.allOrders.filter(o => ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'on_the_way'].includes(o.status)).length;
        const delivered = this.allOrders.filter(o => o.status === 'delivered').length;
        const cancelled = this.allOrders.filter(o => o.status === 'cancelled').length;
        const totalSpent = this.allOrders.reduce((sum, o) => {
            return o.status !== 'cancelled' ? sum + parseFloat(o.total_amount || 0) : sum;
        }, 0);

        const setEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setEl('stat-order-total', total);
        setEl('stat-order-active', active);
        setEl('stat-order-delivered', delivered);
        setEl('stat-order-spent', `₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

        setEl('tab-count-all', total);
        setEl('tab-count-active', active);
        setEl('tab-count-delivered', delivered);
        setEl('tab-count-cancelled', cancelled);
    },

    filterOrders(filter) {
        this.ordersFilter = filter;
        document.querySelectorAll('.order-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderOrders();
    },

    handleOrderSearch(query) {
        this.ordersSearchQuery = (query || '').trim().toLowerCase();
        const clearBtn = document.getElementById('orders-search-clear');
        if (clearBtn) clearBtn.style.display = this.ordersSearchQuery ? 'block' : 'none';
        this.renderOrders();
    },

    clearOrderSearch() {
        const input = document.getElementById('orders-search-input');
        if (input) input.value = '';
        this.ordersSearchQuery = '';
        const clearBtn = document.getElementById('orders-search-clear');
        if (clearBtn) clearBtn.style.display = 'none';
        this.renderOrders();
    },

    setOrdersView(mode) {
        this.ordersViewMode = mode;
        const cardsBtn = document.getElementById('view-btn-cards');
        const tableBtn = document.getElementById('view-btn-table');
        if (cardsBtn) cardsBtn.classList.toggle('active', mode === 'cards');
        if (tableBtn) tableBtn.classList.toggle('active', mode === 'table');
        this.renderOrders();
    },

    getOrderStatusMeta(status) {
        const s = (status || 'pending').toLowerCase();
        switch (s) {
            case 'delivered':
                return { label: 'Delivered', icon: 'fas fa-check-circle', pillClass: 'delivered' };
            case 'confirmed':
                return { label: 'Confirmed', icon: 'fas fa-circle-check', pillClass: 'confirmed' };
            case 'processing':
            case 'packed':
                return { label: 'Processing & Packed', icon: 'fas fa-box', pillClass: 'processing' };
            case 'out_for_delivery':
            case 'on_the_way':
                return { label: 'Out for Delivery', icon: 'fas fa-truck-fast', pillClass: 'out_for_delivery' };
            case 'cancelled':
                return { label: 'Cancelled', icon: 'fas fa-circle-xmark', pillClass: 'cancelled' };
            case 'pending':
            default:
                return { label: 'Order Placed', icon: 'fas fa-clock', pillClass: 'pending' };
        }
    },

    getProduceFallback(name) {
        const n = (name || '').toLowerCase();
        if (n.includes('apple') || n.includes('fruit') || n.includes('berry') || n.includes('mango') || n.includes('banana') || n.includes('orange')) {
            return 'assets/images/hero-produce.png';
        }
        if (n.includes('carrot') || n.includes('root') || n.includes('potato') || n.includes('onion') || n.includes('beet')) {
            return 'assets/images/carrots.png';
        }
        if (n.includes('spinach') || n.includes('green') || n.includes('kale') || n.includes('lettuce') || n.includes('herb') || n.includes('mint')) {
            return 'assets/images/spinach.png';
        }
        return 'assets/images/tomatoes.png';
    },

    renderOrders() {
        const container = document.getElementById('customer-orders');
        if (!container) return;

        // Filter list by selected tab
        let list = this.allOrders;
        if (this.ordersFilter === 'active') {
            list = list.filter(o => ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'on_the_way'].includes(o.status));
        } else if (this.ordersFilter === 'delivered') {
            list = list.filter(o => o.status === 'delivered');
        } else if (this.ordersFilter === 'cancelled') {
            list = list.filter(o => o.status === 'cancelled');
        }

        // Filter list by search query
        if (this.ordersSearchQuery) {
            const q = this.ordersSearchQuery;
            list = list.filter(o => {
                const num = (o.order_number || `#ORD-${o.id}`).toLowerCase();
                const status = (o.status || '').toLowerCase();
                const address = (o.shipping_address || '').toLowerCase();
                const hasItem = (o.items || []).some(i => 
                    (i.product_name || '').toLowerCase().includes(q) || 
                    (i.farmer_name || '').toLowerCase().includes(q)
                );
                return num.includes(q) || status.includes(q) || address.includes(q) || hasItem;
            });
        }

        // Empty state handling
        if (list.length === 0) {
            const isFiltered = this.ordersFilter !== 'all' || this.ordersSearchQuery !== '';
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; background:white; border-radius:18px; border:1px dashed var(--beige-mid);">
                    <div style="width:70px; height:70px; background:var(--green-pale); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--green-primary); font-size:28px;">
                        <i class="fas ${isFiltered ? 'fa-magnifying-glass' : 'fa-basket-shopping'}"></i>
                    </div>
                    <h3 style="font-family:var(--font-serif); font-size:22px; color:var(--text-dark); margin-bottom:8px;">
                        ${isFiltered ? 'No orders match your search' : 'No orders placed yet'}
                    </h3>
                    <p style="font-size:13.5px; color:var(--text-muted); max-width:440px; margin:0 auto 20px;">
                        ${isFiltered 
                            ? 'Try clearing your search query or switching tabs to see your other farm orders.' 
                            : 'Explore seasonal harvests directly from verified organic farmers in your region.'}
                    </p>
                    ${isFiltered 
                        ? `<button class="btn-order-action secondary" onclick="customer.clearOrderSearch(); customer.filterOrders('all');">
                               <i class="fas fa-rotate-left"></i> Reset All Filters
                           </button>`
                        : `<button class="btn-order-action primary" onclick="customer.showPage('browse')">
                               <i class="fas fa-store"></i> Browse Fresh Products
                           </button>`}
                </div>`;
            return;
        }

        // Render Cards or Table view
        if (this.ordersViewMode === 'table') {
            container.innerHTML = this.renderOrdersTable(list);
        } else {
            container.innerHTML = this.renderOrderCards(list);
        }
    },

    renderOrderCards(orders) {
        return `<div class="orders-cards-grid">
            ${orders.map(o => {
                const meta = this.getOrderStatusMeta(o.status);
                const isInTransit = ['out_for_delivery', 'on_the_way'].includes(o.status);
                const orderNum = o.order_number || `#ORD-${o.id}`;
                const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }) : 'Recent';
                const timeStr = o.created_at ? new Date(o.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '';

                const items = o.items || [];
                const firstThree = items.slice(0, 3);
                const remaining = items.length - 3;
                const payMethod = (o.payment_method || 'cod').replace(/_/g, ' ');
                const payStatus = o.payment_status || (o.status === 'delivered' ? 'paid' : 'pending');

                return `
                <div class="order-card-modern" onclick="customer.showOrderTracking(${o.id})">
                    <!-- Card Header -->
                    <div class="order-card-header">
                        <div class="order-card-id-block">
                            <div class="order-id-chip" onclick="event.stopPropagation()">
                                <i class="fas fa-hashtag" style="font-size:10px; color:var(--text-light);"></i>
                                <span>${orderNum}</span>
                                <i class="far fa-copy copy-btn" onclick="customer.copyOrderId('${orderNum}', event)" title="Copy Order #"></i>
                            </div>
                            <div class="order-date-text">
                                <i class="far fa-calendar-alt"></i>
                                <span>${dateStr}${timeStr ? ` · ${timeStr}` : ''}</span>
                            </div>
                            <span class="order-pay-method-badge">
                                <i class="fas fa-credit-card" style="font-size:10px;"></i>
                                ${payMethod} (${payStatus})
                            </span>
                        </div>

                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="status-pill ${meta.pillClass}">
                                <i class="${meta.icon}"></i>
                                ${meta.label}
                            </span>
                            ${isInTransit ? `<span class="pulse-live-dot" title="Live Delivery Active"></span>` : ''}
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="order-card-body">
                        <!-- Left: Items list -->
                        <div class="order-items-scroll">
                            ${firstThree.map(item => {
                                const fallbackImg = this.getProduceFallback(item.product_name);
                                const imgSrc = item.image_url || fallbackImg;
                                const itemTotal = (parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2);
                                return `
                                <div class="order-single-item">
                                    <img src="${imgSrc}" class="order-item-img" alt="${item.product_name || 'Produce'}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                                    <div class="order-item-info">
                                        <div class="order-item-name">${item.product_name || 'Fresh Produce'}</div>
                                        <div class="order-item-meta">
                                            <span>Qty: <strong>${item.quantity || 1}</strong></span>
                                            <span>•</span>
                                            <span>₹${parseFloat(item.price || 0).toFixed(2)} each</span>
                                            ${item.farmer_name ? `<span>•</span><span class="order-item-farmer"><i class="fas fa-seedling"></i> ${item.farmer_name}</span>` : ''}
                                        </div>
                                    </div>
                                    <div style="font-weight:700; color:var(--green-dark); font-size:14px; white-space:nowrap;">
                                        ₹${itemTotal}
                                    </div>
                                </div>`;
                            }).join('')}
                            
                            ${remaining > 0 ? `
                                <div style="font-size:12px; color:var(--text-muted); font-style:italic; padding-left:72px;">
                                    + ${remaining} more item${remaining > 1 ? 's' : ''} in this delivery package
                                </div>` : ''}
                        </div>

                        <!-- Right: Shipping destination snippet -->
                        <div class="order-shipping-dest" onclick="event.stopPropagation()">
                            <div class="order-shipping-dest-title">
                                <i class="fas fa-location-dot" style="color:var(--orange);"></i>
                                Delivery Address
                            </div>
                            <div style="line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                ${o.shipping_address || 'Rajkot, Gujarat (Default Address)'}
                            </div>
                        </div>
                    </div>

                    <!-- Card Footer -->
                    <div class="order-card-footer" onclick="event.stopPropagation()">
                        <div class="order-total-block">
                            <span class="order-total-label">Grand Total:</span>
                            <span class="order-total-value">₹${parseFloat(o.total_amount || 0).toFixed(2)}</span>
                            <span class="free-delivery-tag"><i class="fas fa-truck-ramp-box"></i> Farm Direct</span>
                        </div>

                        <div class="order-card-actions">
                            ${isInTransit ? `
                                <button class="btn-order-action live-map" onclick="customer.openCustomerLiveTracking(${o.id})">
                                    <i class="fas fa-motorcycle"></i> Live GPS Map
                                </button>` : ''}
                            <button class="btn-order-action primary" onclick="customer.showOrderTracking(${o.id})">
                                <i class="fas fa-route"></i> Order Details &amp; Tracking
                            </button>
                            <button class="btn-order-action secondary" onclick="customer.reorderItems(${o.id}, event)" title="Add all items from this order to your cart">
                                <i class="fas fa-rotate-right"></i> Buy Again
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },

    renderOrdersTable(orders) {
        return `
        <div class="orders-table-card">
            <div class="orders-table-container">
                <table class="orders-table-modern">
                    <thead>
                        <tr>
                            <th>Order Details</th>
                            <th>Produce Items</th>
                            <th>Payment</th>
                            <th>Total</th>
                            <th>Current Status</th>
                            <th style="text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const meta = this.getOrderStatusMeta(o.status);
                            const isInTransit = ['out_for_delivery', 'on_the_way'].includes(o.status);
                            const orderNum = o.order_number || `#ORD-${o.id}`;
                            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            }) : 'Recent';
                            const items = o.items || [];
                            const itemsSummary = items.map(i => `${i.product_name} (${i.quantity})`).join(', ') || `${o.item_count || 1} items`;
                            const payMethod = (o.payment_method || 'cod').replace(/_/g, ' ');

                            return `
                            <tr style="cursor:pointer;" onclick="customer.showOrderTracking(${o.id})">
                                <td>
                                    <div style="font-weight:700; color:var(--text-dark); display:flex; align-items:center; gap:6px;">
                                        <span>${orderNum}</span>
                                        <i class="far fa-copy copy-btn" onclick="customer.copyOrderId('${orderNum}', event)" title="Copy Order #"></i>
                                    </div>
                                    <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">
                                        <i class="far fa-calendar-alt"></i> ${dateStr}
                                    </div>
                                </td>
                                <td>
                                    <div style="max-width:280px; font-size:13px; color:var(--text-body); line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                        ${itemsSummary}
                                    </div>
                                    <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                                        ${items.length} product${items.length !== 1 ? 's' : ''} from local farm
                                    </div>
                                </td>
                                <td>
                                    <span class="order-pay-method-badge">
                                        ${payMethod}
                                    </span>
                                </td>
                                <td>
                                    <span style="font-family:var(--font-serif); font-weight:800; font-size:16px; color:var(--green-primary);">
                                        ₹${parseFloat(o.total_amount || 0).toFixed(2)}
                                    </span>
                                </td>
                                <td>
                                    <div style="display:inline-flex; align-items:center; gap:6px;">
                                        <span class="status-pill ${meta.pillClass}">
                                            <i class="${meta.icon}"></i>
                                            ${meta.label}
                                        </span>
                                        ${isInTransit ? `<span class="pulse-live-dot" title="Live Delivery Active"></span>` : ''}
                                    </div>
                                </td>
                                <td style="text-align:right;" onclick="event.stopPropagation()">
                                    <div style="display:inline-flex; gap:6px; align-items:center; justify-content:flex-end;">
                                        ${isInTransit ? `
                                            <button class="btn-order-action live-map" style="padding:6px 12px; font-size:11.5px;" onclick="customer.openCustomerLiveTracking(${o.id})">
                                                <i class="fas fa-motorcycle"></i> Map
                                            </button>` : ''}
                                        <button class="btn-order-action primary" style="padding:6px 14px; font-size:11.5px;" onclick="customer.showOrderTracking(${o.id})">
                                            <i class="fas fa-route"></i> Details
                                        </button>
                                        <button class="btn-order-action secondary" style="padding:6px 10px; font-size:11.5px;" onclick="customer.reorderItems(${o.id}, event)" title="Buy Again">
                                            <i class="fas fa-rotate-right"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    copyOrderId(orderNum, event) {
        if (event) event.stopPropagation();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(orderNum).then(() => {
                if (typeof toast !== 'undefined') toast.success(`Copied ${orderNum} to clipboard!`);
            }).catch(() => {
                this.fallbackCopy(orderNum);
            });
        } else {
            this.fallbackCopy(orderNum);
        }
    },

    fallbackCopy(text) {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        if (typeof toast !== 'undefined') toast.success(`Copied ${text} to clipboard!`);
    },

    reorderItems(orderId, event) {
        if (event) event.stopPropagation();
        const order = this.allOrders.find(o => o.id == orderId);
        if (!order || !Array.isArray(order.items) || order.items.length === 0) {
            if (typeof toast !== 'undefined') toast.error('No items found to reorder.');
            return;
        }

        let addedCount = 0;
        order.items.forEach(item => {
            if (typeof cart !== 'undefined' && cart.addItem) {
                cart.addItem({
                    id: item.product_id,
                    name: item.product_name,
                    price: parseFloat(item.price || 0),
                    image: item.image_url || 'assets/images/tomatoes.png',
                    farmer: item.farmer_name || 'Local Farm',
                    quantity: item.quantity || 1
                });
                addedCount++;
            }
        });

        if (typeof toast !== 'undefined') {
            toast.success(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to your cart! 🛒`);
        }

        if (typeof cart !== 'undefined' && !cart.isOpen) {
            cart.toggle();
        }
    },

    showOrderTracking(orderId) {
        return this.openOrderTrackingModal(orderId);
    },

    async openOrderTrackingModal(orderId, silent = false) {
        // Automatically close all other modals first if opening fresh
        if (!silent) {
            this.closeAllCustomerModals();
        }

        this.currentTrackedOrderId = orderId;
        const modal = document.getElementById('order-tracking-modal');
        if (!modal) return;

        const titleEl = document.getElementById('track-order-title');
        const dateEl = document.getElementById('track-order-date');
        const statusEl = document.getElementById('track-current-status-text');
        const addrEl = document.getElementById('track-shipping-address');
        const totalEl = document.getElementById('track-total-amount');
        const stepperEl = document.getElementById('tracking-stepper');
        const itemsListEl = document.getElementById('track-items-list');
        const historyLogsEl = document.getElementById('track-history-logs');

        // Only show loading placeholders on initial modal open
        if (!silent) {
            if (titleEl) titleEl.textContent = `Order #${orderId}`;
            if (dateEl) dateEl.textContent = 'Loading order date...';
            if (statusEl) statusEl.textContent = 'Fetching status...';
            if (addrEl) addrEl.textContent = 'Loading destination...';
            if (totalEl) totalEl.textContent = 'Calculating...';
            if (stepperEl) stepperEl.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Loading tracking details...</div>';
            if (itemsListEl) itemsListEl.innerHTML = '';
            if (historyLogsEl) historyLogsEl.innerHTML = '';

            modal.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Auto-poll tracking progress while modal stays open
            if (this._trackingPollTimer) clearInterval(this._trackingPollTimer);
            this._trackingPollTimer = setInterval(() => {
                if (this.currentTrackedOrderId === orderId && modal.classList.contains('open')) {
                    this.openOrderTrackingModal(orderId, true);
                } else {
                    clearInterval(this._trackingPollTimer);
                    this._trackingPollTimer = null;
                }
            }, 3500);
        }

        try {
            const [orderRes, historyRes] = await Promise.all([
                API.orders.getById(orderId),
                API.orders.getHistory(orderId)
            ]);

            if (!orderRes || !orderRes.success || !orderRes.order) {
                if (typeof toast !== 'undefined') toast.error('Could not load order details');
                return;
            }

            const order = orderRes.order;
            const history = (historyRes && historyRes.success && Array.isArray(historyRes.history)) ? historyRes.history : [];

            const orderDateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently';
            if (titleEl) titleEl.textContent = order.order_number || `#ORD-${order.id}`;
            if (dateEl) dateEl.textContent = `Placed on ${orderDateStr}`;
            if (statusEl) statusEl.textContent = (order.status || 'pending').replace(/_/g, ' ').toUpperCase();
            if (addrEl) addrEl.textContent = order.shipping_address || 'Standard Delivery Address';
            if (totalEl) totalEl.textContent = `₹${parseFloat(order.total_amount||0).toFixed(2)}`;

            // Live Tracking Banner if In Transit
            const isInTransit = ['out_for_delivery', 'on_the_way'].includes(order.status);
            const liveMapBannerId = 'cust-live-map-banner';
            let bannerEl = document.getElementById(liveMapBannerId);
            if (!bannerEl) {
                bannerEl = document.createElement('div');
                bannerEl.id = liveMapBannerId;
                const modalBody = modal.querySelector('.modal-content') || modal.firstElementChild;
                if (modalBody) {
                    const statusCard = modalBody.querySelector('.tracking-status-card') || modalBody.children[1];
                    if (statusCard && statusCard.nextSibling) {
                        modalBody.insertBefore(bannerEl, statusCard.nextSibling);
                    }
                }
            }

            if (isInTransit) {
                bannerEl.innerHTML = `
                    <div style="background:linear-gradient(135deg, #EAF0DF 0%, #E0F2FE 100%); border:1.5px solid #0284C7; border-radius:12px; padding:14px 18px; margin:16px 0; display:flex; align-items:center; justify-content:space-between; box-shadow:0 4px 12px rgba(2,132,199,0.12);">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:40px; height:40px; border-radius:10px; background:#0284C7; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px;">
                                <i class="fas fa-motorcycle"></i>
                            </div>
                            <div>
                                <div style="font-weight:700; font-size:14px; color:#1F211B; display:flex; align-items:center; gap:6px;">
                                    Live GPS Delivery Tracking Active
                                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
                                </div>
                                <div style="font-size:12px; color:#6F7168; margin-top:2px;">Your driver is on the move with fresh farm produce</div>
                            </div>
                        </div>
                        <button onclick="customer.openCustomerLiveTracking(${order.id})" style="padding:8px 16px; background:#0284C7; color:#fff; font-weight:700; font-size:12.5px; border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(2,132,199,0.3);">
                            <i class="fas fa-map-location-dot"></i> View Live Map
                        </button>
                    </div>
                `;
            } else {
                bannerEl.innerHTML = '';
            }

            // Render Items
            const itemsListEl = document.getElementById('track-items-list');
            if (itemsListEl) {
                const fallbackImg = 'assets/images/tomatoes.png';
                itemsListEl.innerHTML = (order.items || []).map(it => {
                    let img = it.image_url || fallbackImg;
                    if (img && !img.startsWith('http') && !img.startsWith('assets/')) img = `http://localhost:5000${img}`;
                    return `<div style="display:flex; align-items:center; justify-content:space-between; background:var(--white); padding:8px 12px; border-radius:8px; border:1px solid var(--beige);">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${img}" style="width:36px; height:36px; object-fit:cover; border-radius:6px;" onerror="this.onerror=null;this.src='${fallbackImg}';">
                            <div>
                                <div style="font-weight:600; font-size:13px; color:var(--text-dark);">${it.product_name}</div>
                                <div style="font-size:11.5px; color:var(--text-muted);">${it.quantity} &times; ₹${parseFloat(it.price).toFixed(2)}</div>
                            </div>
                        </div>
                        <div style="font-weight:700; font-size:13px; color:var(--text-dark);">₹${parseFloat(it.total || (it.price * it.quantity)).toFixed(2)}</div>
                    </div>`;
                }).join('');
            }

            // 7-Stage Workflow Definition
            const stages = [
                { key: 'pending', name: 'Order Placed', desc: 'Order received and sent to local farm' },
                { key: 'confirmed', name: 'Order Confirmed', desc: 'Farmer confirmed availability' },
                { key: 'preparing', name: 'Preparing Produce', desc: 'Produce freshly harvested and packaged' },
                { key: 'ready', name: 'Ready for Dispatch', desc: 'Packed and waiting for local delivery agent' },
                { key: 'out_for_delivery', name: 'Out for Delivery', desc: 'Package in transit with delivery partner' },
                { key: 'on_the_way', name: 'On the Way', desc: 'Approaching your delivery destination' },
                { key: 'delivered', name: 'Delivered Fresh', desc: 'Handed over directly at your door' }
            ];

            const currentStatus = order.status || 'pending';
            const stageOrder = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'on_the_way', 'delivered'];
            const currentIndex = stageOrder.indexOf(currentStatus);

            const stepperEl = document.getElementById('tracking-stepper');
            if (stepperEl) {
                if (currentStatus === 'cancelled') {
                    stepperEl.innerHTML = `<div style="background:var(--red-soft); color:var(--red); padding:16px; border-radius:8px; text-align:center; font-weight:600;">
                        <i class="fas fa-times-circle" style="font-size:24px; margin-bottom:6px; display:block;"></i>
                        This order was cancelled.
                    </div>`;
                } else {
                    stepperEl.innerHTML = stages.map((st, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        const stateClass = isCompleted ? 'completed' : (isCurrent ? 'current' : 'upcoming');

                        const log = history.find(h => h.status === st.key);
                        const timeStr = log ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                        const noteStr = log && log.note ? log.note : '';

                        return `<div class="step-row ${stateClass}">
                            <div class="step-icon-col">
                                <div class="step-dot">
                                    ${isCompleted ? '<i class="fas fa-check"></i>' : (isCurrent ? '<i class="fas fa-spinner fa-spin"></i>' : idx + 1)}
                                </div>
                                ${idx < stages.length - 1 ? '<div class="step-line"></div>' : ''}
                            </div>
                            <div class="step-content">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div class="step-label">${st.name}</div>
                                    ${timeStr ? `<span style="font-size:11px; color:var(--text-muted);">${timeStr}</span>` : ''}
                                </div>
                                <div class="step-meta">${st.desc}</div>
                                ${noteStr ? `<div class="step-note"><i class="fas fa-info-circle" style="margin-right:4px;"></i>${noteStr}</div>` : ''}
                            </div>
                        </div>`;
                    }).join('');
                }
            }

            // Render status history logs
            const historyLogsEl = document.getElementById('track-history-logs');
            if (historyLogsEl) {
                if (history.length > 0) {
                    historyLogsEl.innerHTML = history.map(h => `
                        <div style="background:var(--white); padding:8px 12px; border-radius:6px; border-left:3px solid var(--green-primary); display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong style="color:var(--text-dark);">${h.status.replace(/_/g, ' ').toUpperCase()}</strong>
                                <span style="color:var(--text-muted); margin-left:6px;">— ${h.note || 'Status updated'}</span>
                            </div>
                            <span style="color:var(--text-light); font-size:11px;">${new Date(h.created_at).toLocaleString()}</span>
                        </div>
                    `).join('');
                } else {
                    historyLogsEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px;">No historical notes yet.</div>';
                }
            }

        } catch (error) {
            console.error('Error fetching order tracking:', error);
            if (typeof toast !== 'undefined') toast.error('Failed to load tracking data');
        }
    },

    // ============================================
    // CUSTOMER LIVE GPS MAP MODAL
    // ============================================
    async openCustomerLiveTracking(orderId) {
        const existing = document.getElementById('customer-live-tracking-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'customer-live-tracking-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:20px;width:100%;max-width:760px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.3);">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #EEE9DA;background:#F8F5EC;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:38px;height:38px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;color:var(--green-primary);font-size:18px;">
                            <i class="fas fa-truck-fast"></i>
                        </div>
                        <div>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#1F211B;margin:0;">Live Delivery Tracking</h3>
                                <span class="status-badge-pill out_for_delivery" id="clt-badge" style="font-size:10.5px;padding:2px 8px;">LIVE</span>
                            </div>
                            <p style="font-size:12px;color:#6F7168;margin-top:2px;" id="clt-subtitle">Connecting to live delivery feed...</p>
                        </div>
                    </div>
                    <button onclick="customer.closeCustomerLiveTracking()" style="width:32px;height:32px;border-radius:50%;border:none;background:#fff;cursor:pointer;font-size:18px;color:#6F7168;box-shadow:0 2px 6px rgba(0,0,0,0.1);">×</button>
                </div>
                
                <div id="customer-live-map" style="flex:1;min-height:360px;background:#EAE6DC;position:relative;"></div>

                <div style="padding:16px 24px;background:#F8F5EC;border-top:1px solid #EEE9DA;">
                    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:8px;">
                        <div id="clt-driver" style="font-size:13px;color:#1F211B;"><i class="fas fa-motorcycle" style="color:#355C24;margin-right:6px;"></i><strong>Driver assigned</strong></div>
                        <div id="clt-vehicle" style="font-size:12px;color:#6F7168;"></div>
                        <div id="clt-status" style="font-size:12px;"><i class="fas fa-circle" style="color:#0284C7;margin-right:5px;"></i>En Route</div>
                        <div id="clt-updated" style="font-size:11.5px;color:#6F7168;margin-left:auto;font-weight:500;"></div>
                    </div>
                    <div style="font-size:12px;color:#6F7168;display:flex;align-items:flex-start;gap:6px;" id="clt-address"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) customer.closeCustomerLiveTracking(); });

        setTimeout(() => this.initCustomerMap(orderId), 100);
    },

    async initCustomerMap(orderId) {
        if (typeof L === 'undefined') {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(cssLink);

            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        const mapEl = document.getElementById('customer-live-map');
        if (!mapEl) return;

        this._custLiveMap = L.map(mapEl, { center: [20.5937, 78.9629], zoom: 5 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this._custLiveMap);

        this._custOrderId = orderId;
        this._custDeliveryMarker = null;
        this._custDestMarker = null;
        this._custTrailLine = null;

        // Connect Socket.io
        try {
            if (typeof io !== 'undefined') {
                this._custSocket = io('http://localhost:5000');
                this._custSocket.emit('join_order_room', { orderId, userToken: auth.getToken() });

                this._custSocket.on('location_updated', (data) => {
                    if (data.orderId == this._custOrderId) {
                        this.applyCustomerLiveGPS(data);
                    }
                });

                this._custSocket.on('status_updated', (data) => {
                    if (data.orderId == this._custOrderId) {
                        const statusEl = document.getElementById('clt-status');
                        if (statusEl) {
                            const isDelivered = data.status === 'delivered';
                            statusEl.innerHTML = `<i class="fas fa-circle" style="color:${isDelivered ? '#355C24' : '#0284C7'};margin-right:5px;"></i>${(data.status||'').replace(/_/g,' ').toUpperCase()}`;
                        }
                    }
                });

                this._custSocket.on('delivery_completed', () => {
                    const statusEl = document.getElementById('clt-status');
                    if (statusEl) statusEl.innerHTML = '<i class="fas fa-circle-check" style="color:#355C24;margin-right:5px;"></i>DELIVERED';
                    if (typeof toast !== 'undefined') toast.success('Your order has been delivered! 🎉');
                });
            }
        } catch(e) {
            console.warn('Socket error on customer live map, using polling fallback');
        }

        this.pollCustomerLocation();
        this._custPollInterval = setInterval(() => this.pollCustomerLocation(), 6000);
    },

    applyCustomerLiveGPS(data) {
        if (!this._custLiveMap) return;
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const updatedEl = document.getElementById('clt-updated');
        if (updatedEl) {
            const acc = data.accuracy ? ` (±${Math.round(data.accuracy)}m)` : '';
            updatedEl.innerHTML = `<i class="fas fa-satellite-dish" style="color:#22c55e;margin-right:4px;"></i>Live: ${new Date(data.recordedAt || Date.now()).toLocaleTimeString()}${acc}`;
        }

        const deliveryIcon = L.divIcon({
            html: `<div style="background:#355C24;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35)"><i class="fas fa-motorcycle" style="color:white;font-size:15px"></i></div>`,
            className: '', iconSize: [38, 38], iconAnchor: [19, 19]
        });

        if (!this._custDeliveryMarker) {
            this._custDeliveryMarker = L.marker([lat, lng], { icon: deliveryIcon })
                .bindPopup(`<b>🛵 Driver: ${data.delivery_person_name || 'Assigned'}</b><br>On the way to your door`)
                .addTo(this._custLiveMap);
        } else {
            this._custDeliveryMarker.setLatLng([lat, lng]);
        }

        this._custLiveMap.setView([lat, lng], Math.max(this._custLiveMap.getZoom(), 15));
    },

    async pollCustomerLocation() {
        const orderId = this._custOrderId;
        if (!orderId || !this._custLiveMap) return;

        try {
            const token = auth.getToken();
            const res = await fetch(`http://localhost:5000/api/delivery/orders/${orderId}/live`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!data.success) return;

            const subtitle = document.getElementById('clt-subtitle');
            const driverEl = document.getElementById('clt-driver');
            const vehicleEl = document.getElementById('clt-vehicle');
            const statusEl = document.getElementById('clt-status');
            const updatedEl = document.getElementById('clt-updated');
            const addressEl = document.getElementById('clt-address');

            if (data.order) {
                if (subtitle) subtitle.textContent = `Order #${data.order.order_number}`;
                if (addressEl) addressEl.innerHTML = `<i class="fas fa-house" style="color:#F28C28;margin-top:2px;flex-shrink:0;"></i><span>Destination: ${data.order.shipping_address || 'Delivery Address'}</span>`;

                // Destination Pin
                let destLat = parseFloat(data.order.destination_latitude);
                let destLng = parseFloat(data.order.destination_longitude);
                if (!isNaN(destLat) && !isNaN(destLng) && !this._custDestMarker) {
                    const destinationIcon = L.divIcon({
                        html: `<div style="background:#F28C28;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35)"><i class="fas fa-house" style="color:white;font-size:15px"></i></div>`,
                        className: '', iconSize: [38, 38], iconAnchor: [19, 19]
                    });
                    this._custDestMarker = L.marker([destLat, destLng], { icon: destinationIcon })
                        .bindPopup(`<b>📍 Your Delivery Address</b><br>${data.order.shipping_address}`)
                        .addTo(this._custLiveMap);
                }
            }

            if (data.assignment) {
                const a = data.assignment;
                if (driverEl) driverEl.innerHTML = `<i class="fas fa-motorcycle" style="color:#355C24;margin-right:6px;"></i><strong>${a.delivery_person_name || 'Driver Assigned'}</strong>`;
                if (vehicleEl && (a.vehicle_type || a.vehicle_number)) {
                    vehicleEl.innerHTML = `<i class="fas fa-truck" style="margin-right:4px;"></i>${a.vehicle_type || ''} ${a.vehicle_number ? '(' + a.vehicle_number + ')' : ''}`;
                }
                const isDelivered = a.delivery_status === 'delivered';
                if (statusEl) statusEl.innerHTML = `<i class="fas fa-circle" style="color:${isDelivered ? '#355C24' : '#0284C7'};margin-right:5px;"></i>${(a.delivery_status||'in transit').replace(/_/g,' ').toUpperCase()}`;
            }

            if (data.location) {
                this.applyCustomerLiveGPS(data.location);

                if (data.trail && data.trail.length > 1) {
                    const coords = data.trail.map(p => [p.latitude, p.longitude]);
                    if (this._custTrailLine) this._custLiveMap.removeLayer(this._custTrailLine);
                    this._custTrailLine = L.polyline(coords, { color:'#355C24', weight:3.5, opacity:0.65, dashArray:'6, 8' }).addTo(this._custLiveMap);
                }
            } else {
                if (updatedEl && !updatedEl.textContent.includes('Live')) {
                    updatedEl.textContent = 'Awaiting driver GPS signal...';
                }
            }
        } catch(e) {}
    },

    closeCustomerLiveTracking() {
        if (this._custPollInterval) clearInterval(this._custPollInterval);
        if (this._custSocket) {
            this._custSocket.disconnect();
            this._custSocket = null;
        }
        this._custLiveMap = null;
        this._custOrderId = null;
        const modal = document.getElementById('customer-live-tracking-modal');
        if (modal) modal.remove();
    },

    refreshCurrentTracking() {
        if (this.currentTrackedOrderId) {
            this.openOrderTrackingModal(this.currentTrackedOrderId, true);
            if (typeof toast !== 'undefined') toast.info('Tracking timeline refreshed from MySQL');
        }
    },

    closeAllCustomerModals() {
        const modalIds = ['checkout-modal', 'order-success-modal', 'order-tracking-modal'];
        modalIds.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                modal.classList.remove('open');
                modal.style.display = '';
            }
        });

        // Also close GPS live modal if present
        const liveModal = document.getElementById('customer-live-tracking-modal');
        if (liveModal) this.closeCustomerLiveTracking();

        // Also close cart drawer if open
        if (typeof cart !== 'undefined' && cart.isOpen) {
            cart.close();
        }

        // Clean any other modal overlays
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.classList.remove('open');
            el.style.display = '';
        });

        // Restore body scroll
        document.body.style.overflow = '';
    },

    checkRestoreBodyScroll() {
        const hasOpenModal = document.querySelector('.modal-overlay.open') || document.getElementById('customer-live-tracking-modal');
        const isCartOpen = typeof cart !== 'undefined' && cart.isOpen;
        if (!hasOpenModal && !isCartOpen) {
            document.body.style.overflow = '';
        }
    },

    closeOrderTrackingModal() {
        if (this._trackingPollTimer) {
            clearInterval(this._trackingPollTimer);
            this._trackingPollTimer = null;
        }
        this.currentTrackedOrderId = null;
        const modal = document.getElementById('order-tracking-modal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = '';
        }
        this.checkRestoreBodyScroll();
        this.loadOrders(true); // Smoothly refresh the orders list and KPIs
    },

    closeTrackingModal() {
        this.closeOrderTrackingModal();
    },

    // ============================================
    // CHECKOUT MODAL
    // ============================================
    selectedPaymentMethod: null,

    openCheckoutModal() {
        const items = cart.getItems();
        if (!items || items.length === 0) {
            if (typeof toast !== 'undefined') toast.warning('Your basket is empty! Add farm produce first.');
            return;
        }

        const total = cart.getTotal();
        if (total < 600) {
            const msg = 'Cart must having 600 INR to buy';
            if (typeof toast !== 'undefined') {
                toast.error(msg);
            } else {
                alert(msg);
            }
            if (typeof cart !== 'undefined' && !cart.isOpen) {
                cart.toggle();
            }
            return;
        }

        // Ensure all other modals & overlays are closed first
        this.closeAllCustomerModals();

        const user = auth.getCurrentUser() || {};
        const modal = document.getElementById('checkout-modal');
        if (!modal) return;

        // --- Reset payment selection every time modal opens ---
        this.selectedPaymentMethod = null;
        ['cash_on_delivery', 'upi', 'card'].forEach(method => {
            const card = document.getElementById(`pm-card-${method}`);
            if (card) card.classList.remove('selected');
            const indicator = document.getElementById(`pm-indicator-${method}`);
            if (indicator) {
                const icon = indicator.querySelector('i');
                if (icon) icon.style.display = 'none';
            }
        });
        const hintEl = document.getElementById('payment-selected-hint');
        if (hintEl) { hintEl.textContent = 'Please select one'; hintEl.style.color = '#ef4444'; }
        const submitBtn = document.getElementById('btn-submit-order');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.innerHTML = 'Please select a payment method';
        }

        // --- Pre-fill address & phone ---
        const addrField = document.getElementById('checkout-address');
        if (addrField && !addrField.value) addrField.value = user.address || '';

        const phoneField = document.getElementById('checkout-phone');
        if (phoneField && !phoneField.value) phoneField.value = user.phone || '';

        // --- Render itemised order summary ---
        const summaryEl = document.getElementById('checkout-summary');
        if (summaryEl) {
            let subtotal = 0;
            const itemsHtml = items.map(item => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQty = parseInt(item.quantity) || 1;
                const lineTotal = itemPrice * itemQty;
                subtotal += lineTotal;

                let imgSrc = item.image || 'assets/images/tomatoes.png';
                if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('assets/')) {
                    imgSrc = `http://localhost:5000${imgSrc}`;
                }

                return `
                    <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--beige-mid);">
                        <img src="${imgSrc}" alt="${item.name}" 
                             style="width:44px; height:44px; border-radius:8px; object-fit:cover; flex-shrink:0; background:var(--beige);"
                             onerror="this.src='assets/images/tomatoes.png'">
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12.5px; font-weight:600; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                            <div style="font-size:11.5px; color:var(--text-muted); margin-top:1px;">
                                Qty: ${itemQty} × ₹${itemPrice.toFixed(2)}
                            </div>
                        </div>
                        <div style="font-size:13px; font-weight:700; color:var(--green-dark); flex-shrink:0;">
                            ₹${lineTotal.toFixed(2)}
                        </div>
                    </div>`;
            }).join('');

            summaryEl.innerHTML = `
                ${itemsHtml}
                <div style="margin-top:10px; padding-top:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px; color:var(--text-muted);">
                        <span>Subtotal</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px; color:var(--text-muted);">
                        <span>Delivery</span>
                        <strong style="color:var(--green-primary);">FREE</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:700; border-top:1px solid var(--beige-mid); padding-top:8px;">
                        <span style="color:var(--text-dark);">Total</span>
                        <span style="color:var(--green-dark);">₹${subtotal.toFixed(2)}</span>
                    </div>
                    ${subtotal < 600 ? `
                    <div style="margin-top:10px; padding:8px 12px; background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; font-size:12px; color:#DC2626; font-weight:700; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-exclamation-triangle" style="color:#EF4444; font-size:14px;"></i>
                        <span>Cart must having 600 INR to buy. (Need ₹${(600 - subtotal).toFixed(2)} more)</span>
                    </div>` : ''}
                </div>`;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    },

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        const validMethods = ['cash_on_delivery', 'upi', 'card'];

        // Update card visuals
        validMethods.forEach(m => {
            const card = document.getElementById(`pm-card-${m}`);
            const indicator = document.getElementById(`pm-indicator-${m}`);
            const icon = indicator ? indicator.querySelector('i') : null;

            if (m === method) {
                if (card) card.classList.add('selected');
                if (icon) icon.style.display = 'block';
            } else {
                if (card) card.classList.remove('selected');
                if (icon) icon.style.display = 'none';
            }
        });

        // Update hint text
        const hintEl = document.getElementById('payment-selected-hint');
        const labels = { cash_on_delivery: '💵 Cash on Delivery', upi: '📱 UPI', card: '💳 Card' };
        if (hintEl) { hintEl.textContent = `✓ ${labels[method] || method} selected`; hintEl.style.color = 'var(--green-primary)'; }

        // Enable Place Order button with total if meeting min amount
        const total = cart.getTotal();
        const submitBtn = document.getElementById('btn-submit-order');
        if (submitBtn) {
            if (total < 600) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
                submitBtn.style.cursor = 'not-allowed';
                submitBtn.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i> Cart must having 600 INR to buy (₹${total.toFixed(2)})`;
            } else {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
                submitBtn.innerHTML = `<i class="fas fa-check-circle" style="margin-right:6px;"></i> Place Order (₹${total.toFixed(2)})`;
            }
        }
    },

    closeCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = '';
        }
        this.checkRestoreBodyScroll();
    },

    async confirmPlaceOrder() {
        const items = cart.getItems();
        if (!items || items.length === 0) {
            if (typeof toast !== 'undefined') toast.warning('Your basket is empty!');
            return;
        }

        const address = (document.getElementById('checkout-address') || {}).value?.trim() || '';
        const phone = (document.getElementById('checkout-phone') || {}).value?.trim() || '';

        // Validate payment method
        if (!this.selectedPaymentMethod) {
            if (typeof toast !== 'undefined') toast.error('Please select a payment method to continue.');
            return;
        }

        // Validate address
        if (!address) {
            if (typeof toast !== 'undefined') toast.error('Please enter your delivery address.');
            const addrField = document.getElementById('checkout-address');
            if (addrField) addrField.focus();
            return;
        }

        const paymentMethod = this.selectedPaymentMethod;
        const total = cart.getTotal();

        // Enforce 600 INR minimum order threshold
        if (total < 600) {
            const msg = 'Cart must having 600 INR to buy';
            if (typeof toast !== 'undefined') {
                toast.error(msg);
            } else {
                alert(msg);
            }
            return;
        }

        // Disable button while submitting (prevent duplicates)
        const btn = document.getElementById('btn-submit-order');
        let btnOriginal = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.innerHTML = `<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i> Placing Order...`;
        }

        const orderPayload = {
            items: items.map(it => ({
                product_id: parseInt(it.id, 10),
                quantity: parseInt(it.quantity, 10) || 1
            })),
            shipping_address: address,
            payment_method: paymentMethod,
            notes: phone ? `Phone: ${phone}` : ''
        };

        try {
            const res = await API.orders.create(orderPayload);

            if (res && res.success && res.order) {
                // SUCCESS — clear cart ONLY after backend confirms
                cart.clear();
                cart.close();

                // Close checkout modal completely
                this.closeCheckoutModal();

                // Open ONLY order success modal
                this.openOrderSuccessModal(res.order, paymentMethod, total);

                // Reload orders in background
                this.loadOrders().catch(() => {});

            } else {
                throw new Error((res && res.message) || 'Order creation failed. Please try again.');
            }

        } catch (err) {
            console.error('Order placement error:', err);
            if (typeof toast !== 'undefined') toast.error(err.message || 'Failed to place order. Please try again.');
            // Re-enable button so customer can retry
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerHTML = btnOriginal;
            }
        }
    },

    openOrderSuccessModal(order, paymentMethod, total) {
        // Automatically close all other modals first
        this.closeAllCustomerModals();

        const successModal = document.getElementById('order-success-modal');
        if (!successModal) {
            // Fallback: navigate to orders page
            this.showPage('orders');
            return;
        }

        // Format payment method for display
        const pmLabels = {
            'cash_on_delivery': 'Cash on Delivery',
            'cod': 'Cash on Delivery',
            'upi': 'UPI',
            'card': 'Credit / Debit Card'
        };
        const pmDisplay = pmLabels[paymentMethod] || paymentMethod || 'Cash on Delivery';

        // Populate order details dynamically with actual API data
        const orderIdEl = document.getElementById('success-order-id');
        if (orderIdEl) orderIdEl.textContent = order.order_number || `#ORD-${order.id}`;

        const orderDateEl = document.getElementById('success-order-date');
        if (orderDateEl) {
            const d = order.created_at ? new Date(order.created_at) : new Date();
            orderDateEl.textContent = d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        }

        const pmEl = document.getElementById('success-payment-method');
        if (pmEl) pmEl.textContent = pmDisplay;

        const statusEl = document.getElementById('success-payment-status');
        if (statusEl) statusEl.textContent = (order.payment_status || 'PENDING').toUpperCase();

        const totalEl = document.getElementById('success-order-total');
        const displayTotal = total || parseFloat(order.total_amount) || 0;
        if (totalEl) totalEl.textContent = `₹${displayTotal.toFixed(2)}`;

        // Wire up Track My Order button
        const trackBtn = document.getElementById('btn-success-track');
        if (trackBtn) {
            const newTrackBtn = trackBtn.cloneNode(true);
            trackBtn.parentNode.replaceChild(newTrackBtn, trackBtn);
            newTrackBtn.addEventListener('click', () => {
                // Close success modal completely
                this.closeOrderSuccessModal();
                // Switch to My Orders page and open tracking
                this.showPage('orders');
                this.loadOrders().then(() => {
                    setTimeout(() => {
                        if (order && order.id) {
                            this.openOrderTrackingModal(order.id);
                        }
                    }, 250);
                }).catch(() => {
                    if (order && order.id) {
                        setTimeout(() => this.openOrderTrackingModal(order.id), 250);
                    }
                });
            });
        }

        // Wire up Continue Shopping button
        const continueBtn = document.getElementById('btn-success-continue');
        if (continueBtn) {
            const newContinueBtn = continueBtn.cloneNode(true);
            continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
            newContinueBtn.addEventListener('click', () => {
                this.closeOrderSuccessModal();
                this.showPage('browse');
            });
        }

        // Show ONLY the success modal
        successModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    },

    showOrderSuccessModal(order, paymentMethod, total) {
        return this.openOrderSuccessModal(order, paymentMethod, total);
    },

    closeOrderSuccessModal() {
        const modal = document.getElementById('order-success-modal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = '';
        }
        this.checkRestoreBodyScroll();
    },

    // ============================================
    // PROFILE
    // ============================================
    async loadProfile() {
        try {
            const data = await API.user.getProfile();
            if (data && data.success && data.user) {
                const u = data.user;
                if (typeof auth !== 'undefined' && auth.setUserData) {
                    auth.setUserData(u);
                }
                const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
                setVal('profile-name', u.name);
                setVal('profile-email', u.email);
                setVal('profile-phone', u.phone);
                setVal('profile-address', u.address);
            }
        } catch (error) {
            console.log('Profile loaded');
        }
    },

    async updateProfile() {
        const name = document.getElementById('profile-name').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const address = document.getElementById('profile-address').value.trim();
        const imageFile = document.getElementById('profile-image').files[0];

        if (!name) {
            if (typeof toast !== 'undefined') toast.error('Name is required');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', address);
        if (imageFile) formData.append('profile_image', imageFile);

        try {
            const result = await API.user.updateProfile(formData);
            if (result && result.success) {
                if (typeof toast !== 'undefined') toast.success('Profile updated successfully!');
                const user = auth.getCurrentUser();
                if (user) {
                    user.name = name;
                    user.phone = phone;
                    user.address = address;
                    auth.setUserData(user);
                }
                const nameEl = document.getElementById('header-user-name');
                if (nameEl) nameEl.textContent = name;
            }
        } catch (error) {
            if (typeof toast !== 'undefined') toast.error('Failed to update profile');
        }
    }
};

function proceedToCheckout() {
    if (typeof cart !== 'undefined') {
        const items = cart.getItems();
        if (!items || items.length === 0) {
            if (typeof toast !== 'undefined') toast.warning('Your basket is empty! Add farm produce first.');
            return;
        }
        const total = cart.getTotal();
        if (total < 600) {
            const msg = 'Cart must having 600 INR to buy';
            if (typeof toast !== 'undefined') {
                toast.error(msg);
            } else {
                alert(msg);
            }
            return;
        }
    }
    if (typeof cart !== 'undefined' && cart.isOpen) {
        cart.close();
    }
    if (typeof customer !== 'undefined' && customer.openCheckoutModal) {
        customer.openCheckoutModal();
    } else {
        window.location.href = 'customer-dashboard.html?page=orders';
    }
}

// Global escape key handler to dismiss any active modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (typeof customer !== 'undefined' && customer.closeAllCustomerModals) {
            customer.closeAllCustomerModals();
        }
    }
});

window.proceedToCheckout = proceedToCheckout;
window.customer = customer;

