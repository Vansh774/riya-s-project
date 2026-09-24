const { pool } = require('../config/database');

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, phone, address, bio, farm_name, farm_location } = req.body;

        let query = 'UPDATE users SET ';
        const updates = [];
        const params = [];

        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            params.push(bio);
        }
        if (farm_name !== undefined) {
            updates.push('farm_name = ?');
            params.push(farm_name);
        }
        if (farm_location !== undefined) {
            updates.push('farm_location = ?');
            params.push(farm_location);
        }

        if (req.file) {
            updates.push('profile_image = ?');
            params.push(`/uploads/${req.file.filename}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        query += updates.join(', ');
        query += ' WHERE id = ?';
        params.push(userId);

        await pool.query(query, params);

        const [users] = await pool.query(
            'SELECT id, name, email, role, phone, address, profile_image, bio, farm_name, farm_location FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: users[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const [users] = await pool.query(
            `SELECT id, name, email, role, phone, address, profile_image, bio, 
                    farm_name, farm_location, created_at 
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
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Wishlist functions
const getWishlist = async (req, res) => {
    try {
        const customerId = req.userId;

        const [wishlist] = await pool.query(
            `SELECT w.*, p.name as product_name, p.price, p.image_url, p.category,
                    u.name as farmer_name
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             JOIN users u ON p.farmer_id = u.id
             WHERE w.customer_id = ?
             ORDER BY w.created_at DESC`,
            [customerId]
        );

        res.json({
            success: true,
            wishlist,
            count: wishlist.length
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const customerId = req.userId;
        const { product_id } = req.body;

        // Check if product exists
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND is_available = TRUE',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unavailable'
            });
        }

        // Check if already in wishlist
        const [existing] = await pool.query(
            'SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?',
            [customerId, product_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        await pool.query(
            'INSERT INTO wishlist (customer_id, product_id) VALUES (?, ?)',
            [customerId, product_id]
        );

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist'
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to wishlist',
            error: error.message
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const customerId = req.userId;
        const productId = req.params.productId;

        const [result] = await pool.query(
            'DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?',
            [customerId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        res.json({
            success: true,
            message: 'Product removed from wishlist'
        });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from wishlist',
            error: error.message
        });
    }
};

// Reviews
const addReview = async (req, res) => {
    try {
        const customerId = req.userId;
        const { product_id, rating, comment } = req.body;

        // Check if customer has purchased this product
        const [purchased] = await pool.query(
            `SELECT oi.id FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.product_id = ? AND o.customer_id = ? AND o.status = 'delivered'`,
            [product_id, customerId]
        );

        if (purchased.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased'
            });
        }

        // Check if already reviewed
        const [existing] = await pool.query(
            'SELECT * FROM reviews WHERE product_id = ? AND customer_id = ?',
            [product_id, customerId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        await pool.query(
            'INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)',
            [product_id, customerId, rating, comment]
        );

        res.status(201).json({
            success: true,
            message: 'Review added successfully'
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: error.message
        });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;

        const [reviews] = await pool.query(
            `SELECT r.*, u.name as customer_name, u.profile_image
             FROM reviews r
             JOIN users u ON r.customer_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );

        const [avgRating] = await pool.query(
            'SELECT AVG(rating) as average, COUNT(*) as total FROM reviews WHERE product_id = ?',
            [productId]
        );

        res.json({
            success: true,
            reviews,
            averageRating: avgRating[0].average || 0,
            totalReviews: avgRating[0].total || 0
        });

    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

const getFarmerReviews = async (req, res) => {
    try {
        const farmerId = req.userId;

        const [reviews] = await pool.query(
            `SELECT r.id, r.product_id, r.customer_id, r.rating, r.comment, r.created_at,
                    p.name as product_name, p.image_url as product_image, p.price as product_price,
                    u.name as customer_name, u.email as customer_email, u.profile_image as customer_avatar
             FROM reviews r
             JOIN products p ON r.product_id = p.id
             JOIN users u ON r.customer_id = u.id
             WHERE p.farmer_id = ?
             ORDER BY r.created_at DESC`,
            [farmerId]
        );

        const [summary] = await pool.query(
            `SELECT AVG(r.rating) as average, COUNT(*) as total
             FROM reviews r
             JOIN products p ON r.product_id = p.id
             WHERE p.farmer_id = ?`,
            [farmerId]
        );

        const [ratingDist] = await pool.query(
            `SELECT r.rating, COUNT(*) as count
             FROM reviews r
             JOIN products p ON r.product_id = p.id
             WHERE p.farmer_id = ?
             GROUP BY r.rating`,
            [farmerId]
        );

        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDist.forEach(row => {
            if (row.rating >= 1 && row.rating <= 5) {
                ratingCounts[row.rating] = row.count;
            }
        });

        res.json({
            success: true,
            reviews,
            averageRating: parseFloat(summary[0]?.average || 0).toFixed(1),
            totalReviews: summary[0]?.total || 0,
            ratingCounts
        });

    } catch (error) {
        console.error('Get farmer reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer reviews',
            error: error.message
        });
    }
};

module.exports = {
    updateProfile,
    getProfile,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    addReview,
    getProductReviews,
    getFarmerReviews
};