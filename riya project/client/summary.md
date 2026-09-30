# FreshField — Technical Summary

> **Purpose:** If another developer opens this project, they should be able to understand which technologies are used, where the database connection is configured, which table stores each type of data, and how the important application flows work.

---

## 1. Technologies Used

| Area | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL (via `mysql2` driver) |
| Authentication | JWT (jsonwebtoken), bcrypt password hashing |
| Real-time communication | Socket.IO v4 |
| Maps / GPS | Leaflet.js (client-side), Browser `navigator.geolocation` API |
| OCR (Kisan Card) | Tesseract.js v7 (server-side) |
| File Uploads | Multer (disk storage) |
| Validation | express-validator |
| Internationalization | Custom `i18n.js` (client-side) |
| Styling | Vanilla CSS (no framework) |
| API | REST API over HTTP |
| Development Server | Nodemon (`npm run dev`) |
| Production Server | Node.js (`npm start`) |
| Connection type | MySQL connection **pool** (limit: 10 connections) |

**Important Libraries:**
- `bcrypt` — password hashing (salt rounds: 10)
- `jsonwebtoken` — JWT creation and verification
- `multer` — file upload handling
- `tesseract.js` — server-side OCR for Kisan Card image reading
- `socket.io` — real-time GPS location updates and order status events
- `express-validator` — request field validation
- `dotenv` — environment variable loading
- `cors` — Cross-Origin Resource Sharing

---

## 2. Database Connection

**File:** `server/config/database.js`

**Library:** `mysql2` (with `.promise()` wrapper)

**Connection details loaded from:** `server/.env`

| Setting | Value in `.env` |
|---|---|
| DB_HOST | localhost |
| DB_PORT | 3306 |
| DB_USER | root |
| DB_PASSWORD | (empty by default) |
| DB_NAME | farmer_marketplace |

**Architecture:**
```
Frontend HTML/JS
      |
API Request (HTTP / Socket.IO)
      |
Express Route (server/routes/*.js)
      |
Controller (server/controllers/*.js)
      |
pool.query() or connection.query()
      |
MySQL Connection Pool (max 10 connections)
      |
MySQL Database: farmer_marketplace
```

- All controllers import `const { pool } = require('../config/database');`
- Order creation uses a **transaction** (`pool.getConnection()` → `beginTransaction()` → `commit()` / `rollback()`).
- All other queries use the shared **pool** directly.
- The server tests the connection on startup and exits if it fails.

---

## 3. Database Tables

All tables reside in the `farmer_marketplace` database.

| Table | Main Purpose | Important Columns | Used By |
|---|---|---|---|
| `users` | All accounts: farmer, customer, admin | `id`, `name`, `email`, `password`, `role` (farmer/customer/admin), `status` (active/suspended/banned), `phone`, `address`, `farm_name`, `farm_location`, `farmer_id`, `kisan_card_number`, `kisan_card_image`, `is_verified`, `verified_at`, `warning_count`, `last_warning`, `last_warning_at`, `suspended_until`, `suspension_reason`, `ban_reason` | Auth, all controllers |
| `products` | Farmer product listings | `id`, `farmer_id`, `name`, `category`, `description`, `price`, `quantity`, `unit`, `image_url`, `is_available` | Product, Order controllers |
| `orders` | Customer orders | `id`, `customer_id`, `order_number`, `total_amount`, `status`, `shipping_address`, `destination_latitude`, `destination_longitude`, `payment_method`, `payment_status`, `notes` | Order, Delivery controllers |
| `order_items` | Line items within each order | `id`, `order_id`, `product_id`, `farmer_id`, `quantity`, `price`, `total` | Order, Delivery controllers |
| `order_status_history` | Timeline of status changes | `id`, `order_id`, `status`, `note`, `updated_by`, `updated_by_role` | Order, Delivery controllers |
| `delivery_assignments` | Delivery partner assignment per order | `id`, `order_id`, `farmer_id`, `delivery_person_name`, `delivery_person_phone`, `vehicle_type`, `vehicle_number`, `tracking_token`, `tracking_active`, `status`, `notes`, `assigned_at`, `delivery_started_at`, `delivery_completed_at` | Delivery controller |
| `delivery_locations` | GPS coordinates from delivery person | `id`, `delivery_assignment_id`, `latitude`, `longitude`, `accuracy`, `speed`, `heading`, `recorded_at` | Delivery controller, Socket.IO |
| `conversations` | Messaging threads between customer and farmer | `id`, `customer_id`, `farmer_id`, `product_id`, `subject`, `created_at`, `updated_at` | Features controller |
| `messages` | Individual messages within a conversation | `id`, `conversation_id`, `sender_id`, `sender_role`, `message`, `is_read`, `created_at` | Features controller |
| `product_price_rules` | Min/max price bounds per product type | `id`, `product_name` (lowercase), `display_name`, `category`, `unit`, `min_price`, `max_price`, `is_active` | Product controller |
| `approved_product_catalog` | Admin-approved list of allowed products | `id`, `name`, `category`, `unit`, `description`, `request_id`, `approved_by`, `approved_at`, `is_active` | Product controller |
| `product_requests` | Farmer requests for new product approval | `id`, `farmer_id`, `product_name`, `category`, `description`, `suggested_min_price`, `suggested_max_price`, `unit`, `reason`, `status` (pending/approved/rejected), `admin_notes`, `reviewed_by`, `reviewed_at` | Features controller |
| `farmer_reports` | Customer complaints against farmers | `id`, `reporter_id`, `farmer_id`, `order_id`, `reason`, `description`, `evidence_image`, `status`, `admin_action`, `admin_notes`, `action_taken_at`, `action_taken_by` | Admin controller |
| `admin_action_logs` | Audit trail of admin moderation actions | `id`, `admin_id`, `target_user_id`, `report_id`, `action_type` (warn/suspend/ban/unsuspend/unban/dismiss_report), `days`, `reason`, `details`, `created_at` | Admin controller |
| `notifications` | In-app notifications for users | `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at` | Order, Delivery, Admin controllers |
| `wishlist` | Customer saved products | `id`, `customer_id`, `product_id`, `created_at` | User controller |
| `reviews` | Customer product reviews | `id`, `product_id`, `customer_id`, `rating` (1-5), `comment`, `created_at` | Order controller (stats) |
| `activity_logs` | General action audit log | `id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at` | Order controller |
| `banners` | Homepage promotional banners | `id`, `title`, `subtitle`, `image_url`, `link_url`, `is_active`, `display_order` | Frontend static display |

> **Note:** Tables `conversations`, `messages`, `product_price_rules`, `product_requests`, `approved_product_catalog`, `farmer_reports`, and `admin_action_logs` were added via migration scripts (`migrate_features.js`, `migrate_admin.js`), not the base `schema.sql`.

---

## 4. User Registration & Login

### Customer Registration

```
Registration Form (login.html)
      |
POST /api/auth/register
      |
authController.js -> register()
      |
Validate: name, email, password, role='customer'
      |
bcrypt.hash(password, 10)
      |
INSERT INTO users (name, email, password, role, phone, address)
      |
jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
      |
Return: { token, user }
```

**Table:** `users`  
**Stored data:** `name`, `email`, `password` (bcrypt hash), `role='customer'`, `phone`, `address`, `status='active'`  
**No Kisan Card required** for customers.

---

### Farmer Registration

```
Registration Form (login.html — farmer tab) + Kisan Card image upload
      |
POST /api/auth/register (multipart/form-data)
      |
kisanUpload middleware (Multer) -> file saved to server/uploads/
      |
authController.js -> register()
      |
verifyKisanCard({ farmerId, kisanCardNumber, file })
      |
  1. Check file buffer for embedded FID= / KCC= metadata markers
  2. Run Tesseract.js OCR on image (6-second timeout)
  3. Compare OCR-extracted text against entered farmerId and kisanCardNumber
      |
If verification fails -> delete uploaded file -> return 400 error
If verified -> save kisan_card_image filename
      |
bcrypt.hash(password, 10)
      |
INSERT INTO users (..., farmer_id, kisan_card_number, kisan_card_image, is_verified=1, verified_at=NOW())
      |
jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
```

**Stored data (farmers only):** `farmer_id` (text), `kisan_card_number`, `kisan_card_image` (filename in server/uploads/), `farm_name`, `farm_location`, `is_verified=1`, `verified_at`

---

### Admin Login

**Default admin credentials (seeded by migrate_admin.js):** `admin@freshfield.com` / `admin123`

**JWT Payload:** `{ id, email, role }` — expires in 7 days.

---

### Login (all roles)

```
email + password
      |
POST /api/auth/login
      |
SELECT user WHERE email = ?
      |
bcrypt.compare(password, hash)
      |
Check status (banned -> 403, suspended -> 403 with days remaining)
      |
jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
      |
Return token + user object
      |
Client stores token in localStorage -> role-based redirect
```

---

## 5. Where Does Each Action Store Data?

| User Action | API Endpoint | Controller | Table(s) | Important Data Stored |
|---|---|---|---|---|
| Customer registration | `POST /api/auth/register` | `authController.register` | `users` | name, email, password hash, role='customer' |
| Farmer registration | `POST /api/auth/register` (multipart) | `authController.register` | `users` | + farmer_id, kisan_card_number, kisan_card_image, is_verified |
| Add product | `POST /api/products` | `productController.createProduct` | `products` | farmer_id, name (canonical), category, price, quantity, unit, image_url |
| Update product | `PUT /api/products/:id` | `productController.updateProduct` | `products` | Updated fields |
| Delete product | `DELETE /api/products/:id` | `productController.deleteProduct` | `products` | Row removed |
| Toggle availability | `PATCH /api/products/:id/toggle-availability` | `productController.toggleProductAvailability` | `products` | `is_available` toggled |
| Adjust stock | `PATCH /api/products/:id/quick-stock` | `productController.quickAdjustStock` | `products` | `quantity` updated |
| Add to wishlist | `POST /api/users/wishlist/:productId` | userController | `wishlist` | customer_id, product_id |
| Remove from wishlist | `DELETE /api/users/wishlist/:productId` | userController | `wishlist` | Row deleted |
| Add to cart | *(localStorage only — no API)* | client/js/cart.js | **localStorage** | Cart items in browser only |
| Place order | `POST /api/orders` | `orderController.createOrder` | `orders`, `order_items`, `order_status_history`, `notifications`, `activity_logs`, `products` (qty deducted) | Full order + items in DB |
| Cancel order | `PUT /api/orders/:id/status` status='cancelled' | `orderController.updateOrderStatus` | `orders`, `order_status_history`, `notifications`, `products` (qty restored) | Status changed, stock restored |
| Update order status | `PUT /api/orders/:id/status` | `orderController.updateOrderStatus` | `orders`, `order_status_history`, `notifications`, `activity_logs` | Status + history + notification |
| Customer report farmer | `POST /api/admin/reports` | `adminController.createFarmerReport` | `farmer_reports` | reporter_id, farmer_id, order_id, reason, description, status='pending' |
| Admin issue warning | `POST /api/admin/users/:id/warn` | `adminController.warnUser` | `users`, `admin_action_logs`, `notifications` | warning_count+1, last_warning text |
| Admin suspension | `POST /api/admin/users/:id/suspend` | `adminController.suspendUser` | `users`, `admin_action_logs`, `notifications` | status='suspended', suspended_until, suspension_reason |
| Admin unsuspend | `POST /api/admin/users/:id/unsuspend` | `adminController.unsuspendUser` | `users`, `admin_action_logs`, `notifications` | status='active', cleared dates |
| Admin ban | `POST /api/admin/users/:id/ban` | `adminController.banUser` | `users`, `admin_action_logs`, `notifications` | status='banned', ban_reason |
| Admin unban | `POST /api/admin/users/:id/unban` | `adminController.unbanUser` | `users`, `admin_action_logs`, `notifications` | status='active', ban_reason=NULL |
| Take report action | `POST /api/admin/reports/:id/action` | `adminController.takeReportAction` | `farmer_reports`, `users`, `admin_action_logs`, `notifications` | Report resolved; farmer status updated |
| Product request (farmer) | `POST /api/features/product-requests` | `featuresController.submitProductRequest` | `product_requests` | farmer_id, product_name, category, reason, status='pending' |
| Product request approval | `POST /api/features/admin/product-requests/:id/approve` | `featuresController.approveProductRequest` | `product_requests`, `approved_product_catalog`, `product_price_rules`, `notifications` | Status='approved'; product added to catalog |
| Product request rejection | `POST /api/features/admin/product-requests/:id/reject` | `featuresController.rejectProductRequest` | `product_requests`, `notifications` | Status='rejected' |
| Customer sends message | `POST /api/features/conversations/:id/messages` | `featuresController.sendMessage` | `messages`, `conversations`, `notifications` | message text, sender_role='customer', is_read=false |
| Farmer sends message | `POST /api/features/conversations/:id/messages` | `featuresController.sendMessage` | `messages`, `conversations`, `notifications` | message text, sender_role='farmer', is_read=false |
| Delivery assignment | `POST /api/delivery/orders/:orderId/assign` | `deliveryController.assignDelivery` | `delivery_assignments`, `order_status_history` | Person name, phone, vehicle, tracking_token (64-char hex) |
| Delivery start tracking | `POST /api/delivery/track/:token/start` | `deliveryController.startTracking` | `delivery_assignments` | tracking_active=1, delivery_started_at |
| GPS location update (HTTP) | `POST /api/delivery/track/:token/location` | `deliveryController.updateLocation` | `delivery_locations` | latitude, longitude, accuracy, speed, heading |
| GPS location update (Socket.IO) | `send_location` event | server.js socket handler | `delivery_locations` | Same GPS data, pushed to order room |
| Delivery status update | `POST /api/delivery/track/:token/status` | `deliveryController.updateDeliveryStatus` | `delivery_assignments`, `orders`, `order_status_history`, `notifications` | Delivery and order status updated |

---

## 6. Buying / Order Flow

```
Customer
  |
Browses products (GET /api/products)
  |
Add to Cart -> stored in browser localStorage (client/js/cart.js)
  |
Customer goes to checkout (customer-dashboard.html)
  |
Enters: shipping address + destination lat/lng + payment method
  |
POST /api/orders
  |
orderController.createOrder()
  |  DB transaction starts
  |  Validates each cart product (availability, stock)
  |  Enforces MINIMUM ORDER: Rs.600 total required
  |  Deducts quantity from products table
  |  Creates row in: orders (order_number = 'ORD-{timestamp}-{rand}')
  |  Creates rows in: order_items (one per product, with farmer_id)
  |  Creates row in: order_status_history (status='pending')
  |  Creates notification for farmer(s)
  |  Creates row in: activity_logs
  |  Commits transaction
  |
Farmer sees new order (GET /api/orders/farmer/orders)
  |
Farmer updates status: confirmed -> preparing -> ready
  PUT /api/orders/:id/status
  -> Records in order_status_history
  -> Sends notification to customer
  -> Socket.IO broadcasts to order room
  |
Order reaches 'ready' -> Farmer assigns delivery
  POST /api/delivery/orders/:orderId/assign
  -> Creates delivery_assignments row
  -> Generates unique 64-char tracking_token
  -> Returns tracking URL
  |
Delivery person opens tracking URL
  GET /api/delivery/track/:token
  |
Delivery person starts GPS
  POST /api/delivery/track/:token/start -> tracking_active=1
  |
GPS watchPosition() fires every few seconds (browser)
  POST /api/delivery/track/:token/location -> INSERT into delivery_locations
  OR Socket.IO send_location event -> INSERT into delivery_locations
  -> Broadcasts 'location_updated' to all in order room
  |
Customer sees live map (Leaflet.js) via Socket.IO or polling
  |
Delivery person marks as 'delivered'
  POST /api/delivery/track/:token/status { status: 'delivered' }
  -> delivery_assignments.status='delivered', tracking_active=0
  -> orders.status='delivered', payment_status='paid'
  -> Notification to customer
  |
Order complete
```

**Payment note:** There is **no separate payment table**. Payment method and status are stored in the `orders` table columns `payment_method` and `payment_status`. When marked `delivered`, `payment_status` is automatically set to `paid`.

---

## 7. Delivery Data Flow

**Delivery Assignment:**
- Stored in `delivery_assignments` table
- One assignment per order (`order_id` is UNIQUE)
- Fields: `delivery_person_name`, `delivery_person_phone`, `vehicle_type`, `vehicle_number`, `tracking_token` (64-hex), `tracking_active`, `status`

**Vehicle Number Validation (Indian plate format):**
- Regex pattern: `^([A-Z]{2})([0-9]{2})([A-Z]{1,3})([0-9]{1,4})$`
- Example valid format: `GJ03 MB001`
- Validated in `deliveryController.js -> normalizeVehicleNumber()`

**GPS Location Storage:**

| Field | Column | Table |
|---|---|---|
| Latitude | `latitude` DECIMAL(10,8) | `delivery_locations` |
| Longitude | `longitude` DECIMAL(11,8) | `delivery_locations` |
| Accuracy | `accuracy` FLOAT | `delivery_locations` |
| Speed | `speed` FLOAT | `delivery_locations` |
| Heading | `heading` FLOAT | `delivery_locations` |
| Timestamp | `recorded_at` TIMESTAMP | `delivery_locations` |

**Relationship:** `delivery_locations.delivery_assignment_id` -> `delivery_assignments.id`

**Two ways GPS data arrives:**
1. **HTTP REST:** `POST /api/delivery/track/:token/location` -> `deliveryController.updateLocation()`
2. **Socket.IO:** Client emits `send_location` event -> `server.js` socket handler writes to `delivery_locations` and broadcasts

**Broadcast:** After writing GPS, server emits `location_updated` event to Socket.IO room `order_{orderId}`. Customers and farmers in that room receive the live location.

**Destination coordinates:** Stored in `orders.destination_latitude` / `orders.destination_longitude` at order placement time.

---

## 8. Farmer Report Flow

```
Customer
  |
Reports a farmer (customer-dashboard.html)
  POST /api/admin/reports
  -> adminController.createFarmerReport()
  -> INSERT into farmer_reports: reporter_id, farmer_id, order_id, reason, description, status='pending'
  |
Admin views reports (admin-dashboard.html)
  GET /api/admin/reports
  -> adminController.getReports()
  |
Admin takes action (warn / suspend / ban / dismiss)
  POST /api/admin/reports/:id/action
  -> adminController.takeReportAction()
  |
  If 'warn':
    UPDATE users SET warning_count = warning_count + 1, last_warning = notes
    INSERT into admin_action_logs (action_type='warn')
    INSERT into notifications for farmer
  |
  If 'suspend':
    UPDATE users SET status='suspended', suspended_until = DATE_ADD(NOW(), INTERVAL days DAY), suspension_reason = notes
    INSERT into admin_action_logs (action_type='suspend')
    INSERT into notifications for farmer
  |
  If 'ban':
    UPDATE users SET status='banned', ban_reason = notes
    INSERT into admin_action_logs (action_type='ban')
    INSERT into notifications for farmer
  |
  If 'dismiss':
    No change to farmer's users row
    INSERT into admin_action_logs (action_type='dismiss_report')
  |
  In all cases:
    UPDATE farmer_reports SET status='resolved'/'dismissed', admin_action = action, admin_notes, action_taken_at = NOW(), action_taken_by = admin_id
    INSERT into notifications for reporter (customer)
```

**Moderation columns on `users` table:**

| Column | Purpose |
|---|---|
| `status` | ENUM: 'active', 'suspended', 'banned' |
| `warning_count` | Cumulative warning count |
| `last_warning` | Text of the last warning message |
| `last_warning_at` | Timestamp of last warning |
| `suspended_until` | DATETIME when suspension ends |
| `suspension_reason` | Text reason for suspension |
| `ban_reason` | Text reason for permanent ban |

**Auto-reinstatement:** If a suspended user logs in after `suspended_until` has passed, their status is automatically reset to `active` in the database.

---

## 9. Product Request Flow

```
Farmer wants to sell a product NOT in approved_product_catalog
  |
Farmer submits product request (farmer-dashboard.html)
  POST /api/features/product-requests
  -> featuresController.submitProductRequest()
  -> Validates: product not already in catalog; no existing pending request from this farmer
  -> INSERT into product_requests: farmer_id, product_name, category, reason, status='pending'
  |
Admin reviews request (admin-dashboard.html)
  GET /api/features/admin/product-requests
  |
Admin APPROVES:
  POST /api/features/admin/product-requests/:id/approve
  -> INSERT into approved_product_catalog (name, category, unit, description)
  -> If suggested prices provided -> INSERT into product_price_rules
  -> UPDATE product_requests SET status='approved', reviewed_by = admin_id, reviewed_at = NOW()
  -> INSERT into notifications for farmer
  |
Admin REJECTS:
  POST /api/features/admin/product-requests/:id/reject
  -> UPDATE product_requests SET status='rejected', reviewed_by = admin_id, reviewed_at = NOW()
  -> INSERT into notifications for farmer
```

**Farmer product creation blocking logic:**
- If farmer has a **pending** request for that name -> blocked (awaiting admin approval)
- If farmer has a **rejected** request -> blocked (request was rejected)
- If product name is NOT in `approved_product_catalog` at all -> blocked (not recognized)

---

## 10. Product Name Typo Normalization

**File:** `server/controllers/productController.js`  
**Function:** `normalizeProduceName(rawName)`  
**Helper:** `levenshteinDistance(s1, s2)`

**How it works:**

```
Farmer enters product name (e.g. "Aple")
      |
Step 1: Check PRODUCE_TYPO_MAP (hardcoded dictionary)
  'aple' -> 'Apple'
  'tomatto' -> 'Tomato'
  'potatto' -> 'Potato'
  'aloo' -> 'Potato'
  'alu' -> 'Potato'
  'palak' -> 'Spinach'
  'gobi' -> 'Cauliflower'
  'baingan' -> 'Brinjal (Eggplant)'
  'gajar' -> 'Carrot'
  (and more — 25 entries total)
      |
Step 2: If not in map -> fetch all active rows from approved_product_catalog
  -> Exact case-insensitive match
  -> Substring match (either name contains the other)
  -> Fuzzy match using Levenshtein distance:
      max allowed distance = 1 if catalog name <= 5 chars, else 2
      e.g. "Tomatto" -> dist=1 from "Tomato" -> accepted
      |
Step 3: If best match found -> return canonical name (e.g. "Apple")
      |
Step 4: If no match -> return cleaned input as-is
```

**Canonical name is used for:**
1. Looking up the price rule (`lookupPriceRule(canonicalName)`)
2. Checking if the name is in `approved_product_catalog`
3. Storing the canonical name in `products.name`

---

## 11. Product Price Rules

**Table:** `product_price_rules`  
**Key columns:** `product_name` (lowercase), `display_name`, `min_price`, `max_price`, `unit`

**Seeded examples (from migrate_features.js):**

| Product | Min Price | Max Price | Unit |
|---|---|---|---|
| Potato | Rs.15 | Rs.25 | kg |
| Tomato | Rs.20 | Rs.60 | kg |
| Onion | Rs.15 | Rs.40 | kg |
| Apple | Rs.80 | Rs.250 | kg |
| Mango | Rs.150 | Rs.600 | dozen |
| Rice | Rs.40 | Rs.120 | kg |
| Ghee | Rs.400 | Rs.900 | litre |
| Turmeric | Rs.80 | Rs.200 | kg |

**Validation flow:**
```
Farmer enters price
      |
productController -> lookupPriceRule(canonicalName)
      |
If rule found:
  price < min_price -> error
  price > max_price -> error
  price in range -> allowed
      |
If no rule found -> price accepted without restriction
```

This validation runs on both **createProduct** and **updateProduct**.

---

## 12. Customer <-> Farmer Messaging

**Tables:** `conversations`, `messages`

```
Customer opens product-detail.html
  |
Clicks "Message Farmer"
  |
GET /api/features/conversations/find?farmer_id=X&product_id=Y
  -> featuresController.getOrCreateConversation()
  -> If conversation exists: return it
  -> If not: INSERT into conversations (customer_id, farmer_id, product_id, subject)
  |
Load messages
  GET /api/features/conversations/:id/messages
  -> Returns all messages; marks incoming messages as is_read=TRUE
  |
Send message
  POST /api/features/conversations/:id/messages { message: "..." }
  -> INSERT into messages (conversation_id, sender_id, sender_role, message, is_read=FALSE)
  -> UPDATE conversations.updated_at
  -> INSERT into notifications for recipient
  -> Socket.IO emits 'new_message' to room 'conversation_{id}'
  |
Get unread count (for badge)
  GET /api/features/unread-count
  -> Counts messages where sender_id != me AND is_read=FALSE
```

---

## 13. Wishlist

**Table:** `wishlist`

- Customer adds product: `POST /api/users/wishlist/:productId` -> INSERT into wishlist
- Customer removes: `DELETE /api/users/wishlist/:productId` -> DELETE from wishlist
- Customer views: `GET /api/users/wishlist` -> SELECT with product details JOIN
- Unique constraint prevents duplicate wishlist entries (same customer + product)

---

## 14. Cart

**Cart is stored entirely in browser `localStorage`. There is no cart table in the database.**

**File:** `client/js/cart.js`

- `cart.load()` -> reads `localStorage.getItem('cart')` and parses JSON
- `cart.save()` -> writes `localStorage.setItem('cart', JSON.stringify(this.items))`
- `cart.addItem()` -> adds/updates item in memory, then calls `cart.save()`
- `cart.checkout()` -> sends cart items to `POST /api/orders` to create the order

**Minimum order amount:** Rs.600 — enforced server-side in `orderController.createOrder()`.

---

## 15. Admin Moderation

**Admin login:** `admin@freshfield.com` / `admin123` (seeded by `migrate_admin.js`)

| Action | What Changes | Tables |
|---|---|---|
| Warn | `users.warning_count +1`, `users.last_warning = text` | `users`, `admin_action_logs`, `notifications` |
| Suspend | `users.status='suspended'`, `users.suspended_until=date`, `users.suspension_reason=text` | `users`, `admin_action_logs`, `notifications` |
| Unsuspend | `users.status='active'`, cleared dates | `users`, `admin_action_logs`, `notifications` |
| Ban | `users.status='banned'`, `users.ban_reason=text` | `users`, `admin_action_logs`, `notifications` |
| Unban | `users.status='active'`, `users.ban_reason=NULL` | `users`, `admin_action_logs`, `notifications` |
| Dismiss report | Only report status changes | `farmer_reports`, `admin_action_logs` |

**Effect on login:** Banned users -> HTTP 403. Suspended users -> HTTP 403 with days remaining. Expired suspensions are auto-lifted on next login.

**Admin cannot be suspended or banned** (enforced in controller).

---

## 16. Authentication & Authorization

**Login:** `POST /api/auth/login`  
**Password hashing:** bcrypt, salt rounds = 10  
**JWT creation:** `jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' })`  
**JWT payload:** `{ id, email, role }` — no other data in the token  
**JWT secret:** loaded from `.env` as `JWT_SECRET`  
**JWT expiry:** 7 days

**Request authentication:** `server/middleware/auth.js -> authenticate()`
- Reads `Authorization: Bearer <token>` header
- Verifies JWT signature and expiry
- Fetches user from DB (includes moderation status check)
- Attaches `req.user`, `req.userId`, `req.userRole` to the request

**Role middlewares:**
- `authorizeFarmer` — blocks non-farmers (HTTP 403)
- `authorizeCustomer` — blocks non-customers (HTTP 403)
- `authorizeAdmin` — blocks non-admins (HTTP 403)

**Suspended account behavior:** Every authenticated API call re-checks account status from DB. Suspended users get HTTP 403 with remaining days. Expired suspensions are auto-reinstated in the DB.

**Banned account behavior:** Banned users get HTTP 403 with ban reason at both login and on every API call.

---

## 17. Farmer Kisan Card Verification

**File:** `server/utils/kisanVerification.js` -> `verifyKisanCard()`  
**OCR Library:** `tesseract.js` v7 (server-side, language: `eng`)  
**Trained data:** `server/eng.traineddata`  
**Upload middleware:** `server/middleware/kisanUpload.js` -> Multer (saves to `server/uploads/`)

**Verification steps:**
1. Check file buffer for embedded metadata markers (`FID:`, `KCC:` patterns in bytes)
2. Check filename for matching IDs
3. If image file (`.png`, `.jpg`, `.jpeg`, `.webp`): run Tesseract OCR (6-second timeout)
4. Search extracted text for entered `farmerId` and `kisanCardNumber` (normalized, case-insensitive)
5. If both found -> `verified: true`
6. If only one found -> `verified: false` with specific message
7. If conflicting IDs found -> `verified: false`
8. Default: `verified: false`

**Database storage:** `users.kisan_card_image` stores the filename only. File is served at `/uploads/<filename>`.

---

## 18. API Structure

| Route Prefix | Route File | Controller | Handles |
|---|---|---|---|
| `/api/auth` | `routes/authRoutes.js` | `authController.js` | Register, Login, Get current user, Kisan card verification |
| `/api/products` | `routes/productRoutes.js` | `productController.js` | CRUD products, farmer products, catalog, categories |
| `/api/orders` | `routes/orderRoutes.js` | `orderController.js` | Create order, customer orders, farmer orders, status, history, notifications |
| `/api/users` | `routes/userRoutes.js` | `userController.js` | Profile, wishlist, reviews |
| `/api/delivery` | `routes/deliveryRoutes.js` | `deliveryController.js` | Assign delivery, GPS tracking, live location |
| `/api/admin` | `routes/adminRoutes.js` | `adminController.js` | User management, reports, moderation, audit logs |
| `/api/features` | `routes/featuresRoutes.js` | `featuresController.js` | Messaging, price rules, product requests, approved catalog |
| `/api/health` | `server.js` (inline) | — | Server health check, Socket.IO client count |

---

## 19. Frontend File Map

| File | Purpose |
|---|---|
| `client/index.html` | Landing page / product browsing for all visitors |
| `client/login.html` | Registration + Login for customer, farmer, admin |
| `client/customer-dashboard.html` | Customer: orders, wishlist, messages, reports, notifications |
| `client/farmer-dashboard.html` | Farmer: product management, orders, delivery, messages, product requests |
| `client/admin-dashboard.html` | Admin: user management, reports, moderation, product requests |
| `client/product-detail.html` | Single product view, add to cart, message farmer, reviews |
| `client/delivery-tracking.html` | Live GPS tracking page for delivery person (accessed via tracking token) |
| `client/js/api.js` | Centralized API call wrapper (all fetch() calls go through here) |
| `client/js/auth.js` | Login/logout helpers, JWT storage in localStorage |
| `client/js/cart.js` | Shopping cart (localStorage-based), checkout logic |
| `client/js/customer.js` | All customer dashboard logic (orders, messages, wishlist, reports) |
| `client/js/farmer.js` | All farmer dashboard logic (products, orders, delivery, messages) |
| `client/js/features.js` | Shared features: messaging UI, product requests UI, price rules display |
| `client/js/main.js` | Shared page init logic |
| `client/js/toast.js` | Toast notification pop-up helper |
| `client/js/i18n.js` | Internationalization / multi-language support |
| `client/css/` | CSS stylesheets for each page |
| `client/assets/` | Static images and assets |

---

## 20. Important Data Flow Diagrams

### Product Creation
```
Farmer enters product name (e.g. "Aple")
      |
normalizeProduceName() -> PRODUCE_TYPO_MAP -> "Apple"
      |
Check product_requests: pending or rejected?
      |
Check approved_product_catalog: is "Apple" approved?
      |
lookupPriceRule("apple") -> product_price_rules table
      |
Validate price is within min_price / max_price
      |
INSERT INTO products (name="Apple")
```

### Messaging
```
Customer opens product-detail.html
  GET /api/features/conversations/find?farmer_id=X&product_id=Y
  Conversation found or created in conversations table
  GET /api/features/conversations/:id/messages
  POST /api/features/conversations/:id/messages { message }
  INSERT into messages; UPDATE conversations.updated_at
  INSERT into notifications for recipient
  Socket.IO emits 'new_message' to room 'conversation_{id}'
```

### Reports
```
Customer -> POST /api/admin/reports
INSERT into farmer_reports (status='pending')
Admin reviews -> POST /api/admin/reports/:id/action { action: warn/suspend/ban/dismiss }
UPDATE users (moderation columns)
INSERT into admin_action_logs
INSERT into notifications (for farmer + reporter)
UPDATE farmer_reports.status = 'resolved'/'dismissed'
```

### Product Requests
```
Farmer -> POST /api/features/product-requests
INSERT into product_requests (status='pending')
Admin reviews -> GET /api/features/admin/product-requests
Approve: INSERT into approved_product_catalog + product_price_rules
UPDATE product_requests.status = 'approved'
Notify farmer -> Farmer can now create that product
```

---

## 21. Database Relationship Overview

```
users
 +-- products            (farmer_id -> users.id)
 +-- orders              (customer_id -> users.id)
 +-- order_items         (farmer_id -> users.id)
 +-- conversations       (customer_id, farmer_id -> users.id)
 +-- messages            (sender_id -> users.id)
 +-- wishlist            (customer_id -> users.id)
 +-- reviews             (customer_id -> users.id)
 +-- farmer_reports      (reporter_id, farmer_id -> users.id)
 +-- admin_action_logs   (admin_id, target_user_id -> users.id)
 +-- product_requests    (farmer_id -> users.id)
 +-- approved_product_catalog (approved_by -> users.id)
 +-- notifications       (user_id -> users.id)
 +-- delivery_assignments (farmer_id -> users.id)
 +-- activity_logs       (user_id -> users.id)

products
 +-- order_items         (product_id -> products.id)
 +-- wishlist            (product_id -> products.id)
 +-- reviews             (product_id -> products.id)
 +-- conversations       (product_id -> products.id)

orders
 +-- order_items         (order_id -> orders.id)
 +-- order_status_history (order_id -> orders.id)
 +-- delivery_assignments (order_id -> orders.id, UNIQUE)
 +-- farmer_reports      (order_id -> orders.id)

delivery_assignments
 +-- delivery_locations  (delivery_assignment_id -> delivery_assignments.id)

conversations
 +-- messages            (conversation_id -> conversations.id)

product_requests
 +-- approved_product_catalog (request_id -> product_requests.id)

farmer_reports
 +-- admin_action_logs   (report_id -> farmer_reports.id)
```

---

## 22. Quick Developer Reference

| What to change | Where to look |
|---|---|
| **Database connection** | `server/config/database.js` + `server/.env` |
| **Customer registration** | `server/controllers/authController.js -> register()` |
| **Farmer registration + Kisan Card** | `server/controllers/authController.js -> register()` (farmer branch) |
| **Kisan Card OCR verification** | `server/utils/kisanVerification.js -> verifyKisanCard()` |
| **Login / JWT** | `server/controllers/authController.js -> login()` |
| **JWT middleware** | `server/middleware/auth.js -> authenticate()` |
| **Product creation** | `server/controllers/productController.js -> createProduct()` |
| **Product typo correction** | `server/controllers/productController.js -> normalizeProduceName()` + `PRODUCE_TYPO_MAP` |
| **Price rules** | `server/controllers/productController.js -> lookupPriceRule()`; Table: `product_price_rules` |
| **Approved product catalog** | Table: `approved_product_catalog`; Seeded in `server/migrate_features.js` |
| **Cart logic** | `client/js/cart.js` (localStorage only) |
| **Order creation** | `server/controllers/orderController.js -> createOrder()` |
| **Minimum order amount (Rs.600)** | `server/controllers/orderController.js`: `const MIN_ORDER_AMOUNT = 600` |
| **Order status updates** | `server/controllers/orderController.js -> updateOrderStatus()` |
| **Delivery assignment** | `server/controllers/deliveryController.js -> assignDelivery()` |
| **Vehicle plate validation** | `server/controllers/deliveryController.js -> normalizeVehicleNumber()` |
| **GPS location (HTTP)** | `server/controllers/deliveryController.js -> updateLocation()` |
| **GPS location (Socket.IO)** | `server/server.js -> socket.on('send_location')` |
| **Messaging** | `server/controllers/featuresController.js -> sendMessage()`, `getConversationMessages()` |
| **Unread message count** | `server/controllers/featuresController.js -> getUnreadCount()` |
| **Customer reports** | `server/controllers/adminController.js -> createFarmerReport()` |
| **Admin moderation actions** | `server/controllers/adminController.js -> warnUser()`, `suspendUser()`, `banUser()`, etc. |
| **Product requests** | `server/controllers/featuresController.js -> submitProductRequest()` |
| **Product request approval** | `server/controllers/featuresController.js -> approveProductRequest()` |
| **Notifications** | Inline `INSERT INTO notifications` across order, delivery, admin controllers |
| **File upload (product images)** | `server/middleware/upload.js` |
| **Kisan card file upload** | `server/middleware/kisanUpload.js` |
| **Socket.IO setup** | `server/server.js` (io initialization + socket event handlers) |
| **Route structure** | `server/server.js` (all `app.use('/api/...')` registrations) |
| **Admin dashboard UI** | `client/admin-dashboard.html` |
| **Customer dashboard UI** | `client/customer-dashboard.html` + `client/js/customer.js` |
| **Farmer dashboard UI** | `client/farmer-dashboard.html` + `client/js/farmer.js` |
| **Delivery tracking UI** | `client/delivery-tracking.html` |
| **API calls from frontend** | `client/js/api.js` |
| **Authentication state (frontend)** | `client/js/auth.js` |

---

> This summary is generated from the current FreshField source code and database implementation. If the application architecture changes, this file should be updated accordingly.
