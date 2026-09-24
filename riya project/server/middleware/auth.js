const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database with moderation status
        const [users] = await pool.query(
            'SELECT id, name, email, role, status, suspended_until, suspension_reason, ban_reason, warning_count, last_warning FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        const user = users[0];

        // Check if account is banned
        if (user.status === 'banned') {
            return res.status(403).json({
                success: false,
                account_status: 'banned',
                message: `Account Banned: ${user.ban_reason || 'Your account has been permanently banned by administration.'}`
            });
        }

        // Check if account is suspended
        if (user.status === 'suspended') {
            const now = new Date();
            const suspendedUntil = user.suspended_until ? new Date(user.suspended_until) : null;

            if (suspendedUntil && suspendedUntil > now) {
                const remainingDays = Math.ceil((suspendedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return res.status(403).json({
                    success: false,
                    account_status: 'suspended',
                    suspended_until: user.suspended_until,
                    remaining_days: remainingDays,
                    message: `Account Temporarily Suspended: Your account is suspended until ${suspendedUntil.toLocaleDateString()} (${remainingDays} day(s) remaining). Reason: ${user.suspension_reason || 'Policy violation'}`
                });
            } else if (suspendedUntil && suspendedUntil <= now) {
                // Suspension duration has expired -> auto-reinstate account to active
                await pool.query(
                    "UPDATE users SET status = 'active', suspended_until = NULL, suspension_reason = NULL WHERE id = ?",
                    [user.id]
                );
                user.status = 'active';
                user.suspended_until = null;
                user.suspension_reason = null;
            }
        }

        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Authentication error.',
            error: error.message
        });
    }
};

const authorizeFarmer = (req, res, next) => {
    if (req.userRole !== 'farmer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Farmer only.'
        });
    }
    next();
};

const authorizeCustomer = (req, res, next) => {
    if (req.userRole !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Customer only.'
        });
    }
    next();
};

const authorizeAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Administrator only.'
        });
    }
    next();
};

module.exports = {
    authenticate,
    authorizeFarmer,
    authorizeCustomer,
    authorizeAdmin
};