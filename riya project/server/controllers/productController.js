const { pool } = require('../config/database');

// Get all products with filters
const getProducts = async (req, res) => {
    try {
        const { category, search, farmer, minPrice, maxPrice, available } = req.query;
        
        let query = `
            SELECT p.*, u.name as farmer_name, u.farm_name 
            FROM products p
            JOIN users u ON p.farmer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (category) {
            query += ' AND p.category = ?';
            params.push(category);
        }

        if (farmer) {
            query += ' AND p.farmer_id = ?';
            params.push(farmer);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(maxPrice));
        }

        if (available === 'true') {
            query += ' AND p.is_available = TRUE AND p.quantity > 0';
        }

        query += ' ORDER BY p.created_at DESC';

        const [products] = await pool.query(query, params);

        res.json({
            success: true,
            products,
            count: products.length
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get single product
const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const [products] = await pool.query(
            `SELECT p.*, u.name as farmer_name, u.farm_name, u.farm_location, u.phone as farmer_phone, u.id as farmer_id, u.is_verified as farmer_is_verified, u.farmer_id as kisan_id
             FROM products p
             JOIN users u ON p.farmer_id = u.id
             WHERE p.id = ?`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product: products[0]
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Create product (Farmer only)
const createProduct = async (req, res) => {
    try {
        const farmerId = req.userId;
        const { name, category, description, price, quantity, unit } = req.body;
        
        console.log('Creating product for farmer:', farmerId);
        console.log('Product data:', { name, category, description, price, quantity, unit });
        console.log('File received:', req.file);
        
        let imageUrl = null;
        if (req.file) {
            // Use the correct URL format
            imageUrl = `/uploads/${req.file.filename}`;
            console.log('Image URL:', imageUrl);
        }

        // Validate required fields
        if (!name || !category || !price || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, price, quantity'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [farmerId, name, category, description || '', parseFloat(price), parseInt(quantity), unit || 'kg', imageUrl]
        );

        console.log('Product inserted with ID:', result.insertId);

        // Get the newly created product
        const [newProduct] = await pool.query(
            `SELECT p.*, u.name as farmer_name 
             FROM products p
             JOIN users u ON p.farmer_id = u.id
             WHERE p.id = ?`,
            [result.insertId]
        );

        if (newProduct.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product created but not found'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: newProduct[0]
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Update product (Farmer only)
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const farmerId = req.userId;
        const { name, category, description, price, quantity, unit, is_available } = req.body;

        console.log('Updating product:', productId, 'for farmer:', farmerId);
        console.log('Update data:', { name, category, description, price, quantity, unit, is_available });
        console.log('File received:', req.file);

        // Check if product exists and belongs to farmer
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND farmer_id = ?',
            [productId, farmerId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or you do not have permission'
            });
        }

        let imageUrl = products[0].image_url;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Build update query
        const updates = [];
        const params = [];

        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (category) {
            updates.push('category = ?');
            params.push(category);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (price) {
            updates.push('price = ?');
            params.push(parseFloat(price));
        }
        if (quantity !== undefined) {
            updates.push('quantity = ?');
            params.push(parseInt(quantity));
        }
        if (unit) {
            updates.push('unit = ?');
            params.push(unit);
        }
        if (imageUrl) {
            updates.push('image_url = ?');
            params.push(imageUrl);
        }
        if (is_available !== undefined) {
            updates.push('is_available = ?');
            params.push(is_available === 'true' || is_available === true);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND farmer_id = ?`;
        params.push(productId, farmerId);

        await pool.query(query, params);

        const [updatedProduct] = await pool.query(
            `SELECT p.*, u.name as farmer_name 
             FROM products p
             JOIN users u ON p.farmer_id = u.id
             WHERE p.id = ?`,
            [productId]
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct[0]
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete product (Farmer only)
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const farmerId = req.userId;

        // Check if product exists and belongs to farmer
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND farmer_id = ?',
            [productId, farmerId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or you do not have permission'
            });
        }

        await pool.query(
            'DELETE FROM products WHERE id = ? AND farmer_id = ?',
            [productId, farmerId]
        );

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// Get farmer's products
const getFarmerProducts = async (req, res) => {
    try {
        const farmerId = req.userId;

        const [products] = await pool.query(
            `SELECT p.*, 
                    COALESCE((SELECT SUM(quantity) FROM order_items WHERE product_id = p.id), 0) as total_sold
             FROM products p
             WHERE p.farmer_id = ?
             ORDER BY p.created_at DESC`,
            [farmerId]
        );

        res.json({
            success: true,
            products,
            count: products.length
        });

    } catch (error) {
        console.error('Get farmer products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer products',
            error: error.message
        });
    }
};

// Get product categories
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT DISTINCT category FROM products WHERE is_available = TRUE ORDER BY category'
        );

        res.json({
            success: true,
            categories: categories.map(c => c.category)
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Toggle product availability
const toggleProductAvailability = async (req, res) => {
    try {
        const farmerId = req.userId;
        const productId = req.params.id;

        const [products] = await pool.query(
            'SELECT id, is_available, name FROM products WHERE id = ? AND farmer_id = ?',
            [productId, farmerId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        const newStatus = !products[0].is_available;
        await pool.query(
            'UPDATE products SET is_available = ? WHERE id = ?',
            [newStatus, productId]
        );

        res.json({
            success: true,
            is_available: newStatus,
            message: `Product ${products[0].name} marked as ${newStatus ? 'Available' : 'Unavailable'}`
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling availability',
            error: error.message
        });
    }
};

// Quick adjust product stock
const quickAdjustStock = async (req, res) => {
    try {
        const farmerId = req.userId;
        const productId = req.params.id;
        const { delta, quantity } = req.body;

        const [products] = await pool.query(
            'SELECT id, quantity, name FROM products WHERE id = ? AND farmer_id = ?',
            [productId, farmerId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        let newQty = products[0].quantity;
        if (typeof quantity === 'number') {
            newQty = Math.max(0, quantity);
        } else if (typeof delta === 'number') {
            newQty = Math.max(0, newQty + delta);
        }

        await pool.query(
            'UPDATE products SET quantity = ? WHERE id = ?',
            [newQty, productId]
        );

        res.json({
            success: true,
            quantity: newQty,
            message: `Updated stock for ${products[0].name} to ${newQty}`
        });
    } catch (error) {
        console.error('Quick adjust stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adjusting stock',
            error: error.message
        });
    }
};

// Get public farm profile by farmer ID
const getFarmerPublicProfile = async (req, res) => {
    try {
        const farmerId = req.params.id;

        const [farmers] = await pool.query(
            `SELECT id, name, farm_name, farm_location, phone, email, is_verified, farmer_id as kisan_id, created_at
             FROM users
             WHERE id = ? AND role = 'farmer'`,
            [farmerId]
        );

        if (farmers.length === 0) {
            return res.status(404).json({ success: false, message: 'Farm profile not found' });
        }

        const [products] = await pool.query(
            `SELECT id, name, category, price, quantity, unit, image_url, is_available, description
             FROM products
             WHERE farmer_id = ? AND is_available = TRUE AND quantity > 0
             ORDER BY created_at DESC`,
            [farmerId]
        );

        const [ordersCount] = await pool.query(
            `SELECT COUNT(DISTINCT order_id) as total_orders
             FROM order_items
             WHERE farmer_id = ?`,
            [farmerId]
        );

        res.json({
            success: true,
            farmer: {
                ...farmers[0],
                total_products: products.length,
                total_fulfilled_orders: ordersCount[0].total_orders || 0
            },
            products
        });
    } catch (err) {
        console.error('Error fetching farmer public profile:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch farm profile: ' + err.message });
    }
};

module.exports = {
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
};