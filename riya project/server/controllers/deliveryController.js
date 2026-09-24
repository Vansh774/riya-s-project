const { pool } = require('../config/database');
const crypto = require('crypto');

// ─── HELPER: Emit Socket Event to Order Room ──────────────────────────────────
const emitOrderUpdate = (req, orderId, eventName, payload) => {
    try {
        const io = req.app.get('io');
        if (io) {
            io.to(`order_${orderId}`).emit(eventName, payload);
        }
    } catch (e) {
        console.warn('Socket emit error:', e.message);
    }
};

// ─── 1. FARMER: Assign delivery person to an order ─────────────────────────────
const assignDelivery = async (req, res) => {
    try {
        const farmerId = req.userId;
        const orderId = req.params.orderId;
        const {
            delivery_person_name,
            delivery_person_phone,
            vehicle_type,
            vehicle_number,
            notes
        } = req.body;

        if (!delivery_person_name || !delivery_person_name.trim()) {
            return res.status(400).json({ success: false, message: 'Delivery person name is required' });
        }
        if (!delivery_person_phone || !delivery_person_phone.trim()) {
            return res.status(400).json({ success: false, message: 'Delivery person phone number is required' });
        }

        // Verify farmer owns this order
        const [orders] = await pool.query(
            `SELECT o.id, o.status, o.customer_id, o.order_number, o.shipping_address FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.id = ? AND oi.farmer_id = ? LIMIT 1`,
            [orderId, farmerId]
        );
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found or access denied' });
        }

        const order = orders[0];
        if (!['ready', 'out_for_delivery', 'on_the_way'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order must be in 'ready' status to assign delivery. Current status: ${order.status}`
            });
        }

        // Generate cryptographically secure 64-hex-character token
        const token = crypto.randomBytes(32).toString('hex');

        // Upsert into delivery_assignments
        await pool.query(
            `INSERT INTO delivery_assignments 
             (order_id, farmer_id, delivery_person_name, delivery_person_phone, vehicle_type, vehicle_number,
              tracking_token, tracking_active, status, notes, assigned_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'assigned', ?, NOW())
             ON DUPLICATE KEY UPDATE
                delivery_person_name = VALUES(delivery_person_name),
                delivery_person_phone = VALUES(delivery_person_phone),
                vehicle_type = VALUES(vehicle_type),
                vehicle_number = VALUES(vehicle_number),
                tracking_token = VALUES(tracking_token),
                tracking_active = 1,
                status = 'assigned',
                notes = VALUES(notes),
                assigned_at = NOW()`,
            [
                orderId,
                farmerId,
                delivery_person_name.trim(),
                delivery_person_phone.trim(),
                vehicle_type ? vehicle_type.trim() : null,
                vehicle_number ? vehicle_number.trim() : null,
                token,
                notes ? notes.trim() : null
            ]
        );

        // Order status remains 'ready' until the delivery person picks up the package
        await pool.query(
            'INSERT INTO order_status_history (order_id, status, note, updated_by, updated_by_role) VALUES (?, ?, ?, ?, ?)',
            [orderId, order.status, `Delivery assigned to ${delivery_person_name.trim()} (${vehicle_type || 'Vehicle'})`, farmerId, 'farmer']
        ).catch(() => {});

        // Build tracking URL
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol || 'http';
        const trackingUrl = `${protocol}://${host}/delivery-tracking.html?token=${token}`;

        // Real-time broadcast
        emitOrderUpdate(req, orderId, 'status_updated', {
            orderId,
            status: order.status,
            delivery_status: 'assigned',
            delivery_person_name: delivery_person_name.trim(),
            vehicle_type: vehicle_type || null,
            vehicle_number: vehicle_number || null,
            note: `Delivery assigned to ${delivery_person_name.trim()}`
        });

        res.json({
            success: true,
            message: 'Delivery assigned successfully',
            tracking_token: token,
            tracking_url: trackingUrl,
            assignment: {
                order_id: orderId,
                delivery_person_name: delivery_person_name.trim(),
                delivery_person_phone: delivery_person_phone.trim(),
                vehicle_type: vehicle_type || null,
                vehicle_number: vehicle_number || null,
                status: 'assigned'
            }
        });
    } catch (error) {
        console.error('Assign delivery error:', error);
        res.status(500).json({ success: false, message: 'Error assigning delivery', error: error.message });
    }
};

// ─── 2. FARMER: Get delivery assignment info for an order ─────────────────────
const getDeliveryAssignment = async (req, res) => {
    try {
        const farmerId = req.userId;
        const orderId = req.params.orderId;

        const [check] = await pool.query(
            'SELECT 1 FROM order_items WHERE order_id = ? AND farmer_id = ? LIMIT 1',
            [orderId, farmerId]
        );
        if (check.length === 0) {
            return res.status(403).json({ success: false, message: 'Access denied: Order does not belong to this farmer' });
        }

        const [assignments] = await pool.query(
            `SELECT da.*,
                    (SELECT latitude FROM delivery_locations WHERE delivery_assignment_id = da.id ORDER BY recorded_at DESC LIMIT 1) as last_lat,
                    (SELECT longitude FROM delivery_locations WHERE delivery_assignment_id = da.id ORDER BY recorded_at DESC LIMIT 1) as last_lng,
                    (SELECT recorded_at FROM delivery_locations WHERE delivery_assignment_id = da.id ORDER BY recorded_at DESC LIMIT 1) as last_update
             FROM delivery_assignments da WHERE da.order_id = ?`,
            [orderId]
        );

        if (assignments.length === 0) {
            return res.json({ success: true, assignment: null });
        }

        const a = assignments[0];
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol || 'http';
        a.tracking_url = `${protocol}://${host}/delivery-tracking.html?token=${a.tracking_token}`;

        res.json({ success: true, assignment: a });
    } catch (error) {
        console.error('Get assignment error:', error);
        res.status(500).json({ success: false, message: 'Error fetching assignment' });
    }
};

// ─── 3. PUBLIC: Get tracking info by token (for delivery person) ───────────────
const getTrackingByToken = async (req, res) => {
    try {
        const { token } = req.params;

        const [assignments] = await pool.query(
            `SELECT da.*, o.order_number, o.shipping_address, o.destination_latitude, o.destination_longitude,
                    o.total_amount, o.status as order_status, u.name as customer_name, u.phone as customer_phone
             FROM delivery_assignments da
             JOIN orders o ON da.order_id = o.id
             JOIN users u ON o.customer_id = u.id
             WHERE da.tracking_token = ?`,
            [token]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid tracking link or delivery assignment not found' });
        }

        const a = assignments[0];

        const [locations] = await pool.query(
            `SELECT latitude, longitude, accuracy, heading, speed, recorded_at
             FROM delivery_locations WHERE delivery_assignment_id = ? ORDER BY recorded_at DESC LIMIT 1`,
            [a.id]
        );

        res.json({
            success: true,
            assignment: {
                id: a.id,
                order_id: a.order_id,
                order_number: a.order_number,
                delivery_address: a.shipping_address,
                destination_latitude: a.destination_latitude,
                destination_longitude: a.destination_longitude,
                customer_name: a.customer_name,
                customer_phone: a.customer_phone,
                delivery_person_name: a.delivery_person_name,
                delivery_person_phone: a.delivery_person_phone,
                vehicle_type: a.vehicle_type,
                vehicle_number: a.vehicle_number,
                total_amount: a.total_amount,
                status: a.status,
                tracking_active: Boolean(a.tracking_active),
                order_status: a.order_status,
                notes: a.notes,
                last_location: locations.length > 0 ? locations[0] : null
            }
        });
    } catch (error) {
        console.error('Get tracking error:', error);
        res.status(500).json({ success: false, message: 'Error fetching tracking info' });
    }
};

// ─── 4. PUBLIC: Start live GPS tracking (delivery person) ─────────────────────
const startTracking = async (req, res) => {
    try {
        const { token } = req.params;

        const [assignments] = await pool.query(
            `SELECT da.id, da.order_id, da.delivery_person_name, da.status, o.customer_id, o.order_number, o.status as order_status
             FROM delivery_assignments da
             JOIN orders o ON da.order_id = o.id
             WHERE da.tracking_token = ?`,
            [token]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid tracking link' });
        }

        const a = assignments[0];
        if (a.status === 'delivered' || a.order_status === 'delivered') {
            return res.status(400).json({ success: false, message: 'Cannot start tracking: Order is already delivered' });
        }

        // Set tracking_active = 1 and delivery_started_at
        await pool.query(
            `UPDATE delivery_assignments 
             SET tracking_active = 1, delivery_started_at = COALESCE(delivery_started_at, NOW())
             WHERE id = ?`,
            [a.id]
        );

        // Real-time broadcast
        emitOrderUpdate(req, a.order_id, 'tracking_started', {
            orderId: a.order_id,
            tracking_active: true,
            delivery_person_name: a.delivery_person_name,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Live GPS sharing started successfully' });
    } catch (error) {
        console.error('Start tracking error:', error);
        res.status(500).json({ success: false, message: 'Error starting tracking' });
    }
};

// ─── 5. PUBLIC: Stop live GPS tracking (delivery person) ──────────────────────
const stopTracking = async (req, res) => {
    try {
        const { token } = req.params;

        const [assignments] = await pool.query(
            `SELECT id, order_id FROM delivery_assignments WHERE tracking_token = ?`,
            [token]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid tracking link' });
        }

        const a = assignments[0];
        await pool.query('UPDATE delivery_assignments SET tracking_active = 0 WHERE id = ?', [a.id]);

        emitOrderUpdate(req, a.order_id, 'tracking_stopped', {
            orderId: a.order_id,
            tracking_active: false,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Live GPS sharing paused' });
    } catch (error) {
        console.error('Stop tracking error:', error);
        res.status(500).json({ success: false, message: 'Error stopping tracking' });
    }
};

// ─── 6. PUBLIC: Update GPS location (delivery person via token) ───────────────
const updateLocation = async (req, res) => {
    try {
        const { token } = req.params;
        const { latitude, longitude, accuracy, heading, speed } = req.body;

        if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ success: false, message: 'Invalid latitude or longitude format' });
        }

        const [assignments] = await pool.query(
            `SELECT da.id, da.order_id, da.delivery_person_name, da.status, da.tracking_active, o.status as order_status
             FROM delivery_assignments da
             JOIN orders o ON da.order_id = o.id
             WHERE da.tracking_token = ?`,
            [token]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid tracking link' });
        }

        const a = assignments[0];
        if (a.status === 'delivered' || a.order_status === 'delivered') {
            return res.status(400).json({ success: false, message: 'Tracking is closed for this completed delivery' });
        }

        // Insert into delivery_locations
        await pool.query(
            `INSERT INTO delivery_locations (delivery_assignment_id, latitude, longitude, accuracy, speed, heading)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [a.id, lat, lng, accuracy || null, speed || null, heading || null]
        );

        // Ensure tracking_active is set to 1
        if (!a.tracking_active) {
            await pool.query('UPDATE delivery_assignments SET tracking_active = 1 WHERE id = ?', [a.id]);
        }

        // Real-time broadcast via Socket.io to order room
        const recordedAt = new Date().toISOString();
        emitOrderUpdate(req, a.order_id, 'location_updated', {
            orderId: a.order_id,
            latitude: lat,
            longitude: lng,
            accuracy: accuracy || null,
            speed: speed || null,
            heading: heading || null,
            recordedAt,
            delivery_status: a.status,
            order_status: a.order_status,
            delivery_person_name: a.delivery_person_name,
            tracking_active: true
        });

        res.json({ success: true, message: 'Location updated successfully', recordedAt });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ success: false, message: 'Error updating location', error: error.message });
    }
};

// ─── 7. PUBLIC: Update delivery status (delivery person via token) ────────────
const updateDeliveryStatus = async (req, res) => {
    try {
        const { token } = req.params;
        const { status } = req.body;

        const validStatuses = ['picked_up', 'out_for_delivery', 'on_the_way', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const [assignments] = await pool.query(
            `SELECT da.id, da.order_id, da.delivery_person_name, da.status as current_status,
                    o.customer_id, o.order_number, o.status as current_order_status
             FROM delivery_assignments da
             JOIN orders o ON da.order_id = o.id
             WHERE da.tracking_token = ?`,
            [token]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid tracking link' });
        }

        const a = assignments[0];

        if (a.current_status === 'delivered' || a.current_order_status === 'delivered') {
            return res.status(400).json({ success: false, message: 'Order is already marked as delivered' });
        }

        // Map delivery person action to order status
        let newOrderStatus = a.current_order_status;
        let isDelivered = false;

        if (status === 'picked_up') {
            newOrderStatus = 'out_for_delivery';
        } else if (status === 'out_for_delivery') {
            newOrderStatus = 'out_for_delivery';
        } else if (status === 'on_the_way') {
            newOrderStatus = 'on_the_way';
        } else if (status === 'delivered') {
            newOrderStatus = 'delivered';
            isDelivered = true;
        }

        // Update delivery assignment
        if (isDelivered) {
            await pool.query(
                `UPDATE delivery_assignments 
                 SET status = 'delivered', tracking_active = 0, delivery_completed_at = NOW() 
                 WHERE id = ?`,
                [a.id]
            );
        } else {
            await pool.query(
                `UPDATE delivery_assignments 
                 SET status = ?, tracking_active = 1, delivery_started_at = COALESCE(delivery_started_at, NOW()) 
                 WHERE id = ?`,
                [status, a.id]
            );
        }

        // Update orders table
        if (isDelivered) {
            await pool.query("UPDATE orders SET status = ?, payment_status = 'paid' WHERE id = ?", [newOrderStatus, a.order_id]);
        } else {
            await pool.query('UPDATE orders SET status = ? WHERE id = ?', [newOrderStatus, a.order_id]);
        }

        // Insert into order_status_history
        const noteMap = {
            picked_up: `Package picked up by ${a.delivery_person_name}`,
            out_for_delivery: `Package is out for delivery with ${a.delivery_person_name}`,
            on_the_way: `Delivery agent ${a.delivery_person_name} is on the way to destination`,
            delivered: `Order delivered successfully by ${a.delivery_person_name} 🎉`
        };
        await pool.query(
            'INSERT INTO order_status_history (order_id, status, note, updated_by, updated_by_role) VALUES (?, ?, ?, ?, ?)',
            [a.order_id, newOrderStatus, noteMap[status] || `Status updated to ${status}`, null, 'delivery']
        ).catch(() => {});

        // Send notification to customer
        const notifMap = {
            picked_up: `Your order #${a.order_number} has been picked up by ${a.delivery_person_name}!`,
            out_for_delivery: `Your order #${a.order_number} is out for delivery.`,
            on_the_way: `Your order #${a.order_number} is on the way to your door!`,
            delivered: `Your order #${a.order_number} has been delivered! Enjoy your fresh produce! 🌿`
        };
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [a.customer_id, 'Delivery Update', notifMap[status], 'order']
        ).catch(() => {});

        // Broadcast real-time Socket event
        emitOrderUpdate(req, a.order_id, 'status_updated', {
            orderId: a.order_id,
            status: newOrderStatus,
            delivery_status: status,
            isDelivered,
            delivery_person_name: a.delivery_person_name,
            note: noteMap[status],
            timestamp: new Date().toISOString()
        });

        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('order_status_changed', {
                    orderId: a.order_id,
                    status: newOrderStatus,
                    delivery_status: status,
                    customerId: a.customer_id,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {}

        if (isDelivered) {
            emitOrderUpdate(req, a.order_id, 'delivery_completed', {
                orderId: a.order_id,
                message: 'Order delivered successfully',
                completedAt: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            message: `Delivery status updated to ${status}`,
            order_status: newOrderStatus,
            delivery_status: status
        });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
    }
};

// ─── 8. CUSTOMER / FARMER: Get live location for an order ─────────────────────
const getLiveLocation = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const orderId = req.params.orderId;

        if (userRole === 'customer') {
            const [check] = await pool.query(
                'SELECT 1 FROM orders WHERE id = ? AND customer_id = ? LIMIT 1',
                [orderId, userId]
            );
            if (check.length === 0) {
                return res.status(403).json({ success: false, message: 'Access denied: You do not own this order' });
            }
        } else if (userRole === 'farmer') {
            const [check] = await pool.query(
                'SELECT 1 FROM order_items WHERE order_id = ? AND farmer_id = ? LIMIT 1',
                [orderId, userId]
            );
            if (check.length === 0) {
                return res.status(403).json({ success: false, message: 'Access denied: Order does not contain your products' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Access denied: Invalid user role' });
        }

        const [assignments] = await pool.query(
            `SELECT da.id, da.delivery_person_name, da.delivery_person_phone, da.vehicle_type, da.vehicle_number,
                    da.status as delivery_status, da.tracking_active, da.assigned_at, da.delivery_started_at, da.delivery_completed_at,
                    o.id as order_id, o.order_number, o.status as order_status, o.shipping_address,
                    o.destination_latitude, o.destination_longitude, u.name as customer_name
             FROM orders o
             LEFT JOIN delivery_assignments da ON da.order_id = o.id
             JOIN users u ON o.customer_id = u.id
             WHERE o.id = ?`,
            [orderId]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const a = assignments[0];

        let latestLocation = null;
        let trail = [];

        if (a.id) {
            const [locations] = await pool.query(
                `SELECT latitude, longitude, accuracy, heading, speed, recorded_at
                 FROM delivery_locations WHERE delivery_assignment_id = ? ORDER BY recorded_at DESC LIMIT 1`,
                [a.id]
            );
            if (locations.length > 0) latestLocation = locations[0];

            const [trailPoints] = await pool.query(
                `SELECT latitude, longitude, recorded_at
                 FROM delivery_locations WHERE delivery_assignment_id = ? ORDER BY recorded_at DESC LIMIT 30`,
                [a.id]
            );
            trail = trailPoints.reverse();
        }

        res.json({
            success: true,
            order: {
                id: a.order_id,
                order_number: a.order_number,
                status: a.order_status,
                shipping_address: a.shipping_address,
                destination_latitude: a.destination_latitude,
                destination_longitude: a.destination_longitude,
                customer_name: a.customer_name
            },
            assignment: a.id ? {
                delivery_person_name: a.delivery_person_name,
                // Only expose phone to farmer or when active
                delivery_person_phone: userRole === 'farmer' ? a.delivery_person_phone : a.delivery_person_phone,
                vehicle_type: a.vehicle_type,
                vehicle_number: a.vehicle_number,
                delivery_status: a.delivery_status,
                tracking_active: Boolean(a.tracking_active),
                assigned_at: a.assigned_at,
                delivery_started_at: a.delivery_started_at,
                delivery_completed_at: a.delivery_completed_at
            } : null,
            location: latestLocation,
            trail
        });
    } catch (error) {
        console.error('Get live location error:', error);
        res.status(500).json({ success: false, message: 'Error fetching live location' });
    }
};

module.exports = {
    assignDelivery,
    getDeliveryAssignment,
    getTrackingByToken,
    startTracking,
    stopTracking,
    updateLocation,
    updateDeliveryStatus,
    getLiveLocation
};
