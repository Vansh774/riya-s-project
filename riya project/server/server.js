const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { testConnection, pool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Store io instance in Express app so controllers can access req.app.get('io')
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads and client)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        socket_connected_clients: io.engine.clientsCount,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Route not found'
    });
});

// ─── SOCKET.IO REAL-TIME GPS TRACKING ROOMS ────────────────────────────────────
io.on('connection', (socket) => {
    // Client joins order-specific room
    socket.on('join_order_room', async ({ orderId, token, userToken }) => {
        try {
            if (!orderId) return;

            let authorized = false;

            // 1. Check if delivery person with valid tracking token
            if (token) {
                const [da] = await pool.query(
                    'SELECT id FROM delivery_assignments WHERE order_id = ? AND tracking_token = ?',
                    [orderId, token]
                );
                if (da.length > 0) authorized = true;
            }

            // 2. Check if customer or farmer with JWT
            if (!authorized && userToken) {
                try {
                    const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'your-secret-key');
                    if (decoded.role === 'customer') {
                        const [check] = await pool.query(
                            'SELECT 1 FROM orders WHERE id = ? AND customer_id = ?',
                            [orderId, decoded.id]
                        );
                        if (check.length > 0) authorized = true;
                    } else if (decoded.role === 'farmer') {
                        const [check] = await pool.query(
                            'SELECT 1 FROM order_items WHERE order_id = ? AND farmer_id = ?',
                            [orderId, decoded.id]
                        );
                        if (check.length > 0) authorized = true;
                    }
                } catch (jwtErr) {
                    // Invalid JWT
                }
            }

            // 3. Fallback: allow join for demo/testing if orderId is valid
            if (!authorized && orderId) {
                const [ord] = await pool.query('SELECT id FROM orders WHERE id = ?', [orderId]);
                if (ord.length > 0) authorized = true;
            }

            if (authorized) {
                const roomName = `order_${orderId}`;
                socket.join(roomName);
                socket.emit('room_joined', { orderId, room: roomName });
            } else {
                socket.emit('error_message', { message: 'Unauthorized room access' });
            }
        } catch (e) {
            console.error('Socket join error:', e);
        }
    });

    // Real-time location push via socket from delivery person
    socket.on('send_location', async (data) => {
        try {
            const { token, latitude, longitude, accuracy, speed, heading } = data;
            if (!token || latitude === undefined || longitude === undefined) return;

            const [assignments] = await pool.query(
                `SELECT da.id, da.order_id, da.delivery_person_name, da.status, o.status as order_status
                 FROM delivery_assignments da
                 JOIN orders o ON da.order_id = o.id
                 WHERE da.tracking_token = ?`,
                [token]
            );

            if (assignments.length === 0) return;
            const a = assignments[0];
            if (a.status === 'delivered' || a.order_status === 'delivered') return;

            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            await pool.query(
                `INSERT INTO delivery_locations (delivery_assignment_id, latitude, longitude, accuracy, speed, heading)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [a.id, lat, lng, accuracy || null, speed || null, heading || null]
            );

            const recordedAt = new Date().toISOString();
            io.to(`order_${a.order_id}`).emit('location_updated', {
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
        } catch (e) {
            console.error('Socket location error:', e);
        }
    });
});

// Start server
const startServer = async () => {
    try {
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Cannot start server without database connection');
            process.exit(1);
        }

        server.listen(PORT, () => {
            console.log(`🚀 Server with Socket.io running on http://localhost:${PORT}`);
            console.log(`📱 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`🟢 Health check at http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

startServer();