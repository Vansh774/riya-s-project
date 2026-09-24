const fs = require('fs');
const path = require('path');
const { DiagramBuilder } = require('./diagram_builder');

// Helper to calculate oval attribute coordinates arranged in an arc/fan around an entity
function createAttributeFan(builder, entity, attributes, direction = 'top', radius = 130, spanDegrees = 140) {
    const count = attributes.length;
    let baseAngle;
    switch (direction) {
        case 'top': baseAngle = -90; break;
        case 'bottom': baseAngle = 90; break;
        case 'left': baseAngle = 180; break;
        case 'right': baseAngle = 0; break;
        case 'top-left': baseAngle = -135; break;
        case 'top-right': baseAngle = -45; break;
        case 'bottom-left': baseAngle = 135; break;
        case 'bottom-right': baseAngle = 45; break;
        default: baseAngle = -90;
    }

    const startAngle = (baseAngle - spanDegrees / 2) * (Math.PI / 180);
    const endAngle = (baseAngle + spanDegrees / 2) * (Math.PI / 180);
    const step = count > 1 ? (endAngle - startAngle) / (count - 1) : 0;

    const centerX = entity.x + entity.w / 2;
    const centerY = entity.y + entity.h / 2;

    attributes.forEach((att, idx) => {
        const angle = count > 1 ? startAngle + idx * step : baseAngle * (Math.PI / 180);
        // Add slight elliptical stretch
        const rx = radius * 1.15;
        const ry = radius * 0.95;
        const ax = Math.round(centerX + rx * Math.cos(angle) - 55);
        const ay = Math.round(centerY + ry * Math.sin(angle) - 20);
        const attrNode = builder.addAttribute(att.name, ax, ay, att.isPk);
        builder.connectAttr(entity.id, attrNode.id);
    });
}

// -------------------------------------------------------------
// 1. GENERATE FARMER PANEL ER DIAGRAM (farmerd.drawio)
// -------------------------------------------------------------
function generateFarmerDiagram() {
    const builder = new DiagramBuilder('Farmer Panel ER Diagram', 3300, 2400);

    builder.addTitle(
        'Farmer Panel - Entity-Relationship (ER) Diagram',
        'Database: farmer_marketplace | Scope: Farmer Operations, Inventory, Orders, Delivery Dispatch & Logs'
    );
    builder.addLegend(2750, 40);

    // Entities Layout
    // FARMER at center-left
    const entFarmer = builder.addEntity('FARMER\n(Users)', 600, 500, 160, 60, '#cce5ff', '#2b6cb0');
    createAttributeFan(builder, entFarmer, [
        { name: 'id', isPk: true },
        { name: 'name' },
        { name: 'email' },
        { name: 'phone' },
        { name: 'address' },
        { name: 'farm_name' },
        { name: 'farm_location' },
        { name: 'bio' },
        { name: 'profile_image' },
        { name: 'created_at' }
    ], 'left', 200, 170);

    // NOTIFICATIONS (top of Farmer)
    const entNotif = builder.addEntity('NOTIFICATIONS', 260, 180, 150, 55);
    createAttributeFan(builder, entNotif, [
        { name: 'id', isPk: true },
        { name: 'title' },
        { name: 'message' },
        { name: 'type' },
        { name: 'is_read' },
        { name: 'created_at' }
    ], 'top', 120, 150);

    const relReceives = builder.addRelationship('RECEIVES', 440, 330);
    builder.connectRel(entFarmer.id, relReceives.id, '1');
    builder.connectRel(entNotif.id, relReceives.id, 'N');

    // ACTIVITY_LOGS (bottom of Farmer)
    const entLogs = builder.addEntity('ACTIVITY_LOGS', 260, 880, 150, 55);
    createAttributeFan(builder, entLogs, [
        { name: 'id', isPk: true },
        { name: 'action' },
        { name: 'entity_type' },
        { name: 'entity_id' },
        { name: 'details' },
        { name: 'ip_address' },
        { name: 'created_at' }
    ], 'bottom', 130, 160);

    const relLogs = builder.addRelationship('LOGS', 440, 700);
    builder.connectRel(entFarmer.id, relLogs.id, '1');
    builder.connectRel(entLogs.id, relLogs.id, 'N');

    // PRODUCTS (to the right of Farmer)
    const entProducts = builder.addEntity('PRODUCTS', 1250, 500, 160, 60);
    createAttributeFan(builder, entProducts, [
        { name: 'id', isPk: true },
        { name: 'name' },
        { name: 'category' },
        { name: 'price' },
        { name: 'quantity' },
        { name: 'unit' },
        { name: 'description' },
        { name: 'image_url' },
        { name: 'is_available' }
    ], 'top', 170, 160);

    const relManages = builder.addRelationship('MANAGES', 930, 500);
    builder.connectRel(entFarmer.id, relManages.id, '1');
    builder.connectRel(entProducts.id, relManages.id, 'N');

    // ORDER_ITEMS (to the right of Products)
    const entOrderItems = builder.addEntity('ORDER_ITEMS', 1780, 500, 160, 60);
    createAttributeFan(builder, entOrderItems, [
        { name: 'id', isPk: true },
        { name: 'quantity' },
        { name: 'price' },
        { name: 'total' }
    ], 'top', 130, 140);

    const relFulfills = builder.addRelationship('FULFILLS', 1520, 500);
    builder.connectRel(entProducts.id, relFulfills.id, '1');
    builder.connectRel(entOrderItems.id, relFulfills.id, 'N');

    // ORDERS (bottom of Order Items)
    const entOrders = builder.addEntity('ORDERS', 1780, 880, 160, 60);
    createAttributeFan(builder, entOrders, [
        { name: 'id', isPk: true },
        { name: 'order_number' },
        { name: 'total_amount' },
        { name: 'status' },
        { name: 'shipping_address' },
        { name: 'destination_lat' },
        { name: 'destination_lng' },
        { name: 'payment_method' },
        { name: 'payment_status' }
    ], 'right', 180, 160);

    const relContains = builder.addRelationship('CONTAINS', 1790, 690);
    builder.connectRel(entOrders.id, relContains.id, '1');
    builder.connectRel(entOrderItems.id, relContains.id, 'N');

    // ORDER_STATUS_HISTORY (below Orders)
    const entHistory = builder.addEntity('ORDER_STATUS_HISTORY', 1780, 1280, 190, 60);
    createAttributeFan(builder, entHistory, [
        { name: 'id', isPk: true },
        { name: 'status' },
        { name: 'note' },
        { name: 'updated_by' },
        { name: 'updated_by_role' },
        { name: 'created_at' }
    ], 'bottom', 140, 160);

    const relHistory = builder.addRelationship('HAS_TIMELINE', 1790, 1080);
    builder.connectRel(entOrders.id, relHistory.id, '1');
    builder.connectRel(entHistory.id, relHistory.id, 'N');

    // DELIVERY_ASSIGNMENTS (between Farmer and Orders)
    const entDelivery = builder.addEntity('DELIVERY_ASSIGNMENTS', 1150, 1050, 200, 65);
    createAttributeFan(builder, entDelivery, [
        { name: 'id', isPk: true },
        { name: 'delivery_person_name' },
        { name: 'delivery_person_phone' },
        { name: 'vehicle_type' },
        { name: 'vehicle_number' },
        { name: 'tracking_token' },
        { name: 'tracking_active' },
        { name: 'status' },
        { name: 'assigned_at' }
    ], 'bottom', 180, 170);

    // Relationship: Farmer DISPATCHES Delivery Assignment
    const relDispatches = builder.addRelationship('DISPATCHES', 850, 800);
    builder.connectRel(entFarmer.id, relDispatches.id, '1');
    builder.connectRel(entDelivery.id, relDispatches.id, 'N');

    // Relationship: Orders ASSIGNED_TO Delivery Assignment
    const relAssigned = builder.addRelationship('ASSIGNED_FOR', 1480, 970);
    builder.connectRel(entOrders.id, relAssigned.id, '1');
    builder.connectRel(entDelivery.id, relAssigned.id, '1');

    // DELIVERY_LOCATIONS (below Delivery Assignments)
    const entLocations = builder.addEntity('DELIVERY_LOCATIONS', 600, 1400, 190, 60);
    createAttributeFan(builder, entLocations, [
        { name: 'id', isPk: true },
        { name: 'latitude' },
        { name: 'longitude' },
        { name: 'accuracy' },
        { name: 'speed' },
        { name: 'heading' },
        { name: 'recorded_at' }
    ], 'bottom', 140, 170);

    const relRecords = builder.addRelationship('RECORDS_GPS', 880, 1250);
    builder.connectRel(entDelivery.id, relRecords.id, '1');
    builder.connectRel(entLocations.id, relRecords.id, 'N');

    return builder.toString();
}

// -------------------------------------------------------------
// 2. GENERATE CUSTOMER PANEL ER DIAGRAM (customerd.drawio)
// -------------------------------------------------------------
function generateCustomerDiagram() {
    const builder = new DiagramBuilder('Customer Panel ER Diagram', 3500, 2600);

    builder.addTitle(
        'Customer Panel - Entity-Relationship (ER) Diagram',
        'Database: farmer_marketplace | Scope: Customer Catalog Browsing, Orders, Reviews, Wishlist & Live GPS Tracking'
    );
    builder.addLegend(2950, 40);

    // CUSTOMER at Center-Left
    const entCustomer = builder.addEntity('CUSTOMER\n(Users)', 650, 600, 160, 60, '#d5e8d4', '#82b366');
    createAttributeFan(builder, entCustomer, [
        { name: 'id', isPk: true },
        { name: 'name' },
        { name: 'email' },
        { name: 'phone' },
        { name: 'address' },
        { name: 'profile_image' },
        { name: 'created_at' }
    ], 'left', 180, 160);

    // NOTIFICATIONS (above Customer)
    const entNotif = builder.addEntity('NOTIFICATIONS', 280, 240, 150, 55);
    createAttributeFan(builder, entNotif, [
        { name: 'id', isPk: true },
        { name: 'title' },
        { name: 'message' },
        { name: 'type' },
        { name: 'is_read' },
        { name: 'created_at' }
    ], 'top', 120, 150);

    const relReceives = builder.addRelationship('RECEIVES', 480, 410);
    builder.connectRel(entCustomer.id, relReceives.id, '1');
    builder.connectRel(entNotif.id, relReceives.id, 'N');

    // BANNERS (top promotion viewed by customer)
    const entBanners = builder.addEntity('BANNERS', 980, 200, 150, 55);
    createAttributeFan(builder, entBanners, [
        { name: 'id', isPk: true },
        { name: 'title' },
        { name: 'subtitle' },
        { name: 'image_url' },
        { name: 'link_url' },
        { name: 'is_active' }
    ], 'top', 130, 150);

    const relViewsPromo = builder.addRelationship('VIEWS_OFFERS', 830, 390);
    builder.connectRel(entCustomer.id, relViewsPromo.id, 'N');
    builder.connectRel(entBanners.id, relViewsPromo.id, 'M');

    // ORDERS (bottom of Customer)
    const entOrders = builder.addEntity('ORDERS', 650, 1050, 160, 60);
    createAttributeFan(builder, entOrders, [
        { name: 'id', isPk: true },
        { name: 'order_number' },
        { name: 'total_amount' },
        { name: 'status' },
        { name: 'shipping_address' },
        { name: 'destination_lat' },
        { name: 'destination_lng' },
        { name: 'payment_method' },
        { name: 'payment_status' },
        { name: 'notes' }
    ], 'left', 200, 170);

    const relPlaces = builder.addRelationship('PLACES', 660, 830);
    builder.connectRel(entCustomer.id, relPlaces.id, '1');
    builder.connectRel(entOrders.id, relPlaces.id, 'N');

    // ORDER_ITEMS (to the right of Orders)
    const entOrderItems = builder.addEntity('ORDER_ITEMS', 1300, 1050, 160, 60);
    createAttributeFan(builder, entOrderItems, [
        { name: 'id', isPk: true },
        { name: 'quantity' },
        { name: 'price' },
        { name: 'total' }
    ], 'bottom', 120, 140);

    const relContains = builder.addRelationship('CONTAINS', 980, 1050);
    builder.connectRel(entOrders.id, relContains.id, '1');
    builder.connectRel(entOrderItems.id, relContains.id, 'N');

    // PRODUCTS (Central catalog entity)
    const entProducts = builder.addEntity('PRODUCTS', 1850, 600, 160, 60);
    createAttributeFan(builder, entProducts, [
        { name: 'id', isPk: true },
        { name: 'name' },
        { name: 'category' },
        { name: 'price' },
        { name: 'quantity' },
        { name: 'unit' },
        { name: 'description' },
        { name: 'image_url' },
        { name: 'is_available' }
    ], 'right', 180, 160);

    // Relationship between PRODUCTS and ORDER_ITEMS
    const relOrderedAs = builder.addRelationship('ORDERED_AS', 1600, 840);
    builder.connectRel(entProducts.id, relOrderedAs.id, '1');
    builder.connectRel(entOrderItems.id, relOrderedAs.id, 'N');

    // REVIEWS (between Customer and Products)
    const entReviews = builder.addEntity('REVIEWS', 1250, 400, 150, 55);
    createAttributeFan(builder, entReviews, [
        { name: 'id', isPk: true },
        { name: 'rating' },
        { name: 'comment' },
        { name: 'created_at' }
    ], 'top', 120, 140);

    const relWrites = builder.addRelationship('WRITES', 960, 480);
    builder.connectRel(entCustomer.id, relWrites.id, '1');
    builder.connectRel(entReviews.id, relWrites.id, 'N');

    const relReviewedFor = builder.addRelationship('REVIEWS_FOR', 1560, 480);
    builder.connectRel(entReviews.id, relReviewedFor.id, 'N');
    builder.connectRel(entProducts.id, relReviewedFor.id, '1');

    // WISHLIST (between Customer and Products)
    const entWishlist = builder.addEntity('WISHLIST', 1250, 600, 150, 55);
    createAttributeFan(builder, entWishlist, [
        { name: 'id', isPk: true },
        { name: 'created_at' }
    ], 'bottom', 90, 120);

    const relSavesTo = builder.addRelationship('SAVES_TO', 960, 600);
    builder.connectRel(entCustomer.id, relSavesTo.id, '1');
    builder.connectRel(entWishlist.id, relSavesTo.id, 'N');

    const relBookmarked = builder.addRelationship('BOOKMARKED_AS', 1560, 600);
    builder.connectRel(entProducts.id, relBookmarked.id, '1');
    builder.connectRel(entWishlist.id, relBookmarked.id, 'N');

    // ORDER_STATUS_HISTORY (below Orders)
    const entHistory = builder.addEntity('ORDER_STATUS_HISTORY', 300, 1500, 190, 60);
    createAttributeFan(builder, entHistory, [
        { name: 'id', isPk: true },
        { name: 'status' },
        { name: 'note' },
        { name: 'created_at' }
    ], 'bottom', 120, 150);

    const relHistory = builder.addRelationship('TRACKS_STAGE', 480, 1290);
    builder.connectRel(entOrders.id, relHistory.id, '1');
    builder.connectRel(entHistory.id, relHistory.id, 'N');

    // DELIVERY_ASSIGNMENTS (below Orders, for Customer tracking)
    const entDelivery = builder.addEntity('DELIVERY_ASSIGNMENTS', 1050, 1500, 200, 65);
    createAttributeFan(builder, entDelivery, [
        { name: 'id', isPk: true },
        { name: 'delivery_person_name' },
        { name: 'delivery_person_phone' },
        { name: 'vehicle_type' },
        { name: 'tracking_token' },
        { name: 'status' },
        { name: 'assigned_at' }
    ], 'bottom', 150, 160);

    const relTracksDelivery = builder.addRelationship('TRACKS_DELIVERY', 860, 1290);
    builder.connectRel(entOrders.id, relTracksDelivery.id, '1');
    builder.connectRel(entDelivery.id, relTracksDelivery.id, '1');

    // DELIVERY_LOCATIONS (Customer Map live tracking)
    const entLocations = builder.addEntity('DELIVERY_LOCATIONS', 1650, 1500, 190, 60);
    createAttributeFan(builder, entLocations, [
        { name: 'id', isPk: true },
        { name: 'latitude' },
        { name: 'longitude' },
        { name: 'speed' },
        { name: 'accuracy' },
        { name: 'recorded_at' }
    ], 'bottom', 130, 160);

    const relStreamsGps = builder.addRelationship('STREAMS_GPS', 1380, 1500);
    builder.connectRel(entDelivery.id, relStreamsGps.id, '1');
    builder.connectRel(entLocations.id, relStreamsGps.id, 'N');

    return builder.toString();
}

const farmerXml = generateFarmerDiagram();
const customerXml = generateCustomerDiagram();

const rootDir = path.join(__dirname, '..');
fs.writeFileSync(path.join(rootDir, 'farmerd.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'customerd.drawio'), customerXml, 'utf8');

console.log('✅ Generated farmerd.drawio and customerd.drawio successfully');
