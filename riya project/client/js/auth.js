// Authentication Functions

// Check if user is logged in
function isAuthenticated() {
    return !!API.token;
}

// Get current user from localStorage
function getCurrentUser() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

// Save user data
function setUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Clear user data (logout)
function clearUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    API.setToken(null);
}

// Handle login
async function handleLogin(email, password) {
    try {
        const response = await API.auth.login({ email, password });
        if (response.success) {
            API.setToken(response.token);
            setUserData(response.user);
            return { success: true, user: response.user };
        }
        return { success: false, message: response.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Handle registration
async function handleRegister(userData) {
    try {
        const response = await API.auth.register(userData);
        if (response.success) {
            API.setToken(response.token);
            setUserData(response.user);
            return { success: true, user: response.user };
        }
        return { success: false, message: response.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Handle logout
function handleLogout() {
    clearUserData();
    window.location.href = 'index.html';
}

// Redirect based on role
function redirectToDashboard(user) {
    if (user.role === 'farmer') {
        window.location.href = 'farmer-dashboard.html';
    } else if (user.role === 'customer') {
        window.location.href = 'customer-dashboard.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Protect dashboard pages
function protectDashboard() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Protect by role
function protectRole(allowedRoles) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Get authentication token
function getToken() {
    return localStorage.getItem('token') || (typeof API !== 'undefined' ? API.token : null) || null;
}

// Initialize auth on page load
function initAuth() {
    const token = localStorage.getItem('token');
    if (token && typeof API !== 'undefined') {
        API.setToken(token);
    }
}

// Export functions
window.auth = {
    isAuthenticated,
    getToken,
    getCurrentUser,
    setUserData,
    clearUserData,
    handleLogin,
    handleRegister,
    handleLogout,
    logout: handleLogout,
    redirectToDashboard,
    protectDashboard,
    protectRole,
    initAuth
};