const fs = require('fs');

const customerDashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreshField — Customer Marketplace & Dashboard</title>
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Google Fonts: Playfair Display + Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <style>
        /* ============================================================
           FRESHFIELD CUSTOMER DASHBOARD MASTER DESIGN SYSTEM
           Light · Organic · Editorial · Marketplace Premium
           ============================================================ */
        :root {
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
            --status-delivered:   #D6E4B8;
            --status-delivered-t: #355C24;
            --status-processing:  #FDE8D0;
            --status-processing-t:#D97706;
            --status-shipped:     #E0F2FE;
            --status-shipped-t:    #0284C7;
            --status-cancelled:   #FEE2E2;
            --status-cancelled-t: #DC2626;

            --font-serif: 'Playfair Display', Georgia, serif;
            --font-sans:  'Poppins', -apple-system, sans-serif;

            --sidebar-w: 250px;
            --sidebar-w-collapsed: 72px;

            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --radius-pill: 100px;

            --shadow-sm: 0 2px 10px rgba(31, 33, 27, 0.04);
            --shadow-md: 0 6px 24px rgba(31, 33, 27, 0.06);
            --shadow-lg: 0 12px 40px rgba(31, 33, 27, 0.09);

            --t-fast: 0.2s;
            --t-med:  0.4s;
            --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
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

        #sidebar.collapsed { width: var(--sidebar-w-collapsed); }

        .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 10px 24px;
            border-bottom: 1px solid var(--beige);
            margin-bottom: 16px;
        }

        .sidebar-logo-icon {
            width: 38px;
            height: 38px;
            background: var(--green-primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .sidebar-logo-icon svg { width: 20px; height: 20px; }

        .sidebar-logo-title {
            font-family: var(--font-serif);
            font-size: 19px;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.1;
        }

        .sidebar-logo-sub {
            font-size: 10px;
            color: var(--text-muted);
            letter-spacing: 0.05em;
        }

        .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .sidebar-nav a {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 11px 14px;
            border-radius: var(--radius-md);
            font-size: 13.5px;
            font-weight: 500;
            color: var(--text-muted);
            transition: all var(--t-fast) var(--ease-out);
            white-space: nowrap;
        }

        .sidebar-nav a i {
            font-size: 16px;
            width: 20px;
            text-align: center;
            flex-shrink: 0;
        }

        .sidebar-nav a:hover {
            background: rgba(111, 150, 56, 0.08);
            color: var(--green-primary);
        }

        .sidebar-nav a.active {
            background: var(--green-pale);
            color: var(--green-primary);
            font-weight: 600;
        }

        .sidebar-nav a.active i { color: var(--green-primary); }

        .nav-badge-orange {
            margin-left: auto;
            background: var(--orange);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: var(--radius-pill);
        }

        /* Refer & Earn Promo Card in Sidebar */
        .sidebar-refer-card {
            background: var(--green-pale);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 16px;
            margin: 16px 0;
            position: relative;
            overflow: hidden;
        }

        .refer-title { font-size: 13px; font-weight: 700; color: var(--green-primary); margin-bottom: 2px; }
        .refer-desc { font-size: 10.5px; color: var(--text-muted); line-height: 1.3; margin-bottom: 10px; }
        .btn-refer {
            background: var(--green-primary);
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: var(--radius-pill);
            display: inline-block;
        }

        .refer-botanical-svg {
            position: absolute;
            bottom: -10px;
            right: -10px;
            width: 60px;
            opacity: 0.25;
            pointer-events: none;
        }

        .sidebar-logout {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 11px 14px;
            border: 1.5px solid var(--beige-mid);
            border-radius: var(--radius-pill);
            color: var(--text-dark);
            font-size: 13.5px;
            font-weight: 500;
            transition: all var(--t-fast);
            justify-content: center;
        }

        .sidebar-logout:hover {
            background: #FEE2E2;
            border-color: #FCA5A5;
            color: #DC2626;
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

        /* Top Header */
        .top-header {
            position: sticky;
            top: 0;
            z-index: 900;
            background: rgba(248, 245, 236, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--beige-mid);
            padding: 16px 36px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }

        .header-left-greeting {
            display: flex;
            flex-direction: column;
        }

        .header-greeting-txt {
            font-family: var(--font-serif);
            font-size: 24px;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.1;
        }

        .header-greeting-sub {
            font-size: 12.5px;
            color: var(--text-muted);
            margin-top: 2px;
        }

        .header-right-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .location-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-pill);
            font-size: 12.5px;
            font-weight: 500;
            color: var(--text-dark);
        }

        .header-icon-btn {
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

        .header-icon-btn:hover {
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

        .user-profile-chip {
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

        .user-profile-chip:hover { border-color: var(--green-primary); }

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
        .user-name-txt { font-size: 13px; font-weight: 600; color: var(--text-dark); }

        /* Dashboard Scroll Content */
        .dashboard-content {
            padding: 28px 36px 60px;
            flex: 1;
        }

        /* 3-Column Layout: Search & Hero & Products | Right Column Widgets */
        .customer-main-grid {
            display: grid;
            grid-template-columns: 1fr 310px;
            gap: 24px;
        }

        /* Large Search Bar Experience */
        .search-hero-box {
            position: relative;
            margin-bottom: 24px;
        }

        .main-search-input-wrap {
            display: flex;
            align-items: center;
            background: var(--cream-light);
            border: 1.5px solid var(--beige-mid);
            border-radius: var(--radius-pill);
            padding: 6px 8px 6px 20px;
            box-shadow: var(--shadow-sm);
            transition: all var(--t-fast);
        }

        .main-search-input-wrap:focus-within {
            border-color: var(--green-primary);
            box-shadow: 0 0 0 3px rgba(53, 92, 36, 0.08);
            background: var(--white);
        }

        .main-search-input-wrap i.search-icon {
            color: var(--text-muted);
            font-size: 15px;
            margin-right: 12px;
        }

        .main-search-input-wrap input {
            border: none;
            background: transparent;
            width: 100%;
            font-size: 14px;
            color: var(--text-dark);
            outline: none;
        }

        .btn-search-go {
            width: 42px;
            height: 42px;
            background: var(--green-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
            transition: all var(--t-fast);
        }

        .btn-search-go:hover {
            background: var(--green-secondary);
            transform: scale(1.05);
        }

        /* Horizontal Benefit/Trust Strip */
        .trust-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 10px 4px;
            font-size: 12px;
            color: var(--text-dark);
            font-weight: 500;
        }

        .trust-strip-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .trust-strip-item i { color: var(--green-primary); font-size: 14px; }

        /* Hero Promotional Banner */
        .customer-hero-banner {
            background: linear-gradient(135deg, #EAF0DF 0%, #FFFDF8 100%);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 32px 36px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
            gap: 24px;
            margin-bottom: 28px;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }

        .hero-banner-txt h2 {
            font-family: var(--font-serif);
            font-size: 34px;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.15;
            margin-bottom: 10px;
        }

        .hero-banner-txt p {
            font-size: 13.5px;
            color: var(--text-muted);
            margin-bottom: 20px;
            max-width: 320px;
        }

        .hero-banner-btns {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .btn-hero-primary {
            background: var(--green-primary);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-pill);
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 14px rgba(53,92,36,0.25);
            transition: all var(--t-fast);
        }

        .btn-hero-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(53,92,36,0.35);
        }

        .btn-hero-outline {
            background: transparent;
            color: var(--green-primary);
            border: 1.5px solid var(--green-primary);
            padding: 11px 22px;
            border-radius: var(--radius-pill);
            font-size: 13px;
            font-weight: 600;
            transition: all var(--t-fast);
        }

        .btn-hero-outline:hover {
            background: var(--green-primary);
            color: white;
        }

        .hero-banner-img-wrap {
            position: relative;
            display: flex;
            justify-content: flex-end;
        }

        .hero-banner-img {
            width: 100%;
            max-width: 320px;
            height: 190px;
            object-fit: cover;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-md);
        }

        /* Shop By Category Section */
        .section-box { margin-bottom: 28px; }

        .section-box-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .section-box-title {
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 700;
            color: var(--text-dark);
        }

        .section-box-link {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            border: 1px solid var(--beige-mid);
            padding: 4px 12px;
            border-radius: var(--radius-pill);
            transition: all var(--t-fast);
        }

        .section-box-link:hover { border-color: var(--green-primary); color: var(--green-primary); }

        .categories-flex {
            display: flex;
            align-items: center;
            gap: 16px;
            overflow-x: auto;
            padding-bottom: 8px;
        }

        .category-circle-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            flex-shrink: 0;
            text-align: center;
        }

        .category-circle-img {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: var(--green-pale);
            border: 1.5px solid var(--beige-mid);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            transition: all var(--t-fast);
        }

        .category-circle-img img { width: 100%; height: 100%; object-fit: cover; }
        .category-circle-item:hover .category-circle-img { transform: scale(1.06); border-color: var(--green-primary); }

        .category-label-txt { font-size: 12px; font-weight: 600; color: var(--text-dark); }

        /* Main Products Section (Fresh Picks For You) */
        .filters-toolbar {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .select-filter {
            padding: 8px 14px;
            border-radius: var(--radius-pill);
            border: 1px solid var(--beige-mid);
            background: var(--white);
            font-size: 12.5px;
            color: var(--text-dark);
            outline: none;
            cursor: pointer;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        }

        /* Product Card - Matching Reference Image */
        .product-card {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: transform var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out);
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
        }

        .product-card-top {
            position: relative;
            height: 160px;
            background: var(--beige);
            overflow: hidden;
        }

        .product-card-top img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s var(--ease-out);
        }

        .product-card:hover .product-card-top img { transform: scale(1.05); }

        .wishlist-btn-top {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            font-size: 13px;
            transition: all var(--t-fast);
            cursor: pointer;
        }

        .wishlist-btn-top:hover, .wishlist-btn-top.active {
            color: #DC2626;
            background: var(--white);
            transform: scale(1.1);
        }

        .product-card-body {
            padding: 14px 16px 16px;
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        .product-card-name {
            font-family: var(--font-serif);
            font-size: 15px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .product-card-farm {
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 10px;
        }

        .product-card-price {
            font-size: 16px;
            font-weight: 700;
            color: var(--green-primary);
            margin-bottom: 12px;
        }

        .product-card-unit { font-size: 12px; font-weight: 400; color: var(--text-muted); }

        .btn-add-cart-card {
            width: 100%;
            padding: 10px;
            background: var(--green-primary);
            color: white;
            border-radius: var(--radius-pill);
            font-size: 12.5px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: auto;
            transition: all var(--t-fast);
        }

        .btn-add-cart-card:hover {
            background: var(--green-secondary);
            transform: translateY(-1px);
        }

        /* Bottom Section: Why Choose FreshField */
        .why-freshfield-box {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 32px;
        }

        .why-item { display: flex; align-items: center; gap: 10px; }
        .why-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--green-pale); display: flex; align-items: center; justify-content: center; color: var(--green-primary); font-size: 14px; }
        .why-txt strong { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); }
        .why-txt span { font-size: 11px; color: var(--text-muted); }

        /* ============================================================
           RIGHT-SIDE CUSTOMER WIDGETS COLUMN
           ============================================================ */
        .customer-right-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .widget-box {
            background: var(--cream-light);
            border: 1px solid var(--beige-mid);
            border-radius: var(--radius-lg);
            padding: 20px;
            box-shadow: var(--shadow-sm);
            position: relative;
            overflow: hidden;
        }

        /* Widget 1: My Balance */
        .balance-header { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
        .balance-val { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--text-dark); line-height: 1; margin-bottom: 2px; }
        .balance-sub { font-size: 11px; color: var(--text-muted); margin-bottom: 14px; }
        .btn-balance-details { font-size: 11.5px; font-weight: 600; color: var(--text-dark); border: 1px solid var(--beige-mid); padding: 5px 14px; border-radius: var(--radius-pill); background: var(--white); }

        /* Widget 2: My Orders Breakdown */
        .widget-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .widget-title-txt { font-family: var(--font-serif); font-size: 16px; font-weight: 700; color: var(--text-dark); }
        .widget-title-link { font-size: 11px; font-weight: 600; color: var(--text-muted); }

        .order-status-list { display: flex; flex-direction: column; gap: 10px; }
        .order-status-row { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; }
        .order-status-left { display: flex; align-items: center; gap: 8px; color: var(--text-dark); }
        .order-status-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .order-status-count { font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; background: var(--beige); display: flex; align-items: center; justify-content: center; }

        /* Widget 3: Recent Order items */
        .mini-order-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid var(--beige);
        }
        .mini-order-item:last-child { border-bottom: none; }
        .mini-order-img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: var(--beige); flex-shrink: 0; }
        .mini-order-info { flex: 1; min-width: 0; }
        .mini-order-name { font-size: 12.5px; font-weight: 600; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mini-order-farm { font-size: 10.5px; color: var(--text-muted); }
        .mini-order-price { font-size: 11.5px; font-weight: 600; color: var(--green-primary); }

        /* Widget 4: Become a Member */
        .member-box { background: var(--green-pale); border-color: var(--green-soft); }
        .member-title { font-size: 14px; font-weight: 700; color: var(--green-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .member-desc { font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px; }
        .btn-member-join { background: var(--green-primary); color: white; font-size: 11.5px; font-weight: 600; padding: 6px 16px; border-radius: var(--radius-pill); }

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

        /* Sub-Pages (Orders, Wishlist, Profile) */
        .page-content { display: none; }
        .page-content.active { display: block; animation: pageFade 0.4s var(--ease-out); }

        @keyframes pageFade {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */
        @media (max-width: 1100px) {
            .customer-main-grid { grid-template-columns: 1fr; }
            .customer-right-column { display: grid; grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 768px) {
            #sidebar { transform: translateX(-100%); }
            #sidebar.open { transform: translateX(0); }
            #main-wrapper { margin-left: 0 !important; }
            .top-header { padding: 14px 20px; flex-direction: column; align-items: flex-start; gap: 10px; }
            .dashboard-content { padding: 20px; }
            .customer-hero-banner { grid-template-columns: 1fr; padding: 24px; }
            .hero-banner-img-wrap { display: none; }
            .customer-right-column { grid-template-columns: 1fr; }
            .product-grid { grid-template-columns: repeat(2, 1fr); }
            .why-freshfield-box { flex-direction: column; align-items: flex-start; gap: 14px; }
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
            <div>
                <div class="sidebar-logo-title">FreshField</div>
                <div class="sidebar-logo-sub">Farm to Your Table</div>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav">
            <a href="#" data-page="browse" class="active">
                <i class="fas fa-th-large"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" data-page="browse">
                <i class="fas fa-store"></i>
                <span>Browse Products</span>
            </a>
            <a href="#" data-page="categories">
                <i class="fas fa-th-list"></i>
                <span>Categories</span>
            </a>
            <a href="#" data-page="orders">
                <i class="fas fa-shopping-bag"></i>
                <span>My Orders</span>
            </a>
            <a href="#" data-page="wishlist">
                <i class="far fa-heart"></i>
                <span>Wishlist</span>
            </a>
            <a href="#" onclick="cart.toggle(); return false;">
                <i class="fas fa-shopping-basket"></i>
                <span>Cart</span>
                <span class="nav-badge-orange" id="cart-count-badge" style="display:none;">0</span>
            </a>
            <a href="#" data-page="profile">
                <i class="fas fa-cog"></i>
                <span>Settings & Profile</span>
            </a>
        </nav>

        <!-- Refer & Earn Card -->
        <div class="sidebar-refer-card">
            <div class="refer-title">Refer & Earn</div>
            <div class="refer-desc">Invite your friends and earn ₹100 FreshField Cash</div>
            <a href="#" class="btn-refer">Refer Now</a>
            <svg class="refer-botanical-svg" viewBox="0 0 120 120" fill="none"><path d="M20 100 C20 60 60 30 100 20" stroke="#6F9638" stroke-width="1.5"/><path d="M40 80 C40 80 20 60 40 40 C40 40 60 60 40 80Z" fill="#A8BF72"/></svg>
        </div>

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
            <div class="header-left-greeting">
                <h1 class="header-greeting-txt">Good morning, <span id="user-greeting">Vansh</span> 🌿</h1>
                <p class="header-greeting-sub">What are you looking for today?</p>
            </div>

            <div class="header-right-actions">
                <!-- Location Chip -->
                <div class="location-chip">
                    <i class="fas fa-map-marker-alt" style="color:var(--green-primary)"></i>
                    <span>Rajkot, Gujarat</span>
                    <i class="fas fa-chevron-down" style="font-size:10px; opacity:0.6;"></i>
                </div>

                <!-- Cart Button -->
                <button class="header-icon-btn" onclick="cart.toggle()" aria-label="Open cart">
                    <i class="fas fa-shopping-basket"></i>
                    <span class="noti-badge" id="header-cart-badge" style="display:none;">0</span>
                </button>

                <!-- Notification Bell -->
                <button class="header-icon-btn" aria-label="Notifications">
                    <i class="fas fa-bell"></i>
                    <span class="noti-badge">5</span>
                </button>

                <!-- Customer Profile Chip -->
                <div class="user-profile-chip" onclick="customer.showPage('profile')">
                    <div class="user-avatar" id="header-avatar">
                        <span>VG</span>
                    </div>
                    <span class="user-name-txt" id="header-user-name">Vansh Gohel</span>
                    <i class="fas fa-chevron-down" style="font-size:10px; color:var(--text-muted);"></i>
                </div>
            </div>
        </header>

        <!-- Main Workspace Content -->
        <main class="dashboard-content">

            <!-- PAGE: BROWSE / MAIN CUSTOMER MARKETPLACE (Matches Reference Image) -->
            <div id="page-browse" class="page-content active">

                <div class="customer-main-grid">

                    <!-- Left/Center Column -->
                    <div>
                        <!-- Search & Trust Strip -->
                        <div class="search-hero-box">
                            <div class="main-search-input-wrap">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" id="search-input" placeholder="Search for fresh vegetables, fruits, grains, and more..." oninput="customer.handleSearch()">
                                <button class="btn-search-go" onclick="customer.handleSearch()"><i class="fas fa-search"></i></button>
                            </div>

                            <div class="trust-strip">
                                <div class="trust-strip-item"><i class="fas fa-seedling"></i> Direct from Farmers</div>
                                <div class="trust-strip-item"><i class="fas fa-leaf"></i> 100% Fresh Produce</div>
                                <div class="trust-strip-item"><i class="fas fa-lock"></i> Safe & Secure Payments</div>
                                <div class="trust-strip-item"><i class="fas fa-truck"></i> On-time Delivery</div>
                            </div>
                        </div>

                        <!-- Hero Promotional Banner -->
                        <div class="customer-hero-banner">
                            <div class="hero-banner-txt">
                                <h2>Eat Fresh,<br>Live Healthy</h2>
                                <p>Handpicked produce from local farms, delivered fresh to your doorstep.</p>
                                <div class="hero-banner-btns">
                                    <a href="#product-grid" class="btn-hero-primary">Shop Now</a>
                                    <a href="#categories-list" class="btn-hero-outline">Explore Farms</a>
                                </div>
                            </div>
                            <div class="hero-banner-img-wrap">
                                <img src="assets/images/hero-produce.png" class="hero-banner-img" alt="Fresh organic vegetables basket">
                            </div>
                        </div>

                        <!-- Shop by Category -->
                        <div class="section-box" id="categories-list">
                            <div class="section-box-header">
                                <h3 class="section-box-title">Shop by Category</h3>
                                <a href="#" class="section-box-link" onclick="customer.filterCategory('all'); return false;">View All</a>
                            </div>

                            <div class="categories-flex">
                                <div class="category-circle-item" onclick="customer.filterCategory('Vegetables')">
                                    <div class="category-circle-img"><img src="assets/images/tomatoes.png" alt="Vegetables"></div>
                                    <span class="category-label-txt">Vegetables</span>
                                </div>

                                <div class="category-circle-item" onclick="customer.filterCategory('Fruits')">
                                    <div class="category-circle-img"><img src="assets/images/hero-produce.png" alt="Fruits"></div>
                                    <span class="category-label-txt">Fruits</span>
                                </div>

                                <div class="category-circle-item" onclick="customer.filterCategory('Leafy Greens')">
                                    <div class="category-circle-img"><img src="assets/images/spinach.png" alt="Leafy Greens"></div>
                                    <span class="category-label-txt">Leafy Greens</span>
                                </div>

                                <div class="category-circle-item" onclick="customer.filterCategory('Herbs')">
                                    <div class="category-circle-img"><img src="assets/images/spinach.png" alt="Herbs"></div>
                                    <span class="category-label-txt">Herbs</span>
                                </div>

                                <div class="category-circle-item" onclick="customer.filterCategory('Organic')">
                                    <div class="category-circle-img"><img src="assets/images/carrots.png" alt="Organic"></div>
                                    <span class="category-label-txt">Organic</span>
                                </div>
                            </div>
                        </div>

                        <!-- Fresh Picks For You (Main Products Grid) -->
                        <div class="section-box">
                            <div class="section-box-header">
                                <h3 class="section-box-title">Fresh Picks For You</h3>
                                <div class="filters-toolbar">
                                    <select id="category-filter" class="select-filter" onchange="customer.loadProducts()">
                                        <option value="">All Categories</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Leafy Greens">Leafy Greens</option>
                                        <option value="Organic">Organic</option>
                                    </select>
                                    <select id="sort-filter" class="select-filter" onchange="customer.loadProducts()">
                                        <option value="newest">Newest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Dynamic Products Grid -->
                            <div id="product-grid" class="product-grid">
                                <!-- Loaded by customer.js -->
                            </div>
                            <div id="product-pagination" style="display:flex; justify-content:center; gap:8px; margin-top:24px;"></div>
                        </div>

                        <!-- Why Choose FreshField Bottom Strip -->
                        <div class="why-freshfield-box">
                            <div class="why-item">
                                <div class="why-icon"><i class="fas fa-tractor"></i></div>
                                <div class="why-txt"><strong>Direct from Farm</strong><span>No middlemen markups</span></div>
                            </div>
                            <div class="why-item">
                                <div class="why-icon"><i class="fas fa-award"></i></div>
                                <div class="why-txt"><strong>Best Quality</strong><span>Handpicked fresh produce</span></div>
                            </div>
                            <div class="why-item">
                                <div class="why-icon"><i class="fas fa-tags"></i></div>
                                <div class="why-txt"><strong>Fair Prices</strong><span>Better for you & farmers</span></div>
                            </div>
                            <div class="why-item">
                                <div class="why-icon"><i class="fas fa-globe-asia"></i></div>
                                <div class="why-txt"><strong>Sustainable Choice</strong><span>Good for the planet</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column Widgets (Matches Reference Image) -->
                    <div class="customer-right-column">
                        <!-- Widget 1: My Balance -->
                        <div class="widget-box">
                            <div class="balance-header">
                                <i class="fas fa-wallet" style="color:var(--green-primary)"></i>
                                <span>My Balance</span>
                            </div>
                            <div class="balance-val">₹250.00</div>
                            <div class="balance-sub">FreshField Cash</div>
                            <button class="btn-balance-details">View Details</button>
                        </div>

                        <!-- Widget 2: My Orders Status Summary -->
                        <div class="widget-box">
                            <div class="widget-title-row">
                                <span class="widget-title-txt">My Orders</span>
                                <a href="#" onclick="customer.showPage('orders')" class="widget-title-link">View All</a>
                            </div>

                            <div class="order-status-list">
                                <div class="order-status-row">
                                    <div class="order-status-left"><div class="order-status-icon" style="background:#FDE8D0;color:#D97706;"><i class="fas fa-clock"></i></div><span>Pending</span></div>
                                    <span class="order-status-count">2</span>
                                </div>

                                <div class="order-status-row">
                                    <div class="order-status-left"><div class="order-status-icon" style="background:#FDE8D0;color:#D97706;"><i class="fas fa-cog"></i></div><span>Processing</span></div>
                                    <span class="order-status-count">3</span>
                                </div>

                                <div class="order-status-row">
                                    <div class="order-status-left"><div class="order-status-icon" style="background:#E0F2FE;color:#0284C7;"><i class="fas fa-truck"></i></div><span>Shipped</span></div>
                                    <span class="order-status-count">1</span>
                                </div>

                                <div class="order-status-row">
                                    <div class="order-status-left"><div class="order-status-icon" style="background:#D6E4B8;color:#355C24;"><i class="fas fa-check"></i></div><span>Delivered</span></div>
                                    <span class="order-status-count">8</span>
                                </div>

                                <div class="order-status-row">
                                    <div class="order-status-left"><div class="order-status-icon" style="background:#FEE2E2;color:#DC2626;"><i class="fas fa-times"></i></div><span>Cancelled</span></div>
                                    <span class="order-status-count">0</span>
                                </div>
                            </div>
                        </div>

                        <!-- Widget 3: Recent Orders -->
                        <div class="widget-box">
                            <div class="widget-title-row">
                                <span class="widget-title-txt">Recent Order</span>
                            </div>

                            <div class="mini-order-item">
                                <img src="assets/images/tomatoes.png" class="mini-order-img" alt="Tomatoes">
                                <div class="mini-order-info">
                                    <div class="mini-order-name">Farm Fresh Tomatoes</div>
                                    <div class="mini-order-farm">Green Valley Farm</div>
                                    <div class="mini-order-price">₹120.00 &bull; 2 kg</div>
                                </div>
                                <span class="status-badge-pill delivered">Delivered</span>
                            </div>

                            <div class="mini-order-item">
                                <img src="assets/images/hero-produce.png" class="mini-order-img" alt="Potatoes">
                                <div class="mini-order-info">
                                    <div class="mini-order-name">Organic Potatoes</div>
                                    <div class="mini-order-farm">Earth Harvest Farm</div>
                                    <div class="mini-order-price">₹100.00 &bull; 2 kg</div>
                                </div>
                                <span class="status-badge-pill processing">Processing</span>
                            </div>

                            <div style="text-align:right; margin-top:10px;">
                                <a href="#" onclick="customer.showPage('orders')" style="font-size:11.5px; font-weight:600; color:var(--text-muted);">View All Orders &rarr;</a>
                            </div>
                        </div>

                        <!-- Widget 4: Become a Member -->
                        <div class="widget-box member-box">
                            <div class="member-title"><i class="fas fa-crown"></i> Become a Member</div>
                            <div class="member-desc">Join FreshField Club and get exclusive offers & cashback!</div>
                            <button class="btn-member-join">Join Now</button>
                        </div>
                    </div>

                </div>

            </div>

            <!-- PAGE: ORDERS -->
            <div id="page-orders" class="page-content">
                <div class="section-box-header" style="margin-bottom:20px;">
                    <div>
                        <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">My Order History</h2>
                        <p style="font-size:13px; color:var(--text-muted);">Track your recent farm purchases and delivery status.</p>
                    </div>
                </div>

                <div class="widget-box">
                    <div id="customer-orders">
                        <p style="text-align:center; padding:30px; color:var(--text-muted);">Loading orders...</p>
                    </div>
                </div>
            </div>

            <!-- PAGE: WISHLIST -->
            <div id="page-wishlist" class="page-content">
                <div class="section-box-header" style="margin-bottom:20px;">
                    <div>
                        <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">My Saved Produce Wishlist</h2>
                        <p style="font-size:13px; color:var(--text-muted);">Products you saved for future farm orders.</p>
                    </div>
                </div>

                <div id="wishlist-grid" class="product-grid">
                    <p style="text-align:center; padding:30px; color:var(--text-muted); grid-column:1/-1;">Loading wishlist...</p>
                </div>
            </div>

            <!-- PAGE: PROFILE & SETTINGS -->
            <div id="page-profile" class="page-content">
                <div class="section-box-header" style="margin-bottom:20px;">
                    <div>
                        <h2 style="font-family:var(--font-serif); font-size:24px; color:var(--text-dark);">Account Profile & Settings</h2>
                        <p style="font-size:13px; color:var(--text-muted);">Manage your personal details and delivery addresses.</p>
                    </div>
                </div>

                <div class="widget-box" style="max-width:700px;">
                    <form id="profile-form" onsubmit="event.preventDefault(); customer.updateProfile();">
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <div>
                                <label style="font-size:12.5px; font-weight:600; display:block; margin-bottom:6px;">Full Name</label>
                                <input type="text" id="profile-name" class="main-search-input-wrap" style="border-radius:8px; padding:10px 14px;" required>
                            </div>

                            <div>
                                <label style="font-size:12.5px; font-weight:600; display:block; margin-bottom:6px;">Email Address</label>
                                <input type="email" id="profile-email" class="main-search-input-wrap" style="border-radius:8px; padding:10px 14px; background:var(--cream);" readonly>
                            </div>

                            <div>
                                <label style="font-size:12.5px; font-weight:600; display:block; margin-bottom:6px;">Phone Number</label>
                                <input type="text" id="profile-phone" class="main-search-input-wrap" style="border-radius:8px; padding:10px 14px;">
                            </div>

                            <div>
                                <label style="font-size:12.5px; font-weight:600; display:block; margin-bottom:6px;">Delivery Address</label>
                                <input type="text" id="profile-address" class="main-search-input-wrap" style="border-radius:8px; padding:10px 14px;">
                            </div>

                            <div>
                                <label style="font-size:12.5px; font-weight:600; display:block; margin-bottom:6px;">Profile Picture</label>
                                <div id="profile-upload-area" style="border:2px dashed var(--beige-mid); padding:20px; border-radius:12px; text-align:center; cursor:pointer;">
                                    <i class="fas fa-cloud-upload-alt" style="font-size:24px; color:var(--green-primary);"></i>
                                    <p style="font-size:12px; font-weight:600; margin-top:4px;">Upload Profile Image</p>
                                    <input type="file" id="profile-image" accept="image/*" style="display:none;">
                                </div>
                                <div id="profile-preview"></div>
                            </div>

                            <button type="submit" class="btn-hero-primary" style="margin-top:10px; width:fit-content;">Save Profile</button>
                        </div>
                    </form>
                </div>
            </div>

        </main>
    </div>

</div>

<!-- Cart Drawer Container Trigger -->
<div id="toast-container" role="alert" aria-live="polite"></div>

<!-- Scripts -->
<script src="js/toast.js"></script>
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
<script src="js/cart.js"></script>
<script src="js/customer.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    customer.init();
});
</script>
</body>
</html>`;

fs.writeFileSync('C:/farmer-marketplace/client/customer-dashboard.html', customerDashboardHtml, 'utf8');
console.log('Successfully updated customer-dashboard.html!');
