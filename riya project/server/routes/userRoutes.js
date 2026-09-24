const express = require('express');
const router = express.Router();
const {
    updateProfile,
    getProfile,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    addReview,
    getProductReviews,
    getFarmerReviews
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Profile routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('profile_image'), updateProfile);

// Wishlist routes
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist', authenticate, addToWishlist);
router.delete('/wishlist/:productId', authenticate, removeFromWishlist);

// Review routes
router.post('/reviews', authenticate, addReview);
router.get('/reviews/:productId', getProductReviews);
router.get('/farmer/reviews', authenticate, getFarmerReviews);

module.exports = router;