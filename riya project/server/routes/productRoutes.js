const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProduct, 
    getFarmerPublicProfile,
    createProduct, 
    updateProduct, 
    deleteProduct,
    getFarmerProducts,
    getCategories,
    toggleProductAvailability,
    quickAdjustStock
} = require('../controllers/productController');
const { authenticate, authorizeFarmer } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateProduct, validate } = require('../utils/validators');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/farmer/products', authenticate, authorizeFarmer, getFarmerProducts);
router.get('/farmer', authenticate, authorizeFarmer, getFarmerProducts);
router.get('/farmer-profile/:id', getFarmerPublicProfile);
router.get('/:id', getProduct);

// Farmer routes with error handling for multer
router.post('/', 
    authenticate, 
    authorizeFarmer, 
    (req, res, next) => {
        upload.single('image')(req, res, function(err) {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    },
    validateProduct, 
    validate, 
    createProduct
);

router.put('/:id', 
    authenticate, 
    authorizeFarmer, 
    (req, res, next) => {
        upload.single('image')(req, res, function(err) {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    },
    validateProduct, 
    validate, 
    updateProduct
);

router.delete('/:id', authenticate, authorizeFarmer, deleteProduct);
router.patch('/:id/toggle-availability', authenticate, authorizeFarmer, toggleProductAvailability);
router.patch('/:id/quick-stock', authenticate, authorizeFarmer, quickAdjustStock);
router.get('/farmer/products', authenticate, authorizeFarmer, getFarmerProducts);

module.exports = router;