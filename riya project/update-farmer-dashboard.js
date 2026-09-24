const fs = require('fs');

const farmerDashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreshField — Farmer & Admin Management Dashboard</title>
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Google Fonts: Playfair Display (Serif headings/numbers) + Poppins (UI/Body) -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        /* ============================================================
           FRESHFIELD ADMIN / FARMER DASHBOARD MASTER DESIGN SYSTEM
           Light · Organic · Editorial · Business Premium
           ============================================================ */
        :root {
            /* Color Palette */
            --cream:           #F8F5EC;
            --cream-light:     #FFFDF8;
            --beige:           #EEE9DA;
            --beige-mid:       #E5DEC8;
            --green-primary:   #355C24;
            --green-secondary: #6F9638;
            --green-soft:      #A8BF72;
            --green-pale:      #EAF0DF;
            --orange:          #F28C28;
            --orange-light:    #FBBF75;
            --orange-pale:     #FCECDD;
            --text-dark:       #1F211B;
            --text-muted:      #6F7168;
            --text-light:      #9B9D95;
            --white:           #FFFFFF;

            /* Status colors */
            --status-delivered:  #D6E4B8;
            --status-delivered-t:#355C24;
            --status-processing: #FDE8D0;
            --status-processing-t:#D97706;
            --status-shipped:    #E0F2FE;
            --status-shipped-t:   #0284C7;
            --status-cancelled:  #FEE2E2;
            --status-cancelled-t:#DC2626;

            /* Typography */
            --font-serif: 'Playfair Display', Georgia, serif;
            --font-sans:  'Poppins', -apple-system, sans-serif;

            /* Sidebar width */
            --sidebar-w: 260px;
            --sidebar-w-collapsed: 76px;

            /* Radius */
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --radius-pill: 100px;

            /* Shadows */
            --shadow-sm:  0 2px 10px rgba(31, 33, 27, 0.04);
            --shadow-md:  0 6px 24px rgba(31, 33, 27, 0.06);
            --shadow-lg:  0 12px 40px rgba(31, 33, 27, 0.09);

            /* Transitions */
            --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
            --t-fast: 0.2s;
            --t-med:  0.4s;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; font-size: 16px; }
        body {
            font-family: var(--font-sans);
            background: var(--cream);
            color: var(--text-dark);
            line-height: 1.5;
            min-height: 100vh;
            overflow-x: hidden;
        }

        a { text-decoration: none; color: inherit; }
        img { max-width: 100%; display: block; }
        button, input, select, textarea { font-family: var(--font-sans); }
        button { cursor: pointer; border: none; background: none; }

        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

        /* ============================================================
           MAIN APP CONTAINER & LAYOUT
           ============================================================ */
        #app-container {
            display: flex;
            min-height: 100vh;
        }

        /* ============================================================
           SIDEBAR
           ============================================================ */
        #sidebar {
            width: var(--sidebar-w);
            background: var(--cream-light);
            border-right: 1px solid var(--beige-mid);
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 1000;
            transition: width var(--t-med) var(--ease-out), transform var(--t-med) var(--ease-out);
            padding: 24px 16px 20px;
        }

        #sidebar.collapsed {
            width: var(--sidebar-w-collapsed);
        }

        /* Sidebar Logo */
        .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 10px 24px;
            border-bottom: 1px solid var(--beige);
            margin-bottom: 20px;
            overflow: hidden;
        }

        .sidebar-logo-icon {
            width: 40px;
            height: 40px;
            background: var(--green-primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .sidebar-logo-icon svg { width: 22px; height: 22px; }

        .sidebar-logo-text { whitespace: nowrap; }
        .sidebar-logo-title {
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.1;
        }

        .sidebar-logo-sub {
            font-size: 10px;
            color: var(--text-muted);
            letter-spacing: 0.05em;
        }

        /* Sidebar Navigation */
        .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .sidebar-nav-group-title {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-light);
            padding: 14px 12px 6px;
            white-space: nowrap;
        }

        .sidebar-nav a {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 14px;
            border-radius: var(--radius-md);
            font-size: 13.5px;
            font-weight: 500;
            color: var(--text-muted);
            transition: all var(--t-fast) var(--ease-out);
            white-space: nowrap;
            position: relative;
        }

        .sidebar-nav a i {
            font-size: 16px;
            width: 20px;
            text-align: center;
            flex-shrink: 0;
            transition: color var(--t-fast);
        }

        .sidebar-nav a:hover {
            background: rgba(111, 150, 56, 0.08);
            color: var(--green-primary);
        }

        /* Active Navigation Item — Reference match */
        .sidebar-nav a.active {
            background: var(--green-pale);
            color: var(--green-primary);
            font-weight: 600;
        }

        .sidebar-nav a.active i {
            color: var(--green-primary);
        }

        .nav-badge {
            margin-left: auto;
            background: var(--orange);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: var(--radius-pill);
        }

        /* Collapsed Sidebar Tweaks */
        #sidebar.collapsed .sidebar-logo-text,
        #sidebar.collapsed .sidebar-nav span,
        #sidebar.collapsed .sidebar-nav-group-title,
        #sidebar.collapsed .nav-badge,
        #sidebar.collapsed .sidebar-logout span {
            display: none;
        }

        #sidebar.collapsed .sidebar-logo { justify-content: center; padding: 0 0 20px; }
        #sidebar.collapsed .sidebar-nav a { justify-content: center; padding: 12px; }

        /* Sidebar Footer / Logout */
        .sidebar-footer {
            padding-top: 16px;
            border-top: 1px solid var(--beige);
            margin-top: auto;
            position: relative;
        }

        .sidebar-logout {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 14px;
            border: 1.5px solid var(--beige-mid);
            border-radius: var(--radius-pill);
            color: var(--text-dark);
            font-size: 13.5px;
            font-weight: 500;
            transition: all var(--t-fast) var(--ease-out);
            justify-content: center;
        }

        .sidebar-logout:hover {
            background: #FEE2E2;
            border-color: #FCA5A5;
            color: #DC2626;
        }

        /* Botanical overlay at bottom left of sidebar */
        .sidebar-botanical-bg {
            position: absolute;
            bottom: 60px;
            left: -10px;
            width: 180px;
            opacity: 0.12;
            pointer-events: none;
        }

        /* ============================================================
           MAIN WORKSPACE
           ============================================================ */
        #main-wrapper {
            margin-left: var(--sidebar-w);
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
            transition: margin-left var(--t-med) var(--ease-out);
        }

        #sidebar.collapsed + #main-wrapper {
            margin-left: var(--sidebar-w-collapsed);
        }

        /* Top Bar Header */
        .top-header {
            position: sticky;
            top: 0;
            z-index: 900;
            background: rgba(248, 245, 236, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--beige-mid);
            padding: 16px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .sidebar-toggle-btn {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            border: 1px solid var(--beige-mid);
            background: var(--cream-light);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-dark);
            font-size: 15px;
            transition: all var(--t-fast);
        }

        .sidebar-toggle-btn:hover {
            border-color: var(--green-primary);
            color: var(--green-primary);
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        /* Compact Search input */
        .header-search {
            position: relative;
            width: 260px;
        }

        .header-search input {
            width: 100%;
            padding: 10px 38px 10px 16px;
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-pill);
            font-size: 13px;
            color: var(--text-dark);
            transition: all var(--t-fast);
        }

        .header-search input:focus {
            outline: none;
            border-color: var(--green-primary);
            box-shadow: 0 0 0 3px rgba(53, 92, 36, 0.08);
            background: var(--white);
        }

        .header-search i {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 13px;
            pointer-events: none;
        }

        /* Notification Bell */
        .header-noti-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid var(--beige-mid);
            background: var(--cream-light);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            color: var(--text-dark);
            font-size: 15px;
            transition: all var(--t-fast);
        }

        .header-noti-btn:hover {
            border-color: var(--green-primary);
            color: var(--green-primary);
        }

        .noti-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: var(--orange);
            color: white;
            font-size: 9.5px;
            font-weight: 700;
            width: 17px;
            height: 17px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* User Profile Pill */
        .header-user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 12px 4px 4px;
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-pill);
            cursor: pointer;
            transition: all var(--t-fast);
        }

        .header-user-profile:hover {
            border-color: var(--green-primary);
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--green-primary);
            color: white;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
        }

        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .user-meta { line-height: 1.2; text-align: left; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-dark); display: block; }
        .user-role { font-size: 10.5px; color: var(--text-muted); display: block; }
        .user-arrow { font-size: 11px; color: var(--text-muted); margin-left: 2px; }

        /* Dashboard Main Scroll Content */
        .dashboard-content {
            padding: 32px 40px 60px;
            flex: 1;
        }

        /* Welcome Greeting */
        .welcome-header {
            margin-bottom: 28px;
        }

        .welcome-title {
            font-family: var(--font-sans);
            font-size: 26px;
            font-weight: 700;
            color: var(--text-dark);
            letter-spacing: -0.01em;
            margin-bottom: 4px;
        }

        .welcome-sub {
            font-size: 13.5px;
            color: var(--text-muted);
        }

        /* ============================================================
           KPI CARDS SECTION (4 Grid)
           ============================================================ */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 32px;
        }

        .kpi-card {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 24px;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: transform var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out);
        }

        .kpi-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }

        .kpi-top {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
        }

        .kpi-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }

        .kpi-icon.users { background: var(--green-pale); color: var(--green-primary); }
        .kpi-icon.farmers { background: #E2EFCB; color: #557A2B; }
        .kpi-icon.orders { background: var(--orange-pale); color: var(--orange); }
        .kpi-icon.revenue { background: #FBF3D5; color: #D97706; }

        .kpi-value {
            font-family: var(--font-serif);
            font-size: 32px;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1;
            margin-bottom: 4px;
        }

        .kpi-label {
            font-size: 12.5px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .kpi-bottom {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
        }

        .kpi-trend {
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 2px;
        }

        .kpi-trend.up { color: var(--green-primary); }
        .kpi-trend.neutral { color: var(--orange); }

        .kpi-period { color: var(--text-light); }

        /* Organic sparkline illustration overlay */
        .kpi-sparkline-svg {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 110px;
            height: 45px;
            pointer-events: none;
            opacity: 0.85;
        }

        /* ============================================================
           MAIN DASHBOARD GRID LAYOUT (Sales + Orders + Side Columns)
           ============================================================ */
        .dashboard-main-grid {
            display: grid;
            grid-template-columns: 1.75fr 1fr;
            gap: 24px;
        }

        .card-box {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 24px;
            box-shadow: var(--shadow-sm);
            margin-bottom: 24px;
        }

        .card-box-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .card-box-title {
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 700;
            color: var(--text-dark);
        }

        .card-box-link {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            border: 1px solid var(--beige-mid);
            padding: 4px 12px;
            border-radius: var(--radius-pill);
            transition: all var(--t-fast);
        }

        .card-box-link:hover {
            border-color: var(--green-primary);
            color: var(--green-primary);
        }

        /* Sales Overview Box */
        .sales-header-controls {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .sales-period-select {
            padding: 6px 14px;
            border-radius: var(--radius-pill);
            border: 1px solid var(--beige-mid);
            background: var(--white);
            font-size: 12px;
            font-weight: 500;
            color: var(--text-dark);
            cursor: pointer;
        }

        .sales-legend {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 16px;
        }

        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-dot.revenue { background: var(--green-primary); }
        .legend-dot.orders { background: var(--orange); }

        .chart-container {
            position: relative;
            height: 280px;
            width: 100%;
        }

        /* Two-column sub-grid under chart */
        .sub-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        /* Top Selling Products List */
        .top-products-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .top-product-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .product-rank {
            font-family: var(--font-serif);
            font-size: 14px;
            font-weight: 700;
            color: var(--text-muted);
            width: 16px;
            text-align: center;
        }

        .product-thumb {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            object-fit: cover;
            background: var(--beige);
            flex-shrink: 0;
        }

        .product-meta { flex: 1; min-width: 0; }
        .product-name-txt { font-size: 13px; font-weight: 600; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .product-bar-wrap { height: 4px; background: var(--beige); border-radius: 2px; margin-top: 6px; width: 100%; overflow: hidden; }
        .product-bar-fill { height: 100%; background: var(--green-secondary); border-radius: 2px; }

        .product-sales-txt { font-size: 11px; color: var(--text-muted); text-align: right; }
        .product-rev-txt { font-size: 13px; font-weight: 700; color: var(--green-primary); text-align: right; white-space: nowrap; }

        /* Donut Chart Container */
        .donut-wrap {
            position: relative;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .donut-center-text {
            position: absolute;
            text-align: center;
            pointer-events: none;
        }

        .donut-center-val { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--text-dark); line-height: 1; }
        .donut-center-lbl { font-size: 10px; color: var(--text-muted); }

        /* Recent Orders Section */
        .recent-orders-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .order-row-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 10px 0;
            border-bottom: 1px solid var(--beige);
            transition: background var(--t-fast);
        }

        .order-row-item:last-child { border-bottom: none; }

        .order-img {
            width: 46px;
            height: 46px;
            border-radius: 12px;
            object-fit: cover;
            background: var(--beige);
            flex-shrink: 0;
        }

        .order-info { flex: 1; min-width: 0; }
        .order-id-txt { font-size: 12px; font-weight: 700; color: var(--text-dark); }
        .order-cust-name { font-size: 12.5px; color: var(--text-muted); font-weight: 500; }
        .order-prod-desc { font-size: 11px; color: var(--text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .order-status-wrap { text-align: right; flex-shrink: 0; }

        .status-badge-pill {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: var(--radius-pill);
            text-transform: capitalize;
        }

        .status-badge-pill.delivered  { background: var(--status-delivered);  color: var(--status-delivered-t); }
        .status-badge-pill.processing { background: var(--status-processing); color: var(--status-processing-t); }
        .status-badge-pill.shipped    { background: var(--status-shipped);    color: var(--status-shipped-t); }
        .status-badge-pill.cancelled  { background: var(--status-cancelled);  color: var(--status-cancelled-t); }

        .order-date-txt { font-size: 11px; color: var(--text-light); margin-top: 2px; }
        .order-amt-txt { font-size: 13px; font-weight: 700; color: var(--text-dark); margin-top: 2px; }

        /* Activity Overview Grid */
        .activity-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .activity-mini-card {
            background: var(--white);
            border: 1px solid var(--beige);
            border-radius: var(--radius-md);
            padding: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .act-icon-box {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
        }

        .act-num { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--text-dark); line-height: 1; }
        .act-lbl { font-size: 10.5px; color: var(--text-muted); line-height: 1.2; margin-top: 2px; }

        /* ============================================================
           SUB-PAGES (Products, Orders, Profile)
           ============================================================ */
        .page-content { display: none; }
        .page-content.active { display: block; animation: pageFade 0.4s var(--ease-out); }

        @keyframes pageFade {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Products Management Page */
        .products-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
        }

        .btn-add-product {
            background: var(--green-primary);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-pill);
            font-size: 13.5px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 14px rgba(53,92,36,0.25);
            transition: all var(--t-fast);
        }

        .btn-add-product:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(53,92,36,0.35);
        }

        /* Product item row */
        .product-item {
            display: flex;
            align-items: center;
            gap: 16px;
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-bottom: 12px;
        }

        .product-item img {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            object-fit: cover;
            background: var(--beige);
        }

        .product-item .info { flex: 1; }
        .product-item .info h4 { font-family: var(--font-serif); font-size: 16px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; }
        .product-item .info p { font-size: 12.5px; color: var(--text-muted); }

        .product-item .actions { display: flex; gap: 8px; }

        .btn-icon-sm {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid var(--beige-mid);
            background: var(--white);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            color: var(--text-dark);
            transition: all var(--t-fast);
        }

        .btn-icon-sm:hover { border-color: var(--green-primary); color: var(--green-primary); transform: scale(1.08); }
        .btn-icon-sm.danger:hover { border-color: #DC2626; color: #DC2626; }

        /* Form Styles */
        .form-card {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 28px;
            margin-top: 24px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }

        .form-group.full { grid-column: 1 / -1; }

        .form-group label {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--text-dark);
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--beige-mid);
            background: var(--white);
            font-size: 13.5px;
            color: var(--text-dark);
            transition: all var(--t-fast);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--green-primary);
            box-shadow: 0 0 0 3px rgba(53,92,36,0.08);
        }

        /* Upload Area */
        .upload-area {
            border: 2px dashed var(--beige-mid);
            border-radius: var(--radius-md);
            padding: 28px;
            text-align: center;
            background: var(--white);
            cursor: pointer;
            transition: all var(--t-fast);
        }

        .upload-area:hover, .upload-area.dragover {
            border-color: var(--green-primary);
            background: var(--green-pale);
        }

        .upload-icon { font-size: 28px; color: var(--green-primary); margin-bottom: 8px; }

        .upload-preview-img {
            margin-top: 12px;
            max-height: 120px;
            border-radius: var(--radius-sm);
            object-fit: cover;
        }

        /* Orders Table */
        .orders-table-wrap {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            overflow: hidden;
        }

        .orders-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
        }

        .orders-table th {
            background: var(--cream);
            padding: 14px 20px;
            font-weight: 600;
            color: var(--text-muted);
            font-size: 11.5px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--beige-mid);
        }

        .orders-table td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--beige);
            color: var(--text-dark);
        }

        .orders-table tr:last-child td { border-bottom: none; }

        /* Toast Alert Container */
        #toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 3000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* ============================================================
           RESPONSIVE DESIGN
           ============================================================ */
        @media (max-width: 1200px) {
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
            .dashboard-main-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
            #sidebar { transform: translateX(-100%); }
            #sidebar.open { transform: translateX(0); }
            #main-wrapper { margin-left: 0 !important; }
            .top-header { padding: 14px 20px; }
            .dashboard-content { padding: 20px; }
            .header-search { display: none; }
            .kpi-grid { grid-template-columns: 1fr; }
            .sub-grid-2 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<div id="app-container">

    <!-- ============================================================
         SIDEBAR
         ============================================================ -->
    <aside id="sidebar" role="navigation" aria-label="Sidebar Navigation">
        <!-- Logo -->
        <div class="sidebar-logo">
            <div class="sidebar-logo-icon">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 3C7 3 3 7 3 12C8 12 12 8 12 3Z" fill="white" opacity="0.9"/>
                    <path d="M12 3C17 3 21 7 21 12C16 12 12 8 12 3Z" fill="white" opacity="0.6"/>
                    <path d="M12 12L12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="sidebar-logo-text">
                <span class="sidebar-logo-title">FreshField</span>
                <span class="sidebar-logo-sub">Farm to Your Table</span>
            </div>
        </div>

        <!-- Botanical Decorative BG SVG -->
        <svg class="sidebar-botanical-bg" viewBox="0 0 120 120" fill="none">
            <path d="M20 100 C20 60 60 30 100 20" stroke="#6F9638" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M40 80 C40 80 20 60 40 40 C40 40 60 60 40 80Z" stroke="#6F9638" stroke-width="1" fill="#A8BF72"/>
        </svg>

        <!-- Navigation Links -->
        <nav class="sidebar-nav">
            <a href="#" data-page="dashboard" class="active">
                <i class="fas fa-th-large"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" data-page="products">
                <i class="fas fa-leaf"></i>
                <span>Products</span>
            </a>
            <a href="#" data-page="orders">
                <i class="fas fa-shopping-bag"></i>
                <span>Orders</span>
                <span class="nav-badge" id="pending-badge" style="display:none;">0</span>
            </a>
            <a href="#" data-page="categories">
                <i class="fas fa-tags"></i>
                <span>Categories</span>
            </a>
            <a href="#" data-page="reviews">
                <i class="fas fa-star"></i>
                <span>Reviews</span>
            </a>
            <a href="#" data-page="reports">
                <i class="fas fa-chart-line"></i>
                <span>Reports</span>
            </a>
            <a href="#" data-page="profile">
                <i class="fas fa-cog"></i>
                <span>Settings & Profile</span>
            </a>
        </nav>

        <!-- Sidebar Bottom / Logout -->
        <div class="sidebar-footer">
            <button class="sidebar-logout" onclick="auth.handleLogout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        </div>
    </aside>

    <!-- ============================================================
         MAIN WORKSPACE
         ============================================================ -->
    <div id="main-wrapper">

        <!-- Top Header -->
        <header class="top-header">
            <div class="header-left">
                <button class="sidebar-toggle-btn" id="sidebar-toggle-btn" onclick="toggleSidebarToggle()" aria-label="Toggle sidebar">
                    <i class="fas fa-bars"></i>
                </button>
            </div>

            <div class="header-right">
                <!-- Search bar -->
                <div class="header-search">
                    <input type="text" placeholder="Search anything...">
                    <i class="fas fa-search"></i>
                </div>

                <!-- Notification Bell -->
                <button class="header-noti-btn" aria-label="Notifications">
                    <i class="fas fa-bell"></i>
                    <span class="noti-badge">5</span>
                </button>

                <!-- User Profile Pill -->
                <div class="header-user-profile" onclick="farmer.showPage('profile')">
                    <div class="user-avatar" id="header-avatar">
                        <span>AD</span>
                    </div>
                    <div class="user-meta">
                        <span class="user-name" id="header-user-name">Admin User</span>
                        <span class="user-role" id="header-user-role">Super Admin</span>
                    </div>
                    <i class="fas fa-chevron-down user-arrow"></i>
                </div>
            </div>
        </header>

        <!-- Main Dashboard Content Area -->
        <main class="dashboard-content">

            <!-- PAGE: DASHBOARD (Overview) -->
            <div id="page-dashboard" class="page-content active">
                
                <!-- Welcome Greeting Header -->
                <div class="welcome-header">
                    <h1 class="welcome-title">Welcome back, <span id="user-greeting">Admin</span>! 👋</h1>
                    <p class="welcome-sub">Here's what's happening with FreshField today. <span id="current-date"></span></p>
                </div>

                <!-- 4 KPI Cards Grid (Matches Reference Image) -->
                <div class="kpi-grid">
                    <!-- KPI 1: Users / Products -->
                    <div class="kpi-card">
                        <div class="kpi-top">
                            <div class="kpi-icon users"><i class="fas fa-users"></i></div>
                            <div>
                                <div class="kpi-value" id="stat-products">1,248</div>
                                <div class="kpi-label">Total Users</div>
                            </div>
                        </div>
                        <div class="kpi-bottom">
                            <span class="kpi-trend up"><i class="fas fa-arrow-up"></i> 12.5%</span>
                            <span class="kpi-period">vs last month</span>
                        </div>
                        <svg class="kpi-sparkline-svg" viewBox="0 0 100 40" fill="none"><path d="M0 35 C 30 35, 40 10, 70 25 C 85 30, 90 5, 100 15 L 100 40 L 0 40 Z" fill="#EAF0DF" opacity="0.7"/><path d="M0 35 C 30 35, 40 10, 70 25 C 85 30, 90 5, 100 15" stroke="#6F9638" stroke-width="1.5"/></svg>
                    </div>

                    <!-- KPI 2: Farmers / Stock -->
                    <div class="kpi-card">
                        <div class="kpi-top">
                            <div class="kpi-icon farmers"><i class="fas fa-user-tie"></i></div>
                            <div>
                                <div class="kpi-value" id="stat-farmers">356</div>
                                <div class="kpi-label">Total Farmers</div>
                            </div>
                        </div>
                        <div class="kpi-bottom">
                            <span class="kpi-trend up"><i class="fas fa-arrow-up"></i> 15.8%</span>
                            <span class="kpi-period">vs last month</span>
                        </div>
                        <svg class="kpi-sparkline-svg" viewBox="0 0 100 40" fill="none"><path d="M0 30 C 25 35, 50 15, 75 25 C 85 10, 95 20, 100 8 L 100 40 L 0 40 Z" fill="#E2EFCB" opacity="0.7"/><path d="M0 30 C 25 35, 50 15, 75 25 C 85 10, 95 20, 100 8" stroke="#557A2B" stroke-width="1.5"/></svg>
                    </div>

                    <!-- KPI 3: Orders -->
                    <div class="kpi-card">
                        <div class="kpi-top">
                            <div class="kpi-icon orders"><i class="fas fa-shopping-bag"></i></div>
                            <div>
                                <div class="kpi-value" id="stat-orders">2,589</div>
                                <div class="kpi-label">Total Orders</div>
                            </div>
                        </div>
                        <div class="kpi-bottom">
                            <span class="kpi-trend neutral"><i class="fas fa-arrow-up"></i> 18.7%</span>
                            <span class="kpi-period">vs last month</span>
                        </div>
                        <svg class="kpi-sparkline-svg" viewBox="0 0 100 40" fill="none"><path d="M0 32 C 30 20, 45 35, 70 18 C 85 22, 90 10, 100 5 L 100 40 L 0 40 Z" fill="#FCECDD" opacity="0.7"/><path d="M0 32 C 30 20, 45 35, 70 18 C 85 22, 90 10, 100 5" stroke="#F28C28" stroke-width="1.5"/></svg>
                    </div>

                    <!-- KPI 4: Revenue -->
                    <div class="kpi-card">
                        <div class="kpi-top">
                            <div class="kpi-icon revenue"><i class="fas fa-indian-rupee-sign"></i></div>
                            <div>
                                <div class="kpi-value" id="stat-revenue">₹12,45,850</div>
                                <div class="kpi-label">Total Revenue</div>
                            </div>
                        </div>
                        <div class="kpi-bottom">
                            <span class="kpi-trend up"><i class="fas fa-arrow-up"></i> 20.4%</span>
                            <span class="kpi-period">vs last month</span>
                        </div>
                        <svg class="kpi-sparkline-svg" viewBox="0 0 100 40" fill="none"><path d="M0 38 C 20 28, 40 32, 60 15 C 80 25, 90 8, 100 2 L 100 40 L 0 40 Z" fill="#FBF5E5" opacity="0.7"/><path d="M0 38 C 20 28, 40 32, 60 15 C 80 25, 90 8, 100 2" stroke="#D97706" stroke-width="1.5"/></svg>
                    </div>
                </div>

                <!-- Main Grid Layout (Sales Chart + Recent Orders & Analytics) -->
                <div class="dashboard-main-grid">

                    <!-- Left Column: Sales Chart & Sub-Cards -->
                    <div>
                        <!-- Sales Overview Chart Box -->
                        <div class="card-box">
                            <div class="card-box-header">
                                <h2 class="card-box-title">Sales Overview</h2>
                                <div class="sales-header-controls">
                                    <div class="sales-legend">
                                        <div class="legend-item"><span class="legend-dot revenue"></span> Revenue (₹)</div>
                                        <div class="legend-item"><span class="legend-dot orders"></span> Orders</div>
                                    </div>
                                    <select class="sales-period-select">
                                        <option>This Month</option>
                                        <option>Last Month</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="revenue-chart"></canvas>
                            </div>
                        </div>

                        <!-- Sub-Grid: Top Products & User Distribution -->
                        <div class="sub-grid-2">

                            <!-- Top Selling Products -->
                            <div class="card-box">
                                <div class="card-box-header">
                                    <h3 class="card-box-title">Top Selling Products</h3>
                                    <a href="#" onclick="farmer.showPage('products')" class="card-box-link">View All</a>
                                </div>
                                <div class="top-products-list" id="top-products-container">
                                    <!-- Populated by JS -->
                                    <div class="top-product-item">
                                        <span class="product-rank">1</span>
                                        <img src="assets/images/tomatoes.png" class="product-thumb" alt="Tomatoes">
                                        <div class="product-meta">
                                            <div class="product-name-txt">Farm Fresh Tomatoes</div>
                                            <div class="product-bar-wrap"><div class="product-bar-fill" style="width:85%;"></div></div>
                                        </div>
                                        <div>
                                            <div class="product-sales-txt">523 Sales</div>
                                            <div class="product-rev-txt">₹18,770</div>
                                        </div>
                                    </div>

                                    <div class="top-product-item">
                                        <span class="product-rank">2</span>
                                        <img src="assets/images/hero-produce.png" class="product-thumb" alt="Potatoes">
                                        <div class="product-meta">
                                            <div class="product-name-txt">Organic Potatoes</div>
                                            <div class="product-bar-wrap"><div class="product-bar-fill" style="width:72%;"></div></div>
                                        </div>
                                        <div>
                                            <div class="product-sales-txt">482 Sales</div>
                                            <div class="product-rev-txt">₹16,870</div>
                                        </div>
                                    </div>

                                    <div class="top-product-item">
                                        <span class="product-rank">3</span>
                                        <img src="assets/images/carrots.png" class="product-thumb" alt="Carrots">
                                        <div class="product-meta">
                                            <div class="product-name-txt">Fresh Carrots</div>
                                            <div class="product-bar-wrap"><div class="product-bar-fill" style="width:64%;"></div></div>
                                        </div>
                                        <div>
                                            <div class="product-sales-txt">411 Sales</div>
                                            <div class="product-rev-txt">₹14,380</div>
                                        </div>
                                    </div>

                                    <div class="top-product-item">
                                        <span class="product-rank">4</span>
                                        <img src="assets/images/spinach.png" class="product-thumb" alt="Spinach">
                                        <div class="product-meta">
                                            <div class="product-name-txt">Green Leafy Vegetables</div>
                                            <div class="product-bar-wrap"><div class="product-bar-fill" style="width:55%;"></div></div>
                                        </div>
                                        <div>
                                            <div class="product-sales-txt">367 Sales</div>
                                            <div class="product-rev-txt">₹12,550</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- User Distribution Donut -->
                            <div class="card-box">
                                <div class="card-box-header">
                                    <h3 class="card-box-title">User Distribution</h3>
                                </div>
                                <div class="donut-wrap">
                                    <canvas id="user-distribution-chart"></canvas>
                                    <div class="donut-center-text">
                                        <div class="donut-center-val">1,248</div>
                                        <div class="donut-center-lbl">Total Users</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Right Column: Recent Orders & Activity -->
                    <div>
                        <!-- Recent Orders -->
                        <div class="card-box">
                            <div class="card-box-header">
                                <h2 class="card-box-title">Recent Orders</h2>
                                <a href="#" onclick="farmer.showPage('orders')" class="card-box-link">View All</a>
                            </div>

                            <div class="recent-orders-list" id="recent-orders-container">
                                <!-- Order Item 1 -->
                                <div class="order-row-item">
                                    <img src="assets/images/hero-produce.png" class="order-img" alt="Order product">
                                    <div class="order-info">
                                        <div class="order-id-txt">#ORD-250501</div>
                                        <div class="order-cust-name">Rahul Sharma</div>
                                        <div class="order-prod-desc">Fresh Vegetables Basket</div>
                                    </div>
                                    <div class="order-status-wrap">
                                        <span class="status-badge-pill delivered">Delivered</span>
                                        <div class="order-date-txt">May 31, 2025</div>
                                        <div class="order-amt-txt">₹1,250</div>
                                    </div>
                                </div>

                                <!-- Order Item 2 -->
                                <div class="order-row-item">
                                    <img src="assets/images/tomatoes.png" class="order-img" alt="Order product">
                                    <div class="order-info">
                                        <div class="order-id-txt">#ORD-250500</div>
                                        <div class="order-cust-name">Priya Patel</div>
                                        <div class="order-prod-desc">Organic Fruits Combo</div>
                                    </div>
                                    <div class="order-status-wrap">
                                        <span class="status-badge-pill processing">Processing</span>
                                        <div class="order-date-txt">May 31, 2025</div>
                                        <div class="order-amt-txt">₹980</div>
                                    </div>
                                </div>

                                <!-- Order Item 3 -->
                                <div class="order-row-item">
                                    <img src="assets/images/spinach.png" class="order-img" alt="Order product">
                                    <div class="order-info">
                                        <div class="order-id-txt">#ORD-250499</div>
                                        <div class="order-cust-name">Amit Verma</div>
                                        <div class="order-prod-desc">Farm Fresh Greens</div>
                                    </div>
                                    <div class="order-status-wrap">
                                        <span class="status-badge-pill delivered">Delivered</span>
                                        <div class="order-date-txt">May 30, 2025</div>
                                        <div class="order-amt-txt">₹650</div>
                                    </div>
                                </div>

                                <!-- Order Item 4 -->
                                <div class="order-row-item">
                                    <img src="assets/images/carrots.png" class="order-img" alt="Order product">
                                    <div class="order-info">
                                        <div class="order-id-txt">#ORD-250498</div>
                                        <div class="order-cust-name">Sneha Joshi</div>
                                        <div class="order-prod-desc">Mixed Vegetable Box</div>
                                    </div>
                                    <div class="order-status-wrap">
                                        <span class="status-badge-pill shipped">Shipped</span>
                                        <div class="order-date-txt">May 30, 2025</div>
                                        <div class="order-amt-txt">₹1,100</div>
                                    </div>
                                </div>

                                <!-- Order Item 5 -->
                                <div class="order-row-item">
                                    <img src="assets/images/tomatoes.png" class="order-img" alt="Order product">
                                    <div class="order-info">
                                        <div class="order-id-txt">#ORD-250497</div>
                                        <div class="order-cust-name">Vikram Singh</div>
                                        <div class="order-prod-desc">Organic Fruits Box</div>
                                    </div>
                                    <div class="order-status-wrap">
                                        <span class="status-badge-pill processing">Processing</span>
                                        <div class="order-date-txt">May 29, 2025</div>
                                        <div class="order-amt-txt">₹1,350</div>
                                    </div>
                                </div>
                            </div>

                            <div style="text-align: right; margin-top: 14px;">
                                <a href="#" onclick="farmer.showPage('orders')" class="card-box-link">View all orders &rarr;</a>
                            </div>
                        </div>

                        <!-- Activity Overview -->
                        <div class="card-box">
                            <div class="card-box-header">
                                <h3 class="card-box-title">Activity Overview</h3>
                                <a href="#" class="card-box-link">View All</a>
                            </div>

                            <div class="activity-grid">
                                <div class="activity-mini-card">
                                    <div class="act-icon-box" style="background:#EAF0DF;color:#355C24;"><i class="fas fa-user-plus"></i></div>
                                    <div>
                                        <div class="act-num">56</div>
                                        <div class="act-lbl">New Users Today</div>
                                    </div>
                                </div>

                                <div class="activity-mini-card">
                                    <div class="act-icon-box" style="background:#FCECDD;color:#F28C28;"><i class="fas fa-shopping-bag"></i></div>
                                    <div>
                                        <div class="act-num">89</div>
                                        <div class="act-lbl">New Orders Today</div>
                                    </div>
                                </div>

                                <div class="activity-mini-card">
                                    <div class="act-icon-box" style="background:#E2EFCB;color:#557A2B;"><i class="fas fa-basket-shopping"></i></div>
                                    <div>
                                        <div class="act-num">112</div>
                                        <div class="act-lbl">Products Added</div>
                                    </div>
                                </div>

                                <div class="activity-mini-card">
                                    <div class="act-icon-box" style="background:#FBF5E5;color:#D97706;"><i class="fas fa-star"></i></div>
                                    <div>
                                        <div class="act-num">23</div>
                                        <div class="act-lbl">New Reviews</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            <!-- PAGE: PRODUCTS -->
            <div id="page-products" class="page-content">
                <div class="products-page-header">
                    <div>
                        <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Product Catalog</h2>
                        <p style="font-size:13px; color:var(--text-muted);">Manage your farm produce listings, prices, and stock inventory.</p>
                    </div>
                    <button class="btn-add-product" onclick="farmer.showAddProductForm()">
                        <i class="fas fa-plus"></i> Add New Product
                    </button>
                </div>

                <!-- Products List Container -->
                <div id="farmer-products">
                    <p style="text-align:center; padding:30px; color:var(--text-muted);">Loading products...</p>
                </div>

                <!-- Product Form Section -->
                <div class="form-card" id="product-form">
                    <h3 id="product-form-title" style="font-family:var(--font-serif); font-size:20px; color:var(--text-dark); margin-bottom:20px;">Add New Product</h3>
                    <form id="product-form-fields" onsubmit="event.preventDefault(); farmer.saveProduct();">
                        <input type="hidden" id="product-id">

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="product-name">Product Name</label>
                                <input type="text" id="product-name" class="form-control" placeholder="e.g. Fresh Organic Tomatoes" required>
                            </div>

                            <div class="form-group">
                                <label for="product-category">Category</label>
                                <select id="product-category" class="form-control" required>
                                    <option value="">Select Category</option>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Leafy Greens">Leafy Greens</option>
                                    <option value="Organic">Organic</option>
                                    <option value="Dairy & Farm Fresh">Dairy & Farm Fresh</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="product-price">Price (₹)</label>
                                <input type="number" step="0.01" id="product-price" class="form-control" placeholder="80.00" required>
                            </div>

                            <div class="form-group">
                                <label for="product-quantity">Quantity in Stock</label>
                                <input type="number" id="product-quantity" class="form-control" placeholder="100" required>
                            </div>

                            <div class="form-group">
                                <label for="product-unit">Unit</label>
                                <select id="product-unit" class="form-control">
                                    <option value="kg">Per kg</option>
                                    <option value="bunch">Per Bunch</option>
                                    <option value="piece">Per Piece</option>
                                    <option value="box">Per Box</option>
                                    <option value="liter">Per Liter</option>
                                </select>
                            </div>

                            <div class="form-group full">
                                <label for="product-description">Description</label>
                                <textarea id="product-description" class="form-control" rows="3" placeholder="Describe your product, farming process, freshness..."></textarea>
                            </div>

                            <div class="form-group full">
                                <label>Product Image</label>
                                <div class="upload-area" id="upload-area">
                                    <i class="fas fa-cloud-upload-alt upload-icon"></i>
                                    <p style="font-size:13px; font-weight:600; color:var(--text-dark);">Click or Drag Image Here</p>
                                    <p style="font-size:11px; color:var(--text-muted);">Supports PNG, JPG, WEBP</p>
                                    <input type="file" id="product-image" accept="image/*" style="display:none;">
                                </div>
                                <div id="upload-preview"></div>
                            </div>
                        </div>

                        <div style="display:flex; gap:12px; margin-top:20px; justify-content:flex-end;">
                            <button type="button" class="sidebar-logout" style="width:auto; padding:10px 20px;" onclick="farmer.resetProductForm()">Cancel</button>
                            <button type="submit" class="btn-add-product">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- PAGE: ORDERS -->
            <div id="page-orders" class="page-content">
                <div class="products-page-header">
                    <div>
                        <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Order Management</h2>
                        <p style="font-size:13px; color:var(--text-muted);">Track customer orders, update delivery status, and review receipts.</p>
                    </div>
                    <select id="order-filter" class="sales-period-select" onchange="farmer.loadOrders()">
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div class="orders-table-wrap">
                    <div id="farmer-orders">
                        <p style="text-align:center; padding:30px; color:var(--text-muted);">Loading orders...</p>
                    </div>
                </div>
            </div>

            <!-- PAGE: PROFILE / SETTINGS -->
            <div id="page-profile" class="page-content">
                <div class="welcome-header">
                    <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Farm Profile & Settings</h2>
                    <p style="font-size:13px; color:var(--text-muted);">Manage your farm details, contact information, and public biography.</p>
                </div>

                <div class="form-card">
                    <form id="profile-form" onsubmit="event.preventDefault(); farmer.updateProfile();">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="profile-name">Full Name</label>
                                <input type="text" id="profile-name" class="form-control" required>
                            </div>

                            <div class="form-group">
                                <label for="profile-email">Email Address</label>
                                <input type="email" id="profile-email" class="form-control" readonly style="background:var(--cream);">
                            </div>

                            <div class="form-group">
                                <label for="profile-phone">Phone Number</label>
                                <input type="text" id="profile-phone" class="form-control">
                            </div>

                            <div class="form-group">
                                <label for="profile-farm-name">Farm Name</label>
                                <input type="text" id="profile-farm-name" class="form-control">
                            </div>

                            <div class="form-group">
                                <label for="profile-farm-location">Farm Location / Region</label>
                                <input type="text" id="profile-farm-location" class="form-control">
                            </div>

                            <div class="form-group">
                                <label for="profile-address">Address</label>
                                <input type="text" id="profile-address" class="form-control">
                            </div>

                            <div class="form-group full">
                                <label for="profile-bio">Farm Story / Biography</label>
                                <textarea id="profile-bio" class="form-control" rows="3" placeholder="Tell customers about your farm's history, sustainable practices, and produce quality..."></textarea>
                            </div>

                            <div class="form-group full">
                                <label>Profile Image</label>
                                <div class="upload-area" id="profile-upload-area">
                                    <i class="fas fa-user-circle upload-icon"></i>
                                    <p style="font-size:13px; font-weight:600; color:var(--text-dark);">Upload Profile Picture</p>
                                    <input type="file" id="profile-image" accept="image/*" style="display:none;">
                                </div>
                                <div id="profile-preview"></div>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                            <button type="submit" class="btn-add-product">Update Profile</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Placeholder pages for full menu shell -->
            <div id="page-categories" class="page-content">
                <div class="welcome-header">
                    <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Category Management</h2>
                    <p style="font-size:13px; color:var(--text-muted);">Organize products into natural produce categories.</p>
                </div>
                <div class="form-card" style="text-align:center; padding:50px;">
                    <i class="fas fa-tags" style="font-size:40px; color:var(--green-primary); margin-bottom:12px;"></i>
                    <h3 style="font-family:var(--font-serif);">Category Settings</h3>
                    <p style="color:var(--text-muted); margin-top:6px;">Vegetables, Fruits, Leafy Greens, and Organic categories active.</p>
                </div>
            </div>

            <div id="page-reviews" class="page-content">
                <div class="welcome-header">
                    <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Customer Reviews</h2>
                    <p style="font-size:13px; color:var(--text-muted);">Read feedback from verified farm customers.</p>
                </div>
                <div class="form-card" style="text-align:center; padding:50px;">
                    <i class="fas fa-star" style="font-size:40px; color:var(--orange); margin-bottom:12px;"></i>
                    <h3 style="font-family:var(--font-serif);">Customer Feedback</h3>
                    <p style="color:var(--text-muted); margin-top:6px;">Average Rating: 4.9 ★ (98% Satisfaction Rate)</p>
                </div>
            </div>

            <div id="page-reports" class="page-content">
                <div class="welcome-header">
                    <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Financial & Farm Reports</h2>
                    <p style="font-size:13px; color:var(--text-muted);">Download monthly sales statements and crop yield analytics.</p>
                </div>
                <div class="form-card" style="text-align:center; padding:50px;">
                    <i class="fas fa-chart-line" style="font-size:40px; color:var(--green-primary); margin-bottom:12px;"></i>
                    <h3 style="font-family:var(--font-serif);">Monthly Reports Ready</h3>
                    <p style="color:var(--text-muted); margin-top:6px;">Sales and order analytics integrated in Sales Overview.</p>
                </div>
            </div>

        </main>
    </div>

</div>

<!-- Toast Container -->
<div id="toast-container" role="alert" aria-live="polite"></div>

<!-- Scripts -->
<script src="js/toast.js"></script>
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
<script src="js/farmer.js"></script>

<script>
// Sidebar Toggle Helper
function toggleSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

// Ensure auth check on load
document.addEventListener('DOMContentLoaded', function() {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    farmer.init();
});
</script>
</body>
</html>`;

fs.writeFileSync('C:/farmer-marketplace/client/farmer-dashboard.html', farmerDashboardHtml, 'utf8');
console.log('Successfully updated farmer-dashboard.html!');
