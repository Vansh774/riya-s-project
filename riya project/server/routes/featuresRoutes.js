const express = require('express');
const router = express.Router();
const {
    getOrCreateConversation,
    getMyConversations,
    getConversationMessages,
    sendMessage,
    getUnreadCount,
    // Negotiation
    submitOffer,
    submitCounter,
    acceptOffer,
    rejectOffer,
    getConversationNegotiation,
    getAcceptedNegotiationForProduct,
    getPriceRules,
    getPriceRuleForProduct,
    submitProductRequest,
    getMyProductRequests,
    getApprovedCatalog,
    getProductRequestsAdmin,
    approveProductRequest,
    rejectProductRequest,
    getProductStats
} = require('../controllers/featuresController');
const { authenticate, authorizeFarmer, authorizeCustomer, authorizeAdmin } = require('../middleware/auth');

// ─── MESSAGING ROUTES ─────────────────────────────────────────────────────────
// Get or create a conversation (customer or farmer)
router.get('/conversations', authenticate, getMyConversations);
router.get('/conversations/find', authenticate, getOrCreateConversation);
router.get('/conversations/:id/messages', authenticate, getConversationMessages);
router.post('/conversations/:id/messages', authenticate, sendMessage);
router.get('/unread-count', authenticate, getUnreadCount);

// ─── PRICE NEGOTIATION / BARGAINING ROUTES ────────────────────────────────────
router.post('/conversations/:id/negotiation/offer', authenticate, submitOffer);
router.post('/conversations/:id/negotiation/counter', authenticate, submitCounter);
router.post('/conversations/:id/negotiation/accept', authenticate, acceptOffer);
router.post('/conversations/:id/negotiation/reject', authenticate, rejectOffer);
router.get('/conversations/:id/negotiation', authenticate, getConversationNegotiation);
router.get('/negotiations/product/:productId', authenticate, getAcceptedNegotiationForProduct);

// ─── PRICE RULES (public) ─────────────────────────────────────────────────────
router.get('/price-rules', getPriceRules);
router.get('/price-rules/lookup', getPriceRuleForProduct);

// ─── APPROVED PRODUCT CATALOG (public) ───────────────────────────────────────
router.get('/catalog', getApprovedCatalog);

// ─── PRODUCT REQUESTS (farmer) ───────────────────────────────────────────────
router.post('/product-requests', authenticate, authorizeFarmer, submitProductRequest);
router.get('/product-requests/my', authenticate, authorizeFarmer, getMyProductRequests);
router.get('/product-requests/mine', authenticate, authorizeFarmer, getMyProductRequests);

// ─── ADMIN: Product Requests ──────────────────────────────────────────────────
router.get('/admin/product-requests', authenticate, authorizeAdmin, getProductRequestsAdmin);
router.post('/admin/product-requests/:id/approve', authenticate, authorizeAdmin, approveProductRequest);
router.post('/admin/product-requests/:id/reject', authenticate, authorizeAdmin, rejectProductRequest);
router.get('/admin/product-stats', authenticate, authorizeAdmin, getProductStats);

module.exports = router;
