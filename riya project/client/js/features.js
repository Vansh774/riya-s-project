/**
 * FreshField – Messaging, Product Requests, Price Rules & Product Browsing Module
 * Shared across customer-dashboard.html, farmer-dashboard.html, product-detail.html, admin-dashboard.html, login.html
 */

// ─────────────────────────────────────────────────────────────────────────────
// Global API URL resolver ensuring frontend calls reach backend server
function ffGetApiUrl(endpoint) {
    let base = "http://localhost:5000/api";
    if (typeof API_BASE !== "undefined" && API_BASE) {
        base = API_BASE;
    } else if (typeof API !== "undefined" && (API.baseURL || API.BASE_URL)) {
        base = API.baseURL || API.BASE_URL;
    } else if (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.includes(":5000")) {
        base = "/api";
    }
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
    return base.replace(/\/+$/, "") + cleanEndpoint;
}

// 1. VALIDATION HELPERS (shared frontend validation)
// ─────────────────────────────────────────────────────────────────────────────
const FFValidate = {
    email(value) {
        const v = (value || '').trim();
        if (!v) return 'Email address is required.';
        // Standard email format validation: user@domain.tld (at least 2 letter TLD)
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
        if (!re.test(v)) {
            return 'Please enter a valid email address (e.g. name@example.com).';
        }
        return null;
    },

    password(value) {
        if (!value || value.length === 0) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (/^\s+$/.test(value)) return 'Password cannot be only spaces.';
        return null;
    },

    phone(value) {
        if (!value || value.trim() === '') return null; // optional
        const cleaned = value.replace(/[\s\-+()]/g, '');
        if (!/^\d{7,15}$/.test(cleaned)) return 'Please enter a valid phone number (digits only, 7–15 digits).';
        return null;
    },

    number(value, label = 'This field', { min, max, integer = false, required = true } = {}) {
        const v = (value === undefined || value === null || value === '') ? '' : String(value).trim();
        if (v === '') {
            if (required) return `${label} is required.`;
            return null;
        }
        // Reject invalid characters like letters, symbols (allow only digits, dot, optional leading minus)
        if (!/^-?\d+(\.\d+)?$/.test(v)) {
            return `${label} must be a valid number without letters or invalid characters.`;
        }
        const n = integer ? parseInt(v, 10) : parseFloat(v);
        if (isNaN(n)) {
            return `${label} must be a valid number.`;
        }
        if (integer && !/^-?\d+$/.test(v)) {
            return `${label} must be a whole number (no decimals).`;
        }
        if (min !== undefined && n < min) return `${label} must be at least ${min}.`;
        if (max !== undefined && n > max) return `${label} cannot exceed ${max}.`;
        return null;
    },

    required(value, label = 'This field') {
        const v = (value === undefined || value === null) ? '' : String(value).trim();
        if (!v) return `${label} is required.`;
        return null;
    },

    // Show field error under a form field
    showFieldError(fieldId, message) {
        const field = typeof fieldId === "string" ? document.getElementById(fieldId) : fieldId;
        if (!field) return;
        const actualId = field.id || fieldId;

        const wrapper = field.closest(".input-wrapper");
        const formGroup = field.closest(".form-group");
        const container = formGroup || (wrapper ? wrapper.parentElement : field.parentElement);

        let err = container ? container.querySelector(`.ff-field-error[data-for="${actualId}"]`) : null;
        if (!err && container) {
            err = container.querySelector(".ff-field-error");
        }
        if (!err) {
            err = document.createElement("div");
            err.className = "ff-field-error";
            err.setAttribute("data-for", actualId);
            if (wrapper && wrapper.parentElement) {
                wrapper.insertAdjacentElement("afterend", err);
            } else if (field.parentElement) {
                field.insertAdjacentElement("afterend", err);
            }
        }

        if (message) {
            field.classList.add("ff-input-error");
            if (wrapper) wrapper.classList.add("ff-input-error-wrapper");
            err.textContent = message;
            err.style.display = "block";
        } else {
            field.classList.remove("ff-input-error");
            if (wrapper) wrapper.classList.remove("ff-input-error-wrapper");
            err.textContent = "";
            err.style.display = "none";
        }
    },

    clearFieldError(fieldOrId) {
        const field = typeof fieldOrId === "string" ? document.getElementById(fieldOrId) : fieldOrId;
        if (!field) return;
        const actualId = field.id || "";
        const wrapper = field.closest(".input-wrapper");
        const formGroup = field.closest(".form-group");
        const container = formGroup || (wrapper ? wrapper.parentElement : field.parentElement);

        field.classList.remove("ff-input-error");
        if (wrapper) wrapper.classList.remove("ff-input-error-wrapper");

        let err = (actualId && container) ? container.querySelector(`.ff-field-error[data-for="${actualId}"]`) : null;
        if (!err && wrapper && wrapper.nextElementSibling && wrapper.nextElementSibling.classList.contains("ff-field-error")) {
            err = wrapper.nextElementSibling;
        }
        if (!err && field.nextElementSibling && field.nextElementSibling.classList.contains("ff-field-error")) {
            err = field.nextElementSibling;
        }
        if (!err && container) {
            err = container.querySelector(".ff-field-error");
        }
        if (err) {
            err.textContent = "";
            err.style.display = "none";
        }
    },

    clearFieldErrors(formEl) {
        if (!formEl) return;
        formEl.querySelectorAll(".ff-field-error").forEach(e => {
            e.textContent = "";
            e.style.display = "none";
        });
        formEl.querySelectorAll(".ff-input-error").forEach(e => e.classList.remove("ff-input-error"));
        formEl.querySelectorAll(".ff-input-error-wrapper").forEach(e => e.classList.remove("ff-input-error-wrapper"));
    }
};

// Global event listener to clear red validation errors immediately on click, focus, or typing
if (typeof document !== "undefined") {
    ["focusin", "input", "click"].forEach(evt => {
        document.addEventListener(evt, (e) => {
            const t = e.target;
            if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) {
                if (typeof FFValidate !== "undefined" && typeof FFValidate.clearFieldError === "function") {
                    FFValidate.clearFieldError(t);
                }
            }
        }, true);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRICE RULES MANAGER
// ─────────────────────────────────────────────────────────────────────────────
const FFPriceRules = {
    rules: null,

    async load() {
        if (this.rules) return this.rules;
        try {
            if (typeof API !== 'undefined' && API.priceRules) {
                const res = await API.priceRules.getAll();
                this.rules = res.rules || [];
            } else {
                const apiUrl = typeof ffGetApiUrl === 'function' ? ffGetApiUrl('/features/price-rules') : '/api/features/price-rules';
                const res = await fetch(apiUrl);
                const data = await res.json();
                this.rules = data.rules || [];
            }
        } catch (e) {
            this.rules = [];
        }
        return this.rules;
    },

    findRule(productName) {
        if (!this.rules || !productName) return null;
        let n = productName.trim().toLowerCase().replace(/\s+\d{3,5}$/, '').trim();
        const typos = {
            'aple': 'apple', 'appel': 'apple', 'tomatto': 'tomato', 'tamatar': 'tomato',
            'potatto': 'potato', 'aloo': 'potato', 'alu': 'potato', 'pyaz': 'onion',
            'mashroom': 'mushroom', 'mushrum': 'mushroom', 'banaana': 'banana', 'kela': 'banana',
            'palak': 'spinach', 'gobi': 'cauliflower', 'okra': 'bhindi', 'ladyfinger': 'bhindi',
            'eggplant': 'brinjal', 'baingan': 'brinjal', 'gajar': 'carrot', 'lahsun': 'garlic',
            'adrak': 'ginger', 'nimbu': 'lemon', 'aam': 'mango', 'dragonfruit': 'dragon fruit'
        };
        if (typos[n]) n = typos[n];

        // Exact match
        let rule = this.rules.find(r => r.product_name === n || r.display_name.toLowerCase() === n);
        if (!rule) {
            // Partial match
            rule = this.rules.find(r =>
                r.product_name.includes(n) || n.includes(r.product_name) ||
                r.display_name.toLowerCase().includes(n) || n.includes(r.display_name.toLowerCase())
            );
        }
        if (!rule) {
            // Levenshtein distance check for typos
            const dist = (a, b) => {
                const m = [];
                for (let i = 0; i <= b.length; i++) m[i] = [i];
                for (let j = 0; j <= a.length; j++) m[0][j] = j;
                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1], m[i][j - 1], m[i - 1][j]) + 1;
                    }
                }
                return m[b.length][a.length];
            };
            rule = this.rules.find(r => dist(n, r.product_name) <= (r.product_name.length <= 5 ? 1 : 2));
        }
        return rule || null;
    },

    validate(productName, price) {
        const rule = this.findRule(productName);
        if (!rule) return { valid: true, rule: null };
        const p = parseFloat(price);
        if (isNaN(p)) return { valid: false, rule, error: 'Price must be a valid number.' };
        if (p < rule.min_price) {
            return {
                valid: false, rule,
                error: `Price ₹${p} is below the allowed minimum of ₹${rule.min_price}/${rule.unit} for ${rule.display_name}.`
            };
        }
        if (p > rule.max_price) {
            return {
                valid: false, rule,
                error: `Price ₹${p} exceeds the allowed maximum of ₹${rule.max_price}/${rule.unit} for ${rule.display_name}.`
            };
        }
        return { valid: true, rule };
    },

    getHint(productName) {
        const rule = this.findRule(productName);
        if (!rule) return null;
        return `Allowed price range for ${rule.display_name}: ₹${parseFloat(rule.min_price).toFixed(2)} – ₹${parseFloat(rule.max_price).toFixed(2)} per ${rule.unit}`;
    },

    // Attach dynamic price guidance to farmer product creation form
    async setupPriceGuidance(nameInputId, priceInputId, hintContainerId) {
        await this.load();
        const nameEl = document.getElementById(nameInputId);
        const priceEl = document.getElementById(priceInputId);
        const hintEl = document.getElementById(hintContainerId);
        if (!nameEl || !priceEl || !hintEl) return;

        const updateGuidance = () => {
            const nameVal = nameEl.value.trim();
            const priceVal = priceEl.value.trim();
            const rule = this.findRule(nameVal);

            if (!nameVal || !rule) {
                hintEl.style.display = 'none';
                hintEl.className = 'ff-price-hint';
                hintEl.innerHTML = '';
                return;
            }

            hintEl.style.display = 'block';

            if (!priceVal) {
                hintEl.className = 'ff-price-hint';
                hintEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> <strong>Price Rule for ${rule.display_name}:</strong> Allowed range is <strong>₹${parseFloat(rule.min_price).toFixed(2)} – ₹${parseFloat(rule.max_price).toFixed(2)}</strong> per ${rule.unit}.`;
                return;
            }

            const val = this.validate(nameVal, priceVal);
            if (!val.valid) {
                hintEl.className = 'ff-price-hint error';
                hintEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${val.error}`;
            } else {
                hintEl.className = 'ff-price-hint success';
                hintEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Price ₹${parseFloat(priceVal).toFixed(2)} is within allowed range (₹${rule.min_price} – ₹${rule.max_price}/${rule.unit}) ✓`;
            }
        };

        nameEl.addEventListener('input', updateGuidance);
        nameEl.addEventListener('change', updateGuidance);
        priceEl.addEventListener('input', updateGuidance);
        priceEl.addEventListener('change', updateGuidance);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MESSAGING MODULE (Customer ↔ Farmer negotiation)
// ─────────────────────────────────────────────────────────────────────────────
const FFMessaging = {
    currentConvId: null,
    pollTimer: null,
    lastMessageCount: 0,

    // ── Open a chat with a farmer for a product ──────────────────
    async openChat(farmerId, productId, farmerName, productName) {
        if (!farmerId) return;
        try {
            let res;
            if (typeof API !== 'undefined' && API.messages) {
                res = await API.messages.findOrCreate(farmerId, productId);
            } else {
                const token = localStorage.getItem('token');
                let url = `/api/features/conversations/find?farmer_id=${farmerId}`;
                if (productId) url += `&product_id=${productId}`;
                const fetchRes = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res = await fetchRes.json();
            }

            if (!res.success) {
                this.showToast('Could not open conversation: ' + (res.message || 'Error'), 'error');
                return;
            }
            const conv = res.conversation;
            this.renderChatModal(conv, farmerName, productName);
            this.currentConvId = conv.id;
            await this.loadMessages(conv.id);
            this.startPolling(conv.id);
        } catch (e) {
            console.error('openChat error:', e);
            this.showToast('Could not start conversation. Please try again.', 'error');
        }
    },

    // ── Open existing conversation by ID ──────────────────────────────────
    async openChatById(convId, convSummary = null) {
        if (!convId) return;
        this.currentConvId = convId;
        this.renderChatModal(convSummary || { id: convId });
        await this.loadMessages(convId);
        this.startPolling(convId);
    },

    // ── Show chat modal ────────────────────────────────────────────────────
    renderChatModal(conv, farmerName, productName) {
        let modal = document.getElementById('ff-chat-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ff-chat-modal';
            modal.className = 'ff-chat-modal-overlay';
            document.body.appendChild(modal);
        }

        const pName = productName || conv.product_name || '';
        const user = typeof auth !== 'undefined' ? auth.getCurrentUser() : (JSON.parse(localStorage.getItem('user') || 'null'));
        const isCustomer = !user || user.role === 'customer';
        const otherPartyName = isCustomer
            ? (farmerName || conv.farmer_name || conv.farm_name || 'Farmer')
            : (conv.customer_name || 'Customer');

        modal.innerHTML = `
        <div class="ff-chat-container">
            <div class="ff-chat-header">
                <div class="ff-chat-header-info">
                    <div class="ff-chat-avatar">${otherPartyName.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="ff-chat-title">${otherPartyName}</div>
                        ${pName ? `<div class="ff-chat-subtitle"><i class="fa-solid fa-tag"></i> Re: ${pName}${conv.product_price ? ` · ₹${conv.product_price}/${conv.product_unit || 'kg'}` : ''}</div>` : '<div class="ff-chat-subtitle">Direct Message</div>'}
                    </div>
                </div>
                <button class="ff-chat-close" onclick="FFMessaging.closeChat()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="ff-chat-messages" id="ff-chat-messages">
                <div class="ff-chat-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading messages…</div>
            </div>
            <div class="ff-chat-footer">
                ${pName ? `<div class="ff-chat-bargain-hint"><i class="fa-solid fa-lightbulb"></i> <strong>Price Negotiation:</strong> You can discuss quantity discounts or suggest a fair price here.</div>` : ''}
                <div class="ff-chat-input-row">
                    <textarea id="ff-chat-input" class="ff-chat-textarea" placeholder="Type your message here…" rows="2" maxlength="2000"></textarea>
                    <button class="ff-chat-send-btn" id="ff-chat-send-btn" onclick="FFMessaging.sendMessage()" title="Send Message">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div class="ff-chat-char-count"><span id="ff-chat-char-count">0</span>/2000</div>
            </div>
        </div>`;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Character counter and Enter-key sending
        const ta = document.getElementById('ff-chat-input');
        if (ta) {
            ta.focus();
            ta.addEventListener('input', () => {
                const cc = document.getElementById('ff-chat-char-count');
                if (cc) cc.textContent = ta.value.length;
            });
            ta.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    },

    closeChat() {
        const modal = document.getElementById('ff-chat-modal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        this.stopPolling();
        this.currentConvId = null;
    },

    async loadMessages(convId) {
        const container = document.getElementById('ff-chat-messages');
        if (!container) return;
        try {
            let res;
            if (typeof API !== 'undefined' && API.messages) {
                res = await API.messages.getMessages(convId);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(`/api/features/conversations/${convId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res = await fetchRes.json();
            }

            if (!res.success) throw new Error(res.message);
            const user = typeof auth !== 'undefined' ? auth.getCurrentUser() : (JSON.parse(localStorage.getItem('user') || 'null'));
            const myId = user ? user.id : null;
            this.renderMessages(res.messages || [], myId);
            this.lastMessageCount = (res.messages || []).length;
        } catch (e) {
            if (container) container.innerHTML = `<div class="ff-chat-error"><i class="fa-solid fa-triangle-exclamation"></i> Failed to load messages: ${e.message}</div>`;
        }
    },

    renderMessages(messages, myId) {
        const container = document.getElementById('ff-chat-messages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="ff-chat-empty">
                    <i class="fa-solid fa-comments" style="font-size:2.2rem;opacity:0.35;"></i>
                    <p style="font-weight:600; margin-top:8px;">No messages yet</p>
                    <p style="font-size:12px;">Send a message to start bargaining or discussing harvest details.</p>
                </div>`;
            return;
        }

        container.innerHTML = messages.map(m => {
            const isMe = m.sender_id === myId;
            const time = new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const date = new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            return `
            <div class="ff-msg-row ${isMe ? 'ff-msg-mine' : 'ff-msg-theirs'}">
                ${!isMe ? `<div class="ff-msg-avatar">${(m.sender_name || '?').charAt(0).toUpperCase()}</div>` : ''}
                <div class="ff-msg-bubble-wrap">
                    ${!isMe ? `<div class="ff-msg-name">${m.sender_name || 'User'}</div>` : ''}
                    <div class="ff-msg-bubble">${this.escapeHtml(m.message)}</div>
                    <div class="ff-msg-time">${date}, ${time}</div>
                </div>
            </div>`;
        }).join('');

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    async sendMessage() {
        const convId = this.currentConvId;
        if (!convId) return;
        const ta = document.getElementById('ff-chat-input');
        if (!ta) return;
        const msg = ta.value.trim();
        if (!msg) {
            ta.focus();
            return;
        }

        const btn = document.getElementById('ff-chat-send-btn');
        if (btn) btn.disabled = true;

        try {
            let res;
            if (typeof API !== 'undefined' && API.messages) {
                res = await API.messages.send(convId, msg);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(`/api/features/conversations/${convId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: msg })
                });
                res = await fetchRes.json();
            }

            if (!res.success) throw new Error(res.message);
            ta.value = '';
            const cc = document.getElementById('ff-chat-char-count');
            if (cc) cc.textContent = '0';
            await this.loadMessages(convId);
        } catch (e) {
            this.showToast('Failed to send message: ' + e.message, 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    },

    startPolling(convId, intervalMs = 4000) {
        this.stopPolling();
        this.pollTimer = setInterval(async () => {
            if (!this.currentConvId) return;
            try {
                let res;
                if (typeof API !== 'undefined' && API.messages) {
                    res = await API.messages.getMessages(convId);
                } else {
                    const token = localStorage.getItem('token');
                    const fetchRes = await fetch(`/api/features/conversations/${convId}/messages`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    res = await fetchRes.json();
                }
                if (res.success && res.messages.length !== this.lastMessageCount) {
                    const user = typeof auth !== 'undefined' ? auth.getCurrentUser() : (JSON.parse(localStorage.getItem('user') || 'null'));
                    this.renderMessages(res.messages, user ? user.id : null);
                    this.lastMessageCount = res.messages.length;
                }
            } catch (e) {}
        }, intervalMs);
    },

    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    },

    // ── Load & render conversations list into a dashboard page ─────────────
    async loadConversations(containerId, isCustomer = true) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div class="ff-chat-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading conversations…</div>';

        try {
            let res;
            if (typeof API !== 'undefined' && API.messages) {
                res = await API.messages.getConversations();
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch('/api/features/conversations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res = await fetchRes.json();
            }

            if (!res.success) throw new Error(res.message);
            const convs = res.conversations || [];

            if (convs.length === 0) {
                container.innerHTML = `
                <div class="ff-empty-state">
                    <i class="fa-solid fa-comments" style="font-size:2.5rem; opacity:0.3;"></i>
                    <h3 style="font-size:16px; font-weight:600; color:var(--text-dark, #1F211B); margin:6px 0;">No Messages Yet</h3>
                    <p style="font-size:13px; color:var(--text-muted, #6F7168); max-width:360px;">
                        ${isCustomer
                            ? 'Start bargaining or discussing produce directly with farmers by clicking "Message Farmer" on any product detail page.'
                            : 'Customer inquiries and price negotiations regarding your listed produce will appear here.'}
                    </p>
                </div>`;
                return;
            }

            container.innerHTML = `<div class="ff-conv-list">
                ${convs.map(c => {
                    const otherName = isCustomer ? (c.farmer_name || c.farm_name || 'Farmer') : (c.customer_name || 'Customer');
                    const lastMsg = c.last_message ? this.escapeHtml(c.last_message) : 'No messages yet';
                    const time = c.last_message_at
                        ? new Date(c.last_message_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '';
                    const pName = c.product_name || '';
                    const safeConv = JSON.stringify(c).replace(/"/g, '&quot;');

                    return `
                    <div class="ff-conv-item" onclick="FFMessaging.openChatById(${c.id}, ${safeConv})">
                        <div class="ff-conv-avatar">${otherName.charAt(0).toUpperCase()}</div>
                        <div class="ff-conv-info">
                            <div class="ff-conv-name">${otherName}</div>
                            ${pName ? `<div class="ff-conv-product"><i class="fa-solid fa-tag"></i> ${pName} ${c.product_price ? `· ₹${c.product_price}/${c.product_unit || 'kg'}` : ''}</div>` : ''}
                            <div class="ff-conv-last-msg">${lastMsg}</div>
                        </div>
                        <div class="ff-conv-meta">
                            <span class="ff-conv-time">${time}</span>
                            ${c.unread_count > 0 ? `<span class="ff-conv-unread">${c.unread_count}</span>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        } catch (e) {
            container.innerHTML = `<div class="ff-chat-error"><i class="fa-solid fa-triangle-exclamation"></i> Error loading conversations: ${e.message}</div>`;
        }
    },

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\n/g, '<br>');
    },

    showToast(msg, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type);
        } else if (typeof toast !== 'undefined' && typeof toast[type] === 'function') {
            toast[type](msg);
        } else {
            alert(msg);
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRODUCT CATALOG BROWSER (Customer: browse by product name)
// ─────────────────────────────────────────────────────────────────────────────
const FFProductBrowser = {
    catalog: null,

    async loadCatalog() {
        if (this.catalog) return this.catalog;
        try {
            if (typeof API !== 'undefined' && API.catalog) {
                const res = await API.catalog.getAll();
                this.catalog = res.products || [];
            } else {
                const res = await fetch('/api/features/catalog');
                const data = await res.json();
                this.catalog = data.products || [];
            }
        } catch (e) {
            this.catalog = [];
        }
        return this.catalog;
    },

    // Render interactive produce filter chips in Customer Dashboard
    async renderProduceSelector(containerId, onSelectProduce) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const products = await this.loadCatalog();
        if (!products || !products.length) return;

        // Distinct list of popular produce
        const canonicalName = (name) => (name || "").replace(/\s+\d{3,5}$/, "").trim();
        const rawNames = products.map(p => canonicalName(p.name)).filter(Boolean);
        const produceNames = [...new Set(rawNames)].slice(0, 20);

        const produceIcons = {
            'Potato': '🥔', 'Tomato': '🍅', 'Onion': '🧅', 'Cauliflower': '🥦',
            'Spinach': '🥬', 'Carrot': '🥕', 'Bhindi (Okra)': '🌱', 'Apple': '🍎',
            'Mango': '🥭', 'Banana': '🍌', 'Strawberry': '🍓', 'Organic Basmati Rice': '🌾',
            'Wheat': '🌾', 'Organic Moong Dal': '🍲', 'Desi Cow Ghee': '🧈', 'Farm Fresh Turmeric': '🧂'
        };

        let html = `
        <div class="ff-produce-filter-bar">
            <span class="ff-produce-bar-label"><i class="fa-solid fa-filter"></i> Browse by Produce:</span>
            <div class="ff-produce-chips-scroll">
                <button type="button" class="ff-produce-chip active" data-produce="" onclick="FFProductBrowser.handleChipClick(this, '')">
                    <span>All Produce</span>
                </button>
                ${produceNames.map(name => `
                <button type="button" class="ff-produce-chip" data-produce="${name}" onclick="FFProductBrowser.handleChipClick(this, '${name}')">
                    <span>${produceIcons[name] || '🌿'} ${name}</span>
                </button>
                `).join('')}
            </div>
        </div>`;

        container.innerHTML = html;
        this._onSelectProduce = onSelectProduce;
    },

    handleChipClick(btnEl, produceName) {
        const parent = btnEl.closest('.ff-produce-chips-scroll');
        if (parent) {
            parent.querySelectorAll('.ff-produce-chip').forEach(c => c.classList.remove('active'));
        }
        btnEl.classList.add('active');
        if (typeof this._onSelectProduce === 'function') {
            this._onSelectProduce(produceName);
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRODUCT REQUEST MODULE (Farmer & Admin)
// ─────────────────────────────────────────────────────────────────────────────
const FFProductRequests = {
    async submit(data) {
        if (typeof API !== 'undefined' && API.catalog) {
            return await API.catalog.submitRequest(data);
        }
        const token = localStorage.getItem('token');
        const res = await fetch(ffGetApiUrl('/features/product-requests'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async getMyRequests() {
        if (typeof API !== 'undefined' && API.catalog) {
            return await API.catalog.getMyRequests();
        }
        const token = localStorage.getItem('token');
        const res = await fetch(ffGetApiUrl('/features/product-requests/my'), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    // Render farmer's own requests list in Farmer Dashboard
    async renderFarmerRequests(containerId) {
        const c = document.getElementById(containerId);
        if (!c) return;
        c.innerHTML = '<div style="text-align:center; padding:20px; color:#9B9D95;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading your requests…</div>';

        try {
            const res = await this.getMyRequests();
            const requests = res.requests || [];

            if (requests.length === 0) {
                c.innerHTML = `
                <div class="ff-empty-state">
                    <i class="fa-solid fa-box-open" style="font-size:2.2rem; opacity:0.35;"></i>
                    <p style="font-weight:600; margin:6px 0;">No Product Requests Submitted</p>
                    <p style="font-size:12px; max-width:320px;">If a fruit or vegetable is not currently approved for listing, submit a request to the FreshField Admin above.</p>
                </div>`;
                return;
            }

            c.innerHTML = requests.map(r => {
                const statusColors = { pending: '#F59E0B', approved: '#16A34A', rejected: '#DC2626' };
                const statusIcons = { pending: 'fa-clock', approved: 'fa-circle-check', rejected: 'fa-circle-xmark' };
                const sc = statusColors[r.status] || '#6B7280';
                const si = statusIcons[r.status] || 'fa-question';
                return `
                <div class="ff-request-card" style="border-left: 4px solid ${sc}">
                    <div class="ff-request-header">
                        <div>
                            <div class="ff-request-name">${r.product_name}</div>
                            <div class="ff-request-category">${r.category} · Unit: ${r.unit || 'kg'}</div>
                        </div>
                        <span class="ff-request-badge" style="background:${sc}20; color:${sc}">
                            <i class="fa-solid ${si}"></i> ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                    </div>
                    ${r.reason ? `<div class="ff-request-desc"><strong>Farmer Reason:</strong> ${r.reason}</div>` : ''}
                    ${r.suggested_min_price ? `<div class="ff-request-price-range">Suggested: ₹${r.suggested_min_price} – ₹${r.suggested_max_price}/${r.unit || 'kg'}</div>` : ''}
                    ${r.admin_notes ? `<div class="ff-request-notes"><strong>Admin notes:</strong> ${r.admin_notes}</div>` : ''}
                    <div class="ff-request-footer">
                        <span>Submitted: ${new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                        ${r.reviewed_at ? `<span>Reviewed: ${new Date(r.reviewed_at).toLocaleDateString('en-IN')}</span>` : ''}
                    </div>
                </div>`;
            }).join('');
        } catch (e) {
            c.innerHTML = `<div class="ff-chat-error"><i class="fa-solid fa-triangle-exclamation"></i> Error loading requests: ${e.message}</div>`;
        }
    },

    // Render Admin requests management table in Admin Dashboard
    async renderAdminRequests(containerId, statusFilter = '') {
        const c = document.getElementById(containerId);
        if (!c) return;
        c.innerHTML = '<div style="text-align:center; padding:30px; color:#9B9D95;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading product requests…</div>';

        try {
            let res;
            if (typeof API !== 'undefined' && API.catalog && API.catalog.adminGetRequests) {
                res = await API.catalog.adminGetRequests(statusFilter);
            } else {
                const token = localStorage.getItem('token');
                let url = ffGetApiUrl('/features/admin/product-requests');
                if (statusFilter) url += `?status=${statusFilter}`;
                const fetchRes = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                res = await fetchRes.json();
            }

            if (!res.success) throw new Error(res.message);
            const requests = res.requests || [];

            if (requests.length === 0) {
                c.innerHTML = `
                <div class="ff-empty-state">
                    <i class="fa-solid fa-inbox" style="font-size:2.5rem; opacity:0.35;"></i>
                    <h3 style="font-size:16px; font-weight:600; margin:6px 0;">No ${statusFilter ? statusFilter : ''} product requests found</h3>
                    <p style="font-size:13px; color:#6F7168;">New submissions from farmers requesting unlisted crops will appear here.</p>
                </div>`;
                return;
            }

            c.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:14px;">
                ${requests.map(r => {
                    const statusColors = { pending: '#F59E0B', approved: '#16A34A', rejected: '#DC2626' };
                    const sc = statusColors[r.status] || '#6B7280';
                    const isPending = r.status === 'pending';
                    const dateStr = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                    return `
                    <div class="ff-admin-req-card" style="border-left: 4px solid ${sc};">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                            <div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <h4 style="font-size:16px; font-weight:700; color:#1F211B; margin:0;">${r.product_name}</h4>
                                    <span style="font-size:11px; padding:2px 8px; border-radius:100px; background:#EAF0DF; color:#355C24; font-weight:600;">${r.category}</span>
                                    <span style="font-size:11px; color:#6F7168;">Unit: ${r.unit || 'kg'}</span>
                                </div>
                                <div style="font-size:12.5px; color:#6F7168; margin-top:4px;">
                                    Submitted by <strong>${r.farmer_name || 'Farmer'}</strong> (${r.farm_name || r.farmer_email || 'Farm'}) on ${dateStr}
                                </div>
                            </div>
                            <span class="ff-request-badge" style="background:${sc}20; color:${sc}; font-weight:700;">
                                ${r.status.toUpperCase()}
                            </span>
                        </div>

                        ${r.reason ? `
                        <div style="font-size:13px; background:#F8F5EC; border-radius:8px; padding:8px 12px; margin-top:10px; color:#1F211B;">
                            <strong>Farmer Note:</strong> ${r.reason}
                        </div>` : ''}

                        <div style="display:flex; gap:16px; margin-top:8px; font-size:12.5px; color:#355C24;">
                            <span><strong>Suggested Price:</strong> ${r.suggested_min_price ? `₹${r.suggested_min_price} – ₹${r.suggested_max_price}` : 'Not specified'}</span>
                        </div>

                        ${r.admin_notes ? `
                        <div style="font-size:12.5px; margin-top:8px; color:#6F7168;">
                            <strong>Admin Feedback:</strong> ${r.admin_notes} (${r.reviewed_by_name || 'Admin'})
                        </div>` : ''}

                        ${isPending ? `
                        <div class="ff-admin-req-actions">
                            <button type="button" class="ff-admin-btn-approve" onclick="FFProductRequests.handleAdminApprove(${r.id}, '${r.product_name}')">
                                <i class="fa-solid fa-check"></i> Approve & Add to Catalog
                            </button>
                            <button type="button" class="ff-admin-btn-reject" onclick="FFProductRequests.handleAdminReject(${r.id}, '${r.product_name}')">
                                <i class="fa-solid fa-xmark"></i> Reject Request
                            </button>
                        </div>` : ''}
                    </div>`;
                }).join('')}
            </div>`;
        } catch (e) {
            c.innerHTML = `<div class="ff-chat-error"><i class="fa-solid fa-triangle-exclamation"></i> Error loading requests: ${e.message}</div>`;
        }
    },

    async handleAdminApprove(reqId, productName) {
        const notes = prompt(`Approve "${productName}" and add to the public catalog?\nOptional Admin Notes:`, 'Approved by administrator.');
        if (notes === null) return; // user cancelled

        try {
            let res;
            if (typeof API !== 'undefined' && API.catalog && API.catalog.adminApprove) {
                res = await API.catalog.adminApprove(reqId, notes);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(ffGetApiUrl(`/features/admin/product-requests/${reqId}/approve`), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ admin_notes: notes })
                });
                res = await fetchRes.json();
            }

            if (!res.success) throw new Error(res.message);
            alert(`✓ ${productName} has been approved and added to the official catalog!`);
            this.renderAdminRequests('admin-requests-list');
        } catch (e) {
            alert('Approval failed: ' + e.message);
        }
    },

    async handleAdminReject(reqId, productName) {
        const notes = prompt(`Reject "${productName}" request?\nEnter reason for rejection:`, 'Insufficient details or duplicate produce.');
        if (notes === null) return; // user cancelled

        try {
            let res;
            if (typeof API !== 'undefined' && API.catalog && API.catalog.adminReject) {
                res = await API.catalog.adminReject(reqId, notes);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(ffGetApiUrl(`/features/admin/product-requests/${reqId}/reject`), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ admin_notes: notes })
                });
                res = await fetchRes.json();
            }

            if (!res.success) throw new Error(res.message);
            alert(`Request for "${productName}" has been rejected.`);
            this.renderAdminRequests('admin-requests-list');
        } catch (e) {
            alert('Rejection failed: ' + e.message);
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. INJECT STYLES FOR CHAT, PRICE GUIDANCE & PRODUCT REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
(function injectCSS() {
    const style = document.createElement('style');
    style.id = 'ff-features-css';
    style.textContent = `
    /* ─── VALIDATION STYLES ─── */
    .ff-field-error {
        display: none;
        color: #DC2626;
        font-size: 12px;
        margin-top: 5px;
        font-family: "Poppins", sans-serif;
        font-weight: 500;
        width: 100%;
        clear: both;
        line-height: 1.3;
    }
    .ff-input-error-wrapper {
        border-color: #DC2626 !important;
        box-shadow: 0 0 0 2px rgba(220,38,38,0.15) !important;
    }
        display: none;
        color: #DC2626;
        font-size: 12px;
        margin-top: 4px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    }
    .ff-input-error {
        border-color: #DC2626 !important;
        box-shadow: 0 0 0 2px rgba(220,38,38,0.15) !important;
    }

    /* ─── CHAT MODAL ─── */
    .ff-chat-modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        padding: 16px;
    }
    .ff-chat-container {
        background: #FFFDF8;
        border-radius: 18px;
        width: 100%;
        max-width: 540px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .ff-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: #355C24;
        color: white;
    }
    .ff-chat-header-info { display: flex; align-items: center; gap: 12px; }
    .ff-chat-avatar {
        width: 42px; height: 42px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 18px;
    }
    .ff-chat-title { font-weight: 600; font-size: 15px; }
    .ff-chat-subtitle { font-size: 12px; opacity: 0.85; margin-top: 2px; }
    .ff-chat-close {
        background: rgba(255,255,255,0.15);
        border: none;
        color: white;
        width: 32px; height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
    }
    .ff-chat-close:hover { background: rgba(255,255,255,0.3); }
    .ff-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 220px;
        max-height: 380px;
    }
    .ff-chat-loading, .ff-chat-error, .ff-chat-empty {
        text-align: center;
        color: #9B9D95;
        padding: 32px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    .ff-msg-row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
    }
    .ff-msg-mine { flex-direction: row-reverse; }
    .ff-msg-avatar {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: #A8BF72;
        color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 700;
        flex-shrink: 0;
    }
    .ff-msg-bubble-wrap { max-width: 75%; display: flex; flex-direction: column; gap: 2px; }
    .ff-msg-mine .ff-msg-bubble-wrap { align-items: flex-end; }
    .ff-msg-name { font-size: 11px; font-weight: 600; color: #6F7168; }
    .ff-msg-bubble {
        background: #EEE9DA;
        color: #1F211B;
        padding: 10px 14px;
        border-radius: 14px 14px 14px 4px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
    }
    .ff-msg-mine .ff-msg-bubble {
        background: #355C24;
        color: white;
        border-radius: 14px 14px 4px 14px;
    }
    .ff-msg-time { font-size: 10px; color: #9B9D95; }
    .ff-chat-footer { padding: 12px 16px 16px; border-top: 1px solid #EEE9DA; }
    .ff-chat-bargain-hint {
        font-size: 12px;
        color: #6F9638;
        background: #EAF0DF;
        padding: 6px 10px;
        border-radius: 8px;
        margin-bottom: 8px;
    }
    .ff-chat-input-row { display: flex; gap: 8px; align-items: flex-end; }
    .ff-chat-textarea {
        flex: 1;
        padding: 10px 14px;
        border: 1.5px solid #E5DEC8;
        border-radius: 12px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        background: white;
        resize: none;
        outline: none;
        transition: border-color 0.2s;
    }
    .ff-chat-textarea:focus { border-color: #355C24; }
    .ff-chat-send-btn {
        background: #355C24;
        color: white;
        border: none;
        width: 42px; height: 42px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s, transform 0.15s;
        flex-shrink: 0;
    }
    .ff-chat-send-btn:hover { background: #2D4F1E; transform: scale(1.05); }
    .ff-chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .ff-chat-char-count { font-size: 11px; color: #9B9D95; text-align: right; margin-top: 4px; }

    /* ─── CONVERSATIONS LIST ─── */
    .ff-conv-list { display: flex; flex-direction: column; gap: 8px; }
    .ff-conv-item {
        background: white;
        border: 1.5px solid #EEE9DA;
        border-radius: 14px;
        padding: 14px 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 14px;
    }
    .ff-conv-item:hover { border-color: #355C24; background: #F8F5EC; }
    .ff-conv-avatar {
        width: 44px; height: 44px;
        border-radius: 50%;
        background: #EAF0DF;
        color: #355C24;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 18px;
        flex-shrink: 0;
    }
    .ff-conv-info { flex: 1; min-width: 0; }
    .ff-conv-name { font-weight: 600; font-size: 14px; color: #1F211B; }
    .ff-conv-product { font-size: 12px; color: #6F7168; margin-top: 2px; }
    .ff-conv-last-msg { font-size: 13px; color: #9B9D95; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ff-conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .ff-conv-time { font-size: 11px; color: #9B9D95; }
    .ff-conv-unread {
        background: #355C24;
        color: white;
        border-radius: 50%;
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700;
    }

    /* ─── PRICE HINT BANNER ─── */
    .ff-price-hint {
        background: #EAF0DF;
        border: 1.5px solid #A8BF72;
        border-radius: 10px;
        padding: 8px 14px;
        font-size: 12.5px;
        color: #355C24;
        display: none;
        margin-top: 6px;
    }
    .ff-price-hint.show { display: block; }
    .ff-price-hint.success { background: #ECFDF5; border-color: #6EE7B7; color: #047857; }
    .ff-price-hint.error { background: #FEF2F2; border-color: #FCA5A5; color: #DC2626; }

    /* ─── PRODUCE SELECTOR BAR (Product-wise browsing) ─── */
    .ff-produce-filter-bar {
        background: white;
        border: 1.5px solid #EEE9DA;
        border-radius: 16px;
        padding: 12px 18px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .ff-produce-bar-label {
        font-size: 12.5px;
        font-weight: 600;
        color: #6F7168;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .ff-produce-chips-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
        scrollbar-width: thin;
    }
    .ff-produce-chip {
        white-space: nowrap;
        background: #F8F5EC;
        border: 1px solid #E5DEC8;
        border-radius: 100px;
        padding: 6px 14px;
        font-size: 13px;
        font-family: 'Poppins', sans-serif;
        color: #1F211B;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .ff-produce-chip:hover {
        background: #EAF0DF;
        border-color: #6F9638;
        color: #355C24;
    }
    .ff-produce-chip.active {
        background: #355C24;
        border-color: #355C24;
        color: white;
        font-weight: 600;
    }

    /* ─── PRODUCT REQUESTS (Farmer & Admin) ─── */
    .ff-request-card {
        background: white;
        border-radius: 14px;
        border: 1.5px solid #EEE9DA;
        padding: 16px;
        margin-bottom: 12px;
        transition: all 0.2s;
    }
    .ff-request-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
    .ff-request-name { font-weight: 600; font-size: 15px; color: #1F211B; }
    .ff-request-category { font-size: 12px; color: #6F7168; margin-top: 2px; }
    .ff-request-badge {
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
        display: flex; align-items: center; gap: 4px;
    }
    .ff-request-desc { font-size: 13px; color: #6F7168; margin-bottom: 8px; }
    .ff-request-price-range { font-size: 12px; color: #6F9638; font-weight: 500; margin-bottom: 4px; }
    .ff-request-notes {
        font-size: 13px;
        background: #FDF8EE;
        padding: 8px 12px;
        border-radius: 8px;
        border-left: 3px solid #F28C28;
        margin-bottom: 8px;
    }
    .ff-request-footer { display: flex; justify-content: space-between; font-size: 11px; color: #9B9D95; }

    /* ─── ADMIN PRODUCT REQUEST CARD ─── */
    .ff-admin-req-card {
        background: white;
        border: 1.5px solid #EEE9DA;
        border-radius: 14px;
        padding: 16px 20px;
        margin-bottom: 14px;
    }
    .ff-admin-req-actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
    .ff-admin-btn-approve {
        padding: 8px 18px; background: #16A34A; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13px; font-weight: 600; transition: background 0.2s;
        display: flex; align-items: center; gap: 6px;
    }
    .ff-admin-btn-approve:hover { background: #15803D; }
    .ff-admin-btn-reject {
        padding: 8px 18px; background: #DC2626; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13px; font-weight: 600; transition: background 0.2s;
        display: flex; align-items: center; gap: 6px;
    }
    .ff-admin-btn-reject:hover { background: #B91C1C; }

    /* ─── EMPTY STATE ─── */
    .ff-empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #9B9D95;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    @media (max-width: 480px) {
        .ff-chat-container { max-height: 95vh; border-radius: 14px; }
    }
    `;
    if (!document.getElementById('ff-features-css')) {
        document.head.appendChild(style);
    }
})();

// Make globally accessible
window.FFValidate = FFValidate;
window.FFPriceRules = FFPriceRules;
window.FFMessaging = FFMessaging;
window.FFProductBrowser = FFProductBrowser;
window.FFProductRequests = FFProductRequests;
