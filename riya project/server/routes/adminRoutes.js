const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getUsers,
    suspendUser,
    unsuspendUser,
    banUser,
    unbanUser,
    warnUser,
    getReports,
    takeReportAction,
    getAdminLogs,
    createFarmerReport,
    getCustomerMyReports,
    getFarmersListForReporting
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin, authorizeCustomer } = require('../middleware/auth');

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
router.get('/stats', authenticate, authorizeAdmin, getAdminStats);
router.get('/users', authenticate, authorizeAdmin, getUsers);
router.post('/users/:id/suspend', authenticate, authorizeAdmin, suspendUser);
router.post('/users/:id/unsuspend', authenticate, authorizeAdmin, unsuspendUser);
router.post('/users/:id/ban', authenticate, authorizeAdmin, banUser);
router.post('/users/:id/unban', authenticate, authorizeAdmin, unbanUser);
router.post('/users/:id/warn', authenticate, authorizeAdmin, warnUser);

router.get('/reports', authenticate, authorizeAdmin, getReports);
router.post('/reports/:id/action', authenticate, authorizeAdmin, takeReportAction);
router.get('/logs', authenticate, authorizeAdmin, getAdminLogs);

// ==========================================
// CUSTOMER REPORTING ROUTES
// ==========================================
router.post('/report-farmer', authenticate, authorizeCustomer, createFarmerReport);
router.get('/my-reports', authenticate, authorizeCustomer, getCustomerMyReports);
router.get('/farmers-list', authenticate, getFarmersListForReporting);

module.exports = router;
