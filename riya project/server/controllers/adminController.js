const { pool } = require('../config/database');

// ==========================================
// 1. DASHBOARD STATISTICS
// ==========================================
const getAdminStats = async (req, res) => {
    try {
        const [
            [userCounts],
            [reportCounts],
            [orderStats],
            [recentActions]
        ] = await Promise.all([
            pool.query(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) as total_farmers,
                    SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as total_customers,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
                    SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as banned_users,
                    SUM(CASE WHEN role = 'farmer' AND is_verified = 1 THEN 1 ELSE 0 END) as verified_farmers
                FROM users
                WHERE role != 'admin'
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total_reports,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
                    SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed_reports,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
                    SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as dismissed_reports
                FROM farmer_reports
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    COALESCE(SUM(total_amount), 0) as total_gmv
                FROM orders
            `),
            pool.query(`
                SELECT COUNT(*) as count 
                FROM admin_action_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `)
        ]);

        res.json({
            success: true,
            stats: {
                users: userCounts[0],
                reports: reportCounts[0],
                orders: orderStats[0],
                recent_actions_count: recentActions[0].count
            }
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ success: false, message: 'Failed to load stats: ' + err.message });
    }
};

// ==========================================
// 2. USER MANAGEMENT (LIST, SEARCH, FILTER)
// ==========================================
const getUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClauses = ["u.role != 'admin'"];
        let params = [];

        if (role && role !== 'all') {
            whereClauses.push('u.role = ?');
            params.push(role);
        }

        if (status && status !== 'all') {
            whereClauses.push('u.status = ?');
            params.push(status);
        }

        if (search && search.trim() !== '') {
            const term = `%${search.trim()}%`;
            whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.farm_name LIKE ? OR u.phone LIKE ? OR u.farmer_id LIKE ? OR u.kisan_card_number LIKE ?)');
            params.push(term, term, term, term, term, term);
        }

        const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // Auto-check expired suspensions in real-time
        await pool.query(`
            UPDATE users 
            SET status = 'active', suspended_until = NULL, suspension_reason = NULL 
            WHERE status = 'suspended' AND suspended_until IS NOT NULL AND suspended_until <= NOW()
        `);

        // Query users with report counts and remaining days
        const query = `
            SELECT 
                u.id, u.name, u.email, u.role, u.status, u.suspended_until, u.suspension_reason, u.ban_reason,
                u.warning_count, u.last_warning, u.last_warning_at,
                u.phone, u.farm_name, u.farm_location, u.farmer_id, u.kisan_card_number, u.kisan_card_image,
                u.is_verified, u.created_at,
                CASE 
                    WHEN u.status = 'suspended' AND u.suspended_until > NOW() 
                    THEN CEIL(TIMESTAMPDIFF(SECOND, NOW(), u.suspended_until) / 86400)
                    ELSE 0 
                END as days_remaining,
                (SELECT COUNT(*) FROM farmer_reports WHERE farmer_id = u.id) as reports_received_count,
                (SELECT COUNT(*) FROM orders WHERE customer_id = u.id) as customer_orders_count,
                (SELECT COUNT(*) FROM products WHERE farmer_id = u.id) as farmer_products_count
            FROM users u
            ${whereSql}
            ORDER BY u.id DESC
            LIMIT ? OFFSET ?
        `;

        const queryParams = [...params, parseInt(limit), parseInt(offset)];
        const [users] = await pool.query(query, queryParams);

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM users u ${whereSql}`;
        const [totalRows] = await pool.query(countQuery, params);

        res.json({
            success: true,
            total: totalRows[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            users
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch users: ' + err.message });
    }
};

// ==========================================
// 3. SUSPEND USER (TEMPORARY BY DAYS)
// ==========================================
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { days, reason } = req.body;

        const numDays = parseInt(days);
        if (!numDays || numDays < 1) {
            return res.status(400).json({ success: false, message: 'Please enter a valid number of days (at least 1 day).' });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please provide a reason for the suspension.' });
        }

        // Check user exists and is not admin
        const [users] = await pool.query('SELECT id, name, role FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (users[0].role === 'admin') {
            return res.status(403).json({ success: false, message: 'Administrator accounts cannot be suspended.' });
        }

        // Calculate suspension end date
        const [timeResult] = await pool.query('SELECT DATE_ADD(NOW(), INTERVAL ? DAY) as end_date', [numDays]);
        const suspendedUntil = timeResult[0].end_date;

        // Update user
        await pool.query(
            "UPDATE users SET status = 'suspended', suspended_until = ?, suspension_reason = ? WHERE id = ?",
            [suspendedUntil, reason.trim(), id]
        );

        // Audit log
        await pool.query(
            `INSERT INTO admin_action_logs (admin_id, target_user_id, action_type, days, reason) 
             VALUES (?, ?, 'suspend', ?, ?)`,
            [req.userId, id, numDays, reason.trim()]
        );

        // Create user notification
        const endDateStr = new Date(suspendedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, 'Account Suspended', ?, 'warning')`,
            [id, `Your account has been temporarily suspended for ${numDays} days until ${endDateStr}. Reason: ${reason.trim()}`]
        );

        res.json({
            success: true,
            message: `User ${users[0].name} has been suspended for ${numDays} days (until ${endDateStr}).`,
            suspended_until: suspendedUntil,
            days: numDays
        });
    } catch (err) {
        console.error('Error suspending user:', err);
        res.status(500).json({ success: false, message: 'Error suspending user: ' + err.message });
    }
};

// ==========================================
// 4. UNSUSPEND USER (MANUAL RESTORATION)
// ==========================================
const unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query('SELECT id, name FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        await pool.query(
            "UPDATE users SET status = 'active', suspended_until = NULL, suspension_reason = NULL WHERE id = ?",
            [id]
        );

        // Audit log
        await pool.query(
            `INSERT INTO admin_action_logs (admin_id, target_user_id, action_type, reason) 
             VALUES (?, ?, 'unsuspend', 'Manual reinstatement by administrator')`,
            [req.userId, id]
        );

        // Notify user
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, 'Account Restored', 'Your account suspension has been lifted. You can now access all marketplace features.', 'success')`,
            [id]
        );

        res.json({
            success: true,
            message: `Account suspension for ${users[0].name} has been lifted successfully.`
        });
    } catch (err) {
        console.error('Error unsuspending user:', err);
        res.status(500).json({ success: false, message: 'Error unsuspending user: ' + err.message });
    }
};

// ==========================================
// 5. BAN USER (PERMANENT)
// ==========================================
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please provide a reason for the account ban.' });
        }

        const [users] = await pool.query('SELECT id, name, role FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (users[0].role === 'admin') {
            return res.status(403).json({ success: false, message: 'Administrator accounts cannot be banned.' });
        }

        await pool.query(
            "UPDATE users SET status = 'banned', ban_reason = ?, suspended_until = NULL, suspension_reason = NULL WHERE id = ?",
            [reason.trim(), id]
        );

        // Audit log
        await pool.query(
            `INSERT INTO admin_action_logs (admin_id, target_user_id, action_type, reason) 
             VALUES (?, ?, 'ban', ?)`,
            [req.userId, id, reason.trim()]
        );

        // User notification
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, 'Account Banned', ?, 'error')`,
            [id, `Your account has been banned from FreshField. Reason: ${reason.trim()}`]
        );

        res.json({
            success: true,
            message: `User ${users[0].name} has been banned.`
        });
    } catch (err) {
        console.error('Error banning user:', err);
        res.status(500).json({ success: false, message: 'Error banning user: ' + err.message });
    }
};

// ==========================================
// 6. UNBAN USER
// ==========================================
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query('SELECT id, name FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        await pool.query(
            "UPDATE users SET status = 'active', ban_reason = NULL WHERE id = ?",
            [id]
        );

        // Audit log
        await pool.query(
            `INSERT INTO admin_action_logs (admin_id, target_user_id, action_type, reason) 
             VALUES (?, ?, 'unban', 'Account ban revoked by administrator')`,
            [req.userId, id]
        );

        // Notify user
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, 'Account Unbanned', 'Your account ban has been revoked. You may now log in to the marketplace.', 'success')`,
            [id]
        );

        res.json({
            success: true,
            message: `User ${users[0].name} has been unbanned successfully.`
        });
    } catch (err) {
        console.error('Error unbanning user:', err);
        res.status(500).json({ success: false, message: 'Error unbanning user: ' + err.message });
    }
};

// ==========================================
// 7. ISSUE WARNING TO USER / FARMER
// ==========================================
const warnUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { warning } = req.body;

        if (!warning || warning.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please enter the warning message.' });
        }

        const [users] = await pool.query('SELECT id, name, warning_count FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const newCount = (users[0].warning_count || 0) + 1;

        await pool.query(
            "UPDATE users SET warning_count = warning_count + 1, last_warning = ?, last_warning_at = NOW() WHERE id = ?",
            [warning.trim(), id]
        );

        // Audit log
        await pool.query(
            `INSERT INTO admin_action_logs (admin_id, target_user_id, action_type, reason) 
             VALUES (?, ?, 'warn', ?)`,
            [req.userId, id, warning.trim()]
        );

        // High priority user notification
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, 'Official Admin Warning', ?, 'warning')`,
            [id, `⚠️ Official Warning #${newCount}: ${warning.trim()}. Multiple warnings will lead to account suspension or permanent ban.`]
        );

        res.json({
            success: true,
            message: `Official warning issued to ${users[0].name}. (Total warnings: ${newCount})`,
            warning_count: newCount
        });
    } catch (err) {
        console.error('Error issuing warning:', err);
        res.status(500).json({ success: false, message: 'Error issuing warning: ' + err.message });
    }
};

// ==========================================
// 8. REPORTS MANAGEMENT (VIEW & FILTER)
// ==========================================
const getReports = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClauses = [];
        let params = [];

        if (status && status !== 'all') {
            whereClauses.push('r.status = ?');
            params.push(status);
        }

        if (search && search.trim() !== '') {
            const term = `%${search.trim()}%`;
            whereClauses.push('(reporter.name LIKE ? OR reporter.email LIKE ? OR farmer.name LIKE ? OR farmer.farm_name LIKE ? OR r.reason LIKE ? OR r.description LIKE ?)');
            params.push(term, term, term, term, term, term);
        }

        const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        const query = `
            SELECT 
                r.id, r.reporter_id, r.farmer_id, r.order_id, r.reason, r.description, r.evidence_image,
                r.status, r.admin_action, r.admin_notes, r.action_taken_at, r.created_at,
                reporter.name as reporter_name, reporter.email as reporter_email, reporter.phone as reporter_phone,
                farmer.name as farmer_name, farmer.email as farmer_email, farmer.farm_name, farmer.farmer_id as official_farmer_id,
                farmer.status as farmer_status, farmer.warning_count as farmer_warning_count,
                admin_user.name as action_taken_by_name,
                o.order_number
            FROM farmer_reports r
            JOIN users reporter ON r.reporter_id = reporter.id
            JOIN users farmer ON r.farmer_id = farmer.id
            LEFT JOIN users admin_user ON r.action_taken_by = admin_user.id
            LEFT JOIN orders o ON r.order_id = o.id
            ${whereSql}
            ORDER BY r.id DESC
            LIMIT ? OFFSET ?
        `;

        const [reports] = await pool.query(query, [...params, parseInt(limit), parseInt(offset)]);

        const [totalRows] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM farmer_reports r 
             JOIN users reporter ON r.reporter_id = reporter.id 
             JOIN users farmer ON r.farmer_id = farmer.id 
             ${whereSql}`,
            params
        );

        res.json({
            success: true,
            total: totalRows[0].total,
            reports
        });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reports: ' + err.message });
    }
};

// ==========================================
// 9. TAKE ACTION ON REPORT
// ==========================================
const takeReportAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, days, notes } = req.body;

        // action: 'warn' | 'suspend' | 'ban' | 'dismiss'
        if (!['warn', 'suspend', 'ban', 'dismiss'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action type.' });
        }

        const [reports] = await pool.query(`
            SELECT r.*, farmer.name as farmer_name, farmer.id as f_id 
            FROM farmer_reports r 
            JOIN users farmer ON r.farmer_id = farmer.id 
            WHERE r.id = ?
        `, [id]);

        if (reports.length === 0) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }

        const report = reports[0];
        const farmerId = report.f_id;
        const actionNotes = notes ? notes.trim() : `Action taken following customer complaint #${id}`;

        let reportStatus = 'resolved';
        let adminAction = action;

        if (action === 'suspend') {
            const numDays = parseInt(days) || 7;
            const [timeResult] = await pool.query('SELECT DATE_ADD(NOW(), INTERVAL ? DAY) as end_date', [numDays]);
            const suspendedUntil = timeResult[0].end_date;

            await pool.query(
                "UPDATE users SET status = 'suspended', suspended_until = ?, suspension_reason = ? WHERE id = ?",
                [suspendedUntil, actionNotes, farmerId]
            );

            await pool.query(
                `INSERT INTO admin_action_logs (admin_id, target_user_id, report_id, action_type, days, reason) 
                 VALUES (?, ?, ?, 'suspend', ?, ?)`,
                [req.userId, farmerId, id, numDays, actionNotes]
            );

            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type) 
                 VALUES (?, 'Account Suspended', ?, 'warning')`,
                [farmerId, `Your account was suspended for ${numDays} days following customer report #${id}. Reason: ${actionNotes}`]
            );

        } else if (action === 'ban') {
            await pool.query(
                "UPDATE users SET status = 'banned', ban_reason = ?, suspended_until = NULL WHERE id = ?",
                [actionNotes, farmerId]
            );

            await pool.query(
                `INSERT INTO admin_action_logs (admin_id, target_user_id, report_id, action_type, reason) 
                 VALUES (?, ?, ?, 'ban', ?)`,
                [req.userId, farmerId, id, actionNotes]
            );

            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type) 
                 VALUES (?, 'Account Banned', ?, 'error')`,
                [farmerId, `Your account has been banned due to verified customer complaint #${id}. Reason: ${actionNotes}`]
            );

        } else if (action === 'warn') {
            await pool.query(
                "UPDATE users SET warning_count = warning_count + 1, last_warning = ?, last_warning_at = NOW() WHERE id = ?",
                [actionNotes, farmerId]
            );

            await pool.query(
                `INSERT INTO admin_action_logs (admin_id, target_user_id, report_id, action_type, reason) 
                 VALUES (?, ?, ?, 'warn', ?)`,
                [req.userId, farmerId, id, actionNotes]
            );

            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type) 
                 VALUES (?, 'Customer Grievance Warning', ?, 'warning')`,
                [farmerId, `Customer report #${id} was substantiated. Warning: ${actionNotes}. Please maintain high product quality.`]
            );

        } else if (action === 'dismiss') {
            reportStatus = 'dismissed';
            adminAction = 'dismissed';

            await pool.query(
                `INSERT INTO admin_action_logs (admin_id, target_user_id, report_id, action_type, reason) 
                 VALUES (?, ?, ?, 'dismiss_report', ?)`,
                [req.userId, farmerId, id, actionNotes || 'Report dismissed after review.']
            );
        }

        // Update the report row
        await pool.query(`
            UPDATE farmer_reports 
            SET status = ?, admin_action = ?, admin_notes = ?, action_taken_at = NOW(), action_taken_by = ? 
            WHERE id = ?
        `, [reportStatus, adminAction, actionNotes, req.userId, id]);

        // Notify reporter (customer) of resolution
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, 'Report Update', ?, 'info')`,
            [report.reporter_id, `Your report against ${report.farmer_name} has been reviewed and marked as ${reportStatus}. Thank you for helping keep FreshField safe.`]
        );

        res.json({
            success: true,
            message: `Action (${action.toUpperCase()}) executed successfully on farmer ${report.farmer_name}. Report marked as ${reportStatus}.`
        });
    } catch (err) {
        console.error('Error taking report action:', err);
        res.status(500).json({ success: false, message: 'Failed to process report action: ' + err.message });
    }
};

// ==========================================
// 10. MODERATION AUDIT LOGS
// ==========================================
const getAdminLogs = async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        const [logs] = await pool.query(`
            SELECT 
                l.id, l.action_type, l.days, l.reason, l.created_at,
                admin.name as admin_name, admin.email as admin_email,
                target.id as target_id, target.name as target_name, target.email as target_email, target.role as target_role,
                l.report_id
            FROM admin_action_logs l
            JOIN users admin ON l.admin_id = admin.id
            JOIN users target ON l.target_user_id = target.id
            ORDER BY l.id DESC
            LIMIT ?
        `, [parseInt(limit)]);

        res.json({ success: true, logs });
    } catch (err) {
        console.error('Error fetching admin logs:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs: ' + err.message });
    }
};

// ==========================================
// 11. CUSTOMER REPORTING (FOR CUSTOMERS)
// ==========================================
const createFarmerReport = async (req, res) => {
    try {
        const { farmer_id, order_id, reason, description } = req.body;

        if (!farmer_id) {
            return res.status(400).json({ success: false, message: 'Farmer ID is required.' });
        }
        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please select a reason for the report.' });
        }
        if (!description || description.trim() === '') {
            return res.status(400).json({ success: false, message: 'Please provide details of your complaint.' });
        }

        // Verify farmer
        const [farmers] = await pool.query("SELECT id, name, role FROM users WHERE id = ? AND role = 'farmer'", [farmer_id]);
        if (farmers.length === 0) {
            return res.status(404).json({ success: false, message: 'Farmer not found.' });
        }

        let verifiedOrderId = null;
        if (order_id) {
            const [orders] = await pool.query('SELECT id FROM orders WHERE id = ?', [order_id]);
            if (orders.length > 0) verifiedOrderId = order_id;
        }

        const [result] = await pool.query(`
            INSERT INTO farmer_reports (reporter_id, farmer_id, order_id, reason, description, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `, [req.userId, farmer_id, verifiedOrderId, reason.trim(), description.trim()]);

        res.status(201).json({
            success: true,
            message: 'Your report has been submitted to FreshField administration for review.',
            report_id: result.insertId
        });
    } catch (err) {
        console.error('Error creating report:', err);
        res.status(500).json({ success: false, message: 'Failed to submit report: ' + err.message });
    }
};

const getCustomerMyReports = async (req, res) => {
    try {
        const [reports] = await pool.query(`
            SELECT 
                r.id, r.reason, r.description, r.status, r.admin_action, r.admin_notes, r.created_at, r.action_taken_at,
                farmer.name as farmer_name, farmer.farm_name,
                o.order_number
            FROM farmer_reports r
            JOIN users farmer ON r.farmer_id = farmer.id
            LEFT JOIN orders o ON r.order_id = o.id
            WHERE r.reporter_id = ?
            ORDER BY r.id DESC
        `, [req.userId]);

        res.json({ success: true, reports });
    } catch (err) {
        console.error('Error fetching my reports:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reports: ' + err.message });
    }
};

// Helper list of farmers for customers to select when reporting
const getFarmersListForReporting = async (req, res) => {
    try {
        const [farmers] = await pool.query(`
            SELECT id, name, farm_name, farm_location, is_verified 
            FROM users 
            WHERE role = 'farmer' AND status != 'banned'
            ORDER BY name ASC
        `);
        res.json({ success: true, farmers });
    } catch (err) {
        console.error('Error fetching farmers list:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch farmers: ' + err.message });
    }
};

module.exports = {
    getAdminStats,
    getUsers,
    suspendUser,
    unsuspendUser,
    banUser,
    unbanUser,
    warnUser,
    getReports,
    takeReportAction,
    getAdminLogs,
    createFarmerReport,
    getCustomerMyReports,
    getFarmersListForReporting
};
