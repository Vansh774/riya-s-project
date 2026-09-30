const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Validation rules
const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Full name is required.')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email address is required.')
        .isEmail().withMessage('Please enter a valid email address (e.g. name@example.com).')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/\S/).withMessage('Password cannot be only spaces.'),
    
    body('role')
        .notEmpty().withMessage('Role is required.')
        .isIn(['farmer', 'customer']).withMessage('Role must be either farmer or customer.'),

    body('phone')
        .optional({ checkFalsy: true })
        .custom(val => {
            const cleaned = String(val).replace(/[\s\-+()]/g, '');
            if (!/^\d{7,15}$/.test(cleaned)) throw new Error('Please enter a valid phone number (digits only).');
            return true;
        }),

    body('farmer_id')
        .if(body('role').equals('farmer'))
        .trim()
        .notEmpty().withMessage('Farmer ID is required for farmer registration.')
        .isLength({ min: 3 }).withMessage('Farmer ID must be at least 3 characters.'),

    body('kisan_card_number')
        .if(body('role').equals('farmer'))
        .trim()
        .notEmpty().withMessage('Kisan Card number is required for farmer registration.')
        .isLength({ min: 3 }).withMessage('Kisan Card number must be at least 3 characters.')
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email address is required.')
        .isEmail().withMessage('Please enter a valid email address (e.g. name@example.com).')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required.')
        .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters.'),
    
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required.'),
    
    body('price')
        .notEmpty().withMessage('Price is required.')
        .custom(val => {
            const n = parseFloat(val);
            if (isNaN(n)) throw new Error('Price must be a valid number (e.g. 25.50).');
            if (n <= 0) throw new Error('Price must be greater than 0.');
            if (n > 100000) throw new Error('Price cannot exceed ₹1,00,000.');
            return true;
        }),
    
    body('quantity')
        .optional()
        .custom(val => {
            if (val === '' || val === undefined || val === null) return true;
            const n = parseInt(val);
            if (isNaN(n)) throw new Error('Quantity must be a whole number (e.g. 50).');
            if (n < 0) throw new Error('Quantity cannot be negative.');
            return true;
        }),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.')
];

const validateOrder = [
    body('shipping_address')
        .custom((val, { req }) => {
            const addr = val || req.body.delivery_address;
            if (!addr || String(addr).trim() === '') {
                throw new Error('Shipping address is required');
            }
            return true;
        }),
    
    body('items')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    
    body('items.*.product_id')
        .isInt({ min: 1 }).withMessage('Invalid product ID'),
    
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    body('payment_method')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['cash_on_delivery', 'upi', 'card', 'cod']).withMessage('Payment method must be cash_on_delivery, upi, or card')
];

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorList = errors.array();
        return res.status(400).json({
            success: false,
            message: errorList.map(err => err.msg).join(', '),
            errors: errorList.map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateProduct,
    validateOrder,
    validate
};