const express = require('express');
const router = express.Router();
const {
    createOrder,
    getCustomerOrders,
    getFarmerOrders,
    getOrder,
    updateOrderStatus,
    getFarmerStats,
    getOrderHistory,
    getCustomerNotifications,
    markNotificationRead
} = require('../controllers/orderController');
const { authenticate, authorizeCustomer, authorizeFarmer } = require('../middleware/auth');
const { validateOrder, validate } = require('../utils/validators');

// Customer routes
router.post('/', authenticate, authorizeCustomer, validateOrder, validate, createOrder);
router.get('/customer/orders', authenticate, authorizeCustomer, getCustomerOrders);
router.get('/my-orders', authenticate, authorizeCustomer, getCustomerOrders);
router.get('/customer/notifications', authenticate, getCustomerNotifications);
router.put('/customer/notifications/:id/read', authenticate, markNotificationRead);

// Farmer routes
router.get('/farmer/orders', authenticate, authorizeFarmer, getFarmerOrders);
router.get('/farmer/stats', authenticate, authorizeFarmer, getFarmerStats);

// Shared routes (auth required - role checked in controller)
router.get('/:id', authenticate, getOrder);
router.get('/:id/history', authenticate, getOrderHistory);
router.put('/:id/status', authenticate, updateOrderStatus);

module.exports = router;