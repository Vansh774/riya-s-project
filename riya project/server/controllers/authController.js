const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { pool } = require('../config/database');
const { verifyKisanCard } = require('../utils/kisanVerification');

// Verify Kisan Card standalone endpoint (for live pre-submit check)
const verifyKisanCardEndpoint = async (req, res) => {
    try {
        const { farmer_id, kisan_card_number, client_ocr_text } = req.body;
        const file = req.file;

        if (!farmer_id || String(farmer_id).trim() === '') {
            if (file && file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'Farmer ID is required for verification.' });
        }
        if (!kisan_card_number || String(kisan_card_number).trim() === '') {
            if (file && file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'Kisan Card number is required for verification.' });
        }
        if (!file) {
            return res.status(400).json({ success: false, message: 'Kisan Card document image is required.' });
        }

        const verification = await verifyKisanCard({
            farmerId: farmer_id,
            kisanCardNumber: kisan_card_number,
            file,
            clientOcrText: client_ocr_text
        });

        // Clean up temporary verification file if check_only flag is set
        if (req.body.check_only === 'true' && file.path && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch (e) {}
        }

        if (!verification.verified) {
            return res.status(400).json({
                success: false,
                verified: false,
                message: verification.message,
                details: verification
            });
        }

        return res.json({
            success: true,
            verified: true,
            message: verification.message,
            temp_filename: file.filename,
            details: verification
        });
    } catch (error) {
        console.error('Verify Kisan Card error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying Kisan Card: ' + error.message
        });
    }
};

// Register user
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone,
            address,
            farm_name,
            farm_location,
            farmer_id,
            kisan_card_number,
            client_ocr_text
        } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                try { fs.unlinkSync(req.file.path); } catch (e) {}
            }
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        let kisanCardFilename = null;
        let isFarmerVerified = false;

        // If role is farmer, verify Farmer ID and Kisan Card
        if (role === 'farmer') {
            if (!farmer_id || String(farmer_id).trim() === '') {
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    try { fs.unlinkSync(req.file.path); } catch (e) {}
                }
                return res.status(400).json({
                    success: false,
                    message: 'Farmer ID is required for farmer registration.'
                });
            }

            if (!kisan_card_number || String(kisan_card_number).trim() === '') {
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    try { fs.unlinkSync(req.file.path); } catch (e) {}
                }
                return res.status(400).json({
                    success: false,
                    message: 'Kisan Card number is required for farmer registration.'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload your Kisan Card document for verification.'
                });
            }

            // Perform verification
            const verification = await verifyKisanCard({
                farmerId: farmer_id,
                kisanCardNumber: kisan_card_number,
                file: req.file,
                clientOcrText: client_ocr_text
            });

            if (!verification.verified) {
                // Delete invalid file
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    try { fs.unlinkSync(req.file.path); } catch (e) {}
                }
                return res.status(400).json({
                    success: false,
                    message: verification.message || 'Kisan Card verification failed: Document does not match Farmer ID and Kisan Card.'
                });
            }

            kisanCardFilename = req.file.filename;
            isFarmerVerified = true;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user
        const [result] = await pool.query(
            `INSERT INTO users (name, email, password, role, phone, address, farm_name, farm_location, farmer_id, kisan_card_number, kisan_card_image, is_verified, verified_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                role,
                phone || null,
                address || null,
                farm_name || null,
                farm_location || null,
                role === 'farmer' ? String(farmer_id).trim() : null,
                role === 'farmer' ? String(kisan_card_number).trim() : null,
                kisanCardFilename,
                isFarmerVerified ? 1 : 0,
                isFarmerVerified ? new Date() : null
            ]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: role === 'farmer' 
                ? 'Farmer registered and verified successfully!' 
                : 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role,
                phone: phone || null,
                address: address || null,
                farm_name: farm_name || null,
                farm_location: farm_location || null,
                farmer_id: role === 'farmer' ? String(farmer_id).trim() : null,
                kisan_card_number: role === 'farmer' ? String(kisan_card_number).trim() : null,
                kisan_card_image: kisanCardFilename,
                is_verified: isFarmerVerified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        res.status(500).json({
            success: false,
            message: 'Error registering user: ' + error.message,
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user by email including moderation columns
        const [users] = await pool.query(
            `SELECT id, name, email, password, role, status, suspended_until, suspension_reason, ban_reason,
                    warning_count, last_warning, phone, address, profile_image, 
                    farm_name, farm_location, farmer_id, kisan_card_number, kisan_card_image, is_verified 
             FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is banned
        if (user.status === 'banned') {
            return res.status(403).json({
                success: false,
                account_status: 'banned',
                message: `Account Banned: ${user.ban_reason || 'Your account has been permanently banned by FreshField administration.'}`
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
                    message: `Account Temporarily Suspended: Your account is suspended until ${suspendedUntil.toLocaleDateString()} (${remainingDays} day(s) remaining). Reason: ${user.suspension_reason || 'Under review'}`
                });
            } else if (suspendedUntil && suspendedUntil <= now) {
                // Auto-reinstate expired suspension
                await pool.query(
                    "UPDATE users SET status = 'active', suspended_until = NULL, suspension_reason = NULL WHERE id = ?",
                    [user.id]
                );
                user.status = 'active';
                user.suspended_until = null;
                user.suspension_reason = null;
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status || 'active',
                warning_count: user.warning_count || 0,
                last_warning: user.last_warning || null,
                phone: user.phone || null,
                address: user.address || null,
                farm_name: user.farm_name || null,
                farm_location: user.farm_location || null,
                farmer_id: user.farmer_id || null,
                kisan_card_number: user.kisan_card_number || null,
                kisan_card_image: user.kisan_card_image || null,
                is_verified: !!user.is_verified
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [users] = await pool.query(
            `SELECT id, name, email, role, phone, address, profile_image, bio, 
                    farm_name, farm_location, farmer_id, kisan_card_number, kisan_card_image, is_verified, verified_at, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    verifyKisanCardEndpoint
};