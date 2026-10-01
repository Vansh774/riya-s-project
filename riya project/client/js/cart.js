// Shopping Cart Logic
const cart = {
    items: [],
    isOpen: false,

    // Load cart from localStorage
    load() {
        try {
            const saved = localStorage.getItem('cart');
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
        this.updateUI();
    },

    // Save cart to localStorage
    save() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
        this.updateUI();
    },

    // Add item to cart with in-button feedback
    addItem(product, buttonElement = null) {
        const qtyToAdd = parseInt(product.quantity) || 1;
        const productId = !isNaN(Number(product.id)) ? Number(product.id) : product.id;
        const existing = this.items.find(item => item.id == productId);
        
        if (existing) {
            const newQty = existing.quantity + qtyToAdd;
            const max = product.maxQuantity || 999;
            if (newQty <= max) {
                existing.quantity = newQty;
            } else {
                existing.quantity = max;
                if (typeof toast !== 'undefined') toast.warning(`Maximum available quantity is ${max}`);
            }
        } else {
            this.items.push({
                id: productId,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image || product.image_url || 'assets/images/tomatoes.png',
                farmer: product.farmer || product.farmer_name || 'Local Farm',
                quantity: qtyToAdd,
                maxQuantity: product.maxQuantity || 999,
                conversation_id: product.conversation_id || null,
                is_negotiated: product.is_negotiated || false
            });
        }
        
        this.save();
        this.animateCartIcon();

        // In-button temporary feedback (✓ Added for ~2s)
        if (buttonElement) {
            this.animateAddButton(buttonElement);
        }
    },

    // Animate Add to Cart button state (Add to Cart -> ✓ Added -> Add to Cart)
    animateAddButton(btn) {
        if (!btn) return;
        if (btn._revertTimer) {
            clearTimeout(btn._revertTimer);
        }

        if (!btn._originalHtml) {
            btn._originalHtml = btn.innerHTML;
        }

        const isIconOnly = btn.classList.contains('product-add-btn') || btn.classList.contains('btn-related-add') || (!btn.textContent.trim().toLowerCase().includes('add') && btn.querySelector('i'));
        
        if (isIconOnly) {
            btn.innerHTML = '<i class="fas fa-check" style="color:white; font-size:12px;"></i>';
        } else {
            btn.innerHTML = '<i class="fas fa-check" style="margin-right:6px;"></i> Added';
        }

        const prevBg = btn.style.backgroundColor;
        const prevColor = btn.style.color;
        const prevBorder = btn.style.borderColor;

        btn.style.backgroundColor = '#16a34a';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#16a34a';
        btn.classList.add('btn-added-state');

        btn._revertTimer = setTimeout(() => {
            btn.innerHTML = btn._originalHtml;
            btn.style.backgroundColor = prevBg;
            btn.style.color = prevColor;
            btn.style.borderColor = prevBorder;
            btn.classList.remove('btn-added-state');
            btn._revertTimer = null;
        }, 2000);
    },

    // Remove item from cart
    removeItem(id) {
        this.items = this.items.filter(item => item.id != id);
        this.save();
        toast.info('Item removed from cart');
        this.renderItems();
    },

    // Update item quantity
    updateQuantity(id, change) {
        const item = this.items.find(item => item.id == id);
        if (!item) return;

        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            this.removeItem(id);
            return;
        }

        if (newQuantity > (item.maxQuantity || 999)) {
            toast.warning('Maximum quantity reached');
            return;
        }

        item.quantity = newQuantity;
        this.save();
        this.renderItems();
    },

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart items
    getItems() {
        return this.items;
    },

    // Clear cart
    clear() {
        this.items = [];
        this.save();
        this.renderItems();
    },

    // Toggle cart sidebar
    toggle() {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');
        
        if (this.isOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            this.renderItems();
        } else {
            this.close();
        }
    },

    // Close cart
    close() {
        this.isOpen = false;
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    },

    // Render cart items
    renderItems() {
        const container = document.getElementById('cart-items');
        const totalElement = document.getElementById('cart-total');
        const countElement = document.getElementById('cart-count');

        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <div style="font-size: 44px; margin-bottom: 12px;">🛒</div>
                    <h3 style="font-family:var(--font-serif); font-size: 18px; color: var(--text-dark);">Your cart is empty</h3>
                    <p style="font-size: 12.5px; margin-top: 4px;">Start adding fresh produce from local farms!</p>
                </div>
            `;
        } else {
            container.innerHTML = this.items.map(item => `
                <div class="cart-item-row" style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--cream); border-radius:var(--radius-md); border:1px solid var(--beige-mid);">
                    <img src="${item.image || 'assets/images/tomatoes.png'}" alt="${item.name}" style="width:52px; height:52px; border-radius:8px; object-fit:cover; background:var(--beige); flex-shrink:0;" onerror="this.src='assets/images/tomatoes.png'">
                    <div style="flex:1; min-width:0;">
                        <h4 style="font-size:12.5px; font-weight:600; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</h4>
                        <div style="font-size:12px; font-weight:700; color:var(--green-primary); margin-top:2px;">
                            ₹${(parseFloat(item.price)||0).toFixed(2)}
                            ${item.is_negotiated ? '<span style="font-size:10px; background:#DCFCE7; color:#15803D; border-radius:100px; padding:1px 7px; margin-left:5px; font-weight:700;">✓ Agreed</span>' : ''}
                        </div>
                        <div style="font-size:10.5px; color:var(--text-muted);">${item.farmer || 'Local Farm'}</div>
                        <div style="display:inline-flex; align-items:center; gap:8px; margin-top:6px; background:var(--white); border:1px solid var(--beige-mid); border-radius:var(--radius-pill); padding:2px 8px;">
                            <button onclick="cart.updateQuantity(${item.id}, -1)" style="font-weight:700; color:var(--text-dark); font-size:13px; cursor:pointer;">−</button>
                            <span style="font-size:12px; font-weight:600; min-width:16px; text-align:center;">${item.quantity}</span>
                            <button onclick="cart.updateQuantity(${item.id}, 1)" style="font-weight:700; color:var(--text-dark); font-size:13px; cursor:pointer;">+</button>
                        </div>
                    </div>
                    <button onclick="cart.removeItem(${item.id})" style="width:26px; height:26px; border-radius:50%; background:var(--beige); color:var(--text-dark); display:flex; align-items:center; justify-content:center; font-size:11px; cursor:pointer; transition:all 0.2s;" title="Remove">✕</button>
                </div>
            `).join('');
        }

        // Update total
        const total = this.getTotal();
        if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;

        // Minimum order threshold indicator (600 INR)
        let minAlertEl = document.getElementById('cart-min-order-notice');
        if (!minAlertEl && container) {
            minAlertEl = document.createElement('div');
            minAlertEl.id = 'cart-min-order-notice';
            container.parentNode.insertBefore(minAlertEl, container.nextSibling);
        }

        if (minAlertEl) {
            if (this.items.length === 0) {
                minAlertEl.innerHTML = '';
                minAlertEl.style.display = 'none';
            } else if (total < 600) {
                const diff = (600 - total).toFixed(2);
                const pct = Math.min(100, Math.round((total / 600) * 100));
                minAlertEl.style.display = 'block';
                minAlertEl.style.margin = '10px 14px';
                minAlertEl.style.padding = '10px 12px';
                minAlertEl.style.background = '#FFFBEB';
                minAlertEl.style.border = '1px solid #FDE68A';
                minAlertEl.style.borderRadius = '8px';
                minAlertEl.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:700; color:#B45309; margin-bottom:5px;">
                        <span><i class="fas fa-exclamation-triangle" style="margin-right:4px;"></i> Minimum Order: ₹600</span>
                        <span>₹${total.toFixed(2)} / ₹600</span>
                    </div>
                    <div style="background:#FDE68A; height:6px; border-radius:3px; overflow:hidden; margin-bottom:5px;">
                        <div style="background:#D97706; width:${pct}%; height:100%; transition:width 0.3s;"></div>
                    </div>
                    <div style="font-size:11.5px; color:#92400E; font-weight:600;">
                        Cart must having 600 INR to buy. Add <strong>₹${diff}</strong> more to checkout!
                    </div>
                `;
            } else {
                minAlertEl.style.display = 'block';
                minAlertEl.style.margin = '10px 14px';
                minAlertEl.style.padding = '8px 12px';
                minAlertEl.style.background = '#ECFDF5';
                minAlertEl.style.border = '1px solid #A7F3D0';
                minAlertEl.style.borderRadius = '8px';
                minAlertEl.innerHTML = `
                    <div style="font-size:12px; font-weight:700; color:#065F46; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-check-circle" style="color:#10B981;"></i> Minimum order reached (₹${total.toFixed(2)})! Ready to buy.
                    </div>
                `;
            }
        }

        // Update count badge
        const count = this.getTotalItems();
        const b1 = document.getElementById('cart-count-badge');
        const b2 = document.getElementById('header-cart-badge');
        [b1, b2].forEach(b => {
            if (b) {
                b.textContent = count;
                b.style.display = count > 0 ? 'inline-flex' : 'none';
            }
        });
    },

    // Update UI
    updateUI() {
        this.renderItems();
    },

    // Animate cart icon on add
    animateCartIcon() {
        const cartBtn = document.querySelector('.nav-actions .btn-secondary');
        if (cartBtn) {
            cartBtn.classList.add('cart-bounce');
            setTimeout(() => {
                cartBtn.classList.remove('cart-bounce');
            }, 500);
        }
    }
};

// Initialize cart
document.addEventListener('DOMContentLoaded', function() {
    cart.load();
});

// Close cart on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cart.isOpen) {
        cart.close();
    }
});

// Export for global use
window.cart = cart;