const { pool } = require('../config/database');

// ─────────────────────────────────────────────────
// CONVERSATIONS & MESSAGES
// ─────────────────────────────────────────────────

// GET or CREATE a conversation between customer and farmer for a product
const getOrCreateConversation = async (req, res) => {
    try {
        const customerId = req.userId;
        const { farmer_id, product_id } = req.query;

        if (!farmer_id) {
            return res.status(400).json({ success: false, message: 'farmer_id is required.' });
        }

        // Verify farmer exists
        const [farmers] = await pool.query("SELECT id, name, farm_name FROM users WHERE id = ? AND role = 'farmer'", [farmer_id]);
        if (farmers.length === 0) {
            return res.status(404).json({ success: false, message: 'Farmer not found.' });
        }

        // Verify product belongs to farmer (if provided)
        let productInfo = null;
        if (product_id) {
            const [products] = await pool.query(
                'SELECT id, name, price, unit FROM products WHERE id = ? AND farmer_id = ?',
                [product_id, farmer_id]
            );
            if (products.length > 0) productInfo = products[0];
        }

        // Find existing conversation
        let whereProduct = product_id ? ' AND product_id = ?' : ' AND product_id IS NULL';
        const whereParams = product_id
            ? [customerId, farmer_id, product_id]
            : [customerId, farmer_id];

        const [existing] = await pool.query(
            `SELECT id FROM conversations WHERE customer_id = ? AND farmer_id = ?${whereProduct}`,
            whereParams
        );

        let conversationId;
        if (existing.length > 0) {
            conversationId = existing[0].id;
        } else {
            const subject = productInfo
                ? `Inquiry about ${productInfo.name}`
                : 'Product Inquiry';
            const [result] = await pool.query(
                'INSERT INTO conversations (customer_id, farmer_id, product_id, subject) VALUES (?, ?, ?, ?)',
                [customerId, farmer_id, product_id || null, subject]
            );
            conversationId = result.insertId;
        }

        // Return conversation with details
        const [conv] = await pool.query(`
            SELECT c.*, 
                   cust.name as customer_name, cust.email as customer_email,
                   farm.name as farmer_name, farm.farm_name,
                   p.name as product_name, p.price as product_price, p.unit as product_unit
            FROM conversations c
            JOIN users cust ON c.customer_id = cust.id
            JOIN users farm ON c.farmer_id = farm.id
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.id = ?
        `, [conversationId]);

        res.json({ success: true, conversation: conv[0] });
    } catch (err) {
        console.error('getOrCreateConversation error:', err);
        res.status(500).json({ success: false, message: 'Error getting conversation: ' + err.message });
    }
};

// GET all conversations for current user (customer or farmer)
const getMyConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let query;
        if (userRole === 'customer') {
            query = `
                SELECT c.id, c.subject, c.negotiation_status, c.agreed_price, c.current_offer_price, c.current_offer_by, c.expires_at, c.created_at, c.updated_at,
                       farm.id as farmer_id, farm.name as farmer_name, farm.farm_name,
                       p.id as product_id, p.name as product_name, p.price as product_price, p.unit as product_unit,
                       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != ?) as unread_count,
                       (SELECT message FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages m3 WHERE m3.conversation_id = c.id ORDER BY m3.created_at DESC LIMIT 1) as last_message_at
                FROM conversations c
                JOIN users farm ON c.farmer_id = farm.id
                LEFT JOIN products p ON c.product_id = p.id
                WHERE c.customer_id = ?
                ORDER BY COALESCE((SELECT created_at FROM messages mx WHERE mx.conversation_id = c.id ORDER BY mx.created_at DESC LIMIT 1), c.created_at) DESC
            `;
        } else {
            query = `
                SELECT c.id, c.subject, c.negotiation_status, c.agreed_price, c.current_offer_price, c.current_offer_by, c.expires_at, c.created_at, c.updated_at,
                       cust.id as customer_id, cust.name as customer_name, cust.email as customer_email,
                       p.id as product_id, p.name as product_name, p.price as product_price, p.unit as product_unit,
                       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != ?) as unread_count,
                       (SELECT message FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages m3 WHERE m3.conversation_id = c.id ORDER BY m3.created_at DESC LIMIT 1) as last_message_at
                FROM conversations c
                JOIN users cust ON c.customer_id = cust.id
                LEFT JOIN products p ON c.product_id = p.id
                WHERE c.farmer_id = ?
                ORDER BY COALESCE((SELECT created_at FROM messages mx WHERE mx.conversation_id = c.id ORDER BY mx.created_at DESC LIMIT 1), c.created_at) DESC
            `;
        }

        const [conversations] = await pool.query(query, [userId, userId]);
        res.json({ success: true, conversations });
    } catch (err) {
        console.error('getMyConversations error:', err);
        res.status(500).json({ success: false, message: 'Error fetching conversations: ' + err.message });
    }
};

// GET messages for a specific conversation
const getConversationMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = req.params.id;

        // Authorization: user must be part of the conversation
        const [conv] = await pool.query('SELECT * FROM conversations WHERE id = ?', [convId]);
        if (conv.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        const c = conv[0];
        if (userRole === 'customer' && c.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        if (userRole === 'farmer' && c.farmer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        // Get messages
        const [messages] = await pool.query(`
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `, [convId]);

        // Mark incoming messages as read
        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
            [convId, userId]
        );

        // Also return conversation header details
        const [convDetails] = await pool.query(`
            SELECT c.*, 
                   cust.name as customer_name, cust.email as customer_email,
                   farm.name as farmer_name, farm.farm_name,
                   p.name as product_name, p.price as product_price, p.unit as product_unit, p.image_url as product_image
            FROM conversations c
            JOIN users cust ON c.customer_id = cust.id
            JOIN users farm ON c.farmer_id = farm.id
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.id = ?
        `, [convId]);

        res.json({ success: true, messages, conversation: convDetails[0] });
    } catch (err) {
        console.error('getConversationMessages error:', err);
        res.status(500).json({ success: false, message: 'Error fetching messages: ' + err.message });
    }
};

// POST a message to a conversation
const sendMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = req.params.id;
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
        }
        if (message.trim().length > 2000) {
            return res.status(400).json({ success: false, message: 'Message cannot exceed 2000 characters.' });
        }

        // Authorization check
        const [conv] = await pool.query('SELECT * FROM conversations WHERE id = ?', [convId]);
        if (conv.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }
        const c = conv[0];
        if (userRole === 'customer' && c.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        if (userRole === 'farmer' && c.farmer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        // Insert message
        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)',
            [convId, userId, userRole, message.trim()]
        );

        // Touch conversation updated_at
        await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [convId]);

        // Notify the other party
        const recipientId = userRole === 'customer' ? c.farmer_id : c.customer_id;
        const [sender] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'New Message', ?, 'info')`,
            [recipientId, `New message from ${sender[0]?.name || 'a user'}: "${message.trim().substring(0, 60)}${message.trim().length > 60 ? '...' : ''}"`]
        );

        // Fetch the inserted message
        const [msg] = await pool.query(`
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
        `, [result.insertId]);

        // Emit via socket if available
        try {
            const io = req.app.get('io');
            if (io) {
                io.to(`conversation_${convId}`).emit('new_message', msg[0]);
            }
        } catch (e) {}

        res.status(201).json({ success: true, message: msg[0] });
    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ success: false, message: 'Error sending message: ' + err.message });
    }
};

// GET lightweight unread messages count for badge
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        const [rows] = await pool.query(`
            SELECT COUNT(*) as unread_count
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE (c.customer_id = ? OR c.farmer_id = ?)
              AND m.sender_id != ?
              AND m.is_read = FALSE
        `, [userId, userId, userId]);
        res.json({ success: true, unread_count: rows[0].unread_count || 0 });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ success: false, unread_count: 0 });
    }
};

// ─────────────────────────────────────────────────
// PRICE NEGOTIATION / BARGAINING SYSTEM
// ─────────────────────────────────────────────────

// POST /api/features/conversations/:id/negotiation/offer
// Customer submits initial offer or new offer
const submitOffer = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = parseInt(req.params.id, 10);
        const { offer_price } = req.body;

        if (isNaN(convId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }

        const price = parseFloat(offer_price);
        if (isNaN(price) || !isFinite(price) || price <= 0 || price > 100000) {
            return res.status(400).json({ success: false, message: 'Please enter a valid offer price greater than 0.' });
        }

        // Must be customer making the offer
        if (userRole !== 'customer') {
            return res.status(403).json({ success: false, message: 'Only customers can initiate a price offer.' });
        }

        // Conversation check
        const [convRows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [convId]);
        if (convRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }
        const conv = convRows[0];
        if (conv.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }
        if (!conv.product_id) {
            return res.status(400).json({ success: false, message: 'This conversation is not linked to any product.' });
        }

        // Product verification
        const [prods] = await pool.query('SELECT * FROM products WHERE id = ? AND is_available = TRUE', [conv.product_id]);
        if (prods.length === 0) {
            return res.status(400).json({ success: false, message: 'Product is unavailable or out of stock.' });
        }
        const product = prods[0];
        const unit = product.unit || 'kg';

        // Check if same offer already pending
        if (conv.negotiation_status === 'offer_made' && parseFloat(conv.current_offer_price) === price && conv.current_offer_by === 'customer') {
            return res.status(400).json({ success: false, message: `An offer of ₹${price.toFixed(2)}/${unit} is already pending.` });
        }

        // Update previous pending offers in negotiation_offers to 'cancelled'
        await pool.query(
            "UPDATE negotiation_offers SET status = 'cancelled' WHERE conversation_id = ? AND status = 'pending'",
            [convId]
        );

        // Record new offer in negotiation_offers
        const [offerRes] = await pool.query(
            `INSERT INTO negotiation_offers 
             (conversation_id, product_id, customer_id, farmer_id, offered_by, offer_price, status)
             VALUES (?, ?, ?, ?, 'customer', ?, 'pending')`,
            [convId, conv.product_id, conv.customer_id, conv.farmer_id, price]
        );

        // Update conversation state
        await pool.query(
            `UPDATE conversations 
             SET negotiation_status = 'offer_made',
                 current_offer_price = ?,
                 current_offer_by = 'customer',
                 offer_updated_at = NOW(),
                 updated_at = NOW()
             WHERE id = ?`,
            [price, convId]
        );

        // Insert message in messages table
        const msgText = `Customer offered ₹${price.toFixed(2)} / ${unit}`;
        const [msgResult] = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, sender_role, message, message_type)
             VALUES (?, ?, 'customer', ?, 'offer')`,
            [convId, userId, msgText]
        );

        // Notify farmer
        const [customer] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const custName = customer[0]?.name || 'Customer';
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'New Price Offer', ?, 'order')`,
            [conv.farmer_id, `${custName} offered ₹${price.toFixed(2)}/${unit} for ${product.name}`]
        ).catch(() => {});

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation_${convId}`).emit('negotiation_updated', {
                conversationId: convId,
                status: 'offer_made',
                offer_price: price,
                offered_by: 'customer',
                unit
            });
            const [newMsg] = await pool.query(
                `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
                [msgResult.insertId]
            );
            if (newMsg.length > 0) {
                io.to(`conversation_${convId}`).emit('new_message', newMsg[0]);
            }
        }

        res.json({
            success: true,
            message: `Offer of ₹${price.toFixed(2)}/${unit} sent successfully!`,
            negotiation: {
                id: offerRes.insertId,
                status: 'offer_made',
                current_offer_price: price,
                current_offer_by: 'customer',
                product_name: product.name,
                public_price: product.price,
                unit
            }
        });
    } catch (err) {
        console.error('submitOffer error:', err);
        res.status(500).json({ success: false, message: 'Error submitting offer: ' + err.message });
    }
};

// POST /api/features/conversations/:id/negotiation/counter
// Counter offer by either farmer or customer
const submitCounter = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = parseInt(req.params.id, 10);
        const { counter_price } = req.body;

        if (isNaN(convId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }

        const price = parseFloat(counter_price);
        if (isNaN(price) || !isFinite(price) || price <= 0 || price > 100000) {
            return res.status(400).json({ success: false, message: 'Please enter a valid counter price greater than 0.' });
        }

        const [convRows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [convId]);
        if (convRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }
        const conv = convRows[0];

        // Authorization check
        if (userRole === 'farmer' && conv.farmer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }
        if (userRole === 'customer' && conv.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }

        if (!['offer_made', 'countered'].includes(conv.negotiation_status)) {
            return res.status(400).json({ success: false, message: 'No active offer available to counter.' });
        }

        // Cannot counter your own offer
        if (conv.current_offer_by === userRole) {
            return res.status(400).json({ success: false, message: 'You cannot counter your own offer. Please wait for a response.' });
        }

        // Product verification
        const [prods] = await pool.query('SELECT * FROM products WHERE id = ? AND is_available = TRUE', [conv.product_id]);
        if (prods.length === 0) {
            return res.status(400).json({ success: false, message: 'Product is no longer available.' });
        }
        const product = prods[0];
        const unit = product.unit || 'kg';

        // Update previous pending offers to 'countered'
        await pool.query(
            "UPDATE negotiation_offers SET status = 'countered', responded_at = NOW() WHERE conversation_id = ? AND status = 'pending'",
            [convId]
        );

        // Record counter offer in negotiation_offers
        const [offerRes] = await pool.query(
            `INSERT INTO negotiation_offers 
             (conversation_id, product_id, customer_id, farmer_id, offered_by, offer_price, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [convId, conv.product_id, conv.customer_id, conv.farmer_id, userRole, price]
        );

        // Update conversation state
        await pool.query(
            `UPDATE conversations 
             SET negotiation_status = 'countered',
                 current_offer_price = ?,
                 current_offer_by = ?,
                 offer_updated_at = NOW(),
                 updated_at = NOW()
             WHERE id = ?`,
            [price, userRole, convId]
        );

        const senderTitle = userRole === 'farmer' ? 'Farmer' : 'Customer';
        const msgText = `${senderTitle} submitted a counter offer of ₹${price.toFixed(2)} / ${unit}`;
        const [msgResult] = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, sender_role, message, message_type)
             VALUES (?, ?, ?, ?, 'counter')`,
            [convId, userId, userRole, msgText]
        );

        // Notify other party
        const recipientId = userRole === 'farmer' ? conv.customer_id : conv.farmer_id;
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'Counter Offer Received', ?, 'order')`,
            [recipientId, `${senderTitle} submitted a counter offer of ₹${price.toFixed(2)}/${unit} for ${product.name}`]
        ).catch(() => {});

        // Emit socket
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation_${convId}`).emit('negotiation_updated', {
                conversationId: convId,
                status: 'countered',
                offer_price: price,
                offered_by: userRole,
                unit
            });
            const [newMsg] = await pool.query(
                `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
                [msgResult.insertId]
            );
            if (newMsg.length > 0) {
                io.to(`conversation_${convId}`).emit('new_message', newMsg[0]);
            }
        }

        res.json({
            success: true,
            message: `Counter offer of ₹${price.toFixed(2)}/${unit} submitted successfully!`,
            negotiation: {
                id: offerRes.insertId,
                status: 'countered',
                current_offer_price: price,
                current_offer_by: userRole,
                product_name: product.name,
                public_price: product.price,
                unit
            }
        });
    } catch (err) {
        console.error('submitCounter error:', err);
        res.status(500).json({ success: false, message: 'Error submitting counter offer: ' + err.message });
    }
};

// POST /api/features/conversations/:id/negotiation/accept
// Accept the active pending offer
const acceptOffer = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = parseInt(req.params.id, 10);

        if (isNaN(convId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }

        const [convRows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [convId]);
        if (convRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }
        const conv = convRows[0];

        // Authorization check
        if (userRole === 'farmer' && conv.farmer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }
        if (userRole === 'customer' && conv.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }

        // Must have an active offer
        if (!['offer_made', 'countered'].includes(conv.negotiation_status) || !conv.current_offer_price) {
            return res.status(400).json({ success: false, message: 'No active offer available to accept.' });
        }

        // Cannot accept your own offer
        if (conv.current_offer_by === userRole) {
            return res.status(400).json({ success: false, message: 'You cannot accept your own offer. The other party must accept.' });
        }

        // Product verification
        const [prods] = await pool.query('SELECT * FROM products WHERE id = ? AND is_available = TRUE', [conv.product_id]);
        if (prods.length === 0) {
            return res.status(400).json({ success: false, message: 'Product is unavailable or out of stock.' });
        }
        const product = prods[0];
        const agreedPrice = parseFloat(conv.current_offer_price);
        const unit = product.unit || 'kg';

        // Update pending offers in negotiation_offers to 'accepted'
        await pool.query(
            `UPDATE negotiation_offers 
             SET status = 'accepted', responded_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
             WHERE conversation_id = ? AND status = 'pending'`,
            [convId]
        );

        // Update conversation to ACCEPTED with agreed_price and 24h expiration
        await pool.query(
            `UPDATE conversations 
             SET negotiation_status = 'accepted',
                 agreed_price = ?,
                 agreed_at = NOW(),
                 expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR),
                 current_offer_price = NULL,
                 current_offer_by = NULL,
                 offer_updated_at = NOW(),
                 updated_at = NOW()
             WHERE id = ?`,
            [agreedPrice, convId]
        );

        const accepterTitle = userRole === 'farmer' ? 'Farmer' : 'Customer';
        const msgText = `${accepterTitle} accepted the offer of ₹${agreedPrice.toFixed(2)} / ${unit}.`;
        const [msgResult] = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, sender_role, message, message_type)
             VALUES (?, ?, ?, ?, 'accept')`,
            [convId, userId, userRole, msgText]
        );

        // Notify other party
        const recipientId = userRole === 'farmer' ? conv.customer_id : conv.farmer_id;
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'Price Offer Accepted!', ?, 'order')`,
            [recipientId, `Offer of ₹${agreedPrice.toFixed(2)}/${unit} for ${product.name} was accepted by ${accepterTitle}.`]
        ).catch(() => {});

        // Emit socket
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation_${convId}`).emit('negotiation_updated', {
                conversationId: convId,
                status: 'accepted',
                agreed_price: agreedPrice,
                unit
            });
            const [newMsg] = await pool.query(
                `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
                [msgResult.insertId]
            );
            if (newMsg.length > 0) {
                io.to(`conversation_${convId}`).emit('new_message', newMsg[0]);
            }
        }

        res.json({
            success: true,
            message: `Offer of ₹${agreedPrice.toFixed(2)}/${unit} accepted successfully!`,
            negotiation: {
                status: 'accepted',
                agreed_price: agreedPrice,
                product_name: product.name,
                public_price: product.price,
                unit
            }
        });
    } catch (err) {
        console.error('acceptOffer error:', err);
        res.status(500).json({ success: false, message: 'Error accepting offer: ' + err.message });
    }
};

// POST /api/features/conversations/:id/negotiation/reject
// Reject the active pending offer
const rejectOffer = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = parseInt(req.params.id, 10);

        if (isNaN(convId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }

        const [convRows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [convId]);
        if (convRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }
        const conv = convRows[0];

        if (userRole === 'farmer' && conv.farmer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }
        if (userRole === 'customer' && conv.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }

        if (!['offer_made', 'countered'].includes(conv.negotiation_status)) {
            return res.status(400).json({ success: false, message: 'No active offer available to reject.' });
        }

        let unit = 'kg';
        let prodName = 'Product';
        if (conv.product_id) {
            const [p] = await pool.query('SELECT name, unit FROM products WHERE id = ?', [conv.product_id]);
            if (p.length > 0) {
                prodName = p[0].name;
                unit = p[0].unit || 'kg';
            }
        }

        // Mark pending offers as rejected
        await pool.query(
            "UPDATE negotiation_offers SET status = 'rejected', responded_at = NOW() WHERE conversation_id = ? AND status = 'pending'",
            [convId]
        );

        // Update conversation
        await pool.query(
            `UPDATE conversations 
             SET negotiation_status = 'rejected',
                 current_offer_price = NULL,
                 current_offer_by = NULL,
                 offer_updated_at = NOW(),
                 updated_at = NOW()
             WHERE id = ?`,
            [convId]
        );

        const rejecterTitle = userRole === 'farmer' ? 'Farmer' : 'Customer';
        const msgText = `${rejecterTitle} rejected the price offer.`;
        const [msgResult] = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, sender_role, message, message_type)
             VALUES (?, ?, ?, ?, 'reject')`,
            [convId, userId, userRole, msgText]
        );

        // Notify
        const recipientId = userRole === 'farmer' ? conv.customer_id : conv.farmer_id;
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'Price Offer Rejected', ?, 'order')`,
            [recipientId, `${rejecterTitle} rejected the price offer for ${prodName}.`]
        ).catch(() => {});

        // Emit socket
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation_${convId}`).emit('negotiation_updated', {
                conversationId: convId,
                status: 'rejected'
            });
            const [newMsg] = await pool.query(
                `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
                [msgResult.insertId]
            );
            if (newMsg.length > 0) {
                io.to(`conversation_${convId}`).emit('new_message', newMsg[0]);
            }
        }

        res.json({ success: true, message: 'Offer rejected.' });
    } catch (err) {
        console.error('rejectOffer error:', err);
        res.status(500).json({ success: false, message: 'Error rejecting offer: ' + err.message });
    }
};

// GET /api/features/conversations/:id/negotiation
// Fetch current negotiation state and offer history
const getConversationNegotiation = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const convId = parseInt(req.params.id, 10);

        if (isNaN(convId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }

        const [convRows] = await pool.query(`
            SELECT c.*, 
                   cust.name as customer_name, cust.email as customer_email,
                   farm.name as farmer_name, farm.farm_name,
                   p.name as product_name, p.price as product_price, p.unit as product_unit, p.is_available, p.quantity as product_stock, p.image_url as product_image
            FROM conversations c
            JOIN users cust ON c.customer_id = cust.id
            JOIN users farm ON c.farmer_id = farm.id
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.id = ?
        `, [convId]);

        if (convRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }
        const conv = convRows[0];

        if (userRole === 'customer' && conv.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }
        if (userRole === 'farmer' && conv.farmer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized conversation access.' });
        }

        // Check expiration
        let status = conv.negotiation_status || 'none';
        if (status === 'accepted' && conv.expires_at && new Date(conv.expires_at) < new Date()) {
            status = 'expired';
            await pool.query("UPDATE conversations SET negotiation_status = 'expired' WHERE id = ?", [convId]);
        }

        // Fetch offer history
        const [offers] = await pool.query(
            `SELECT id, offered_by, offer_price, status, created_at, responded_at, expires_at
             FROM negotiation_offers
             WHERE conversation_id = ?
             ORDER BY created_at ASC`,
            [convId]
        );

        res.json({
            success: true,
            conversation: {
                id: conv.id,
                customer_id: conv.customer_id,
                customer_name: conv.customer_name,
                farmer_id: conv.farmer_id,
                farmer_name: conv.farmer_name,
                product_id: conv.product_id,
                product_name: conv.product_name,
                product_price: conv.product_price,
                product_unit: conv.product_unit || 'kg',
                product_image: conv.product_image,
                is_available: conv.is_available,
                product_stock: conv.product_stock
            },
            negotiation: {
                status,
                agreed_price: conv.agreed_price,
                agreed_at: conv.agreed_at,
                current_offer_price: conv.current_offer_price,
                current_offer_by: conv.current_offer_by,
                expires_at: conv.expires_at,
                offers
            }
        });
    } catch (err) {
        console.error('getConversationNegotiation error:', err);
        res.status(500).json({ success: false, message: 'Error fetching negotiation details: ' + err.message });
    }
};

// GET /api/features/negotiations/product/:productId
// Check if current logged-in customer has an active agreed price for this product
const getAcceptedNegotiationForProduct = async (req, res) => {
    try {
        const customerId = req.userId;
        const productId = parseInt(req.params.productId, 10);

        if (isNaN(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const [convs] = await pool.query(`
            SELECT c.id as conversation_id, c.agreed_price, c.agreed_at, c.expires_at,
                   p.name as product_name, p.price as public_price, p.unit as product_unit,
                   farm.name as farmer_name, farm.farm_name
            FROM conversations c
            JOIN products p ON c.product_id = p.id
            JOIN users farm ON c.farmer_id = farm.id
            WHERE c.customer_id = ?
              AND c.product_id = ?
              AND c.negotiation_status = 'accepted'
              AND c.agreed_price IS NOT NULL
              AND (c.expires_at IS NULL OR c.expires_at > NOW())
              AND p.is_available = TRUE
            ORDER BY c.agreed_at DESC
            LIMIT 1
        `, [customerId, productId]);

        if (convs.length > 0) {
            return res.json({
                success: true,
                has_negotiation: true,
                negotiation: convs[0]
            });
        }

        res.json({
            success: true,
            has_negotiation: false,
            negotiation: null
        });
    } catch (err) {
        console.error('getAcceptedNegotiationForProduct error:', err);
        res.status(500).json({ success: false, message: 'Error checking product negotiation: ' + err.message });
    }
};

// ─────────────────────────────────────────────────
// PRODUCT PRICE RULES
// ─────────────────────────────────────────────────

// GET all active price rules (public)
const getPriceRules = async (req, res) => {
    try {
        const [rules] = await pool.query(
            'SELECT * FROM product_price_rules WHERE is_active = TRUE ORDER BY display_name ASC'
        );
        res.json({ success: true, rules });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching price rules: ' + err.message });
    }
};

// GET price rule for a specific product name
const getPriceRuleForProduct = async (req, res) => {
    try {
        const name = (req.query.name || '').trim().toLowerCase();
        if (!name) return res.json({ success: true, rule: null });

        const [rules] = await pool.query(
            'SELECT * FROM product_price_rules WHERE product_name = ? AND is_active = TRUE',
            [name]
        );
        res.json({ success: true, rule: rules[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching price rule: ' + err.message });
    }
};

// ─────────────────────────────────────────────────
// PRODUCT REQUESTS (Farmer → Admin)
// ─────────────────────────────────────────────────

// POST: Farmer submits a new product request
const submitProductRequest = async (req, res) => {
    try {
        const farmerId = req.userId;
        const { product_name, category, description, suggested_min_price, suggested_max_price, unit, reason } = req.body;

        if (!product_name || product_name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Product name is required.' });
        }
        if (!category || category.trim() === '') {
            return res.status(400).json({ success: false, message: 'Category is required.' });
        }
        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please explain why you want to add this product.' });
        }

        // Check if already in catalog
        const [inCatalog] = await pool.query(
            'SELECT id FROM approved_product_catalog WHERE LOWER(name) = LOWER(?)',
            [product_name.trim()]
        );
        if (inCatalog.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `"${product_name}" is already in the approved product catalog. You can list it directly.`
            });
        }

        // Check for existing pending request by this farmer
        const [existingReq] = await pool.query(
            "SELECT id FROM product_requests WHERE farmer_id = ? AND LOWER(product_name) = LOWER(?) AND status = 'pending'",
            [farmerId, product_name.trim()]
        );
        if (existingReq.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `You already have a pending request for "${product_name}". Please wait for Admin review.`
            });
        }

        // Validate prices if provided
        if (suggested_min_price !== undefined && suggested_min_price !== '') {
            const minP = parseFloat(suggested_min_price);
            if (isNaN(minP) || minP < 0) {
                return res.status(400).json({ success: false, message: 'Suggested minimum price must be a valid positive number.' });
            }
        }
        if (suggested_max_price !== undefined && suggested_max_price !== '') {
            const maxP = parseFloat(suggested_max_price);
            if (isNaN(maxP) || maxP < 0) {
                return res.status(400).json({ success: false, message: 'Suggested maximum price must be a valid positive number.' });
            }
        }
        if (suggested_min_price && suggested_max_price) {
            if (parseFloat(suggested_min_price) >= parseFloat(suggested_max_price)) {
                return res.status(400).json({ success: false, message: 'Suggested minimum price must be less than maximum price.' });
            }
        }

        const [result] = await pool.query(
            `INSERT INTO product_requests (farmer_id, product_name, category, description, suggested_min_price, suggested_max_price, unit, reason)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                farmerId,
                product_name.trim(),
                category.trim(),
                description ? description.trim() : null,
                suggested_min_price ? parseFloat(suggested_min_price) : null,
                suggested_max_price ? parseFloat(suggested_max_price) : null,
                unit ? unit.trim() : 'kg',
                reason.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: `Product request for "${product_name.trim()}" submitted successfully! Admin will review your request.`,
            request_id: result.insertId,
            request: {
                id: result.insertId,
                product_name: product_name.trim(),
                category: category.trim(),
                status: 'pending'
            }
        });
    } catch (err) {
        console.error('submitProductRequest error:', err);
        res.status(500).json({ success: false, message: 'Error submitting request: ' + err.message });
    }
};

// GET: Farmer's own product requests
const getMyProductRequests = async (req, res) => {
    try {
        const farmerId = req.userId;
        const [requests] = await pool.query(
            `SELECT pr.*, u.name as reviewed_by_name
             FROM product_requests pr
             LEFT JOIN users u ON pr.reviewed_by = u.id
             WHERE pr.farmer_id = ?
             ORDER BY pr.created_at DESC`,
            [farmerId]
        );
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching requests: ' + err.message });
    }
};

// GET: Approved product catalog (for farmers to pick from when creating products)
const getApprovedCatalog = async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM approved_product_catalog WHERE is_active = TRUE';
        const params = [];
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        query += ' ORDER BY category, name ASC';
        const [products] = await pool.query(query, params);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching catalog: ' + err.message });
    }
};

// ─────────────────────────────────────────────────
// ADMIN: Product Request Management
// ─────────────────────────────────────────────────

// GET: All product requests (admin)
const getProductRequestsAdmin = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT pr.*, 
                   u.name as farmer_name, u.email as farmer_email, u.farm_name,
                   admin.name as reviewed_by_name
            FROM product_requests pr
            JOIN users u ON pr.farmer_id = u.id
            LEFT JOIN users admin ON pr.reviewed_by = admin.id
        `;
        const params = [];
        if (status && status !== 'all') {
            query += ' WHERE pr.status = ?';
            params.push(status);
        }
        query += ' ORDER BY pr.created_at DESC';
        const [requests] = await pool.query(query, params);
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching requests: ' + err.message });
    }
};

// POST: Admin approves a product request
const approveProductRequest = async (req, res) => {
    try {
        const adminId = req.userId;
        const reqId = req.params.id;
        const { admin_notes } = req.body;

        const [requests] = await pool.query('SELECT * FROM product_requests WHERE id = ?', [reqId]);
        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }
        const request = requests[0];

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
        }

        // Check duplicate in catalog
        const [existing] = await pool.query(
            'SELECT id FROM approved_product_catalog WHERE LOWER(name) = LOWER(?)',
            [request.product_name]
        );

        if (existing.length === 0) {
            // Add to approved catalog
            await pool.query(
                'INSERT INTO approved_product_catalog (name, category, unit, description, request_id, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [request.product_name, request.category, request.unit, request.description, reqId, adminId]
            );

            // Add price rule if suggested
            if (request.suggested_min_price && request.suggested_max_price) {
                const normalized = request.product_name.trim().toLowerCase();
                const [existingRule] = await pool.query('SELECT id FROM product_price_rules WHERE product_name = ?', [normalized]);
                if (existingRule.length === 0) {
                    await pool.query(
                        'INSERT INTO product_price_rules (product_name, display_name, category, unit, min_price, max_price) VALUES (?, ?, ?, ?, ?, ?)',
                        [normalized, request.product_name, request.category, request.unit, request.suggested_min_price, request.suggested_max_price]
                    );
                }
            }
        }

        // Update request status
        await pool.query(
            "UPDATE product_requests SET status = 'approved', admin_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
            [admin_notes ? admin_notes.trim() : 'Approved by administrator.', adminId, reqId]
        );

        // Notify farmer
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'Product Request Approved ✓', ?, 'success')`,
            [request.farmer_id, `Your product request for "${request.product_name}" has been approved! You can now list it in your farm store.`]
        );

        res.json({ success: true, message: `Product "${request.product_name}" approved and added to the catalog.` });
    } catch (err) {
        console.error('approveProductRequest error:', err);
        res.status(500).json({ success: false, message: 'Error approving request: ' + err.message });
    }
};

// POST: Admin rejects a product request
const rejectProductRequest = async (req, res) => {
    try {
        const adminId = req.userId;
        const reqId = req.params.id;
        const { admin_notes } = req.body;

        const [requests] = await pool.query('SELECT * FROM product_requests WHERE id = ?', [reqId]);
        if (requests.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }
        const request = requests[0];

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
        }

        await pool.query(
            "UPDATE product_requests SET status = 'rejected', admin_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
            [admin_notes ? admin_notes.trim() : 'Request rejected by administrator.', adminId, reqId]
        );

        // Notify farmer
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, 'Product Request Rejected', ?, 'warning')`,
            [request.farmer_id, `Your product request for "${request.product_name}" was not approved. ${admin_notes ? 'Reason: ' + admin_notes : 'Please contact support for more information.'}`]
        );

        res.json({ success: true, message: `Request for "${request.product_name}" has been rejected.` });
    } catch (err) {
        console.error('rejectProductRequest error:', err);
        res.status(500).json({ success: false, message: 'Error rejecting request: ' + err.message });
    }
};

// GET: Product catalog stats for admin dashboard
const getProductStats = async (req, res) => {
    try {
        const [catalogCount] = await pool.query('SELECT COUNT(*) as total FROM approved_product_catalog WHERE is_active = TRUE');
        const [requestStats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM product_requests
        `);
        res.json({
            success: true,
            catalog_total: catalogCount[0].total,
            requests: requestStats[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching product stats: ' + err.message });
    }
};

module.exports = {
    // Messages
    getOrCreateConversation,
    getMyConversations,
    getConversationMessages,
    sendMessage,
    getUnreadCount,
    // Price Negotiation
    submitOffer,
    submitCounter,
    acceptOffer,
    rejectOffer,
    getConversationNegotiation,
    getAcceptedNegotiationForProduct,
    // Price rules
    getPriceRules,
    getPriceRuleForProduct,
    // Product requests
    submitProductRequest,
    getMyProductRequests,
    getApprovedCatalog,
    // Admin
    getProductRequestsAdmin,
    approveProductRequest,
    rejectProductRequest,
    getProductStats
};
