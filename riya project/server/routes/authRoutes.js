const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, verifyKisanCardEndpoint } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin, validate } = require('../utils/validators');
const kisanUpload = require('../middleware/kisanUpload');

// Middleware to handle optional multipart form-data for registration
const handleRegistrationUpload = (req, res, next) => {
    if (req.is('multipart/form-data')) {
        kisanUpload.single('kisan_card_file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    } else {
        next();
    }
};

// Public routes
router.post('/register', handleRegistrationUpload, validateRegistration, validate, register);
router.post('/login', validateLogin, validate, login);
router.post('/verify-kisan-card', (req, res, next) => {
    kisanUpload.single('kisan_card_file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
        }
        next();
    });
}, verifyKisanCardEndpoint);

// Protected route
router.get('/me', authenticate, getCurrentUser);

module.exports = router;