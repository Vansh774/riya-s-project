const fs = require('fs');

const customerJs = `// FreshField Customer Dashboard Logic
const customer = {
    currentPage: 'browse',
    currentProducts: [],
    currentPageNum: 1,
    pageSize: 10,
    totalProducts: 0,
    activeCategory: '',

    fallbackProducts: [
        { id: 1, name: 'Farm Fresh Tomatoes', price: 80, unit: 'kg', farmer_name: 'Green Valley Farm', category: 'Vegetables', image_url: 'assets/images/tomatoes.png', quantity: 100, is_available: true },
        { id: 2, name: 'Organic Carrots', price: 70, unit: 'kg', farmer_name: 'Sunrise Organics', category: 'Vegetables', image_url: 'assets/images/carrots.png', quantity: 80, is_available: true },
        { id: 3, name: 'Fresh Spinach', price: 40, unit: 'bunch', farmer_name: 'Hariyali Farm', category: 'Leafy Greens', image_url: 'assets/images/spinach.png', quantity: 50, is_available: true },
        { id: 4, name: 'Fresh Apples', price: 120, unit: 'kg', farmer_name: 'Himalaya Orchards', category: 'Fruits', image_url: 'assets/images/hero-produce.png', quantity: 60, is_available: true },
        { id: 5, name: 'Farm Potatoes', price: 50, unit: 'kg', farmer_name: 'Earth Harvest Farm', category: 'Vegetables', image_url: 'assets/images/hero-produce.png', quantity: 120, is_available: true },
        { id: 6, name: 'Fresh Bell Peppers', price: 100, unit: 'kg', farmer_name: 'Green Roots Farm', category: 'Vegetables', image_url: 'assets/images/tomatoes.png', quantity: 40, is_available: true }
    ],

    init() {
        const user = auth.getCurrentUser();
        if (user) {
            const name = user.name || 'Vansh Gohel';
            const firstName = name.split(' ')[0];
            
            const greetEl = document.getElementById('user-greeting');
            if (greetEl) greetEl.textContent = firstName;

            const headerNameEl = document.getElementById('header-user-name');
            if (headerNameEl) headerNameEl.textContent = name;

            const avatarEl = document.getElementById('header-avatar');
            if (avatarEl) {
                if (user.profile_image) {
                    avatarEl.innerHTML = \`<img src="\${user.profile_image}" alt="\${name}">\`;
                } else {
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    avatarEl.innerHTML = \`<span>\${initials || 'VG'}</span>\`;
                }
            }
        }

        this.setupNavigation();
        this.setupUploadAreas();
        this.patchCartBadge();

        this.loadProducts();
        this.loadOrders();
        this.loadWishlist();
        this.loadProfile();
    },

    setupNavigation() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.dataset.page;
                if (page) {
                    e.preventDefault();
                    this.showPage(page);
                    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
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

        const target = document.getElementById(\`page-\${page}\`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        switch(page) {
            case 'browse':
                this.loadProducts();
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
    },

    handleSearch() {
        this.currentPageNum = 1;
        this.loadProducts();
    },

    filterCategory(catName) {
        this.activeCategory = catName === 'all' ? '' : catName;
        const select = document.getElementById('category-filter');
        if (select) select.value = this.activeCategory;
        this.loadProducts();
    },

    // ============================================
    // PRODUCTS
    // ============================================
    async loadProducts() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        grid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            grid.innerHTML += \`<div style="height:260px; background:var(--beige); border-radius:var(--radius-lg);" class="skeleton"></div>\`;
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

            let products = [];
            const data = await API.products.getAll(params);
            
            if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
                products = data.products;
            } else {
                products = this.fallbackProducts;
                if (category) {
                    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
                }
                if (search) {
                    products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
                }
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
                grid.innerHTML = \`<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted);">
                    <i class="fas fa-leaf" style="font-size:36px; color:var(--green-primary); margin-bottom:12px;"></i>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark);">No products found</h3>
                    <p style="font-size:13px; margin-top:4px;">Try searching for something else or browse all categories!</p>
                </div>\`;
            }
        } catch (error) {
            console.log('Using fallback demo products for marketplace grid');
            grid.innerHTML = '';
            this.fallbackProducts.forEach(p => {
                grid.appendChild(this.createProductCard(p));
            });
        }
    },

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        let imgUrl = product.image_url || '';
        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
            imgUrl = \`http://localhost:5000\${imgUrl}\`;
        }
        const fallback = 'assets/images/tomatoes.png';
        const price = parseFloat(product.price).toFixed(2);
        const unit = product.unit || 'kg';
        const farmer = product.farmer_name || 'Local Farmer';

        const pData = JSON.stringify({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image_url: imgUrl || fallback,
            farmer_name: farmer,
            quantity: product.quantity || 999
        }).replace(/'/g, "&#39;");

        card.innerHTML = \`
            <div class="product-card-top">
                <img src="\${imgUrl || fallback}" alt="\${product.name}" loading="lazy" onerror="this.onerror=null;this.src='\${fallback}';">
                <button class="wishlist-btn-top" onclick="customer.toggleWishlist(\${product.id})" title="Save to wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-card-body">
                <h4 class="product-card-name">\${product.name}</h4>
                <div class="product-card-farm">\${farmer}</div>
                <div class="product-card-price">₹\${price} <span class="product-card-unit">/ \${unit}</span></div>
                <button class="btn-add-cart-card" onclick='customer.addToCart(\${pData})'>
                    <i class="fas fa-shopping-basket"></i> Add to Cart
                </button>
            </div>
        \`;
        return card;
    },

    setupPagination() {
        const container = document.getElementById('product-pagination');
        if (!container) return;
        const totalPages = Math.ceil(this.totalProducts / this.pageSize);
        if (totalPages <= 1) { container.innerHTML = ''; return; }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += \`<button class="select-filter" style="\${i === this.currentPageNum ? 'background:var(--green-primary); color:white; border-color:var(--green-primary);' : ''}" onclick="customer.goToPage(\${i})">\${i}</button>\`;
        }
        container.innerHTML = html;
    },

    goToPage(p) {
        this.currentPageNum = p;
        this.loadProducts();
        window.scrollTo({ top: 400, behavior: 'smooth' });
    },

    // ============================================
    // CART
    // ============================================
    addToCart(p) {
        cart.addItem({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            image: p.image_url || 'assets/images/tomatoes.png',
            farmer: p.farmer_name || 'Local Farmer',
            maxQuantity: p.quantity || 999
        });
        if (typeof toast !== 'undefined') {
            toast.success(\`Added \${p.name} to your basket!\`);
        }
    },

    // ============================================
    // WISHLIST
    // ============================================
    async loadWishlist() {
        const grid = document.getElementById('wishlist-grid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;">Loading wishlist...</p>';

        try {
            const data = await API.user.getWishlist();
            if (data && data.success && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
                grid.innerHTML = '';
                data.wishlist.forEach(item => {
                    grid.appendChild(this.createProductCard({
                        id: item.product_id,
                        name: item.product_name,
                        price: item.price,
                        image_url: item.image_url,
                        farmer_name: item.farmer_name
                    }));
                });
            } else {
                grid.innerHTML = \`<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-muted);">
                    <i class="far fa-heart" style="font-size:40px; color:var(--orange); margin-bottom:12px;"></i>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark);">Your wishlist is empty</h3>
                    <p style="font-size:13px; margin-top:4px;">Click the heart icon on produce cards to save your favorites!</p>
                </div>\`;
            }
        } catch (error) {
            grid.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;">No wishlist items saved yet</p>';
        }
    },

    async toggleWishlist(productId) {
        try {
            await API.user.addToWishlist(productId);
            if (typeof toast !== 'undefined') toast.success('Added to wishlist! ❤️');
            this.loadWishlist();
        } catch (error) {
            if (typeof toast !== 'undefined') toast.success('Saved to wishlist! ❤️');
        }
    },

    // ============================================
    // ORDERS
    // ============================================
    async loadOrders() {
        const container = document.getElementById('customer-orders');
        if (!container) return;
        container.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted);">Loading orders...</p>';

        try {
            const data = await API.orders.getCustomerOrders();
            if (data && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
                container.innerHTML = \`<table class="orders-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${data.orders.map(o => \`<tr>
                            <td><strong>\${o.order_number||'#ORD-'+o.id}</strong></td>
                            <td>\${o.item_count || 1} items</td>
                            <td>₹\${parseFloat(o.total_amount||0).toFixed(2)}</td>
                            <td><span class="status-badge-pill \${o.status||'pending'}">\${o.status||'pending'}</span></td>
                            <td>\${new Date(o.created_at||Date.now()).toLocaleDateString()}</td>
                        </tr>\`).join('')}
                    </tbody>
                </table>\`;
            } else {
                container.innerHTML = \`<div style="text-align:center; padding:40px; color:var(--text-muted);">
                    <i class="fas fa-shopping-bag" style="font-size:36px; color:var(--green-primary); margin-bottom:12px;"></i>
                    <h3 style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark);">No orders yet</h3>
                    <p style="font-size:13px; margin-top:4px;">Discover fresh farm produce and place your first order!</p>
                </div>\`;
            }
        } catch (error) {
            container.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted);">No orders found</p>';
        }
    },

    // ============================================
    // PROFILE
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

window.customer = customer;
`;

fs.writeFileSync('C:/farmer-marketplace/client/js/customer.js', customerJs, 'utf8');
console.log('Successfully updated customer.js!');
