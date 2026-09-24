const fs = require('fs');
const path = require('path');
const { CompactDiagram } = require('./compact_diagram_builder');

// Helper to add attributes in 2 tidy columns next to an entity
// colWidth: 120, rowHeight: 31, h: 24 (leaves 7px vertical gap, zero overlap!)
function addAttrGrid(diag, entity, attrs, startX, startY, colWidth = 120, rowHeight = 32, cols = 2) {
    attrs.forEach((att, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const ax = startX + c * (colWidth + 10);
        const ay = startY + r * rowHeight;
        const a = diag.addAttribute(att.name, ax, ay, att.isPk, att.isFk, colWidth, 24);
        diag.connectAttr(entity.id, a.id);
    });
}

// =========================================================================
// 1. GENERATE COMPACT FARMER ER DIAGRAM (farmerd.drawio)
// =========================================================================
function generateCompactFarmer() {
    const diag = new CompactDiagram('Farmer Panel ER Diagram', 1700, 960);

    diag.addHeader(
        'Farmer Panel - Entity-Relationship Diagram',
        'Database: farmer_marketplace | (PK) = Primary Key | (FK) = Foreign Key | Monochrome'
    );
    diag.addLegend(1260, 16);

    // --- COLUMN 1: LEFT (x: 30 - 450) ---
    // NOTIFICATIONS (Top-Left)
    const entNotif = diag.addEntity('NOTIFICATIONS', 280, 105, 135, 36);
    addAttrGrid(diag, entNotif, [
        { name: 'id (PK)', isPk: true },
        { name: 'user_id (FK)', isFk: true },
        { name: 'title' },
        { name: 'message' },
        { name: 'type' },
        { name: 'is_read' },
        { name: 'created_at' }
    ], 25, 65, 115, 31, 2);

    // Relationship: FARMER RECEIVES NOTIFICATIONS
    const relReceives = diag.addRelationship('RECEIVES', 290, 215, 115, 38);
    diag.connectRel(entNotif.id, relReceives.id, 'N');

    // FARMER (users) (Mid-Left)
    const entFarmer = diag.addEntity('FARMER (users)', 280, 395, 135, 36);
    addAttrGrid(diag, entFarmer, [
        { name: 'id (PK)', isPk: true },
        { name: 'name' },
        { name: 'email' },
        { name: 'phone' },
        { name: 'address' },
        { name: 'farm_name' },
        { name: 'farm_location' },
        { name: 'bio' },
        { name: 'profile_image' },
        { name: 'created_at' }
    ], 25, 335, 115, 31, 2);

    diag.connectRel(entFarmer.id, relReceives.id, '1');

    // Relationship: FARMER LOGS ACTIVITY_LOGS
    const relLogs = diag.addRelationship('LOGS', 290, 580, 115, 38);
    diag.connectRel(entFarmer.id, relLogs.id, '1');

    // ACTIVITY_LOGS (Bottom-Left)
    const entLogs = diag.addEntity('ACTIVITY_LOGS', 280, 755, 135, 36);
    addAttrGrid(diag, entLogs, [
        { name: 'id (PK)', isPk: true },
        { name: 'user_id (FK)', isFk: true },
        { name: 'action' },
        { name: 'entity_type' },
        { name: 'entity_id' },
        { name: 'details' },
        { name: 'ip_address' },
        { name: 'created_at' }
    ], 25, 695, 115, 31, 2);

    diag.connectRel(entLogs.id, relLogs.id, 'N');

    // --- COLUMN 1 to COLUMN 2 RELATIONSHIPS ---
    // MANAGES between FARMER and PRODUCTS
    const relManages = diag.addRelationship('MANAGES', 450, 245, 110, 38);
    diag.connectRel(entFarmer.id, relManages.id, '1');

    // DISPATCHES between FARMER and DELIVERY_ASSIGNMENTS
    const relDispatches = diag.addRelationship('DISPATCHES', 435, 460, 115, 38);
    diag.connectRel(entFarmer.id, relDispatches.id, '1');

    // --- COLUMN 2: CENTER (x: 580 - 1060) ---
    // PRODUCTS (Top-Center)
    const entProducts = diag.addEntity('PRODUCTS', 590, 120, 135, 36);
    diag.connectRel(entProducts.id, relManages.id, 'N');
    addAttrGrid(diag, entProducts, [
        { name: 'id (PK)', isPk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'name' },
        { name: 'category' },
        { name: 'price' },
        { name: 'quantity' },
        { name: 'unit' },
        { name: 'description' },
        { name: 'image_url' },
        { name: 'is_available' }
    ], 750, 60, 120, 31, 2);

    // DELIVERY_ASSIGNMENTS (Mid-Center)
    const entDelivery = diag.addEntity('DELIVERY_ASSIGNMENTS', 570, 460, 165, 36);
    diag.connectRel(entDelivery.id, relDispatches.id, 'N');
    addAttrGrid(diag, entDelivery, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'delivery_person_name' },
        { name: 'delivery_person_phone' },
        { name: 'vehicle_type' },
        { name: 'vehicle_number' },
        { name: 'tracking_token' },
        { name: 'tracking_active' },
        { name: 'status' }
    ], 750, 395, 135, 31, 2);

    // Relationship: RECORDS_GPS between DELIVERY_ASSIGNMENTS & DELIVERY_LOCATIONS
    const relRecords = diag.addRelationship('RECORDS_GPS', 590, 605, 115, 38);
    diag.connectRel(entDelivery.id, relRecords.id, '1');

    // DELIVERY_LOCATIONS (Bottom-Center)
    const entLocations = diag.addEntity('DELIVERY_LOCATIONS', 570, 755, 155, 36);
    diag.connectRel(entLocations.id, relRecords.id, 'N');
    addAttrGrid(diag, entLocations, [
        { name: 'id (PK)', isPk: true },
        { name: 'assignment_id (FK)', isFk: true },
        { name: 'latitude' },
        { name: 'longitude' },
        { name: 'accuracy' },
        { name: 'speed' },
        { name: 'heading' },
        { name: 'recorded_at' }
    ], 750, 695, 130, 31, 2);

    // --- COLUMN 2 to COLUMN 3 RELATIONSHIPS ---
    // FULFILLS between PRODUCTS and ORDER_ITEMS
    const relFulfills = diag.addRelationship('FULFILLS', 1060, 120, 110, 38);
    diag.connectRel(entProducts.id, relFulfills.id, '1');

    // ASSIGNED_FOR between DELIVERY_ASSIGNMENTS and ORDERS
    const relAssigned = diag.addRelationship('ASSIGNED_FOR', 1060, 460, 115, 38);
    diag.connectRel(entDelivery.id, relAssigned.id, '1');

    // --- COLUMN 3: RIGHT (x: 1200 - 1680) ---
    // ORDER_ITEMS (Top-Right)
    const entOrderItems = diag.addEntity('ORDER_ITEMS', 1210, 120, 135, 36);
    diag.connectRel(entOrderItems.id, relFulfills.id, 'N');
    addAttrGrid(diag, entOrderItems, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'quantity' },
        { name: 'price' },
        { name: 'total' }
    ], 1375, 75, 120, 31, 2);

    // Relationship: ORDERS CONTAINS ORDER_ITEMS
    const relContains = diag.addRelationship('CONTAINS', 1225, 280, 105, 38);
    diag.connectRel(entOrderItems.id, relContains.id, 'N');

    // ORDERS (Mid-Right)
    const entOrders = diag.addEntity('ORDERS', 1210, 460, 135, 36);
    diag.connectRel(entOrders.id, relContains.id, '1');
    diag.connectRel(entOrders.id, relAssigned.id, '1');
    addAttrGrid(diag, entOrders, [
        { name: 'id (PK)', isPk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'order_number' },
        { name: 'total_amount' },
        { name: 'status' },
        { name: 'shipping_address' },
        { name: 'destination_lat' },
        { name: 'destination_lng' },
        { name: 'payment_method' },
        { name: 'payment_status' }
    ], 1375, 395, 125, 31, 2);

    // Relationship: ORDERS HAS_TIMELINE ORDER_STATUS_HISTORY
    const relHistory = diag.addRelationship('HAS_TIMELINE', 1225, 610, 115, 38);
    diag.connectRel(entOrders.id, relHistory.id, '1');

    // ORDER_STATUS_HISTORY (Bottom-Right)
    const entHistory = diag.addEntity('ORDER_STATUS_HISTORY', 1195, 755, 165, 36);
    diag.connectRel(entHistory.id, relHistory.id, 'N');
    addAttrGrid(diag, entHistory, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'updated_by (FK)', isFk: true },
        { name: 'status' },
        { name: 'note' },
        { name: 'updated_by_role' },
        { name: 'created_at' }
    ], 1385, 695, 125, 31, 2);

    return diag.toString();
}

// =========================================================================
// 2. GENERATE COMPACT CUSTOMER ER DIAGRAM (customerd.drawio)
// =========================================================================
function generateCompactCustomer() {
    const diag = new CompactDiagram('Customer Panel ER Diagram', 1700, 960);

    diag.addHeader(
        'Customer Panel - Entity-Relationship Diagram',
        'Database: farmer_marketplace | (PK) = Primary Key | (FK) = Foreign Key | Monochrome'
    );
    diag.addLegend(1260, 16);

    // --- COLUMN 1: LEFT (Customer, Notifications, Banners) ---
    // NOTIFICATIONS (Top-Left)
    const entNotif = diag.addEntity('NOTIFICATIONS', 280, 95, 135, 36);
    addAttrGrid(diag, entNotif, [
        { name: 'id (PK)', isPk: true },
        { name: 'user_id (FK)', isFk: true },
        { name: 'title' },
        { name: 'message' },
        { name: 'type' },
        { name: 'is_read' },
        { name: 'created_at' }
    ], 25, 55, 115, 31, 2);

    const relReceives = diag.addRelationship('RECEIVES', 290, 200, 115, 38);
    diag.connectRel(entNotif.id, relReceives.id, 'N');

    // CUSTOMER (users) (Mid-Left)
    const entCustomer = diag.addEntity('CUSTOMER (users)', 270, 340, 145, 36);
    diag.connectRel(entCustomer.id, relReceives.id, '1');
    addAttrGrid(diag, entCustomer, [
        { name: 'id (PK)', isPk: true },
        { name: 'name' },
        { name: 'email' },
        { name: 'phone' },
        { name: 'address' },
        { name: 'profile_image' },
        { name: 'created_at' }
    ], 25, 290, 110, 31, 2);

    // BANNERS (Bottom-Left)
    const relViewsPromo = diag.addRelationship('VIEWS_OFFERS', 285, 490, 115, 38);
    diag.connectRel(entCustomer.id, relViewsPromo.id, 'N');

    const entBanners = diag.addEntity('BANNERS', 280, 630, 135, 36);
    diag.connectRel(entBanners.id, relViewsPromo.id, 'M');
    addAttrGrid(diag, entBanners, [
        { name: 'id (PK)', isPk: true },
        { name: 'title' },
        { name: 'subtitle' },
        { name: 'image_url' },
        { name: 'link_url' },
        { name: 'is_active' }
    ], 25, 590, 115, 31, 2);

    // --- COLUMN 1 to COLUMN 2 RELATIONSHIPS ---
    // PLACES: Customer -> Orders
    const relPlaces = diag.addRelationship('PLACES', 445, 340, 105, 38);
    diag.connectRel(entCustomer.id, relPlaces.id, '1');

    // WRITES: Customer -> Reviews
    const relWrites = diag.addRelationship('WRITES', 445, 180, 105, 38);
    diag.connectRel(entCustomer.id, relWrites.id, '1');

    // SAVES_TO: Customer -> Wishlist
    const relSavesTo = diag.addRelationship('SAVES_TO', 445, 470, 105, 38);
    diag.connectRel(entCustomer.id, relSavesTo.id, '1');

    // --- COLUMN 2: CENTER (Reviews, Orders, Wishlist, Delivery) ---
    // REVIEWS (Top-Center)
    const entReviews = diag.addEntity('REVIEWS', 585, 180, 130, 36);
    diag.connectRel(entReviews.id, relWrites.id, 'N');
    addAttrGrid(diag, entReviews, [
        { name: 'id (PK)', isPk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'rating' },
        { name: 'comment' },
        { name: 'created_at' }
    ], 735, 140, 120, 31, 2);

    // ORDERS (Mid-Center)
    const entOrders = diag.addEntity('ORDERS', 585, 340, 130, 36);
    diag.connectRel(entOrders.id, relPlaces.id, 'N');
    addAttrGrid(diag, entOrders, [
        { name: 'id (PK)', isPk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'order_number' },
        { name: 'total_amount' },
        { name: 'status' },
        { name: 'shipping_address' },
        { name: 'destination_lat' },
        { name: 'destination_lng' },
        { name: 'payment_method' },
        { name: 'payment_status' }
    ], 735, 275, 125, 31, 2);

    // WISHLIST (Mid-Bottom Center)
    const entWishlist = diag.addEntity('WISHLIST', 585, 470, 130, 34);
    diag.connectRel(entWishlist.id, relSavesTo.id, 'N');
    addAttrGrid(diag, entWishlist, [
        { name: 'id (PK)', isPk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'created_at' }
    ], 735, 455, 125, 31, 2);

    // DELIVERY_ASSIGNMENTS (Bottom Center)
    const relTracksDelivery = diag.addRelationship('TRACKS', 600, 580, 100, 38);
    diag.connectRel(entOrders.id, relTracksDelivery.id, '1');

    const entDelivery = diag.addEntity('DELIVERY_ASSIGNMENTS', 570, 700, 160, 36);
    diag.connectRel(entDelivery.id, relTracksDelivery.id, '1');
    addAttrGrid(diag, entDelivery, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'delivery_person_name' },
        { name: 'delivery_person_phone' },
        { name: 'vehicle_type' },
        { name: 'tracking_token' },
        { name: 'status' }
    ], 750, 650, 130, 31, 2);

    // STREAMS_GPS -> DELIVERY_LOCATIONS
    const relStreamsGps = diag.addRelationship('STREAMS_GPS', 600, 810, 115, 38);
    diag.connectRel(entDelivery.id, relStreamsGps.id, '1');

    const entLocations = diag.addEntity('DELIVERY_LOCATIONS', 575, 900, 150, 34);
    diag.connectRel(entLocations.id, relStreamsGps.id, 'N');
    addAttrGrid(diag, entLocations, [
        { name: 'id (PK)', isPk: true },
        { name: 'assignment_id (FK)', isFk: true },
        { name: 'latitude' },
        { name: 'longitude' },
        { name: 'speed' },
        { name: 'accuracy' },
        { name: 'recorded_at' }
    ], 750, 860, 125, 31, 2);

    // --- COLUMN 2 to COLUMN 3 RELATIONSHIPS ---
    // REVIEWS to PRODUCTS (REVIEWS_FOR)
    const relReviewedFor = diag.addRelationship('REVIEWS_FOR', 1015, 180, 115, 38);
    diag.connectRel(entReviews.id, relReviewedFor.id, 'N');

    // ORDERS to ORDER_ITEMS (CONTAINS)
    const relContains = diag.addRelationship('CONTAINS', 1020, 340, 105, 38);
    diag.connectRel(entOrders.id, relContains.id, '1');

    // WISHLIST to PRODUCTS (BOOKMARKED_AS)
    const relBookmarked = diag.addRelationship('BOOKMARKED_AS', 1015, 470, 120, 38);
    diag.connectRel(entWishlist.id, relBookmarked.id, 'N');

    // ORDERS to ORDER_STATUS_HISTORY (HAS_TIMELINE)
    const relTimeline = diag.addRelationship('HAS_TIMELINE', 1015, 580, 115, 38);
    diag.connectRel(entOrders.id, relTimeline.id, '1');

    // --- COLUMN 3: RIGHT (Products, Order_Items, Status History) ---
    // PRODUCTS (Top-Right)
    const entProducts = diag.addEntity('PRODUCTS', 1200, 180, 135, 36);
    diag.connectRel(entProducts.id, relReviewedFor.id, '1');
    diag.connectRel(entProducts.id, relBookmarked.id, '1');
    addAttrGrid(diag, entProducts, [
        { name: 'id (PK)', isPk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'name' },
        { name: 'category' },
        { name: 'price' },
        { name: 'quantity' },
        { name: 'unit' },
        { name: 'description' },
        { name: 'image_url' },
        { name: 'is_available' }
    ], 1365, 115, 120, 31, 2);

    // Relationship: PRODUCTS ORDERED_AS ORDER_ITEMS
    const relOrderedAs = diag.addRelationship('ORDERED_AS', 1215, 260, 110, 36);
    diag.connectRel(entProducts.id, relOrderedAs.id, '1');

    // ORDER_ITEMS (Mid-Right)
    const entOrderItems = diag.addEntity('ORDER_ITEMS', 1200, 340, 135, 36);
    diag.connectRel(entOrderItems.id, relContains.id, 'N');
    diag.connectRel(entOrderItems.id, relOrderedAs.id, 'N');
    addAttrGrid(diag, entOrderItems, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'quantity' },
        { name: 'price' },
        { name: 'total' }
    ], 1365, 290, 120, 31, 2);

    // ORDER_STATUS_HISTORY (Bottom-Right)
    const entHistory = diag.addEntity('ORDER_STATUS_HISTORY', 1180, 700, 165, 36);
    diag.connectRel(entHistory.id, relTimeline.id, 'N');
    addAttrGrid(diag, entHistory, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'status' },
        { name: 'note' },
        { name: 'created_at' }
    ], 1370, 660, 125, 31, 2);

    return diag.toString();
}

const farmerXml = generateCompactFarmer();
const customerXml = generateCompactCustomer();

const rootDir = path.join(__dirname, '..');
const dbDir = path.join(__dirname, 'database');

fs.writeFileSync(path.join(rootDir, 'farmerd.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'customerd.drawio'), customerXml, 'utf8');

fs.writeFileSync(path.join(rootDir, 'farmerd_bw.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'customerd_bw.drawio'), customerXml, 'utf8');

fs.writeFileSync(path.join(dbDir, 'farmerd.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(dbDir, 'customerd.drawio'), customerXml, 'utf8');

console.log('✅ Generated compact, screenshot-ready, collision-checked monochrome ER diagrams.');
