const { pool } = require('../config/database');

// Levenshtein distance helper
function levenshteinDistance(s1, s2) {
    s1 = (s1 || '').toLowerCase();
    s2 = (s2 || '').toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length] !== undefined ? costs[s2.length] : 999;
}

const PRODUCE_TYPO_MAP = {
    'aple': 'Apple',
    'appel': 'Apple',
    'tomatto': 'Tomato',
    'tamatar': 'Tomato',
    'potatto': 'Potato',
    'aloo': 'Potato',
    'alu': 'Potato',
    'pyaz': 'Onion',
    'mashroom': 'Mushroom',
    'mushrum': 'Mushroom',
    'banaana': 'Banana',
    'kela': 'Banana',
    'palak': 'Spinach',
    'gobi': 'Cauliflower',
    'patta gobi': 'Cabbage',
    'okra': 'Bhindi (Okra)',
    'ladyfinger': 'Bhindi (Okra)',
    'eggplant': 'Brinjal (Eggplant)',
    'baingan': 'Brinjal (Eggplant)',
    'gajar': 'Carrot',
    'lahsun': 'Garlic',
    'adrak': 'Ginger',
    'nimbu': 'Lemon',
    'aam': 'Mango',
    'anar': 'Pomegranate',
    'dragonfruit': 'Dragon Fruit'
};

// Helper: normalize produce name to canonical catalog form
async function normalizeProduceName(rawName) {
    if (!rawName) return '';
    const cleaned = rawName.trim().replace(/\s+\d{3,5}$/, '').trim();
    const lower = cleaned.toLowerCase();

    if (PRODUCE_TYPO_MAP[lower]) {
        return PRODUCE_TYPO_MAP[lower];
    }

    try {
        const [catalog] = await pool.query('SELECT name FROM approved_product_catalog WHERE is_active = TRUE');
        // Exact case-insensitive match
        for (const item of catalog) {
            if (item.name.toLowerCase() === lower) {
                return item.name;
            }
        }

        // Substring match
        for (const item of catalog) {
            const cLower = item.name.toLowerCase();
            if (cLower.includes(lower) || lower.includes(cLower)) {
                return item.name;
            }
        }

        // Fuzzy match
        let bestMatch = null;
        let minDistance = 999;
        for (const item of catalog) {
            const dist = levenshteinDistance(lower, item.name.toLowerCase());
            const maxAllowed = item.name.length <= 5 ? 1 : 2;
            if (dist <= maxAllowed && dist < minDistance) {
                minDistance = dist;
                bestMatch = item.name;
            }
        }

        if (bestMatch) return bestMatch;
    } catch (e) {
        console.error('Error fetching catalog for normalization:', e);
    }

    return cleaned;
}

// Helper: lookup price rule by product name
async function lookupPriceRule(productName) {
    if (!productName) return null;
    const normalizedName = await normalizeProduceName(productName);
    const lower = normalizedName.toLowerCase();

    // 1. Direct match on product_name or display_name
    const [rules] = await pool.query(
        'SELECT * FROM product_price_rules WHERE (product_name = ? OR LOWER(display_name) = ?) AND is_active = TRUE',
        [lower, lower]
    );
    if (rules.length > 0) return rules[0];

    // 2. Partial match against all active rules
    const [allRules] = await pool.query('SELECT * FROM product_price_rules WHERE is_active = TRUE');
    for (const r of allRules) {
        const rName = r.product_name.toLowerCase();
        const rDisp = (r.display_name || '').toLowerCase();
        if (lower.includes(rName) || rName.includes(lower) || lower.includes(rDisp) || rDisp.includes(lower)) {
            return r;
        }
        if (levenshteinDistance(lower, rName) <= 1 || levenshteinDistance(lower, rDisp) <= 1) {
            return r;
        }
    }

    return null;
}

// Get all products with filters
const getProducts = async (req, res) => {
    try {
        const { category, search, farmer, minPrice, maxPrice, available, limit, offset } = req.query;
        
        let query = `
            SELECT p.id, p.farmer_id, p.name, p.category, p.description, p.price, p.unit, p.quantity, p.image_url, p.is_available, p.created_at,
                   u.name as farmer_name, u.farm_name, u.farm_location 
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

        if (limit) {
            const numLimit = parseInt(limit);
            if (!isNaN(numLimit) && numLimit > 0) {
                query += ' LIMIT ?';
                params.push(numLimit);

                if (offset) {
                    const numOffset = parseInt(offset);
                    if (!isNaN(numOffset) && numOffset >= 0) {
                        query += ' OFFSET ?';
                        params.push(numOffset);
                    }
                }
            }
        }

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

        const numPrice = parseFloat(price);
        const numQty = parseInt(quantity);

        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ success: false, message: 'Price must be a valid positive number (e.g. 25.50).' });
        }
        if (isNaN(numQty) || numQty < 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be a valid non-negative whole number.' });
        }

        const rawName = (name || '').trim();
        const canonicalName = await normalizeProduceName(rawName);

        // 1. Check if farmer has a pending request for this product
        const [pendingReqs] = await pool.query(
            `SELECT id, status FROM product_requests 
             WHERE farmer_id = ? AND (LOWER(product_name) = LOWER(?) OR LOWER(product_name) = LOWER(?)) AND status = 'pending'
             LIMIT 1`,
            [farmerId, rawName, canonicalName]
        );
        if (pendingReqs.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This product is currently awaiting admin approval. You cannot sell it until the product request is approved."
            });
        }

        // 2. Check approved_product_catalog
        const [catalogMatch] = await pool.query(
            `SELECT id, name, category, unit FROM approved_product_catalog 
             WHERE (LOWER(name) = LOWER(?) OR LOWER(name) = LOWER(?)) AND is_active = TRUE
             LIMIT 1`,
            [rawName, canonicalName]
        );

        if (catalogMatch.length === 0) {
            // Check if there was a rejected request
            const [rejectedReqs] = await pool.query(
                `SELECT id, status FROM product_requests 
                 WHERE farmer_id = ? AND (LOWER(product_name) = LOWER(?) OR LOWER(product_name) = LOWER(?)) AND status = 'rejected'
                 LIMIT 1`,
                [farmerId, rawName, canonicalName]
            );
            if (rejectedReqs.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "This product request was rejected by admin. You cannot sell it without approval."
                });
            }

            return res.status(400).json({
                success: false,
                message: "Product name not recognized. Please select an approved produce or submit a Product Request."
            });
        }

        const resolvedName = catalogMatch[0].name;

        // 3. Check price rules using canonical produce name
        const priceRule = await lookupPriceRule(resolvedName);
        if (priceRule) {
            if (numPrice < priceRule.min_price) {
                return res.status(400).json({
                    success: false,
                    message: `Price ₹${numPrice} is below the allowed minimum of ₹${priceRule.min_price}/${priceRule.unit} for ${priceRule.display_name}.`
                });
            }
            if (numPrice > priceRule.max_price) {
                return res.status(400).json({
                    success: false,
                    message: `Price ₹${numPrice} exceeds the allowed maximum of ₹${priceRule.max_price}/${priceRule.unit} for ${priceRule.display_name}.`
                });
            }
        }

        const [result] = await pool.query(
            `INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [farmerId, resolvedName, category, description || '', numPrice, numQty, unit || 'kg', imageUrl]
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

        // Validate price and quantity if provided
        if (price !== undefined && price !== '') {
            const numPrice = parseFloat(price);
            if (isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ success: false, message: 'Price must be a valid positive number (e.g. 25.50).' });
            }
            // Check price rule against current or new product name
            const checkName = name || products[0].name;
            const priceRule = await lookupPriceRule(checkName);
            if (priceRule) {
                if (numPrice < priceRule.min_price) {
                    return res.status(400).json({
                        success: false,
                        message: `Price ₹${numPrice} is below the allowed minimum of ₹${priceRule.min_price}/${priceRule.unit} for ${priceRule.display_name}.`
                    });
                }
                if (numPrice > priceRule.max_price) {
                    return res.status(400).json({
                        success: false,
                        message: `Price ₹${numPrice} exceeds the allowed maximum of ₹${priceRule.max_price}/${priceRule.unit} for ${priceRule.display_name}.`
                    });
                }
            }
        }
        if (quantity !== undefined && quantity !== '') {
            const numQty = parseInt(quantity);
            if (isNaN(numQty) || numQty < 0) {
                return res.status(400).json({ success: false, message: 'Quantity must be a valid non-negative whole number.' });
            }
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
        if (price !== undefined && price !== '') {
            updates.push('price = ?');
            params.push(parseFloat(price));
        }
        if (quantity !== undefined && quantity !== '') {
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