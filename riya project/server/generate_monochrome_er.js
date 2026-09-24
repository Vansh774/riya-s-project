const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

class BwDiagramBuilder {
    constructor(name, width = 4200, height = 3000) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.nextId = 2;
        this.cells = [];
    }

    addEntity(label, x, y, w = 170, h = 60) {
        const id = `ent_${this.nextId++}`;
        // Pure black and white, no colors
        const style = `rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=13;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="&lt;b&gt;${escapeXml(label)}&lt;/b&gt;" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label };
    }

    addAttribute(label, x, y, isPk = false, isFk = false, w = 150, h = 42) {
        const id = `att_${this.nextId++}`;
        let val;
        let fontStyle = '0';
        let strokeWidth = '1';

        if (isPk) {
            fontStyle = '4'; // Underline
            strokeWidth = '2'; // Slightly bolder outline for PK
            val = `&lt;u&gt;&lt;b&gt;${escapeXml(label)}&lt;/b&gt;&lt;/u&gt;`;
        } else if (isFk) {
            fontStyle = '1';
            val = `&lt;b&gt;${escapeXml(label)}&lt;/b&gt;`;
        } else {
            val = escapeXml(label);
        }

        // Pure black and white, no colors
        const style = `ellipse;whiteSpace=wrap;html=1;fontSize=11;fontStyle=${fontStyle};fillColor=#ffffff;strokeColor=#000000;strokeWidth=${strokeWidth};fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="${val}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label, isPk, isFk };
    }

    addRelationship(label, x, y, w = 150, h = 65) {
        const id = `rel_${this.nextId++}`;
        // Pure black and white diamond
        const style = `rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=12;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="&lt;b&gt;${escapeXml(label)}&lt;/b&gt;" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label };
    }

    connectAttr(entityId, attrId) {
        const edgeId = `edge_${this.nextId++}`;
        const style = 'endArrow=none;html=1;rounded=0;strokeColor=#000000;strokeWidth=1;';
        this.cells.push(`        <mxCell id="${edgeId}" style="${style}" edge="1" parent="1" source="${entityId}" target="${attrId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`);
    }

    connectRel(entityId, relId, card = '') {
        const edgeId = `edge_${this.nextId++}`;
        const style = 'endArrow=none;html=1;rounded=0;strokeColor=#000000;strokeWidth=2;fontStyle=1;fontSize=13;fontColor=#000000;';
        const val = card ? escapeXml(card) : '';
        this.cells.push(`        <mxCell id="${edgeId}" value="${val}" style="${style}" edge="1" parent="1" source="${entityId}" target="${relId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`);
    }

    addTitle(title, subtitle, x = 50, y = 30) {
        const id = `title_${this.nextId++}`;
        const style = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#000000;';
        const val = `&lt;h1 style=&quot;margin:0;font-size:24px;color:#000000;&quot;&gt;${escapeXml(title)}&lt;/h1&gt;&lt;p style=&quot;margin:5px 0 0 0;font-size:13px;color:#333333;&quot;&gt;${escapeXml(subtitle)}&lt;/p&gt;`;
        this.cells.push(`        <mxCell id="${id}" value="${val}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="850" height="65" as="geometry" />
        </mxCell>`);
    }

    addLegend(x, y) {
        const boxId = `legend_${this.nextId++}`;
        // Black and white box
        this.cells.push(`        <mxCell id="${boxId}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="490" height="150" as="geometry" />
        </mxCell>`);

        const titleId = `legtitle_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${titleId}" value="&lt;b&gt;ER Diagram Symbols (Pure Monochrome / No Colors)&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontSize=12;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 15}" y="${y + 8}" width="460" height="20" as="geometry" />
        </mxCell>`);

        // Entity
        const entSymId = `leg_ent_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${entSymId}" value="Entity" style="rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 15}" y="${y + 35}" width="70" height="30" as="geometry" />
        </mxCell>`);

        // Relationship
        const relSymId = `leg_rel_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${relSymId}" value="Relationship" style="rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 95}" y="${y + 30}" width="95" height="40" as="geometry" />
        </mxCell>`);

        // Attribute
        const attSymId = `leg_att_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${attSymId}" value="Attribute" style="ellipse;whiteSpace=wrap;html=1;fontSize=10;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 200}" y="${y + 35}" width="75" height="30" as="geometry" />
        </mxCell>`);

        // Primary Key Attribute
        const pkSymId = `leg_pk_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${pkSymId}" value="&lt;u&gt;&lt;b&gt;col (PK)&lt;/b&gt;&lt;/u&gt;" style="ellipse;whiteSpace=wrap;html=1;fontSize=10;fontStyle=4;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 285}" y="${y + 35}" width="90" height="30" as="geometry" />
        </mxCell>`);

        // Foreign Key Attribute
        const fkSymId = `leg_fk_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${fkSymId}" value="&lt;b&gt;col (FK)&lt;/b&gt;" style="ellipse;whiteSpace=wrap;html=1;fontSize=10;fontStyle=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 385}" y="${y + 35}" width="90" height="30" as="geometry" />
        </mxCell>`);

        // Note
        const lineNoteId = `leg_line_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${lineNoteId}" value="&lt;b&gt;Connecting Line:&lt;/b&gt; Connects Entity to Attribute or Relationship.&lt;br&gt;&lt;b&gt;Keys:&lt;/b&gt; (PK) = Primary Key (underlined), (FK) = Foreign Key.&lt;br&gt;&lt;b&gt;Cardinality:&lt;/b&gt; 1 = One, N / M = Many" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontSize=10;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x + 15}" y="${y + 80}" width="460" height="60" as="geometry" />
        </mxCell>`);
    }

    attachAttributesFan(entity, attrList, direction = 'top', radius = 220, spanDegrees = 150) {
        const count = attrList.length;
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

        attrList.forEach((att, idx) => {
            const angle = count > 1 ? startAngle + idx * step : baseAngle * (Math.PI / 180);
            const w = att.name.length > 20 ? 175 : (att.name.length > 14 ? 155 : 140);
            const h = 42;
            const rx = radius * 1.15;
            const ry = radius * 0.95;
            const ax = Math.round(centerX + rx * Math.cos(angle) - w / 2);
            const ay = Math.round(centerY + ry * Math.sin(angle) - h / 2);
            const a = this.addAttribute(att.name, ax, ay, att.isPk, att.isFk, w, h);
            this.connectAttr(entity.id, a.id);
        });
    }

    toString() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Antigravity" version="21.6.8" type="device">
  <diagram id="${this.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}" name="${escapeXml(this.name)}">
    <mxGraphModel dx="2600" dy="1800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${this.width}" pageHeight="${this.height}" background="#ffffff" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${this.cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    }
}

// -------------------------------------------------------------
// 1. BUILD FARMER ER DIAGRAM (Pure B&W with PK & FK)
// -------------------------------------------------------------
function buildFarmerDiagram() {
    const builder = new BwDiagramBuilder('Farmer Panel ER Diagram', 4000, 3000);

    builder.addTitle(
        'Farmer Panel - Entity-Relationship (ER) Diagram (Monochrome / No Colors)',
        'Database: farmer_marketplace | Primary Keys: (PK) underlined | Foreign Keys: (FK)'
    );
    builder.addLegend(3450, 40);

    // Entity 1: FARMER (Users)
    const entFarmer = builder.addEntity('FARMER\n(users)', 700, 600, 180, 65);
    builder.attachAttributesFan(entFarmer, [
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
    ], 'left', 260, 175);

    // Entity 2: NOTIFICATIONS
    const entNotif = builder.addEntity('NOTIFICATIONS', 350, 220, 170, 60);
    builder.attachAttributesFan(entNotif, [
        { name: 'id (PK)', isPk: true },
        { name: 'user_id (FK)', isFk: true },
        { name: 'title' },
        { name: 'message' },
        { name: 'type' },
        { name: 'is_read' },
        { name: 'created_at' }
    ], 'top', 160, 160);

    const relReceives = builder.addRelationship('RECEIVES', 550, 400);
    builder.connectRel(entFarmer.id, relReceives.id, '1');
    builder.connectRel(entNotif.id, relReceives.id, 'N');

    // Entity 3: ACTIVITY_LOGS
    const entLogs = builder.addEntity('ACTIVITY_LOGS', 350, 1080, 170, 60);
    builder.attachAttributesFan(entLogs, [
        { name: 'id (PK)', isPk: true },
        { name: 'user_id (FK)', isFk: true },
        { name: 'action' },
        { name: 'entity_type' },
        { name: 'entity_id' },
        { name: 'details' },
        { name: 'ip_address' },
        { name: 'created_at' }
    ], 'bottom', 180, 170);

    const relLogs = builder.addRelationship('LOGS', 550, 850);
    builder.connectRel(entFarmer.id, relLogs.id, '1');
    builder.connectRel(entLogs.id, relLogs.id, 'N');

    // Entity 4: PRODUCTS
    const entProducts = builder.addEntity('PRODUCTS', 1500, 600, 180, 65);
    builder.attachAttributesFan(entProducts, [
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
    ], 'top', 240, 170);

    const relManages = builder.addRelationship('MANAGES', 1100, 600);
    builder.connectRel(entFarmer.id, relManages.id, '1');
    builder.connectRel(entProducts.id, relManages.id, 'N');

    // Entity 5: ORDER_ITEMS
    const entOrderItems = builder.addEntity('ORDER_ITEMS', 2200, 600, 180, 65);
    builder.attachAttributesFan(entOrderItems, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'quantity' },
        { name: 'price' },
        { name: 'total' }
    ], 'top', 180, 160);

    const relFulfills = builder.addRelationship('FULFILLS', 1860, 600);
    builder.connectRel(entProducts.id, relFulfills.id, '1');
    builder.connectRel(entOrderItems.id, relFulfills.id, 'N');

    // Entity 6: ORDERS
    const entOrders = builder.addEntity('ORDERS', 2200, 1100, 180, 65);
    builder.attachAttributesFan(entOrders, [
        { name: 'id (PK)', isPk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'order_number' },
        { name: 'total_amount' },
        { name: 'status' },
        { name: 'shipping_address' },
        { name: 'destination_latitude' },
        { name: 'destination_longitude' },
        { name: 'payment_method' },
        { name: 'payment_status' }
    ], 'right', 250, 175);

    const relContains = builder.addRelationship('CONTAINS', 2210, 850);
    builder.connectRel(entOrders.id, relContains.id, '1');
    builder.connectRel(entOrderItems.id, relContains.id, 'N');

    // Entity 7: ORDER_STATUS_HISTORY
    const entHistory = builder.addEntity('ORDER_STATUS_HISTORY', 2200, 1650, 210, 65);
    builder.attachAttributesFan(entHistory, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'updated_by (FK)', isFk: true },
        { name: 'status' },
        { name: 'note' },
        { name: 'updated_by_role' },
        { name: 'created_at' }
    ], 'bottom', 180, 170);

    const relHistory = builder.addRelationship('HAS_TIMELINE', 2225, 1375);
    builder.connectRel(entOrders.id, relHistory.id, '1');
    builder.connectRel(entHistory.id, relHistory.id, 'N');

    // Entity 8: DELIVERY_ASSIGNMENTS
    const entDelivery = builder.addEntity('DELIVERY_ASSIGNMENTS', 1400, 1300, 220, 70);
    builder.attachAttributesFan(entDelivery, [
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
    ], 'bottom', 240, 175);

    const relDispatches = builder.addRelationship('DISPATCHES', 1050, 950);
    builder.connectRel(entFarmer.id, relDispatches.id, '1');
    builder.connectRel(entDelivery.id, relDispatches.id, 'N');

    const relAssigned = builder.addRelationship('ASSIGNED_FOR', 1800, 1200);
    builder.connectRel(entOrders.id, relAssigned.id, '1');
    builder.connectRel(entDelivery.id, relAssigned.id, '1');

    // Entity 9: DELIVERY_LOCATIONS
    const entLocations = builder.addEntity('DELIVERY_LOCATIONS', 700, 1750, 210, 65);
    builder.attachAttributesFan(entLocations, [
        { name: 'id (PK)', isPk: true },
        { name: 'delivery_assignment_id (FK)', isFk: true },
        { name: 'latitude' },
        { name: 'longitude' },
        { name: 'accuracy' },
        { name: 'speed' },
        { name: 'heading' },
        { name: 'recorded_at' }
    ], 'bottom', 210, 175);

    const relRecords = builder.addRelationship('RECORDS_GPS', 1050, 1530);
    builder.connectRel(entDelivery.id, relRecords.id, '1');
    builder.connectRel(entLocations.id, relRecords.id, 'N');

    return builder.toString();
}

// -------------------------------------------------------------
// 2. BUILD CUSTOMER ER DIAGRAM (Pure B&W with PK & FK)
// -------------------------------------------------------------
function buildCustomerDiagram() {
    const builder = new BwDiagramBuilder('Customer Panel ER Diagram', 4200, 3200);

    builder.addTitle(
        'Customer Panel - Entity-Relationship (ER) Diagram (Monochrome / No Colors)',
        'Database: farmer_marketplace | Primary Keys: (PK) underlined | Foreign Keys: (FK)'
    );
    builder.addLegend(3650, 40);

    // Entity 1: CUSTOMER (Users)
    const entCustomer = builder.addEntity('CUSTOMER\n(users)', 750, 700, 180, 65);
    builder.attachAttributesFan(entCustomer, [
        { name: 'id (PK)', isPk: true },
        { name: 'name' },
        { name: 'email' },
        { name: 'phone' },
        { name: 'address' },
        { name: 'profile_image' },
        { name: 'created_at' }
    ], 'left', 230, 170);

    // Entity 2: NOTIFICATIONS
    const entNotif = builder.addEntity('NOTIFICATIONS', 320, 260, 170, 60);
    builder.attachAttributesFan(entNotif, [
        { name: 'id (PK)', isPk: true },
        { name: 'user_id (FK)', isFk: true },
        { name: 'title' },
        { name: 'message' },
        { name: 'type' },
        { name: 'is_read' },
        { name: 'created_at' }
    ], 'top', 160, 160);

    const relReceives = builder.addRelationship('RECEIVES', 530, 480);
    builder.connectRel(entCustomer.id, relReceives.id, '1');
    builder.connectRel(entNotif.id, relReceives.id, 'N');

    // Entity 3: BANNERS
    const entBanners = builder.addEntity('BANNERS', 1150, 220, 170, 60);
    builder.attachAttributesFan(entBanners, [
        { name: 'id (PK)', isPk: true },
        { name: 'title' },
        { name: 'subtitle' },
        { name: 'image_url' },
        { name: 'link_url' },
        { name: 'is_active' }
    ], 'top', 160, 160);

    const relViewsOffers = builder.addRelationship('VIEWS_OFFERS', 950, 460);
    builder.connectRel(entCustomer.id, relViewsOffers.id, 'N');
    builder.connectRel(entBanners.id, relViewsOffers.id, 'M');

    // Entity 4: ORDERS
    const entOrders = builder.addEntity('ORDERS', 750, 1250, 180, 65);
    builder.attachAttributesFan(entOrders, [
        { name: 'id (PK)', isPk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'order_number' },
        { name: 'total_amount' },
        { name: 'status' },
        { name: 'shipping_address' },
        { name: 'destination_latitude' },
        { name: 'destination_longitude' },
        { name: 'payment_method' },
        { name: 'payment_status' },
        { name: 'notes' }
    ], 'left', 260, 180);

    const relPlaces = builder.addRelationship('PLACES', 760, 970);
    builder.connectRel(entCustomer.id, relPlaces.id, '1');
    builder.connectRel(entOrders.id, relPlaces.id, 'N');

    // Entity 5: ORDER_ITEMS
    const entOrderItems = builder.addEntity('ORDER_ITEMS', 1550, 1250, 180, 65);
    builder.attachAttributesFan(entOrderItems, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'quantity' },
        { name: 'price' },
        { name: 'total' }
    ], 'bottom', 180, 160);

    const relContains = builder.addRelationship('CONTAINS', 1150, 1250);
    builder.connectRel(entOrders.id, relContains.id, '1');
    builder.connectRel(entOrderItems.id, relContains.id, 'N');

    // Entity 6: PRODUCTS
    const entProducts = builder.addEntity('PRODUCTS', 2250, 700, 180, 65);
    builder.attachAttributesFan(entProducts, [
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
    ], 'right', 250, 175);

    const relOrderedAs = builder.addRelationship('ORDERED_AS', 1900, 980);
    builder.connectRel(entProducts.id, relOrderedAs.id, '1');
    builder.connectRel(entOrderItems.id, relOrderedAs.id, 'N');

    // Entity 7: REVIEWS
    const entReviews = builder.addEntity('REVIEWS', 1500, 480, 170, 60);
    builder.attachAttributesFan(entReviews, [
        { name: 'id (PK)', isPk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'rating' },
        { name: 'comment' },
        { name: 'created_at' }
    ], 'top', 160, 160);

    const relWrites = builder.addRelationship('WRITES', 1120, 580);
    builder.connectRel(entCustomer.id, relWrites.id, '1');
    builder.connectRel(entReviews.id, relWrites.id, 'N');

    const relReviewedFor = builder.addRelationship('REVIEWS_FOR', 1880, 580);
    builder.connectRel(entReviews.id, relReviewedFor.id, 'N');
    builder.connectRel(entProducts.id, relReviewedFor.id, '1');

    // Entity 8: WISHLIST
    const entWishlist = builder.addEntity('WISHLIST', 1500, 700, 170, 60);
    builder.attachAttributesFan(entWishlist, [
        { name: 'id (PK)', isPk: true },
        { name: 'customer_id (FK)', isFk: true },
        { name: 'product_id (FK)', isFk: true },
        { name: 'created_at' }
    ], 'top', 130, 140);

    const relSavesTo = builder.addRelationship('SAVES_TO', 1120, 700);
    builder.connectRel(entCustomer.id, relSavesTo.id, '1');
    builder.connectRel(entWishlist.id, relSavesTo.id, 'N');

    const relBookmarked = builder.addRelationship('BOOKMARKED_AS', 1880, 700);
    builder.connectRel(entProducts.id, relBookmarked.id, '1');
    builder.connectRel(entWishlist.id, relBookmarked.id, 'N');

    // Entity 9: ORDER_STATUS_HISTORY
    const entHistory = builder.addEntity('ORDER_STATUS_HISTORY', 350, 1850, 220, 65);
    builder.attachAttributesFan(entHistory, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'status' },
        { name: 'note' },
        { name: 'created_at' }
    ], 'bottom', 160, 160);

    const relHistory = builder.addRelationship('TRACKS_STAGE', 550, 1550);
    builder.connectRel(entOrders.id, relHistory.id, '1');
    builder.connectRel(entHistory.id, relHistory.id, 'N');

    // Entity 10: DELIVERY_ASSIGNMENTS
    const entDelivery = builder.addEntity('DELIVERY_ASSIGNMENTS', 1250, 1850, 230, 70);
    builder.attachAttributesFan(entDelivery, [
        { name: 'id (PK)', isPk: true },
        { name: 'order_id (FK)', isFk: true },
        { name: 'farmer_id (FK)', isFk: true },
        { name: 'delivery_person_name' },
        { name: 'delivery_person_phone' },
        { name: 'vehicle_type' },
        { name: 'tracking_token' },
        { name: 'status' }
    ], 'bottom', 200, 170);

    const relTracksDelivery = builder.addRelationship('TRACKS_DELIVERY', 1000, 1550);
    builder.connectRel(entOrders.id, relTracksDelivery.id, '1');
    builder.connectRel(entDelivery.id, relTracksDelivery.id, '1');

    // Entity 11: DELIVERY_LOCATIONS
    const entLocations = builder.addEntity('DELIVERY_LOCATIONS', 2050, 1850, 210, 65);
    builder.attachAttributesFan(entLocations, [
        { name: 'id (PK)', isPk: true },
        { name: 'delivery_assignment_id (FK)', isFk: true },
        { name: 'latitude' },
        { name: 'longitude' },
        { name: 'speed' },
        { name: 'accuracy' },
        { name: 'recorded_at' }
    ], 'bottom', 180, 170);

    const relStreamsGps = builder.addRelationship('STREAMS_GPS', 1680, 1850);
    builder.connectRel(entDelivery.id, relStreamsGps.id, '1');
    builder.connectRel(entLocations.id, relStreamsGps.id, 'N');

    return builder.toString();
}

const farmerXml = buildFarmerDiagram();
const customerXml = buildCustomerDiagram();

const rootDir = path.join(__dirname, '..');
const dbDir = path.join(__dirname, 'database');

// Update main files
fs.writeFileSync(path.join(rootDir, 'farmerd.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'customerd.drawio'), customerXml, 'utf8');

// Also create distinct _bw.drawio versions so there is no ambiguity about overwriting
fs.writeFileSync(path.join(rootDir, 'farmerd_bw.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'customerd_bw.drawio'), customerXml, 'utf8');

// Mirror in server/database/
fs.writeFileSync(path.join(dbDir, 'farmerd.drawio'), farmerXml, 'utf8');
fs.writeFileSync(path.join(dbDir, 'customerd.drawio'), customerXml, 'utf8');

console.log('✅ Generated monochrome (pure B&W, no colors) ER diagrams with explicit (PK) and (FK) marks.');
