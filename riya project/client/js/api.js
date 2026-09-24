// API Service
const API = {
    baseURL: 'http://localhost:5000/api',
    token: localStorage.getItem('token') || null,

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    },

    // Get headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    },

    // Get headers for form data
    getFormDataHeaders() {
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    },

    // Handle response
    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            const errDetail = (data && data.errors && Array.isArray(data.errors))
                ? data.errors.map(e => e.message || e.msg).filter(Boolean).join(', ')
                : '';
            throw new Error((data && data.message) || errDetail || 'Something went wrong');
        }
        return data;
    },

    // GET request
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // POST request
    async post(endpoint, body) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    },

    // PUT request
    async put(endpoint, body) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    },

    // PATCH request
    async patch(endpoint, body = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    },

    // DELETE request
    async delete(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // POST with form data (file upload)
async postFormData(endpoint, formData) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getFormDataHeaders(),
        body: formData
    });
    return this.handleResponse(response);
},

    // PUT with form data (file upload)
async putFormData(endpoint, formData) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getFormDataHeaders(),
        body: formData
    });
    return this.handleResponse(response);
},

    // ============================================
    // AUTH API
    // ============================================
    auth: {
        register: (data) => API.post('/auth/register', data),
        login: (data) => API.post('/auth/login', data),
        getCurrentUser: () => API.get('/auth/me')
    },

    // ============================================
    // PRODUCTS API
    // ============================================
    products: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/products${query ? '?' + query : ''}`);
        },
        getById: (id) => API.get(`/products/${id}`),
        create: (data) => API.postFormData('/products', data),
        update: (id, data) => API.putFormData(`/products/${id}`, data),
        delete: (id) => API.delete(`/products/${id}`),
        toggleAvailability: (id) => API.patch(`/products/${id}/toggle-availability`),
        quickStock: (id, payload) => API.patch(`/products/${id}/quick-stock`, payload),
        getFarmerProducts: () => API.get('/products/farmer/products'),
        getFarmerProfile: (id) => API.get(`/products/farmer-profile/${id}`),
        getCategories: () => API.get('/products/categories')
    },

    // ============================================
    // ORDERS API
    // ============================================
    orders: {
        create: (data) => API.post('/orders', data),
        getCustomerOrders: () => API.get('/orders/customer/orders'),
        getFarmerOrders: () => API.get('/orders/farmer/orders'),
        getFarmerStats: (params = {}) => {
            const tf = typeof params === 'string' ? params : (params && params.timeframe ? params.timeframe : '');
            return API.get(`/orders/farmer/stats${tf ? '?timeframe=' + encodeURIComponent(tf) : ''}`);
        },
        getById: (id) => API.get(`/orders/${id}`),
        getHistory: (id) => API.get(`/orders/${id}/history`),
        updateStatus: (id, status, note) => API.put(`/orders/${id}/status`, { status, note })
    },

    // ============================================
    // USER API
    // ============================================
    user: {
        getProfile: () => API.get('/users/profile'),
        updateProfile: (data) => API.putFormData('/users/profile', data),
        getWishlist: () => API.get('/users/wishlist'),
        addToWishlist: (productId) => API.post('/users/wishlist', { product_id: productId }),
        removeFromWishlist: (productId) => API.delete(`/users/wishlist/${productId}`),
        addReview: (data) => API.post('/users/reviews', data),
        getProductReviews: (productId) => API.get(`/users/reviews/${productId}`),
        getFarmerReviews: () => API.get('/users/farmer/reviews')
    },

    // ============================================
    // DELIVERY API
    // ============================================
    delivery: {
        assign: (orderId, data) => API.post(`/delivery/orders/${orderId}/assign`, data),
        getAssignment: (orderId) => API.get(`/delivery/orders/${orderId}/assignment`),
        getLive: (orderId) => API.get(`/delivery/orders/${orderId}/live`)
    }
};

// Export for use in other files
window.API = API;