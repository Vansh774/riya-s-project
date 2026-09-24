const { body, validationResult } = require('express-validator');

// Validation rules
const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['farmer', 'customer']).withMessage('Role must be either farmer or customer'),

    body('farmer_id')
        .if(body('role').equals('farmer'))
        .trim()
        .notEmpty().withMessage('Farmer ID is required for farmers')
        .isLength({ min: 3 }).withMessage('Farmer ID must be at least 3 characters long'),

    body('kisan_card_number')
        .if(body('role').equals('farmer'))
        .trim()
        .notEmpty().withMessage('Kisan Card number is required for farmers')
        .isLength({ min: 3 }).withMessage('Kisan Card number must be at least 3 characters long')
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    
    body('quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
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