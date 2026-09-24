# Data Dictionary - Farmer Marketplace Database

## Database Name: `farmer_marketplace`

---

### 1. users
Stores user accounts for both Farmers and Customers with their authentication details and profile information.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing unique user identifier |
| `name` | VARCHAR(100) | Full name of the user |
| `email` | VARCHAR(100) | Unique email address used for login and notifications |
| `password` | VARCHAR(255) | Hashed password string for account authentication |
| `role` | ENUM('farmer', 'customer') | Account role determining access permissions |
| `phone` | VARCHAR(20) | User contact phone number |
| `address` | TEXT | Physical address or home location |
| `profile_image` | VARCHAR(255) | URL or path to user's uploaded profile picture |
| `bio` | TEXT | Short biography or personal description |
| `farm_name` | VARCHAR(100) | Name of the farm (applicable for farmers) |
| `farm_location` | VARCHAR(255) | Geographical location or address of the farm |
| `created_at` | TIMESTAMP | Timestamp when the user account was created |
| `updated_at` | TIMESTAMP | Timestamp when the profile was last modified |

---

### 2. products
Stores agricultural products listed by farmers for sale in the marketplace.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing unique product identifier |
| `farmer_id` | INT | Foreign key referencing `users(id)` of the selling farmer |
| `name` | VARCHAR(100) | Name of the produce or product |
| `category` | VARCHAR(50) | Product category (e.g., Vegetables, Fruits, Grains) |
| `description` | TEXT | Detailed description of the product and freshness |
| `price` | DECIMAL(10, 2) | Price per unit in currency |
| `quantity` | INT | Available stock inventory quantity |
| `unit` | VARCHAR(20) | Unit of measurement (e.g., kg, bunch, box) |
| `image_url` | VARCHAR(255) | Image URL displaying the product photograph |
| `is_available` | BOOLEAN | Availability flag indicating if product can be ordered |
| `created_at` | TIMESTAMP | Timestamp when product was listed |
| `updated_at` | TIMESTAMP | Timestamp when product details were last updated |

---

### 3. orders
Contains customer order details, financial totals, delivery locations, and status stages.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing unique order identifier |
| `customer_id` | INT | Foreign key referencing `users(id)` of the buyer |
| `order_number` | VARCHAR(20) | Unique alphanumeric order tracking code |
| `total_amount` | DECIMAL(10, 2) | Total order monetary amount |
| `status` | ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'on_the_way', 'delivered', 'cancelled') | Current lifecycle status stage of the order |
| `shipping_address` | TEXT | Destination address for delivery |
| `destination_latitude` | DECIMAL(10, 8) | GPS latitude coordinate of customer delivery location |
| `destination_longitude` | DECIMAL(11, 8) | GPS longitude coordinate of customer delivery location |
| `payment_method` | VARCHAR(50) | Selected payment method (e.g., COD, Card, UPI) |
| `payment_status` | ENUM('pending', 'paid', 'completed', 'failed') | Current payment transaction state |
| `notes` | TEXT | Customer special instructions or delivery notes |
| `created_at` | TIMESTAMP | Timestamp when the order was placed |
| `updated_at` | TIMESTAMP | Timestamp when the order was last updated |

---

### 4. order_items
Stores individual product line items contained inside each placed order.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing unique item identifier |
| `order_id` | INT | Foreign key referencing `orders(id)` |
| `product_id` | INT | Foreign key referencing `products(id)` |
| `farmer_id` | INT | Foreign key referencing `users(id)` of fulfilling farmer |
| `quantity` | INT | Quantity of units purchased |
| `price` | DECIMAL(10, 2) | Unit price locked at the time of purchase |
| `total` | DECIMAL(10, 2) | Subtotal amount for this line item (quantity × price) |
| `created_at` | TIMESTAMP | Timestamp when the order item record was created |

---

### 5. order_status_history
Maintains an audit trail of chronological status transitions for each order.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing status history record ID |
| `order_id` | INT | Foreign key referencing `orders(id)` |
| `status` | VARCHAR(50) | Status stage name reached during this transition |
| `note` | TEXT | Optional note or explanation regarding status change |
| `updated_by` | INT | User ID who authorized or triggered this status change |
| `updated_by_role` | VARCHAR(20) | Role of the user who made the update (farmer/customer) |
| `created_at` | TIMESTAMP | Timestamp when the status change took place |

---

### 6. delivery_assignments
Manages the dispatch of delivery personnel and provides live tracking credentials for orders.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing assignment identifier |
| `order_id` | INT | Unique foreign key referencing `orders(id)` |
| `farmer_id` | INT | Foreign key referencing assigning farmer in `users(id)` |
| `delivery_person_name` | VARCHAR(100) | Full name of the assigned driver/delivery partner |
| `delivery_person_phone` | VARCHAR(20) | Contact phone number of the delivery person |
| `vehicle_type` | VARCHAR(50) | Delivery transport type (e.g., Bike, Scooter, Van, Truck) |
| `vehicle_number` | VARCHAR(50) | Vehicle registration or license plate number |
| `tracking_token` | VARCHAR(64) | Unique secure cryptographic token for live tracking URL |
| `tracking_active` | BOOLEAN | Boolean flag indicating if real-time GPS broadcasting is live |
| `status` | ENUM('assigned', 'picked_up', 'out_for_delivery', 'on_the_way', 'delivered') | Current fulfillment phase of delivery |
| `notes` | TEXT | Special delivery instructions or handover notes |
| `assigned_at` | TIMESTAMP | Timestamp when assignment was dispatched |
| `delivery_started_at` | TIMESTAMP | Timestamp when driver began the delivery journey |
| `delivery_completed_at` | TIMESTAMP | Timestamp when delivery was marked completed |
| `created_at` | TIMESTAMP | Timestamp when assignment entry was created |
| `updated_at` | TIMESTAMP | Timestamp when assignment was last updated |

---

### 7. delivery_locations
Records sequential GPS coordinate telemetry for real-time driver tracking.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing location telemetry log ID |
| `delivery_assignment_id` | INT | Foreign key referencing `delivery_assignments(id)` |
| `latitude` | DECIMAL(10, 8) | GPS latitude coordinate captured from driver device |
| `longitude` | DECIMAL(11, 8) | GPS longitude coordinate captured from driver device |
| `accuracy` | FLOAT | GPS reading accuracy radius in meters |
| `speed` | FLOAT | Current movement speed of driver |
| `heading` | FLOAT | Heading compass direction angle in degrees (0–360) |
| `recorded_at` | TIMESTAMP | Timestamp when GPS telemetry coordinate was logged |

---

### 8. activity_logs
Stores audit and system event activity records across users and platform entities.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing activity log identifier |
| `user_id` | INT | Foreign key referencing `users(id)` (NULL for system events) |
| `action` | VARCHAR(100) | Description of the action performed (e.g., update_status) |
| `entity_type` | VARCHAR(50) | Type of entity affected (e.g., order, product, user) |
| `entity_id` | INT | Identifier of the affected entity |
| `details` | TEXT | Descriptive notes or JSON payload with action details |
| `ip_address` | VARCHAR(50) | Client IP address of the initiating requester |
| `created_at` | TIMESTAMP | Timestamp when the action was recorded |

---

### 9. banners
Manages promotional and homepage hero banners shown to visitors.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing banner identifier |
| `title` | VARCHAR(255) | Headline title of the banner promotion |
| `subtitle` | TEXT | Supporting subtitle or promotional message copy |
| `image_url` | VARCHAR(255) | Web image URL for banner visual artwork |
| `link_url` | VARCHAR(255) | Click destination URL or internal page route |
| `is_active` | BOOLEAN | Flag to show or hide the banner on the frontend |
| `display_order` | INT | Numeric sorting sequence for carousel presentation |
| `created_at` | TIMESTAMP | Timestamp when banner was created |
| `updated_at` | TIMESTAMP | Timestamp when banner details were last updated |

---

### 10. notifications
Stores in-app messages and order alert notifications delivered to users.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing notification identifier |
| `user_id` | INT | Foreign key referencing recipient in `users(id)` |
| `title` | VARCHAR(255) | Notification headline or alert summary |
| `message` | TEXT | Full notification message body |
| `type` | VARCHAR(50) | Classification category (e.g., order, system, delivery) |
| `is_read` | BOOLEAN | Status flag indicating whether user marked as read |
| `created_at` | TIMESTAMP | Timestamp when notification was created and sent |

---

### 11. reviews
Stores customer feedback and ratings for agricultural products.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing review identifier |
| `product_id` | INT | Foreign key referencing reviewed product in `products(id)` |
| `customer_id` | INT | Foreign key referencing reviewing customer in `users(id)` |
| `rating` | INT | Rating score between 1 and 5 stars |
| `comment` | TEXT | Customer review text and feedback |
| `created_at` | TIMESTAMP | Timestamp when review was submitted |

---

### 12. wishlist
Contains saved favorite products earmarked by customers for future purchase.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary key, auto-incrementing wishlist item identifier |
| `customer_id` | INT | Foreign key referencing customer in `users(id)` |
| `product_id` | INT | Foreign key referencing bookmarked product in `products(id)` |
| `created_at` | TIMESTAMP | Timestamp when item was added to customer wishlist |
