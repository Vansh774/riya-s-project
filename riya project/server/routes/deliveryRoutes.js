const express = require('express');
const router = express.Router();
const {
    assignDelivery,
    getDeliveryAssignment,
    getTrackingByToken,
    startTracking,
    stopTracking,
    updateLocation,
    updateDeliveryStatus,
    getLiveLocation
} = require('../controllers/deliveryController');
const { authenticate, authorizeFarmer } = require('../middleware/auth');

// ─── FARMER ROUTES ─────────────────────────────────────────────────────────────
// Assign delivery person to an order (requires Farmer role)
router.post('/orders/:orderId/assign', authenticate, authorizeFarmer, assignDelivery);

// Get delivery assignment for an order (requires Farmer role)
router.get('/orders/:orderId/assignment', authenticate, authorizeFarmer, getDeliveryAssignment);

// ─── PUBLIC TOKEN-BASED ROUTES (for delivery person mobile webpage) ────────────
// Get assignment details by secure token
router.get('/track/:token', getTrackingByToken);

// Start live GPS tracking session
router.post('/track/:token/start', startTracking);

// Stop live GPS tracking session
router.post('/track/:token/stop', stopTracking);

// Push GPS location update
router.post('/track/:token/location', updateLocation);

// Update delivery progression status (picked_up, out_for_delivery, on_the_way, delivered)
router.put('/track/:token/status', updateDeliveryStatus);

// ─── AUTHENTICATED SHARED ROUTE (Customer or Farmer live polling/view) ─────────
// Get live location and route trail for an order
router.get('/orders/:orderId/live', authenticate, getLiveLocation);

module.exports = router;
